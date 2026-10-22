import { createServer as createHttpServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { crearCarrito, productos } from './tienda.js';

const archivos = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
};

function json(res, estado, datos) {
  res.writeHead(estado, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(datos));
}

async function leerJson(req) {
  let texto = '';
  for await (const bloque of req) {
    texto += bloque;
    if (texto.length > 10_000) throw new Error('Solicitud demasiado grande.');
  }
  try {
    return JSON.parse(texto || '{}');
  } catch {
    throw new Error('El cuerpo debe ser JSON válido.');
  }
}

export function crearServidor() {
  const carrito = crearCarrito();
  return createHttpServer(async (req, res) => {
    try {
      const ruta = new URL(req.url, 'http://localhost').pathname;
      if (req.method === 'GET' && ruta === '/api/health') {
        return json(res, 200, { estado: 'ok' });
      }
      if (req.method === 'GET' && ruta === '/api/productos') {
        return json(res, 200, productos);
      }
      if (req.method === 'GET' && ruta === '/api/carrito') {
        return json(res, 200, carrito.ver());
      }
      if (req.method === 'POST' && ruta === '/api/carrito') {
        const { id, cantidad } = await leerJson(req);
        return json(res, 201, carrito.agregar(id, cantidad));
      }
      if (req.method === 'DELETE' && ruta === '/api/carrito') {
        return json(res, 200, carrito.vaciar());
      }
      if (req.method === 'DELETE' && ruta.startsWith('/api/carrito/')) {
        return json(res, 200, carrito.quitar(decodeURIComponent(ruta.slice(13))));
      }
      if (req.method === 'POST' && ruta === '/api/cupon') {
        const { codigo } = await leerJson(req);
        return json(res, 200, carrito.aplicarCupon(codigo));
      }
      if (req.method === 'GET' && archivos[ruta]) {
        const [nombre, tipo] = archivos[ruta];
        const contenido = await readFile(join(process.cwd(), 'public', nombre));
        res.writeHead(200, { 'content-type': tipo });
        return res.end(contenido);
      }
      return json(res, 404, { error: 'Ruta no encontrada.' });
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
  });
}
