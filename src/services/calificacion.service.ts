import { Calificacion } from '@prisma/client';
import { CalificacionRepository } from '../repositories/calificacion.repository';
import { ReservacionRepository } from '../repositories/reservacion.repository';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { TrabajadorRepository } from '../repositories/trabajador.repository';
import { ErrorNoEncontrado, ErrorNegocio, ErrorValidacion } from '../utils/errores';

export interface CrearCalificacionDto {
  usuarioId: string;
  reservacionId: string;
  calificacionServicio: number;
  calificacionTrabajador?: number;
  comentarioServicio?: string;
  comentarioTrabajador?: string;
}

export class CalificacionService {
  private calificacionRepo: CalificacionRepository;
  private reservacionRepo: ReservacionRepository;
  private usuarioRepo: UsuarioRepository;
  private trabajadorRepo: TrabajadorRepository;

  constructor() {
    this.calificacionRepo = new CalificacionRepository();
    this.reservacionRepo = new ReservacionRepository();
    this.usuarioRepo = new UsuarioRepository();
    this.trabajadorRepo = new TrabajadorRepository();
  }

  /**
   * Crea una calificación para una reservación completada
   *
   * Validaciones:
   * - Reservación debe existir y estar completada
   * - Usuario debe existir y ser propietario de la reservación
   * - No puede haber calificación previa para esa reservación
   * - calificacionServicio es obligatoria (1-5)
   * - calificacionTrabajador es opcional (1-5)
   */
  async crearCalificacion(datos: CrearCalificacionDto): Promise<Calificacion> {
    // Validar usuario existe
    const usuario = await this.usuarioRepo.obtenerUsuarioPorId(datos.usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Validar reservación existe
    const reservacion = await this.reservacionRepo.obtenerReservacionSinValidar(
      datos.reservacionId
    );
    if (!reservacion) {
      throw new ErrorNoEncontrado('Reservación no encontrada');
    }

    // Validar que reservación pertenece al usuario
    if (reservacion.usuarioId !== datos.usuarioId) {
      throw new ErrorNegocio(
        'No puedes calificar una reservación que no te pertenece'
      );
    }

    // Validar que reservación está completada
    if (reservacion.estado !== 'completed') {
      throw new ErrorNegocio(
        'Solo puedes calificar reservaciones completadas'
      );
    }

    // Validar que no existe calificación previa
    const tieneCalificacion = await this.calificacionRepo.tieneCalificacion(
      datos.reservacionId
    );
    if (tieneCalificacion) {
      throw new ErrorNegocio('Esta reservación ya ha sido calificada');
    }

    // Validar rangos de calificación
    if (
      datos.calificacionServicio < 1 ||
      datos.calificacionServicio > 5 ||
      !Number.isInteger(datos.calificacionServicio)
    ) {
      throw new ErrorValidacion(
        'La calificación del servicio debe ser un número entero entre 1 y 5'
      );
    }

    if (
      datos.calificacionTrabajador !== undefined &&
      (datos.calificacionTrabajador < 1 ||
        datos.calificacionTrabajador > 5 ||
        !Number.isInteger(datos.calificacionTrabajador))
    ) {
      throw new ErrorValidacion(
        'La calificación del trabajador debe ser un número entero entre 1 y 5'
      );
    }

    // Validar longitudes de comentarios
    if (
      datos.comentarioServicio &&
      datos.comentarioServicio.length > 1000
    ) {
      throw new ErrorValidacion(
        'El comentario del servicio no puede exceder 1000 caracteres'
      );
    }

    if (
      datos.comentarioTrabajador &&
      datos.comentarioTrabajador.length > 1000
    ) {
      throw new ErrorValidacion(
        'El comentario del trabajador no puede exceder 1000 caracteres'
      );
    }

    // Crear calificación
    const calificacion = await this.calificacionRepo.crearCalificacion({
      usuarioId: datos.usuarioId,
      reservacionId: datos.reservacionId,
      trabajadorId: reservacion.trabajadorId || undefined,
      calificacionServicio: datos.calificacionServicio,
      calificacionTrabajador: datos.calificacionTrabajador,
      comentarioServicio: datos.comentarioServicio,
      comentarioTrabajador: datos.comentarioTrabajador,
    });

    // Actualizar promedio del trabajador si existe
    if (reservacion.trabajadorId && datos.calificacionTrabajador) {
      await this.actualizarPromedioTrabajador(reservacion.trabajadorId);
    }

    return calificacion;
  }

  /**
   * Obtiene una calificación por ID
   */
  async obtenerCalificacionPorId(
    id: string,
    usuarioId: string
  ): Promise<Calificacion> {
    const calificacion = await this.calificacionRepo.obtenerCalificacionPorId(
      id
    );

    if (!calificacion) {
      throw new ErrorNoEncontrado('Calificación no encontrada');
    }

    // Validar que pertenece al usuario
    if (calificacion.usuarioId !== usuarioId) {
      throw new ErrorNegocio(
        'No puedes ver calificaciones de otros usuarios'
      );
    }

    return calificacion;
  }

  /**
   * Obtiene calificaciones dadas por un usuario
   */
  async obtenerCalificacionesUsuario(
    usuarioId: string,
    opciones: { pagina?: number; limite?: number } = {}
  ): Promise<{
    calificaciones: Calificacion[];
    meta: { paginaActual: number; totalPaginas: number; totalResultados: number };
  }> {
    // Validar usuario existe
    const usuario = await this.usuarioRepo.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    const pagina = opciones.pagina ?? 1;
    const limite = opciones.limite ?? 20;

    // Validar paginación
    if (pagina < 1) {
      throw new ErrorValidacion('La página debe ser mayor a 0');
    }
    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('El límite debe estar entre 1 y 100');
    }

    const { calificaciones, total } =
      await this.calificacionRepo.obtenerCalificacionesPorUsuario(
        usuarioId,
        pagina,
        limite
      );

    const totalPaginas = Math.ceil(total / limite);

    return {
      calificaciones,
      meta: {
        paginaActual: pagina,
        totalPaginas,
        totalResultados: total,
      },
    };
  }

