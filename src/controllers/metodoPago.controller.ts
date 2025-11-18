import { Request, Response, NextFunction } from 'express';
import { MetodoPagoService } from '../services/metodoPago.service';
import { respuestaExito } from '../utils/respuestas';

export class MetodoPagoController {
  private metodoPagoService: MetodoPagoService;

  constructor() {
    this.metodoPagoService = new MetodoPagoService();
  }

  obtenerMetodosPago = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = _req.usuario!.id;

      const metodosPago = await this.metodoPagoService.obtenerMetodosPagoPorUsuario(usuarioId);

      respuestaExito(res, { metodosPago }, 'Métodos de pago obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  };

  obtenerMetodoPago = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;

      const metodoPago = await this.metodoPagoService.obtenerMetodoPagoPorId(id, usuarioId);

      respuestaExito(res, { metodoPago }, 'Método de pago obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  };

  crearMetodoPago = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { tipo, ultimos4Digitos, nombreTitular, fechaExpiracion, marca } = req.body;

      const nuevoMetodoPago = await this.metodoPagoService.crearMetodoPago({
        usuarioId,
        tipo,
        ultimos4Digitos,
        nombreTitular,
        fechaExpiracion,
        marca,
      });

      respuestaExito(
        res,
        { metodoPago: nuevoMetodoPago },
        'Método de pago creado exitosamente',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  marcarComoPrincipal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;

      const metodoPago = await this.metodoPagoService.marcarComoPrincipal(id, usuarioId);

      respuestaExito(
        res,
        { metodoPago },
        'Método de pago marcado como principal exitosamente'
      );
    } catch (error) {
      next(error);
    }
  };

  desactivarMetodoPago = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.id;
      const { id } = req.params;

      const metodoPago = await this.metodoPagoService.desactivarMetodoPago(id, usuarioId);

      respuestaExito(res, { metodoPago }, 'Método de pago desactivado exitosamente');
    } catch (error) {
      next(error);
    }
  };

  obtenerMetodoPagoPrincipal = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = _req.usuario!.id;

      const metodoPago = await this.metodoPagoService.obtenerMetodoPagoPrincipal(usuarioId);

      if (!metodoPago) {
        respuestaExito(res, { metodoPago: null }, 'No tienes un método de pago principal');
        return;
      }

      respuestaExito(res, { metodoPago }, 'Método de pago principal obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  };

  contarMetodosPago = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = _req.usuario!.id;

      const cantidad = await this.metodoPagoService.contarMetodosPagoPorUsuario(usuarioId);

      respuestaExito(res, { cantidad }, 'Cantidad de métodos de pago obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  };
}
