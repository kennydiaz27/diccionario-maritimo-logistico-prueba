// ==========================================
// FICHA INDIVIDUAL DEL TÉRMINO
// ==========================================


document.addEventListener("DOMContentLoaded", async () => {


    const contenedor =
        document.querySelector("#termDetail");


    if (!contenedor) {

        return;

    }


    // ==========================================
    // OBTENER ID DEL TÉRMINO
    // ==========================================


    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get("id");

    const registro =
        parametros.get("registro");


    if (
        !id &&
        registro === null
    ) {

        mostrarErrorTermino(
            contenedor,
            "No se especificó ningún término."
        );

        return;

    }


    // ==========================================
    // CARGAR DICCIONARIO
    // ==========================================


    let datos = [];


    try {

        datos =
            await cargarDiccionario();

    } catch (error) {

        console.error(
            "❌ Error cargando diccionario:",
            error
        );

        mostrarErrorTermino(
            contenedor,
            "No se pudo cargar el diccionario."
        );

        return;

    }


    if (
        !datos ||
        datos.length === 0
    ) {

        mostrarErrorTermino(
            contenedor,
            "No se encontraron datos en el diccionario."
        );

        return;

    }


    // ==========================================
    // BUSCAR EL TÉRMINO
    // ==========================================


    let termino = null;


    // ==========================================
    // BUSCAR POR POSICIÓN DEL REGISTRO
    // ==========================================


    if (
        registro !== null &&
        registro !== "" &&
        !isNaN(Number(registro))
    ) {

        const indice =
            Number(registro);

        termino =
            datos[indice];

    }


    // ==========================================
    // SI NO EXISTE REGISTRO,
    // BUSCAR POR ID COMO RESPALDO
    // ==========================================


    if (
        !termino &&
        id
    ) {

        termino =
            datos.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

    }


    if (!termino) {

        console.error(
            "❌ No se encontró el ID:",
            id
        );

        mostrarErrorTermino(
            contenedor,
            "No se encontró el término solicitado."
        );

        return;

    }


    console.log(
        "✅ Término encontrado:",
        termino
    );


    // ==========================================
    // TÍTULO DE LA PÁGINA
    // ==========================================


    document.title =
        `${termino.termino || "Término"} | Diccionario de Negocios Internacionales`;


    // ==========================================
    // DETERMINAR SI ES SIGLA
    // ==========================================


    if (
        esSiglaDetalle(termino)
    ) {

        renderizarFichaSigla(
            termino,
            contenedor
        );

    } else {

        renderizarFichaConcepto(
            termino,
            contenedor
        );

    }


    // ==========================================
    // INICIAR BUSCADOR DEL HEADER
    // ==========================================


    iniciarBuscadorTermino(datos);


});


// ==========================================
// DETECTAR SIGLA
// ==========================================


function esSiglaDetalle(item) {

    if (!item) {

        return false;

    }


    const tipo =
        normalizarTexto(
            item.tipo
        );


    if (
        tipo === "sigla" ||
        tipo === "siglas" ||
        tipo === "abreviatura" ||
        tipo === "abreviaturas"
    ) {

        return true;

    }


    if (
        item.esSigla === true
    ) {

        return true;

    }


    const categoriasSiglas = [

        "Contenedores y Carga",
        "Costos y Tarifas",
        "Documentos Comerciales",
        "Términos Incoterms®",
        "Operaciones y Otros",
        "Aduanas y Normatividad"

    ];


    const categoria =
        normalizarTexto(
            item.categoria
        );


    const subcategoria =
        normalizarTexto(
            item.subcategoria
        );


    return categoriasSiglas.some(
        categoriaSigla => {

            const categoriaNormalizada =
                normalizarTexto(
                    categoriaSigla
                );


            return (
                categoria === categoriaNormalizada ||
                subcategoria === categoriaNormalizada
            );

        }
    );

}

// ==========================================
// DETERMINAR DESTINO DEL BOTÓN CERRAR
// ==========================================

