/**
 * Service de Servicio
 * Implementa la lógica de negocio para operaciones con servicios de lavado
 *
 * Métodos:
 * - obtenerCatalogo() - Obtiene el catálogo de servicios disponibles
 * - obtenerServicioPorId() - Obtiene detalles de un servicio
 * - buscarServicios() - Busca servicios por criterios
 * - obtenerServiciosDisponibles() - Obtiene servicios activos para clientes
 */

import { Servicio } from '@prisma/client';
import { ServicioRepository, CrearServicioDto, ActualizarServicioDto } from '../repositories/servicio.repository';
import { ErrorNoEncontrado, ErrorNegocio, ErrorValidacion } from '../utils/errores';

/**
 * Respuesta de catálogo de servicios
 */
export interface RespuestaCatalogo {
  servicios: Servicio[];
  total: number;
  paginas: number;
  paginaActual: number;
}

export class ServicioService {
  private servicioRepository: ServicioRepository;

  constructor() {
    this.servicioRepository = new ServicioRepository();
  }

  /**
   * Obtiene el catálogo completo de servicios disponibles
   *
   * @param pagina - Número de página (default: 1)
   * @param limite - Cantidad de registros por página (default: 20)
   * @returns Respuesta con servicios paginados
   * @throws {ErrorValidacion} Si los parámetros son inválidos
   */
  async obtenerCatalogo(pagina: number = 1, limite: number = 20): Promise<RespuestaCatalogo> {
    // Validar parámetros
    if (pagina < 1) {
      throw new ErrorValidacion('El número de página debe ser mayor a 0');
    }

    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('El límite debe estar entre 1 y 100');
    }

    const { servicios, total, paginas } = await this.servicioRepository.obtenerServiciosConPaginacion(
      pagina,
      limite
    );

