import { Request, Response, NextFunction } from 'express';
import { CalificacionService } from '../services/calificacion.service';
import { respuestaExito } from '../utils/respuestas';

export class CalificacionController {
  private calificacionService: CalificacionService;

  constructor() {
    this.calificacionService = new CalificacionService();
  }

  /**
   * POST /api/calificaciones
   * Crear una nueva calificación para una reservación completada
   */
  crearCalificacion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const {
        reservacionId,
        calificacionServicio,
        calificacionTrabajador,
        comentarioServicio,
        comentarioTrabajador,
      } = req.body;

      const calificacion = await this.calificacionService.crearCalificacion({
        usuarioId,
        reservacionId,
        calificacionServicio,
        calificacionTrabajador,
        comentarioServicio,
        comentarioTrabajador,
      });

      respuestaExito(
        res,
        calificacion,
        'Calificación registrada exitosamente',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/calificaciones/:id
   * Obtener una calificación específica
   */
  obtenerCalificacion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;

      const calificacion = await this.calificacionService.obtenerCalificacionPorId(
        id,
        usuarioId
      );

      respuestaExito(
        res,
        calificacion,
        'Calificación obtenida exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/calificaciones
   * Obtener calificaciones dadas por el usuario autenticado
   */
  obtenerCalificacionesUsuario = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { pagina = 1, limite = 20 } = req.query;

      const resultado = await this.calificacionService.obtenerCalificacionesUsuario(
        usuarioId,
        {
          pagina: Number(pagina),
          limite: Number(limite),
        }
      );

      respuestaExito(
        res,
        resultado,
        'Calificaciones obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/calificaciones/trabajador/:trabajadorId
   * Obtener calificaciones recibidas por un trabajador
   */
  obtenerCalificacionesTrabajador = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { trabajadorId } = req.params;
      const { pagina = 1, limite = 20 } = req.query;

      const resultado = await this.calificacionService.obtenerCalificacionesTrabajador(
        trabajadorId,
        {
          pagina: Number(pagina),
          limite: Number(limite),
        }
      );

      respuestaExito(
        res,
        resultado,
        'Calificaciones del trabajador obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/calificaciones/:id
   * Actualizar una calificación existente
   */
  actualizarCalificacion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;
      const {
        calificacionServicio,
        calificacionTrabajador,
        comentarioServicio,
        comentarioTrabajador,
      } = req.body;

      const calificacion = await this.calificacionService.actualizarCalificacion(
        id,
        usuarioId,
        {
          calificacionServicio,
          calificacionTrabajador,
          comentarioServicio,
          comentarioTrabajador,
        }
      );

      respuestaExito(
        res,
        calificacion,
        'Calificación actualizada exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/calificaciones/estadisticas/servicio/:servicioId
   * Obtener estadísticas de calificación para un servicio
   */
  obtenerEstadisticasServicio = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { servicioId } = req.params;

      const estadisticas = await this.calificacionService.obtenerEstadisticasServicio(
        servicioId
      );

      respuestaExito(
        res,
        estadisticas,
        'Estadísticas de calificación obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };
}
