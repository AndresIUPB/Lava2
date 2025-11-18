/**
 * Datos de usuarios iniciales para la base de datos
 * Contiene 5 usuarios de prueba con información completa
 * IMPORTANTE: Las contraseñas deben hashearse en el script seed.ts
 */

export interface UsuarioSeed {
  email: string;
  passwordPlain: string; // Será hasheada en el seed
  nombreCompleto: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  ciudad: string;
  direccion: string;
  tipoVehiculo: string;
  placaVehiculo: string;
  cuidadoEspecial?: string;
}

export const usuarios: UsuarioSeed[] = [
  {
    email: 'juan.perez@example.com',
    passwordPlain: 'Password123!',
    nombreCompleto: 'Juan Andrés Pérez González',
    telefono: '+573101234567',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    ciudad: 'Medellín',
    direccion: 'Carrera 43 No. 15-123, Sabaneta',
    tipoVehiculo: 'carro',
    placaVehiculo: 'ABC123',
    cuidadoEspecial: 'Pintura delicada, usar productos suaves',
  },
  {
    email: 'maria.garcia@example.com',
    passwordPlain: 'SecurePass456!',
    nombreCompleto: 'María Claudia García López',
    telefono: '+573102345678',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567891',
    ciudad: 'Bogotá',
    direccion: 'Avenida Carrera 7 No. 45-67, Chapinero',
    tipoVehiculo: 'camioneta',
    placaVehiculo: 'DEF456',
    cuidadoEspecial: 'Sistema de aire acondicionado sensible',
  },
  {
    email: 'carlos.martinez@example.com',
    passwordPlain: 'MyPassword789!',
    nombreCompleto: 'Carlos Enrique Martínez Rodríguez',
    telefono: '+573103456789',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567892',
    ciudad: 'Cali',
    direccion: 'Calle 5 No. 25-45, Granada',
    tipoVehiculo: 'moto',
    placaVehiculo: 'GHI789',
    cuidadoEspecial: 'Cadena y piñón necesitan limpieza especial',
  },
  {
    email: 'sandra.lopez@example.com',
    passwordPlain: 'StrongPass101!',
    nombreCompleto: 'Sandra Isabel López Morales',
    telefono: '+573104567890',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567893',
    ciudad: 'Barranquilla',
    direccion: 'Carrera 52 No. 54-35, Riomar',
    tipoVehiculo: 'carro',
    placaVehiculo: 'JKL012',
    cuidadoEspecial: 'Interior de cuero requiere protección especial',
  },
  {
    email: 'david.sanchez@example.com',
    passwordPlain: 'TestPass2025!',
    nombreCompleto: 'David Fernando Sánchez Gómez',
    telefono: '+573105678901',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567894',
    ciudad: 'Bucaramanga',
    direccion: 'Calle 45 No. 20-40, Cabecera',
    tipoVehiculo: 'carro',
    placaVehiculo: 'MNO345',
    cuidadoEspecial: undefined,
  },
];
