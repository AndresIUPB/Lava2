/**
 * Datos de servicios iniciales para la base de datos
 * Contiene 7 servicios de lavado con precios y duraciones realistas
 */

export interface ServicioSeed {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  imagenUrl?: string;
  activo: boolean;
}

export const servicios: ServicioSeed[] = [
  {
    nombre: 'Lavado Básico',
    descripcion: 'Lavado completo del vehículo con agua y jabón especializado. Incluye limpieza exterior y secado.',
    precio: 30000,
    duracionMinutos: 45,
    imagenUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
    activo: true,
  },
  {
    nombre: 'Lavado Premium',
    descripcion: 'Lavado profesional con productos premium. Incluye limpieza de llantas, limpieza interior básica y protectores.',
    precio: 50000,
    duracionMinutos: 60,
    imagenUrl: 'https://images.unsplash.com/photo-1517521271051-22d0c08a0b6a?w=400',
    activo: true,
  },
  {
    nombre: 'Pulido y Encerado',
    descripcion: 'Pulido profesional de pintura y aplicación de cera protectora de larga duración.',
    precio: 80000,
    duracionMinutos: 90,
    imagenUrl: 'https://images.unsplash.com/photo-1469994DC0CA-1B3BFC509B1C?w=400',
    activo: true,
  },
  {
    nombre: 'Limpieza Interior Profunda',
    descripcion: 'Limpieza completa del interior: asientos, alfombras, tapicería y desinfección.',
    precio: 60000,
    duracionMinutos: 75,
    imagenUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bbb20?w=400',
    activo: true,
  },
  {
    nombre: 'Protección Cerámica',
    descripcion: 'Aplicación de revestimiento cerámico profesional para protección duradera de la pintura.',
    precio: 120000,
    duracionMinutos: 120,
    imagenUrl: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400',
    activo: true,
  },
  {
    nombre: 'Detallado Completo',
    descripcion: 'Servicio completo: lavado exterior, interior, pulido y encerado. El más completo de nuestro catálogo.',
    precio: 150000,
    duracionMinutos: 180,
    imagenUrl: 'https://images.unsplash.com/photo-1528148343865-45218e90a32f?w=400',
    activo: true,
  },
  {
    nombre: 'Lavado Moto',
    descripcion: 'Lavado especializado para motocicletas. Incluye desengrasante y protectores especiales.',
    precio: 25000,
    duracionMinutos: 30,
    imagenUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    activo: true,
  },
];
