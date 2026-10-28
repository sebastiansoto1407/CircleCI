import { sumar, restar } from './calculadora.js';

export const productos = Object.freeze([
  { id: 'cuaderno', nombre: 'Cuaderno', precio: 12.5, icono: '📓' },
  { id: 'lapices', nombre: 'Lápices de colores', precio: 24, icono: '✏️' },
  { id: 'mochila', nombre: 'Mochila', precio: 85, icono: '🎒' },
  { id: 'botella', nombre: 'Botella reutilizable', precio: 38, icono: '🥤' },
]);

const redondear = (valor) => Math.round((valor + Number.EPSILON) * 100) / 100;

export function calcularResumen(items, cupon = '') {
  const subtotal = redondear(items.reduce(
    (acumulado, item) => sumar(acumulado, redondear(item.precio * item.cantidad)), 0,
  ));
  const descuento = cupon === 'AHORRA20' ? redondear(subtotal * 0.1) : 0;
  const envio = subtotal === 0 || subtotal >= 100 ? 0 : 10;
  const total = redondear(sumar(restar(subtotal, descuento), envio));
  return { subtotal, descuento, envio, total };
}

export function crearCarrito() {
  const cantidades = new Map();
  let cupon = '';

  function ver() {
    const items = productos
      .filter((producto) => cantidades.has(producto.id))
      .map((producto) => ({ ...producto, cantidad: cantidades.get(producto.id) }));
    return { items, cupon, ...calcularResumen(items, cupon) };
  }

  function agregar(id, cantidad = 1) {
    if (!productos.some((producto) => producto.id === id)) {
      throw new Error('Producto no encontrado.');
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10) {
      throw new Error('La cantidad debe ser un entero entre 1 y 10.');
    }
    const nuevaCantidad = (cantidades.get(id) ?? 0) + cantidad;
    if (nuevaCantidad > 10) {
      throw new Error('Máximo 10 unidades por producto.');
    }
    cantidades.set(id, nuevaCantidad);
    return ver();
  }

  function quitar(id) {
    if (!cantidades.delete(id)) {
      throw new Error('Ese producto no está en el carrito.');
    }
    return ver();
  }

  function aplicarCupon(codigo) {
    if (codigo !== '' && codigo !== 'AHORRA10') {
      throw new Error('Cupón inválido. Prueba AHORRA10.');
    }
    cupon = codigo;
    return ver();
  }

  function vaciar() {
    cantidades.clear();
    cupon = '';
    return ver();
  }

  return { ver, agregar, quitar, aplicarCupon, vaciar };
}
