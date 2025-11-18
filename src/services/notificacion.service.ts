import { NotificacionRepository } from '../repositories/notificacion.repository';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { ErrorNoEncontrado, ErrorValidacion, ErrorNegocio } from '../utils/errores';

/**
 * NotificacionService
 *
 * Implementa lógica de negocio para notificaciones.
 * Gestiona creación, lectura, filtrado y eliminación de notificaciones.
 */
export class NotificacionService {
  private notificacionRepository: NotificacionRepository;
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.notificacionRepository = new NotificacionRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  /**
   * Obtiene notificaciones del usuario con paginación
   *
   * @param usuarioId - ID del usuario
   * @param opciones - Opciones de paginación y filtrado
   * @returns Notificaciones paginadas con metadata
   * @throws ErrorNoEncontrado si el usuario no existe
   * @throws ErrorValidacion si los parámetros son inválidos
   */
  async obtenerNotificacionesUsuario(
    usuarioId: string,
    opciones: {
      pagina?: number;
      limite?: number;
      leida?: boolean;
    } = {}
  ): Promise<any> {
    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Validar paginación
    const pagina = opciones.pagina || 1;
    const limite = opciones.limite || 20;

    if (pagina < 1) {
      throw new ErrorValidacion('Número de página debe ser mayor a 0');
    }

    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('Límite debe estar entre 1 y 100');
    }

    return await this.notificacionRepository.obtenerNotificacionesUsuario(usuarioId, {
      pagina,
      limite,
      leida: opciones.leida,
    });
  }

  /**
   * Obtiene notificaciones no leídas del usuario
   *
   * @param usuarioId - ID del usuario
   * @returns Array de notificaciones no leídas
   * @throws ErrorNoEncontrado si el usuario no existe
   */
  async obtenerNoLeidas(usuarioId: string): Promise<any> {
    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    const notificaciones = await this.notificacionRepository.obtenerNotificacionesNoLeidas(
      usuarioId
    );
    const total = await this.notificacionRepository.contarNoLeidas(usuarioId);

    return {
      notificaciones,
      total,
    };
  }

  /**
   * Marca una notificación como leída
   *
   * @param id - ID de la notificación
   * @param usuarioId - ID del usuario (para validación de ownership)
   * @returns Notificación actualizada
   * @throws ErrorNoEncontrado si la notificación no existe
   * @throws ErrorNegocio si la notificación no pertenece al usuario
   */
  async marcarComoLeida(id: string, usuarioId: string): Promise<any> {
    // Validar que la notificación existe y pertenece al usuario
    const notificacion = await this.notificacionRepository.obtenerNotificacionPorId(id);
    if (!notificacion) {
      throw new ErrorNoEncontrado('Notificación no encontrada');
    }

    if (notificacion.usuarioId !== usuarioId) {
      throw new ErrorNegocio('No tienes permiso para modificar esta notificación');
    }

    return await this.notificacionRepository.marcarComoLeida(id);
  }

  /**
   * Marca todas las notificaciones del usuario como leídas
   *
   * @param usuarioId - ID del usuario
   * @returns Resultado con cantidad actualizada
   * @throws ErrorNoEncontrado si el usuario no existe
   */
  async marcarTodasComoLeidas(usuarioId: string): Promise<any> {
    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    return await this.notificacionRepository.marcarTodoComoLeido(usuarioId);
  }

  /**
   * Obtiene notificaciones filtradas por tipo
   *
   * @param usuarioId - ID del usuario
   * @param tipo - Tipo de notificación
   * @param opciones - Opciones de paginación
   * @returns Notificaciones filtradas
   * @throws ErrorNoEncontrado si el usuario no existe
   * @throws ErrorValidacion si el tipo es inválido
   */
  async obtenerPorTipo(
    usuarioId: string,
    tipo: string,
    opciones: {
      pagina?: number;
      limite?: number;
    } = {}
  ): Promise<any> {
    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Validar tipo
    const tiposValidos = ['reservacion', 'calificacion', 'promocion', 'sistema'];
    if (!tiposValidos.includes(tipo)) {
      throw new ErrorValidacion(
        `Tipo de notificación debe ser uno de: ${tiposValidos.join(', ')}`
      );
    }

    // Validar paginación
    const pagina = opciones.pagina || 1;
    const limite = opciones.limite || 20;

    if (pagina < 1) {
      throw new ErrorValidacion('Número de página debe ser mayor a 0');
    }

    if (limite < 1 || limite > 100) {
      throw new ErrorValidacion('Límite debe estar entre 1 y 100');
    }

    return await this.notificacionRepository.obtenerPorTipo(usuarioId, tipo, {
      pagina,
      limite,
    });
  }

  /**
   * Elimina una notificación específica
   *
   * @param id - ID de la notificación
   * @param usuarioId - ID del usuario (para validación de ownership)
   * @throws ErrorNoEncontrado si la notificación no existe
   * @throws ErrorNegocio si la notificación no pertenece al usuario
   */
  async eliminarNotificacion(id: string, usuarioId: string): Promise<void> {
    // Validar que la notificación existe y pertenece al usuario
    const notificacion = await this.notificacionRepository.obtenerNotificacionPorId(id);
    if (!notificacion) {
      throw new ErrorNoEncontrado('Notificación no encontrada');
    }

    if (notificacion.usuarioId !== usuarioId) {
      throw new ErrorNegocio('No tienes permiso para eliminar esta notificación');
    }

    await this.notificacionRepository.eliminarNotificacion(id);
  }

  /**
   * Elimina todas las notificaciones leídas del usuario
   *
   * @param usuarioId - ID del usuario
   * @returns Resultado con cantidad eliminada
   * @throws ErrorNoEncontrado si el usuario no existe
   */
  async eliminarLeidasUsuario(usuarioId: string): Promise<any> {
    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    return await this.notificacionRepository.eliminarLeidasUsuario(usuarioId);
  }

  /**
   * Obtiene contador de notificaciones no leídas
   *
   * @param usuarioId - ID del usuario
   * @returns Número de notificaciones no leídas
   * @throws ErrorNoEncontrado si el usuario no existe
   */
  async contarNoLeidas(usuarioId: string): Promise<number> {
    // Validar usuario
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    return await this.notificacionRepository.contarNoLeidas(usuarioId);
  }
}
