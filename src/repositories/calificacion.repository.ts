import { PrismaClient, Calificacion } from '@prisma/client';
import { prisma } from '../config/database';

export interface CrearCalificacionDto {
  usuarioId: string;
  reservacionId: string;
  trabajadorId?: string;
  calificacionServicio: number;
  calificacionTrabajador?: number;
  comentarioServicio?: string;
  comentarioTrabajador?: string;
}

export interface ActualizarCalificacionDto {
  calificacionServicio?: number;
  calificacionTrabajador?: number;
  comentarioServicio?: string;
  comentarioTrabajador?: string;
}

export class CalificacionRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Crea una nueva calificación para una reservación completada
   */
  async crearCalificacion(datos: CrearCalificacionDto): Promise<Calificacion> {
    return await this.prisma.calificacion.create({
      data: {
        usuarioId: datos.usuarioId,
        reservacionId: datos.reservacionId,
        trabajadorId: datos.trabajadorId,
        calificacionServicio: datos.calificacionServicio,
        calificacionTrabajador: datos.calificacionTrabajador,
        comentarioServicio: datos.comentarioServicio,
        comentarioTrabajador: datos.comentarioTrabajador,
      },
      include: {
        usuario: true,
        reservacion: {
          include: {
            servicio: true,
            trabajador: true,
          },
        },
        trabajador: true,
      },
    });
  }

  /**
   * Obtiene una calificación por su ID
   */
  async obtenerCalificacionPorId(id: string): Promise<Calificacion | null> {
    return await this.prisma.calificacion.findUnique({
      where: { id },
      include: {
        usuario: true,
        reservacion: {
          include: {
            servicio: true,
            trabajador: true,
          },
        },
        trabajador: true,
      },
    });
  }

  /**
   * Obtiene calificación por reservación (relación 1:1)
   */
  async obtenerCalificacionPorReservacion(
    reservacionId: string
  ): Promise<Calificacion | null> {
    return await this.prisma.calificacion.findUnique({
      where: { reservacionId },
      include: {
        usuario: true,
        reservacion: {
          include: {
            servicio: true,
            trabajador: true,
          },
        },
        trabajador: true,
      },
    });
  }

  /**
   * Obtiene calificaciones dadas por un usuario (con paginación)
   */
  async obtenerCalificacionesPorUsuario(
    usuarioId: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ calificaciones: Calificacion[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [calificaciones, total] = await Promise.all([
      this.prisma.calificacion.findMany({
        where: { usuarioId },
        include: {
          reservacion: {
            include: {
              servicio: true,
              trabajador: true,
            },
          },
          trabajador: true,
        },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limite,
      }),
      this.prisma.calificacion.count({
        where: { usuarioId },
      }),
    ]);

    return { calificaciones, total };
  }

  /**
   * Obtiene calificaciones recibidas por un trabajador
   */
  async obtenerCalificacionesPorTrabajador(
    trabajadorId: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ calificaciones: Calificacion[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [calificaciones, total] = await Promise.all([
      this.prisma.calificacion.findMany({
        where: { trabajadorId },
        include: {
          usuario: true,
          reservacion: {
            include: {
              servicio: true,
            },
          },
        },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limite,
      }),
      this.prisma.calificacion.count({
        where: { trabajadorId },
      }),
    ]);

    return { calificaciones, total };
  }

  /**
   * Calcula el promedio de calificaciones de un trabajador
   */
  async calcularPromedioTrabajador(
    trabajadorId: string
  ): Promise<{ promedio: number; total: number }> {
    const resultado = await this.prisma.calificacion.aggregate({
      where: { trabajadorId },
      _avg: {
        calificacionTrabajador: true,
      },
      _count: true,
    });

    const promedio = resultado._avg.calificacionTrabajador ?? 0;
    const total = resultado._count;

    return {
      promedio: promedio > 0 ? Math.round(promedio * 100) / 100 : 0,
      total,
    };
  }

  /**
   * Actualiza una calificación existente
   */
  async actualizarCalificacion(
    id: string,
    datos: ActualizarCalificacionDto
  ): Promise<Calificacion> {
    return await this.prisma.calificacion.update({
      where: { id },
      data: datos,
      include: {
        usuario: true,
        reservacion: {
          include: {
            servicio: true,
            trabajador: true,
          },
        },
        trabajador: true,
      },
    });
  }

  /**
   * Verifica si una reservación ya tiene calificación
   */
  async tieneCalificacion(reservacionId: string): Promise<boolean> {
    const calificacion = await this.prisma.calificacion.findUnique({
      where: { reservacionId },
    });

    return calificacion !== null;
  }

  /**
   * Obtiene calificaciones para un servicio específico (vía reservaciones)
   */
  async obtenerCalificacionesPorServicio(
    servicioId: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ calificaciones: Calificacion[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [calificaciones, total] = await Promise.all([
      this.prisma.calificacion.findMany({
        where: {
          reservacion: {
            servicioId,
          },
        },
        include: {
          usuario: true,
          reservacion: {
            include: {
              servicio: true,
              trabajador: true,
            },
          },
          trabajador: true,
        },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limite,
      }),
      this.prisma.calificacion.count({
        where: {
          reservacion: {
            servicioId,
          },
        },
      }),
    ]);

    return { calificaciones, total };
  }

  /**
   * Calcula estadísticas de calificación para un servicio
   */
  async obtenerEstadisticasServicio(servicioId: string): Promise<{
    promedioServicio: number;
    totalCalificaciones: number;
    distribucion: { [key: number]: number };
  }> {
    const calificaciones = await this.prisma.calificacion.findMany({
      where: {
        reservacion: {
          servicioId,
        },
      },
      select: {
        calificacionServicio: true,
      },
    });

    if (calificaciones.length === 0) {
      return {
        promedioServicio: 0,
        totalCalificaciones: 0,
        distribucion: {},
      };
    }

    const suma = calificaciones.reduce(
      (acc, cal) => acc + cal.calificacionServicio,
      0
    );
    const promedio = Math.round((suma / calificaciones.length) * 100) / 100;

    // Contar distribución de calificaciones
    const distribucion: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      distribucion[i] = calificaciones.filter(
        (cal) => cal.calificacionServicio === i
      ).length;
    }

    return {
      promedioServicio: promedio,
      totalCalificaciones: calificaciones.length,
      distribucion,
    };
  }

  /**
   * Elimina una calificación (por cascada de reservación)
   */
  async eliminarCalificacion(id: string): Promise<void> {
    await this.prisma.calificacion.delete({
      where: { id },
    });
  }
}
