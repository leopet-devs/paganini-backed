import { PORT } from './config/index.js'; // Puerto
import app from './app.js'; // Configuracion de la app

app.listen(PORT, function(){
  console.log(`Servidor en el puerto: ${PORT}`);
});
