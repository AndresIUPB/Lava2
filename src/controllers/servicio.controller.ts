/**
 * Controller de Servicio
 * Maneja las solicitudes HTTP para operaciones con servicios de lavado
 *
 * Endpoints:
 * - GET /api/servicios - Obtiene catálogo paginado
 * - GET /api/servicios/:id - Obtiene detalles de un servicio
 * - GET /api/servicios/buscar/:termino - Busca servicios
 */

import { Request, Response, NextFunction } from 'express';
import { ServicioService } from '../services/servicio.service';
import { respuestaExito } from '../utils/respuestas';

export class ServicioController {
  private servicioService: ServicioService;

  constructor() {
    this.servicioService = new ServicioService();
  }

  /**
   * Obtiene el catálogo completo de servicios (paginado)
   *
   * Query parameters:
   * - pagina (opcional): número de página (default: 1)
   * - limite (opcional): registros por página (default: 20, máximo: 100)
   *
   * @returns 200 OK con array de servicios y metadata
   */
  obtenerCatalogo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pagina = 1, limite = 20 } = req.query;

      // Convertir a números
      const numeroPagina = Math.max(1, Number(pagina) || 1);
      const numeroLimite = Math.min(100, Math.max(1, Number(limite) || 20));

      const catalogo = await this.servicioService.obtenerCatalogo(numeroPagina, numeroLimite);

      respuestaExito(res, catalogo, 'Catálogo de servicios obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene los detalles de un servicio específico
   *
   * Parámetros de ruta:
   * - id: ID del servicio
   *
   * @returns 200 OK con detalles del servicio
   * @throws 404 si el servicio no existe
   * @throws 400 si el servicio no está activo
   */
  obtenerServicioPorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const servicio = await this.servicioService.obtenerServicioPorId(id);

      respuestaExito(res, servicio, 'Detalles del servicio obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca servicios por nombre
   *
   * Parámetros de ruta:
   * - termino: término de búsqueda (mínimo 2 caracteres, máximo 50)
   *
   * @returns 200 OK con array de servicios que coinciden
   * @throws 400 si el término es inválido
   */
  buscarServicios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { termino } = req.params;

      const servicios = await this.servicioService.buscarServicios(termino);

      respuestaExito(res, { servicios, cantidad: servicios.length }, 'Búsqueda de servicios completada');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene todos los servicios disponibles (sin paginación)
   * Útil para listados simples en dropdowns
   *
   * @returns 200 OK con array de servicios
   */
  obtenerServiciosDisponibles = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const servicios = await this.servicioService.obtenerServiciosDisponibles();

      respuestaExito(res, { servicios, cantidad: servicios.length }, 'Servicios disponibles obtenidos');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene la cantidad de servicios disponibles
   *
   * @returns 200 OK con el número de servicios
   */
  obtenerCantidadServicios = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cantidad = await this.servicioService.obtenerCantidadServicios();

      respuestaExito(res, { cantidad }, 'Cantidad de servicios obtenida');
    } catch (error) {
      next(error);
    }
  };
}
