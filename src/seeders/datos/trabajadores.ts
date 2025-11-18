/**
 * Datos de trabajadores iniciales para la base de datos
 * Contiene 8 trabajadores colombianos con horarios base configurados
 */

export interface TrabajadorSeed {
  nombreCompleto: string;
  telefono: string;
  fotoPerfil?: string;
  calificacionPromedio: number;
  activo: boolean;
  horarioLunes?: { inicio: string; fin: string } | null;
  horarioMartes?: { inicio: string; fin: string } | null;
  horarioMiercoles?: { inicio: string; fin: string } | null;
  horarioJueves?: { inicio: string; fin: string } | null;
  horarioViernes?: { inicio: string; fin: string } | null;
  horarioSabado?: { inicio: string; fin: string } | null;
  horarioDomingo?: { inicio: string; fin: string } | null;
}

const horarioLaboral = { inicio: '08:00', fin: '18:00' };
const horarioSabado = { inicio: '09:00', fin: '14:00' };
const horarioCerrado = null;

export const trabajadores: TrabajadorSeed[] = [
  {
    nombreCompleto: 'Juan Carlos Rodríguez López',
    telefono: '+573001234567',
    fotoPerfil: 'https://i.pravatar.cc/150?img=1',
    calificacionPromedio: 4.8,
    activo: true,
    horarioLunes: horarioLaboral,
    horarioMartes: horarioLaboral,
    horarioMiercoles: horarioLaboral,
    horarioJueves: horarioLaboral,
    horarioViernes: horarioLaboral,
    horarioSabado,
    horarioDomingo: horarioCerrado,
  },
  {
    nombreCompleto: 'María José García Gómez',
    telefono: '+573002345678',
    fotoPerfil: 'https://i.pravatar.cc/150?img=2',
    calificacionPromedio: 4.7,
    activo: true,
    horarioLunes: horarioLaboral,
    horarioMartes: horarioLaboral,
    horarioMiercoles: horarioLaboral,
    horarioJueves: horarioLaboral,
    horarioViernes: horarioLaboral,
    horarioSabado: horarioSabado,
    horarioDomingo: horarioCerrado,
  },
  {
    nombreCompleto: 'Carlos Eduardo Martínez Pérez',
    telefono: '+573003456789',
    fotoPerfil: 'https://i.pravatar.cc/150?img=3',
    calificacionPromedio: 4.6,
    activo: true,
    horarioLunes: horarioLaboral,
    horarioMartes: horarioLaboral,
    horarioMiercoles: horarioLaboral,
    horarioJueves: horarioLaboral,
    horarioViernes: horarioLaboral,
    horarioSabado: { inicio: '08:00', fin: '13:00' },
    horarioDomingo: horarioCerrado,
  },
  {
    nombreCompleto: 'Sandra Milena López Quintero',
    telefono: '+573004567890',
    fotoPerfil: 'https://i.pravatar.cc/150?img=4',
    calificacionPromedio: 4.9,
    activo: true,
    horarioLunes: horarioLaboral,
    horarioMartes: horarioLaboral,
    horarioMiercoles: horarioLaboral,
    horarioJueves: horarioLaboral,
    horarioViernes: horarioLaboral,
    horarioSabado: horarioSabado,
    horarioDomingo: { inicio: '10:00', fin: '14:00' },
  },
  {
    nombreCompleto: 'Andrés Felipe Sánchez Castro',
    telefono: '+573005678901',
    fotoPerfil: 'https://i.pravatar.cc/150?img=5',
    calificacionPromedio: 4.5,
    activo: true,
    horarioLunes: horarioLaboral,
    horarioMartes: horarioLaboral,
    horarioMiercoles: { inicio: '10:00', fin: '19:00' },
    horarioJueves: { inicio: '10:00', fin: '19:00' },
    horarioViernes: horarioLaboral,
    horarioSabado: horarioSabado,
    horarioDomingo: horarioCerrado,
  },
  {
    nombreCompleto: 'Oscar David Hernández Ruiz',
    telefono: '+573006789012',
    fotoPerfil: 'https://i.pravatar.cc/150?img=6',
    calificacionPromedio: 4.7,
    activo: true,
    horarioLunes: horarioLaboral,
    horarioMartes: horarioLaboral,
    horarioMiercoles: horarioLaboral,
    horarioJueves: horarioLaboral,
    horarioViernes: horarioLaboral,
    horarioSabado: { inicio: '07:00', fin: '15:00' },
    horarioDomingo: horarioCerrado,
  },
  {
    nombreCompleto: 'Paola Andrea Morales Velasco',
    telefono: '+573007890123',
    fotoPerfil: 'https://i.pravatar.cc/150?img=7',
    calificacionPromedio: 4.8,
    activo: true,
    horarioLunes: { inicio: '09:00', fin: '18:00' },
    horarioMartes: { inicio: '09:00', fin: '18:00' },
    horarioMiercoles: { inicio: '09:00', fin: '18:00' },
    horarioJueves: { inicio: '09:00', fin: '18:00' },
    horarioViernes: { inicio: '09:00', fin: '18:00' },
    horarioSabado: horarioSabado,
    horarioDomingo: horarioCerrado,
  },
  {
    nombreCompleto: 'Jorge Luis Diaz Castillo',
    telefono: '+573008901234',
    fotoPerfil: 'https://i.pravatar.cc/150?img=8',
    calificacionPromedio: 4.6,
    activo: true,
    horarioLunes: horarioLaboral,
    horarioMartes: horarioLaboral,
    horarioMiercoles: horarioLaboral,
    horarioJueves: horarioLaboral,
    horarioViernes: horarioLaboral,
    horarioSabado: horarioSabado,
    horarioDomingo: horarioCerrado,
  },
];