function obtenerDestinoCerrarTermino() {

    const restaurarCatalogo =
        sessionStorage.getItem(
            "restaurarCatalogo"
        );

    // ==========================================
    // VENIMOS DEL CATÁLOGO
    // ==========================================

    if (
        restaurarCatalogo === "true"
    ) {

        return "catalogo.html";
    }


    // ==========================================
    // VENIMOS DE OTRA PÁGINA
    // ==========================================

    const paginaAnterior =
        sessionStorage.getItem(
            "paginaAnteriorTermino"
        );


    if (paginaAnterior) {

        return paginaAnterior;
    }


    // ==========================================
    // RESPALDO
    // ==========================================

    return "../index.html";
}
// ==========================================
// FICHA DE CONCEPTO
// ==========================================


function renderizarFichaConcepto(
    item,
    contenedor
) {

    const nivel =
        item.nivel ||
        "Sin nivel";


    const termino =
        item.termino ||
        "Sin término";


    const ingles =
        item.ingles ||
        "";


    const categoria =
        item.categoria ||
        "";


    const subcategoria =
        item.subcategoria ||
        "";


    const definicionES =
        item.definicion_es ||
        "";


    const definicionEN =
        item.definicion_en ||
        "";


    const ejemplo =
        item.ejemplo ||
        item.ejemplo_uso ||
        "";


    const fuente =
        item.fuente ||
        "";


    contenedor.innerHTML = `

        <!-- ==================================
             NAVEGACIÓN
             ================================== -->

        <div class="term-detail-top">

<a
    href="${obtenerDestinoCerrarTermino()}"
    class="term-close"
    aria-label="Cerrar"
>
    ×
</a>
        </div>


        <!-- ==================================
             ENCABEZADO
             ================================== -->

        <section class="term-heading">

            <span
                class="badge-nivel ${obtenerClaseNivelDetalle(
        nivel
    )}"
            >
                ${escaparHTMLDetalle(nivel)}
            </span>


            <h1>
                ${escaparHTMLDetalle(termino)}
            </h1>


            ${ingles
            ? `
                        <p class="term-english">
                            ${escaparHTMLDetalle(ingles)}
                        </p>
                      `
            : ""
        }


            ${categoria
            ? `
                        <span class="term-category-tag">
                            ${escaparHTMLDetalle(categoria)}
                        </span>
                      `
            : ""
        }

        </section>


        <!-- ==================================
             CONTENIDO
             ================================== -->

        <div class="term-detail-layout">


            <!-- COLUMNA IZQUIERDA -->

            <div class="term-detail-main">


                <!-- DEFINICIONES -->

                <section class="term-card-detail">

                    <div class="term-definition-block">

                        <h2>
                            Definición (Español)
                        </h2>

                        <p>
                            ${formatearTextoDetalle(
            definicionES
        )}
                        </p>

                    </div>


                    ${definicionEN
            ? `
                                <div class="term-definition-block term-definition-english">

                                    <h2>
                                        Definición (Inglés)
                                    </h2>

                                    <p>
                                        ${formatearTextoDetalle(
                definicionEN
            )}
                                    </p>

                                </div>
                              `
            : ""
        }

                </section>


                ${ejemplo
            ? `
                            <section class="term-card-detail term-example">

                                <h2>
                                    Ejemplo de uso
                                </h2>

                                <p>
                                    ${formatearTextoDetalle(
                ejemplo
            )}
                                </p>

                            </section>
                          `
            : ""
        }


            </div>


            <!-- COLUMNA DERECHA -->

            <aside class="term-detail-sidebar">


                <!-- INFORMACIÓN GENERAL -->

                <section class="term-info-card">

                    <div class="term-info-header">
                        Información general
                    </div>


                    <div class="term-info-body">


                        <div class="term-info-item">

                            <span class="term-info-icon">
                                ☷
                            </span>

                            <div>

                                <strong>
                                    Categoría:
                                </strong>

                                <span>
                                    ${escaparHTMLDetalle(
            categoria ||
            "No disponible"
        )}
                                </span>

                            </div>

                        </div>


                        ${subcategoria
            ? `
                                    <div class="term-info-item">

                                        <span class="term-info-icon">
                                            ◉
                                        </span>

                                        <div>

                                            <strong>
                                                Subcategoría:
                                            </strong>

                                            <span>
                                                ${escaparHTMLDetalle(
                subcategoria
            )}
                                            </span>

                                        </div>

                                    </div>
                                  `
            : ""
        }


                        <div class="term-info-item">

                            <span class="term-info-icon">
                                ◎
                            </span>

                            <div>

                                <strong>
                                    Idioma:
                                </strong>

                                <span>
                                    Español / Inglés
                                </span>

                            </div>

                        </div>


                        <div class="term-info-item">

                            <span class="term-info-icon">
                                ▤
                            </span>

                            <div>

                                <strong>
                                    Tipo de término:
                                </strong>

                                <span>
                                    ${escaparHTMLDetalle(
            item.tipo ||
            "Término"
        )}
                                </span>

                            </div>

                        </div>


                    </div>

                </section>


                ${fuente
            ? `
                            <section class="term-info-card term-source-card">

                                <div class="term-info-header">
                                    Fuente
                                </div>


                                <div class="term-info-body">

                                    <div class="term-source">

                                        <span class="term-info-icon">
                                            ▤
                                        </span>

                                        <a
                                            href="${escaparAtributoDetalle(fuente)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            ${escaparHTMLDetalle(fuente)}
                                        </a>

                                    </div>

                                </div>

                            </section>
                          `
            : ""
        }


            </aside>

        </div>

    `;

}


