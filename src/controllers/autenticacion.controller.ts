import { Request, Response, NextFunction } from 'express';
import { AutenticacionService, RegistrarUsuarioDto } from '../services/autenticacion.service';
import { respuestaExito } from '../utils/respuestas';

// ============================================
// CONTROLADOR DE AUTENTICACIÓN
// ============================================

/**
 * Controlador de Autenticación
 *
 * Maneja todas las rutas HTTP relacionadas con autenticación.
 * Recibe requests HTTP, valida entrada, llama al service y retorna respuestas HTTP.
 *
 * NO contiene lógica de negocio - solo transformación HTTP ↔ Service.
 */
export class AutenticacionController {
  private autenticacionService: AutenticacionService;

  constructor() {
    this.autenticacionService = new AutenticacionService();
  }

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * Endpoint: POST /auth/registro
   * Status: 201 Created (exitoso)
   *
   * @param req - Request HTTP con datos del nuevo usuario en req.body
   * @param res - Response HTTP
   * @param next - Función para pasar al siguiente middleware (manejo de errores)
   */
  registrar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const datos: RegistrarUsuarioDto = {
        email: req.body.email,
        password: req.body.password,
        nombreCompleto: req.body.nombreCompleto,
        telefono: req.body.telefono,
        tipoDocumento: req.body.tipoDocumento,
        numeroDocumento: req.body.numeroDocumento,
        ciudad: req.body.ciudad,
        direccion: req.body.direccion,
        tipoVehiculo: req.body.tipoVehiculo,
        placaVehiculo: req.body.placaVehiculo,
        cuidadoEspecial: req.body.cuidadoEspecial,
      };

      const resultado =
        await this.autenticacionService.registrarUsuario(datos);

      respuestaExito(
        res,
        resultado,
        'Usuario registrado exitosamente',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Registra un nuevo usuario con datos mínimos (email y password).
   *
   * Endpoint: POST /auth/registro-inicial
   * Status: 201 Created (exitoso)
   *
   * @param req - Request HTTP con datos del nuevo usuario en req.body
   * @param res - Response HTTP
   * @param next - Función para pasar al siguiente middleware (manejo de errores)
   */
  registrarInicial = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const datos = {
        email: req.body.email,
        password: req.body.password,
      };

      const usuario = await this.autenticacionService.registrarUsuarioInicial(datos);

      respuestaExito(res, usuario, 'Usuario registrado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Inicia sesión de un usuario validando sus credenciales.
   *
   * Endpoint: POST /auth/login
   * Status: 200 OK (exitoso)
   *
   * @param req - Request HTTP con email y password en req.body
   * @param res - Response HTTP
   * @param next - Función para pasar al siguiente middleware (manejo de errores)
   */
  iniciarSesion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      const resultado = await this.autenticacionService.iniciarSesion(
        email,
        password
      );

      respuestaExito(res, resultado, 'Inicio de sesión exitoso');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Renueva el access token usando un refresh token válido.
   *
   * Endpoint: POST /auth/refresh
   * Status: 200 OK (exitoso)
   *
   * @param req - Request HTTP con refreshToken en req.body
   * @param res - Response HTTP
   * @param next - Función para pasar al siguiente middleware (manejo de errores)
   */
  renovarToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const resultado =
        await this.autenticacionService.renovarToken(refreshToken);

      respuestaExito(res, resultado, 'Token renovado exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cierra la sesión de un usuario revocando su refresh token.
   *
   * Endpoint: POST /auth/logout
   * Status: 200 OK (exitoso)
   *
   * @param req - Request HTTP con refreshToken en req.body
   * @param res - Response HTTP
   * @param next - Función para pasar al siguiente middleware (manejo de errores)
   */
  cerrarSesion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      await this.autenticacionService.cerrarSesion(refreshToken);

      respuestaExito(res, null, 'Sesión cerrada exitosamente');
    } catch (error) {
      next(error);
    }
  };
}
