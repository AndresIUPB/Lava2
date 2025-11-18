import { Request, Response, NextFunction } from 'express';
import { TrabajadorStatsService } from '../services/trabajadorStats.service';
import { respuestaExito } from '../utils/respuestas';

export class TrabajadorStatsController {
  private statsService: TrabajadorStatsService;

  constructor() {
    this.statsService = new TrabajadorStatsService();
  }

  /**
   * GET /api/trabajadores/:id/estadisticas
   * Obtiene estadísticas completas de un trabajador
   */
  obtenerEstadisticas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      const inicio = fechaInicio ? new Date(String(fechaInicio)) : undefined;
      const fin = fechaFin ? new Date(String(fechaFin)) : undefined;

      const estadisticas = await this.statsService.obtenerEstadisticasTrabajador(id, inicio, fin);

      respuestaExito(res, estadisticas, 'Estadísticas del trabajador obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/trabajadores/:id/estadisticas/mensuales
   * Obtiene estadísticas mensuales históricas
   */
  obtenerEstadisticasMensuales = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { meses = 12 } = req.query;

      const estadisticas = await this.statsService.obtenerEstadisticasMensuales(
        id,
        Number(meses)
      );

      respuestaExito(res, estadisticas, 'Estadísticas mensuales obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/trabajadores/ranking/mejores
   * Obtiene los mejores trabajadores según calificación y productividad
   */
  obtenerMejoresTrabajadores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { limite = 10 } = req.query;

      const trabajadores = await this.statsService.obtenerMejoresTrabajadores(Number(limite));

      respuestaExito(res, trabajadores, 'Mejores trabajadores obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  };
}
