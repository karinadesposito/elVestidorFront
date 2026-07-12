import { Outlet, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './admin/contexto/AuthContext'
import ProtectedRoute from './admin/componentes/ProtectedRoute'
import BarraSuperior from './admin/componentes/BarraSuperior'

import InicioPanel from './admin/paginas/InicioPanel'
import Pedidos from './admin/paginas/Pedidos'
import Productos from './admin/paginas/Productos'
import Stock from './admin/paginas/Stock'
import Promociones from './admin/paginas/Promociones'

import TiendaLayout from './tienda/componentes/TiendaLayout'
import Inicio from './tienda/paginas/Inicio'
import Categoria from './pages/Categoria'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route
            element={
              <>
                <BarraSuperior />
                <Outlet />
              </>
            }
          >
            <Route index element={<InicioPanel />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="productos" element={<Productos />} />
            <Route path="stock" element={<Stock />} />
            <Route path="promociones" element={<Promociones />} />
          </Route>
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