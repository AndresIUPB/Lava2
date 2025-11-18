import { TrabajadorRepository } from '../repositories/trabajador.repository';
import { ReservacionRepository } from '../repositories/reservacion.repository';
import { CalificacionRepository } from '../repositories/calificacion.repository';
import { ErrorNoEncontrado } from '../utils/errores';

/**
 * Interface para estadísticas del trabajador
 */
export interface EstadisticasTrabajador {
  id: string;
  nombreCompleto: string;
  telefono: string;
  fotoPerfil: string | null;
  
  // Métricas
  totalReservaciones: number;
  totalReservacionesCompletadas: number;
  totalReservacionesCanceladas: number;
  tazaCompletacion: number; // porcentaje
  
  // Calificaciones
  calificacionPromedioServicio: number; // 1-5
  calificacionPromedioTrabajador: number; // 1-5
  totalCalificaciones: number;
  
  // Ganancias
  gananciaTotal: number; // suma de precioFinal de reservaciones completadas
  gananciaPromedioPorServicio: number;
  
  // Período (últimas estadísticas)
  periodoInicio: Date;
  periodoFin: Date;
}

/**
 * Interface para resumen histórico por mes
 */
export interface ResumenMensual {
  mes: number; // 1-12
  año: number;
  reservacionesCompletadas: number;
  ganancias: number;
  calificacionPromedio: number;
}

/**
 * TrabajadorStatsService
 *
 * Proporciona estadísticas y análisis del desempeño de trabajadores.
 * Calcula métricas de ganancia, calificación, y productividad.
 */
export class TrabajadorStatsService {
  private trabajadorRepo: TrabajadorRepository;
  private reservacionRepo: ReservacionRepository;
  private calificacionRepo: CalificacionRepository;

  constructor() {
    this.trabajadorRepo = new TrabajadorRepository();
    this.reservacionRepo = new ReservacionRepository();
    this.calificacionRepo = new CalificacionRepository();
  }

