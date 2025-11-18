import { Router } from 'express';
import { MetodoPagoController } from '../controllers/metodoPago.controller';
import { verificarAutenticacion } from '../middleware/autenticacion';
import {
  validacionCrearMetodoPago,
  validacionObtenerMetodoPago,
  validacionDesactivarMetodoPago,
  validacionMarcarPrincipal,
} from '../middleware/validacionMetodoPago';

const router = Router();
const metodoPagoController = new MetodoPagoController();

// ⚠️ Rutas específicas (ANTES de dinámicas con :id)
router.get('/principal', verificarAutenticacion, metodoPagoController.obtenerMetodoPagoPrincipal);
router.get('/cantidad', verificarAutenticacion, metodoPagoController.contarMetodosPago);

// Rutas generales
router.get('/', verificarAutenticacion, metodoPagoController.obtenerMetodosPago);

router.post('/', verificarAutenticacion, validacionCrearMetodoPago, metodoPagoController.crearMetodoPago);

// Rutas dinámicas (DESPUÉS de específicas)
router.get('/:id', verificarAutenticacion, validacionObtenerMetodoPago, metodoPagoController.obtenerMetodoPago);

router.patch('/:id/principal', verificarAutenticacion, validacionMarcarPrincipal, metodoPagoController.marcarComoPrincipal);

router.delete('/:id', verificarAutenticacion, validacionDesactivarMetodoPago, metodoPagoController.desactivarMetodoPago);

export default router;
