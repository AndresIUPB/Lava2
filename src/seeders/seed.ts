/**
 * Script principal de seed para la base de datos
 * Popula la BD con datos iniciales de prueba
 *
 * Uso: npm run seed
 *
 * Este script:
 * - Valida que Prisma esté configurado correctamente
 * - Limpia datos existentes (opcional: solo en desarrollo)
 * - Inserta datos iniciales en orden de dependencias
 * - Maneja errores apropiadamente
 * - Imprime feedback de progreso
 */

import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { hashearPassword } from '../utils/password';
import { servicios } from './datos/servicios';
import { trabajadores } from './datos/trabajadores';
import { usuarios } from './datos/usuarios';
import { metodosPago } from './datos/metodosPago';

/**
 * Colores para salida en consola
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Imprime un mensaje de log con formato
 */
const log = (mensaje: string, color: string = colors.reset): void => {
  console.log(`${color}${mensaje}${colors.reset}`);
};

/**
 * Imprime un mensaje de error
 */
const error = (mensaje: string): void => {
  console.error(`${colors.bright}${colors.cyan}[ERROR]${colors.reset} ${mensaje}`);
};

/**
 * Imprime un mensaje de éxito
 */
const success = (mensaje: string): void => {
  console.log(`${colors.bright}${colors.green}✓${colors.reset} ${mensaje}`);
};

/**
 * Imprime un mensaje de progreso
 */
const progress = (mensaje: string): void => {
  console.log(`${colors.bright}${colors.blue}→${colors.reset} ${mensaje}`);
};

/**
 * Imprime un encabezado de sección
 */
const section = (titulo: string): void => {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${titulo}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
};

/**
 * Limpia la base de datos (solo en desarrollo)
 */
const limpiarBaseDatos = async (): Promise<void> => {
  section('LIMPIANDO BASE DE DATOS');

  try {
    // Orden importante: eliminar tablas con relaciones primero
    progress('Eliminando calificaciones...');
    await prisma.calificacion.deleteMany({});

    progress('Eliminando métodos de pago...');
    await prisma.metodoPago.deleteMany({});

    progress('Eliminando reservaciones...');
    await prisma.reservacion.deleteMany({});

    progress('Eliminando bloqueos de horario...');
    await prisma.bloqueoHorario.deleteMany({});

    progress('Eliminando trabajadores...');
    await prisma.trabajador.deleteMany({});

    progress('Eliminando servicios...');
    await prisma.servicio.deleteMany({});

    progress('Eliminando refresh tokens...');
    await prisma.refreshToken.deleteMany({});

    progress('Eliminando usuarios...');
    await prisma.usuario.deleteMany({});

    success('Base de datos limpia correctamente');
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido';
    throw new Error(`Error limpiando base de datos: ${mensaje}`);
  }
};

/**
 * Inserta los servicios en la base de datos
 */
const seedServicios = async (): Promise<void> => {
  section('INSERTANDO SERVICIOS');

  try {
    for (const servicio of servicios) {
      progress(`Creando servicio: ${servicio.nombre}`);

      await prisma.servicio.create({
        data: {
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          precio: servicio.precio,
          duracionMinutos: servicio.duracionMinutos,
          imagenUrl: servicio.imagenUrl,
          activo: servicio.activo,
        },
      });
    }

    success(`${servicios.length} servicios insertados correctamente`);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido';
    throw new Error(`Error insertando servicios: ${mensaje}`);
  }
};

/**
 * Inserta los trabajadores en la base de datos
 */
const seedTrabajadores = async (): Promise<void> => {
  section('INSERTANDO TRABAJADORES');

  try {
    for (const trabajador of trabajadores) {
      progress(`Creando trabajador: ${trabajador.nombreCompleto}`);

      await prisma.trabajador.create({
        data: {
          nombreCompleto: trabajador.nombreCompleto,
          telefono: trabajador.telefono,
          fotoPerfil: trabajador.fotoPerfil,
          calificacionPromedio: trabajador.calificacionPromedio,
          activo: trabajador.activo,
          horarioLunes: (trabajador.horarioLunes as Prisma.InputJsonValue) || Prisma.JsonNull,
          horarioMartes: (trabajador.horarioMartes as Prisma.InputJsonValue) || Prisma.JsonNull,
          horarioMiercoles: (trabajador.horarioMiercoles as Prisma.InputJsonValue) || Prisma.JsonNull,
          horarioJueves: (trabajador.horarioJueves as Prisma.InputJsonValue) || Prisma.JsonNull,
          horarioViernes: (trabajador.horarioViernes as Prisma.InputJsonValue) || Prisma.JsonNull,
          horarioSabado: (trabajador.horarioSabado as Prisma.InputJsonValue) || Prisma.JsonNull,
          horarioDomingo: (trabajador.horarioDomingo as Prisma.InputJsonValue) || Prisma.JsonNull,
        },
      });
    }

    success(`${trabajadores.length} trabajadores insertados correctamente`);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido';
    throw new Error(`Error insertando trabajadores: ${mensaje}`);
  }
};

