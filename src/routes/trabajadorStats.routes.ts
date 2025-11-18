import { Router } from 'express';
import { TrabajadorStatsController } from '../controllers/trabajadorStats.controller';
import { verificarAutenticacion } from '../middleware/autenticacion';
import {
  validacionEstadisticas,
  validacionEstadisticasMensuales,
  validacionMejoresTrabajadores,
} from '../middleware/validacionTrabajadorStats';

const router = Router();
const statsController = new TrabajadorStatsController();

// GET /api/trabajadores/ranking/mejores (LITERAL - antes que /:id/...)
router.get('/ranking/mejores', validacionMejoresTrabajadores, statsController.obtenerMejoresTrabajadores);

// GET /api/trabajadores/:id/estadisticas/mensuales (LITERAL en /mensuales)
router.get(
  '/:id/estadisticas/mensuales',
  verificarAutenticacion,
  validacionEstadisticasMensuales,
  statsController.obtenerEstadisticasMensuales
);

// GET /api/trabajadores/:id/estadisticas (GENERAL)
router.get(
  '/:id/estadisticas',
  verificarAutenticacion,
  validacionEstadisticas,
  statsController.obtenerEstadisticas
);

export default router;
