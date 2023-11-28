import twilio from 'twilio';
import { TWILIO_TOKEN, TWILIO_SID } from '../config/index.js';

// INICIAR CONEXION CON TWILIO
let twilioClient;
try {
  twilioClient = twilio(TWILIO_SID, TWILIO_TOKEN);
} catch (e) {
  console.error(e);
  twilioClient = undefined;
}

export default twilioClient;


// el numero se recibira en la peticion
//const message = await twilioClient.messages.create({
//  body: "Verification code 430349",
//  from: TWILIO_NUMBER,
//  to: "+593997080815"
//})