/**
 * Inserta los usuarios en la base de datos
 */
const seedUsuarios = async (): Promise<void> => {
  section('INSERTANDO USUARIOS');

  try {
    for (const usuario of usuarios) {
      progress(`Creando usuario: ${usuario.email}`);

      // Hashear contraseña
      const passwordHash = await hashearPassword(usuario.passwordPlain);

      await prisma.usuario.create({
        data: {
          email: usuario.email,
          passwordHash,
          nombreCompleto: usuario.nombreCompleto,
          telefono: usuario.telefono,
          tipoDocumento: usuario.tipoDocumento,
          numeroDocumento: usuario.numeroDocumento,
          ciudad: usuario.ciudad,
          direccion: usuario.direccion,
          tipoVehiculo: usuario.tipoVehiculo,
          placaVehiculo: usuario.placaVehiculo,
          cuidadoEspecial: usuario.cuidadoEspecial,
        },
      });
    }

    success(`${usuarios.length} usuarios insertados correctamente`);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido';
    throw new Error(`Error insertando usuarios: ${mensaje}`);
  }
};

/**
 * Inserta los métodos de pago en la base de datos
 */
const seedMetodosPago = async (): Promise<void> => {
  section('INSERTANDO MÉTODOS DE PAGO');

  try {
    for (const metodo of metodosPago) {
      // Buscar el usuario por email
      const usuario = await prisma.usuario.findUnique({
        where: { email: metodo.usuarioEmail },
      });

      if (!usuario) {
        error(`Usuario no encontrado: ${metodo.usuarioEmail}`);
        continue;
      }

      progress(
        `Agregando ${metodo.tipo} a ${metodo.usuarioEmail} (Principal: ${metodo.esPrincipal})`
      );

      await prisma.metodoPago.create({
        data: {
          usuarioId: usuario.id,
          tipo: metodo.tipo,
          ultimos4Digitos: metodo.ultimos4Digitos,
          nombreTitular: metodo.nombreTitular,
          fechaExpiracion: metodo.fechaExpiracion,
          marca: metodo.marca,
          esPrincipal: metodo.esPrincipal,
          activo: metodo.activo,
        },
      });
    }

    success(`${metodosPago.length} métodos de pago insertados correctamente`);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido';
    throw new Error(`Error insertando métodos de pago: ${mensaje}`);
  }
};

/**
 * Función principal que ejecuta el seed
 */
const main = async (): Promise<void> => {
  log('\n' + '█'.repeat(60) + '\n', colors.bright + colors.cyan);
  log('  SCRIPT DE SEED - LAVA 2 DATABASE\n', colors.bright + colors.cyan);
  log('█'.repeat(60), colors.bright + colors.cyan);

  try {
    // Validar conexión a Prisma
    progress('Validando conexión a base de datos...');
    await prisma.$queryRaw`SELECT 1`;
    success('Conexión validada correctamente');

    // Mostrar información del entorno
    log(`\nEntorno: ${process.env.NODE_ENV || 'development'}`, colors.yellow);

    // Limpiar base de datos
    await limpiarBaseDatos();

    // Ejecutar seeds en orden de dependencias
    await seedServicios();
    await seedTrabajadores();
    await seedUsuarios();
    await seedMetodosPago();

    // Resumen final
    section('RESUMEN DEL SEED');
    success(`✓ Servicios: ${servicios.length} registros`);
    success(`✓ Trabajadores: ${trabajadores.length} registros`);
    success(`✓ Usuarios: ${usuarios.length} registros`);
    success(`✓ Métodos de Pago: ${metodosPago.length} registros`);

    log('\n' + '█'.repeat(60), colors.bright + colors.green);
    log('  SEED COMPLETADO EXITOSAMENTE\n', colors.bright + colors.green);
    log('█'.repeat(60) + '\n', colors.bright + colors.green);

    process.exit(0);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido';
    error(`Error durante el seed: ${mensaje}`);

    log('\n' + '█'.repeat(60), colors.bright + 'Error');
    log('  SEED FALLÓ\n', colors.bright + 'Error');
    log('█'.repeat(60) + '\n', colors.bright + 'Error');

    process.exit(1);
  } finally {
    // Cerrar conexión a Prisma
    await prisma.$disconnect();
  }
};

// Ejecutar el script
main();
