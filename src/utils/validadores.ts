// Validadores comunes usados por formularios del frontend

export const validarEmail = (email: string): boolean => {
  const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(email);
};

// Teléfono colombiano: permite formatos locales y E.164 con +57
export const validarTelefonoColombia = (telefono: string): boolean => {
  const re = /^(?:\+57)?\s?3\d{2}\s?\d{3}\s?\d{4}$/;
  const limpio = telefono.replace(/[\s-]/g, '');
  return re.test(limpio);
};

// Placa Colombia: 3 letras + 3 números (ej: ABC123)
export const validarPlacaColombia = (placa: string): boolean => {
  const re = /^[A-Z]{3}\d{3}$/i;
  return re.test(placa.trim());
};

// Contraseña segura: mínimo 8 caracteres
export const validarPassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 8;
};

// Documento: aceptar CC, CE, Pasaporte (valida tipo + números/alfanum)
export const validarDocumento = (tipo: string, numero: string): boolean => {
  const tipos = ['CC', 'CE', 'Pasaporte'];
  if (!tipos.includes(tipo)) return false;
  if (tipo === 'Pasaporte') return /^[A-Za-z0-9]{5,20}$/.test(numero);
  return /^\d{6,13}$/.test(numero);
};

export default {
  validarEmail,
  validarTelefonoColombia,
  validarPlacaColombia,
  validarPassword,
  validarDocumento,
};
