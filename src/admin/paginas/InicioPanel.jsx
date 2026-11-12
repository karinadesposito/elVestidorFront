
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Contenedor from "../../componentesReuse/Contenedor";
import CintaMarcas from "../../componentesReuse/Cinta";
import { useAuth } from "../contexto/AuthContext";
import { obtenerResumenStock } from "../servicios/stockService";
import {
  formatearFecha,
  formatearPesos,
  hoyArgentina,
  obtenerResumenPedidos,
  obtenerResumenVentas,
} from "../servicios/reportesService";
import "../../estilos/admin-inicio.css";

const ATAJOS = [
  { id: "inicio", texto: "Desde el inicio" },
  { id: "anio", texto: "Año en curso" },
  { id: "mesAnterior", texto: "Mes anterior" },
  { id: "mesActual", texto: "Mes actual" },
];

function rangoAtajo(atajo, inicioActividades) {
  const hoy = hoyArgentina();
  const [anio, mes] = hoy.split("-").map(Number);
  const dos = (n) => String(n).padStart(2, "0");

  if (atajo === "inicio")
    return { desde: inicioActividades || hoy, hasta: hoy };

  if (atajo === "anio")
    return { desde: `${anio}-01-01`, hasta: hoy };

  if (atajo === "mesAnterior") {
    const a = mes === 1 ? anio - 1 : anio;
    const m = mes === 1 ? 12 : mes - 1;
    const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();

    return {
      desde: `${a}-${dos(m)}-01`,
      hasta: `${a}-${dos(m)}-${dos(ultimo)}`,
    };
  }

  return { desde: `${anio}-${dos(mes)}-01`, hasta: hoy };
}

function InicioPanel() {
  const { puede } = useAuth();
  const puedeVerVentas = puede("VerVentas");

  const [resumenPedidos, setResumenPedidos] = useState(null);
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
        const [pedidos, stock] = await Promise.all([
          obtenerResumenPedidos(),
          obtenerResumenStock(5),
        ]);
        setResumenPedidos(pedidos);
        setResumenStock(stock);
      } catch {
        setError("No pudimos cargar el resumen. Probá nuevamente.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  useEffect(() => {
    if (!puedeVerVentas) return undefined;

    let vigente = true;
    setCargandoVentas(true);

    obtenerResumenVentas(rango.desde, rango.hasta)
      .then((resultado) => {
        if (!vigente) return;
        setVentas(resultado);
        setErrorVentas(null);
      })
      .catch((err) => {
        if (!vigente) return;
        setErrorVentas(
          err?.errors?.[0]?.message || "No pudimos cargar las ventas."
        );
      })
      .finally(() => {
        if (vigente) setCargandoVentas(false);
      });

    return () => {
      vigente = false;
    };
  }, [puedeVerVentas, rango]);

  function elegirAtajo(id) {
    setAtajoActivo(id);
    if (id !== "personalizado")
      setRango(rangoAtajo(id, ventas?.inicioActividades));
  }

  function manejarFecha(e) {
    const { name, value } = e.target;
    setAtajoActivo("personalizado");
    setRango((anterior) => ({ ...anterior, [name]: value }));
  }

  const tarjetas = puedeVerVentas
    ? [
        {
          texto: "Ventas online",
          valor: errorVentas
            ? "—"
            : cargandoVentas
              ? "…"
              : ventas
                ? formatearPesos(ventas.totalVendido)
                : "—",
        },
        {
          texto: "Pedidos pagados",
          valor: errorVentas
            ? "—"
            : cargandoVentas
              ? "…"
              : ventas?.pedidos ?? "—",
        },
        {
          texto: "Por preparar",
          valor: cargando ? "…" : resumenPedidos?.porPreparar ?? "—",
          ruta: "/admin/pedidos",
          enlace: "Ver pedidos",
        },
        {
          texto: "Stock bajo",
          valor: cargando ? "…" : resumenStock?.stockBajo ?? "—",
          ruta: "/admin/stock",
          enlace: "Ver stock",
        },
      ]
    : [
        {
          texto: "Pedidos nuevos hoy",
          valor: cargando ? "…" : resumenPedidos?.nuevosHoy ?? "—",
        },
        {
          texto: "Por preparar",
          valor: cargando ? "…" : resumenPedidos?.porPreparar ?? "—",
          ruta: "/admin/pedidos",
          enlace: "Ver pedidos",
        },
        {
          texto: "En preparación",
          valor: cargando ? "…" : resumenPedidos?.enPreparacion ?? "—",
          ruta: "/admin/pedidos",
          enlace: "Ver pedidos",
        },
        {
          texto: "Stock bajo",
          valor: cargando ? "…" : resumenStock?.stockBajo ?? "—",
          ruta: "/admin/stock",
          enlace: "Ver stock",
        },
      ];

  return (
    <main className="estructura">
      <Contenedor>
        <h1>Resumen del negocio</h1>

        {error && <p className="login-admin__error">{error}</p>}

        {puedeVerVentas && (
          <section
            className="admin-inicio__filtros"
            aria-label="Período de ventas"
          >
            <div className="estructura__campo admin-inicio__periodo">
              <label htmlFor="periodo-ventas">Período de ventas</label>
              <select
                id="periodo-ventas"
                value={atajoActivo}
                onChange={(e) => elegirAtajo(e.target.value)}
              >
                {ATAJOS.map(({ id, texto }) => (
                  <option key={id} value={id}>
                    {texto}
                  </option>
                ))}
                <option value="personalizado">
                  Fechas personalizadas
                </option>
              </select>
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
          </section>
        )}

        {errorVentas && puedeVerVentas && (
          <p className="login-admin__error">{errorVentas}</p>
        )}

        <section
          className="estructura__resumen admin-inicio__estados"
          aria-label="Resumen del negocio"
        >
          {tarjetas.map((tarjeta) => (
            <article
              className="estructura__tarjeta"
              key={tarjeta.texto}
            >
              <span>{tarjeta.texto}</span>
              <strong>{tarjeta.valor}</strong>

              {tarjeta.ruta && (
                <Link
                  to={tarjeta.ruta}
                  className="admin-inicio__enlace"
                >
                  {tarjeta.enlace}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </article>
          ))}
        </section>

        {puedeVerVentas && (
          <p className="admin-inicio__aclaracion">
            {cargandoVentas
              ? "Calculando…"
              : `Del ${formatearFecha(rango.desde)} al ${formatearFecha(rango.hasta)} · Solo ventas online; las ventas de mostrador no se incluyen.`}
          </p>
        )}
      </Contenedor>

      <CintaMarcas />
    </main>
  );
}

export default InicioPanel;
