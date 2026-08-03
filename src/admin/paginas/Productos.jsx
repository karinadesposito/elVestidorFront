import { useEffect, useState } from "react";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import ModalAdmin from "../componentes/ModalAdmin";
import {
  obtenerProductos,
  obtenerCatalogosOpciones,
  contarPorEstado,
  crearProducto,
  crearVariante,
} from "../servicios/productosService";

import "../../estilos/admin-productos.css";

const MARCAS = ["LEVI'S", "TROWN", "EQUUS"];

const TIPOS_PRODUCTO = [
  "Jean",
  "Pantalón",
  "Campera",
  "Suéter",
  "Buzo",
  "Camisa",
  "Remera",
  "Falda",
  "Vestido",
  "Short",
  "Bermuda",
  "Accesorio",
];

const FORM_PRODUCTO_INICIAL = {
  nombre: "",
  marca: "",
  tipoProducto: "",
  genero: "",
  descripcion: "",
  activo: true,
};

const FORM_VARIANTE_INICIAL = {
  productoId: "",
  colorId: "",
  tipoTalle: "",
  talleId: "",
  barcode: "",
  precio: "",
  activo: true,
};

function Productos() {
  const [productos, setProductos] = useState([]);
  const [resumenProductos, setResumenProductos] = useState([]);
  const [catalogos, setCatalogos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formProducto, setFormProducto] = useState(
    FORM_PRODUCTO_INICIAL,
  );

  const [formVariante, setFormVariante] = useState(
    FORM_VARIANTE_INICIAL,
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError(null);

    try {
      const [respuestaProductos, respuestaCatalogos] =
        await Promise.all([
          obtenerProductos(),
          obtenerCatalogosOpciones(),
        ]);

      setProductos(respuestaProductos.productos);

      setResumenProductos(
        contarPorEstado(respuestaProductos.productos),
      );

      setCatalogos(respuestaCatalogos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function manejarCampoProducto(e) {
    const { name, value, type, checked } = e.target;

    setFormProducto((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function manejarCampoVariante(e) {
    const { name, value, type, checked } = e.target;

    setFormVariante((anterior) => {
      if (name === "tipoTalle") {
        return {
          ...anterior,
          tipoTalle: value,
          talleId: "",
        };
      }

      return {
        ...anterior,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  }

  function abrirModalProducto() {
    setError(null);
    setModalAbierto("producto");
  }

  function abrirModalVariante(productoId = "") {
    setError(null);

    setFormVariante({
      ...FORM_VARIANTE_INICIAL,
      productoId,
    });

    setModalAbierto("variante");
  }

  function cerrarModal() {
    if (guardando) {
      return;
    }

    setModalAbierto(null);
  }

  async function manejarCrearProducto(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      await crearProducto({
        nombre: formProducto.nombre,
        marca: formProducto.marca,
        genero: formProducto.genero,
        tipoProducto: formProducto.tipoProducto,
        descripcion: formProducto.descripcion,
        activo: formProducto.activo,
      });

      setFormProducto(FORM_PRODUCTO_INICIAL);
      setModalAbierto(null);

      await cargarDatos();
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
        colorId: formVariante.colorId,
        tipoTalle: formVariante.tipoTalle,
        talleId: formVariante.talleId,
        sku: formVariante.barcode,
        precio: formVariante.precio,
        activo: formVariante.activo,
      });

      setFormVariante(FORM_VARIANTE_INICIAL);
      setModalAbierto(null);

      await cargarDatos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function obtenerOpcionesTalle() {
    if (!catalogos) {
      return [];
    }

    if (formVariante.tipoTalle === "alfabetico") {
      return catalogos.talleAlfabetico.opciones;
    }

    if (formVariante.tipoTalle === "numerico") {
      return catalogos.talleNumerico.opciones;
    }

    return [];
  }

  const opcionesTalle = obtenerOpcionesTalle();

  const usaTalle =
    formVariante.tipoTalle === "alfabetico" ||
    formVariante.tipoTalle === "numerico";

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Productos</h1>
          </div>
        </header>

        {error && (
          <p className="login-admin__error">{error}</p>
        )}

        {!cargando && (
          <>
            <section
              className="estructura__resumen"
              aria-label="Resumen de productos"
            >
              {resumenProductos.map((item) => (
                <article
                  className={`estructura__tarjeta ${item.color}`}
                  key={item.nombre}
                >
                  <span>{item.nombre}</span>
                  <strong>{item.cantidad}</strong>
                </article>
              ))}
            </section>

            <section className="estructura__panel">
              <div className="estructura__panel-encabezado">
                <h2>Listado de productos</h2>

                <div className="estructura__panel-acciones">
                  <Boton
                    variante="admin"
                    onClick={abrirModalProducto}
                  >
                    Nuevo producto
                  </Boton>

                  <Boton
                    variante="admin"
                    onClick={() => abrirModalVariante()}
                    disabled={!catalogos}
                  >
                    Nueva variante
                  </Boton>
                </div>
              </div>

              <div className="estructura__tabla">
                <div className="estructura__tabla-cabecera admin-productos__cabecera">
                  <span>Nombre</span>
                  <span>Marca</span>
                  <span>Género</span>
                  <span>Tipo de producto</span>
                  <span>Variantes</span>
                  <span>Activo</span>
                  <span>Acciones</span>
                </div>

                {productos.length === 0 && (
                  <p>No hay productos para mostrar.</p>
                )}

                {productos.map((producto) => (
                  <article
                    className="estructura__tabla-fila admin-productos__fila"
                    key={producto.id}
                  >
                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Nombre
                      </span>

                      <button
                        className="estructura__tabla-boton"
                        type="button"
                      >
                        {producto.nombre}
                      </button>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Marca
                      </span>

                      <span>{producto.marca || "—"}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Género
                      </span>

                      <span>{producto.genero || "—"}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Tipo de producto
                      </span>

                      <span>
                        {producto.tipoProducto || "—"}
                      </span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Variantes
                      </span>

                      <strong>
                        {producto.cantidadVariantes}
                      </strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Activo
                      </span>

                      <span>
                        {producto.activo ? "Sí" : "No"}
                      </span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Acciones
                      </span>

                      <Boton
                        variante="admin"
                        onClick={() =>
                          abrirModalVariante(producto.id)
                        }
                        disabled={!catalogos}
                      >
                        Agregar variante
                      </Boton>
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
          onClose={cerrarModal}
          formId="formulario-nuevo-producto"
        >
          <form
            id="formulario-nuevo-producto"
            className="estructura__formulario"
            onSubmit={manejarCrearProducto}
          >
            <div className="estructura__campo">
              <label htmlFor="producto-nombre">
                Nombre
              </label>

              <input
                id="producto-nombre"
                name="nombre"
                type="text"
                value={formProducto.nombre}
                onChange={manejarCampoProducto}
                required
                autoFocus
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-marca">
                Marca
              </label>

              <select
                id="producto-marca"
                name="marca"
                value={formProducto.marca}
                onChange={manejarCampoProducto}
                required
              >
                <option value="">
                  Seleccionar marca
                </option>

                {MARCAS.map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-genero">
                Género
              </label>

              <select
                id="producto-genero"
                name="genero"
                value={formProducto.genero}
                onChange={manejarCampoProducto}
                required
              >
                <option value="">
                  Seleccionar género
                </option>

                <option value="Mujer">Mujer</option>
                <option value="Hombre">Hombre</option>
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-tipo">
                Tipo de producto
              </label>

              <select
                id="producto-tipo"
                name="tipoProducto"
                value={formProducto.tipoProducto}
                onChange={manejarCampoProducto}
                required
              >
                <option value="">
                  Seleccionar tipo de producto
                </option>

                {TIPOS_PRODUCTO.map((tipoProducto) => (
                  <option
                    key={tipoProducto}
                    value={tipoProducto}
                  >
                    {tipoProducto}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-descripcion">
                Descripción
              </label>

              <textarea
                id="producto-descripcion"
                name="descripcion"
                value={formProducto.descripcion}
                onChange={manejarCampoProducto}
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-activo">
                Activo
              </label>

              <input
                id="producto-activo"
                name="activo"
                type="checkbox"
                checked={formProducto.activo}
                onChange={manejarCampoProducto}
              />
            </div>

            {guardando && <p>Guardando...</p>}
          </form>
        </ModalAdmin>
      )}

      {modalAbierto === "variante" && (
        <ModalAdmin
          titulo="Nueva variante"
          onClose={cerrarModal}
          formId="formulario-nueva-variante"
        >
          <form
            id="formulario-nueva-variante"
            className="estructura__formulario"
            onSubmit={manejarCrearVariante}
          >
            <div className="estructura__campo">
              <label htmlFor="variante-producto">
                Producto
              </label>

              <select
                id="variante-producto"
                name="productoId"
                value={formVariante.productoId}
                onChange={manejarCampoVariante}
                required
                autoFocus
              >
                <option value="">
                  Seleccionar producto
                </option>

                {productos.map((producto) => (
                  <option
                    key={producto.id}
                    value={producto.id}
                  >
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-color">
                Color
              </label>

              <select
                id="variante-color"
                name="colorId"
                value={formVariante.colorId}
                onChange={manejarCampoVariante}
                required
              >
                <option value="">
                  Seleccionar color
                </option>

                {catalogos?.color.opciones.map((opcion) => (
                  <option
                    key={opcion.id}
                    value={opcion.id}
                  >
                    {opcion.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-tipo-talle">
                Tipo de talle
              </label>

              <select
                id="variante-tipo-talle"
                name="tipoTalle"
                value={formVariante.tipoTalle}
                onChange={manejarCampoVariante}
                required
              >
                <option value="">
                  Seleccionar tipo de talle
                </option>

                <option value="alfabetico">
                  Alfabético
                </option>

                <option value="numerico">
                  Numérico
                </option>

                <option value="sin-talle">
                  Sin talle
                </option>
              </select>
            </div>

            {usaTalle && (
              <div className="estructura__campo">
                <label htmlFor="variante-talle">
                  Talle
                </label>

                <select
                  id="variante-talle"
                  name="talleId"
                  value={formVariante.talleId}
                  onChange={manejarCampoVariante}
                  required
                >
                  <option value="">
                    Seleccionar talle
                  </option>

                  {opcionesTalle.map((opcion) => (
                    <option
                      key={opcion.id}
                      value={opcion.id}
                    >
                      {opcion.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="estructura__campo">
              <label htmlFor="variante-barcode">
                Barcode
              </label>

              <input
                id="variante-barcode"
                name="barcode"
                type="text"
                value={formVariante.barcode}
                onChange={manejarCampoVariante}
                autoComplete="off"
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-precio">
                Precio
              </label>

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
              <label htmlFor="variante-activo">
                Activo
              </label>

              <input
                id="variante-activo"
                name="activo"
                type="checkbox"
                checked={formVariante.activo}
                onChange={manejarCampoVariante}
              />
            </div>

            {guardando && <p>Guardando...</p>}
          </form>
        </ModalAdmin>
      )}
    </main>
  );
}

export default Productos;