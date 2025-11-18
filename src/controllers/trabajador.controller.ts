import { Request, Response, NextFunction } from 'express';
import { TrabajadorService } from '../services/trabajador.service';
import { respuestaExito } from '../utils/respuestas';

/**
 * Controlador HTTP para Trabajador.
 * Maneja las peticiones HTTP y las transforma entre formatos web y de negocio.
 */
export class TrabajadorController {
  private trabajadorService: TrabajadorService;

  constructor() {
    this.trabajadorService = new TrabajadorService();
  }

  /**
   * GET /api/trabajadores
   * Obtiene lista paginada de trabajadores activos.
   */
  obtenerTrabajadores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pagina = parseInt(req.query.pagina as string) || 1;
      const limite = parseInt(req.query.limite as string) || 20;

      const { datos, total, paginas } = await this.trabajadorService.obtenerTrabajadores(
        pagina,
        limite
      );

      respuestaExito(res, {
        trabajadores: datos,
        meta: {
          paginaActual: pagina,
          totalPaginas: paginas,
          totalResultados: total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/trabajadores/:id
   * Obtiene un trabajador específico por ID.
   */
  obtenerTrabajadorPorId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const trabajador = await this.trabajadorService.obtenerTrabajadorPorId(id);

      respuestaExito(res, { trabajador });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/trabajadores/buscar/:termino
   * Busca trabajadores por nombre o término.
   */
  buscarTrabajadores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { termino } = req.params;
      const pagina = parseInt(req.query.pagina as string) || 1;
      const limite = parseInt(req.query.limite as string) || 20;

      const { datos, total, paginas } = await this.trabajadorService.buscarTrabajadores(
        termino,
        pagina,
        limite
      );

      respuestaExito(res, {
        trabajadores: datos,
        meta: {
          paginaActual: pagina,
          totalPaginas: paginas,
          totalResultados: total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/trabajadores/disponibles/lista
   * Obtiene lista de trabajadores disponibles sin paginación.
   */
  obtenerTrabajadoresDisponibles = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trabajadores = await this.trabajadorService.obtenerTrabajadoresDisponibles();

      respuestaExito(res, { trabajadores });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/trabajadores/cantidad
   * Obtiene la cantidad total de trabajadores activos.
   */
  obtenerCantidadTrabajadores = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cantidad = await this.trabajadorService.obtenerCantidadTrabajadores();

      respuestaExito(res, { cantidad });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/trabajadores/calificacion/:minima
   * Obtiene trabajadores con calificación promedio >= minima.
   */
  obtenerTrabajadoresConCalificacionMinima = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const minCalificacion = parseFloat(req.params.minima);

      const trabajadores =
        await this.trabajadorService.obtenerTrabajadoresConCalificacionMinima(
          minCalificacion
        );

      respuestaExito(res, { trabajadores });
    } catch (error) {
      next(error);
    }
  };
}
