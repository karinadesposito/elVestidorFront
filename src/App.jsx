import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './admin/contexto/AuthContext'
import ProtectedRoute from './admin/componentes/ProtectedRoute'
import InicioPanel from './admin/paginas/InicioPanel'
import TiendaLayout from './tienda/componentes/TiendaLayout'
import Inicio from './tienda/paginas/Inicio'
import Categoria from './pages/Categoria'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<InicioPanel />} />
        </Route>

        <Route element={<TiendaLayout />}>
          <Route index element={<Inicio />} />
          <Route path=":genero" element={<Categoria />} />
          <Route path=":genero/:categoria" element={<Categoria />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
