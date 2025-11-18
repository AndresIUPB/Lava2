import request from 'supertest';
import { app } from '../server';
import { generarAccessToken } from '../utils/jwt';

describe('NotificacionRoutes - Validaciones y Rutas', () => {
  let accessToken: string;

  beforeAll(() => {
    accessToken = generarAccessToken({ id: 'usuario-test-uuid', email: 'test@test.com' });
  });

  describe('GET /api/notificaciones - Obtener notificaciones', () => {
    it('debería rechazar pagina no numérica', async () => {
      const response = await request(app)
        .get('/api/notificaciones')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ pagina: 'abc' });

      expect(response.status).toBe(400);
    });

    it('debería rechazar pagina menor a 1', async () => {
      const response = await request(app)
        .get('/api/notificaciones')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ pagina: 0 });

      expect(response.status).toBe(400);
    });

    it('debería rechazar limite mayor a 100', async () => {
      const response = await request(app)
        .get('/api/notificaciones')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ limite: 150 });

      expect(response.status).toBe(400);
    });

    it('debería rechazar parámetro leida inválido', async () => {
      const response = await request(app)
        .get('/api/notificaciones')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ leida: 'maybe' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /no-leidas y /no-leidas/contar', () => {
    it('debería aceptar /no-leidas', async () => {
      const response = await request(app)
        .get('/api/notificaciones/no-leidas')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect([200, 404]).toContain(response.status);
    });

    it('debería aceptar /no-leidas/contar como ruta literal', async () => {
      const response = await request(app)
        .get('/api/notificaciones/no-leidas/contar')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).not.toBe(400);
    });
  });

  describe('PUT /:id/leida y /marcar-todos-leido', () => {
    it('debería rechazar ID no UUID en /:id/leida', async () => {
      const response = await request(app)
        .put('/api/notificaciones/invalid-id/leida')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({});

      expect(response.status).toBe(400);
    });

    it('debería aceptar /marcar-todos-leido como ruta literal', async () => {
      const response = await request(app)
        .put('/api/notificaciones/marcar-todos-leido')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({});

      expect(response.status).not.toBe(400);
    });
  });

  describe('GET /tipo/:tipo - Por tipo', () => {
    it('debería aceptar tipos válidos', async () => {
      const tipos = ['reservacion', 'calificacion', 'promocion', 'sistema'];
      for (const tipo of tipos) {
        const response = await request(app)
          .get(`/api/notificaciones/tipo/${tipo}`)
          .set('Cookie', [`accessToken=${accessToken}`]);

        expect(response.status).not.toBe(400);
      }
    });

    it('debería rechazar tipo inválido', async () => {
      const response = await request(app)
        .get('/api/notificaciones/tipo/tipo-invalido')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).toBe(400);
    });

    it('debería rechazar pagina inválida en /tipo', async () => {
      const response = await request(app)
        .get('/api/notificaciones/tipo/reservacion')
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ pagina: -1 });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /:id y /leidas/limpiar', () => {
    it('debería rechazar ID no UUID', async () => {
      const response = await request(app)
        .delete('/api/notificaciones/invalid-id')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).toBe(400);
    });

    it('debería aceptar /leidas/limpiar como ruta literal', async () => {
      const response = await request(app)
        .delete('/api/notificaciones/leidas/limpiar')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({});

      expect(response.status).not.toBe(400);
    });
  });

  describe('Route Priority - Literales antes que dinámicas', () => {
    it('prioriza /no-leidas/contar sobre /:id', async () => {
      const response = await request(app)
        .get('/api/notificaciones/no-leidas/contar')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).not.toBe(400);
    });

    it('prioriza /marcar-todos-leido sobre /:id', async () => {
      const response = await request(app)
        .put('/api/notificaciones/marcar-todos-leido')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({});

      expect(response.status).not.toBe(400);
    });

    it('prioriza /leidas/limpiar sobre /:id', async () => {
      const response = await request(app)
        .delete('/api/notificaciones/leidas/limpiar')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({});

      expect(response.status).not.toBe(400);
    });

    it('prioriza /tipo/:tipo sobre /:id', async () => {
      const response = await request(app)
        .get('/api/notificaciones/tipo/reservacion')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).not.toBe(400);
    });
  });
});
