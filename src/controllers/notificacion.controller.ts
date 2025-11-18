import { Request, Response, NextFunction } from 'express';
import { NotificacionService } from '../services/notificacion.service';
import { respuestaExito } from '../utils/respuestas';

/**
 * NotificacionController
 *
 * Maneja HTTP requests para notificaciones del usuario.
 * CRUD, filtrado, marcado como leído, eliminación.
 */
export class NotificacionController {
  private notificacionService: NotificacionService;

  constructor() {
    this.notificacionService = new NotificacionService();
  }

  /**
   * Obtiene notificaciones del usuario con paginación
   * GET /api/notificaciones
   */
  obtenerNotificaciones = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { pagina, limite, leida } = req.query;

      const resultado = await this.notificacionService.obtenerNotificacionesUsuario(usuarioId, {
        pagina: pagina ? Number(pagina) : 1,
        limite: limite ? Number(limite) : 20,
        leida: leida ? leida === 'true' : undefined,
      });

      respuestaExito(res, resultado, 'Notificaciones obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene notificaciones no leídas
   * GET /api/notificaciones/no-leidas
   */
  obtenerNoLeidas = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;

      const resultado = await this.notificacionService.obtenerNoLeidas(usuarioId);

      respuestaExito(res, resultado, 'Notificaciones no leídas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene contador de notificaciones no leídas
   * GET /api/notificaciones/no-leidas/contar
   */
  contarNoLeidas = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;

      const total = await this.notificacionService.contarNoLeidas(usuarioId);

      respuestaExito(res, { total }, 'Contador de no leídas obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marca una notificación como leída
   * PUT /api/notificaciones/:id/leida
   */
  marcarComoLeida = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;

      const notificacion = await this.notificacionService.marcarComoLeida(id, usuarioId);

      respuestaExito(res, notificacion, 'Notificación marcada como leída');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marca todas las notificaciones como leídas
   * PUT /api/notificaciones/marcar-todos-leido
   */
  marcarTodasComoLeidas = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;

      const resultado = await this.notificacionService.marcarTodasComoLeidas(usuarioId);

      respuestaExito(res, resultado, 'Todas las notificaciones marcadas como leídas');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene notificaciones filtradas por tipo
   * GET /api/notificaciones/tipo/:tipo
   */
  obtenerPorTipo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { tipo } = req.params;
      const { pagina, limite } = req.query;

      const resultado = await this.notificacionService.obtenerPorTipo(usuarioId, tipo, {
        pagina: pagina ? Number(pagina) : 1,
        limite: limite ? Number(limite) : 20,
      });

      respuestaExito(res, resultado, 'Notificaciones filtradas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Elimina una notificación específica
   * DELETE /api/notificaciones/:id
   */
  eliminarNotificacion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;

      await this.notificacionService.eliminarNotificacion(id, usuarioId);

      respuestaExito(res, { id }, 'Notificación eliminada exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Elimina todas las notificaciones leídas
   * DELETE /api/notificaciones/leidas/limpiar
   */
  eliminarLeidasUsuario = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;

      const resultado = await this.notificacionService.eliminarLeidasUsuario(usuarioId);

      respuestaExito(res, resultado, 'Notificaciones leídas eliminadas exitosamente');
    } catch (error) {
      next(error);
    }
  };
}
