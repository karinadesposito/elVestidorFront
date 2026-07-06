import { useState } from 'react'
import Barra from './tienda/componentes/Barra'
import Portada from './tienda/componentes/Portada'
import Categorias from './tienda/componentes/Categorias'
import Cinta from './componentesReuse/Cinta'
import BloqueEditorial from './tienda/componentes/BloqueEditorial'
import Beneficios from './tienda/componentes/Beneficios'
import PiePagina from './tienda/componentes/PiePagina'
import ModalPromocional from './componentesReuse/ModalPromocional'
import InicioPanel from './admin/paginas/InicioPanel'
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
        <Cinta />
        <BloqueEditorial />
        <Beneficios />

        {/* Vista temporal del panel admin para mostrar al equipo */}
        <InicioPanel />
      </main>

      <PiePagina />
    </>
  )
}

export default App