import { Reservacion } from '@prisma/client';
import { ReservacionRepository } from '../repositories/reservacion.repository';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { ErrorNoEncontrado, ErrorValidacion } from '../utils/errores';

/**
 * Interfaz para estadísticas de un período
 */
interface EstadisticasHistorial {
  periodo: string;
  totalReservaciones: number;
  totalGasto: number;
  gastoPromedio: number;
  serviciosUnicos: number;
  trabajadoresUnicos: number;
}

/**
 * Interfaz para parámetros de filtro
 */
interface FiltrosHistorial {
  estado?: string;
  servicioId?: string;
  trabajadorId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  pagina?: number;
  limite?: number;
}

/**
 * HistorialService
 *
 * Proporciona funcionalidad avanzada para análisis de historial de reservaciones.
 * Estadísticas, filtros avanzados, y análisis por período.
 */
export class HistorialService {
  private reservacionRepository: ReservacionRepository;
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.reservacionRepository = new ReservacionRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  /**
   * Obtiene estadísticas del historial de un usuario para un período
   *
   * @param usuarioId - ID del usuario
   * @param opcionesEstadisticas - Opciones de filtro y período
   * @returns Objeto con estadísticas detalladas
   * @throws ErrorNoEncontrado si el usuario no existe
   * @throws ErrorValidacion si los parámetros son inválidos
   */
  async obtenerEstadisticasHistorial(
    usuarioId: string,
    opcionesEstadisticas: {
      fechaInicio?: Date;
      fechaFin?: Date;
      periodo?: 'mes' | 'trimestre' | 'año';
    } = {}
  ): Promise<EstadisticasHistorial> {
    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Determinar fechas si no se proporcionan
    let { fechaInicio, fechaFin } = opcionesEstadisticas;
    const ahora = new Date();

    if (!fechaFin) {
      fechaFin = ahora;
    }

    if (!fechaInicio) {
      // Por defecto: últimos 12 meses
      fechaInicio = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate());
    }

    // Validar que fechaInicio < fechaFin
    if (fechaInicio >= fechaFin) {
      throw new ErrorValidacion('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Obtener reservaciones completadas del usuario
    const reservaciones = await this.reservacionRepository.obtenerReservacionesPorEstado(
      usuarioId,
      'completed',
      1,
      1000
    );

    // Filtrar por rango de fechas
    const reservacionesFiltradas: Reservacion[] = Array.isArray(reservaciones)
      ? reservaciones.filter(
          (res: Reservacion) =>
            res.completadoEn && res.completadoEn >= fechaInicio && res.completadoEn <= fechaFin
        )
      : [];

    // Calcular estadísticas
    const totalReservaciones = reservacionesFiltradas.length;
    const totalGasto = reservacionesFiltradas.reduce(
      (suma: number, res: Reservacion) => suma + Number(res.precioFinal),
      0
    );
    const gastoPromedio = totalReservaciones > 0 ? totalGasto / totalReservaciones : 0;

    // Contar servicios únicos
    const serviciosUnicos = new Set(
      reservacionesFiltradas.map((res: Reservacion) => res.servicioId)
    ).size;

    // Contar trabajadores únicos
    const trabajadoresUnicos = new Set(
      reservacionesFiltradas
        .filter((res: Reservacion) => res.trabajadorId)
        .map((res: Reservacion) => res.trabajadorId)
    ).size;

    // Formatear período
    const periodo = `${fechaInicio.toLocaleDateString('es-CO')} - ${fechaFin.toLocaleDateString(
      'es-CO'
    )}`;

    return {
      periodo,
      totalReservaciones,
      totalGasto: Math.round(totalGasto * 100) / 100,
      gastoPromedio: Math.round(gastoPromedio * 100) / 100,
      serviciosUnicos,
      trabajadoresUnicos,
    };
  }

  /**
   * Obtiene estadísticas mensuales para los últimos N meses
   *
   * @param usuarioId - ID del usuario
   * @param meses - Número de meses a retornar (máximo 12)
   * @returns Array de estadísticas por mes
   * @throws ErrorNoEncontrado si el usuario no existe
   * @throws ErrorValidacion si meses es inválido
   */
  async obtenerEstadisticasMensuales(
    usuarioId: string,
    meses: number = 6
  ): Promise<EstadisticasHistorial[]> {
    // Validar meses
    if (meses < 1 || meses > 12 || !Number.isInteger(meses)) {
      throw new ErrorValidacion('Número de meses debe estar entre 1 y 12');
    }

    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    const estadisticas: EstadisticasHistorial[] = [];
    const ahora = new Date();

    // Generar estadísticas para cada mes
    for (let i = meses - 1; i >= 0; i--) {
      const fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 0);

      // Ajustar fechaFin al presente si es el mes actual
      if (i === 0) {
        fechaFin.setDate(ahora.getDate());
      }

      const stats = await this.obtenerEstadisticasHistorial(usuarioId, {
        fechaInicio,
        fechaFin,
      });

      estadisticas.push(stats);
    }

    return estadisticas;
  }

