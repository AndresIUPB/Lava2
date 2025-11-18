import { Prisma, Trabajador } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * Repositorio para operaciones de base de datos relacionadas con Trabajador.
 * Encapsula todas las consultas de Prisma para la entidad Trabajador.
 */
export class TrabajadorRepository {
  /**
   * Obtiene todos los trabajadores activos con paginación.
   */
  async obtenerTodosTrabajadores(
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ datos: Trabajador[]; total: number }> {
    const saltar = (pagina - 1) * limite;

    const [datos, total] = await Promise.all([
      prisma.trabajador.findMany({
        where: { activo: true },
        skip: saltar,
        take: limite,
        orderBy: { nombreCompleto: 'asc' },
      }),
      prisma.trabajador.count({
        where: { activo: true },
      }),
    ]);

    return { datos, total };
  }

  /**
   * Obtiene un trabajador por ID.
   */
  async obtenerTrabajadorPorId(id: string): Promise<Trabajador | null> {
    return await prisma.trabajador.findUnique({
      where: { id },
      include: {
        bloqueosHorario: true,
      },
    });
  }

  /**
   * Busca trabajadores por nombre (búsqueda parcial case-insensitive).
   */
  async buscarTrabajadoresPorNombre(
    termino: string,
    pagina: number = 1,
    limite: number = 20
  ): Promise<{ datos: Trabajador[]; total: number }> {
    const saltar = (pagina - 1) * limite;

    const [datos, total] = await Promise.all([
      prisma.trabajador.findMany({
        where: {
          activo: true,
          nombreCompleto: {
            contains: termino,
            mode: 'insensitive',
          },
        },
        skip: saltar,
        take: limite,
        orderBy: { nombreCompleto: 'asc' },
      }),
      prisma.trabajador.count({
        where: {
          activo: true,
          nombreCompleto: {
            contains: termino,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return { datos, total };
  }

  /**
   * Obtiene todos los trabajadores activos sin paginación (para listar disponibles).
   */
  async obtenerTrabajadoresActivos(): Promise<Trabajador[]> {
    return await prisma.trabajador.findMany({
      where: { activo: true },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  /**
   * Obtiene la cantidad de trabajadores activos.
   */
  async contarTrabajadoresActivos(): Promise<number> {
    return await prisma.trabajador.count({
      where: { activo: true },
    });
  }

  /**
   * Obtiene un trabajador sin validación (incluyendo inactivos).
   * Usado internamente para validaciones que requieren verificar estado.
   */
  async obtenerTrabajadorSinValidar(id: string): Promise<Trabajador | null> {
    return await prisma.trabajador.findUnique({
      where: { id },
    });
  }

  /**
   * Crea un nuevo trabajador.
   */
  async crearTrabajador(datos: Prisma.TrabajadorCreateInput): Promise<Trabajador> {
    return await prisma.trabajador.create({
      data: datos,
    });
  }

  /**
   * Actualiza un trabajador.
   */
  async actualizarTrabajador(
    id: string,
    datos: Prisma.TrabajadorUpdateInput
  ): Promise<Trabajador> {
    return await prisma.trabajador.update({
      where: { id },
      data: datos,
    });
  }

  /**
   * Desactiva un trabajador (soft delete).
   */
  async desactivarTrabajador(id: string): Promise<Trabajador> {
    return await prisma.trabajador.update({
      where: { id },
      data: { activo: false },
    });
  }

  /**
   * Obtiene trabajadores con calificación promedio >= minCalificacion.
   */
  async obtenerTrabajadoresConCalificacionMinima(
    minCalificacion: number
  ): Promise<Trabajador[]> {
    return await prisma.trabajador.findMany({
      where: {
        activo: true,
        calificacionPromedio: {
          gte: minCalificacion,
        },
      },
      orderBy: { calificacionPromedio: 'desc' },
    });
  }
}
