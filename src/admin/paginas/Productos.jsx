import { useState } from "react";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import ModalAdmin from "../componentes/ModalAdmin";

import "../../estilos/admin-productos.css";

const categoriasProductos = [
  {
    nombre: "Productos",
    cantidad: 24,
    color: "fondo-azul",
  },
  {
    nombre: "Stock bajo",
    cantidad: 5,
    color: "fondo-amarillo",
  },
  {
    nombre: "Sin stock",
    cantidad: 2,
    color: "fondo-violeta",
  },
  {
    nombre: "Activos",
    cantidad: 22,
    color: "fondo-verde",
  },
];

const productosIniciales = [
  {
    barcode: "779001",
    nombre: "Remera basica",
    marca: "Vestidor",
    genero: "Hombre",
    categoria: "Remeras",
    variante: "Negro / M",
    stock: 12,
    costo: "$8.500",
    precio: "$18.900",
    observaciones: "Nueva temporada",
    color: "fondo-azul",
  },
  {
    barcode: "779002",
    nombre: "Jean mom",
    marca: "Urbana",
    genero: "Mujer",
    categoria: "Jeans",
    variante: "Azul / 40",
    stock: 4,
    costo: "$21.000",
    precio: "$42.500",
    observaciones: "Stock bajo",
    color: "fondo-amarillo",
  },
  {
    barcode: "779003",
    nombre: "Campera denim",
    marca: "Norte",
    genero: "Mujer",
    categoria: "Camperas",
    variante: "Celeste / L",
    stock: 0,
    costo: "$35.000",
    precio: "$69.900",
    observaciones: "Reponer",
    color: "fondo-violeta",
  },
  {
    barcode: "779004",
    nombre: "Vestido midi",
    marca: "Aura",
    genero: "Mujer",
    categoria: "Faldas y vestidos",
    variante: "Rojo / S",
    stock: 7,
    costo: "$18.400",
    precio: "$37.200",
    observaciones: "Activo",
    color: "fondo-verde",
  },
];

function Productos() {
  const [modalAbierto, setModalAbierto] = useState(null);

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Productos</h1>
          </div>
        </header>

        <section
          className="estructura__resumen"
          aria-label="Categorias de productos"
        >
          {categoriasProductos.map((categoria) => (
            <article
              className={`estructura__tarjeta ${categoria.color}`}
              key={categoria.nombre}
            >
              <span>{categoria.nombre}</span>
              <strong>{categoria.cantidad}</strong>
            </article>
          ))}
        </section>

        <section className="estructura__panel">
          <div className="estructura__panel-encabezado">
            <h2>Listado de productos</h2>

            <div className="estructura__panel-acciones">
              <Boton
                variante="admin"
                onClick={() => setModalAbierto("producto")}
              >
                Nuevo ingreso producto
              </Boton>

              <Boton
                variante="admin"
                onClick={() => setModalAbierto("variante")}
              >
                Nuevo ingreso variante
              </Boton>
            </div>
          </div>

          <div className="estructura__tabla">
            <div className="estructura__tabla-cabecera admin-productos__cabecera">
              <span>Barcode</span>
              <span>Nombre</span>
              <span>Marca</span>
              <span>Genero</span>
              <span>Categoria</span>
              <span>Variante</span>
              <span>Stock</span>
              <span>Costo</span>
              <span>Precio</span>
              <span>Observaciones</span>
            </div>

            {productosIniciales.map((producto) => (
              <article
                className={`estructura__tabla-fila admin-productos__fila ${producto.color}`}
                key={producto.barcode}
              >
                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Barcode</span>

                  <strong>{producto.barcode}</strong>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Nombre</span>

                  <button className="estructura__tabla-boton" type="button">
                    {producto.nombre}
                  </button>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Marca</span>

                  <span>{producto.marca}</span>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Genero</span>

                  <span>{producto.genero}</span>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Categoria</span>

                  <span>{producto.categoria}</span>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Variante</span>

                  <span>{producto.variante}</span>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Stock</span>

                  <strong>{producto.stock}</strong>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Costo</span>

                  <strong>{producto.costo}</strong>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Precio</span>

                  <strong>{producto.precio}</strong>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">
                    Observaciones
                  </span>

                  <span>{producto.observaciones}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Contenedor>

      {modalAbierto === "producto" && (
        <ModalAdmin
          titulo="Nuevo ingreso producto"
          onClose={() => setModalAbierto(null)}
        >
          <form className="estructura__formulario">
            <div className="estructura__campo">
              <label htmlFor="producto-barcode">Barcode</label>
              <input
                id="producto-barcode"
                name="barcode"
                type="text"
                placeholder="Escanear o ingresar codigo"
                autoFocus
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-nombre">Nombre producto</label>
              <input id="producto-nombre" name="nombre" type="text" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-marca">Marca</label>
              <input id="producto-marca" name="marca" type="text" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-genero">Genero</label>
              <select id="producto-genero" name="genero">
                <option value="">Seleccionar genero</option>
                <option value="mujer">Mujer</option>
                <option value="hombre">Hombre</option>
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-categoria">Categoria</label>
              <select id="producto-categoria" name="categoria">
                <option value="">Seleccionar categoria</option>
                <option value="jeans">Jeans</option>
                <option value="camperas">Camperas</option>
                <option value="sweaters-y-buzos">Sweaters y buzos</option>
                <option value="camisas">Camisas</option>
                <option value="remeras">Remeras</option>
                <option value="faldas-y-vestidos">Faldas y vestidos</option>
                <option value="shorts-y-bermudas">Shorts y bermudas</option>
                <option value="pantalones">Pantalones</option>
                <option value="bermudas">Bermudas</option>
                <option value="accesorios">Accesorios</option>
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-variante">Primera variante</label>
              <input id="producto-variante" name="variante" type="text" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-stock">Stock inicial</label>
              <input id="producto-stock" name="stock" type="number" min="0" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-costo">Costo</label>
              <input id="producto-costo" name="costo" type="text" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-precio">Precio</label>
              <input id="producto-precio" name="precio" type="text" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="producto-observaciones">Observaciones</label>
              <textarea id="producto-observaciones" name="observaciones" />
            </div>
          </form>
        </ModalAdmin>
      )}

      {modalAbierto === "variante" && (
        <ModalAdmin
          titulo="Nuevo ingreso variante"
          onClose={() => setModalAbierto(null)}
        >
          <form className="estructura__formulario">
            <div className="estructura__campo">
              <label htmlFor="variante-barcode">Barcode</label>
              <input
                id="variante-barcode"
                name="barcode"
                type="text"
                placeholder="Escanear o ingresar codigo"
                autoFocus
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-producto">Producto padre</label>
              <select id="variante-producto" name="producto">
                <option value="">Seleccionar producto</option>
                {productosIniciales.map((producto) => (
                  <option key={producto.barcode} value={producto.nombre}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-nombre">Variante</label>
              <input id="variante-nombre" name="variante" type="text" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-stock">Stock inicial</label>
              <input id="variante-stock" name="stock" type="number" min="0" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-costo">Costo</label>
              <input id="variante-costo" name="costo" type="text" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="variante-precio">Precio</label>
              <input id="variante-precio" name="precio" type="text" />
            </div>
          </form>
        </ModalAdmin>
      )}
    </main>
  );
}

export default Productos;
