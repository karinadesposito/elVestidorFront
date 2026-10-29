import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import { useAuth } from "../contexto/AuthContext";
import { obtenerPedidos } from "../servicios/pedidosService";
import { obtenerResumenStock } from "../servicios/stockService";
import {
  formatearFecha,
  formatearPesos,
  hoyArgentina,
  obtenerResumenPedidos,
  obtenerResumenVentas,
} from "../servicios/reportesService";
import "../../estilos/admin-inicio.css";

const NOMBRE_ESTADO = {
  PaymentSettled: "Por preparar",
  EnPreparacion: "En preparación",
  Shipped: "Despachados",
  Delivered: "Entregados",
};

function rangoAtajo(atajo, inicioActividades) {
  const hoy = hoyArgentina();
  const [anio, mes] = hoy.split("-").map(Number);
  const dos = (numero) => String(numero).padStart(2, "0");

  if (atajo === "inicio") {
    return { desde: inicioActividades || hoy, hasta: hoy };
  }
  if (atajo === "anio") {
    return { desde: `${anio}-01-01`, hasta: hoy };
  }
  if (atajo === "mesAnterior") {
    const anioAnterior = mes === 1 ? anio - 1 : anio;
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    // El día 0 del mes siguiente es el último día del mes anterior.
    const ultimoDia = new Date(Date.UTC(anioAnterior, mesAnterior, 0)).getUTCDate();
    return {
      desde: `${anioAnterior}-${dos(mesAnterior)}-01`,
      hasta: `${anioAnterior}-${dos(mesAnterior)}-${dos(ultimoDia)}`,
    };
  }
  return { desde: `${anio}-${dos(mes)}-01`, hasta: hoy };
}

const ATAJOS = [
  { id: "inicio", texto: "Desde el inicio" },
  { id: "anio", texto: "Año en curso" },
  { id: "mesAnterior", texto: "Mes anterior" },
  { id: "mesActual", texto: "Mes actual" },
];

