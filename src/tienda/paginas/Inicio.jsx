
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Portada from '../componentes/Portada'
import Categorias from '../componentes/Categorias'
import Cinta from '../../componentesReuse/Cinta'
import BloqueEditorial from '../componentes/BloqueEditorial'
import Beneficios from '../componentes/Beneficios'
import ModalPromocional from '../../componentesReuse/ModalPromocional'
import marilyn from '../../recursos/imagenes/marilyn-promocional.webp'

function Inicio() {
  const navigate = useNavigate()
  const [mostrarModalPromocional, setMostrarModalPromocional] = useState(true)

  useEffect(() => {
    document.title = "Levi's y EQUUS en Tandil | El Vestidor"

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = "Comprá indumentaria Levi's y EQUUS para hombre y mujer en El Vestidor Tandil. Visitá nuestro local en Pinto 680 o comprá online."
  }, [])

  return (
    <>
      {mostrarModalPromocional && (
        <ModalPromocional
          imagen={marilyn}
          titulo={'NUEVA\nTEMPO\nRADA'}
          subtitulo="VESTITE PRIMERO."
          destacado="10% OFF"
          descripcion="Comprando online"
          boton="DESCUBRIR LA COLECCIÓN"
          onClose={() => setMostrarModalPromocional(false)}
          onAction={() => {
            setMostrarModalPromocional(false)
            navigate('/catalogo')
          }}
        />
      )}

      <main>
        <Portada />
        <Categorias />
        <Cinta />
        <BloqueEditorial />
        <Beneficios />
      </main>
    </>
  )
}

export default Inicio