  /**
   * Obtiene estadísticas con filtros avanzados
   *
   * @param usuarioId - ID del usuario
   * @param filtros - Criterios de filtro
   * @returns Array de reservaciones que coinciden con los filtros
   * @throws ErrorNoEncontrado si el usuario no existe
   * @throws ErrorValidacion si los filtros son inválidos
   */
  async obtenerHistorialFiltrado(
    usuarioId: string,
    filtros: FiltrosHistorial = {}
  ): Promise<any> {
    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Validar paginación
    const pagina = filtros.pagina || 1;
    const limite = filtros.limite || 20;

    if (pagina < 1) {
      throw new ErrorValidacion('Número de página debe ser mayor a 0');
    }

    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('Límite debe estar entre 1 y 100');
    }

    // Obtener reservaciones completadas
    const reservaciones = await this.reservacionRepository.obtenerReservacionesPorEstado(
      usuarioId,
      'completed',
      pagina,
      limite
    );

    // Aplicar filtros adicionales
    let resultados: Reservacion[] = Array.isArray(reservaciones) ? reservaciones : [];

    if (filtros.servicioId) {
      resultados = resultados.filter((res: Reservacion) => res.servicioId === filtros.servicioId);
    }

    if (filtros.trabajadorId) {
      resultados = resultados.filter(
        (res: Reservacion) => res.trabajadorId === filtros.trabajadorId
      );
    }

    if (filtros.fechaInicio && filtros.fechaFin) {
      resultados = resultados.filter(
        (res: Reservacion) =>
          res.completadoEn &&
          res.completadoEn >= filtros.fechaInicio! &&
          res.completadoEn <= filtros.fechaFin!
      );
    }

    // Calcular total para paginación
    const totalReservaciones = resultados.length;
    const totalPages = Math.ceil(totalReservaciones / limite);

    return {
      reservaciones: resultados,
      meta: {
        paginaActual: pagina,
        totalPaginas: totalPages,
        totalResultados: totalReservaciones,
      },
    };
  }

  /**
   * Obtiene resumen general del historial
   *
   * @param usuarioId - ID del usuario
   * @returns Resumen con totales y conteos
   * @throws ErrorNoEncontrado si el usuario no existe
   */
  async obtenerResumenHistorial(
    usuarioId: string
  ): Promise<{
    totalReservacionesCompletadas: number;
    totalReservacionesCanceladas: number;
    gastoTotal: number;
    servicioFavorito: { servicioId: string; frecuencia: number } | null;
  }> {
    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Obtener todas las reservaciones completadas
    const completadas = await this.reservacionRepository.obtenerReservacionesPorEstado(
      usuarioId,
      'completed',
      1,
      1000
    );

    // Obtener todas las canceladas
    const canceladas = await this.reservacionRepository.obtenerReservacionesPorEstado(
      usuarioId,
      'cancelled',
      1,
      1000
    );

    const completadasArray: Reservacion[] = Array.isArray(completadas) ? completadas : [];
    const canceladasArray: Reservacion[] = Array.isArray(canceladas) ? canceladas : [];

    // Calcular gasto total
    const gastoTotal = completadasArray.reduce(
      (suma: number, res: Reservacion) => suma + Number(res.precioFinal),
      0
    );

    // Encontrar servicio favorito (más frecuente)
    const frecuenciaServicios = new Map<string, number>();
    completadasArray.forEach((res: Reservacion) => {
      const actual = frecuenciaServicios.get(res.servicioId) || 0;
      frecuenciaServicios.set(res.servicioId, actual + 1);
    });

    const servicioFavorito =
      frecuenciaServicios.size > 0
        ? Array.from(frecuenciaServicios.entries()).sort(
            (a: [string, number], b: [string, number]) => b[1] - a[1]
          )[0]
        : null;

    return {
      totalReservacionesCompletadas: completadasArray.length,
      totalReservacionesCanceladas: canceladasArray.length,
      gastoTotal: Math.round(gastoTotal * 100) / 100,
      servicioFavorito: servicioFavorito
        ? { servicioId: servicioFavorito[0], frecuencia: servicioFavorito[1] }
        : null,
    };
  }
}
