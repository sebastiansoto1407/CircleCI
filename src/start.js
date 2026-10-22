import { crearServidor } from './server.js';

const puerto = Number(process.env.PORT ?? 3000);
crearServidor().listen(puerto, () => {
  console.log(`Tienda lista en http://localhost:${puerto}`);
});
