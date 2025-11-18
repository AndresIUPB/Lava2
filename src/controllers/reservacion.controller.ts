import { Request, Response, NextFunction } from 'express';
import { ReservacionService } from '../services/reservacion.service';
import { respuestaExito } from '../utils/respuestas';

export class ReservacionController {
  private reservacionService: ReservacionService;

  constructor() {
    this.reservacionService = new ReservacionService();
  }

  crearReservacion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const {
        servicioId,
        trabajadorId,
        fechaHoraInicio,
        direccionServicio,
        notasCliente,
      } = req.body;

      const reservacion = await this.reservacionService.crearReservacion({
        usuarioId,
        servicioId,
        trabajadorId,
        fechaHoraInicio: new Date(fechaHoraInicio),
        direccionServicio,
        notasCliente,
      });

      respuestaExito(res, { reservacion }, 'Reservación creada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  };

  obtenerReservaciones = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { estado, pagina = 1, limite = 20 } = req.query;

      const resultado = await this.reservacionService.obtenerReservacionesPorUsuario(
        usuarioId,
        {
          estado: estado as string,
          pagina: Number(pagina),
          limite: Number(limite),
        }
      );

      respuestaExito(
        res,
        {
          reservaciones: resultado.reservaciones,
          meta: {
            paginaActual: resultado.pagina,
            totalPaginas: resultado.paginas,
            totalResultados: resultado.total,
          },
        },
        'Reservaciones obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };

  obtenerReservacion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;

      const reservacion = await this.reservacionService.obtenerReservacionPorId(
        id,
        usuarioId
      );

      respuestaExito(res, { reservacion }, 'Reservación obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  };

  cancelarReservacion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;

      const reservacion = await this.reservacionService.cancelarReservacion(
        id,
        usuarioId
      );

      respuestaExito(res, { reservacion }, 'Reservación cancelada exitosamente');
    } catch (error) {
      next(error);
    }
  };

  obtenerReservacionesPendientesCalificacion = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = _req.usuario!.id;

      const reservaciones =
        await this.reservacionService.obtenerReservacionesPendientesCalificacion(
          usuarioId
        );

      respuestaExito(
        res,
        { reservaciones },
        'Reservaciones pendientes de calificación obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };

  obtenerHistorial = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { pagina = 1, limite = 20 } = req.query;

      const resultado = await this.reservacionService.obtenerHistorialReservaciones(
        usuarioId,
        Number(pagina),
        Number(limite)
      );

      respuestaExito(
        res,
        {
          reservaciones: resultado.reservaciones,
          meta: {
            paginaActual: resultado.pagina,
            totalPaginas: resultado.paginas,
            totalResultados: resultado.total,
          },
        },
        'Historial de reservaciones obtenido exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };

  obtenerEstadisticas = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = _req.usuario!.id;

      const totalCompletadas =
        await this.reservacionService.contarReservacionesCompletadas(usuarioId);

      respuestaExito(
        res,
        { estadisticas: { totalCompletadas } },
        'Estadísticas de reservaciones obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };
}
