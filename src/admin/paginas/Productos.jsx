import { useState, useEffect } from "react";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import ModalAdmin from "../componentes/ModalAdmin";
import {
  obtenerProductos,
  contarPorEstado,
  crearProducto,
  crearVariante,
} from "../servicios/productosService";

import "../../estilos/admin-productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formProducto, setFormProducto] = useState({
    nombre: "",
    marca: "",
    categoria: "",
    genero: "",
    descripcion: "",
    activo: true,
  });

  const [formVariante, setFormVariante] = useState({
    productoId: "",
    color: "",
    talle: "",
    barcode: "",
    precio: "",
    activo: true,
  });

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      const { productos: datos } = await obtenerProductos();
      setProductos(datos);
      setCategorias(contarPorEstado(datos));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function manejarCampo(e) {
    const { name, value, type, checked } = e.target;
    setFormProducto((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function manejarCampoVariante(e) {
    const { name, value, type, checked } = e.target;
    setFormVariante((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function manejarCrearProducto(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await crearProducto({
        nombre: formProducto.nombre,
        descripcion: formProducto.descripcion,
      });
      setModalAbierto(null);
      setFormProducto({
        nombre: "",
        marca: "",
        categoria: "",
        genero: "",
        descripcion: "",
        activo: true,
      });
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCrearVariante(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await crearVariante({
        productId: formVariante.productoId,
        nombre: `${formVariante.color} - ${formVariante.talle}`,
        sku: formVariante.barcode,
        precio: Number(formVariante.precio),
        stock: 0,
      });
      setModalAbierto(null);
      setFormVariante({
        productoId: "",
        color: "",
        talle: "",
        barcode: "",
        precio: "",
        activo: true,
      });
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Productos</h1>
          </div>
        </header>

        {error && <p className="login-admin__error">{error}</p>}

        {!cargando && (
          <>
            <section
              className="estructura__resumen"
              aria-label="Categorias de productos"
            >
              {categorias.map((categoria) => (
                <article
                  className={`estructura__tarjeta ${categoria.color}`}
                  key={categoria.nombre}
                >
                  <span>{categoria.nombre}</span>
                  <strong>{categoria.cantidad}</strong>
                </article>
              ))}
            </section>

            <section className="estructura__panel">
              <div className="estructura__panel-encabezado">
                <h2>Listado de productos</h2>

                <div className="estructura__panel-acciones">
                  <Boton
                    variante="admin"
                    onClick={() => setModalAbierto("producto")}
                  >
                    Nuevo producto
                  </Boton>

                  <Boton
                    variante="admin"
                    onClick={() => setModalAbierto("variante")}
                  >
                    Nueva variante
                  </Boton>
                </div>
              </div>

              <div className="estructura__tabla">
                <div className="estructura__tabla-cabecera admin-productos__cabecera">
                  <span>Barcode</span>
                  <span>Nombre</span>
                  <span>Marca</span>
                  <span>Variante</span>
                  <span>Stock</span>
                  <span>Costo</span>
                  <span>Precio</span>
                  <span>Observaciones</span>
                </div>

                {productos.length === 0 && (
                  <p>No hay productos para mostrar.</p>
                )}

                {productos.map((producto) => (
                  <article
                    className={`estructura__tabla-fila admin-productos__fila ${producto.color}`}
                    key={producto.id}
                  >
                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Barcode
                      </span>
                      <strong>{producto.barcode}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Nombre</span>
                      <button className="estructura__tabla-boton" type="button">
                        {producto.nombre}
                      </button>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Marca</span>
                      <span>—</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Variante
                      </span>
                      <span>{producto.variante}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Stock</span>
                      <strong>{producto.stock}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Costo</span>
                      <strong>—</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Precio</span>
                      <strong>{producto.precio}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Observaciones
                      </span>
                      <span>{producto.descripcion || "—"}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </Contenedor>

      {modalAbierto === "producto" && (
        <ModalAdmin
          titulo="Nuevo producto"
          onClose={() => setModalAbierto(null)}
          formId="formulario-nuevo-producto"
        >
          <form
            id="formulario-nuevo-producto"
            className="estructura__formulario"
            onSubmit={manejarCrearProducto}
          >
            <div className="estructura__campo">
              <label htmlFor="producto-nombre">Nombre</label>
              <input
                id="producto-nombre"
                name="nombre"
                type="text"
                value={formProducto.nombre}
                onChange={manejarCampo}
                required
                autoFocus
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-marca">Marca</label>
              <input
                id="producto-marca"
                name="marca"
                type="text"
                value={formProducto.marca}
                onChange={manejarCampo}
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-categoria">Categoría</label>
              <input
                id="producto-categoria"
                name="categoria"
                type="text"
                value={formProducto.categoria}
                onChange={manejarCampo}
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-genero">Género</label>
              <select
                id="producto-genero"
                name="genero"
                value={formProducto.genero}
                onChange={manejarCampo}
              >
                <option value="">Seleccionar género</option>
                <option value="Mujer">Mujer</option>
                <option value="Hombre">Hombre</option>
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-descripcion">Descripción</label>
              <textarea
                id="producto-descripcion"
                name="descripcion"
                value={formProducto.descripcion}
                onChange={manejarCampo}
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-activo">Activo</label>
              <input
                id="producto-activo"
                name="activo"
                type="checkbox"
                checked={formProducto.activo}
                onChange={manejarCampo}
              />
            </div>
          </form>
        </ModalAdmin>
      )}

      {modalAbierto === "variante" && (
        <ModalAdmin
          titulo="Nueva variante"
          onClose={() => setModalAbierto(null)}
          formId="formulario-nueva-variante"
        >
          <form
            id="formulario-nueva-variante"
            className="estructura__formulario"
            onSubmit={manejarCrearVariante}
          >
            <div className="estructura__campo">
              <label htmlFor="variante-producto">Producto</label>
              <select
                id="variante-producto"
                name="productoId"
                value={formVariante.productoId}
                onChange={manejarCampoVariante}
                required
                autoFocus
              >
                <option value="">Seleccionar producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-color">Color</label>
              <input
                id="variante-color"
                name="color"
                type="text"
                value={formVariante.color}
                onChange={manejarCampoVariante}
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-talle">Talle</label>
              <input
                id="variante-talle"
                name="talle"
                type="text"
                value={formVariante.talle}
                onChange={manejarCampoVariante}
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-barcode">Barcode</label>
              <input
                id="variante-barcode"
                name="barcode"
                type="text"
                value={formVariante.barcode}
                onChange={manejarCampoVariante}
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-precio">Precio</label>
              <input
                id="variante-precio"
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={formVariante.precio}
                onChange={manejarCampoVariante}
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-activo">Activo</label>
              <input
                id="variante-activo"
                name="activo"
                type="checkbox"
                checked={formVariante.activo}
                onChange={manejarCampoVariante}
              />
            </div>
          </form>
        </ModalAdmin>
      )}
    </main>
  );
}

export default Productos;
