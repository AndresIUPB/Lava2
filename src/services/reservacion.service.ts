import { ReservacionRepository } from '../repositories/reservacion.repository';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { ServicioRepository } from '../repositories/servicio.repository';
import { TrabajadorRepository } from '../repositories/trabajador.repository';
import { ErrorNoEncontrado, ErrorValidacion, ErrorNegocio } from '../utils/errores';
import { Reservacion } from '@prisma/client';

export interface CrearReservacionDtoService {
  usuarioId: string;
  servicioId: string;
  trabajadorId?: string;
  fechaHoraInicio: Date;
  direccionServicio: string;
  notasCliente?: string;
}

export interface ListarReservacionesDto {
  estado?: string;
  pagina?: number;
  limite?: number;
}

export class ReservacionService {
  private reservacionRepository: ReservacionRepository;
  private usuarioRepository: UsuarioRepository;
  private servicioRepository: ServicioRepository;
  private trabajadorRepository: TrabajadorRepository;

  constructor() {
    this.reservacionRepository = new ReservacionRepository();
    this.usuarioRepository = new UsuarioRepository();
    this.servicioRepository = new ServicioRepository();
    this.trabajadorRepository = new TrabajadorRepository();
  }

  async crearReservacion(datos: CrearReservacionDtoService): Promise<Reservacion> {
    // Validación 1: Usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(datos.usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Validación 2: Usuario NO tiene reservación activa
    const tieneReservacionActiva =
      await this.reservacionRepository.usuarioTieneReservacionActiva(datos.usuarioId);
    if (tieneReservacionActiva) {
      throw new ErrorNegocio(
        'Ya tienes una reservación activa. No puedes crear otra hasta que se complete o cancele la actual.'
      );
    }

    // Validación 3: Servicio existe y está activo
    const servicio = await this.servicioRepository.obtenerServicioPorId(datos.servicioId);
    if (!servicio || !servicio.activo) {
      throw new ErrorNoEncontrado('Servicio no encontrado o inactivo');
    }

    // Validación 4: Fecha inicio es futura
    const ahora = new Date();
    if (datos.fechaHoraInicio <= ahora) {
      throw new ErrorValidacion('La fecha y hora de inicio debe ser futura');
    }

    // Calcular fecha fin basado en duración del servicio
    const fechaFin = new Date(datos.fechaHoraInicio);
    fechaFin.setMinutes(fechaFin.getMinutes() + servicio.duracionMinutos);

    // Validación 5: Si se especificó trabajador, validar disponibilidad
    if (datos.trabajadorId) {
      const trabajador = await this.trabajadorRepository.obtenerTrabajadorPorId(
        datos.trabajadorId
      );

      if (!trabajador || !trabajador.activo) {
        throw new ErrorNoEncontrado('Trabajador no encontrado o inactivo');
      }

      // Nota: La verificación de disponibilidad se realizaría en TrabajadorService
      // Por ahora, asumimos que el trabajador está disponible si existe y está activo
      // En una implementación completa, se verificaría contra BloqueoHorario y horarioBase
    }

    // Crear reservación con estado "confirmed" (confirmación automática)
    const reservacion = await this.reservacionRepository.crearReservacion({
      usuarioId: datos.usuarioId,
      servicioId: datos.servicioId,
      trabajadorId: datos.trabajadorId,
      fechaHoraInicio: datos.fechaHoraInicio,
      fechaHoraFin: fechaFin,
      direccionServicio: datos.direccionServicio,
      precioFinal: servicio.precio.toNumber(),
      notasCliente: datos.notasCliente,
    });

    return reservacion;
  }

  async obtenerReservacionesPorUsuario(
    usuarioId: string,
    opciones: ListarReservacionesDto = {}
  ): Promise<{
    reservaciones: Reservacion[];
    total: number;
    pagina: number;
    paginas: number;
  }> {
    const { estado, pagina = 1, limite = 20 } = opciones;

    // Validaciones
    if (pagina < 1) {
      throw new ErrorValidacion('La página debe ser mayor o igual a 1');
    }

    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('El límite debe estar entre 1 y 100');
    }

