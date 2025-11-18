// ============================================
// VALIDADOR DE PLACA COLOMBIANA
// ============================================

/**
 * Valida el formato de una placa colombiana.
 *
 * Formato válido: 3 letras mayúsculas seguidas de 3 números
 * Ejemplo: ABC123
 *
 * @param placa - Placa a validar
 * @returns true si la placa tiene formato válido, false en caso contrario
 */
export const validarPlacaColombia = (placa: string): boolean => {
  // Formato: 3 letras + 3 números (ej: ABC123)
  const regex = /^[A-Z]{3}\d{3}$/;
  return regex.test(placa.toUpperCase());
};
