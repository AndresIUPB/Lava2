import { Router } from 'express';
import { HistorialController } from '../controllers/historial.controller';
import { verificarAutenticacion } from '../middleware/autenticacion';
import {
  validacionEstadisticas,
  validacionEstadisticasMensuales,
  validacionHistorialFiltrado,
  validacionResumen,
} from '../middleware/validacionHistorial';

const router = Router();
const historialController = new HistorialController();

/**
 * Rutas de Historial - Estadísticas y análisis
 *
 * ORDEN CRÍTICO DE RUTAS (literales antes de dinámicos):
 * 1. /estadisticas/mensuales - LITERAL
 * 2. /estadisticas - LITERAL (pero va después de mensuales)
 * 3. /resumen - LITERAL
 * 4. /filtrado - LITERAL
 */

// Rutas de estadísticas
router.get(
  '/estadisticas/mensuales',
  verificarAutenticacion,
  validacionEstadisticasMensuales,
  historialController.obtenerEstadisticasMensuales
);

router.get(
  '/estadisticas',
  verificarAutenticacion,
  validacionEstadisticas,
  historialController.obtenerEstadisticas
);

// Rutas de análisis y filtrado
router.get(
  '/resumen',
  verificarAutenticacion,
  validacionResumen,
  historialController.obtenerResumen
);

router.get(
  '/filtrado',
  verificarAutenticacion,
  validacionHistorialFiltrado,
  historialController.obtenerHistorialFiltrado
);

export default router;
