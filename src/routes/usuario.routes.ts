import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { verificarAutenticacion } from '../middleware/autenticacion';

const router = Router();
const usuarioController = new UsuarioController();

// PUT /usuarios/completar-perfil - requiere autenticación
router.put('/completar-perfil', verificarAutenticacion, usuarioController.completarPerfil);

// GET /usuarios/perfil - obtener perfil del usuario autenticado
router.get('/perfil', verificarAutenticacion, usuarioController.obtenerPerfil);

// PUT /usuarios/perfil - actualizar perfil (parcial)
router.put('/perfil', verificarAutenticacion, usuarioController.actualizarPerfil);

export default router;
