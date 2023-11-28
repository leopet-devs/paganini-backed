import { Router } from 'express';
import { generateToken } from '../controllers/oauth2.controller.js';
import { consultTransaction } from '../controllers/payment.controller.js';

// Rutas realacionadas a la autenticacion
const router = Router();

router.post('/token', generateToken);
router.post('/consult', consultTransaction);

export default router;