// ==========================================
// FICHA DE SIGLA
// ==========================================


function renderizarFichaSigla(
    item,
    contenedor
) {

    const nivel =
        item.nivel ||
        "Sin nivel";


    const sigla =
        item.termino ||
        item.sigla ||
        "Sin sigla";


    const ingles =
        item.ingles ||
        item.nombreOriginalIngles ||
        item.nombre_original ||
        "";


    const traduccion =
        item.traduccion_es ||
        item.significado_es ||
        item.definicion_es ||
        item["Traducción / Significado (Español)"] ||
        "";


    contenedor.innerHTML = `

        <div class="term-detail-top">
<a
    href="${obtenerDestinoCerrarTermino()}"
    class="term-close"
    aria-label="Cerrar"
>
    ×
</a>
        </div>


        <section class="term-heading">

            <span
                class="badge-nivel ${obtenerClaseNivelDetalle(
        nivel
    )}"
            >
                ${escaparHTMLDetalle(nivel)}
            </span>


            <h1>
                ${escaparHTMLDetalle(sigla)}
            </h1>


            ${ingles
            ? `
                        <p class="term-english">
                            ${escaparHTMLDetalle(ingles)}
                        </p>
                      `
            : ""
        }


            <span class="term-category-tag">
                SIGLAS Y ABREVIATURAS
            </span>

        </section>


        <div class="term-detail-layout">


            <div class="term-detail-main">

                <section class="term-card-detail">

                    <div class="term-definition-block">

                        <h2>
                            Traducción / Significado (Español)
                        </h2>

                        <p>
                            ${formatearTextoDetalle(
            traduccion
        )}
                        </p>

                    </div>


                    <div class="term-definition-block term-definition-english">

                        <h2>
                            Nombre original (Inglés/Término)
                        </h2>

                        <p>
                            ${formatearTextoDetalle(
            ingles
        )}
                        </p>

                    </div>

                </section>

            </div>


            <aside class="term-detail-sidebar">

                <section class="term-info-card">

                    <div class="term-info-header">
                        Información general
                    </div>


                    <div class="term-info-body">


                        <div class="term-info-item">

                            <span class="term-info-icon">
                                ☷
                            </span>

                            <div>

                                <strong>
                                    Categoría:
                                </strong>

                                <span>
                                    Siglas y Abreviaturas
                                </span>

                            </div>

                        </div>


                        <div class="term-info-item">

                            <span class="term-info-icon">
                                ◎
                            </span>

                            <div>

                                <strong>
                                    Idioma:
                                </strong>

                                <span>
                                    Español / Inglés
                                </span>

                            </div>

                        </div>


                    </div>

                </section>

            </aside>

        </div>

    `;

}


// ==========================================
// BUSCADOR DEL HEADER
// ==========================================