function InicioPanel() {
  const navigate = useNavigate();
  const { puede } = useAuth();
  const puedeVerVentas = puede("VerVentas");

  const [resumenPedidos, setResumenPedidos] = useState(null);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [resumenStock, setResumenStock] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [rango, setRango] = useState(() => rangoAtajo("mesActual"));
  const [atajoActivo, setAtajoActivo] = useState("mesActual");
  const [ventas, setVentas] = useState(null);
  const [cargandoVentas, setCargandoVentas] = useState(true);
  const [errorVentas, setErrorVentas] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const [resumen, recientes, stock] = await Promise.all([
          obtenerResumenPedidos(),
          obtenerPedidos({ pagina: 1, take: 5 }),
          obtenerResumenStock(5),
        ]);
        setResumenPedidos(resumen);
        setPedidosRecientes(recientes.pedidos);
        setResumenStock(stock);
      } catch {
        setError("No pudimos cargar el resumen. Actualizá la página o probá en unos minutos.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  useEffect(() => {
    if (!puedeVerVentas) {
      return undefined;
    }
    // Si el rango cambia antes de que llegue la respuesta, se descarta la vieja.
    let vigente = true;
    obtenerResumenVentas(rango.desde, rango.hasta)
      .then((resultado) => {
        if (vigente) {
          setVentas(resultado);
          setErrorVentas(null);
        }
      })
      .catch((err) => {
        if (vigente) {
          setErrorVentas(
            err?.errors?.[0]?.message ||
              "No pudimos cargar las ventas. Probá de nuevo en unos minutos.",
          );
        }
      })
      .finally(() => {
        if (vigente) {
          setCargandoVentas(false);
        }
      });
    return () => {
      vigente = false;
    };
  }, [puedeVerVentas, rango]);

  function cambiarRango(nuevoRango) {
    setCargandoVentas(true);
    setRango(nuevoRango);
  }

  function elegirAtajo(id) {
    setAtajoActivo(id);
    cambiarRango(rangoAtajo(id, ventas?.inicioActividades));
  }

  function manejarFecha(e) {
    const { name, value } = e.target;
    setAtajoActivo(null);
    cambiarRango({ ...rango, [name]: value });
  }

  const tarjetasEstado = [
    { texto: "Pedidos nuevos hoy", valor: resumenPedidos?.nuevosHoy },
    { texto: "Por preparar", valor: resumenPedidos?.porPreparar },
    { texto: "En preparación", valor: resumenPedidos?.enPreparacion },
    { texto: "Despachados", valor: resumenPedidos?.enviados },
  ];

  return (
    <main className="estructura">
      <Contenedor>
        {error && <p className="login-admin__error">{error}</p>}

        <section className="estructura__resumen admin-inicio__estados" aria-label="Pedidos por estado">
          {tarjetasEstado.map((tarjeta) => (
            <article className="estructura__tarjeta" key={tarjeta.texto}>
              <span>{tarjeta.texto}</span>
              <strong>{cargando ? "…" : tarjeta.valor ?? "—"}</strong>
            </article>
          ))}
        </section>

        {puedeVerVentas && (
          <section className="estructura__panel admin-inicio__ventas" aria-labelledby="titulo-ventas">
            <div className="estructura__panel-encabezado">
              <h2 id="titulo-ventas">Ventas</h2>
              <div className="estructura__panel-acciones">
                {ATAJOS.map((atajo) => (
                  <Boton
                    key={atajo.id}
                    variante="admin"
                    className={atajoActivo === atajo.id ? "admin-inicio__atajo--activo" : ""}
                    aria-pressed={atajoActivo === atajo.id}
                    onClick={() => elegirAtajo(atajo.id)}
                  >
                    {atajo.texto}
                  </Boton>
                ))}
              </div>
            </div>

            <div className="admin-inicio__fechas">
              <div className="estructura__campo">
                <label htmlFor="ventas-desde">Desde</label>
                <input
                  id="ventas-desde"
                  name="desde"
                  type="date"
                  value={rango.desde}
                  max={rango.hasta}
                  onChange={manejarFecha}
                />
              </div>
              <div className="estructura__campo">
                <label htmlFor="ventas-hasta">Hasta</label>
                <input
                  id="ventas-hasta"
                  name="hasta"
                  type="date"
                  value={rango.hasta}
                  min={rango.desde}
                  max={hoyArgentina()}
                  onChange={manejarFecha}
                />
              </div>
            </div>

            {errorVentas && <p className="login-admin__error">{errorVentas}</p>}

            {ventas && !errorVentas && (
              <>
                <div className="estructura__resumen admin-inicio__totales">
                  <article className="estructura__tarjeta">
                    <span>Total vendido</span>
                    <strong>{formatearPesos(ventas.totalVendido)}</strong>
                  </article>
                  <article className="estructura__tarjeta">
                    <span>Pedidos</span>
                    <strong>{ventas.pedidos}</strong>
                  </article>
                  <article className="estructura__tarjeta">
                    <span>Ticket promedio</span>
                    <strong>{formatearPesos(ventas.ticketPromedio)}</strong>
                  </article>
                </div>

                <p className="admin-inicio__detalle">
                  Productos: <strong>{formatearPesos(ventas.totalProductos)}</strong> · Envíos:{" "}
                  <strong>{formatearPesos(ventas.totalEnvios)}</strong>
                  {ventas.cancelados > 0 && (
                    <> · Cancelados: <strong>{ventas.cancelados}</strong></>
                  )}
                </p>

                <div className="estructura__tabla admin-inicio__tabla-estados">
                  <div className="estructura__tabla-cabecera admin-inicio__cabecera-estados">
                    <span>Estado</span>
                    <span>Pedidos</span>
                    <span>Importe</span>
                  </div>
                  {ventas.porEstado.map((fila) => (
                    <article className="estructura__tabla-fila admin-inicio__fila-estados" key={fila.estado}>
                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">Estado</span>
                        <span>{NOMBRE_ESTADO[fila.estado] || fila.estado}</span>
                      </div>
                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">Pedidos</span>
                        <span>{fila.pedidos}</span>
                      </div>
                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">Importe</span>
                        <strong>{formatearPesos(fila.total)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            <p className="admin-inicio__aclaracion">
              {cargandoVentas
                ? "Calculando…"
                : `Del ${formatearFecha(rango.desde)} al ${formatearFecha(rango.hasta)} · Solo ventas online: las ventas de mostrador no se incluyen.`}
            </p>
          </section>
        )}

        <section className="estructura__grilla">
          <article className="estructura__panel">
            <div className="estructura__panel-encabezado">
              <h2>Pedidos recientes</h2>
              <div className="estructura__panel-acciones">
                <Boton variante="admin" onClick={() => navigate("/admin/pedidos")}>
                  Ver pedidos
                </Boton>
              </div>
            </div>

            <div className="estructura__tabla admin-inicio__tabla">
              <div className="estructura__tabla-cabecera admin-inicio__cabecera">
                <span>Pedido</span>
                <span>Cliente</span>
                <span>Estado</span>
                <span>Importe</span>
              </div>

              {!cargando && pedidosRecientes.length === 0 && <p>No hay pedidos recientes.</p>}

              {pedidosRecientes.map((pedido) => (
                <article className="estructura__tabla-fila admin-inicio__fila" key={pedido.id}>
                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Pedido</span>
                    <span>#{pedido.codigo}</span>
                  </div>
                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Cliente</span>
                    <span>{pedido.cliente}</span>
                  </div>
                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Estado</span>
                    <span>{pedido.estado}</span>
                  </div>
                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Importe</span>
                    <strong>{pedido.total}</strong>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className="estructura__panel">
            <div className="estructura__panel-encabezado">
              <h2>Alertas de stock</h2>
              <div className="estructura__panel-acciones">
                <Boton variante="admin" onClick={() => navigate("/admin/stock")}>
                  Ver stock
                </Boton>
              </div>
            </div>
            {resumenStock && (
              <p>
                Sin stock: <strong>{resumenStock.sinStock}</strong> · Stock bajo (
                {resumenStock.umbralStockBajo} o menos):{" "}
                <strong>{resumenStock.stockBajo}</strong>
              </p>
            )}
            {!cargando && resumenStock?.alertas.length === 0 && <p>Sin alertas de stock.</p>}
            {resumenStock?.alertas.map((alerta) => (
              <div className="estructura__lista-item" key={alerta.varianteId}>
                <strong>{alerta.producto}</strong>
                <span>{alerta.variante}</span>
                <span>
                  {alerta.disponible <= 0
                    ? "Sin stock."
                    : `Quedan ${alerta.disponible} ${alerta.disponible === 1 ? "unidad" : "unidades"}.`}
                </span>
              </div>
            ))}
          </aside>
        </section>
      </Contenedor>
    </main>
  );
}

export default InicioPanel;
