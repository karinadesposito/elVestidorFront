import { useState } from 'react'
import Portada from '../componentes/Portada'
import Categorias from '../componentes/Categorias'
import Cinta from '../../componentesReuse/Cinta'
import BloqueEditorial from '../componentes/BloqueEditorial'
import Beneficios from '../componentes/Beneficios'
import ModalPromocional from '../../componentesReuse/ModalPromocional'
import marilyn from '../../recursos/imagenes/marilyn-promocional.webp'

function Inicio() {
  const [mostrarModalPromocional, setMostrarModalPromocional] = useState(true)

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
