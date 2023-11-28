import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3500;
// VARIABLES QUE DEBEN EXISTIR EN EL ENTORNO DE DESARROLLO Y PRODUCCION

// GENERAL
export const URI = process.env.URI;
export const TOKEN_SECRET = process.env.SECRET;
export const EXPIRE_TIME = parseInt(process.env.EXPIRE_TIME);
export const PRIV_KEY_PATH = process.env.PRIV_KEY;

// BRAINTREE
export const ENV = process.env.BT_ENVIRONMENT;
export const MERCHANT = process.env.BT_MERCHANT_ID;
export const PUBLIC_KEY = process.env.BT_PUBLIC_KEY;
export const PRIV_KEY_BT = process.env.BT_PRIVATE_KEY;

// TWILIO
export const TWILIO_SID = process.env.ACCOUNT_SID_TWILIO;
export const TWILIO_TOKEN = process.env.AUTH_TOKEN_TWILIO;
export const TWILIO_NUMBER = process.env.NUMBER_TWILIO;
export const CODE_EXP_TIME = process.env.MSG_EXP;
