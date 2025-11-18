/**
 * Datos de métodos de pago iniciales para la base de datos
 * Contiene métodos de pago asociados a usuarios específicos
 * Máximo 3 métodos por usuario según las reglas de negocio
 */

export interface MetodoPagoSeed {
  usuarioEmail: string; // Referencia al email del usuario para asociar
  tipo: string; // "tarjeta_credito", "tarjeta_debito", "pse", "efectivo"
  ultimos4Digitos?: string | undefined;
  nombreTitular?: string | undefined;
  fechaExpiracion?: string | undefined; // "MM/YY"
  marca?: string | undefined; // "Visa", "Mastercard", "American Express"
  esPrincipal: boolean;
  activo: boolean;
}

export const metodosPago: MetodoPagoSeed[] = [
  // Métodos de pago para juan.perez@example.com
  {
    usuarioEmail: 'juan.perez@example.com',
    tipo: 'tarjeta_credito',
    ultimos4Digitos: '1234',
    nombreTitular: 'Juan Andrés Pérez González',
    fechaExpiracion: '12/26',
    marca: 'Visa',
    esPrincipal: true,
    activo: true,
  },
  {
    usuarioEmail: 'juan.perez@example.com',
    tipo: 'tarjeta_debito',
    ultimos4Digitos: '5678',
    nombreTitular: 'Juan Andrés Pérez González',
    fechaExpiracion: '03/25',
    marca: 'Mastercard',
    esPrincipal: false,
    activo: true,
  },
  {
    usuarioEmail: 'juan.perez@example.com',
    tipo: 'pse',
    ultimos4Digitos: undefined,
    nombreTitular: undefined,
    fechaExpiracion: undefined,
    marca: undefined,
    esPrincipal: false,
    activo: true,
  },

  // Métodos de pago para maria.garcia@example.com
  {
    usuarioEmail: 'maria.garcia@example.com',
    tipo: 'tarjeta_credito',
    ultimos4Digitos: '9012',
    nombreTitular: 'María Claudia García López',
    fechaExpiracion: '08/27',
    marca: 'Mastercard',
    esPrincipal: true,
    activo: true,
  },
  {
    usuarioEmail: 'maria.garcia@example.com',
    tipo: 'efectivo',
    ultimos4Digitos: undefined,
    nombreTitular: undefined,
    fechaExpiracion: undefined,
    marca: undefined,
    esPrincipal: false,
    activo: true,
  },

  // Métodos de pago para carlos.martinez@example.com
  {
    usuarioEmail: 'carlos.martinez@example.com',
    tipo: 'tarjeta_credito',
    ultimos4Digitos: '3456',
    nombreTitular: 'Carlos Enrique Martínez Rodríguez',
    fechaExpiracion: '05/26',
    marca: 'American Express',
    esPrincipal: true,
    activo: true,
  },

  // Métodos de pago para sandra.lopez@example.com
  {
    usuarioEmail: 'sandra.lopez@example.com',
    tipo: 'tarjeta_debito',
    ultimos4Digitos: '7890',
    nombreTitular: 'Sandra Isabel López Morales',
    fechaExpiracion: '11/24',
    marca: 'Visa',
    esPrincipal: true,
    activo: true,
  },
  {
    usuarioEmail: 'sandra.lopez@example.com',
    tipo: 'pse',
    ultimos4Digitos: undefined,
    nombreTitular: undefined,
    fechaExpiracion: undefined,
    marca: undefined,
    esPrincipal: false,
    activo: true,
  },

  // Métodos de pago para david.sanchez@example.com
  {
    usuarioEmail: 'david.sanchez@example.com',
    tipo: 'tarjeta_credito',
    ultimos4Digitos: '2345',
    nombreTitular: 'David Fernando Sánchez Gómez',
    fechaExpiracion: '09/25',
    marca: 'Visa',
    esPrincipal: true,
    activo: true,
  },
  {
    usuarioEmail: 'david.sanchez@example.com',
    tipo: 'efectivo',
    ultimos4Digitos: undefined,
    nombreTitular: undefined,
    fechaExpiracion: undefined,
    marca: undefined,
    esPrincipal: false,
    activo: true,
  },
];
