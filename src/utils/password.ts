import bcrypt from 'bcrypt';

// ============================================
// HELPERS DE PASSWORD
// ============================================

const SALT_ROUNDS = 10;

/**
 * Hashea una contraseña usando bcrypt
 */
export const hashearPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compara una contraseña en texto plano con su hash
 */
export const compararPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
