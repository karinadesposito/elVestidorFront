import { useState } from 'react'
import Barra from './componentes/Barra'
import Portada from './componentes/Portada'
import Categorias from './componentes/Categorias'
import CarruselPromociones from './componentes/CarruselPromociones'
import Cinta from './componentesReuse/Cinta'
import BloqueEditorial from './componentes/BloqueEditorial'
import Beneficios from './componentes/Beneficios'
import PiePagina from './componentes/PiePagina'
import ModalPromocional from './componentesReuse/ModalPromocional'
import marilyn from './recursos/imagenes/marilyn-promocional.webp'

function App() {
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

      <Barra />

      <main>
        <Portada />
        <Categorias />
        {/* <CarruselPromociones /> */}
        <Cinta />
        <BloqueEditorial />
        <Beneficios />
      </main>

      <PiePagina />
    </>
  )
}

export default App