  /**
   * Obtiene calificaciones recibidas por un trabajador
   */
  async obtenerCalificacionesTrabajador(
    trabajadorId: string,
    opciones: { pagina?: number; limite?: number } = {}
  ): Promise<{
    calificaciones: Calificacion[];
    meta: { paginaActual: number; totalPaginas: number; totalResultados: number; promedioTrabajador: number };
  }> {
    // Validar trabajador existe
    const trabajador = await this.trabajadorRepo.obtenerTrabajadorPorId(
      trabajadorId
    );
    if (!trabajador) {
      throw new ErrorNoEncontrado('Trabajador no encontrado');
    }

    const pagina = opciones.pagina ?? 1;
    const limite = opciones.limite ?? 20;

    // Validar paginación
    if (pagina < 1) {
      throw new ErrorValidacion('La página debe ser mayor a 0');
    }
    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('El límite debe estar entre 1 y 100');
    }

    const { calificaciones, total } =
      await this.calificacionRepo.obtenerCalificacionesPorTrabajador(
        trabajadorId,
        pagina,
        limite
      );

    const { promedio } = await this.calificacionRepo.calcularPromedioTrabajador(
      trabajadorId
    );

    const totalPaginas = Math.ceil(total / limite);

    return {
      calificaciones,
      meta: {
        paginaActual: pagina,
        totalPaginas,
        totalResultados: total,
        promedioTrabajador: promedio,
      },
    };
  }

  /**
   * Actualiza una calificación existente
   */
  async actualizarCalificacion(
    id: string,
    usuarioId: string,
    datos: Partial<CrearCalificacionDto>
  ): Promise<Calificacion> {
    // Obtener calificación actual
    const calificacion = await this.obtenerCalificacionPorId(id, usuarioId);

    // Validar nuevos rangos si se actualizar calificaciones
    if (
      datos.calificacionServicio !== undefined &&
      (datos.calificacionServicio < 1 ||
        datos.calificacionServicio > 5 ||
        !Number.isInteger(datos.calificacionServicio))
    ) {
      throw new ErrorValidacion(
        'La calificación del servicio debe ser un número entero entre 1 y 5'
      );
    }

    if (
      datos.calificacionTrabajador !== undefined &&
      (datos.calificacionTrabajador < 1 ||
        datos.calificacionTrabajador > 5 ||
        !Number.isInteger(datos.calificacionTrabajador))
    ) {
      throw new ErrorValidacion(
        'La calificación del trabajador debe ser un número entero entre 1 y 5'
      );
    }

    const actualizada = await this.calificacionRepo.actualizarCalificacion(
      id,
      datos
    );

    // Actualizar promedio del trabajador si cambió calificación del trabajador
    if (datos.calificacionTrabajador && calificacion.trabajadorId) {
      await this.actualizarPromedioTrabajador(calificacion.trabajadorId);
    }

    return actualizada;
  }

  /**
   * Actualiza el promedio de calificación de un trabajador en la tabla
   */
  private async actualizarPromedioTrabajador(
    trabajadorId: string
  ): Promise<void> {
    const { promedio } = await this.calificacionRepo.calcularPromedioTrabajador(
      trabajadorId
    );

    await this.trabajadorRepo.actualizarTrabajador(trabajadorId, {
      calificacionPromedio: promedio,
    });
  }

  /**
   * Obtiene estadísticas de calificación para un servicio
   */
  async obtenerEstadisticasServicio(servicioId: string): Promise<{
    promedioServicio: number;
    totalCalificaciones: number;
    distribucion: { [key: number]: number };
  }> {
    // Validación básica sin requerir ServicioRepository para evitar circular dependency
    // En una versión futura se podría agregar validación de servicio
    return await this.calificacionRepo.obtenerEstadisticasServicio(servicioId);
  }
}