    return {
      servicios,
      total,
      paginas,
      paginaActual: pagina,
    };
  }

  /**
   * Obtiene los detalles de un servicio específico
   *
   * @param servicioId - ID del servicio
   * @returns Servicio encontrado
   * @throws {ErrorNoEncontrado} Si el servicio no existe
   * @throws {ErrorNegocio} Si el servicio no está activo
   */
  async obtenerServicioPorId(servicioId: string): Promise<Servicio> {
    // Validar que el ID no esté vacío
    if (!servicioId || servicioId.trim() === '') {
      throw new ErrorValidacion('El ID del servicio es obligatorio');
    }

    // Obtener servicio
    const servicio = await this.servicioRepository.obtenerServicioPorId(servicioId);

    // Verificar que existe
    if (!servicio) {
      throw new ErrorNoEncontrado('El servicio solicitado no existe');
    }

    // Verificar que está activo
    if (!servicio.activo) {
      throw new ErrorNegocio('El servicio no está disponible en este momento');
    }

    return servicio;
  }

  /**
   * Busca servicios por nombre
   *
   * @param termino - Término de búsqueda
   * @returns Array de servicios que coinciden
   * @throws {ErrorValidacion} Si el término es inválido
   */
  async buscarServicios(termino: string): Promise<Servicio[]> {
    // Validar término de búsqueda
    if (!termino || termino.trim() === '') {
      throw new ErrorValidacion('El término de búsqueda no puede estar vacío');
    }

    if (termino.length < 2) {
      throw new ErrorValidacion('El término de búsqueda debe tener al menos 2 caracteres');
    }

    if (termino.length > 50) {
      throw new ErrorValidacion('El término de búsqueda no puede exceder 50 caracteres');
    }

    return await this.servicioRepository.buscarServiciosPorNombre(termino, true);
  }

  /**
   * Obtiene todos los servicios disponibles (sin paginación)
   * Útil para listados simples en la app
   *
   * @returns Array de servicios activos
   */
  async obtenerServiciosDisponibles(): Promise<Servicio[]> {
    return await this.servicioRepository.obtenerTodosLosServicios({
      activos: true,
    });
  }

  /**
   * Obtiene la cantidad de servicios disponibles
   *
   * @returns Número de servicios activos
   */
  async obtenerCantidadServicios(): Promise<number> {
    return await this.servicioRepository.contarServiciosActivos();
  }

  /**
   * Valida que un servicio existe y está activo
   * Útil para validaciones de negocio
   *
   * @param servicioId - ID del servicio a validar
   * @returns true si el servicio existe y está activo
   */
  async servicioExisteYEstaActivo(servicioId: string): Promise<boolean> {
    try {
      const servicio = await this.servicioRepository.obtenerServicioPorId(servicioId);
      return servicio !== null && servicio.activo;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene un servicio sin validar que esté activo
   * Uso interno para administración
   *
   * @param servicioId - ID del servicio
   * @returns Servicio o null
   */
  async obtenerServicioSinValidar(servicioId: string): Promise<Servicio | null> {
    if (!servicioId || servicioId.trim() === '') {
      return null;
    }

    return await this.servicioRepository.obtenerServicioPorId(servicioId);
  }

  /**
   * Crea un nuevo servicio (método administrativo)
   *
   * @param datos - Datos del servicio
   * @returns Servicio creado
   * @throws {ErrorValidacion} Si los datos son inválidos
   */
  async crearServicio(datos: CrearServicioDto): Promise<Servicio> {
    // Validar datos
    if (!datos.nombre || datos.nombre.trim() === '') {
      throw new ErrorValidacion('El nombre del servicio es obligatorio');
    }

    if (datos.nombre.length < 3 || datos.nombre.length > 100) {
      throw new ErrorValidacion('El nombre debe tener entre 3 y 100 caracteres');
    }

    if (!datos.descripcion || datos.descripcion.trim() === '') {
      throw new ErrorValidacion('La descripción del servicio es obligatoria');
    }

    if (datos.precio <= 0) {
      throw new ErrorValidacion('El precio debe ser mayor a 0');
    }

    if (datos.duracionMinutos < 15) {
      throw new ErrorValidacion('La duración mínima debe ser de 15 minutos');
    }

    return await this.servicioRepository.crearServicio(datos);
  }

  /**
   * Actualiza un servicio existente (método administrativo)
   *
   * @param servicioId - ID del servicio
   * @param datos - Datos a actualizar
   * @returns Servicio actualizado
   * @throws {ErrorNoEncontrado} Si el servicio no existe
   * @throws {ErrorValidacion} Si los datos son inválidos
   */
  async actualizarServicio(servicioId: string, datos: ActualizarServicioDto): Promise<Servicio> {
    // Verificar que el servicio existe
    const servicio = await this.servicioRepository.obtenerServicioPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('El servicio no existe');
    }

    // Validar datos si se proporcionan
    if (datos.nombre !== undefined) {
      if (datos.nombre.trim() === '') {
        throw new ErrorValidacion('El nombre no puede estar vacío');
      }
      if (datos.nombre.length < 3 || datos.nombre.length > 100) {
        throw new ErrorValidacion('El nombre debe tener entre 3 y 100 caracteres');
      }
    }

    if (datos.precio !== undefined && datos.precio <= 0) {
      throw new ErrorValidacion('El precio debe ser mayor a 0');
    }

    if (datos.duracionMinutos !== undefined && datos.duracionMinutos < 15) {
      throw new ErrorValidacion('La duración mínima debe ser de 15 minutos');
    }

    return await this.servicioRepository.actualizarServicio(servicioId, datos);
  }

  /**
   * Desactiva un servicio (no lo elimina)
   *
   * @param servicioId - ID del servicio
   * @returns Servicio desactivado
   * @throws {ErrorNoEncontrado} Si el servicio no existe
   */
  async desactivarServicio(servicioId: string): Promise<Servicio> {
    const servicio = await this.servicioRepository.obtenerServicioPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('El servicio no existe');
    }

    return await this.servicioRepository.desactivarServicio(servicioId);
  }
}
