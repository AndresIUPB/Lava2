import { ReservacionService } from '../services/reservacion.service';
import { ErrorValidacion, ErrorNoEncontrado } from '../utils/errores';

describe('ReservacionService', () => {
  let reservacionService: ReservacionService;

  beforeEach(() => {
    reservacionService = new ReservacionService();
  });

  describe('Validaciones de entrada', () => {
    it('debería rechazar página menor a 1', async () => {
      const usuarioId = 'usuario-id';

      await expect(
        reservacionService.obtenerReservacionesPorUsuario(usuarioId, {
          pagina: 0,
          limite: 20,
        })
      ).rejects.toThrow(ErrorValidacion);
    });

    it('debería rechazar límite mayor a 100', async () => {
      const usuarioId = 'usuario-id';

      await expect(
        reservacionService.obtenerReservacionesPorUsuario(usuarioId, {
          pagina: 1,
          limite: 101,
        })
      ).rejects.toThrow(ErrorValidacion);
    });

    it('debería rechazar usuario no encontrado', async () => {
      const usuarioId = 'usuario-no-existe';

      await expect(
        reservacionService.obtenerReservacionesPorUsuario(usuarioId, {
          pagina: 1,
          limite: 20,
        })
      ).rejects.toThrow(ErrorNoEncontrado);
    });

    it('debería rechazar cuando usuario no existe en crear reservación', async () => {
      const datos = {
        usuarioId: 'usuario-no-existe',
        servicioId: 'servicio-id',
        fechaHoraInicio: new Date(Date.now() + 24 * 60 * 60 * 1000),
        direccionServicio: 'Calle 123 #45-67',
      };

      await expect(reservacionService.crearReservacion(datos)).rejects.toThrow(
        ErrorNoEncontrado
      );
    });
  });

  describe('Métodos de obtención', () => {
    it('debería rechazar obtener reservación no encontrada', async () => {
      const usuarioId = 'usuario-id';
      const reservacionId = 'reservacion-no-existe';

      await expect(
        reservacionService.obtenerReservacionPorId(reservacionId, usuarioId)
      ).rejects.toThrow(ErrorNoEncontrado);
    });

    it('debería rechazar obtener reservación pendiente de calificación con usuario no encontrado', async () => {
      const usuarioId = 'usuario-no-existe';

      await expect(
        reservacionService.obtenerReservacionesPendientesCalificacion(usuarioId)
      ).rejects.toThrow(ErrorNoEncontrado);
    });

    it('debería rechazar historial con usuario no encontrado', async () => {
      const usuarioId = 'usuario-no-existe';

      await expect(
        reservacionService.obtenerHistorialReservaciones(usuarioId)
      ).rejects.toThrow(ErrorNoEncontrado);
    });

    it('debería rechazar contar completadas con usuario no encontrado', async () => {
      const usuarioId = 'usuario-no-existe';

      await expect(
        reservacionService.contarReservacionesCompletadas(usuarioId)
      ).rejects.toThrow(ErrorNoEncontrado);
    });
  });
});