  /**
   * Obtiene estadísticas completas de un trabajador para un período específico
   */
  async obtenerEstadisticasTrabajador(
    trabajadorId: string,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<EstadisticasTrabajador> {
    // Validar que el trabajador existe
    const trabajador = await this.trabajadorRepo.obtenerTrabajadorPorId(trabajadorId);
    if (!trabajador) {
      throw new ErrorNoEncontrado('Trabajador no encontrado');
    }

    // Fechas por defecto: último mes
    const ahora = new Date();
    const fin = fechaFin || ahora;
    const inicio = fechaInicio || new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // Obtener reservaciones en el período
    const { datos: reservaciones } = await this.reservacionRepo.obtenerReservacionesPorTrabajador(
      trabajadorId,
      1,
      1000 // Obtener muchas para el período completo
    );

    // Filtrar por período
    const reservacionesFiltradas = reservaciones.filter(
      (r: any) => r.fechaHoraInicio >= inicio && r.fechaHoraInicio <= fin
    );

    // Calcular métricas básicas
    const completadas = reservacionesFiltradas.filter((r: any) => r.estado === 'completed');
    const canceladas = reservacionesFiltradas.filter((r: any) => r.estado === 'cancelled');

    const totalReservaciones = reservacionesFiltradas.length;
    const totalCompletadas = completadas.length;
    const totalCanceladas = canceladas.length;
    const tazaCompletacion = totalReservaciones > 0 ? (totalCompletadas / totalReservaciones) * 100 : 0;

    // Calcular ganancias
    const gananciaTotal = completadas.reduce((sum, r) => sum + Number(r.precioFinal), 0);
    const gananciaPromedioPorServicio = totalCompletadas > 0 ? gananciaTotal / totalCompletadas : 0;

    // Obtener calificaciones en el período
    const calificacionesData = await this.calificacionRepo.obtenerCalificacionesPorTrabajador(
      trabajadorId,
      1,
      1000
    );

    const calificacionesServicio = calificacionesData.calificaciones.map((c: any) => c.calificacionServicio);
    const calificacionesTrabajador = calificacionesData.calificaciones
      .filter((c: any) => c.calificacionTrabajador)
      .map((c: any) => c.calificacionTrabajador as number);

    const calificacionPromedioServicio =
      calificacionesServicio.length > 0
        ? calificacionesServicio.reduce((a: number, b: number) => a + b, 0) / calificacionesServicio.length
        : 0;

    const calificacionPromedioTrabajador =
      calificacionesTrabajador.length > 0
        ? calificacionesTrabajador.reduce((a: number, b: number) => a + b, 0) / calificacionesTrabajador.length
        : 0;

    return {
      id: trabajador.id,
      nombreCompleto: trabajador.nombreCompleto,
      telefono: trabajador.telefono,
      fotoPerfil: trabajador.fotoPerfil,
      totalReservaciones,
      totalReservacionesCompletadas: totalCompletadas,
      totalReservacionesCanceladas: totalCanceladas,
      tazaCompletacion: Math.round(tazaCompletacion * 100) / 100,
      calificacionPromedioServicio: Math.round(calificacionPromedioServicio * 100) / 100,
      calificacionPromedioTrabajador: Math.round(calificacionPromedioTrabajador * 100) / 100,
      totalCalificaciones: calificacionesData.calificaciones.length,
      gananciaTotal,
      gananciaPromedioPorServicio: Math.round(gananciaPromedioPorServicio * 100) / 100,
      periodoInicio: inicio,
      periodoFin: fin,
    };
  }

  /**
   * Obtiene estadísticas mensuales históricas para un trabajador
   */
  async obtenerEstadisticasMensuales(trabajadorId: string, meses: number = 12): Promise<ResumenMensual[]> {
    // Validar que el trabajador existe
    const trabajador = await this.trabajadorRepo.obtenerTrabajadorPorId(trabajadorId);
    if (!trabajador) {
      throw new ErrorNoEncontrado('Trabajador no encontrado');
    }

    // Validar número de meses (1-24)
    if (meses < 1 || meses > 24) {
      meses = 12;
    }

    // Obtener todas las reservaciones del trabajador
    const { datos: reservacionesData } = await this.reservacionRepo.obtenerReservacionesPorTrabajador(trabajadorId);

    // Obtener calificaciones
    const calificacionesData = await this.calificacionRepo.obtenerCalificacionesPorTrabajador(trabajadorId);

    // Crear mapa de meses-años
    const resumenMeses: Map<string, ResumenMensual> = new Map();

    // Procesar últimos N meses
    const ahora = new Date();
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

      resumenMeses.set(clave, {
        mes: fecha.getMonth() + 1,
        año: fecha.getFullYear(),
        reservacionesCompletadas: 0,
        ganancias: 0,
        calificacionPromedio: 0,
      });
    }

    // Procesar reservaciones completadas
    reservacionesData
      .filter((r: any) => r.estado === 'completed')
      .forEach((r: any) => {
        const fecha = new Date(r.fechaHoraInicio);
        const clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

        if (resumenMeses.has(clave)) {
          const resumen = resumenMeses.get(clave)!;
          resumen.reservacionesCompletadas += 1;
          resumen.ganancias += Number(r.precioFinal);
        }
      });

    // Procesar calificaciones
    calificacionesData.calificaciones.forEach((c: any) => {
      const fecha = new Date(c.creadoEn);
      const clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

      if (resumenMeses.has(clave)) {
        const resumen = resumenMeses.get(clave)!;
        // Acumular para después promediar
        if (!('calificacionesServicio' in resumen)) {
          (resumen as any).calificacionesServicio = [];
        }
        (resumen as any).calificacionesServicio.push(c.calificacionServicio);
      }
    });

    // Calcular promedios y limpiar datos temporales
    const resultado: ResumenMensual[] = Array.from(resumenMeses.values()).map((resumen) => {
      const califs = (resumen as any).calificacionesServicio || [];
      const promedio = califs.length > 0 ? califs.reduce((a: number, b: number) => a + b, 0) / califs.length : 0;

      return {
        mes: resumen.mes,
        año: resumen.año,
        reservacionesCompletadas: resumen.reservacionesCompletadas,
        ganancias: resumen.ganancias,
        calificacionPromedio: Math.round(promedio * 100) / 100,
      };
    });

    return resultado;
  }

  /**
   * Obtiene ranking de mejores trabajadores
   */
  async obtenerMejoresTrabajadores(limite: number = 10): Promise<EstadisticasTrabajador[]> {
    if (limite < 1 || limite > 100) {
      limite = 10;
    }

    // Obtener todos los trabajadores activos
    const { datos: trabajadores } = await this.trabajadorRepo.obtenerTodosTrabajadores();
    const activos = trabajadores.filter((t: any) => t.activo);

    // Calcular estadísticas para cada uno
    const estadisticas = await Promise.all(
      activos.map((t: any) =>
        this.obtenerEstadisticasTrabajador(t.id).catch(() => null)
      )
    );

    // Filtrar nulos y ordenar por calificación + completaciones
    const validos = estadisticas.filter((e: any) => e !== null) as EstadisticasTrabajador[];

    return validos
      .sort((a, b) => {
        // Priorizar calificación, luego tasa de completación
        if (b.calificacionPromedioServicio !== a.calificacionPromedioServicio) {
          return b.calificacionPromedioServicio - a.calificacionPromedioServicio;
        }
        return b.tazaCompletacion - a.tazaCompletacion;
      })
      .slice(0, limite);
  }
}
