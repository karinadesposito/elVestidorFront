import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import {
  obtenerPedidos,
  obtenerContadoresPedidos,
  obtenerMetodosEnvioPedidos,
  obtenerPedidosParaExportar,
} from "../servicios/pedidosService";

import "../../estilos/admin-productos.css";
import "../../estilos/admin-pedidos.css";

const TAMANIO_PAGINA = 20;
const PESTANIAS = [
  { nombre: "Todos", estado: "" },
  { nombre: "Pendientes", estado: "PaymentSettled" },
  { nombre: "En preparación", estado: "EnPreparacion" },
  { nombre: "Enviados", estado: "Shipped" },
  { nombre: "Entregados", estado: "Delivered" },
  { nombre: "Cancelados", estado: "Cancelled" },
];

function Pedidos() {
  const location = useLocation();
  const anterior = location.state?.listadoPedidos || {};
  const restaurando = useRef(Boolean(location.state?.listadoPedidos));
  const [pedidos, setPedidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [metodosEnvio, setMetodosEnvio] = useState([]);
  const [pagina, setPagina] = useState(anterior.pagina ?? 1);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [busqueda, setBusqueda] = useState(anterior.busqueda ?? "");
  const [busquedaAplicada, setBusquedaAplicada] = useState(anterior.busquedaAplicada ?? "");
  const [pestania, setPestania] = useState(anterior.pestania ?? "");
  const [estadoFiltro, setEstadoFiltro] = useState(anterior.estadoFiltro ?? "");
  const [envioFiltro, setEnvioFiltro] = useState(anterior.envioFiltro ?? "");
  const [fechaDesde, setFechaDesde] = useState(anterior.fechaDesde ?? "");
  const [fechaHasta, setFechaHasta] = useState(anterior.fechaHasta ?? "");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [errorExportacion, setErrorExportacion] = useState(null);

  const estadoAplicado = estadoFiltro || pestania;
  const filtrosActivos = Boolean(busqueda || estadoFiltro || envioFiltro || fechaDesde || fechaHasta);
  const fechasInvalidas = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta);
  const totalPaginas = Math.max(1, Math.ceil(totalPedidos / TAMANIO_PAGINA));

  useEffect(() => {
    if (restaurando.current) {
      restaurando.current = false;
      return;
    }
    const temporizador = setTimeout(() => {
      setPagina(1);
      setBusquedaAplicada(busqueda.trim());
    }, 350);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  useEffect(() => {
    let activo = true;
    async function cargarOpciones() {
      try {
        const [contadores, envios] = await Promise.all([
          obtenerContadoresPedidos(),
          obtenerMetodosEnvioPedidos(),
        ]);
        if (!activo) return;
        setCategorias(contadores);
        setMetodosEnvio(envios);
      } catch (err) {
        // El listado puede seguir funcionando aunque fallen los datos auxiliares.
        console.error("No se pudieron cargar las opciones de pedidos:", err);
      }
    }
    cargarOpciones();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      if (fechasInvalidas) {
        setCargando(false);
        setPedidos([]);
        setTotalPedidos(0);
        setError(null);
        return;
      }
      setCargando(true);
      setError(null);
      try {
        const respuesta = await obtenerPedidos({
          pagina,
          take: TAMANIO_PAGINA,
          busqueda: busquedaAplicada,
          estado: estadoAplicado,
          envio: envioFiltro,
          fechaDesde,
          fechaHasta,
        });
        if (!activo) return;
        const ultimaPagina = Math.max(1, Math.ceil(respuesta.total / TAMANIO_PAGINA));
        if (pagina > ultimaPagina) {
          setPagina(ultimaPagina);
          return;
        }
        setPedidos(respuesta.pedidos);
        setTotalPedidos(respuesta.total);
      } catch (err) {
        if (!activo) return;
        setError(err.message || "No se pudieron cargar los pedidos.");
        setPedidos([]);
        setTotalPedidos(0);
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, [pagina, busquedaAplicada, estadoAplicado, envioFiltro, fechaDesde, fechaHasta, fechasInvalidas]);

  const estadoListado = {
    pagina, busqueda, busquedaAplicada, pestania,
    estadoFiltro, envioFiltro, fechaDesde, fechaHasta,
  };

  async function exportarPedidos() {
    if (cargando || exportando || fechasInvalidas) return;
    setExportando(true);
    setErrorExportacion(null);
    try {
      const resultados = await obtenerPedidosParaExportar({
        busqueda: busquedaAplicada,
        estado: estadoAplicado,
        envio: envioFiltro,
        fechaDesde,
        fechaHasta,
      });
      if (resultados.length === 0) {
        setErrorExportacion("No hay pedidos para exportar con los filtros actuales.");
        return;
      }
      const columnas = ["Numero de pedido", "Cliente", "Correo", "Estado", "Envio", "Metodo de pago", "Estado del pago", "Total (ARS)", "Fecha"];
      // El apóstrofe inicial evita que Excel ejecute fórmulas provenientes de datos externos.
      const celda = valor => {
        let texto = String(valor ?? "").replace(/[\u00A0\u202F]/g, " ").replace(/[\r\n\t]/g, " ");
        if (/^[\s]*[=+@-]/.test(texto)) texto = "'" + texto;
        return '"' + texto.replace(/"/g, '""') + '"';
      };
      const filas = resultados.map(pedido => [
        pedido.codigo, pedido.cliente, pedido.correo, pedido.estado,
        pedido.envio, pedido.metodoPago || "Sin método", pedido.pago,
        pedido.total, pedido.fecha,
      ]);
      // CSV con separador regional de Excel, caracteres UTF-8 y BOM explícito.
      const contenido = "sep=;\r\n" + [columnas, ...filas].map(fila => fila.map(celda).join(";")).join("\r\n");
      const bytes = new TextEncoder().encode(contenido);
      const archivo = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), bytes], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorExportacion(err.message || "No se pudieron exportar los pedidos.");
    } finally {
      setExportando(false);
    }
  }

  function cambiarPagina(nuevaPagina) {
    if (cargando || nuevaPagina < 1 || nuevaPagina > totalPaginas || nuevaPagina === pagina) return;
    setPagina(nuevaPagina);
  }

  function cambiarPestania(estado) {
    setPestania(estado);
    setEstadoFiltro("");
    setPagina(1);
  }

  function cambiarEstadoFiltro(estado) {
    setEstadoFiltro(estado);
    // La pestaña sigue seleccionada visualmente solo si coincide con el filtro.
    setPestania(estado);
    setPagina(1);
  }

  function limpiarFiltros() {
    setBusqueda("");
    setBusquedaAplicada("");
    setEstadoFiltro("");
    setEnvioFiltro("");
    setFechaDesde("");
    setFechaHasta("");
    setPagina(1);
  }

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div><h1 className="estructura__titulo">Pedidos</h1></div>
        </header>

        <section className="estructura__resumen" aria-label="Categorías de pedidos">
          {categorias.map(categoria => (
            <article className={`estructura__tarjeta ${categoria.color}`} key={categoria.nombre}>
              <span>{categoria.nombre}</span>
              <strong>{categoria.cantidad}</strong>
            </article>
          ))}
        </section>

        <section className="estructura__panel">
          <div className="estructura__panel-encabezado"><h2>Listado de pedidos</h2></div>

          <nav className="estructura__panel-acciones" aria-label="Estados de pedidos">
            {PESTANIAS.map(opcion => (
              <Boton
                key={opcion.nombre}
                variante="admin"
                aria-pressed={pestania === opcion.estado}
                onClick={() => cambiarPestania(opcion.estado)}
                disabled={cargando}
              >
                {pestania === opcion.estado ? `✓ ${opcion.nombre}` : opcion.nombre}
              </Boton>
            ))}
          </nav>

          <div className="admin-productos__filtros">
            <div className="admin-productos__buscador">
              <label htmlFor="buscar-pedidos">Buscar pedidos</label>
              <div className="admin-productos__buscador-control">
                <FiSearch aria-hidden="true" />
                <input
                  id="buscar-pedidos"
                  type="search"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Número, cliente o correo"
                  autoComplete="off"
                />
                {busqueda && (
                  <button type="button" onClick={() => { setBusqueda(""); setBusquedaAplicada(""); setPagina(1); }} aria-label="Limpiar búsqueda">
                    <FiX aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="estructura__campo">
              <label htmlFor="estado-pedidos">Estado</label>
              <select id="estado-pedidos" value={estadoAplicado} onChange={e => cambiarEstadoFiltro(e.target.value)}>
                <option value="">Todos los estados</option>
                {PESTANIAS.slice(1).map(opcion => (
                  <option key={opcion.estado} value={opcion.estado}>{opcion.nombre}</option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="envio-pedidos">Método de envío</label>
              <select id="envio-pedidos" value={envioFiltro} onChange={e => { setEnvioFiltro(e.target.value); setPagina(1); }}>
                <option value="">Todos los envíos</option>
                {metodosEnvio.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="desde-pedidos">Desde</label>
              <input id="desde-pedidos" type="date" value={fechaDesde} onChange={e => { setFechaDesde(e.target.value); setPagina(1); }} />
            </div>
            <div className="estructura__campo">
              <label htmlFor="hasta-pedidos">Hasta</label>
              <input id="hasta-pedidos" type="date" value={fechaHasta} onChange={e => { setFechaHasta(e.target.value); setPagina(1); }} />
            </div>
            {filtrosActivos && <Boton variante="admin" onClick={limpiarFiltros}>Limpiar filtros</Boton>}
            <Boton variante="admin" onClick={exportarPedidos} disabled={cargando || exportando || fechasInvalidas || totalPedidos === 0 || busqueda !== busquedaAplicada}>
              {exportando ? "Exportando..." : "Exportar pedidos (Excel)"}
            </Boton>
          </div>

          {errorExportacion && <p className="login-admin__error" role="alert">{errorExportacion}</p>}
          {fechasInvalidas && <p role="alert">La fecha inicial no puede ser posterior a la fecha final.</p>}
          {cargando && !fechasInvalidas && <p>Cargando pedidos...</p>}
          {error && <p className="login-admin__error" role="alert">{error}</p>}

          {!cargando && !error && !fechasInvalidas && (
            <>
              <div className="estructura__tabla">
                <div className="estructura__tabla-cabecera admin-pedidos__cabecera">
                  <span>Pedido</span><span>Cliente</span><span>Estado</span>
                  <span>Envío</span><span>Pago</span><span>Total</span><span>Fecha</span>
                </div>
                {pedidos.length === 0 && (
                  <p>No se encontraron pedidos con los criterios seleccionados.</p>
                )}
                {pedidos.map(pedido => (
                  <article className={`estructura__tabla-fila admin-pedidos__fila ${pedido.color}`} key={pedido.id}>
                    <div className="estructura__tabla-dato"><span className="estructura__tabla-etiqueta">Pedido</span><strong><Link to={`/admin/pedidos/${pedido.id}`} state={{ listadoPedidos: estadoListado }}>#{pedido.codigo || pedido.id}</Link></strong></div>
                    <div className="estructura__tabla-dato"><span className="estructura__tabla-etiqueta">Cliente</span><span>{pedido.cliente}</span></div>
                    <div className="estructura__tabla-dato"><span className="estructura__tabla-etiqueta">Estado</span><span>{pedido.estado}</span></div>
                    <div className="estructura__tabla-dato"><span className="estructura__tabla-etiqueta">Envío</span><span>{pedido.envio}</span></div>
                    <div className="estructura__tabla-dato"><span className="estructura__tabla-etiqueta">Pago</span><span>{pedido.pago}{pedido.metodoPago ? ` (${pedido.metodoPago})` : ""}</span></div>
                    <div className="estructura__tabla-dato"><span className="estructura__tabla-etiqueta">Total</span><strong>{pedido.total}</strong></div>
                    <div className="estructura__tabla-dato"><span className="estructura__tabla-etiqueta">Fecha</span><span>{pedido.fecha}</span></div>
                  </article>
                ))}
              </div>

              <nav className="admin-productos__paginacion" aria-label="Paginación de pedidos">
                <span>
                  {totalPedidos === 0 ? "No hay pedidos" : (
                    <>Mostrando <strong>{(pagina - 1) * TAMANIO_PAGINA + 1}–{Math.min(pagina * TAMANIO_PAGINA, totalPedidos)}</strong> de <strong>{totalPedidos}</strong> {totalPedidos === 1 ? "pedido" : "pedidos"}</>
                  )}
                </span>
                {totalPaginas > 1 && (
                  <div className="estructura__panel-acciones">
                    <Boton variante="admin" disabled={pagina <= 1 || cargando} onClick={() => cambiarPagina(pagina - 1)}>Anterior</Boton>
                    <span>Página {pagina} de {totalPaginas}</span>
                    <Boton variante="admin" disabled={pagina >= totalPaginas || cargando} onClick={() => cambiarPagina(pagina + 1)}>Siguiente</Boton>
                  </div>
                )}
              </nav>
            </>
          )}
        </section>
      </Contenedor>
    </main>
  );
}

export default Pedidos;
