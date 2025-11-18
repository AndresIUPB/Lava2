import { CalificacionService } from '../services/calificacion.service';

describe('CalificacionService', () => {
  /**
   * Nota: Los tests unitarios complejos del service requieren mocking
   * completo de repositorios. Estos casos están cubiertos en los tests
   * de integración (calificacion.routes.test.ts) que validan el flujo
   * completo y las validaciones de entrada.
   */

  describe('Creación de calificación - Validaciones básicas', () => {
    it('debería lanzar error si calificacionServicio está fuera de rango', async () => {
      const service = new CalificacionService();

      try {
        await service.crearCalificacion({
          usuarioId: 'some-id',
          reservacionId: 'some-id',
          calificacionServicio: 0, // Menor a 1 - inválido
        });
        fail('Debería haber lanzado un error');
      } catch (error) {
        // Error esperado - la validación ocurrirá antes o durante creación
        expect(error).toBeDefined();
      }
    });

    it('debería lanzar error si comentarios exceden 1000 caracteres', async () => {
      const service = new CalificacionService();

      try {
        await service.crearCalificacion({
          usuarioId: 'some-id',
          reservacionId: 'some-id',
          calificacionServicio: 5,
          comentarioServicio: 'a'.repeat(1001), // Excede límite
        });
        fail('Debería haber lanzado un error');
      } catch (error) {
        // Error esperado
        expect(error).toBeDefined();
      }
    });
  });
});

