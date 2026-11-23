
import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'

import TiendaLayout from './tienda/componentes/TiendaLayout'
import Inicio from './tienda/paginas/Inicio'
import Catalogo from './tienda/paginas/Catalogo'
import DetalleProducto from './tienda/paginas/DetalleProducto'
import FinalizarCompra from './tienda/paginas/FinalizarCompra'
import ClubConfirmado from './tienda/paginas/ClubConfirmado'
import PaginaLegal from './tienda/paginas/PaginaLegal'
import Arrepentimiento from './tienda/paginas/Arrepentimiento'

const AuthProvider = lazy(() =>
  import('./admin/contexto/AuthContext').then(({ AuthProvider }) => ({ default: AuthProvider }))
)
const ProtectedRoute = lazy(() => import('./admin/componentes/ProtectedRoute'))
const BarraSuperior = lazy(() => import('./admin/componentes/BarraSuperior'))

const InicioPanel = lazy(() => import('./admin/paginas/InicioPanel'))
const Pedidos = lazy(() => import('./admin/paginas/Pedidos'))
const DetallePedido = lazy(() => import('./admin/paginas/DetallePedido'))
const Productos = lazy(() => import('./admin/paginas/Productos'))
const Stock = lazy(() => import('./admin/paginas/Stock'))
const Promociones = lazy(() => import('./admin/paginas/Promociones'))
const Envios = lazy(() => import('./admin/paginas/Envios'))

function App() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <Suspense fallback={<p>Cargando...</p>}>
            <AuthProvider>
              <ProtectedRoute />
            </AuthProvider>
          </Suspense>
        }
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
          <Route path="envios" element={<Envios />} />
        </Route>
      </Route>

      <Route element={<TiendaLayout />}>
        <Route index element={<Inicio />} />

        <Route
          path="catalogo"
          element={<Catalogo general />}
        />

        <Route
          path="catalogo/producto/:productoId"
          element={<DetalleProducto />}
        />

        <Route
          path="seasons"
          element={<Catalogo soloTemporada />}
        />

        <Route
          path="checkout"
          element={<FinalizarCompra />}
        />

        <Route
          path="club/confirmado"
          element={<ClubConfirmado />}
        />

        <Route path="terminos" element={<PaginaLegal pagina="terminos" />} />
        <Route path="envios" element={<PaginaLegal pagina="envios" />} />
        <Route path="cambios" element={<PaginaLegal pagina="cambios" />} />
        <Route path="privacidad" element={<PaginaLegal pagina="privacidad" />} />
        <Route path="contacto" element={<PaginaLegal pagina="contacto" />} />
        <Route path="arrepentimiento" element={<Arrepentimiento />} />

        <Route
          path="sale/producto/:productoId"
          element={<DetalleProducto />}
        />

        <Route
          path="sale/:generoSale/:categoria"
          element={<Catalogo />}
        />

        <Route
          path="sale/:generoSale"
          element={<Catalogo />}
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
  )
}

export default App
