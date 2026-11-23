import { useEffect, useRef, useState } from 'react'
import Contenedor from '../../componentesReuse/Contenedor'
import Boton from '../../componentesReuse/Boton'
import { useAuth } from '../contexto/AuthContext'
import { obtenerTarifasEnvioZonas, guardarTarifasEnvioZonas } from '../servicios/enviosZonasService'
const CLAVES = { TANDIL: 'tandil', BUENOS_AIRES_CABA: 'buenosAiresCaba', RESTO_PAIS: 'restoPais' }
export default function Envios() {
  const { puede } = useAuth()
  const autorizado = puede('GestionarEnvios')
  const [filas, setFilas] = useState([])
  const [valores, setValores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const solicitud = useRef(false)
  function aplicar(resultado) {
    setFilas(resultado)
    setValores(Object.fromEntries(resultado.map(f => [CLAVES[f.zona], (f.importeCentavos / 100).toFixed(2)])))
  }
  useEffect(() => {
    let activo = true
    if (!autorizado) { setCargando(false); return () => { activo = false } }
    obtenerTarifasEnvioZonas().then(r => { if (activo) aplicar(r) })
      .catch(e => { if (activo) setError(e.message || 'No pudimos consultar las tarifas.') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [autorizado])
  async function guardar(evento) {
    evento.preventDefault()
    if (solicitud.current || !autorizado) return
    solicitud.current = true; setGuardando(true); setError(''); setMensaje('')
    try { aplicar(await guardarTarifasEnvioZonas(valores)); setMensaje('Tarifas guardadas y habilitadas para la tienda.') }
    catch (e) { setError(e.message || 'No pudimos guardar las tarifas.') }
    finally { solicitud.current = false; setGuardando(false) }
  }
  return <main className="seccion"><Contenedor>
    <h1>Envíos</h1>
    {!autorizado ? <p>No tenés permiso para gestionar envíos.</p> : <>
      <p>Tarifas de entrega a domicilio en pesos argentinos. El retiro en el local es gratuito.</p>
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
      {cargando ? <p>Cargando tarifas...</p> : filas.length > 0 && <form onSubmit={guardar}>
        <fieldset disabled={guardando}>
          <legend>Costo que paga el comprador</legend>
          {filas.map(fila => <div className="estructura__campo" key={fila.zona}>
            <label htmlFor={`tarifa-${fila.zona}`}>{fila.nombre}</label>
            <input id={`tarifa-${fila.zona}`} value={valores[CLAVES[fila.zona]] || ''} inputMode="decimal"
              onChange={e => { setValores(v => ({ ...v, [CLAVES[fila.zona]]: e.target.value })); setMensaje('') }} required />
            {!fila.habilitada && <small>Tarifa pendiente de habilitar al guardar.</small>}
          </div>)}
        </fieldset>
        <p>Buenos Aires y CABA excluye Tandil. Tandil comprende localidad Tandil y código postal 7000.</p>
        <p>Estas tarifas no generan envíos ni etiquetas en el correo. El comercio gestiona el despacho y las diferencias de costo con el transportista.</p>
        <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar y habilitar tarifas'}</Boton>
      </form>}
    </>}
  </Contenedor></main>
}
