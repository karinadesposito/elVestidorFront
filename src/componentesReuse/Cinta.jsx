import { useEffect, useState } from 'react'
import Contenedor from '../componentes/Contenedor'

import merrell from '../recursos/logosMarcas/merrellLogo.png'
import hushPuppies from '../recursos/logosMarcas/hushpippiesLogo.jpeg'
import cat from '../recursos/logosMarcas/catLogo.png'
import vans from '../recursos/logosMarcas/logoVans.png'
import apie from '../recursos/logosMarcas/apieLogo.png'
import equus from '../recursos/logosMarcas/equusLogo.jpg'
import kickers from '../recursos/logosMarcas/kickersLogo.png'
import levis from '../recursos/logosMarcas/LogoLevis.png'
import newBalance from '../recursos/logosMarcas/newbalanceLogo.png'
import trown from '../recursos/logosMarcas/trownLogo.jpg'

const marcas = [
  { nombre: 'Merrell', imagen: merrell },
  { nombre: 'Hush Puppies', imagen: hushPuppies },
  { nombre: 'CAT', imagen: cat },
  { nombre: 'Vans', imagen: vans },
  { nombre: 'Apie', imagen: apie },
  { nombre: 'Equus', imagen: equus },
  { nombre: 'Kickers', imagen: kickers },
  { nombre: "Levi's", imagen: levis },
  { nombre: 'New Balance', imagen: newBalance },
  { nombre: 'Trown', imagen: trown },
]

function CintaMarcas() {
  const [tablet, setTablet] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 48rem)')
    setTablet(mq.matches)
    const onChange = (e) => setTablet(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <section className="seccion cinta-marcas">
      <Contenedor>
        <p className="texto-etiqueta cinta-marcas__titulo">
          Nuetras marcas
        </p>
        {tablet ? (
          <div className="cinta-marcas__cinta">
            <div className="cinta-marcas__pista">
              {Array.from({ length: 4 }, () => marcas).flat().map(({ nombre, imagen }, i) => (
                <div key={`${nombre}-${i}`} className="cinta-marcas__item">
                  <img className="cinta-marcas__logo" src={imagen} alt={nombre} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cinta-marcas__lista">
            {marcas.map(({ nombre, imagen }) => (
              <div key={nombre} className="cinta-marcas__item">
                <img className="cinta-marcas__logo" src={imagen} alt={nombre} />
              </div>
            ))}
          </div>
        )}
      </Contenedor>
    </section>
  )
}

export default CintaMarcas
