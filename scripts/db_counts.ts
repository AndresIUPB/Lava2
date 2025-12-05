import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const servicios = await prisma.servicio.count();
    const trabajadores = await prisma.trabajador.count();
    const usuarios = await prisma.usuario.count();
    const metodosPago = await prisma.metodoPago.count();
    const reservaciones = await prisma.reservacion.count();
    const calificaciones = await prisma.calificacion.count();
    const notificaciones = await prisma.notificacion.count();

    console.log('Conteos en DB:');
    console.log('servicios:', servicios);
    console.log('trabajadores:', trabajadores);
    console.log('usuarios:', usuarios);
    console.log('metodosPago:', metodosPago);
    console.log('reservaciones:', reservaciones);
    console.log('calificaciones:', calificaciones);
    console.log('notificaciones:', notificaciones);
  } catch (err) {
    console.error('Error consultando DB:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
