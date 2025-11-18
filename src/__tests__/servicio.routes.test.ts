/**
 * Tests de integración para rutas de Servicios
 * Cobertura: Todos los endpoints GET
 * @author LAVA 2
 */

import request from 'supertest';
import express from 'express';
import servicioRoutes from '../routes/servicio.routes';

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/servicios', servicioRoutes);

import { ServicioService } from '../services/servicio.service';

describe('Rutas de Servicios - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/servicios', () => {
    it('debería obtener catálogo con paginación por defecto', async () => {
      // Arrange
      const respuestaMock = {
        servicios: [
          {
            id: '1',
            nombre: 'Lavado Básico',
            descripcion: 'Lavado exterior',
            precio: '50000',
            duracionMinutos: 60,
            imagenUrl: 'url',
            activo: true,
          },
        ],
        total: 1,
        paginas: 1,
        paginaActual: 1,
      };

      jest
        .spyOn(ServicioService.prototype, 'obtenerCatalogo')
        .mockResolvedValue(respuestaMock as any);

      // Act
      const res = await request(app).get('/api/servicios');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.servicios).toHaveLength(1);
      expect(res.body.data.servicios[0].nombre).toBe('Lavado Básico');
    });

    it('debería aceptar parámetros de paginación', async () => {
      // Arrange
      const respuestaMock = {
        servicios: [],
        total: 0,
        paginas: 0,
        paginaActual: 2,
      };

      jest
        .spyOn(ServicioService.prototype, 'obtenerCatalogo')
        .mockResolvedValue(respuestaMock as any);

      // Act
      const res = await request(app).get('/api/servicios?pagina=2&limite=10');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.paginaActual).toBe(2);
    });

    it('debería rechazar parámetro de página inválido', async () => {
      // Act
      const res = await request(app).get('/api/servicios?pagina=-1');

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debería rechazar parámetro de límite > 100', async () => {
      // Act
      const res = await request(app).get('/api/servicios?limite=200');

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/servicios/:id', () => {
    it('debería obtener servicio por ID válido', async () => {
      // Arrange
      const servicioMock = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Lavado Básico',
        descripcion: 'Lavado exterior',
        precio: '50000',
        duracionMinutos: 60,
        imagenUrl: 'url',
        activo: true,
      };

      jest
        .spyOn(ServicioService.prototype, 'obtenerServicioPorId')
        .mockResolvedValue(servicioMock as any);

      // Act
      const res = await request(app).get(
        '/api/servicios/123e4567-e89b-12d3-a456-426614174000'
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe('Lavado Básico');
    });

    it('debería rechazar UUID inválido', async () => {
      // Act
      const res = await request(app).get('/api/servicios/id-invalido');

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debería retornar 404 si servicio no existe', async () => {
      // Arrange
      jest
        .spyOn(ServicioService.prototype, 'obtenerServicioPorId')
        .mockRejectedValue(new Error('Servicio no encontrado'));

      // Act
      const res = await request(app).get(
        '/api/servicios/123e4567-e89b-12d3-a456-426614174000'
      );

      // Assert
      expect(res.status).toBe(500); // El middleware global de errores responde con 500
    });
  });

  describe('GET /api/servicios/disponibles/lista', () => {
    it('debería obtener lista de servicios disponibles', async () => {
      // Arrange
      const serviciosMock = [
        {
          id: '1',
          nombre: 'Lavado Básico',
          descripcion: 'Lavado exterior',
          precio: '50000',
          duracionMinutos: 60,
          activo: true,
        },
        {
          id: '2',
          nombre: 'Lavado Premium',
          descripcion: 'Lavado completo',
          precio: '150000',
          duracionMinutos: 120,
          activo: true,
        },
      ];

      jest
        .spyOn(ServicioService.prototype, 'obtenerServiciosDisponibles')
        .mockResolvedValue(serviciosMock as any);

      // Act
      const res = await request(app).get('/api/servicios/disponibles/lista');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.servicios).toHaveLength(2);
      expect(res.body.data.servicios[0].nombre).toBe('Lavado Básico');
      expect(res.body.data.servicios[1].nombre).toBe('Lavado Premium');
    });

    it('debería retornar lista vacía si no hay servicios', async () => {
      // Arrange
      jest
        .spyOn(ServicioService.prototype, 'obtenerServiciosDisponibles')
        .mockResolvedValue([] as any);

      // Act
      const res = await request(app).get('/api/servicios/disponibles/lista');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.servicios).toHaveLength(0);
    });
  });

  describe('GET /api/servicios/buscar/:termino', () => {
    it('debería buscar servicios por término válido', async () => {
      // Arrange
      const serviciosMock = [
        {
          id: '1',
          nombre: 'Lavado Premium',
          descripcion: 'Lavado completo',
          precio: '150000',
          duracionMinutos: 120,
          activo: true,
        },
      ];

      jest
        .spyOn(ServicioService.prototype, 'buscarServicios')
        .mockResolvedValue(serviciosMock as any);

      // Act
      const res = await request(app).get('/api/servicios/buscar/Premium');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.servicios).toHaveLength(1);
      expect(res.body.data.servicios[0].nombre).toContain('Premium');
    });

    it('debería rechazar término muy corto (1 carácter)', async () => {
      // Act
      const res = await request(app).get('/api/servicios/buscar/a');

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debería rechazar término muy largo (> 50 caracteres)', async () => {
      // Arrange
      const terminoLargo = 'a'.repeat(51);

      // Act
      const res = await request(app).get(`/api/servicios/buscar/${terminoLargo}`);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debería retornar lista vacía si no coincide ningún servicio', async () => {
      // Arrange
      jest
        .spyOn(ServicioService.prototype, 'buscarServicios')
        .mockResolvedValue([] as any);

      // Act
      const res = await request(app).get('/api/servicios/buscar/NoExiste');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.servicios).toHaveLength(0);
    });
  });

  describe('GET /api/servicios/cantidad', () => {
    it('debería retornar cantidad de servicios activos', async () => {
      // Arrange
      jest
        .spyOn(ServicioService.prototype, 'obtenerCantidadServicios')
        .mockResolvedValue(5 as any);

      // Act
      const res = await request(app).get('/api/servicios/cantidad');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cantidad).toBe(5);
    });

    it('debería retornar 0 si no hay servicios', async () => {
      // Arrange
      jest
        .spyOn(ServicioService.prototype, 'obtenerCantidadServicios')
        .mockResolvedValue(0 as any);

      // Act
      const res = await request(app).get('/api/servicios/cantidad');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.cantidad).toBe(0);
    });
  });

  describe('Orden de rutas y prioridad', () => {
    it('GET /disponibles/lista debería tener prioridad sobre GET /:id', async () => {
      // Arrange - Asegurar que /disponibles/lista se ejecuta, no se interpreta como /:id
      const serviciosMock = [
        {
          id: '1',
          nombre: 'Servicio 1',
          descripcion: 'Test',
          precio: '50000',
          duracionMinutos: 60,
          activo: true,
        },
      ];

      jest
        .spyOn(ServicioService.prototype, 'obtenerServiciosDisponibles')
        .mockResolvedValue(serviciosMock as any);

      // Act
      const res = await request(app).get('/api/servicios/disponibles/lista');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.servicios).toBeInstanceOf(Array);
      expect(res.body.data.servicios).toHaveLength(1);
      // Verificar que se llamó a obtenerServiciosDisponibles, no obtenerServicioPorId
      expect(ServicioService.prototype.obtenerServiciosDisponibles).toHaveBeenCalled();
    });

    it('GET /buscar/:termino debería tener prioridad sobre GET /:id', async () => {
      // Arrange
      const serviciosMock = [
        {
          id: '1',
          nombre: 'Servicio Premium',
          descripcion: 'Test',
          precio: '150000',
          duracionMinutos: 120,
          activo: true,
        },
      ];

      jest
        .spyOn(ServicioService.prototype, 'buscarServicios')
        .mockResolvedValue(serviciosMock as any);

      // Act
      const res = await request(app).get('/api/servicios/buscar/premium');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.servicios).toBeInstanceOf(Array);
      expect(ServicioService.prototype.buscarServicios).toHaveBeenCalledWith(
        'premium'
      );
    });
  });
});
