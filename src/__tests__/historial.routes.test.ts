import request from 'supertest';
import { app } from '../server';
import { generarAccessToken } from '../utils/jwt';

describe('HistorialRoutes - Validaciones y Rutas', () => {
  let accessToken: string;
  const usuarioId = 'usuario-test-uuid';

  beforeAll(() => {
    accessToken = generarAccessToken({ id: usuarioId, email: 'test@test.com' });
  });

  describe('GET /api/historial/estadisticas - Validación de parámetros', () => {
    it('debería aceptar fechaInicio y fechaFin válidas', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({
          fechaInicio: '2024-01-01T00:00:00Z',
          fechaFin: '2024-12-31T23:59:59Z',
        });

      // Podría ser 200 o 404 (usuario no encontrado), pero no 400 (validación)
      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar fechaInicio inválida', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({
          fechaInicio: 'fecha-invalida',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería rechazar período inválido', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({
          periodo: 'invalido',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería aceptar período válido (mes)', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({
          periodo: 'mes',
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/historial/estadisticas/mensuales - Validación de parámetros', () => {
    it('debería aceptar meses válido (entre 1 y 12)', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas/mensuales')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ meses: 6 });

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar meses menor a 1', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas/mensuales')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ meses: 0 });

      expect(response.status).toBe(400);
    });

    it('debería rechazar meses mayor a 12', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas/mensuales')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ meses: 13 });

      expect(response.status).toBe(400);
    });

    it('debería aceptar sin parámetro meses (usa default)', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas/mensuales')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/historial/filtrado - Validación de filtros', () => {
    it('debería aceptar filtro estado válido', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ estado: 'completed' });

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar filtro estado inválido', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ estado: 'invalido' });

      expect(response.status).toBe(400);
    });

    it('debería aceptar filtro servicioId válido (UUID)', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ servicioId: '123e4567-e89b-12d3-a456-426614174000' });

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar filtro servicioId inválido', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ servicioId: 'no-uuid' });

      expect(response.status).toBe(400);
    });

    it('debería aceptar filtro trabajadorId válido (UUID)', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ trabajadorId: '123e4567-e89b-12d3-a456-426614174000' });

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar filtro trabajadorId inválido', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ trabajadorId: 'no-uuid' });

      expect(response.status).toBe(400);
    });

    it('debería aceptar parámetros de paginación válidos', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ pagina: 1, limite: 20 });

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar pagina menor a 1', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ pagina: 0 });

      expect(response.status).toBe(400);
    });

    it('debería rechazar limite mayor a 100', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ limite: 101 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/historial/resumen - Información del resumen', () => {
    it('debería aceptar solicitud sin parámetros', async () => {
      const response = await request(app)
        .get('/api/historial/resumen')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect([200, 404]).toContain(response.status);
    });

    it('debería rechazar si no hay autenticación', async () => {
      const response = await request(app).get('/api/historial/resumen');

      expect(response.status).toBe(401);
    });
  });

  describe('Orden y prioridad de rutas', () => {
    it('debería diferenciar /estadisticas/mensuales como ruta literal', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas/mensuales')
        .set('Cookie', [`accessToken=${accessToken}`]);

      // No debe intentar validar como UUID
      expect([200, 404]).toContain(response.status);
    });

    it('debería diferenciar /estadisticas como ruta literal', async () => {
      const response = await request(app)
        .get('/api/historial/estadisticas')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect([200, 404]).toContain(response.status);
    });

    it('debería diferenciar /resumen como ruta literal', async () => {
      const response = await request(app)
        .get('/api/historial/resumen')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect([200, 404]).toContain(response.status);
    });

    it('debería diferenciar /filtrado como ruta literal', async () => {
      const response = await request(app)
        .get('/api/historial/filtrado')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Autenticación requerida', () => {
    it('debería rechazar acceso sin token a /estadisticas', async () => {
      const response = await request(app).get('/api/historial/estadisticas');

      expect(response.status).toBe(401);
    });

    it('debería rechazar acceso sin token a /estadisticas/mensuales', async () => {
      const response = await request(app).get('/api/historial/estadisticas/mensuales');

      expect(response.status).toBe(401);
    });

    it('debería rechazar acceso sin token a /filtrado', async () => {
      const response = await request(app).get('/api/historial/filtrado');

      expect(response.status).toBe(401);
    });

    it('debería rechazar acceso sin token a /resumen', async () => {
      const response = await request(app).get('/api/historial/resumen');

      expect(response.status).toBe(401);
    });
  });
});
