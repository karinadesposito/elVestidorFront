import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Contenedor from '../../componentesReuse/Contenedor'
import { comercio } from '../../datos/comercio'
import '../../estilos/Legales.css'

const correo = <a href={`mailto:${comercio.email}`}>{comercio.email}</a>
const whatsapp = <a href={comercio.whatsappUrl} target="_blank" rel="noreferrer">{comercio.whatsapp}</a>

// Textos aprobados en documentos/textos-legales-borrador (borrador 3).
const paginas = {
  terminos: {
    titulo: 'Términos y condiciones',
    descripcion: 'Condiciones de compra de la tienda online de El Vestidor Tandil.',
    contenido: (
      <>
        <h2>Quiénes somos</h2>
        <p>
          Este sitio pertenece a {comercio.titular}, CUIT {comercio.cuit}, con domicilio en {comercio.domicilio} ("El
          Vestidor"). Al comprar en el sitio aceptás estas condiciones.
        </p>

        <h2>Precios y stock</h2>
        <p>
          Los precios están expresados en pesos argentinos e incluyen IVA. El costo de envío se muestra antes de pagar y
          se suma al total. Los precios y promociones publicados valen mientras estén en el sitio y hasta agotar stock.
          Si por un error un producto que compraste no tiene stock, te avisamos y te devolvemos el total pagado.
        </p>

        <h2>Cómo se completa la compra</h2>
        <p>
          La compra queda confirmada cuando Mercado Pago aprueba el pago. En ese momento te enviamos un correo con el
          número de pedido y el detalle. Te avisamos también por correo cuando el pedido se despacha y cuando se entrega.
        </p>

        <h2>Medios de pago</h2>
        <p>
          Los pagos se procesan a través de Mercado Pago (tarjetas de crédito y débito, dinero en cuenta y los demás
          medios que ofrezca). El Vestidor no recibe ni guarda los datos de tu tarjeta.
        </p>

        <h2>Cancelación de la compra</h2>
        <p>
          Además del <Link to="/arrepentimiento">botón de arrepentimiento</Link>, podés pedirnos que cancelemos un
          pedido mientras todavía no fue despachado, escribiéndonos a {correo}. Te reintegramos el total por el mismo
          medio de pago.
        </p>

        <h2>Envíos, cambios y privacidad</h2>
        <p>
          También forman parte de estas condiciones nuestras políticas de <Link to="/envios">envíos</Link>,{' '}
          <Link to="/cambios">cambios y devoluciones</Link> y <Link to="/privacidad">privacidad</Link>.
        </p>

        <h2>Reclamos</h2>
        <p>
          Ante cualquier problema escribinos a {correo} o por WhatsApp al {whatsapp}. Si no quedás conforme con la
          respuesta, podés acudir a la Dirección Provincial de Defensa del Consumidor de la Provincia de Buenos Aires, a
          la oficina municipal de Defensa del Consumidor de Tandil o a la{' '}
          <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor" target="_blank" rel="noreferrer">
            Ventanilla Federal de Defensa del Consumidor
          </a>
          .
        </p>
      </>
    ),
  },

  envios: {
    titulo: 'Envíos',
    descripcion: 'Envíos a todo el país por Correo Argentino y retiro sin cargo en el local de El Vestidor Tandil.',
    contenido: (
      <>
        <p>
          Enviamos a todo el país a través de Correo Argentino. También podés retirar sin cargo en el local, en{' '}
          {comercio.domicilio}, de lunes a sábado de 09:00 a 20:30 hs.
        </p>
        <p>
          Despachamos los pedidos dentro de los 2 días hábiles posteriores a la aprobación del pago. El plazo de entrega
          de la empresa de transporte es de 3 a 7 días hábiles según la zona. Cuando despachamos te enviamos por correo
          la empresa y el código de seguimiento.
        </p>
        <p>Si el paquete llega dañado o no llega en el plazo informado, escribinos a {correo} y lo resolvemos.</p>
      </>
    ),
  },

  cambios: {
    titulo: 'Cambios y devoluciones',
    descripcion: 'Cambios dentro de los 30 días y devoluciones en El Vestidor Tandil.',
    contenido: (
      <>
        <h2>Cambio de talle o color</h2>
        <p>
          Podés cambiar cualquier producto dentro de los 30 días corridos desde que lo recibiste, siempre que esté sin
          uso y con sus etiquetas. El cambio se hace por el mismo producto en otro talle o color, o por otro producto
          (si tiene otro precio, se abona o se reintegra la diferencia), sujeto a stock. Podés hacerlo en el local o por
          envío; en los cambios por envío, el costo del envío corre por cuenta de El Vestidor.
        </p>

        <h2>Cómo pedir un cambio o una devolución</h2>
        <p>
          Escribinos a {correo} o por WhatsApp al {whatsapp}, contanos qué pasó con tu compra y buscamos juntos la
          solución.
        </p>

        <h2>Productos con falla</h2>
        <p>
          Si el producto tiene una falla, lo cambiamos o te devolvemos el dinero, a tu elección, sin costo de envío. La
          garantía legal es de 6 meses desde la entrega, como establece la Ley 24.240.
        </p>

        <h2>Arrepentimiento de la compra</h2>
        <p>
          Tenés 10 días corridos desde que recibiste el producto para arrepentirte de la compra, sin explicar el motivo
          y sin costo. Podés hacerlo desde el <Link to="/arrepentimiento">botón de arrepentimiento</Link>.
        </p>

        <h2>Devolución del dinero</h2>
        <p>
          Cuando corresponda devolver el dinero, lo reintegramos por el mismo medio de pago a través de Mercado Pago. El
          tiempo en que se acredita depende del medio de pago y del banco.
        </p>
      </>
    ),
  },

  privacidad: {
    titulo: 'Política de privacidad',
    descripcion: 'Cómo usa y protege El Vestidor Tandil los datos personales de sus clientes.',
    contenido: (
      <>
        <h2>Qué datos pedimos y para qué</h2>
        <p>
          Para procesar tu compra pedimos tu nombre, correo, teléfono y dirección de entrega. Los usamos solo para
          preparar y enviar tu pedido, avisarte de su estado y atender tus consultas. Los datos de pago los procesa
          Mercado Pago; nosotros no los recibimos ni los guardamos.
        </p>

        <h2>El Vestidor Club</h2>
        <p>
          Si te suscribís al Club, usamos tu nombre y correo para enviarte novedades y promociones. La suscripción se
          confirma desde el correo que te enviamos, y podés darte de baja en cualquier momento con el enlace que figura
          al pie de cada correo.
        </p>

        <h2>Con quién los compartimos</h2>
        <p>
          Solo con quienes nos ayudan a completar la compra: la empresa de envío (nombre, dirección y teléfono), Mercado
          Pago (para el cobro) y nuestro proveedor de correo electrónico. No vendemos ni cedemos tus datos a terceros.
        </p>

        <h2>Tus derechos</h2>
        <p>
          Podés pedirnos acceder a tus datos, corregirlos o eliminarlos escribiendo a {correo}. El responsable de la base
          de datos es {comercio.titular}, con domicilio en {comercio.domicilio}.
        </p>
        <p>
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
          lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. La Agencia de Acceso a la Información Pública,
          en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y
          reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes
          en materia de protección de datos personales.
        </p>
      </>
    ),
  },

  contacto: {
    titulo: 'Contacto',
    descripcion: 'Contactá a El Vestidor Tandil por correo o WhatsApp, o visitá el local en Pinto 680.',
    contenido: (
      <dl className="legal__datos">
        <dt>Correo</dt>
        <dd>{correo}</dd>
        <dt>WhatsApp</dt>
        <dd>{whatsapp}</dd>
        <dt>Local</dt>
        <dd>{comercio.domicilio}</dd>
        <dt>Horario de atención</dt>
        <dd>{comercio.horario}</dd>
        <dt>Titular</dt>
        <dd>{comercio.titular} · CUIT {comercio.cuit} · {comercio.condicionIva}</dd>
      </dl>
    ),
  },
}

function PaginaLegal({ pagina }) {
  const { titulo, descripcion, contenido } = paginas[pagina]

  useEffect(() => {
    document.title = `${titulo} | El Vestidor`

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = descripcion
  }, [titulo, descripcion])

  return (
    <main className="legal">
      <Contenedor className="legal__contenedor">
        <p className="legal__etiqueta">El Vestidor</p>
        <h1 className="legal__titulo">{titulo}</h1>
        <div className="legal__texto">{contenido}</div>
      </Contenedor>
    </main>
  )
}

export default PaginaLegal
