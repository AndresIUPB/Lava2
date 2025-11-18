/**
 * Tests de integración para rutas de Trabajadores
 * Cobertura: Validaciones y estructura de respuestas
 */

import request from 'supertest';
import express from 'express';
import trabajadorRoutes from '../routes/trabajador.routes';

describe('Rutas de Trabajadores - Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/trabajadores', trabajadorRoutes);
  });

  describe('Validaciones de entrada', () => {
    it('GET /api/trabajadores debería rechazar página inválida', async () => {
      const response = await request(app).get('/api/trabajadores?pagina=0');
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/trabajadores debería rechazar límite > 100', async () => {
      const response = await request(app).get('/api/trabajadores?limite=101');
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/trabajadores/:id debería rechazar UUID inválido', async () => {
      const response = await request(app).get('/api/trabajadores/id-invalido');
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/trabajadores/buscar/:termino debería rechazar término corto', async () => {
      const response = await request(app).get('/api/trabajadores/buscar/A');
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/trabajadores/buscar/:termino debería rechazar término largo', async () => {
      const terminoLargo = 'a'.repeat(101);
      const response = await request(app).get(`/api/trabajadores/buscar/${terminoLargo}`);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/trabajadores/calificacion/:minima debería rechazar valor fuera de rango', async () => {
      const response = await request(app).get('/api/trabajadores/calificacion/6');
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Orden y prioridad de rutas', () => {
    it('GET /disponibles/lista debería ser válido y no interpretarse como UUID', async () => {
      // Si no tiene prioridad, intentaría validar "disponibles" como UUID y fallaría
      const response = await request(app).get('/api/trabajadores/disponibles/lista');
      // Puede ser 200 (si hay datos mockeados) o error sin "UUID inválido"
      expect(response.status).not.toBe(400);
      expect(response.body.success).toBe(true);
    });

    it('GET /buscar/:termino debería ser válido y no interpretarse como UUID', async () => {
      const response = await request(app).get('/api/trabajadores/buscar/Juan');
      // Puede ser 200 (si hay datos) o error, pero NO por UUID inválido
      expect(response.status).not.toBe(400);
      expect(response.body.success).toBe(true);
    });

    it('GET /cantidad debería ser válido y no interpretarse como UUID', async () => {
      const response = await request(app).get('/api/trabajadores/cantidad');
      expect(response.status).not.toBe(400);
      expect(response.body.success).toBe(true);
    });
  });
});
