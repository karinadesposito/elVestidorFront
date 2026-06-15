import Barra from './componentes/Barra'
import Portada from './componentes/Portada'
import Categorias from './componentes/Categorias'
import CarruselPromociones from './componentes/CarruselPromociones'
import Cinta from './componentesReuse/Cinta'
import BloqueEditorial from './componentes/BloqueEditorial'
import Beneficios from './componentes/Beneficios'
import PiePagina from './componentes/PiePagina'

function App() {
  return (
    <>
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
