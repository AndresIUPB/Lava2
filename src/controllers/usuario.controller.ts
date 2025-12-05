import { Request, Response, NextFunction } from 'express';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { respuestaExito } from '../utils/respuestas';
import { validarPlacaColombia } from '../services/validaciones/validadorPlaca';
import { validarTelefonoColombia } from '../services/validaciones/validadorTelefono';
import { ErrorValidacion, ErrorNoEncontrado } from '../utils/errores';

export class UsuarioController {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  /**
   * PUT /usuarios/completar-perfil
   * Actualiza los datos faltantes del perfil del usuario.
   * Requiere autenticación (req.usuario debe contener id)
   */
  completarPerfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoEncontrado('Usuario no autenticado');

      const {
        nombreCompleto,
        telefono,
        tipoDocumento,
        numeroDocumento,
        ciudad,
        direccion,
        tipoVehiculo,
        placaVehiculo,
        cuidadoEspecial,
      } = req.body;

      // Validaciones básicas
      if (!nombreCompleto || nombreCompleto.trim().length < 3) {
        throw new ErrorValidacion('El nombre completo es obligatorio y debe tener al menos 3 caracteres');
      }

      if (!validarTelefonoColombia(telefono)) {
        throw new ErrorValidacion('Teléfono inválido. Debe ser formato colombiano (ej: +57 300 123 4567)');
      }

      if (!validarPlacaColombia(placaVehiculo)) {
        throw new ErrorValidacion('Placa inválida. Formato esperado: ABC123');
      }

      // Actualizar usuario
      const actualizado = await this.usuarioRepository.actualizarUsuario(usuarioId, {
        nombreCompleto,
        telefono,
        tipoDocumento,
        numeroDocumento,
        ciudad,
        direccion,
        tipoVehiculo,
        placaVehiculo: placaVehiculo.toUpperCase(),
        cuidadoEspecial: cuidadoEspecial || null,
      } as any);

      // Generar nuevos tokens
      const { generarAccessToken, generarRefreshToken } = require('../utils/jwt');
      const payload = { id: actualizado.id, email: actualizado.email };
      const accessToken = generarAccessToken(payload);
      const refreshToken = generarRefreshToken(payload);

      // Opcional: guardar refreshToken en DB si lo usas para control de sesión

      respuestaExito(res, {
        usuario: actualizado,
        accessToken,
        refreshToken,
      }, 'Perfil completado correctamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /usuarios/perfil
   * Retorna el perfil del usuario autenticado
   */
  obtenerPerfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoEncontrado('Usuario no autenticado');

      const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
      if (!usuario) throw new ErrorNoEncontrado('Usuario no encontrado');

      respuestaExito(res, usuario, 'Perfil obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /usuarios/perfil
   * Actualiza campos parciales del perfil del usuario autenticado
   */
  actualizarPerfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoEncontrado('Usuario no autenticado');

      const {
        nombreCompleto,
        telefono,
        tipoDocumento,
        numeroDocumento,
        ciudad,
        direccion,
        tipoVehiculo,
        placaVehiculo,
        cuidadoEspecial,
      } = req.body;

      // Validaciones opcionales cuando el campo se provee
      if (telefono && !validarTelefonoColombia(telefono)) {
        throw new ErrorValidacion('Teléfono inválido. Debe ser formato colombiano (ej: +57 300 123 4567)');
      }

      if (placaVehiculo && !validarPlacaColombia(placaVehiculo)) {
        throw new ErrorValidacion('Placa inválida. Formato esperado: ABC123');
      }

      const datosActualizacion: any = {};
      if (nombreCompleto !== undefined) datosActualizacion.nombreCompleto = nombreCompleto;
      if (telefono !== undefined) datosActualizacion.telefono = telefono;
      if (tipoDocumento !== undefined) datosActualizacion.tipoDocumento = tipoDocumento;
      if (numeroDocumento !== undefined) datosActualizacion.numeroDocumento = numeroDocumento;
      if (ciudad !== undefined) datosActualizacion.ciudad = ciudad;
      if (direccion !== undefined) datosActualizacion.direccion = direccion;
      if (tipoVehiculo !== undefined) datosActualizacion.tipoVehiculo = tipoVehiculo;
      if (placaVehiculo !== undefined) datosActualizacion.placaVehiculo = placaVehiculo.toUpperCase();
      if (cuidadoEspecial !== undefined) datosActualizacion.cuidadoEspecial = cuidadoEspecial;

      const actualizado = await this.usuarioRepository.actualizarUsuario(usuarioId, datosActualizacion);

      respuestaExito(res, actualizado, 'Perfil actualizado correctamente');
    } catch (error) {
      next(error);
    }
  };
}
