import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import calificacionRoutes from '../routes/calificacion.routes';
import { manejadorErrores } from '../middleware/manejoErrores';

describe('CalificacionRoutes - Validaciones y Rutas', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock de autenticación
    app.use((_req: Request, _res: Response, next: NextFunction) => {
      _req.usuario = { id: 'usuario-test-id', email: 'test@test.com' };
      next();
    });

    app.use('/api/calificaciones', calificacionRoutes);
    app.use(manejadorErrores);
  });

  describe('Validación de entrada en POST', () => {
    it('debería rechazar POST sin reservacionId', async () => {
      const response = await request(app)
        .post('/api/calificaciones')
        .send({
          calificacionServicio: 5,
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar POST con reservacionId inválido', async () => {
      const response = await request(app)
        .post('/api/calificaciones')
        .send({
          reservacionId: 'no-es-uuid',
          calificacionServicio: 5,
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar POST sin calificacionServicio', async () => {
      const response = await request(app)
        .post('/api/calificaciones')
        .send({
          reservacionId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar calificacionServicio fuera de rango', async () => {
      const response = await request(app)
        .post('/api/calificaciones')
        .send({
          reservacionId: '550e8400-e29b-41d4-a716-446655440000',
          calificacionServicio: 6,
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar calificacionTrabajador fuera de rango', async () => {
      const response = await request(app)
        .post('/api/calificaciones')
        .send({
          reservacionId: '550e8400-e29b-41d4-a716-446655440000',
          calificacionServicio: 5,
          calificacionTrabajador: 0,
        });

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar comentario del servicio muy largo', async () => {
      const response = await request(app)
        .post('/api/calificaciones')
        .send({
          reservacionId: '550e8400-e29b-41d4-a716-446655440000',
          calificacionServicio: 5,
          comentarioServicio: 'a'.repeat(1001),
        });

      expect(response.body.success).toBe(false);
    });
  });

  describe('Validación de parámetros GET', () => {
    it('debería rechazar GET /:id sin UUID válido', async () => {
      const response = await request(app).get('/api/calificaciones/no-es-uuid');

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar GET /trabajador/:id sin UUID válido', async () => {
      const response = await request(app).get(
        '/api/calificaciones/trabajador/no-es-uuid'
      );

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar GET /estadisticas/servicio/:id sin UUID válido', async () => {
      const response = await request(app).get(
        '/api/calificaciones/estadisticas/servicio/no-es-uuid'
      );

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar GET / con página < 1', async () => {
      const response = await request(app).get(
        '/api/calificaciones?pagina=0&limite=20'
      );

      expect(response.body.success).toBe(false);
    });

    it('debería rechazar GET / con límite > 100', async () => {
      const response = await request(app).get(
        '/api/calificaciones?pagina=1&limite=101'
      );

      expect(response.body.success).toBe(false);
    });
  });

  describe('Orden y prioridad de rutas', () => {
    it('debería diferenciar /trabajador/:id como ruta literal', async () => {
      const response = await request(app).get(
        '/api/calificaciones/trabajador/550e8400-e29b-41d4-a716-446655440000'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería diferenciar /estadisticas/servicio/:id como ruta literal', async () => {
      const response = await request(app).get(
        '/api/calificaciones/estadisticas/servicio/550e8400-e29b-41d4-a716-446655440000'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería aceptar UUID válido en GET /:id', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app).get(
        `/api/calificaciones/${validUUID}`
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });
  });

  describe('Validación de paginación', () => {
    it('debería aceptar paginación válida', async () => {
      const response = await request(app).get(
        '/api/calificaciones?pagina=1&limite=20'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });

    it('debería aceptar paginación máxima', async () => {
      const response = await request(app).get(
        '/api/calificaciones?pagina=1&limite=100'
      );

      expect(response.status).not.toBe(400);
      expect(response.status).not.toBe(422);
    });
  });
});
