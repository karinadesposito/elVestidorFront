
import { Outlet, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './admin/contexto/AuthContext'
import ProtectedRoute from './admin/componentes/ProtectedRoute'
import BarraSuperior from './admin/componentes/BarraSuperior'

import InicioPanel from './admin/paginas/InicioPanel'
import Pedidos from './admin/paginas/Pedidos'
import DetallePedido from './admin/paginas/DetallePedido'
import Productos from './admin/paginas/Productos'
import Stock from './admin/paginas/Stock'
import Promociones from './admin/paginas/Promociones'

import TiendaLayout from './tienda/componentes/TiendaLayout'
import Inicio from './tienda/paginas/Inicio'
import Catalogo from './tienda/paginas/Catalogo'
import DetalleProducto from './tienda/paginas/DetalleProducto'
import FinalizarCompra from './tienda/paginas/FinalizarCompra'
import ClubConfirmado from './tienda/paginas/ClubConfirmado'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/admin"
          element={<ProtectedRoute />}
        >
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
            <Route path="pedidos/:id" element={<DetallePedido />} />
            <Route path="productos" element={<Productos />} />
            <Route path="stock" element={<Stock />} />
            <Route path="promociones" element={<Promociones />} />
          </Route>
        </Route>

        <Route element={<TiendaLayout />}>
          <Route index element={<Inicio />} />

          <Route
            path="checkout"
            element={<FinalizarCompra />}
          />

          <Route
            path="club/confirmado"
            element={<ClubConfirmado />}
          />

          <Route
            path=":genero"
            element={<Catalogo />}
          />

          <Route
            path=":genero/producto/:productoId"
            element={<DetalleProducto />}
          />

          <Route
            path=":genero/:categoria"
            element={<Catalogo />}
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
