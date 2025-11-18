import { prisma } from '../config/database';
import { Reservacion } from '@prisma/client';

export interface CrearReservacionDto {
  usuarioId: string;
  servicioId: string;
  trabajadorId?: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  direccionServicio: string;
  precioFinal: number;
  notasCliente?: string;
}

export interface ActualizarReservacionDto {
  estado?: string;
  notasTrabajador?: string;
  motivoCancelacion?: string;
  canceladoEn?: Date;
  completadoEn?: Date;
  trabajadorId?: string;
}

export class ReservacionRepository {
  async obtenerReservacionesPorUsuario(
    usuarioId: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ datos: Reservacion[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [datos, total] = await Promise.all([
      prisma.reservacion.findMany({
        where: {
          usuarioId,
        },
        include: {
          servicio: true,
          trabajador: true,
          calificacion: true,
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: limite,
      }),
      prisma.reservacion.count({
        where: {
          usuarioId,
        },
      }),
    ]);

    return { datos, total };
  }

  async obtenerReservacionesPorEstado(
    usuarioId: string,
    estado: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ datos: Reservacion[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [datos, total] = await Promise.all([
      prisma.reservacion.findMany({
        where: {
          usuarioId,
          estado,
        },
        include: {
          servicio: true,
          trabajador: true,
          calificacion: true,
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: limite,
      }),
      prisma.reservacion.count({
        where: {
          usuarioId,
          estado,
        },
      }),
    ]);

    return { datos, total };
  }

  async obtenerReservacionPorId(id: string): Promise<Reservacion | null> {
    return await prisma.reservacion.findUnique({
      where: { id },
      include: {
        usuario: true,
        servicio: true,
        trabajador: true,
        calificacion: true,
      },
    });
  }

  async obtenerReservacionesPorTrabajador(
    trabajadorId: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ datos: Reservacion[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [datos, total] = await Promise.all([
      prisma.reservacion.findMany({
        where: {
          trabajadorId,
        },
        include: {
          usuario: true,
          servicio: true,
          calificacion: true,
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: limite,
      }),
      prisma.reservacion.count({
        where: {
          trabajadorId,
        },
      }),
    ]);

    return { datos, total };
  }

  async obtenerReservacionesActivas(usuarioId: string): Promise<Reservacion[]> {
    return await prisma.reservacion.findMany({
      where: {
        usuarioId,
        estado: {
          in: ['pending', 'confirmed', 'in_progress'],
        },
      },
      include: {
        servicio: true,
        trabajador: true,
      },
    });
  }

  async usuarioTieneReservacionActiva(usuarioId: string): Promise<boolean> {
    const reservacion = await prisma.reservacion.findFirst({
      where: {
        usuarioId,
        estado: {
          in: ['pending', 'confirmed', 'in_progress'],
        },
      },
    });

    return !!reservacion;
  }

  async crearReservacion(datos: CrearReservacionDto): Promise<Reservacion> {
    return await prisma.reservacion.create({
      data: {
        usuarioId: datos.usuarioId,
        servicioId: datos.servicioId,
        trabajadorId: datos.trabajadorId,
        fechaHoraInicio: datos.fechaHoraInicio,
        fechaHoraFin: datos.fechaHoraFin,
        direccionServicio: datos.direccionServicio,
        precioFinal: datos.precioFinal,
        notasCliente: datos.notasCliente,
        estado: 'confirmed',
      },
      include: {
        usuario: true,
        servicio: true,
        trabajador: true,
      },
    });
  }

  async actualizarReservacion(
    id: string,
    datos: ActualizarReservacionDto
  ): Promise<Reservacion> {
    return await prisma.reservacion.update({
      where: { id },
      data: {
        estado: datos.estado,
        notasTrabajador: datos.notasTrabajador,
        motivoCancelacion: datos.motivoCancelacion,
        canceladoEn: datos.canceladoEn,
        completadoEn: datos.completadoEn,
        trabajadorId: datos.trabajadorId,
        actualizadoEn: new Date(),
      },
      include: {
        usuario: true,
        servicio: true,
        trabajador: true,
        calificacion: true,
      },
    });
  }

  async obtenerReservacionSinValidar(id: string): Promise<Reservacion | null> {
    return await prisma.reservacion.findUnique({
      where: { id },
    });
  }

  async obtenerReservacionesEnRangoFecha(
    trabajadorId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<Reservacion[]> {
    return await prisma.reservacion.findMany({
      where: {
        trabajadorId,
        estado: {
          in: ['pending', 'confirmed', 'in_progress'],
        },
        fechaHoraInicio: {
          lt: fechaFin,
        },
        fechaHoraFin: {
          gt: fechaInicio,
        },
      },
    });
  }

  async contarReservacionesCompletadas(usuarioId: string): Promise<number> {
    return await prisma.reservacion.count({
      where: {
        usuarioId,
        estado: 'completed',
      },
    });
  }

  async obtenerReservacionesPendientesCalificacion(usuarioId: string): Promise<Reservacion[]> {
    return await prisma.reservacion.findMany({
      where: {
        usuarioId,
        estado: 'completed',
        calificacion: null,
      },
      include: {
        servicio: true,
        trabajador: true,
      },
      orderBy: {
        completadoEn: 'desc',
      },
    });
  }
}
