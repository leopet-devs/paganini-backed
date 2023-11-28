import { Router } from 'express';
import { createOrder } from '../controllers/order.controller.js';

// Rutas realacionadas a la autenticacion
const router = Router();

router.post('/create', createOrder);

export default router;
