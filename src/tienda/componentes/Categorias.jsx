
import { useNavigate, useOutletContext } from "react-router-dom";

import Contenedor from "../../componentesReuse/Contenedor";
import Card from "../../componentesReuse/Cards";

import modeloHombreImg from "../../recursos/imagenes/modelo_hombre.webp";
import modeloMujerImg from "../../recursos/imagenes/modelo_mujer.webp";
import accesoriosImg from "../../recursos/imagenes/accesorios.webp";
import saleImg from "../../recursos/imagenes/sale.webp";
import logoLevis from "../../recursos/logosMarcas/LogoLevis.png";
import logoEquus from "../../recursos/logosMarcas/equusLogo.jpg";

const categorias = [
  {
    nombre: "MUJER",
    ruta: "/mujer",
    imagen: modeloMujerImg,
  },
  {
    nombre: "HOMBRE",
    ruta: "/hombre",
    imagen: modeloHombreImg,
  },
  {
    nombre: "ACCESORIOS",
    ruta: "/mujer/accesorios",
    imagen: accesoriosImg,
  },
  {
    nombre: "SALE",
    ruta: null,
    imagen: saleImg,
  },
];

function Categorias() {
  const navigate = useNavigate();
  const { abrirPromocionSale } = useOutletContext();

  return (
    <>
      <section className="seccion categorias">
        <Contenedor>
          <header className="categoria__encabezado">
            <img src={logoLevis} alt="" aria-hidden="true" />
            <h1>Levi's y EQUUS en Tandil</h1>
            <img src={logoEquus} alt="" aria-hidden="true" />
          </header>
          <div className="categorias__grilla">
            {categorias.map((categoria) => (
              <Card
                key={categoria.nombre}
                imagen={categoria.imagen}
                nombre={categoria.nombre}
                onClick={
                  categoria.nombre === "SALE"
                    ? abrirPromocionSale
                    : () => navigate(categoria.ruta)
                }
              />
            ))}
          </div>
        </Contenedor>
      </section>
    </>
  );
}

export default Categorias;