    // Verificar usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    let resultado;
    if (estado) {
      this.validarEstado(estado);
      resultado = await this.reservacionRepository.obtenerReservacionesPorEstado(
        usuarioId,
        estado,
        pagina,
        limite
      );
    } else {
      resultado = await this.reservacionRepository.obtenerReservacionesPorUsuario(
        usuarioId,
        pagina,
        limite
      );
    }

    const paginas = Math.ceil(resultado.total / limite);

    return {
      reservaciones: resultado.datos,
      total: resultado.total,
      pagina,
      paginas,
    };
  }

  async obtenerReservacionPorId(id: string, usuarioId: string): Promise<Reservacion> {
    const reservacion = await this.reservacionRepository.obtenerReservacionPorId(id);

    if (!reservacion) {
      throw new ErrorNoEncontrado('Reservación no encontrada');
    }

    // Verificar que pertenece al usuario
    if (reservacion.usuarioId !== usuarioId) {
      throw new ErrorNegocio('No tienes permiso para ver esta reservación');
    }

    return reservacion;
  }

  async cancelarReservacion(id: string, usuarioId: string): Promise<Reservacion> {
    // Obtener reservación
    const reservacion = await this.reservacionRepository.obtenerReservacionPorId(id);

    if (!reservacion) {
      throw new ErrorNoEncontrado('Reservación no encontrada');
    }

    // Verificar que pertenece al usuario
    if (reservacion.usuarioId !== usuarioId) {
      throw new ErrorNegocio('No tienes permiso para cancelar esta reservación');
    }

    // Verificar que está en estado cancelable
    if (!['pending', 'confirmed'].includes(reservacion.estado)) {
      throw new ErrorNegocio(
        `No se puede cancelar una reservación en estado ${reservacion.estado}`
      );
    }

    // Validar que falta al menos 1 hora para el inicio
    const ahora = new Date();
    const diferenciaMs = reservacion.fechaHoraInicio.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    if (diferenciaHoras < 1) {
      throw new ErrorNegocio(
        'No se puede cancelar una reservación con menos de 1 hora de anticipación'
      );
    }

    // Cancelar reservación
    return await this.reservacionRepository.actualizarReservacion(id, {
      estado: 'cancelled',
      canceladoEn: new Date(),
      motivoCancelacion: 'Cancelada por usuario',
    });
  }

  async obtenerReservacionesPendientesCalificacion(
    usuarioId: string
  ): Promise<Reservacion[]> {
    // Verificar usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    return await this.reservacionRepository.obtenerReservacionesPendientesCalificacion(
      usuarioId
    );
  }

  async obtenerHistorialReservaciones(
    usuarioId: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{
    reservaciones: Reservacion[];
    total: number;
    pagina: number;
    paginas: number;
  }> {
    // Validaciones
    if (pagina < 1) {
      throw new ErrorValidacion('La página debe ser mayor o igual a 1');
    }

    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('El límite debe estar entre 1 y 100');
    }

    // Verificar usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    const resultado = await this.reservacionRepository.obtenerReservacionesPorEstado(
      usuarioId,
      'completed',
      pagina,
      limite
    );

    const paginas = Math.ceil(resultado.total / limite);

    return {
      reservaciones: resultado.datos,
      total: resultado.total,
      pagina,
      paginas,
    };
  }

  async contarReservacionesCompletadas(usuarioId: string): Promise<number> {
    // Verificar usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    return await this.reservacionRepository.contarReservacionesCompletadas(usuarioId);
  }

  // Métodos privados de validación

  private validarEstado(estado: string): void {
    const estadosValidos = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!estadosValidos.includes(estado)) {
      throw new ErrorValidacion(
        `Estado no válido. Estados permitidos: ${estadosValidos.join(', ')}`
      );
    }
  }
}
