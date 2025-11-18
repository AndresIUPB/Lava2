import { Notificacion } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * NotificacionRepository
 *
 * Encapsula todas las operaciones de Prisma para Notificaciones.
 * Proporciona métodos CRUD, filtrados, y operaciones de batch.
 */
export class NotificacionRepository {
  constructor() {}

  /**
   * Crea una nueva notificación
   */
  async crearNotificacion(datos: {
    usuarioId: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    datos?: Record<string, any> | null;
  }): Promise<Notificacion> {
    return await prisma.notificacion.create({
      data: {
        usuarioId: datos.usuarioId,
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        tipo: datos.tipo,
        datos: datos.datos ?? undefined,
        leida: false,
      },
    });
  }

  /**
   * Obtiene una notificación por ID
   */
  async obtenerNotificacionPorId(id: string): Promise<Notificacion | null> {
    return await prisma.notificacion.findUnique({
      where: { id },
    });
  }

  /**
   * Obtiene todas las notificaciones de un usuario
   */
  async obtenerNotificacionesUsuario(
    usuarioId: string,
    opciones: { pagina: number; limite: number; leida?: boolean } = { pagina: 1, limite: 20 }
  ): Promise<any> {
    const { pagina, limite, leida } = opciones;
    const skip = (pagina - 1) * limite;

    const where: any = { usuarioId };
    if (leida !== undefined) {
      where.leida = leida;
    }

    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        where,
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limite,
      }),
      prisma.notificacion.count({ where }),
    ]);

    return {
      notificaciones,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  /**
   * Obtiene notificaciones no leídas de un usuario
   */
  async obtenerNotificacionesNoLeidas(usuarioId: string): Promise<Notificacion[]> {
    return await prisma.notificacion.findMany({
      where: { usuarioId, leida: false },
      orderBy: { creadoEn: 'desc' },
    });
  }

  /**
   * Cuenta notificaciones no leídas
   */
  async contarNoLeidas(usuarioId: string): Promise<number> {
    return await prisma.notificacion.count({
      where: { usuarioId, leida: false },
    });
  }

  /**
   * Marca una notificación como leída
   */
  async marcarComoLeida(id: string): Promise<Notificacion> {
    return await prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async marcarTodoComoLeido(usuarioId: string): Promise<{ count: number }> {
    return await prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
  }

  /**
   * Obtiene notificaciones filtradas por tipo
   */
  async obtenerPorTipo(
    usuarioId: string,
    tipo: string,
    opciones: { pagina: number; limite: number } = { pagina: 1, limite: 20 }
  ): Promise<any> {
    const { pagina, limite } = opciones;
    const skip = (pagina - 1) * limite;

    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        where: { usuarioId, tipo },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limite,
      }),
      prisma.notificacion.count({ where: { usuarioId, tipo } }),
    ]);

    return {
      notificaciones,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  /**
   * Elimina una notificación
   */
  async eliminarNotificacion(id: string): Promise<void> {
    await prisma.notificacion.delete({
      where: { id },
    });
  }

  /**
   * Elimina todas las notificaciones leídas de un usuario
   */
  async eliminarLeidasUsuario(usuarioId: string): Promise<{ count: number }> {
    return await prisma.notificacion.deleteMany({
      where: { usuarioId, leida: true },
    });
  }

  /**
   * Crea notificación automática para evento de reservación
   */
  async crearNotificacionReservacion(
    usuarioId: string,
    reservacionId: string,
    tipo: 'creada' | 'confirmada' | 'iniciada' | 'completada' | 'cancelada'
  ): Promise<Notificacion> {
    const titulos: Record<string, string> = {
      creada: 'Reservación creada',
      confirmada: 'Reservación confirmada',
      iniciada: 'Servicio en progreso',
      completada: 'Servicio completado',
      cancelada: 'Reservación cancelada',
    };

    const mensajes: Record<string, string> = {
      creada: 'Tu reservación ha sido creada',
      confirmada: 'Tu reservación ha sido confirmada',
      iniciada: 'El servicio ha iniciado',
      completada: 'El servicio ha sido completado. ¡Califica tu experiencia!',
      cancelada: 'Tu reservación ha sido cancelada',
    };

    return await this.crearNotificacion({
      usuarioId,
      titulo: titulos[tipo],
      mensaje: mensajes[tipo],
      tipo: 'reservacion',
      datos: { reservacionId, evento: tipo },
    });
  }

  /**
   * Crea notificación automática para calificación
   */
  async crearNotificacionCalificacion(
    usuarioId: string,
    calificacionId: string,
    esDelServicio: boolean
  ): Promise<Notificacion> {
    return await this.crearNotificacion({
      usuarioId,
      titulo: esDelServicio ? 'Calificación del servicio registrada' : 'Calificación registrada',
      mensaje: 'Tu valoración ha sido guardada exitosamente',
      tipo: 'calificacion',
      datos: { calificacionId },
    });
  }
}
