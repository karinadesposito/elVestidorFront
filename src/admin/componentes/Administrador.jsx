import { Outlet } from 'react-router-dom'

import BarraSuperior from './BarraSuperior'

function Administrador() {
  return (
    <>
      <BarraSuperior />
      <Outlet />
    </>
  )
}

export default Administrador