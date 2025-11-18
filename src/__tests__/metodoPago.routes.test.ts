import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import { manejadorErrores } from '../middleware/manejoErrores';
import metodoPagoRoutes from '../routes/metodoPago.routes';

// Mock de middleware de autenticación (DEBE estar ANTES de las validaciones)
const mockAutenticacion = (_req: Request, _res: Response, next: NextFunction) => {
  _req.usuario = { id: 'usuario-test-id', email: 'test@test.com' };
  next();
};

describe('Rutas de Métodos de Pago - Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Aplicar mock de autenticación ANTES de cualquier otra ruta/validación
    app.use(mockAutenticacion);
    app.use('/api/metodos-pago', metodoPagoRoutes);
    app.use(manejadorErrores);
  });

  describe('Orden y prioridad de rutas', () => {
    it('debería diferenciar /principal del parámetro :id dinámico', async () => {
      const response = await request(app)
        .get('/api/metodos-pago/principal');

      // Si la ruta está bien ordenada, /principal se trata como ruta específica
      // No como ID = "principal". Fallará buscando en DB, no con 400 de validación
      expect(response.status).not.toBe(400);
    });

    it('debería diferenciar /cantidad del parámetro :id dinámico', async () => {
      const response = await request(app)
        .get('/api/metodos-pago/cantidad');

      // Si la ruta está bien ordenada, /cantidad se trata como ruta específica
      expect(response.status).not.toBe(400);
    });

    it('debería aceptar UUID válido en GET /:id', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .get(`/api/metodos-pago/${validUUID}`);

      // No es 400 (validación pasada), será 404 o 500 (método no encontrado en DB)
      expect(response.status).not.toBe(400);
    });
  });

  describe('POST /api/metodos-pago - Creación de método de pago', () => {
    it('debería aceptar tipo "tarjeta_credito"', async () => {
      const response = await request(app)
        .post('/api/metodos-pago')
        .send({
          tipo: 'tarjeta_credito',
          ultimos4Digitos: '1234',
          nombreTitular: 'Juan Pérez',
          fechaExpiracion: '12/25',
          marca: 'Visa',
        });

      // Válida expresar-validator, fallará en el service (usuario no en DB)
      expect(response.status).not.toBe(400);
    });

    it('debería aceptar tipo "pse"', async () => {
      const response = await request(app)
        .post('/api/metodos-pago')
        .send({ tipo: 'pse' });

      expect(response.status).not.toBe(400);
    });

    it('debería aceptar tipo "efectivo"', async () => {
      const response = await request(app)
        .post('/api/metodos-pago')
        .send({ tipo: 'efectivo' });

      expect(response.status).not.toBe(400);
    });

    it('debería aceptar tipo "tarjeta_debito"', async () => {
      const response = await request(app)
        .post('/api/metodos-pago')
        .send({ tipo: 'tarjeta_debito' });

      expect(response.status).not.toBe(400);
    });
  });
});
