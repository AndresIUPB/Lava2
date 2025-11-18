import { Request, Response, NextFunction } from 'express';
import { HistorialService } from '../services/historial.service';
import { respuestaExito } from '../utils/respuestas';

/**
 * HistorialController
 *
 * Maneja HTTP requests para estadísticas y análisis de historial de reservaciones.
 * Proporciona endpoints para obtener estadísticas, filtros avanzados y resúmenes.
 */
export class HistorialController {
  private historialService: HistorialService;

  constructor() {
    this.historialService = new HistorialService();
  }

  /**
   * Obtiene estadísticas generales del historial para un período
   * GET /api/historial/estadisticas
   */
  obtenerEstadisticas = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { fechaInicio, fechaFin, periodo } = req.query;

      const estadisticas = await this.historialService.obtenerEstadisticasHistorial(usuarioId, {
        fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
        periodo: (periodo as 'mes' | 'trimestre' | 'año') || undefined,
      });

      respuestaExito(res, estadisticas, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene estadísticas mensuales para los últimos N meses
   * GET /api/historial/estadisticas/mensuales
   */
  obtenerEstadisticasMensuales = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { meses } = req.query;

      const estadisticas = await this.historialService.obtenerEstadisticasMensuales(
        usuarioId,
        meses ? Number(meses) : 6
      );

      respuestaExito(res, estadisticas, 'Estadísticas mensuales obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene historial filtrado con criterios avanzados
   * GET /api/historial/filtrado
   */
  obtenerHistorialFiltrado = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { estado, servicioId, trabajadorId, fechaInicio, fechaFin, pagina, limite } =
        req.query;

      const resultado = await this.historialService.obtenerHistorialFiltrado(usuarioId, {
        estado: estado as string,
        servicioId: servicioId as string,
        trabajadorId: trabajadorId as string,
        fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
        pagina: pagina ? Number(pagina) : 1,
        limite: limite ? Number(limite) : 20,
      });

      respuestaExito(res, resultado, 'Historial filtrado obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene resumen general del historial (totales, favoritos)
   * GET /api/historial/resumen
   */
  obtenerResumen = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;

      const resumen = await this.historialService.obtenerResumenHistorial(usuarioId);

      respuestaExito(res, resumen, 'Resumen de historial obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  };
}
