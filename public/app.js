const dinero = (numero) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(numero);
const $ = (selector) => document.querySelector(selector);
let temporizador;

function avisar(texto) {
  const mensaje = $('#mensaje');
  mensaje.textContent = texto;
  mensaje.classList.add('visible');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => mensaje.classList.remove('visible'), 3500);
}

async function solicitar(ruta, opciones) {
  const respuesta = await fetch(ruta, opciones);
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error ?? 'Ocurrió un error.');
  return datos;
}

function actualizarCarrito(carrito) {
  const contenedor = $('#items');
  contenedor.replaceChildren();
  if (carrito.items.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.textContent = 'Todavía no agregaste productos.';
    contenedor.append(vacio);
  }
  for (const item of carrito.items) {
    const fila = document.createElement('div');
    fila.className = 'item';
    const detalle = document.createElement('div');
    const nombre = document.createElement('strong');
    nombre.textContent = item.nombre;
    const cantidad = document.createElement('small');
    cantidad.textContent = `${item.cantidad} × ${dinero(item.precio)}`;
    detalle.append(nombre, cantidad);
    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.textContent = 'Quitar';
    quitar.setAttribute('aria-label', `Quitar ${item.nombre}`);
    quitar.addEventListener('click', () => ejecutar(async () => {
      actualizarCarrito(await solicitar(`/api/carrito/${item.id}`, { method: 'DELETE' }));
    }));
    fila.append(detalle, quitar);
    contenedor.append(fila);
  }
  for (const clave of ['subtotal', 'descuento', 'envio', 'total']) {
    $(`#${clave}`).textContent = dinero(carrito[clave]);
  }
  $('#codigo').value = carrito.cupon;
}

async function ejecutar(accion) {
  try { await accion(); } catch (error) { avisar(error.message); }
}

async function iniciar() {
  const productos = await solicitar('/api/productos');
  const contenedor = $('#productos');
  const descripciones = {
    cuaderno: 'Para apuntes, ideas y ejercicios.',
    lapices: 'Un toque de color para cada proyecto.',
    mochila: 'Lleva todo lo necesario a clase.',
    botella: 'Agua fresca durante el día.',
  };
  for (const producto of productos) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'producto';
    tarjeta.innerHTML = `<div class="icono" aria-hidden="true">${producto.icono}</div><h3></h3><p></p><div class="pie"><span class="precio"></span><button type="button">Agregar</button></div>`;
    tarjeta.querySelector('h3').textContent = producto.nombre;
    tarjeta.querySelector('p').textContent = descripciones[producto.id];
    tarjeta.querySelector('.precio').textContent = dinero(producto.precio);
    tarjeta.querySelector('button').addEventListener('click', () => ejecutar(async () => {
      actualizarCarrito(await solicitar('/api/carrito', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: producto.id, cantidad: 1 }),
      }));
      avisar(`${producto.nombre} agregado.`);
    }));
    contenedor.append(tarjeta);
  }
  actualizarCarrito(await solicitar('/api/carrito'));
}

$('#form-cupon').addEventListener('submit', (evento) => {
  evento.preventDefault();
  ejecutar(async () => {
    actualizarCarrito(await solicitar('/api/cupon', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ codigo: $('#codigo').value.trim().toUpperCase() }),
    }));
    avisar('Cupón actualizado.');
  });
});

$('#vaciar').addEventListener('click', () => ejecutar(async () => {
  actualizarCarrito(await solicitar('/api/carrito', { method: 'DELETE' }));
  avisar('Carrito vacío.');
}));

ejecutar(iniciar);
