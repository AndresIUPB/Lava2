import { Router } from 'express';
import { TrabajadorController } from '../controllers/trabajador.controller';
import {
  validacionListarTrabajadores,
  validacionObtenerTrabajador,
  validacionBuscarTrabajador,
  validacionCalificacionMinima,
} from '../middleware/validacionTrabajador';

const router = Router();
const trabajadorController = new TrabajadorController();

/**
 * GET /api/trabajadores/disponibles/lista
 * Obtiene lista de trabajadores disponibles sin paginación.
 * ⚠️ Debe ir ANTES de GET /:id para tener prioridad.
 */
router.get('/disponibles/lista', trabajadorController.obtenerTrabajadoresDisponibles);

/**
 * GET /api/trabajadores/cantidad
 * Obtiene la cantidad total de trabajadores activos.
 * ⚠️ Debe ir ANTES de GET /:id para tener prioridad.
 */
router.get('/cantidad', trabajadorController.obtenerCantidadTrabajadores);

/**
 * GET /api/trabajadores/calificacion/:minima
 * Obtiene trabajadores con calificación promedio >= minima.
 * ⚠️ Debe ir ANTES de GET /:id para tener prioridad.
 */
router.get(
  '/calificacion/:minima',
  validacionCalificacionMinima,
  trabajadorController.obtenerTrabajadoresConCalificacionMinima
);

/**
 * GET /api/trabajadores/buscar/:termino
 * Busca trabajadores por nombre o término.
 * ⚠️ Debe ir ANTES de GET /:id para tener prioridad.
 */
router.get('/buscar/:termino', validacionBuscarTrabajador, trabajadorController.buscarTrabajadores);

/**
 * GET /api/trabajadores
 * Obtiene lista paginada de trabajadores activos.
 */
router.get('/', validacionListarTrabajadores, trabajadorController.obtenerTrabajadores);

/**
 * GET /api/trabajadores/:id
 * Obtiene un trabajador específico por ID.
 * ⚠️ DEBE ir al final para NO interferir con las rutas anteriores.
 */
router.get('/:id', validacionObtenerTrabajador, trabajadorController.obtenerTrabajadorPorId);

export default router;
