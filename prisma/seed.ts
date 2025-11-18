import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes
  console.log('🗑️ Limpiando datos existentes...');
  await prisma.calificacion.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.metodoPago.deleteMany();
  await prisma.reservacion.deleteMany();
  await prisma.bloqueoHorario.deleteMany();
  await prisma.trabajador.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.usuario.deleteMany();

  // ==================== CREAR SERVICIOS ====================
  console.log('📋 Creando servicios...');
  const servicios = await prisma.servicio.createMany({
    data: [
      {
        nombre: 'Lavado Estándar',
        descripcion: 'Lavado exterior completo, secado y aspirado interior',
        precio: 50000,
        duracionMinutos: 60,
        imagenUrl: '/images/lavado-estandar.jpg',
        activo: true,
      },
      {
        nombre: 'Lavado Premium',
        descripcion: 'Lavado completo + encerrado + limpieza profunda interior',
        precio: 85000,
        duracionMinutos: 90,
        imagenUrl: '/images/lavado-premium.jpg',
        activo: true,
      },
      {
        nombre: 'Lavado Express',
        descripcion: 'Lavado rápido sin tratamiento adicional',
        precio: 35000,
        duracionMinutos: 40,
        imagenUrl: '/images/lavado-express.jpg',
        activo: true,
      },
      {
        nombre: 'Detallado Completo',
        descripcion: 'Lavado + pulido + encerado + tratamiento interior',
        precio: 120000,
        duracionMinutos: 120,
        imagenUrl: '/images/detallado-completo.jpg',
        activo: true,
      },
      {
        nombre: 'Limpieza Moto',
        descripcion: 'Lavado especializado para motos',
        precio: 30000,
        duracionMinutos: 45,
        imagenUrl: '/images/lavado-moto.jpg',
        activo: true,
      },
    ],
  });
  console.log(`✅ ${servicios.count} servicios creados`);

  // ==================== CREAR TRABAJADORES ====================
  console.log('👨‍🔧 Creando trabajadores...');
  const trabajadores = await Promise.all([
    prisma.trabajador.create({
      data: {
        nombreCompleto: 'Carlos Mendez',
        telefono: '+573001234567',
        fotoPerfil: '/images/trabajador-1.jpg',
        calificacionPromedio: new Decimal(4.8),
        activo: true,
        horarioLunes: { inicio: '08:00', fin: '18:00' },
        horarioMartes: { inicio: '08:00', fin: '18:00' },
        horarioMiercoles: { inicio: '08:00', fin: '18:00' },
        horarioJueves: { inicio: '08:00', fin: '18:00' },
        horarioViernes: { inicio: '08:00', fin: '18:00' },
        horarioSabado: { inicio: '09:00', fin: '16:00' },
        horarioDomingo: null,
      },
    }),
    prisma.trabajador.create({
      data: {
        nombreCompleto: 'Juan Rodriguez',
        telefono: '+573002234567',
        fotoPerfil: '/images/trabajador-2.jpg',
        calificacionPromedio: new Decimal(4.5),
        activo: true,
        horarioLunes: { inicio: '07:00', fin: '17:00' },
        horarioMartes: { inicio: '07:00', fin: '17:00' },
        horarioMiercoles: { inicio: '07:00', fin: '17:00' },
        horarioJueves: { inicio: '07:00', fin: '17:00' },
        horarioViernes: { inicio: '07:00', fin: '17:00' },
        horarioSabado: null,
        horarioDomingo: null,
      },
    }),
    prisma.trabajador.create({
      data: {
        nombreCompleto: 'Maria Garcia',
        telefono: '+573003234567',
        fotoPerfil: '/images/trabajador-3.jpg',
        calificacionPromedio: new Decimal(4.9),
        activo: true,
        horarioLunes: { inicio: '09:00', fin: '19:00' },
        horarioMartes: { inicio: '09:00', fin: '19:00' },
        horarioMiercoles: { inicio: '09:00', fin: '19:00' },
        horarioJueves: { inicio: '09:00', fin: '19:00' },
        horarioViernes: { inicio: '09:00', fin: '19:00' },
        horarioSabado: { inicio: '09:00', fin: '18:00' },
        horarioDomingo: { inicio: '10:00', fin: '16:00' },
      },
    }),
    prisma.trabajador.create({
      data: {
        nombreCompleto: 'Pedro Lopez',
        telefono: '+573004234567',
        fotoPerfil: '/images/trabajador-4.jpg',
        calificacionPromedio: new Decimal(4.3),
        activo: true,
        horarioLunes: { inicio: '08:00', fin: '18:00' },
        horarioMartes: { inicio: '08:00', fin: '18:00' },
        horarioMiercoles: null,
        horarioJueves: { inicio: '08:00', fin: '18:00' },
        horarioViernes: { inicio: '08:00', fin: '18:00' },
        horarioSabado: { inicio: '09:00', fin: '17:00' },
        horarioDomingo: null,
      },
    }),
    prisma.trabajador.create({
      data: {
        nombreCompleto: 'Ana Martinez',
        telefono: '+573005234567',
        fotoPerfil: '/images/trabajador-5.jpg',
        calificacionPromedio: new Decimal(4.6),
        activo: true,
        horarioLunes: { inicio: '07:00', fin: '19:00' },
        horarioMartes: { inicio: '07:00', fin: '19:00' },
        horarioMiercoles: { inicio: '07:00', fin: '19:00' },
        horarioJueves: { inicio: '07:00', fin: '19:00' },
        horarioViernes: { inicio: '07:00', fin: '19:00' },
        horarioSabado: { inicio: '09:00', fin: '18:00' },
        horarioDomingo: null,
      },
    }),
  ]);
  console.log(`✅ ${trabajadores.length} trabajadores creados`);

  // ==================== CREAR USUARIOS ====================
  console.log('👥 Creando usuarios...');
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('Password123!', saltRounds);

  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        email: 'usuario1@lava2.com',
        passwordHash: hashedPassword,
        nombreCompleto: 'Roberto Ruiz',
        telefono: '+573101234567',
        fotoPerfil: null,
        tipoDocumento: 'CC',
        numeroDocumento: '1023456789',
        ciudad: 'Medellín',
        direccion: 'Calle 50 #45-30 Apto 502',
        tipoVehiculo: 'carro',
        placaVehiculo: 'ABC123',
        cuidadoEspecial: null,
      },
    }),
    prisma.usuario.create({
      data: {
        email: 'usuario2@lava2.com',
        passwordHash: hashedPassword,
        nombreCompleto: 'Sofia Gonzalez',
        telefono: '+573102234567',
        fotoPerfil: null,
        tipoDocumento: 'CC',
        numeroDocumento: '1033456789',
        ciudad: 'Medellín',
        direccion: 'Carrera 80 #40-50 Torre 2',
        tipoVehiculo: 'moto',
        placaVehiculo: 'XYZ789',
        cuidadoEspecial: 'Pintura delicada',
      },
    }),
    prisma.usuario.create({
      data: {
        email: 'usuario3@lava2.com',
        passwordHash: hashedPassword,
        nombreCompleto: 'Miguel Sanchez',
        telefono: '+573103234567',
        fotoPerfil: null,
        tipoDocumento: 'CC',
        numeroDocumento: '1043456789',
        ciudad: 'Medellín',
        direccion: 'Av. Oriental #80-15',
        tipoVehiculo: 'camioneta',
        placaVehiculo: 'MNO456',
        cuidadoEspecial: null,
      },
    }),
  ]);
  console.log(`✅ ${usuarios.length} usuarios creados`);

  // ==================== CREAR MÉTODOS DE PAGO ====================
  console.log('💳 Creando métodos de pago...');
  await prisma.metodoPago.createMany({
    data: [
      {
        usuarioId: usuarios[0].id,
        tipo: 'tarjeta_credito',
        ultimos4Digitos: '1234',
        nombreTitular: 'Roberto Ruiz',
        fechaExpiracion: '12/25',
        marca: 'Visa',
        esPrincipal: true,
        activo: true,
      },
      {
        usuarioId: usuarios[0].id,
        tipo: 'pse',
        ultimos4Digitos: null,
        nombreTitular: null,
        fechaExpiracion: null,
        marca: null,
        esPrincipal: false,
        activo: true,
      },
      {
        usuarioId: usuarios[1].id,
        tipo: 'tarjeta_debito',
        ultimos4Digitos: '5678',
        nombreTitular: 'Sofia Gonzalez',
        fechaExpiracion: '06/24',
        marca: 'Mastercard',
        esPrincipal: true,
        activo: true,
      },
      {
        usuarioId: usuarios[2].id,
        tipo: 'efectivo',
        ultimos4Digitos: null,
        nombreTitular: null,
        fechaExpiracion: null,
        marca: null,
        esPrincipal: true,
        activo: true,
      },
    ],
  });
  console.log(`✅ 4 métodos de pago creados`);

  // ==================== CREAR RESERVACIONES ====================
  console.log('📅 Creando reservaciones...');
  const serviciosTodos = await prisma.servicio.findMany();

  // Crear algunas reservaciones completadas y algunas pendientes
  const ahora = new Date();
  const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dentro7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

  const reservaciones = await Promise.all([
    // Reservación completada hace 15 días
    prisma.reservacion.create({
      data: {
        usuarioId: usuarios[0].id,
        servicioId: serviciosTodos[0].id,
        trabajadorId: trabajadores[0].id,
        fechaHoraInicio: new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000),
        fechaHoraFin: new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        direccionServicio: 'Calle 50 #45-30 Apto 502',
        estado: 'completed',
        precioFinal: 50000,
        completadoEn: new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000 + 70 * 60 * 1000),
      },
    }),
    // Reservación completada hace 20 días
    prisma.reservacion.create({
      data: {
        usuarioId: usuarios[1].id,
        servicioId: serviciosTodos[2].id,
        trabajadorId: trabajadores[2].id,
        fechaHoraInicio: new Date(ahora.getTime() - 20 * 24 * 60 * 60 * 1000),
        fechaHoraFin: new Date(ahora.getTime() - 20 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        direccionServicio: 'Carrera 80 #40-50 Torre 2',
        estado: 'completed',
        precioFinal: 35000,
        completadoEn: new Date(ahora.getTime() - 20 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      },
    }),
    // Reservación en progreso hace 2 días
    prisma.reservacion.create({
      data: {
        usuarioId: usuarios[2].id,
        servicioId: serviciosTodos[1].id,
        trabajadorId: trabajadores[1].id,
        fechaHoraInicio: new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000),
        fechaHoraFin: new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        direccionServicio: 'Av. Oriental #80-15',
        estado: 'completed',
        precioFinal: 85000,
        completadoEn: new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000 + 100 * 60 * 1000),
      },
    }),
    // Reservación confirmada para dentro de 7 días
    prisma.reservacion.create({
      data: {
        usuarioId: usuarios[0].id,
        servicioId: serviciosTodos[3].id,
        trabajadorId: trabajadores[2].id,
        fechaHoraInicio: dentro7Dias,
        fechaHoraFin: new Date(dentro7Dias.getTime() + 120 * 60 * 1000),
        direccionServicio: 'Calle 50 #45-30 Apto 502',
        estado: 'confirmed',
        precioFinal: 120000,
      },
    }),
  ]);
  console.log(`✅ ${reservaciones.length} reservaciones creadas`);

  // ==================== CREAR CALIFICACIONES ====================
  console.log('⭐ Creando calificaciones...');
  await prisma.calificacion.createMany({
    data: [
      {
        usuarioId: usuarios[0].id,
        reservacionId: reservaciones[0].id,
        trabajadorId: trabajadores[0].id,
        calificacionServicio: 5,
        calificacionTrabajador: 5,
        comentarioServicio: 'Excelente servicio, muy satisfecho',
        comentarioTrabajador: 'Trabajador muy profesional y responsable',
      },
      {
        usuarioId: usuarios[1].id,
        reservacionId: reservaciones[1].id,
        trabajadorId: trabajadores[2].id,
        calificacionServicio: 4,
        calificacionTrabajador: 4,
        comentarioServicio: 'Buen servicio, la moto quedó impecable',
        comentarioTrabajador: 'Muy atento, llegó a la hora',
      },
      {
        usuarioId: usuarios[2].id,
        reservacionId: reservaciones[2].id,
        trabajadorId: trabajadores[1].id,
        calificacionServicio: 5,
        calificacionTrabajador: 5,
        comentarioServicio: 'Perfecto, la camioneta brilla',
        comentarioTrabajador: 'Excelente profesionalismo',
      },
    ],
  });
  console.log(`✅ 3 calificaciones creadas`);

  // ==================== CREAR NOTIFICACIONES ====================
  console.log('🔔 Creando notificaciones...');
  await prisma.notificacion.createMany({
    data: [
      {
        usuarioId: usuarios[0].id,
        titulo: 'Reservación confirmada',
        mensaje: 'Tu reservación para el 15 de noviembre ha sido confirmada',
        tipo: 'reservacion',
        leida: true,
      },
      {
        usuarioId: usuarios[0].id,
        titulo: 'Trabajador asignado',
        mensaje: 'Carlos Mendez ha sido asignado a tu reservación',
        tipo: 'reservacion',
        leida: true,
      },
      {
        usuarioId: usuarios[0].id,
        titulo: 'Reservación completada',
        mensaje: 'Tu servicio de lavado ha sido completado exitosamente',
        tipo: 'reservacion',
        leida: true,
      },
      {
        usuarioId: usuarios[0].id,
        titulo: 'Calificación pendiente',
        mensaje: 'Por favor califica tu experiencia con el servicio',
        tipo: 'calificacion',
        leida: true,
      },
      {
        usuarioId: usuarios[0].id,
        titulo: 'Nueva reservación',
        mensaje: 'Tu próxima reservación será en 7 días',
        tipo: 'reservacion',
        leida: false,
      },
      {
        usuarioId: usuarios[1].id,
        titulo: 'Bienvenida a LAVA 2',
        mensaje: 'Bienvenida Sofia, estamos listos para servirte',
        tipo: 'sistema',
        leida: false,
      },
      {
        usuarioId: usuarios[2].id,
        titulo: 'Promoción especial',
        mensaje: 'Disfruta 20% de descuento en tu próximo lavado',
        tipo: 'promocion',
        leida: false,
      },
    ],
  });
  console.log(`✅ 7 notificaciones creadas`);

  console.log('✨ Seed completado exitosamente!');
}

// Importar Decimal si es necesario
import { Decimal } from '@prisma/client/runtime/library';

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
