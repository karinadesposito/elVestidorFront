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
    barcode: "",
    nombre: "",
    marca: "",
    variante: "",
    stock: "",
    costo: "",
    precio: "",
    observaciones: "",
  });

  const [formVariante, setFormVariante] = useState({
    productoId: "",
    variante: "",
    barcode: "",
    stock: "",
    precio: "",
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
    const { name, value } = e.target;
    setFormProducto((prev) => ({ ...prev, [name]: value }));
  }

  function manejarCampoVariante(e) {
    const { name, value } = e.target;
    setFormVariante((prev) => ({ ...prev, [name]: value }));
  }

  async function manejarCrearProducto(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await crearProducto({
        nombre: formProducto.nombre,
        descripcion: formProducto.observaciones,
        sku: formProducto.barcode,
        precio: formProducto.precio ? Number(formProducto.precio) : 0,
        stock: formProducto.stock ? Number(formProducto.stock) : 0,
      });
      setModalAbierto(null);
      setFormProducto({
        barcode: "",
        nombre: "",
        marca: "",
        variante: "",
        stock: "",
        costo: "",
        precio: "",
        observaciones: "",
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
        nombre: formVariante.variante,
        sku: formVariante.barcode,
        precio: formVariante.precio ? Number(formVariante.precio) : 0,
        stock: formVariante.stock ? Number(formVariante.stock) : 0,
      });
      setModalAbierto(null);
      setFormVariante({
        productoId: "",
        variante: "",
        barcode: "",
        stock: "",
        precio: "",
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
                    Nuevo ingreso producto
                  </Boton>

                  <Boton
                    variante="admin"
                    onClick={() => setModalAbierto("variante")}
                  >
                    Nuevo ingreso variante
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
          titulo="Nuevo ingreso producto"
          onClose={() => setModalAbierto(null)}
        >
          <form
            className="estructura__formulario"
            onSubmit={manejarCrearProducto}
          >
            <div className="estructura__campo">
              <label htmlFor="producto-barcode">Barcode</label>
              <input
                id="producto-barcode"
                name="barcode"
                type="text"
                placeholder="Escanear o ingresar codigo"
                value={formProducto.barcode}
                onChange={manejarCampo}
                autoFocus
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-nombre">Nombre producto</label>
              <input
                id="producto-nombre"
                name="nombre"
                type="text"
                value={formProducto.nombre}
                onChange={manejarCampo}
                required
              />
            </div>
          </form>
        </ModalAdmin>
      )}
    </main>
  );
}

export default Productos;
