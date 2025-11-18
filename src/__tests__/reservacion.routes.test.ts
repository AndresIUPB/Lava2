import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import reservacionRoutes from '../routes/reservacion.routes';
import { manejadorErrores } from '../middleware/manejoErrores';

describe('ReservacionRoutes - Validaciones y Rutas', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock de autenticación
    app.use((_req: Request, _res: Response, next: NextFunction) => {
      _req.usuario = { id: 'usuario-test-id', email: 'test@test.com' };
      next();
    });

    app.use('/api/reservaciones', reservacionRoutes);
    app.use(manejadorErrores);
  });

  describe('Validación de entrada en POST', () => {
    it('debería rechazar POST sin servicioId', async () => {
      const response = await request(app)
        .post('/api/reservaciones')
        .send({
          fechaHoraInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          direccionServicio: 'Calle 123 #45-67',
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar POST con servicioId inválido', async () => {
      const response = await request(app)
        .post('/api/reservaciones')
        .send({
          servicioId: 'no-es-uuid',
          fechaHoraInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          direccionServicio: 'Calle 123 #45-67',
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar POST sin fechaHoraInicio', async () => {
      const response = await request(app)
        .post('/api/reservaciones')
        .send({
          servicioId: '550e8400-e29b-41d4-a716-446655440000',
          direccionServicio: 'Calle 123 #45-67',
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar POST con fechaHoraInicio inválida', async () => {
      const response = await request(app)
        .post('/api/reservaciones')
        .send({
          servicioId: '550e8400-e29b-41d4-a716-446655440000',
          fechaHoraInicio: 'not-a-date',
          direccionServicio: 'Calle 123 #45-67',
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar POST sin direccionServicio', async () => {
      const response = await request(app)
        .post('/api/reservaciones')
        .send({
          servicioId: '550e8400-e29b-41d4-a716-446655440000',
          fechaHoraInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar POST con dirección muy corta', async () => {
      const response = await request(app)
        .post('/api/reservaciones')
        .send({
          servicioId: '550e8400-e29b-41d4-a716-446655440000',
          fechaHoraInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          direccionServicio: 'Corta',
        });

      expect(response.body.success).toBe(false);
    });
  });

  describe('Validación de parámetros GET', () => {
    it('debería rechazar GET /:id sin UUID válido', async () => {
      const response = await request(app).get('/api/reservaciones/no-es-uuid');

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar DELETE /:id sin UUID válido', async () => {
      const response = await request(app).delete(
        '/api/reservaciones/no-es-uuid'
      );

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar GET / con página < 1', async () => {
      const response = await request(app).get(
        '/api/reservaciones?pagina=0&limite=20'
      );

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar GET / con límite > 100', async () => {
      const response = await request(app).get(
        '/api/reservaciones?pagina=1&limite=101'
      );

      expect(response.body.success).toBe(false);
    });
  });

  describe('Orden y prioridad de rutas', () => {
    it('debería diferenciar /pendientes-calificacion como ruta literal', async () => {
      const response = await request(app).get(
        '/api/reservaciones/pendientes-calificacion'
      );

      // No debería ser error 400/422 (UUID validation)
      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería diferenciar /historial como ruta literal', async () => {
      const response = await request(app).get(
        '/api/reservaciones/historial'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería diferenciar /estadisticas como ruta literal', async () => {
      const response = await request(app).get(
        '/api/reservaciones/estadisticas'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería aceptar UUID válido en GET /:id (no falla validación)', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app).get(
        `/api/reservaciones/${validUUID}`
      );

      // No debería fallar por validación UUID (400/422)
      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });
  });

  describe('Estados permitidos en query', () => {
    it('debería aceptar estado pending sin errores de validación', async () => {
      const response = await request(app).get(
        '/api/reservaciones?estado=pending'
      );

      // La respuesta es válida (success puede ser true o false por lógica de negocio)
      // Pero NO debería ser error de validación
      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería aceptar estado confirmed sin errores de validación', async () => {
      const response = await request(app).get(
        '/api/reservaciones?estado=confirmed'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería aceptar estado completed sin errores de validación', async () => {
      const response = await request(app).get(
        '/api/reservaciones?estado=completed'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería aceptar estado cancelled sin errores de validación', async () => {
      const response = await request(app).get(
        '/api/reservaciones?estado=cancelled'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });
  });
});