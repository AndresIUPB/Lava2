// ============================================
// ENUMS DEL SISTEMA
// ============================================

export enum TipoDocumento {
  CC = 'CC',
  CE = 'CE',
  PASAPORTE = 'Pasaporte'
}

export enum TipoVehiculo {
  CARRO = 'carro',
  MOTO = 'moto',
  CAMIONETA = 'camioneta'
}

export enum EstadoReservacion {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TipoMetodoPago {
  TARJETA_CREDITO = 'tarjeta_credito',
  TARJETA_DEBITO = 'tarjeta_debito',
  PSE = 'pse',
  EFECTIVO = 'efectivo'
}

export enum TipoNotificacion {
  RESERVACION = 'reservacion',
  CALIFICACION = 'calificacion',
  PROMOCION = 'promocion',
  SISTEMA = 'sistema'
}
