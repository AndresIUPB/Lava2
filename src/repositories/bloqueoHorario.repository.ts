import { Prisma, BloqueoHorario } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * Repositorio para operaciones de base de datos relacionadas con BloqueoHorario.
 * Encapsula todas las consultas de Prisma para la entidad BloqueoHorario.
 */
export class BloqueoHorarioRepository {
  /**
   * Obtiene todos los bloqueos de horario para un trabajador.
   */
  async obtenerBloqueosPorTrabajador(trabajadorId: string): Promise<BloqueoHorario[]> {
    return await prisma.bloqueoHorario.findMany({
      where: { trabajadorId },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  /**
   * Obtiene un bloqueo de horario por ID.
   */
  async obtenerBloqueoHorarioPorId(id: string): Promise<BloqueoHorario | null> {
    return await prisma.bloqueoHorario.findUnique({
      where: { id },
    });
  }

  /**
   * Verifica si existe un bloqueo de horario que se superpone con un rango dado.
   * Usado para validar disponibilidad.
   */
  async verificarBloqueoDentroDelRango(
    trabajadorId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<boolean> {
    const bloqueosEnRango = await prisma.bloqueoHorario.findFirst({
      where: {
        trabajadorId,
        OR: [
          {
            // Bloqueo inicia antes de que termine el rango
            AND: [
              { fechaInicio: { lt: fechaFin } },
              { fechaFin: { gt: fechaInicio } },
            ],
          },
        ],
      },
    });

    return bloqueosEnRango !== null;
  }

  /**
   * Crea un nuevo bloqueo de horario.
   */
  async crearBloqueoHorario(
    datos: Prisma.BloqueoHorarioCreateInput
  ): Promise<BloqueoHorario> {
    return await prisma.bloqueoHorario.create({
      data: datos,
    });
  }

  /**
   * Actualiza un bloqueo de horario.
   */
  async actualizarBloqueoHorario(
    id: string,
    datos: Prisma.BloqueoHorarioUpdateInput
  ): Promise<BloqueoHorario> {
    return await prisma.bloqueoHorario.update({
      where: { id },
      data: datos,
    });
  }

  /**
   * Elimina un bloqueo de horario.
   */
  async eliminarBloqueoHorario(id: string): Promise<BloqueoHorario> {
    return await prisma.bloqueoHorario.delete({
      where: { id },
    });
  }

  /**
   * Obtiene bloqueos de horario que están activos en una fecha específica.
   */
  async obtenerBloqueosActivos(
    trabajadorId: string,
    fecha: Date
  ): Promise<BloqueoHorario[]> {
    return await prisma.bloqueoHorario.findMany({
      where: {
        trabajadorId,
        fechaInicio: { lte: fecha },
        fechaFin: { gte: fecha },
      },
      orderBy: { fechaInicio: 'asc' },
    });
  }
}
