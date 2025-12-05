export const logger = {
  info: (mensaje: string, datos?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${mensaje}`, datos || "");
  },

  warn: (mensaje: string, datos?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${mensaje}`, datos || "");
  },

  error: (mensaje: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${mensaje}`);
    if (error instanceof Error) {
      console.error(error.stack);
    } else if (error) {
      console.error(error);
    }
  }
};
