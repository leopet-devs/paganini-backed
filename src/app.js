import express from 'express';
import logger from 'morgan'; // Logger -> Mostrar peticiones
import cors from 'cors';
import router from './routes/index.js';
import './database/db.js'; // Conexion a la base de datos

// Archivo de configuracion de toda la aplicacion 
const app = express();

// Configuracion de express 
app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Morgan
logger.token('date', function(){
  return new Date().toLocaleString();
});
app.use(logger("common"));

// Cors
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use('/api/v1', router); // Rutas del Sistema

export default app;
