import { Fragment, useEffect, useState } from "react";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import ModalAdmin from "../componentes/ModalAdmin";

import {
  obtenerProductos,
  obtenerCatalogosProducto,
  obtenerOpcionesProducto,
  contarPorEstado,
  crearProducto,
  crearVariante,
  buscarProductosPorNombre,
  analizarCoincidenciasNombre,
} from "../servicios/productosService";

import "../../estilos/admin-productos.css";
import VariantesProducto from "../componentes/VariantesProducto";
const COLORES_REFERENCIA = [
  "Negro",
  "Blanco",
  "Gris",
  "Azul",
  "Azul marino",
  "Celeste",
  "Rojo",
  "Bordo",
  "Verde",
  "Verde oliva",
  "Beige",
  "Marrón",
  "Camel",
  "Amarillo",
  "Naranja",
  "Rosa",
  "Violeta",
  "Lila",
  "Chocolate",
  "Multicolor",
];

const TALLES_ALFABETICOS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const TALLES_NUMERICOS = [
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  "50",
  "52",
  "54",
  "56",
  "58",
  "60",
];

function normalizarBusqueda(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerValoresSinRepetidos(...listas) {
  const valores = listas.flat();
  const mapa = new Map();

  valores.forEach((valor) => {
    const nombre = typeof valor === "string" ? valor : valor?.nombre;

    if (!nombre) {
      return;
    }

    const clave = normalizarBusqueda(nombre);

    if (!mapa.has(clave)) {
      mapa.set(clave, nombre);
    }
  });

  return Array.from(mapa.values());
}

function filtrarSugerencias(valores, busqueda) {
  const termino = normalizarBusqueda(busqueda);

  if (!termino) {
    return [];
  }

  return valores.filter((valor) =>
    normalizarBusqueda(valor).startsWith(termino),
  );
}

function obtenerValorCanonico(valores, valorIngresado) {
  const termino = normalizarBusqueda(valorIngresado);

  if (!termino) {
    return valorIngresado;
  }

  const coincidenciaExacta = valores.find(
    (valor) => normalizarBusqueda(valor) === termino,
  );

  if (coincidenciaExacta) {
    return coincidenciaExacta;
  }

  const coincidenciasParciales = valores.filter((valor) =>
    normalizarBusqueda(valor).startsWith(termino),
  );

  if (coincidenciasParciales.length === 1) {
    return coincidenciasParciales[0];
  }

  return valorIngresado;
}

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
  color: "",
  talle: "",
  barcode: "",
  precio: "",
  activo: true,
};

