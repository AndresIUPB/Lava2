import { Trabajador } from '@prisma/client';
import { TrabajadorRepository } from '../repositories/trabajador.repository';
import { BloqueoHorarioRepository } from '../repositories/bloqueoHorario.repository';
import { ErrorNoEncontrado, ErrorValidacion, ErrorNegocio } from '../utils/errores';

/**
 * Servicio de lógica de negocio para Trabajador.
 * Gestiona consultas, disponibilidad, calificaciones y operaciones CRUD.
 */
export class TrabajadorService {
  private trabajadorRepo: TrabajadorRepository;
  private bloqueoHorarioRepo: BloqueoHorarioRepository;

  constructor() {
    this.trabajadorRepo = new TrabajadorRepository();
    this.bloqueoHorarioRepo = new BloqueoHorarioRepository();
  }

  /**
   * Obtiene lista paginada de trabajadores activos.
   */
  async obtenerTrabajadores(
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ datos: Trabajador[]; total: number; paginas: number }> {
    if (pagina < 1) {
      throw new ErrorValidacion('La página debe ser mayor a 0');
    }
    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('El límite debe estar entre 1 y 100');
    }

    const { datos, total } = await this.trabajadorRepo.obtenerTodosTrabajadores(
      pagina,
      limite
    );

    return {
      datos,
      total,
      paginas: Math.ceil(total / limite),
    };
  }

  /**
   * Obtiene un trabajador por ID.
   * Lanza ErrorNoEncontrado si no existe o está inactivo.
   */
  async obtenerTrabajadorPorId(id: string): Promise<Trabajador> {
    const trabajador = await this.trabajadorRepo.obtenerTrabajadorPorId(id);

    if (!trabajador) {
      throw new ErrorNoEncontrado('Trabajador no encontrado');
    }

    if (!trabajador.activo) {
      throw new ErrorNoEncontrado('El trabajador está inactivo');
    }

    return trabajador;
  }

  /**
   * Busca trabajadores por nombre.
   */
  async buscarTrabajadores(
    termino: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ datos: Trabajador[]; total: number; paginas: number }> {
    if (!termino || termino.length < 2) {
      throw new ErrorValidacion('El término de búsqueda debe tener al menos 2 caracteres');
    }

    if (termino.length > 100) {
      throw new ErrorValidacion('El término de búsqueda no puede exceder 100 caracteres');
    }

    if (pagina < 1) {
      throw new ErrorValidacion('La página debe ser mayor a 0');
    }

    const { datos, total } = await this.trabajadorRepo.buscarTrabajadoresPorNombre(
      termino,
      pagina,
      limite
    );

    return {
      datos,
      total,
      paginas: Math.ceil(total / limite),
    };
  }

  /**
   * Obtiene lista de trabajadores activos sin paginación.
   */
  async obtenerTrabajadoresDisponibles(): Promise<Trabajador[]> {
    return await this.trabajadorRepo.obtenerTrabajadoresActivos();
  }

  /**
   * Obtiene cantidad de trabajadores activos.
   */
  async obtenerCantidadTrabajadores(): Promise<number> {
    return await this.trabajadorRepo.contarTrabajadoresActivos();
  }

  /**
   * Verifica si un trabajador existe y está activo.
   */
  async trabajadorExisteYEstaActivo(id: string): Promise<boolean> {
    const trabajador = await this.trabajadorRepo.obtenerTrabajadorSinValidar(id);
    return trabajador !== null && trabajador.activo;
  }

  /**
   * Obtiene un trabajador sin validación (incluyendo inactivos).
   * Uso interno para validaciones.
   */
  async obtenerTrabajadorSinValidar(id: string): Promise<Trabajador | null> {
    return await this.trabajadorRepo.obtenerTrabajadorSinValidar(id);
  }

  /**
   * Valida si un trabajador está disponible en un rango de fechas.
   *
   * Verifica:
   * 1. Que el trabajador existe y está activo
   * 2. Que no hay bloqueos de horario en el rango
   * 3. Que el horario cae dentro del horario base configurado
   *
   * @param trabajadorId - ID del trabajador
   * @param fechaInicio - Fecha y hora de inicio (ISO string o Date)
   * @param duracionMinutos - Duración del servicio en minutos
   * @returns true si está disponible, false en caso contrario
   */
  async verificarDisponibilidad(
    trabajadorId: string,
    fechaInicio: Date,
    duracionMinutos: number
  ): Promise<boolean> {
    // Validar que el trabajador existe y está activo
    const trabajador = await this.trabajadorRepo.obtenerTrabajadorSinValidar(
      trabajadorId
    );

    if (!trabajador || !trabajador.activo) {
      return false;
    }

    // Calcular fecha fin
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMinutes(fechaFin.getMinutes() + duracionMinutos);

    // Validar que no hay bloqueos en el rango
    const tieneBloqueoDentro = await this.bloqueoHorarioRepo.verificarBloqueoDentroDelRango(
      trabajadorId,
      fechaInicio,
      fechaFin
    );

    if (tieneBloqueoDentro) {
      return false;
    }

    // Validar que cae dentro del horario base
    const estaEnHorarioBase = this.validarHorarioBase(trabajador, fechaInicio, fechaFin);

    return estaEnHorarioBase;
  }

  /**
   * Valida si un rango de fechas cae dentro del horario base del trabajador.
   *
   * El horario base es el horario de trabajo estándar del trabajador por día de la semana.
   * Formato: { inicio: "08:00", fin: "18:00" } o null si no trabaja ese día.
   *
   * @private
   */
  private validarHorarioBase(
    trabajador: Trabajador,
    fechaInicio: Date,
    fechaFin: Date
  ): boolean {
    const diasSemana = [
      'horarioDomingo',
      'horarioLunes',
      'horarioMartes',
      'horarioMiercoles',
      'horarioJueves',
      'horarioViernes',
      'horarioSabado',
    ];

    const diaSemana = fechaInicio.getDay(); // 0 = domingo, 1 = lunes, etc.
    const claveHorario = diasSemana[diaSemana];
    const horarioDia = (trabajador as any)[claveHorario] as any;

    // Si no hay horario configurado para ese día, no está disponible
    if (!horarioDia || horarioDia === null) {
      return false;
    }

    // Extraer horas de inicio y fin del horario base
    const [horaInicio, minutoInicio] = horarioDia.inicio.split(':').map(Number);
    const [horaFin, minutoFin] = horarioDia.fin.split(':').map(Number);

    // Crear objetos Date para comparar
    const horaInicioBase = new Date(fechaInicio);
    horaInicioBase.setHours(horaInicio, minutoInicio, 0, 0);

    const horaFinBase = new Date(fechaFin);
    horaFinBase.setHours(horaFin, minutoFin, 0, 0);

    // Validar que el rango solicitado cae completamente dentro del horario base
    return fechaInicio >= horaInicioBase && fechaFin <= horaFinBase;
  }

  /**
   * Obtiene trabajadores con calificación promedio >= a la mínima especificada.
   */
  async obtenerTrabajadoresConCalificacionMinima(
    minCalificacion: number
  ): Promise<Trabajador[]> {
    if (minCalificacion < 1 || minCalificacion > 5) {
      throw new ErrorValidacion('La calificación mínima debe estar entre 1 y 5');
    }

    return await this.trabajadorRepo.obtenerTrabajadoresConCalificacionMinima(
      minCalificacion
    );
  }

  /**
   * Actualiza la calificación promedio de un trabajador.
   * Debe calcularse desde las calificaciones en BD.
   * (Esta operación será hecha por el servicio de Calificación tras crear una calificación)
   */
  async actualizarCalificacionPromedio(_trabajadorId: string): Promise<void> {
    // Nota: Esta lógica será implementada cuando se desarrolle el servicio de Calificación
    // Por ahora es un placeholder.
    // Se llamaría desde CalificacionService tras agregar una calificación.
  }

  /**
   * Crea un nuevo trabajador (admin only, no implementado aún).
   */
  async crearTrabajador(_datos: any): Promise<Trabajador> {
    throw new ErrorNegocio('Operación no permitida desde la API pública');
  }

  /**
   * Actualiza un trabajador (admin only, no implementado aún).
   */
  async actualizarTrabajador(_id: string, _datos: any): Promise<Trabajador> {
    throw new ErrorNegocio('Operación no permitida desde la API pública');
  }

  /**
   * Desactiva un trabajador (admin only, no implementado aún).
   */
  async desactivarTrabajador(_id: string): Promise<Trabajador> {
    throw new ErrorNegocio('Operación no permitida desde la API pública');
  }
}
