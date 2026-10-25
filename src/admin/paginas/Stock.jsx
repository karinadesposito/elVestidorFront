
import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import ModalAdmin from "../componentes/ModalAdmin";
import { useAuth } from "../contexto/AuthContext";

import {
  buscarVariantePorBarcode,
  contarStock,
  crearProveedor,
  filtrarProveedores,
  filtrarStock,
  obtenerDatosStock,
  obtenerProveedores,
  registrarBajaMostrador,
  registrarIngresoStock,
} from "../servicios/stockService";

import { obtenerCatalogosProducto } from "../servicios/productosService";

import "../../estilos/admin-productos.css";
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

const FORM_BAJA_INICIAL = {
  barcode: "",
  cantidad: "1",
  motivo: "Venta mostrador",
};

function normalizarBusqueda(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function cantidadValida(valor) {
  const cantidad = Number(valor);
  return (
    String(valor).trim() !== "" &&
    Number.isInteger(cantidad) &&
    cantidad >= 1 &&
    cantidad <= 9999
  );
}

function agruparProductos(variantes) {
  const grupos = new Map();

  variantes.forEach((variante) => {
    const clave = [
      variante.producto,
      variante.marcaId,
      variante.tipoProductoId,
    ].join("|");

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        clave,
        nombre: variante.producto,
        marca: variante.marca,
        tipoProducto: variante.tipoProducto,
        variantes: [],
      });
    }

    grupos.get(clave).variantes.push(variante);
  });

  return Array.from(grupos.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );
}

