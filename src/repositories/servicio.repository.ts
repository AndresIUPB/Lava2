/**
 * Repository de Servicio
 * Encapsula todas las operaciones de base de datos para la entidad Servicio
 * usando Prisma Client
 *
 * Métodos:
 * - obtenerTodoLosServicios() - Obtiene todos los servicios activos
 * - obtenerServicioPorId() - Obtiene un servicio específico
 * - crearServicio() - Crea un nuevo servicio
 * - actualizarServicio() - Actualiza un servicio existente
 * - eliminarServicio() - Elimina un servicio (soft/hard)
 * - contarServiciosActivos() - Cuenta servicios activos
 */

import { PrismaClient, Servicio } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * Data Transfer Object para crear un servicio
 */
export interface CrearServicioDto {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  imagenUrl?: string;
  activo?: boolean;
}

/**
 * Data Transfer Object para actualizar un servicio
 */
export interface ActualizarServicioDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracionMinutos?: number;
  imagenUrl?: string;
  activo?: boolean;
}

/**
 * Opciones de consulta para obtener servicios
 */
export interface OpcionesConsultaServicio {
  activos?: boolean;
  pagina?: number;
  limite?: number;
}

export class ServicioRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Obtiene todos los servicios (opcionalmente filtrados por estado)
   *
   * @param opciones - Opciones de consulta (activos, paginación)
   * @returns Array de servicios
   * @throws Error si hay problema en la BD
   */
  async obtenerTodosLosServicios(
    opciones?: OpcionesConsultaServicio
  ): Promise<Servicio[]> {
    const { activos = true, pagina = 1, limite = 20 } = opciones || {};

    const skip = (pagina - 1) * limite;

    try {
      return await this.prisma.servicio.findMany({
        where: activos !== undefined ? { activo: activos } : undefined,
        take: limite,
        skip,
        orderBy: {
          nombre: 'asc',
        },
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al obtener servicios: ${mensaje}`);
    }
  }

  /**
   * Obtiene un servicio específico por su ID
   *
   * @param id - ID del servicio
   * @returns Servicio encontrado o null
   * @throws Error si hay problema en la BD
   */
  async obtenerServicioPorId(id: string): Promise<Servicio | null> {
    try {
      return await this.prisma.servicio.findUnique({
        where: { id },
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al obtener servicio: ${mensaje}`);
    }
  }

  /**
   * Busca servicios por nombre (búsqueda parcial)
   *
   * @param termino - Término de búsqueda
   * @param soloActivos - Si true, solo servicios activos
   * @returns Array de servicios que coinciden
   * @throws Error si hay problema en la BD
   */
  async buscarServiciosPorNombre(
    termino: string,
    soloActivos: boolean = true
  ): Promise<Servicio[]> {
    try {
      return await this.prisma.servicio.findMany({
        where: {
          AND: [
            {
              nombre: {
                contains: termino,
                mode: 'insensitive',
              },
            },
            soloActivos ? { activo: true } : {},
          ],
        },
        orderBy: {
          nombre: 'asc',
        },
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al buscar servicios: ${mensaje}`);
    }
  }

  /**
   * Crea un nuevo servicio
   *
   * @param datos - Datos del servicio a crear
   * @returns Servicio creado
   * @throws Error si hay problema en la BD
   */
  async crearServicio(datos: CrearServicioDto): Promise<Servicio> {
    try {
      return await this.prisma.servicio.create({
        data: {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio: datos.precio,
          duracionMinutos: datos.duracionMinutos,
          imagenUrl: datos.imagenUrl,
          activo: datos.activo ?? true,
        },
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al crear servicio: ${mensaje}`);
    }
  }

  /**
   * Actualiza un servicio existente
   *
   * @param id - ID del servicio a actualizar
   * @param datos - Datos a actualizar
   * @returns Servicio actualizado
   * @throws Error si hay problema en la BD
   */
  async actualizarServicio(
    id: string,
    datos: ActualizarServicioDto
  ): Promise<Servicio> {
    try {
      return await this.prisma.servicio.update({
        where: { id },
        data: datos,
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al actualizar servicio: ${mensaje}`);
    }
  }

  /**
   * Elimina un servicio (desactivación lógica)
   *
   * @param id - ID del servicio a eliminar
   * @returns Servicio eliminado (desactivado)
   * @throws Error si hay problema en la BD
   */
  async desactivarServicio(id: string): Promise<Servicio> {
    try {
      return await this.prisma.servicio.update({
        where: { id },
        data: { activo: false },
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al desactivar servicio: ${mensaje}`);
    }
  }

  /**
   * Cuenta la cantidad de servicios activos
   *
   * @returns Número de servicios activos
   * @throws Error si hay problema en la BD
   */
  async contarServiciosActivos(): Promise<number> {
    try {
      return await this.prisma.servicio.count({
        where: { activo: true },
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al contar servicios: ${mensaje}`);
    }
  }

  /**
   * Obtiene servicios con paginación completa
   *
   * @param pagina - Número de página
   * @param limite - Cantidad de registros por página
   * @returns Objeto con servicios y metadata
   * @throws Error si hay problema en la BD
   */
  async obtenerServiciosConPaginacion(
    pagina: number = 1,
    limite: number = 20
  ): Promise<{
    servicios: Servicio[];
    total: number;
    paginas: number;
  }> {
    try {
      const skip = (pagina - 1) * limite;

      const [servicios, total] = await Promise.all([
        this.prisma.servicio.findMany({
          where: { activo: true },
          take: limite,
          skip,
          orderBy: { nombre: 'asc' },
        }),
        this.prisma.servicio.count({ where: { activo: true } }),
      ]);

      return {
        servicios,
        total,
        paginas: Math.ceil(total / limite),
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al obtener servicios con paginación: ${mensaje}`);
    }
  }
}