async function iniciarBuscadorTermino(datos) {


    const buscador =
        document.querySelector(
            "#headerSearch"
        );


    const formulario =
        document.querySelector(
            "#headerSearchForm"
        );


    const sugerencias =
        document.querySelector(
            "#headerSearchSuggestions"
        );


    const clearButton =
        document.querySelector(
            "#headerSearchClear"
        );


    if (
        !buscador ||
        !formulario ||
        !sugerencias
    ) {

        console.warn(
            "⚠️ No se encontró el buscador del header."
        );

        return;

    }


    // ==========================================
    // ESCRIBIR
    // ==========================================


    buscador.addEventListener(
        "input",
        () => {

            const texto =
                buscador.value.trim();


            // Mostrar / ocultar X

            if (clearButton) {

                if (texto) {

                    clearButton.classList.add(
                        "is-visible"
                    );

                } else {

                    clearButton.classList.remove(
                        "is-visible"
                    );

                }

            }


            // Si no hay texto,
            // ocultar sugerencias

            if (!texto) {

                ocultarSugerencias();

                return;

            }


            mostrarSugerencias(
                texto,
                datos
            );

        }
    );


    // ==========================================
    // BOTÓN X — LIMPIAR
    // ==========================================


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                buscador.value = "";

                clearButton.classList.remove(
                    "is-visible"
                );

                ocultarSugerencias();

                buscador.focus();

            }
        );

    }


    // ==========================================
    // ENTER
    // ==========================================


    formulario.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();


            const texto =
                buscador.value.trim();


            if (!texto) {

                buscador.focus();

                return;

            }


            const resultados =
                buscarTerminos(
                    texto,
                    datos
                );


            if (
                resultados.length > 0
            ) {

                abrirDetalle(
                    resultados[0].id
                );

            }

        }
    );


    // ==========================================
    // CERRAR AL HACER CLIC AFUERA
    // ==========================================


    document.addEventListener(
        "click",
        evento => {

            const contenedor =
                document.querySelector(
                    ".term-header-search"
                );


            if (
                contenedor &&
                !contenedor.contains(
                    evento.target
                )
            ) {

                ocultarSugerencias();

            }

        }
    );

}


// ==========================================
// BUSCAR
// ==========================================


function buscarTerminos(
    texto,
    datos
) {

    const consulta =
        normalizarTexto(texto);


    if (!consulta) {

        return [];

    }


    const resultados = datos
        .filter(item => {

            const termino =
                normalizarTexto(
                    item.termino
                );

            const ingles =
                normalizarTexto(
                    item.ingles
                );

            const sigla =
                normalizarTexto(
                    item.sigla ||
                    item["Sigla / Abreviatura"] ||
                    ""
                );


            return (
                termino.includes(consulta) ||
                ingles.includes(consulta) ||
                sigla.includes(consulta)
            );

        });


    resultados.sort(
        (a, b) => {

            const terminoA =
                normalizarTexto(
                    a.termino
                );

            const terminoB =
                normalizarTexto(
                    b.termino
                );

            const inglesA =
                normalizarTexto(
                    a.ingles
                );

            const inglesB =
                normalizarTexto(
                    b.ingles
                );

            const siglaA =
                normalizarTexto(
                    a.sigla ||
                    a["Sigla / Abreviatura"] ||
                    ""
                );

            const siglaB =
                normalizarTexto(
                    b.sigla ||
                    b["Sigla / Abreviatura"] ||
                    ""
                );


            // ==================================
            // PRIORIDAD DE COINCIDENCIA
            // ==================================

            const prioridadA =
                terminoA.startsWith(consulta)
                    ? 1
                    : siglaA.startsWith(consulta)
                        ? 2
                        : inglesA.startsWith(consulta)
                            ? 3
                            : terminoA.includes(consulta)
                                ? 4
                                : 5;


            const prioridadB =
                terminoB.startsWith(consulta)
                    ? 1
                    : siglaB.startsWith(consulta)
                        ? 2
                        : inglesB.startsWith(consulta)
                            ? 3
                            : terminoB.includes(consulta)
                                ? 4
                                : 5;


            if (
                prioridadA !== prioridadB
            ) {

                return (
                    prioridadA -
                    prioridadB
                );

            }


            // ==================================
            // ORDEN ALFABÉTICO
            // ==================================

            return terminoA.localeCompare(
                terminoB,
                "es",
                {
                    sensitivity: "base"
                }
            );

        }
    );


    return resultados.slice(
        0,
        8
    );

}


