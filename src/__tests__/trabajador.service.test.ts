/**
 * Tests unitarios para TrabajadorService
 * Cobertura: Casos principales sin mocks complejos
 */

import { TrabajadorService } from '../services/trabajador.service';
import { ErrorValidacion } from '../utils/errores';

describe('TrabajadorService', () => {
  let servicioTrabajador: TrabajadorService;

  beforeEach(() => {
    servicioTrabajador = new TrabajadorService();
  });

  describe('Validaciones', () => {
    it('debería rechazar página menor a 1 en obtenerTrabajadores', async () => {
      await expect(servicioTrabajador.obtenerTrabajadores(0, 20)).rejects.toThrow(
        ErrorValidacion
      );
    });

    it('debería rechazar límite mayor a 100 en obtenerTrabajadores', async () => {
      await expect(servicioTrabajador.obtenerTrabajadores(1, 101)).rejects.toThrow(
        ErrorValidacion
      );
    });

    it('debería rechazar término muy corto en buscarTrabajadores', async () => {
      await expect(servicioTrabajador.buscarTrabajadores('A', 1, 20)).rejects.toThrow(
        ErrorValidacion
      );
    });

    it('debería rechazar término muy largo en buscarTrabajadores', async () => {
      const terminoLargo = 'a'.repeat(101);
      await expect(
        servicioTrabajador.buscarTrabajadores(terminoLargo, 1, 20)
      ).rejects.toThrow(ErrorValidacion);
    });

    it('debería rechazar calificación mínima fuera de rango', async () => {
      await expect(
        servicioTrabajador.obtenerTrabajadoresConCalificacionMinima(6)
      ).rejects.toThrow(ErrorValidacion);
    });
  });

  describe('Métodos que lanzan errores no permitidos', () => {
    it('crearTrabajador debe lanzar ErrorNegocio', async () => {
      await expect(servicioTrabajador.crearTrabajador({} as any)).rejects.toThrow(
        'Operación no permitida desde la API pública'
      );
    });

    it('actualizarTrabajador debe lanzar ErrorNegocio', async () => {
      await expect(servicioTrabajador.actualizarTrabajador('id', {} as any)).rejects.toThrow(
        'Operación no permitida desde la API pública'
      );
    });

    it('desactivarTrabajador debe lanzar ErrorNegocio', async () => {
      await expect(servicioTrabajador.desactivarTrabajador('id')).rejects.toThrow(
        'Operación no permitida desde la API pública'
      );
    });
  });
});
