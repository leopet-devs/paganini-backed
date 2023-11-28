import { createClient } from 'redis';

const client = createClient();
client.on('error', (err) => console.log('Error al conectarse con REDIS', err));
await client.connect();

export default client;
