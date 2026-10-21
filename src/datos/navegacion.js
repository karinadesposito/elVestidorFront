
export const categoriasMujer = [
  { titulo: 'Jeans', ruta: '/mujer/jeans' },
  { titulo: 'Camperas', ruta: '/mujer/camperas' },
  {
    titulo: 'Sweaters y Buzos',
    ruta: '/mujer/sweaters-y-buzos',
  },
  {
    titulo: 'Camisas y Tops',
    ruta: '/mujer/camisas-y-tops',
  },
  { titulo: 'Pantalones', ruta: '/mujer/pantalones' },
  { titulo: 'Remeras', ruta: '/mujer/remeras' },
  {
    titulo: 'Faldas, Vestidos y Monos',
    ruta: '/mujer/faldas-vestidos-y-monos',
  },
  { titulo: 'Ver Todo', ruta: '/mujer' },
  {
    titulo: 'Accesorios',
    tipo: 'separador',
  },
  {
    titulo: 'Cinturones y Billeteras',
    ruta: '/mujer/cinturones-y-billeteras',
  },
]

export const categoriasHombre = [
  { titulo: 'Jeans', ruta: '/hombre/jeans' },
  { titulo: 'Camperas', ruta: '/hombre/camperas' },
  {
    titulo: 'Sweaters y Buzos',
    ruta: '/hombre/sweaters-y-buzos',
  },
  { titulo: 'Camisas', ruta: '/hombre/camisas' },
  { titulo: 'Pantalones', ruta: '/hombre/pantalones' },
  {
    titulo: 'Remeras y Polos',
    ruta: '/hombre/remeras-y-polos',
  },
  { titulo: 'Bermudas', ruta: '/hombre/bermudas' },
  { titulo: 'Ver Todo', ruta: '/hombre' },
  {
    titulo: 'Accesorios',
    tipo: 'separador',
  },
  {
    titulo: 'Mochilas y Bolsos',
    ruta: '/hombre/mochilas-y-bolsos',
  },
  {
    titulo: 'Cinturones y Billeteras',
    ruta: '/hombre/cinturones-y-billeteras',
  },
  {
    titulo: 'Caps y Gorros',
    ruta: '/hombre/caps-y-gorros',
  },
  {
    titulo: 'Boxers y Medias',
    ruta: '/hombre/boxers-y-medias',
  },
  {
    titulo: 'Bufandas',
    ruta: '/hombre/bufandas',
  },
  {
    titulo: 'Ver Todo',
    ruta: '/hombre/accesorios',
  },
]

export const gruposSale = [
  {
    titulo: 'Mujer',
    items: categoriasMujer
      .filter(item => item.tipo !== 'separador')
      .map(item => ({
        ...item,
        ruta: item.ruta.replace(
          '/mujer',
          '/sale/mujer',
        ),
      })),
  },
  {
    titulo: 'Hombre',
    items: categoriasHombre
      .filter(item => item.tipo !== 'separador')
      .map(item => ({
        ...item,
        ruta: item.ruta.replace(
          '/hombre',
          '/sale/hombre',
        ),
      })),
  },
]
