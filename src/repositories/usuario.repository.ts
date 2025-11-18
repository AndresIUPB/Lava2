import { PrismaClient, Usuario, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * Repository de Usuario
 *
 * Encapsula todas las operaciones de Prisma relacionadas con la entidad Usuario.
 * Proporciona métodos CRUD y queries específicas para la gestión de usuarios.
 *
 * NO contiene lógica de negocio - solo operaciones de base de datos.
 */
export class UsuarioRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Crea un nuevo usuario en la base de datos.
   *
   * @param datosCreacion - Datos del usuario a crear (sin ID ni timestamps)
   * @returns El usuario creado con todos sus datos
   * @throws Error si hay violación de constraints (email o documento duplicados)
   */
  async crearUsuario(
    datosCreacion: Prisma.UsuarioCreateInput
  ): Promise<Usuario> {
    return await this.prisma.usuario.create({
      data: datosCreacion,
    });
  }

  /**
   * Obtiene un usuario por su ID.
   *
   * Incluye la relación de métodos de pago asociados al usuario.
   *
   * @param id - ID único del usuario (UUID)
   * @returns El usuario encontrado con sus métodos de pago, o null si no existe
   */
  async obtenerUsuarioPorId(id: string): Promise<
    (Usuario & {
      metodosPago: Array<{
        id: string;
        tipo: string;
        ultimos4Digitos: string | null;
        esPrincipal: boolean;
        activo: boolean;
      }>;
    }) | null
  > {
    return await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        metodosPago: {
          select: {
            id: true,
            tipo: true,
            ultimos4Digitos: true,
            esPrincipal: true,
            activo: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene un usuario por su email.
   *
   * Utilizado principalmente en autenticación y validación de duplicados.
   *
   * @param email - Email del usuario
   * @returns El usuario encontrado, o null si no existe
   */
  async obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
    return await this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  /**
   * Obtiene un usuario por su número de documento.
   *
   * Valida que no existan documentos duplicados en el sistema.
   *
   * @param numeroDocumento - Número de identificación del usuario
   * @returns El usuario encontrado, o null si no existe
   */
  async obtenerUsuarioPorNumeroDocumento(
    numeroDocumento: string
  ): Promise<Usuario | null> {
    return await this.prisma.usuario.findUnique({
      where: { numeroDocumento },
    });
  }

  /**
   * Actualiza los datos de un usuario existente.
   *
   * El timestamp `actualizadoEn` se actualiza automáticamente.
   *
   * @param id - ID del usuario a actualizar
   * @param datosActualizacion - Datos parciales a actualizar
   * @returns El usuario actualizado con todos sus datos
   * @throws Error si el usuario no existe o hay violación de constraints
   */
  async actualizarUsuario(
    id: string,
    datosActualizacion: Prisma.UsuarioUpdateInput
  ): Promise<Usuario> {
    return await this.prisma.usuario.update({
      where: { id },
      data: datosActualizacion,
    });
  }

  /**
   * Elimina un usuario de la base de datos.
   *
   * Se ejecutan eliminaciones en cascada automáticamente:
   * - Todas las reservaciones del usuario
   * - Todos los métodos de pago
   * - Todas las calificaciones realizadas
   * - Todas las notificaciones
   *
   * @param id - ID del usuario a eliminar
   * @throws Error si el usuario no existe
   */
  async eliminarUsuario(id: string): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id },
    });
  }

  /**
   * Cuenta la cantidad de métodos de pago activos de un usuario.
   *
   * Se utiliza para validar el límite de 3 métodos de pago por usuario.
   *
   * @param usuarioId - ID del usuario
   * @returns Cantidad de métodos de pago activos (0-3)
   */
  async contarMetodosPagoPorUsuario(usuarioId: string): Promise<number> {
    return await this.prisma.metodoPago.count({
      where: {
        usuarioId,
        activo: true,
      },
    });
  }
}