// ==========================================
// MOSTRAR RECOMENDACIONES
// ==========================================


function mostrarSugerencias(
    texto,
    datos
) {

    const contenedor =
        document.querySelector(
            "#headerSearchSuggestions"
        );


    if (!contenedor) {

        return;

    }


    const resultados =
        buscarTerminos(
            texto,
            datos
        );


    contenedor.innerHTML = "";


    if (
        resultados.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="search-no-results">
                No se encontraron términos.
            </div>

        `;


        contenedor.classList.add(
            "is-visible"
        );


        contenedor.setAttribute(
            "aria-hidden",
            "false"
        );


        return;

    }


    resultados.forEach(
        item => {

            const opcion =
                document.createElement(
                    "button"
                );


            opcion.type =
                "button";


            opcion.className =
                "search-suggestion";


            opcion.innerHTML = `

    <span class="search-suggestion__info">

        <span class="search-suggestion__term">

            ${escaparHTMLDetalle(
                item.termino ||
                item.sigla ||
                ""
            )}

        </span>

        ${item.ingles
                    ? `
                <span class="search-suggestion__english">

                    ${escaparHTMLDetalle(
                        item.ingles
                    )}

                </span>
            `
                    : ""
                }

    </span>

    ${item.nivel
                    ? `
                <span
                    class="search-suggestion__level ${obtenerClaseNivelDetalle(item.nivel)}"
                >
                    ${escaparHTMLDetalle(item.nivel)}
                </span>
            `
                    : ""
                }

`;


            opcion.addEventListener(
                "click",
                () => {

                    abrirDetalle(
                        item.id
                    );

                }
            );


            contenedor.appendChild(
                opcion
            );

        }
    );


    contenedor.classList.add(
        "is-visible"
    );


    contenedor.setAttribute(
        "aria-hidden",
        "false"
    );

}


// ==========================================
// OCULTAR SUGERENCIAS
// ==========================================


function ocultarSugerencias() {

    const contenedor =
        document.querySelector(
            "#headerSearchSuggestions"
        );


    if (!contenedor) {

        return;

    }


    contenedor.classList.remove(
        "is-visible"
    );


    contenedor.setAttribute(
        "aria-hidden",
        "true"
    );

}


// ==========================================
// NIVEL
// ==========================================


function obtenerClaseNivelDetalle(
    nivel
) {

    const nivelNormalizado =
        normalizarTexto(
            nivel
        );


    if (
        nivelNormalizado === "basico"
    ) {

        return "nivel-basico";

    }


    if (
        nivelNormalizado === "intermedio"
    ) {

        return "nivel-intermedio";

    }


    if (
        nivelNormalizado === "avanzado"
    ) {

        return "nivel-avanzado";

    }


    return "";

}


// ==========================================
// FORMATEAR TEXTO
// ==========================================


function formatearTextoDetalle(
    texto
) {

    if (!texto) {

        return `

            <span class="term-empty">
                Información no disponible.
            </span>

        `;

    }


    return escaparHTMLDetalle(
        texto
    ).replace(
        /\n/g,
        "<br>"
    );

}


// ==========================================
// MOSTRAR ERROR
// ==========================================


function mostrarErrorTermino(
    contenedor,
    mensaje
) {

    contenedor.innerHTML = `

        <div class="term-error">

            <h1>
                No se pudo cargar el término
            </h1>

            <p>
                ${escaparHTMLDetalle(mensaje)}
            </p>

            <a href="catalogo.html">
                Volver al catálogo
            </a>

        </div>

    `;

}


// ==========================================
// ESCAPAR HTML
// ==========================================


function escaparHTMLDetalle(
    valor
) {

    return String(valor || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// ESCAPAR ATRIBUTO
// ==========================================


function escaparAtributoDetalle(
    valor
) {

    return escaparHTMLDetalle(
        valor
    );

}