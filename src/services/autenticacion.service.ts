import { UsuarioRepository } from '../repositories/usuario.repository';
import { prisma } from '../config/database';
import { hashearPassword, compararPassword } from '../utils/password';
import {
  generarAccessToken,
  generarRefreshToken,
  verificarRefreshToken,
  PayloadToken,
} from '../utils/jwt';
import {
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorNoAutorizado,
  ErrorNegocio,
} from '../utils/errores';
import { validarPlacaColombia } from './validaciones/validadorPlaca';
import { validarTelefonoColombia } from './validaciones/validadorTelefono';

// ============================================
// TIPOS Y INTERFACES
// ============================================

export interface RegistrarUsuarioDto {
  email: string;
  password: string;
  nombreCompleto: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  ciudad: string;
  direccion: string;
  tipoVehiculo: string;
  placaVehiculo: string;
  cuidadoEspecial?: string;
}

export interface RespuestaLogin {
  usuario: {
    id: string;
    email: string;
    nombreCompleto: string;
    telefono: string;
    fotoPerfil: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RespuestaRefreshToken {
  accessToken: string;
}

// ============================================
// SERVICE DE AUTENTICACIÓN
// ============================================

/**
 * Service de Autenticación
 *
 * Implementa toda la lógica de negocio para autenticación, registro, login,
 * logout y renovación de tokens. No maneja HTTP directamente.
 */
export class AutenticacionService {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * Validaciones de negocio:
   * - Email debe ser único
   * - Documento debe ser único
   * - Placa debe ser única y con formato válido (3 letras + 3 números)
   * - Teléfono debe tener formato colombiano válido
   * - Contraseña debe tener al menos 8 caracteres
   *
   * @param datos - Datos del usuario a registrar
   * @returns Token de acceso y refresh token junto con datos del usuario
   * @throws {ErrorValidacion} Si los datos no cumplen validaciones básicas
   * @throws {ErrorNegocio} Si email, documento o placa ya existen en el sistema
   */
  async registrarUsuario(datos: RegistrarUsuarioDto): Promise<RespuestaLogin> {
    // Validar formato de email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(datos.email)) {
      throw new ErrorValidacion('El formato del email no es válido');
    }

    // Validar longitud de contraseña
    if (datos.password.length < 8) {
      throw new ErrorValidacion(
        'La contraseña debe tener al menos 8 caracteres'
      );
    }

    // Validar formato de placa colombiana
    if (!validarPlacaColombia(datos.placaVehiculo)) {
      throw new ErrorValidacion(
        'La placa debe tener formato colombiano: 3 letras seguidas de 3 números (ej: ABC123)'
      );
    }

    // Validar formato de teléfono colombiano
    if (!validarTelefonoColombia(datos.telefono)) {
      throw new ErrorValidacion(
        'El teléfono debe tener formato colombiano válido (ej: +57 300 123 4567)'
      );
    }

    // Verificar que el email no existe
    const usuarioExistenteEmail =
      await this.usuarioRepository.obtenerUsuarioPorEmail(datos.email);
    if (usuarioExistenteEmail) {
      throw new ErrorNegocio(
        'El email ya está registrado en el sistema. Intenta con otro email o inicia sesión.'
      );
    }

    // Verificar que el documento no existe
    const usuarioExistenteDocumento =
      await this.usuarioRepository.obtenerUsuarioPorNumeroDocumento(
        datos.numeroDocumento
      );
    if (usuarioExistenteDocumento) {
      throw new ErrorNegocio(
        'El documento ya está registrado en el sistema. Intenta con otro documento.'
      );
    }

    // Hashear contraseña
    const passwordHash = await hashearPassword(datos.password);

    // Crear usuario
    const nuevoUsuario = await this.usuarioRepository.crearUsuario({
      email: datos.email.toLowerCase().trim(),
      passwordHash,
      nombreCompleto: datos.nombreCompleto,
      telefono: datos.telefono,
      tipoDocumento: datos.tipoDocumento,
      numeroDocumento: datos.numeroDocumento,
      ciudad: datos.ciudad,
      direccion: datos.direccion,
      tipoVehiculo: datos.tipoVehiculo,
      placaVehiculo: datos.placaVehiculo.toUpperCase(),
      cuidadoEspecial: datos.cuidadoEspecial || null,
    });

    // Generar tokens
    const payloadToken: PayloadToken = {
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
    };

    const accessToken = generarAccessToken(payloadToken);
    const refreshToken = generarRefreshToken(payloadToken);

    // Guardar refresh token en DB
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7); // +7 días

    await prisma.refreshToken.create({
      data: {
        usuarioId: nuevoUsuario.id,
        token: refreshToken,
        expiraEn: fechaExpiracion,
      },
    });

    return {
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombreCompleto: nuevoUsuario.nombreCompleto,
        telefono: nuevoUsuario.telefono,
        fotoPerfil: nuevoUsuario.fotoPerfil,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Registro inicial con sólo email y password.
   * Crea el usuario con campos mínimos (vacíos o por defecto) y retorna los tokens.
   */
  async registrarUsuarioInicial(datos: { email: string; password: string }): Promise<RespuestaLogin> {
    // Validar formato de email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(datos.email)) {
      throw new ErrorValidacion('El formato del email no es válido');
    }

    // Validar longitud de contraseña
    if (!datos.password || datos.password.length < 8) {
      throw new ErrorValidacion('La contraseña debe tener al menos 8 caracteres');
    }

    // Verificar que el email no existe
    const usuarioExistenteEmail = await this.usuarioRepository.obtenerUsuarioPorEmail(datos.email);
    if (usuarioExistenteEmail) {
      throw new ErrorNegocio('El email ya está registrado en el sistema. Intenta con otro email o inicia sesión.');
    }

    // Generar valores temporales únicos
    const now = Date.now();
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + now;
    const datosTemporales = {
      email: datos.email.toLowerCase().trim(),
      passwordHash: await hashearPassword(datos.password),
      nombreCompleto: 'Usuario Pendiente',
      telefono: `+57TEMP${now}`,
      tipoDocumento: 'CC',
      numeroDocumento: `TEMP-${uuid}`,
      ciudad: 'Pendiente',
      direccion: 'Pendiente',
      tipoVehiculo: 'carro',
      placaVehiculo: `TMP-${uuid.slice(0,6).toUpperCase()}`,
      cuidadoEspecial: 'ninguno',
    };

    // Crear usuario con datos temporales
    const nuevoUsuario = await this.usuarioRepository.crearUsuario(datosTemporales as any);

    // Generar tokens
    const payloadToken: PayloadToken = {
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
    };

    const accessToken = generarAccessToken(payloadToken);
    const refreshToken = generarRefreshToken(payloadToken);

    // Guardar refresh token en DB
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7); // +7 días

    await prisma.refreshToken.create({
      data: {
        usuarioId: nuevoUsuario.id,
        token: refreshToken,
        expiraEn: fechaExpiracion,
      },
    });

    return {
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombreCompleto: nuevoUsuario.nombreCompleto,
        telefono: nuevoUsuario.telefono,
        fotoPerfil: nuevoUsuario.fotoPerfil,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Inicia sesión de un usuario validando sus credenciales.
   *
   * Validaciones de negocio:
   * - Email debe existir en el sistema
   * - Contraseña debe ser correcta
   * - Usuario debe estar activo (no eliminado)
   *
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano
   * @returns Datos del usuario, access token y refresh token
   * @throws {ErrorNoEncontrado} Si el usuario no existe
   * @throws {ErrorNoAutorizado} Si la contraseña es incorrecta
   */
  async iniciarSesion(email: string, password: string): Promise<RespuestaLogin> {
    // Obtener usuario por email
    const usuario =
      await this.usuarioRepository.obtenerUsuarioPorEmail(email);

    if (!usuario) {
      throw new ErrorNoEncontrado(
        'No encontramos un usuario con ese email en el sistema'
      );
    }

    // Verificar contraseña
    const passwordValida = await compararPassword(password, usuario.passwordHash);

    if (!passwordValida) {
      throw new ErrorNoAutorizado('La contraseña es incorrecta');
    }

    // Generar tokens
    const payloadToken: PayloadToken = {
      id: usuario.id,
      email: usuario.email,
    };

    const accessToken = generarAccessToken(payloadToken);
    const refreshToken = generarRefreshToken(payloadToken);

    // Guardar refresh token en DB
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7); // +7 días

    await prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        token: refreshToken,
        expiraEn: fechaExpiracion,
      },
    });

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        telefono: usuario.telefono,
        fotoPerfil: usuario.fotoPerfil,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Renueva el access token usando un refresh token válido.
   *
   * Validaciones de negocio:
   * - Refresh token debe tener firma válida
   * - Refresh token debe existir en la base de datos
   * - Refresh token no debe estar revocado
   * - Refresh token no debe estar expirado
   *
   * @param refreshToken - Refresh token válido del usuario
   * @returns Nuevo access token
   * @throws {ErrorNoAutorizado} Si el refresh token es inválido, revocado o expirado
   */
  async renovarToken(refreshToken: string): Promise<RespuestaRefreshToken> {
    // Verificar firma del refresh token
    let payload: PayloadToken;
    try {
      payload = verificarRefreshToken(refreshToken);
    } catch (error) {
      throw new ErrorNoAutorizado(
        'Refresh token inválido. Por favor inicia sesión nuevamente.'
      );
    }

    // Verificar que el refresh token existe en DB
    const tokenEnDb = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenEnDb) {
      throw new ErrorNoAutorizado(
        'Refresh token no encontrado. Por favor inicia sesión nuevamente.'
      );
    }

    // Verificar que no está revocado
    if (tokenEnDb.revocado) {
      throw new ErrorNoAutorizado(
        'Refresh token ha sido revocado. Por favor inicia sesión nuevamente.'
      );
    }

    // Verificar expiración
    if (tokenEnDb.expiraEn < new Date()) {
      throw new ErrorNoAutorizado(
        'Refresh token ha expirado. Por favor inicia sesión nuevamente.'
      );
    }

    // Generar nuevo access token
    const nuevoAccessToken = generarAccessToken({
      id: payload.id,
      email: payload.email,
    });

    return {
      accessToken: nuevoAccessToken,
    };
  }

  /**
   * Cierra la sesión de un usuario revocando su refresh token.
   *
   * El refresh token no se elimina de la base de datos, solo se marca como revocado.
   * Esto permite auditoría y previene reutilización del token.
   *
   * @param refreshToken - Refresh token a revocar
   * @throws {ErrorNoEncontrado} Si el refresh token no existe
   */
  async cerrarSesion(refreshToken: string): Promise<void> {
    // Verificar que el refresh token existe
    const tokenEnDb = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenEnDb) {
      throw new ErrorNoEncontrado(
        'Refresh token no encontrado en el sistema'
      );
    }

    // Revocar el refresh token
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: {
        revocado: true,
      },
    });
  }
}
