import { useEffect, useRef, useState } from "react";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import ModalAdmin from "../componentes/ModalAdmin";
import {
  buscarVariantePorBarcode,
  contarStock,
  crearProveedor,
  filtrarProveedores,
  obtenerDatosStock,
  obtenerProveedores,
  registrarIngresoStock,
} from "../servicios/stockService";

import "../../estilos/admin-stock.css";

function obtenerFechaActual() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function crearFormularioIngresoInicial() {
  return {
    proveedorId: "",
    proveedorNombre: "",
    numeroComprobante: "",
    fechaComprobante: obtenerFechaActual(),
    observaciones: "",
  };
}

const FORM_PROVEEDOR_INICIAL = {
  nombre: "",
  cuit: "",
  telefono: "",
};

const FORM_DETALLE_INICIAL = {
  barcode: "",
  cantidad: "1",
};

function Stock() {
  const [stock, setStock] = useState([]);
  const [categoriasStock, setCategoriasStock] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [buscandoBarcode, setBuscandoBarcode] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardandoProveedor, setGuardandoProveedor] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [modalAbierto, setModalAbierto] = useState(null);
  const [formIngreso, setFormIngreso] = useState(crearFormularioIngresoInicial);
  const [formProveedor, setFormProveedor] = useState(FORM_PROVEEDOR_INICIAL);
  const [formDetalle, setFormDetalle] = useState(FORM_DETALLE_INICIAL);
  const [detalles, setDetalles] = useState([]);
  const [barcodeNoEncontrado, setBarcodeNoEncontrado] = useState(false);
  const cantidadRefs = useRef(new Map());
  const barcodeRef = useRef(null);

  useEffect(() => {
    async function cargarInicial() {
      setCargando(true);
      setError(null);

      try {
        const [datosStock, datosProveedores] = await Promise.all([
          obtenerDatosStock(),
          obtenerProveedores(),
        ]);

        setStock(datosStock.stock);
        setCategoriasStock(contarStock(datosStock.stock));
        setProveedores(datosProveedores);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargarInicial();
  }, []);

  async function recargarStock() {
    const datosStock = await obtenerDatosStock();
    setStock(datosStock.stock);
    setCategoriasStock(contarStock(datosStock.stock));
  }

  async function recargarProveedores() {
    setCargandoProveedores(true);

    try {
      const datosProveedores = await obtenerProveedores();
      setProveedores(datosProveedores);
      return datosProveedores;
    } finally {
      setCargandoProveedores(false);
    }
  }

  function abrirModalIngreso() {
    setError(null);
    setMensajeExito("");
    setFormIngreso(crearFormularioIngresoInicial());
    setFormDetalle(FORM_DETALLE_INICIAL);
    setDetalles([]);
    setBarcodeNoEncontrado(false);
    setModalAbierto("ingreso");
  }

  function cerrarModalIngreso() {
    if (guardando) {
      return;
    }

    setModalAbierto(null);
    setError(null);
    setFormDetalle(FORM_DETALLE_INICIAL);
    setDetalles([]);
    setBarcodeNoEncontrado(false);
  }

  function abrirModalProveedor() {
    setError(null);
    setFormProveedor({
      ...FORM_PROVEEDOR_INICIAL,
      nombre: formIngreso.proveedorNombre.trim(),
    });
    setModalAbierto("proveedor");
  }

  function volverAlIngreso() {
    if (guardandoProveedor) {
      return;
    }

    setError(null);
    setModalAbierto("ingreso");
  }

  function manejarCampoIngreso(e) {
    const { name, value } = e.target;

    setFormIngreso((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === "proveedorNombre" ? { proveedorId: "" } : {}),
    }));

    setError(null);
  }

  function seleccionarProveedor(proveedor) {
    setFormIngreso((anterior) => ({
      ...anterior,
      proveedorId: proveedor.id,
      proveedorNombre: proveedor.nombre,
    }));
    setError(null);
  }

  function manejarTeclaProveedor(e) {
    if (e.key !== "Enter") {
      return;
    }

    e.preventDefault();

    if (!proveedorSeleccionado) {
      setError("Debés seleccionar un proveedor de la lista.");
    }
  }

  function manejarCampoProveedor(e) {
    const { name, value } = e.target;

    setFormProveedor((anterior) => ({
      ...anterior,
      [name]: value,
    }));
    setError(null);
  }

  function manejarCampoDetalle(e) {
    const { name, value } = e.target;

    setFormDetalle((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    if (name === "barcode") {
      setBarcodeNoEncontrado(false);
    }

    setError(null);
  }

  async function manejarCrearProveedor(e) {
    e.preventDefault();

    if (guardandoProveedor) {
      return;
    }

    setGuardandoProveedor(true);
    setError(null);

    try {
      const proveedorCreado = await crearProveedor(formProveedor);
      const proveedoresActualizados = await recargarProveedores();
      const proveedorSeleccionado =
        proveedoresActualizados.find(
          (proveedor) => String(proveedor.id) === String(proveedorCreado.id),
        ) || proveedorCreado;

      seleccionarProveedor(proveedorSeleccionado);
      setFormProveedor(FORM_PROVEEDOR_INICIAL);
      setMensajeExito("Proveedor guardado y seleccionado correctamente.");
      setModalAbierto("ingreso");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoProveedor(false);
    }
  }

  async function manejarAgregarVariante() {
    if (buscandoBarcode) {
      return;
    }

    const barcode = formDetalle.barcode.trim();
    const cantidad = Number(formDetalle.cantidad);

    if (!barcode) {
      setError("El barcode es obligatorio.");
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 9999) {
      setError("La cantidad debe ser un número entero entre 1 y 9999.");
      return;
    }

    const detalleExistente = detalles.find(
      (detalle) => detalle.barcode === barcode,
    );

    if (detalleExistente) {
      setError(
        "La variante ya está agregada. Modificá la cantidad en su renglón.",
      );

      setTimeout(() => {
        cantidadRefs.current.get(String(detalleExistente.id))?.focus();
      }, 0);

      return;
    }

    setBuscandoBarcode(true);
    setError(null);
    setBarcodeNoEncontrado(false);

    try {
      const variante = await buscarVariantePorBarcode(barcode);

      if (!variante) {
        setBarcodeNoEncontrado(true);
        setError(`No existe una variante con el barcode ${barcode}.`);
        return;
      }

      setDetalles((anteriores) => [
        ...anteriores,
        {
          ...variante,
          cantidad,
        },
      ]);
      setFormDetalle(FORM_DETALLE_INICIAL);

      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setBuscandoBarcode(false);
    }
  }

  function manejarCantidadDetalle(varianteId, valor) {
    setDetalles((anteriores) =>
      anteriores.map((detalle) =>
        String(detalle.id) === String(varianteId)
          ? {
              ...detalle,
              cantidad: valor,
            }
          : detalle,
      ),
    );
    setError(null);
  }

  function manejarTeclaBarcode(e) {
    if (e.key !== "Enter") {
      return;
    }

    e.preventDefault();
    manejarAgregarVariante();
  }

  function quitarDetalle(varianteId) {
    setDetalles((anteriores) =>
      anteriores.filter(
        (detalle) => String(detalle.id) !== String(varianteId),
      ),
    );
    cantidadRefs.current.delete(String(varianteId));
    setError(null);
  }

  function abrirProductos() {
    window.open("/admin/productos", "_blank", "noopener,noreferrer");
  }

  async function manejarRegistrarIngreso(e) {
    e.preventDefault();

    if (guardando) {
      return;
    }

    if (!formIngreso.proveedorId) {
      setError("Debés seleccionar un proveedor de la lista.");
      return;
    }

    if (detalles.length === 0) {
      setError("El ingreso debe contener al menos una variante.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito("");

    try {
      await registrarIngresoStock({
        proveedorId: formIngreso.proveedorId,
        numeroComprobante: formIngreso.numeroComprobante,
        fechaComprobante: formIngreso.fechaComprobante,
        observaciones: formIngreso.observaciones,
        detalles: detalles.map((detalle) => ({
          barcode: detalle.barcode,
          cantidad: Number(detalle.cantidad),
        })),
      });

      await recargarStock();
      setModalAbierto(null);
      setFormIngreso(crearFormularioIngresoInicial());
      setFormDetalle(FORM_DETALLE_INICIAL);
      setDetalles([]);
      setMensajeExito("Ingreso de stock registrado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const proveedorSeleccionado = proveedores.find(
    (proveedor) => String(proveedor.id) === String(formIngreso.proveedorId),
  );

  const proveedoresSugeridos = filtrarProveedores(
    proveedores,
    formIngreso.proveedorNombre,
  );

  const mostrarSugerenciasProveedor =
    Boolean(formIngreso.proveedorNombre.trim()) && !proveedorSeleccionado;

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Stock</h1>
          </div>
        </header>

        {cargando && <p>Cargando stock...</p>}

        {error && !modalAbierto && (
          <p className="login-admin__error">{error}</p>
        )}

        {mensajeExito && !modalAbierto && (
          <p className="estructura__tarjeta fondo-verde">{mensajeExito}</p>
        )}

        {!cargando && (
          <>
            <section className="estructura__resumen" aria-label="Resumen de stock">
              {categoriasStock.map((categoria) => (
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
                <h2>Listado de stock</h2>

                <div className="estructura__panel-acciones">
                  <Boton variante="admin" onClick={abrirModalIngreso}>
                    Nuevo ingreso stock
                  </Boton>
                </div>
              </div>

              <div className="estructura__tabla">
                <div className="estructura__tabla-cabecera admin-stock__cabecera">
                  <span>Barcode</span>
                  <span>Producto</span>
                  <span>Variante</span>
                  <span>Stock</span>
                  <span>Reservado</span>
                  <span>Disponible</span>
                  <span>Estado</span>
                  <span>Último ingreso</span>
                </div>

                {stock.length === 0 && <p>No hay variantes para mostrar.</p>}

                {stock.map((item) => (
                  <article
                    className={`estructura__tabla-fila admin-stock__fila ${item.color}`}
                    key={item.id}
                  >
                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Barcode</span>
                      <strong>{item.barcode || "—"}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Producto</span>
                      <span>{item.producto}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Variante</span>
                      <span>{item.variante}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Stock</span>
                      <strong>{item.stock}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Reservado</span>
                      <strong>{item.reservado}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Disponible</span>
                      <strong>{item.disponible}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Estado</span>
                      <span>{item.estado}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Último ingreso
                      </span>
                      <span>{item.ultimoIngreso}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </Contenedor>

      {modalAbierto === "ingreso" && (
        <ModalAdmin
          titulo="Nuevo ingreso stock"
          onClose={cerrarModalIngreso}
          formId="formulario-ingreso-stock"
        >
          <form
            id="formulario-ingreso-stock"
            className="estructura__formulario"
            onSubmit={manejarRegistrarIngreso}
          >
            {error && <p className="login-admin__error">{error}</p>}

            {mensajeExito && (
              <p className="estructura__tarjeta fondo-verde">{mensajeExito}</p>
            )}

            <div className="estructura__campo">
              <label htmlFor="stock-proveedor">Proveedor</label>
              <input
                id="stock-proveedor"
                name="proveedorNombre"
                type="text"
                value={formIngreso.proveedorNombre}
                onChange={manejarCampoIngreso}
                onKeyDown={manejarTeclaProveedor}
                maxLength="100"
                autoComplete="off"
                required
                autoFocus
              />

              {cargandoProveedores && <p>Cargando proveedores...</p>}

              {mostrarSugerenciasProveedor &&
                proveedoresSugeridos.map((proveedor) => (
                  <div className="estructura__lista-item" key={proveedor.id}>
                    <button
                      className="estructura__tabla-boton"
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => seleccionarProveedor(proveedor)}
                    >
                      {proveedor.nombre}
                    </button>
                    <span>CUIT: {proveedor.cuit}</span>
                  </div>
                ))}

              <div className="estructura__panel-acciones">
                <Boton variante="admin" type="button" onClick={abrirModalProveedor}>
                  Nuevo proveedor
                </Boton>
              </div>
            </div>

            {proveedorSeleccionado && (
              <div className="estructura__tarjeta fondo-verde">
                <strong>{proveedorSeleccionado.nombre}</strong>
                <span>CUIT: {proveedorSeleccionado.cuit}</span>
                <span>
                  Teléfono: {proveedorSeleccionado.telefono || "No informado"}
                </span>
              </div>
            )}

            <div className="estructura__campo">
              <label htmlFor="stock-comprobante">Factura / comprobante</label>
              <input
                id="stock-comprobante"
                name="numeroComprobante"
                type="text"
                value={formIngreso.numeroComprobante}
                onChange={manejarCampoIngreso}
                maxLength="100"
                placeholder="0001-00001234"
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="stock-fecha">Fecha</label>
              <input
                id="stock-fecha"
                name="fechaComprobante"
                type="date"
                value={formIngreso.fechaComprobante}
                onChange={manejarCampoIngreso}
                max={obtenerFechaActual()}
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="stock-barcode">Barcode</label>
              <input
                id="stock-barcode"
                ref={barcodeRef}
                name="barcode"
                type="text"
                value={formDetalle.barcode}
                onChange={manejarCampoDetalle}
                onKeyDown={manejarTeclaBarcode}
                maxLength="100"
                placeholder="Escanear o ingresar barcode"
                autoComplete="off"
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="stock-cantidad">Cantidad</label>
              <input
                id="stock-cantidad"
                name="cantidad"
                type="number"
                value={formDetalle.cantidad}
                onChange={manejarCampoDetalle}
                min="1"
                max="9999"
                step="1"
              />
            </div>

            <div className="estructura__panel-acciones">
              <Boton
                variante="admin"
                type="button"
                onClick={manejarAgregarVariante}
                disabled={buscandoBarcode}
              >
                {buscandoBarcode ? "Buscando..." : "Agregar variante"}
              </Boton>

              {barcodeNoEncontrado && (
                <Boton variante="admin" type="button" onClick={abrirProductos}>
                  Crear en Productos
                </Boton>
              )}
            </div>

            {detalles.length > 0 && (
              <div className="estructura__tabla">
                {detalles.map((detalle) => {
                  const cantidad = Number(detalle.cantidad);
                  const cantidadValida =
                    Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= 9999;

                  return (
                    <article className="estructura__lista-item" key={detalle.id}>
                      <strong>{detalle.producto}</strong>
                      <span>{detalle.variante}</span>
                      <span>Barcode: {detalle.barcode}</span>
                      <span>Stock actual: {detalle.stock}</span>

                      <div className="estructura__campo">
                        <label htmlFor={`stock-detalle-cantidad-${detalle.id}`}>
                          Cantidad ingresada
                        </label>
                        <input
                          id={`stock-detalle-cantidad-${detalle.id}`}
                          ref={(elemento) => {
                            if (elemento) {
                              cantidadRefs.current.set(String(detalle.id), elemento);
                            }
                          }}
                          type="number"
                          value={detalle.cantidad}
                          onChange={(e) =>
                            manejarCantidadDetalle(detalle.id, e.target.value)
                          }
                          min="1"
                          max="9999"
                          step="1"
                          required
                        />
                      </div>

                      <span>
                        Stock resultante:{" "}
                        {cantidadValida ? detalle.stock + cantidad : "—"}
                      </span>

                      <div className="estructura__panel-acciones">
                        <Boton
                          variante="admin"
                          type="button"
                          onClick={() => quitarDetalle(detalle.id)}
                        >
                          Quitar
                        </Boton>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="estructura__campo">
              <label htmlFor="stock-observaciones">Observaciones</label>
              <textarea
                id="stock-observaciones"
                name="observaciones"
                value={formIngreso.observaciones}
                onChange={manejarCampoIngreso}
                maxLength="100"
              />
              <span>{formIngreso.observaciones.length}/100</span>
            </div>

            {guardando && <p>Guardando ingreso...</p>}
          </form>
        </ModalAdmin>
      )}

      {modalAbierto === "proveedor" && (
        <ModalAdmin
          titulo="Nuevo proveedor"
          onClose={volverAlIngreso}
          formId="formulario-nuevo-proveedor"
        >
          <form
            id="formulario-nuevo-proveedor"
            className="estructura__formulario"
            onSubmit={manejarCrearProveedor}
          >
            {error && <p className="login-admin__error">{error}</p>}

            <div className="estructura__campo">
              <label htmlFor="proveedor-nombre">Nombre</label>
              <input
                id="proveedor-nombre"
                name="nombre"
                type="text"
                value={formProveedor.nombre}
                onChange={manejarCampoProveedor}
                minLength="2"
                maxLength="100"
                required
                autoFocus
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="proveedor-cuit">CUIT</label>
              <input
                id="proveedor-cuit"
                name="cuit"
                type="text"
                value={formProveedor.cuit}
                onChange={manejarCampoProveedor}
                maxLength="13"
                inputMode="numeric"
                placeholder="20-12345678-3"
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="proveedor-telefono">Teléfono</label>
              <input
                id="proveedor-telefono"
                name="telefono"
                type="tel"
                value={formProveedor.telefono}
                onChange={manejarCampoProveedor}
                maxLength="30"
              />
            </div>

            {guardandoProveedor && <p>Guardando proveedor...</p>}
          </form>
        </ModalAdmin>
      )}
    </main>
  );
}

export default Stock;
