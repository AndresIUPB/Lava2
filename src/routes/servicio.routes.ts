/**
 * Rutas de Servicios
 * Define todos los endpoints para operaciones con servicios de lavado
 */

import { Router } from 'express';
import { ServicioController } from '../controllers/servicio.controller';
import {
  validacionIdServicio,
  validacionTerminoBusqueda,
  validacionPaginacion,
} from '../middleware/validacionServicios';

const router = Router();
const servicioController = new ServicioController();

/**
 * GET /api/servicios
 * Obtiene el catálogo completo de servicios (paginado)
 *
 * Query parameters:
 * - pagina: número de página (default: 1)
 * - limite: registros por página (default: 20, máximo: 100)
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   mensaje: "Catálogo de servicios obtenido exitosamente",
 *   data: {
 *     servicios: [...],
 *     total: number,
 *     paginas: number,
 *     paginaActual: number
 *   }
 * }
 */
router.get('/', validacionPaginacion, servicioController.obtenerCatalogo);

/**
 * GET /api/servicios/disponibles/lista
 * Obtiene todos los servicios disponibles sin paginación
 * Útil para listados simples en dropdowns
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   mensaje: "Servicios disponibles obtenidos",
 *   data: {
 *     servicios: [...],
 *     cantidad: number
 *   }
 * }
 */
router.get('/disponibles/lista', servicioController.obtenerServiciosDisponibles);

/**
 * GET /api/servicios/cantidad
 * Obtiene la cantidad de servicios disponibles
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   mensaje: "Cantidad de servicios obtenida",
 *   data: { cantidad: number }
 * }
 */
router.get('/cantidad', servicioController.obtenerCantidadServicios);

/**
 * GET /api/servicios/buscar/:termino
 * Busca servicios por nombre
 *
 * Path parameters:
 * - termino: término de búsqueda (mínimo 2 caracteres)
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   mensaje: "Búsqueda de servicios completada",
 *   data: {
 *     servicios: [...],
 *     cantidad: number
 *   }
 * }
 */
router.get('/buscar/:termino', validacionTerminoBusqueda, servicioController.buscarServicios);

/**
 * GET /api/servicios/:id
 * Obtiene los detalles de un servicio específico
 *
 * Path parameters:
 * - id: ID del servicio (UUID)
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   mensaje: "Detalles del servicio obtenidos exitosamente",
 *   data: {
 *     id: string,
 *     nombre: string,
 *     descripcion: string,
 *     precio: number,
 *     duracionMinutos: number,
 *     imagenUrl: string | null,
 *     activo: boolean,
 *     creadoEn: datetime,
 *     actualizadoEn: datetime
 *   }
 * }
 *
 * Errores:
 * - 404: El servicio no existe
 * - 400: El servicio no está disponible
 */
router.get('/:id', validacionIdServicio, servicioController.obtenerServicioPorId);

export default router;
