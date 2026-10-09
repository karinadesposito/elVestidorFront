import { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import {
  obtenerPedidos,
  obtenerContadoresPedidos,
  obtenerMetodosEnvioPedidos,
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
  const [pedidos, setPedidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [metodosEnvio, setMetodosEnvio] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [pestania, setPestania] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [envioFiltro, setEnvioFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const estadoAplicado = estadoFiltro || pestania;
  const filtrosActivos = Boolean(busqueda || estadoFiltro || envioFiltro || fechaDesde || fechaHasta);
  const fechasInvalidas = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta);
  const totalPaginas = Math.max(1, Math.ceil(totalPedidos / TAMANIO_PAGINA));

  useEffect(() => {
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
          </div>

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
                    <div className="estructura__tabla-dato"><span className="estructura__tabla-etiqueta">Pedido</span><strong>#{pedido.codigo || pedido.id}</strong></div>
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
