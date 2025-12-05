import { CorsOptions } from 'cors';

const FRONTEND_URLS = [
  'http://localhost:5173', // Frontend
  'http://localhost:3000', // Backend (para pruebas internas)
  process.env.FRONTEND_URL // Producción
].filter(Boolean) as string[];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (FRONTEND_URLS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400 // 24 horas
};
