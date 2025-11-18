import { prisma } from '../config/database';
import { MetodoPago } from '@prisma/client';

export interface CrearMetodoPagoDto {
  usuarioId: string;
  tipo: string;
  ultimos4Digitos?: string;
  nombreTitular?: string;
  fechaExpiracion?: string;
  marca?: string;
}

export interface ActualizarMetodoPagoDto {
  tipo?: string;
  ultimos4Digitos?: string;
  nombreTitular?: string;
  fechaExpiracion?: string;
  marca?: string;
  esPrincipal?: boolean;
  activo?: boolean;
}

export class MetodoPagoRepository {
  async obtenerMetodosPagoActivosPorUsuario(usuarioId: string): Promise<MetodoPago[]> {
    return await prisma.metodoPago.findMany({
      where: {
        usuarioId,
        activo: true,
      },
      orderBy: {
        esPrincipal: 'desc',
      },
    });
  }

  async obtenerTodosMetodosPagoUsuario(usuarioId: string): Promise<MetodoPago[]> {
    return await prisma.metodoPago.findMany({
      where: {
        usuarioId,
      },
      orderBy: {
        esPrincipal: 'desc',
      },
    });
  }

  async obtenerMetodoPagoPorId(id: string): Promise<MetodoPago | null> {
    return await prisma.metodoPago.findUnique({
      where: { id },
    });
  }

  async obtenerMetodoPagoPrincipal(usuarioId: string): Promise<MetodoPago | null> {
    return await prisma.metodoPago.findFirst({
      where: {
        usuarioId,
        esPrincipal: true,
        activo: true,
      },
    });
  }

  async contarMetodosPagoActivosPorUsuario(usuarioId: string): Promise<number> {
    return await prisma.metodoPago.count({
      where: {
        usuarioId,
        activo: true,
      },
    });
  }

  async contarTodosMetodosPagoPorUsuario(usuarioId: string): Promise<number> {
    return await prisma.metodoPago.count({
      where: {
        usuarioId,
      },
    });
  }

  async crearMetodoPago(datos: CrearMetodoPagoDto): Promise<MetodoPago> {
    return await prisma.metodoPago.create({
      data: {
        usuarioId: datos.usuarioId,
        tipo: datos.tipo,
        ultimos4Digitos: datos.ultimos4Digitos,
        nombreTitular: datos.nombreTitular,
        fechaExpiracion: datos.fechaExpiracion,
        marca: datos.marca,
        esPrincipal: false, // Nunca será principal al crear
        activo: true,
      },
    });
  }

  async actualizarMetodoPago(id: string, datos: ActualizarMetodoPagoDto): Promise<MetodoPago> {
    return await prisma.metodoPago.update({
      where: { id },
      data: {
        tipo: datos.tipo,
        ultimos4Digitos: datos.ultimos4Digitos,
        nombreTitular: datos.nombreTitular,
        fechaExpiracion: datos.fechaExpiracion,
        marca: datos.marca,
        esPrincipal: datos.esPrincipal,
        activo: datos.activo,
        actualizadoEn: new Date(),
      },
    });
  }

  async marcarComoPrincipal(id: string, usuarioId: string): Promise<MetodoPago> {
    // Desmarcar el anterior método principal
    await prisma.metodoPago.updateMany({
      where: {
        usuarioId,
        esPrincipal: true,
      },
      data: {
        esPrincipal: false,
      },
    });

    // Marcar el nuevo como principal
    return await prisma.metodoPago.update({
      where: { id },
      data: {
        esPrincipal: true,
        actualizadoEn: new Date(),
      },
    });
  }

  async desactivarMetodoPago(id: string): Promise<MetodoPago> {
    return await prisma.metodoPago.update({
      where: { id },
      data: {
        activo: false,
        esPrincipal: false, // Desmarcar como principal si lo era
        actualizadoEn: new Date(),
      },
    });
  }

  async obtenerMetodoPagoSinValidar(id: string): Promise<MetodoPago | null> {
    return await prisma.metodoPago.findUnique({
      where: { id },
    });
  }

  async verificarMetodoPerteneceAlUsuario(metodoPagoId: string, usuarioId: string): Promise<boolean> {
    const metodoPago = await prisma.metodoPago.findUnique({
      where: { id: metodoPagoId },
    });

    return metodoPago ? metodoPago.usuarioId === usuarioId : false;
  }
}