function Stock() {
  const { puede } = useAuth();
  const puedeDarDeBaja = puede("AjustarStockManual");

  const [stock, setStock] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroTipoProducto, setFiltroTipoProducto] = useState("");

  const [catalogosProducto, setCatalogosProducto] = useState({
    marcas: [],
    tiposProducto: [],
  });

  const [categoriasStock, setCategoriasStock] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardandoProveedor, setGuardandoProveedor] = useState(false);
  const [guardandoBaja, setGuardandoBaja] = useState(false);
  const [buscandoBarcode, setBuscandoBarcode] = useState(false);

  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [modalAbierto, setModalAbierto] = useState(null);

  const [formIngreso, setFormIngreso] = useState(
    crearFormularioIngresoInicial,
  );
  const [formProveedor, setFormProveedor] = useState(
    FORM_PROVEEDOR_INICIAL,
  );
  const [formBaja, setFormBaja] = useState(FORM_BAJA_INICIAL);

  const [busquedaIngreso, setBusquedaIngreso] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [varianteDestacadaId, setVarianteDestacadaId] = useState(null);
  const [cantidades, setCantidades] = useState({});
  const [detalles, setDetalles] = useState([]);
  const [barcodeNoEncontrado, setBarcodeNoEncontrado] = useState(false);

  const buscadorIngresoRef = useRef(null);

  useEffect(() => {
    async function cargarInicial() {
      setCargando(true);
      setError(null);

      try {
        const [datosStock, datosProveedores, catalogos] =
          await Promise.all([
            obtenerDatosStock(),
            obtenerProveedores(),
            obtenerCatalogosProducto(),
          ]);

        setStock(datosStock.stock);
        setCategoriasStock(contarStock(datosStock.stock));
        setProveedores(datosProveedores);
        setCatalogosProducto(catalogos);
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
      const datos = await obtenerProveedores();
      setProveedores(datos);
      return datos;
    } finally {
      setCargandoProveedores(false);
    }
  }

  const productos = useMemo(
    () => agruparProductos(stock),
    [stock],
  );

  const productosEncontrados = useMemo(() => {
    const termino = normalizarBusqueda(busquedaIngreso);

    if (!termino) return [];

    return productos
      .filter((producto) => {
        const datos = [
          producto.nombre,
          producto.marca,
          producto.tipoProducto,
          ...producto.variantes.flatMap((variante) => [
            variante.barcode,
            variante.variante,
          ]),
        ];

        return datos.some((dato) =>
          normalizarBusqueda(dato).includes(termino),
        );
      })
      .slice(0, 12);
  }, [productos, busquedaIngreso]);

  const stockFiltrado = filtrarStock(stock, {
    busqueda,
    marcaId: filtroMarca,
    tipoProductoId: filtroTipoProducto,
  });

  const proveedorSeleccionado = proveedores.find(
    (proveedor) =>
      String(proveedor.id) === String(formIngreso.proveedorId),
  );

  const proveedoresSugeridos = filtrarProveedores(
    proveedores,
    formIngreso.proveedorNombre,
  );

  const mostrarSugerenciasProveedor =
    Boolean(formIngreso.proveedorNombre.trim()) &&
    !proveedorSeleccionado;

  const totalUnidades = detalles.reduce(
    (total, detalle) => total + (Number(detalle.cantidad) || 0),
    0,
  );

  function abrirModalIngreso() {
    setError(null);
    setMensajeExito("");
    setFormIngreso(crearFormularioIngresoInicial());
    setBusquedaIngreso("");
    setProductoSeleccionado(null);
    setVarianteDestacadaId(null);
    setCantidades({});
    setDetalles([]);
    setBarcodeNoEncontrado(false);
    setModalAbierto("ingreso");
  }

  function cerrarModalIngreso() {
    if (guardando) return;

    setModalAbierto(null);
    setError(null);
    setBusquedaIngreso("");
    setProductoSeleccionado(null);
    setVarianteDestacadaId(null);
    setCantidades({});
    setDetalles([]);
    setBarcodeNoEncontrado(false);
  }

  function seleccionarProducto(producto, varianteId = null) {
    setProductoSeleccionado(producto);
    setVarianteDestacadaId(
      varianteId === null ? null : String(varianteId),
    );
    setCantidades({});
    setBusquedaIngreso("");
    setBarcodeNoEncontrado(false);
    setError(null);
  }

  async function buscarPorBarcode() {
    const codigo = busquedaIngreso.trim();

    if (!codigo || buscandoBarcode) return;

    const varianteLocal = stock.find(
      (item) =>
        normalizarBusqueda(item.barcode) ===
        normalizarBusqueda(codigo),
    );

    if (varianteLocal) {
      const producto = productos.find((grupo) =>
        grupo.variantes.some(
          (item) => String(item.id) === String(varianteLocal.id),
        ),
      );

      if (producto) {
        seleccionarProducto(producto, varianteLocal.id);
        return;
      }
    }

    setBuscandoBarcode(true);
    setError(null);
    setBarcodeNoEncontrado(false);

    try {
      const variante = await buscarVariantePorBarcode(codigo);

      if (!variante) {
        setBarcodeNoEncontrado(true);
        setError(
          `No existe una variante con el barcode ${codigo}.`,
        );
        return;
      }

      const producto = productos.find((grupo) =>
        grupo.variantes.some(
          (item) => String(item.id) === String(variante.id),
        ),
      );

      if (!producto) {
        setError(
          "La variante existe, pero no está en el listado cargado. Actualizá la página.",
        );
        return;
      }

      seleccionarProducto(producto, variante.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBuscandoBarcode(false);
    }
  }

  function manejarTeclaBusquedaIngreso(e) {
    if (e.key !== "Enter") return;

    e.preventDefault();
    buscarPorBarcode();
  }

  function manejarCantidad(varianteId, valor) {
    setCantidades((anterior) => ({
      ...anterior,
      [String(varianteId)]: valor,
    }));

    setError(null);
  }

  function agregarVariantesSeleccionadas() {
    if (!productoSeleccionado) return;

    const seleccionadas = productoSeleccionado.variantes.filter(
      (variante) =>
        String(cantidades[String(variante.id)] ?? "").trim() !== "",
    );

    if (seleccionadas.length === 0) {
      setError("Ingresá una cantidad en al menos una variante.");
      return;
    }

    for (const variante of seleccionadas) {
      const cantidad = cantidades[String(variante.id)];

      if (!cantidadValida(cantidad)) {
        setError(
          `La cantidad de ${variante.variante} debe ser un entero entre 1 y 9999.`,
        );
        return;
      }

      if (!variante.barcode) {
        setError(
          `La variante ${variante.variante} no tiene SKU/barcode.`,
        );
        return;
      }

      const existente = detalles.find(
        (detalle) => String(detalle.id) === String(variante.id),
      );

      if (
        existente &&
        Number(existente.cantidad) + Number(cantidad) > 9999
      ) {
        setError(
          `La cantidad acumulada de ${variante.variante} supera 9999.`,
        );
        return;
      }
    }

    setDetalles((anteriores) => {
      const nuevos = [...anteriores];

      seleccionadas.forEach((variante) => {
        const cantidad = Number(cantidades[String(variante.id)]);

        const indice = nuevos.findIndex(
          (detalle) => String(detalle.id) === String(variante.id),
        );

        if (indice >= 0) {
          nuevos[indice] = {
            ...nuevos[indice],
            cantidad: Number(nuevos[indice].cantidad) + cantidad,
          };
        } else {
          nuevos.push({
            ...variante,
            cantidad,
          });
        }
      });

      return nuevos;
    });

    setCantidades({});
    setProductoSeleccionado(null);
    setVarianteDestacadaId(null);
    setBusquedaIngreso("");
    setError(null);

    setTimeout(() => {
      buscadorIngresoRef.current?.focus();
    }, 0);
  }

  function modificarCantidadDetalle(varianteId, valor) {
    setDetalles((anteriores) =>
      anteriores.map((detalle) =>
        String(detalle.id) === String(varianteId)
          ? { ...detalle, cantidad: valor }
          : detalle,
      ),
    );

    setError(null);
  }

  function quitarDetalle(varianteId) {
    setDetalles((anteriores) =>
      anteriores.filter(
        (detalle) => String(detalle.id) !== String(varianteId),
      ),
    );

    setError(null);
  }

  function manejarCampoIngreso(e) {
    const { name, value } = e.target;

    setFormIngreso((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === "proveedorNombre"
        ? { proveedorId: "" }
        : {}),
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
    if (e.key !== "Enter") return;

    e.preventDefault();

    if (!proveedorSeleccionado) {
      setError("Debés seleccionar un proveedor de la lista.");
    }
  }

  function abrirModalProveedor() {
    setError(null);
    setFormProveedor({ ...FORM_PROVEEDOR_INICIAL });
    setModalAbierto("proveedor");
  }

  function volverAlIngreso() {
    if (guardandoProveedor) return;

    setError(null);
    setModalAbierto("ingreso");
  }

  function manejarCampoProveedor(e) {
    const { name, value } = e.target;

    setFormProveedor((anterior) => ({
      ...anterior,
      [name]:
        name === "telefono"
          ? value.replace(/\D/g, "").slice(0, 15)
          : value,
    }));

    setError(null);
  }

  async function manejarCrearProveedor(e) {
    e.preventDefault();

    if (guardandoProveedor) return;

    setGuardandoProveedor(true);
    setError(null);

    try {
      const creado = await crearProveedor(formProveedor);
      const actualizados = await recargarProveedores();

      const seleccionado =
        actualizados.find(
          (proveedor) =>
            String(proveedor.id) === String(creado.id),
        ) || creado;

      seleccionarProveedor(seleccionado);
      setFormProveedor(FORM_PROVEEDOR_INICIAL);
      setMensajeExito(
        "Proveedor guardado y seleccionado correctamente.",
      );
      setModalAbierto("ingreso");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoProveedor(false);
    }
  }

  async function manejarRegistrarIngreso(e) {
    e.preventDefault();

    if (guardando) return;

    if (detalles.length === 0) {
      setError("Agregá al menos una variante al ingreso.");
      return;
    }

    if (!formIngreso.proveedorId) {
      setError("Debés seleccionar un proveedor de la lista.");
      return;
    }

    if (
      detalles.some(
        (detalle) => !cantidadValida(detalle.cantidad),
      )
    ) {
      setError(
        "Revisá las cantidades. Deben estar entre 1 y 9999.",
      );
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
      setBusquedaIngreso("");
      setProductoSeleccionado(null);
      setVarianteDestacadaId(null);
      setCantidades({});
      setDetalles([]);

      setMensajeExito(
        "Ingreso de stock registrado correctamente.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function abrirModalBaja() {
    setError(null);
    setMensajeExito("");
    setFormBaja(FORM_BAJA_INICIAL);
    setModalAbierto("baja");
  }

  function cerrarModalBaja() {
    if (guardandoBaja) return;

    setModalAbierto(null);
    setError(null);
  }

  function manejarCampoBaja(e) {
    const { name, value } = e.target;

    setFormBaja((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setError(null);
  }

  async function manejarRegistrarBaja(e) {
    e.preventDefault();

    if (guardandoBaja) return;

    setGuardandoBaja(true);
    setError(null);
    setMensajeExito("");

    try {
      const baja = await registrarBajaMostrador(formBaja);

      await recargarStock();

      setModalAbierto(null);
      setFormBaja(FORM_BAJA_INICIAL);

      setMensajeExito(
        `Baja registrada: ${baja.barcode} pasó de ${baja.stockAnterior} a ${baja.stockResultante} unidades.`,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoBaja(false);
    }
  }

  function abrirProductos() {
    window.open(
      "/admin/productos",
      "_blank",
      "noopener,noreferrer",
    );
  }

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
          <p className="estructura__tarjeta fondo-verde">
            {mensajeExito}
          </p>
        )}

        {!cargando && (
          <>
            <section
              id="resumen-stock"
              className="estructura__resumen"
              aria-label="Resumen de stock"
            >
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
                  <Boton
                    variante="admin"
                    onClick={abrirModalIngreso}
                  >
                    Nuevo ingreso stock
                  </Boton>

                  {puedeDarDeBaja && (
                    <Boton
                      variante="admin"
                      onClick={abrirModalBaja}
                    >
                      Baja por venta mostrador
                    </Boton>
                  )}
                </div>
              </div>

              <div id="stock-controles">
                <div className="admin-productos__buscador">
                  <label htmlFor="buscar-stock">
                    Buscar variantes
                  </label>

                  <div className="admin-productos__buscador-control">
                    <FiSearch aria-hidden="true" />

                    <input
                      id="buscar-stock"
                      type="text"
                      value={busqueda}
                      onChange={(e) =>
                        setBusqueda(e.target.value)
                      }
                      placeholder="Buscar por nombre o barcode"
                      autoComplete="off"
                      aria-controls="listado-stock"
                    />

                    {busqueda && (
                      <button
                        type="button"
                        onClick={() => {
                          setBusqueda("");
                          document
                            .getElementById("buscar-stock")
                            ?.focus();
                        }}
                        aria-label="Limpiar búsqueda"
                      >
                        <FiX aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="admin-productos__filtros">
                  <div className="estructura__campo">
                    <label htmlFor="stock-filtro-marca">
                      Marca
                    </label>

                    <select
                      id="stock-filtro-marca"
                      value={filtroMarca}
                      onChange={(e) =>
                        setFiltroMarca(e.target.value)
                      }
                      aria-controls="listado-stock"
                    >
                      <option value="">Todas las marcas</option>

                      {catalogosProducto.marcas.map((marca) => (
                        <option
                          key={marca.id}
                          value={marca.id}
                        >
                          {marca.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="estructura__campo">
                    <label htmlFor="stock-filtro-tipo">
                      Tipo Prod.
                    </label>

                    <select
                      id="stock-filtro-tipo"
                      value={filtroTipoProducto}
                      onChange={(e) =>
                        setFiltroTipoProducto(e.target.value)
                      }
                      aria-controls="listado-stock"
                    >
                      <option value="">
                        Todos los tipos
                      </option>

                      {catalogosProducto.tiposProducto.map(
                        (tipoProducto) => (
                          <option
                            key={tipoProducto.id}
                            value={tipoProducto.id}
                          >
                            {tipoProducto.nombre}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  {(filtroMarca || filtroTipoProducto) && (
                    <Boton
                      variante="admin"
                      type="button"
                      onClick={() => {
                        setFiltroMarca("");
                        setFiltroTipoProducto("");
                      }}
                    >
                      Limpiar filtros
                    </Boton>
                  )}
                </div>
              </div>

              <div
                className="estructura__tabla"
                id="listado-stock"
              >
                <div className="estructura__tabla-cabecera admin-stock__cabecera">
                  <span>Barcode</span>
                  <span>Producto</span>
                  <span>Variante</span>
                  <span>Stock</span>
                  <span>Marca</span>
                  <span>Tipo Prod.</span>
                  <span>Estado</span>
                  <span>Último ingreso</span>
                </div>

                {stockFiltrado.length === 0 && (
                  <p role="status">
                    {stock.length === 0
                      ? "No hay variantes para mostrar."
                      : "No hay variantes que coincidan con la búsqueda y los filtros."}
                  </p>
                )}

                {stockFiltrado.map((item) => (
                  <article
                    className={`estructura__tabla-fila admin-stock__fila ${item.color}`}
                    key={item.id}
                  >
                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Barcode
                      </span>
                      <strong>{item.barcode || "—"}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Producto
                      </span>
                      <span>{item.producto}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Variante
                      </span>
                      <span>{item.variante}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Stock
                      </span>
                      <strong>{item.stock}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Marca
                      </span>
                      <span>{item.marca || "—"}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Tipo Prod.
                      </span>
                      <span>{item.tipoProducto || "—"}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Estado
                      </span>
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
          botonConfirmarDeshabilitado={
            guardando || detalles.length === 0
          }
        >
          <form
            id="formulario-ingreso-stock"
            className="estructura__formulario"
            onSubmit={manejarRegistrarIngreso}
          >
            {error && (
              <p className="login-admin__error" role="alert">
                {error}
              </p>
            )}

            {mensajeExito && (
              <p className="estructura__tarjeta fondo-verde">
                {mensajeExito}
              </p>
            )}

            <section className="estructura__panel">
              <h3>1. Seleccionar mercadería</h3>

              <div className="estructura__campo">
                <label htmlFor="stock-buscar-producto">
                  Buscar producto o escanear barcode
                </label>

                <div className="admin-productos__buscador-control">
                  <FiSearch aria-hidden="true" />

                  <input
                    id="stock-buscar-producto"
                    ref={buscadorIngresoRef}
                    type="text"
                    value={busquedaIngreso}
                    onChange={(e) => {
                      setBusquedaIngreso(e.target.value);
                      setBarcodeNoEncontrado(false);
                      setError(null);
                    }}
                    onKeyDown={manejarTeclaBusquedaIngreso}
                    placeholder="Nombre, marca, SKU o barcode"
                    autoComplete="off"
                    autoFocus
                  />

                  {busquedaIngreso && (
                    <button
                      type="button"
                      onClick={() => {
                        setBusquedaIngreso("");
                        buscadorIngresoRef.current?.focus();
                      }}
                      aria-label="Limpiar búsqueda"
                    >
                      <FiX aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="estructura__panel-acciones">
                  <Boton
                    variante="admin"
                    type="button"
                    onClick={buscarPorBarcode}
                    disabled={
                      buscandoBarcode ||
                      !busquedaIngreso.trim()
                    }
                  >
                    {buscandoBarcode
                      ? "Buscando..."
                      : "Buscar barcode"}
                  </Boton>
                </div>

                {barcodeNoEncontrado && (
                  <div className="estructura__panel-acciones">
                    <Boton
                      variante="admin"
                      type="button"
                      onClick={abrirProductos}
                    >
                      Crear en Productos
                    </Boton>
                  </div>
                )}

                {busquedaIngreso.trim() &&
                  productosEncontrados.length === 0 && (
                    <p>
                      No se encontraron productos en el listado.
                    </p>
                  )}

                {productosEncontrados.length > 0 && (
                  <div className="estructura__tabla">
                    {productosEncontrados.map((producto) => (
                      <div
                        className="estructura__lista-item"
                        key={producto.clave}
                      >
                        <strong>{producto.nombre}</strong>

                        <span>
                          {producto.marca || "Sin marca"}
                          {" · "}
                          {producto.variantes.length} variantes
                        </span>

                        <Boton
                          variante="admin"
                          type="button"
                          onClick={() =>
                            seleccionarProducto(producto)
                          }
                        >
                          Ver variantes
                        </Boton>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {productoSeleccionado && (
                <div className="estructura__tarjeta">
                  <h3>{productoSeleccionado.nombre}</h3>

                  <p>
                    {productoSeleccionado.marca}
                    {productoSeleccionado.tipoProducto
                      ? ` · ${productoSeleccionado.tipoProducto}`
                      : ""}
                  </p>

                  <div className="estructura__tabla">
                    <div className="estructura__lista-item">
                      <strong>Variantes del producto</strong>
                      <span>
                        Ingresá cantidades solamente en los
                        talles recibidos.
                      </span>
                    </div>

                    {productoSeleccionado.variantes.map(
                      (variante) => {
                        const destacada =
                          varianteDestacadaId !== null &&
                          String(variante.id) === varianteDestacadaId;

                        return (
                          <div
                            className="estructura__lista-item"
                            key={variante.id}
                            style={
                              destacada
                                ? {
                                    outline: "2px solid currentColor",
                                    outlineOffset: "-2px",
                                    borderRadius: "6px",
                                  }
                                : undefined
                            }
                          >
                            <strong>
                              {variante.variante}
                              {destacada ? " · Código encontrado" : ""}
                            </strong>

                            <span>
                              SKU / Barcode:{" "}
                              {variante.barcode || "Sin código"}
                            </span>

                            <span>
                              Stock actual: {variante.stock}
                            </span>

                            <div className="estructura__campo">
                              <label
                                htmlFor={`ingreso-cantidad-${variante.id}`}
                              >
                                Cantidad recibida
                              </label>

                              <input
                                id={`ingreso-cantidad-${variante.id}`}
                                type="number"
                                min="1"
                                max="9999"
                                step="1"
                                placeholder="0"
                                value={
                                  cantidades[String(variante.id)] ?? ""
                                }
                                onChange={(e) =>
                                  manejarCantidad(
                                    variante.id,
                                    e.target.value,
                                  )
                                }
                                disabled={!variante.barcode}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  <div className="estructura__panel-acciones">
                    <Boton
                      variante="admin"
                      type="button"
                      onClick={agregarVariantesSeleccionadas}
                    >
                      Agregar variantes seleccionadas
                    </Boton>

                    <Boton
                      variante="admin"
                      type="button"
                      onClick={() => {
                        setProductoSeleccionado(null);
                        setVarianteDestacadaId(null);
                        setCantidades({});
                        setError(null);
                      }}
                    >
                      Cancelar selección
                    </Boton>
                  </div>
                </div>
              )}
            </section>

            <section className="estructura__panel">
              <h3>Mercadería preparada</h3>

              {detalles.length === 0 ? (
                <p>
                  Todavía no agregaste variantes al ingreso.
                </p>
              ) : (
                <>
                  <div className="estructura__tabla">
                    {detalles.map((detalle) => {
                      const cantidad = Number(detalle.cantidad);
                      const valida = cantidadValida(
                        detalle.cantidad,
                      );

                      return (
                        <article
                          className="estructura__lista-item"
                          key={detalle.id}
                        >
                          <strong>{detalle.producto}</strong>

                          <span>{detalle.variante}</span>

                          <span>
                            Barcode: {detalle.barcode}
                          </span>

                          <span>
                            Stock actual: {detalle.stock}
                          </span>

                          <div className="estructura__campo">
                            <label
                              htmlFor={`detalle-cantidad-${detalle.id}`}
                            >
                              Cantidad a ingresar
                            </label>

                            <input
                              id={`detalle-cantidad-${detalle.id}`}
                              type="number"
                              min="1"
                              max="9999"
                              step="1"
                              required
                              value={detalle.cantidad}
                              onChange={(e) =>
                                modificarCantidadDetalle(
                                  detalle.id,
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <span>
                            Stock resultante:{" "}
                            {valida
                              ? detalle.stock + cantidad
                              : "—"}
                          </span>

                          <div className="estructura__panel-acciones">
                            <Boton
                              variante="admin"
                              type="button"
                              onClick={() =>
                                quitarDetalle(detalle.id)
                              }
                            >
                              Quitar
                            </Boton>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="estructura__tarjeta">
                    <strong>
                      {detalles.length} variantes
                    </strong>
                    <span>
                      Total: {totalUnidades} unidades
                    </span>
                  </div>
                </>
              )}
            </section>

            <section className="estructura__panel">
              <h3>2. Datos del ingreso</h3>

              <div className="estructura__campo">
                <label htmlFor="stock-proveedor">
                  Proveedor
                </label>

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
                />

                {cargandoProveedores && (
                  <p>Cargando proveedores...</p>
                )}

                {mostrarSugerenciasProveedor &&
                  proveedoresSugeridos.map((proveedor) => (
                    <div
                      className="estructura__lista-item"
                      key={proveedor.id}
                    >
                      <button
                        className="estructura__tabla-boton"
                        type="button"
                        onMouseDown={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          seleccionarProveedor(proveedor)
                        }
                      >
                        {proveedor.nombre}
                      </button>

                      <span>CUIT: {proveedor.cuit}</span>
                    </div>
                  ))}

                <div className="estructura__panel-acciones">
                  <Boton
                    variante="admin"
                    type="button"
                    onClick={abrirModalProveedor}
                  >
                    Nuevo proveedor
                  </Boton>
                </div>
              </div>

              {proveedorSeleccionado && (
                <div className="estructura__tarjeta fondo-verde">
                  <strong>
                    {proveedorSeleccionado.nombre}
                  </strong>
                  <span>
                    CUIT: {proveedorSeleccionado.cuit}
                  </span>
                  <span>
                    Teléfono:{" "}
                    {proveedorSeleccionado.telefono ||
                      "No informado"}
                  </span>
                </div>
              )}

              <div className="estructura__campo">
                <label htmlFor="stock-comprobante">
                  Factura / comprobante
                </label>

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
                <label htmlFor="stock-fecha">
                  Fecha
                </label>

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
                <label htmlFor="stock-observaciones">
                  Observaciones
                </label>

                <textarea
                  id="stock-observaciones"
                  name="observaciones"
                  value={formIngreso.observaciones}
                  onChange={manejarCampoIngreso}
                  maxLength="100"
                />

                <span>
                  {formIngreso.observaciones.length}/100
                </span>
              </div>
            </section>

            {guardando && (
              <p>Guardando ingreso...</p>
            )}
          </form>
        </ModalAdmin>
      )}

      {modalAbierto === "baja" && puedeDarDeBaja && (
        <ModalAdmin
          titulo="Baja por venta mostrador"
          onClose={cerrarModalBaja}
          formId="formulario-baja-stock"
          botonConfirmar="Dar de baja"
          botonConfirmarDeshabilitado={guardandoBaja}
        >
          <form
            id="formulario-baja-stock"
            className="estructura__formulario"
            onSubmit={manejarRegistrarBaja}
          >
            {error && (
              <p className="login-admin__error">
                {error}
              </p>
            )}

            <div className="estructura__campo">
              <label htmlFor="baja-barcode">
                Barcode
              </label>

              <input
                id="baja-barcode"
                name="barcode"
                type="text"
                value={formBaja.barcode}
                onChange={manejarCampoBaja}
                maxLength="100"
                placeholder="Escanear o ingresar barcode"
                autoComplete="off"
                required
                autoFocus
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="baja-cantidad">
                Cantidad
              </label>

              <input
                id="baja-cantidad"
                name="cantidad"
                type="number"
                value={formBaja.cantidad}
                onChange={manejarCampoBaja}
                min="1"
                max="9999"
                step="1"
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="baja-motivo">
                Motivo
              </label>

              <input
                id="baja-motivo"
                name="motivo"
                type="text"
                value={formBaja.motivo}
                onChange={manejarCampoBaja}
                maxLength="100"
              />
            </div>

            {guardandoBaja && (
              <p>Registrando baja...</p>
            )}
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
            {error && (
              <p className="login-admin__error">
                {error}
              </p>
            )}

            <div className="estructura__campo">
              <label htmlFor="proveedor-nombre">
                Nombre
              </label>

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
              <label htmlFor="proveedor-cuit">
                CUIT
              </label>

              <input
                id="proveedor-cuit"
                name="cuit"
                type="text"
                value={formProveedor.cuit}
                onChange={manejarCampoProveedor}
                maxLength="13"
                inputMode="numeric"
                placeholder="20123456786"
                required
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="proveedor-telefono">
                Teléfono
              </label>

              <input
                id="proveedor-telefono"
                name="telefono"
                type="tel"
                value={formProveedor.telefono}
                onChange={manejarCampoProveedor}
                maxLength="15"
                inputMode="numeric"
              />
            </div>

            {guardandoProveedor && (
              <p>Guardando proveedor...</p>
            )}
          </form>
        </ModalAdmin>
      )}
    </main>
  );
}

export default Stock;
