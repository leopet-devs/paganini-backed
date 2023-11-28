import mongoose from "mongoose";
import { URI } from '../config/index.js';

// Conexion con la base de datos
const options = { useUnifiedTopology: true, useNewUrlParser: true };

mongoose.connect(URI, options)
  .then(() => console.log('Base de datos conectada'))
  .catch(e => console.log('Error db: ', e));
