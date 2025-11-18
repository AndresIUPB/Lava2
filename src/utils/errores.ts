// ============================================
// CLASES DE ERROR PERSONALIZADAS
// ============================================

export class ErrorBase extends Error {
  public readonly codigoEstado: number;
  public readonly esOperacional: boolean;

  constructor(mensaje: string, codigoEstado: number, esOperacional: boolean = true) {
    super(mensaje);
    Object.setPrototypeOf(this, new.target.prototype);

    this.codigoEstado = codigoEstado;
    this.esOperacional = esOperacional;

    Error.captureStackTrace(this);
  }
}

export class ErrorValidacion extends ErrorBase {
  constructor(mensaje: string = 'Error de validación') {
    super(mensaje, 400);
  }
}

export class ErrorNoEncontrado extends ErrorBase {
  constructor(mensaje: string = 'Recurso no encontrado') {
    super(mensaje, 404);
  }
}

export class ErrorNoAutorizado extends ErrorBase {
  constructor(mensaje: string = 'No autorizado') {
    super(mensaje, 401);
  }
}

export class ErrorProhibido extends ErrorBase {
  constructor(mensaje: string = 'Acceso prohibido') {
    super(mensaje, 403);
  }
}

export class ErrorNegocio extends ErrorBase {
  constructor(mensaje: string) {
    super(mensaje, 400);
  }
}

export class ErrorInterno extends ErrorBase {
  constructor(mensaje: string = 'Error interno del servidor') {
    super(mensaje, 500, false); // No operacional
  }
}
