import { MetodoPagoRepository } from '../repositories/metodoPago.repository';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { ErrorNoEncontrado, ErrorValidacion, ErrorNegocio } from '../utils/errores';
import { MetodoPago } from '@prisma/client';

const LIMITE_METODOS_PAGO = 3;

export interface CrearMetodoPagoDtoService {
  usuarioId: string;
  tipo: string;
  ultimos4Digitos?: string;
  nombreTitular?: string;
  fechaExpiracion?: string;
  marca?: string;
}

export class MetodoPagoService {
  private metodoPagoRepository: MetodoPagoRepository;
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.metodoPagoRepository = new MetodoPagoRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  async obtenerMetodosPagoPorUsuario(usuarioId: string): Promise<MetodoPago[]> {
    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    return await this.metodoPagoRepository.obtenerMetodosPagoActivosPorUsuario(usuarioId);
  }

  async obtenerMetodoPagoPorId(id: string, usuarioId: string): Promise<MetodoPago> {
    const metodoPago = await this.metodoPagoRepository.obtenerMetodoPagoPorId(id);

    if (!metodoPago) {
      throw new ErrorNoEncontrado('Método de pago no encontrado');
    }

    // Validar que el método pertenece al usuario
    if (metodoPago.usuarioId !== usuarioId) {
      throw new ErrorNegocio('No tienes permiso para acceder a este método de pago');
    }

    return metodoPago;
  }

  async crearMetodoPago(datos: CrearMetodoPagoDtoService): Promise<MetodoPago> {
    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(datos.usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Validar que el tipo sea válido
    this.validarTipoMetodoPago(datos.tipo);

    // Validar que no exceda el límite de 3 métodos de pago
    const cantidadActual = await this.metodoPagoRepository.contarMetodosPagoActivosPorUsuario(
      datos.usuarioId
    );

    if (cantidadActual >= LIMITE_METODOS_PAGO) {
      throw new ErrorNegocio(
        `Ya tienes ${LIMITE_METODOS_PAGO} métodos de pago activos. Debes desactivar uno antes de agregar otro.`
      );
    }

    // Validaciones específicas según tipo
    if (datos.tipo === 'tarjeta_credito' || datos.tipo === 'tarjeta_debito') {
      this.validarDatosTarjeta(datos);
    }

    // Crear método de pago
    const nuevoMetodo = await this.metodoPagoRepository.crearMetodoPago({
      usuarioId: datos.usuarioId,
      tipo: datos.tipo,
      ultimos4Digitos: datos.ultimos4Digitos,
      nombreTitular: datos.nombreTitular,
      fechaExpiracion: datos.fechaExpiracion,
      marca: datos.marca,
    });

    // Si es el primer método, marcarlo como principal
    if (cantidadActual === 0) {
      return await this.metodoPagoRepository.marcarComoPrincipal(
        nuevoMetodo.id,
        datos.usuarioId
      );
    }

    return nuevoMetodo;
  }

  async marcarComoPrincipal(id: string, usuarioId: string): Promise<MetodoPago> {
    // Obtener método
    const metodoPago = await this.metodoPagoRepository.obtenerMetodoPagoPorId(id);

    if (!metodoPago) {
      throw new ErrorNoEncontrado('Método de pago no encontrado');
    }

    // Validar que pertenece al usuario
    if (metodoPago.usuarioId !== usuarioId) {
      throw new ErrorNegocio('No tienes permiso para actualizar este método de pago');
    }

    // Validar que esté activo
    if (!metodoPago.activo) {
      throw new ErrorNegocio('No puedes marcar como principal un método de pago desactivado');
    }

    return await this.metodoPagoRepository.marcarComoPrincipal(id, usuarioId);
  }

  async desactivarMetodoPago(id: string, usuarioId: string): Promise<MetodoPago> {
    // Obtener método
    const metodoPago = await this.metodoPagoRepository.obtenerMetodoPagoPorId(id);

    if (!metodoPago) {
      throw new ErrorNoEncontrado('Método de pago no encontrado');
    }

    // Validar que pertenece al usuario
    if (metodoPago.usuarioId !== usuarioId) {
      throw new ErrorNegocio('No tienes permiso para desactivar este método de pago');
    }

    return await this.metodoPagoRepository.desactivarMetodoPago(id);
  }

  async obtenerMetodoPagoPrincipal(usuarioId: string): Promise<MetodoPago | null> {
    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    return await this.metodoPagoRepository.obtenerMetodoPagoPrincipal(usuarioId);
  }

  async contarMetodosPagoPorUsuario(usuarioId: string): Promise<number> {
    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    return await this.metodoPagoRepository.contarMetodosPagoActivosPorUsuario(usuarioId);
  }

  // Métodos privados de validación

  private validarTipoMetodoPago(tipo: string): void {
    const tiposValidos = ['tarjeta_credito', 'tarjeta_debito', 'pse', 'efectivo'];

    if (!tiposValidos.includes(tipo)) {
      throw new ErrorValidacion(
        `Tipo de método de pago no válido. Tipos permitidos: ${tiposValidos.join(', ')}`
      );
    }
  }

  private validarDatosTarjeta(datos: CrearMetodoPagoDtoService): void {
    if (!datos.ultimos4Digitos || datos.ultimos4Digitos.length !== 4) {
      throw new ErrorValidacion('Los últimos 4 dígitos deben estar presentes y tener 4 caracteres');
    }

    if (!datos.nombreTitular || datos.nombreTitular.trim().length < 3) {
      throw new ErrorValidacion('El nombre del titular debe tener al menos 3 caracteres');
    }

    if (!datos.fechaExpiracion || !this.validarFormatoFecha(datos.fechaExpiracion)) {
      throw new ErrorValidacion('La fecha de expiración debe estar en formato MM/YY');
    }

    if (!datos.marca || !['Visa', 'Mastercard', 'American Express', 'Diners'].includes(datos.marca)) {
      throw new ErrorValidacion(
        'La marca debe ser una de: Visa, Mastercard, American Express, Diners'
      );
    }
  }

  private validarFormatoFecha(fecha: string): boolean {
    const regex = /^\d{2}\/\d{2}$/;
    if (!regex.test(fecha)) {
      return false;
    }

    const [mes, _anio] = fecha.split('/').map(Number);
    return mes >= 1 && mes <= 12;
  }
}
