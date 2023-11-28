import { Router } from 'express';
import { createCode, createCodes } from '../controllers/code.controller.js';

// Rutas realacionadas a la autenticacion
const router = Router();

router.post('/create', createCodes);
router.post('/createAll', createCodes);

export default router;
