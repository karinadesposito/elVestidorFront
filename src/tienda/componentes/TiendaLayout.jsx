import { Outlet } from 'react-router-dom'
import Barra from './Barra'
import PiePagina from './PiePagina'

function TiendaLayout() {
  return (
    <>
      <Barra />
      <Outlet />
      <PiePagina />
    </>
  )
}

export default TiendaLayout
