export const categoriasMujer = [
  { titulo: 'Jeans', ruta: '/mujer/jeans' },
  { titulo: 'Camperas', ruta: '/mujer/camperas' },
  { titulo: 'Sweaters y buzos', ruta: '/mujer/sweaters-y-buzos' },
  { titulo: 'Camisas', ruta: '/mujer/camisas' },
  { titulo: 'Remeras', ruta: '/mujer/remeras' },
  { titulo: 'Faldas y vestidos', ruta: '/mujer/faldas-y-vestidos' },
  { titulo: 'Shorts y bermudas', ruta: '/mujer/shorts-y-bermudas' },
  { titulo: 'Accesorios', ruta: '/mujer/accesorios' },
  { titulo: 'Ver todo', ruta: '/mujer' },
]

export const categoriasHombre = [
  { titulo: 'Jeans', ruta: '/hombre/jeans' },
  { titulo: 'Camperas', ruta: '/hombre/camperas' },
  { titulo: 'Sweaters y buzos', ruta: '/hombre/sweaters-y-buzos' },
  { titulo: 'Camisas', ruta: '/hombre/camisas' },
  { titulo: 'Pantalones', ruta: '/hombre/pantalones' },
  { titulo: 'Remeras', ruta: '/hombre/remeras' },
  { titulo: 'Bermudas', ruta: '/hombre/bermudas' },
  { titulo: 'Accesorios', ruta: '/hombre/accesorios' },
  { titulo: 'Ver todo', ruta: '/hombre' },
]

export const gruposSale = [
  {
    titulo: 'Mujer',
    items: categoriasMujer.map((item) => ({
      ...item,
      ruta: item.ruta.replace('/mujer', '/sale/mujer'),
    })),
  },
  {
    titulo: 'Hombre',
    items: categoriasHombre.map((item) => ({
      ...item,
      ruta: item.ruta.replace('/hombre', '/sale/hombre'),
    })),
  },
]