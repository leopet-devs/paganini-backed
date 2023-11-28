import { Router } from 'express';
import oauthRoute from './oauth2.router.js';
import paymentRoute from './payment.router.js';
import orderRoute from './order.router.js';
import codeRoute from './code.router.js';
import OAuthMiddleware from '../middleware/auth.js'; 

// Reunion de las rutas que tendra el sistema
const router = Router();

router.use('/oauth', oauthRoute);
router.use(OAuthMiddleware); // Middleware para todas las rutas que no sean la de pedir el token de acceso
router.use('/payment', paymentRoute);
router.use('/order', orderRoute);
router.use('/code', codeRoute);

export default router;