function Productos() {
  const [productos, setProductos] = useState([]);
  const [resumenProductos, setResumenProductos] = useState([]);
  const [catalogosProducto, setCatalogosProducto] = useState(null);
  const [opcionesProducto, setOpcionesProducto] = useState({
    color: null,
    talle: null,
  });

  const [cargando, setCargando] = useState(true);
  const [cargandoOpciones, setCargandoOpciones] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [modalAbierto, setModalAbierto] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [advertenciasNombre, setAdvertenciasNombre] = useState([]);

  const [formProducto, setFormProducto] = useState(FORM_PRODUCTO_INICIAL);

  const [formVariante, setFormVariante] = useState(FORM_VARIANTE_INICIAL);
  const [productoVariantesAbiertoId, setProductoVariantesAbiertoId] =
    useState(null);
  useEffect(() => {
    cargarDatos();
  }, []);
  const [colorSeleccionado, setColorSeleccionado] = useState(false);
  async function cargarDatos() {
    setCargando(true);
    setError(null);

    try {
      const [respuestaProductos, respuestaCatalogosProducto] =
        await Promise.all([obtenerProductos(), obtenerCatalogosProducto()]);
      console.log("PRODUCTOS VENDURE:", respuestaProductos.productos);
      setProductos(respuestaProductos.productos);

      setResumenProductos(contarPorEstado(respuestaProductos.productos));

      setCatalogosProducto(respuestaCatalogosProducto);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarOpcionesProducto(productoId) {
    if (!productoId) {
      setOpcionesProducto({
        color: null,
        talle: null,
      });

      return;
    }

    setCargandoOpciones(true);
    setError(null);

    try {
      const opciones = await obtenerOpcionesProducto(productoId);

      setOpcionesProducto(opciones);
    } catch (err) {
      setOpcionesProducto({
        color: null,
        talle: null,
      });

      setError(err.message);
    } finally {
      setCargandoOpciones(false);
    }
  }

  function manejarCampoProducto(e) {
    const { name, value, type, checked } = e.target;

    setFormProducto((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "nombre") {
      setAdvertenciasNombre([]);
    }
  }

  function manejarCampoVariante(e) {
    const { name, value, type, checked } = e.target;

    setFormVariante((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "productoId") {
      setFormVariante((anterior) => ({
        ...anterior,
        productoId: value,
        color: "",
        talle: "",
      }));

      cargarOpcionesProducto(value);
    }
  }

  function seleccionarColor(color) {
    setFormVariante((anterior) => ({
      ...anterior,
      color,
    }));

    setColorSeleccionado(true);
  }

  function seleccionarTalle(talle) {
    setFormVariante((anterior) => ({
      ...anterior,
      talle,
    }));
  }

  function normalizarColorIngresado() {
    setFormVariante((anterior) => ({
      ...anterior,
      color: obtenerValorCanonico(coloresDisponibles, anterior.color),
    }));
  }

  function normalizarTalleIngresado() {
    setFormVariante((anterior) => ({
      ...anterior,
      talle: obtenerValorCanonico(
        tallesDisponibles,
        anterior.talle,
      ).toUpperCase(),
    }));
  }

  function abrirModalProducto() {
    setError(null);
    setMensajeExito("");
    setAdvertenciasNombre([]);
    setFormProducto(FORM_PRODUCTO_INICIAL);
    setModalAbierto("producto");
  }

  function abrirModalVariante(productoId = "") {
    setError(null);
    setMensajeExito("");

    setFormVariante({
      ...FORM_VARIANTE_INICIAL,
      productoId,
    });

    setOpcionesProducto({
      color: null,
      talle: null,
    });

    setModalAbierto("variante");

    if (productoId) {
      cargarOpcionesProducto(productoId);
    }
  }
  function cerrarModal() {
    if (guardando) {
      return;
    }

    setModalAbierto(null);
    setError(null);
    setMensajeExito("");
    setAdvertenciasNombre([]);

    setOpcionesProducto({
      color: null,
      talle: null,
    });
  }

  async function manejarCrearProducto(e) {
    e.preventDefault();

    setGuardando(true);
    setError(null);
    setMensajeExito("");

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
      setAdvertenciasNombre([]);

      setMensajeExito("Producto guardado correctamente.");

      await cargarDatos();

      setTimeout(() => {
        setModalAbierto(null);
        setMensajeExito("");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCrearVariante(e) {
    e.preventDefault();
    if (!colorSeleccionado) {
      setError("Debés seleccionar un color de la lista.");
      return;
    }
    const colorNormalizado = obtenerValorCanonico(
      coloresDisponibles,
      formVariante.color.trim(),
    );

    const colorValido = coloresDisponibles.some(
      (color) =>
        normalizarBusqueda(color) === normalizarBusqueda(colorNormalizado),
    );

    if (!colorValido) {
      setError("Debés seleccionar un color válido de la lista.");
      return;
    }

    const talleIngresado = formVariante.talle.trim();
    const talleNormalizado = talleIngresado
      ? obtenerValorCanonico(tallesDisponibles, talleIngresado).toUpperCase()
      : "";

    if (!colorNormalizado) {
      setError("El color es obligatorio.");
      return;
    }

    if (talleNormalizado) {
      const esTalleNumerico = /^\d{1,2}$/.test(talleNormalizado);

      const esTalleAlfabetico = TALLES_ALFABETICOS.includes(talleNormalizado);

      if (!esTalleNumerico && !esTalleAlfabetico) {
        setError(
          "El talle debe ser numérico de hasta 2 dígitos o uno de los talles alfabéticos sugeridos.",
        );
        return;
      }
    }

    const productoSeleccionado = productos.find(
      (producto) => String(producto.id) === String(formVariante.productoId),
    );

    const varianteExistente = productoSeleccionado?.variantes?.some(
      (variante) =>
        normalizarBusqueda(variante.color) ===
          normalizarBusqueda(colorNormalizado) &&
        normalizarBusqueda(variante.talle) ===
          normalizarBusqueda(talleNormalizado),
    );

    if (varianteExistente) {
      setError(
        "Ya existe una variante con ese color y talle para este producto.",
      );
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito("");

    try {
      await crearVariante({
        productId: formVariante.productoId,
        color: colorNormalizado,
        talle: talleNormalizado,
        sku: formVariante.barcode,
        precio: formVariante.precio,
        activo: formVariante.activo,
      });

      setFormVariante(FORM_VARIANTE_INICIAL);

      setOpcionesProducto({
        color: null,
        talle: null,
      });
      setMensajeExito("Variante guardada correctamente.");

      await cargarDatos();

      setTimeout(() => {
        setModalAbierto(null);
        setMensajeExito("");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function verificarNombreProducto() {
    const nombre = formProducto.nombre.trim();

    if (!nombre) {
      setAdvertenciasNombre([]);
      return;
    }

    try {
      const productosEncontrados = await buscarProductosPorNombre(nombre);

      const coincidencias = analizarCoincidenciasNombre(
        nombre,
        productosEncontrados,
      );

      setAdvertenciasNombre(coincidencias);
    } catch {
      setAdvertenciasNombre([]);
    }
  }

  const coloresExistentesProducto = opcionesProducto.color?.opciones || [];

  const tallesExistentesProducto = opcionesProducto.talle?.opciones || [];

  const coloresCatalogo = catalogosProducto?.colores || [];

  const coloresDisponibles = obtenerValoresSinRepetidos(
    COLORES_REFERENCIA,
    coloresCatalogo,
    coloresExistentesProducto,
  );
  console.log("COLORES CATÁLOGO:", coloresCatalogo);
  console.log("COLORES EXISTENTES PRODUCTO:", coloresExistentesProducto);
  const tallesDisponibles = obtenerValoresSinRepetidos(
    TALLES_ALFABETICOS,
    TALLES_NUMERICOS,
    tallesExistentesProducto,
  );

  const coloresSugeridos = filtrarSugerencias(
    coloresDisponibles,
    formVariante.color,
  );

  const tallesSugeridos = filtrarSugerencias(
    tallesDisponibles,
    formVariante.talle,
  );

  const mostrarSugerenciasColor =
    Boolean(formVariante.color.trim()) &&
    !coloresDisponibles.some(
      (color) =>
        normalizarBusqueda(color) === normalizarBusqueda(formVariante.color),
    );

  const mostrarSugerenciasTalle =
    Boolean(formVariante.talle.trim()) &&
    !tallesDisponibles.some(
      (talle) =>
        normalizarBusqueda(talle) === normalizarBusqueda(formVariante.talle),
    );
  function alternarVariantesProducto(productoId) {
    setProductoVariantesAbiertoId((productoActualId) =>
      String(productoActualId) === String(productoId) ? null : productoId,
    );
  }
  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Productos</h1>
          </div>
        </header>

        {error && modalAbierto !== "variante" && (
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
                  <Boton variante="admin" onClick={abrirModalProducto}>
                    Nuevo producto
                  </Boton>

                  <Boton variante="admin" onClick={() => abrirModalVariante()}>
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
                  <Fragment key={producto.id}>
                    <article className="estructura__tabla-fila admin-productos__fila">
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

                        <span>{producto.tipoProducto || "—"}</span>
                      </div>

                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">
                          Variantes
                        </span>

                        <Boton
                          variante="admin"
                          type="button"
                          onClick={() => alternarVariantesProducto(producto.id)}
                        >
                          {producto.cantidadVariantes} ·{" "}
                          {String(productoVariantesAbiertoId) ===
                          String(producto.id)
                            ? "Ocultar variantes"
                            : "Mostrar variantes"}
                        </Boton>
                      </div>
                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">
                          Activo
                        </span>

                        <span>{producto.activo ? "Sí" : "No"}</span>
                      </div>

                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">
                          Acciones
                        </span>

                        <Boton
                          variante="admin"
                          onClick={() => abrirModalVariante(producto.id)}
                        >
                          Agregar variante
                        </Boton>
                      </div>
                    </article>

                    {String(productoVariantesAbiertoId) ===
                      String(producto.id) && (
                      <VariantesProducto variantes={producto.variantes} />
                    )}
                  </Fragment>
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
              <label htmlFor="producto-nombre">Nombre</label>

              <input
                id="producto-nombre"
                name="nombre"
                type="text"
                value={formProducto.nombre}
                onChange={manejarCampoProducto}
                onBlur={verificarNombreProducto}
                required
                autoFocus
              />

              {advertenciasNombre.map((advertencia) => (
                <p
                  key={`${advertencia.tipo}-${advertencia.producto.id}`}
                  className="admin-productos__advertencia"
                >
                  ⚠️{" "}
                  {advertencia.tipo === "exacta"
                    ? "Ya existe un producto con el mismo nombre:"
                    : "Existe un producto con un nombre similar:"}{" "}
                  <strong>{advertencia.producto.nombre}</strong>
                </p>
              ))}
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-marca">Marca</label>

              <select
                id="producto-marca"
                name="marca"
                value={formProducto.marca}
                onChange={manejarCampoProducto}
                required
              >
                <option value="">Seleccionar marca</option>

                {catalogosProducto?.marcas.map((marca) => (
                  <option key={marca.id} value={marca.nombre}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-genero">Género</label>

              <select
                id="producto-genero"
                name="genero"
                value={formProducto.genero}
                onChange={manejarCampoProducto}
                required
              >
                <option value="">Seleccionar género</option>

                {catalogosProducto?.generos.map((genero) => (
                  <option key={genero.id} value={genero.nombre}>
                    {genero.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-tipo">Tipo de producto</label>

              <select
                id="producto-tipo"
                name="tipoProducto"
                value={formProducto.tipoProducto}
                onChange={manejarCampoProducto}
                required
              >
                <option value="">Seleccionar tipo de producto</option>

                {catalogosProducto?.tiposProducto.map((tipoProducto) => (
                  <option key={tipoProducto.id} value={tipoProducto.nombre}>
                    {tipoProducto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-descripcion">Descripción</label>

              <textarea
                id="producto-descripcion"
                name="descripcion"
                value={formProducto.descripcion}
                onChange={manejarCampoProducto}
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-activo">Activo</label>

              <input
                id="producto-activo"
                name="activo"
                type="checkbox"
                checked={formProducto.activo}
                onChange={manejarCampoProducto}
              />
            </div>
            {mensajeExito ? (
              <p className="estructura__tarjeta fondo-verde">{mensajeExito}</p>
            ) : (
              guardando && <p>Guardando...</p>
            )}
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

            {cargandoOpciones && <p>Cargando opciones del producto...</p>}

            {error && <p className="login-admin__error">{error}</p>}

            {mensajeExito && (
              <p className="estructura__tarjeta fondo-verde">{mensajeExito}</p>
            )}
            <div className="estructura__campo">
              <label htmlFor="variante-color">Color</label>

              <input
                id="variante-color"
                name="color"
                type="text"
                value={formVariante.color}
                onChange={(e) => {
                  manejarCampoVariante(e);
                  setColorSeleccionado(false);
                }}
                autoComplete="off"
                required
              />

              {mostrarSugerenciasColor &&
                coloresSugeridos.map((color) => (
                  <div
                    className="estructura__lista-item"
                    key={normalizarBusqueda(color)}
                  >
                    <button
                      className="estructura__tabla-boton"
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => seleccionarColor(color)}
                    >
                      {color}
                    </button>
                  </div>
                ))}
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-talle">Talle</label>

              <input
                id="variante-talle"
                name="talle"
                type="text"
                value={formVariante.talle}
                onChange={manejarCampoVariante}
                onBlur={normalizarTalleIngresado}
                autoComplete="off"
              />

              {mostrarSugerenciasTalle &&
                tallesSugeridos.map((talle) => (
                  <div
                    className="estructura__lista-item"
                    key={normalizarBusqueda(talle)}
                  >
                    <button
                      className="estructura__tabla-boton"
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => seleccionarTalle(talle)}
                    >
                      {talle}
                    </button>
                  </div>
                ))}
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-barcode">Barcode</label>

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

            {guardando && <p>Guardando...</p>}
          </form>
        </ModalAdmin>
      )}
    </main>
  );
}

export default Productos;
