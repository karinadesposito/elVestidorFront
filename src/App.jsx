import Barra from './componentes/Barra'
import Portada from './componentes/Portada'
import Categorias from './componentes/Categorias'
import CarruselPromociones from './componentes/CarruselPromociones'
import CintaMarcas from './componentes/CintaMarcas'
import BloqueEditorial from './componentes/BloqueEditorial'
import PiePagina from './componentes/PiePagina'

function App() {
  return (
    <>
      <Barra />
      <main>
        <Portada />
        <Categorias />
        <CarruselPromociones />
        <CintaMarcas />
        <BloqueEditorial />
      </main>
      <PiePagina />
    </>
  )
}

export default App
