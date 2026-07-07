import { Routes, Route } from 'react-router-dom'
import TiendaLayout from './tienda/componentes/TiendaLayout'
import Inicio from './tienda/paginas/Inicio'
import Categoria from './pages/Categoria'
import InicioPanel from './admin/paginas/InicioPanel'

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<InicioPanel />} />
      <Route element={<TiendaLayout />}>
        <Route index element={<Inicio />} />
        <Route path=":genero" element={<Categoria />} />
        <Route path=":genero/:categoria" element={<Categoria />} />
      </Route>
    </Routes>
  )
}

export default App
