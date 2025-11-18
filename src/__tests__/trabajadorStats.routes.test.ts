import request from 'supertest';
import { app } from '../server';
import { generarAccessToken } from '../utils/jwt';

describe('TrabajadorStatsRoutes - Validaciones y Rutas', () => {
  let accessToken: string;
  const trabajadorId = '123e4567-e89b-12d3-a456-426614174000';

  beforeAll(() => {
    accessToken = generarAccessToken({ id: 'usuario-test', email: 'test@test.com' });
  });

  describe('GET /api/trabajadores/ranking/mejores', () => {
    it('debería obtener mejores trabajadores (público)', async () => {
      const response = await request(app).get('/api/trabajadores/ranking/mejores');

      expect([200, 404]).toContain(response.status);
    });

    it('debería aceptar parámetro límite válido', async () => {
      const response = await request(app)
        .get('/api/trabajadores/ranking/mejores')
        .query({ limite: 5 });

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar límite fuera de rango', async () => {
      const response = await request(app)
        .get('/api/trabajadores/ranking/mejores')
        .query({ limite: 150 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/trabajadores/:id/estadisticas', () => {
    it('debería rechazar ID no UUID', async () => {
      const response = await request(app)
        .get('/api/trabajadores/invalid-id/estadisticas')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).toBe(400);
    });

    it('debería aceptar ID UUID válido', async () => {
      const response = await request(app)
        .get(`/api/trabajadores/${trabajadorId}/estadisticas`)
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar fechaInicio inválida', async () => {
      const response = await request(app)
        .get(`/api/trabajadores/${trabajadorId}/estadisticas`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ fechaInicio: 'fecha-invalida' });

      expect(response.status).toBe(400);
    });

    it('debería aceptar fechas válidas en ISO8601', async () => {
      const response = await request(app)
        .get(`/api/trabajadores/${trabajadorId}/estadisticas`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({
          fechaInicio: '2024-01-01T00:00:00Z',
          fechaFin: '2024-12-31T23:59:59Z',
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/trabajadores/:id/estadisticas/mensuales', () => {
    it('debería rechazar ID no UUID', async () => {
      const response = await request(app)
        .get('/api/trabajadores/invalid-id/estadisticas/mensuales')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).toBe(400);
    });

    it('debería aceptar ID UUID válido', async () => {
      const response = await request(app)
        .get(`/api/trabajadores/${trabajadorId}/estadisticas/mensuales`)
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect([200, 404]).toContain(response.status);
    });

    it('debería aceptar parámetro meses válido', async () => {
      const response = await request(app)
        .get(`/api/trabajadores/${trabajadorId}/estadisticas/mensuales`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ meses: 6 });

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar meses fuera de rango', async () => {
      const response = await request(app)
        .get(`/api/trabajadores/${trabajadorId}/estadisticas/mensuales`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ meses: 30 });

      expect(response.status).toBe(400);
    });

    it('ruta literal: /mensuales antes que /:id', async () => {
      const response = await request(app)
        .get(`/api/trabajadores/${trabajadorId}/estadisticas/mensuales`)
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).not.toBe(400);
    });
  });

  describe('Route Priority - Literales antes que dinámicas', () => {
    const token = accessToken;

    it('prioriza /ranking/mejores sobre /:id', async () => {
      const response = await request(app).get('/api/trabajadores/ranking/mejores');

      expect(response.status).not.toBe(400);
    });

    it('prioriza /mensuales dentro de /:id/estadisticas', async () => {
      const response = await request(app)
        .get(`/api/trabajadores/${trabajadorId}/estadisticas/mensuales`)
        .set('Cookie', [`accessToken=${token}`]);

      expect(response.status).not.toBe(400);
    });
  });
});
