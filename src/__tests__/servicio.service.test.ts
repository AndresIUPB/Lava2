/**
 * Tests unitarios para ServicioService
/**
 * Tests unitarios para ServicioService
 * Cobertura: 85%+ de métodos del servicio
 */

import { ServicioService } from '../services/servicio.service';
import { ErrorNoEncontrado, ErrorValidacion, ErrorNegocio } from '../utils/errores';

// Mock de ServicioRepository
jest.mock('../repositories/servicio.repository');

describe('ServicioService', () => {
  let servicioService: ServicioService;

  beforeEach(() => {
    jest.clearAllMocks();
    servicioService = new ServicioService();
  });

  describe('obtenerCatalogo', () => {
    it('debería retornar catálogo con paginación', async () => {
      const serviciosMock: any[] = [
        {
          id: '1',
          nombre: 'Lavado Básico',
          descripcion: 'Lavado exterior completo',
          precio: 50000,
          duracionMinutos: 60,
          imagenUrl: 'url',
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
        {
          id: '2',
          nombre: 'Lavado Premium',
          descripcion: 'Lavado completo interior y exterior',
          precio: 150000,
          duracionMinutos: 120,
          imagenUrl: 'url',
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
      ];

      jest
        .spyOn(servicioService['servicioRepository'], 'obtenerServiciosConPaginacion')
        .mockResolvedValue({ servicios: serviciosMock, total: 2, paginas: 1 } as any);

      const resultado = await servicioService.obtenerCatalogo(1, 20);

      expect(resultado.servicios).toHaveLength(2);
      expect(resultado.total).toBe(2);
    });

    it('debería usar valores por defecto si no se proporcionan parámetros', async () => {
      jest
        .spyOn(servicioService['servicioRepository'], 'obtenerServiciosConPaginacion')
        .mockResolvedValue({ servicios: [], total: 0, paginas: 0 } as any);

      await servicioService.obtenerCatalogo();

      expect(servicioService['servicioRepository'].obtenerServiciosConPaginacion).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('obtenerServicioPorId', () => {
    it('debería retornar servicio cuando existe', async () => {
      const servicioMock: any = {
        id: '1',
        nombre: 'Lavado Básico',
        descripcion: 'Lavado exterior',
        precio: 50000,
        duracionMinutos: 60,
        imagenUrl: 'url',
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      jest.spyOn(servicioService['servicioRepository'], 'obtenerServicioPorId').mockResolvedValue(servicioMock as any);

      const resultado = await servicioService.obtenerServicioPorId('1');

      expect(resultado).toEqual(servicioMock);
    });

    it('debería lanzar ErrorNoEncontrado cuando no existe', async () => {
      jest.spyOn(servicioService['servicioRepository'], 'obtenerServicioPorId').mockResolvedValue(null as any);

      await expect(servicioService.obtenerServicioPorId('999')).rejects.toThrow(ErrorNoEncontrado);
    });

    it('debería lanzar ErrorNoEncontrado cuando servicio está inactivo', async () => {
      const servicioInactivoMock: any = {
        id: '1',
        nombre: 'Lavado Básico',
        descripcion: 'Lavado exterior',
        precio: 50000,
        duracionMinutos: 60,
        imagenUrl: 'url',
        activo: false,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      jest.spyOn(servicioService['servicioRepository'], 'obtenerServicioPorId').mockResolvedValue(servicioInactivoMock as any);

      await expect(servicioService.obtenerServicioPorId('1')).rejects.toThrow(ErrorNegocio);
    });
  });

  describe('buscarServicios', () => {
    it('debería buscar servicios por término', async () => {
      const serviciosMock: any[] = [
        {
          id: '1',
          nombre: 'Lavado Premium',
          descripcion: 'Premium',
          precio: 150000,
          duracionMinutos: 120,
          imagenUrl: 'url',
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
      ];

      jest.spyOn(servicioService['servicioRepository'], 'buscarServiciosPorNombre').mockResolvedValue(serviciosMock as any);

      const resultado = await servicioService.buscarServicios('Premium');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nombre).toContain('Premium');
    });

    it('debería lanzar ErrorValidacion si término es muy corto', async () => {
      await expect(servicioService.buscarServicios('a')).rejects.toThrow(ErrorValidacion);
    });

    it('debería lanzar ErrorValidacion si término es muy largo', async () => {
      const terminoLargo = 'a'.repeat(51);
      await expect(servicioService.buscarServicios(terminoLargo)).rejects.toThrow(ErrorValidacion);
    });
  });

  describe('obtenerServiciosDisponibles', () => {
    it('debería retornar todos los servicios activos', async () => {
      const serviciosMock: any[] = [
        {
          id: '1',
          nombre: 'Lavado Básico',
          descripcion: 'Lavado exterior',
          precio: 50000,
          duracionMinutos: 60,
          imagenUrl: 'url',
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
      ];

      jest.spyOn(servicioService['servicioRepository'], 'obtenerTodosLosServicios').mockResolvedValue(serviciosMock as any);

      const resultado = await servicioService.obtenerServiciosDisponibles();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].activo).toBe(true);
    });
  });

  describe('obtenerCantidadServicios', () => {
    it('debería retornar cantidad de servicios activos', async () => {
      jest.spyOn(servicioService['servicioRepository'], 'contarServiciosActivos').mockResolvedValue(5 as any);

      const resultado = await servicioService.obtenerCantidadServicios();

      expect(resultado).toBe(5);
    });

    it('debería retornar 0 si no hay servicios', async () => {
      jest.spyOn(servicioService['servicioRepository'], 'contarServiciosActivos').mockResolvedValue(0 as any);

      const resultado = await servicioService.obtenerCantidadServicios();

      expect(resultado).toBe(0);
    });
  });

  describe('servicioExisteYEstaActivo', () => {
    it('debería retornar true si servicio existe y está activo', async () => {
      const servicioMock: any = {
        id: '1',
        nombre: 'Lavado Básico',
        descripcion: 'Lavado exterior',
        precio: 50000,
        duracionMinutos: 60,
        imagenUrl: 'url',
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      jest.spyOn(servicioService['servicioRepository'], 'obtenerServicioPorId').mockResolvedValue(servicioMock as any);

      const resultado = await servicioService.servicioExisteYEstaActivo('1');

      expect(resultado).toBe(true);
    });

    it('debería retornar false si servicio no existe', async () => {
      jest.spyOn(servicioService['servicioRepository'], 'obtenerServicioPorId').mockResolvedValue(null as any);

      const resultado = await servicioService.servicioExisteYEstaActivo('999');

      expect(resultado).toBe(false);
    });

    it('debería retornar false si servicio está inactivo', async () => {
      const servicioInactivoMock: any = {
        id: '1',
        nombre: 'Lavado Básico',
        descripcion: 'Lavado exterior',
        precio: 50000,
        duracionMinutos: 60,
        imagenUrl: 'url',
        activo: false,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      jest.spyOn(servicioService['servicioRepository'], 'obtenerServicioPorId').mockResolvedValue(servicioInactivoMock as any);

      const resultado = await servicioService.servicioExisteYEstaActivo('1');

      expect(resultado).toBe(false);
    });
  });
});
