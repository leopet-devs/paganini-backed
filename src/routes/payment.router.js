import { Router } from 'express';
import * as PaymentController from '../controllers/payment.controller.js';

// Rutas realacionadas a la autenticacion
const router = Router();

router.post('/checkout', PaymentController.startTransaction);
router.post('/confirm', PaymentController.settleTransaction);
router.post('/destroy', PaymentController.destroyTransaction);
router.post('/consult', PaymentController.consultTransaction);

export default router;
