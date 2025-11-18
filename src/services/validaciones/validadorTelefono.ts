import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// ============================================
// VALIDADOR DE TELÉFONO COLOMBIANO
// ============================================

/**
 * Valida que un número de teléfono tenga formato colombiano válido.
 *
 * Acepta formatos como:
 * - +57 300 123 4567
 * - +573001234567
 * - 300 123 4567 (asume +57)
 *
 * @param telefono - Número de teléfono a validar
 * @returns true si el teléfono es válido para Colombia, false en caso contrario
 */
export const validarTelefonoColombia = (telefono: string): boolean => {
  try {
    // Validar formato colombiano
    return isValidPhoneNumber(telefono, 'CO');
  } catch {
    return false;
  }
};

/**
 * Formatea un número de teléfono al formato E.164 estándar internacional.
 *
 * Ejemplo: "300 123 4567" → "+573001234567"
 *
 * @param telefono - Número de teléfono a formatear
 * @returns Teléfono en formato E.164, o null si el formato no es válido
 */
export const formatearTelefonoColombia = (telefono: string): string | null => {
  try {
    const phoneNumber = parsePhoneNumber(telefono, 'CO');
    if (!phoneNumber) {
      return null;
    }
    return phoneNumber.format('E.164');
  } catch {
    return null;
  }
};
