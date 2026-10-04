// ==========================================
// BUSCADOR DE TÉRMINOS — NOTICIAS
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // ELEMENTOS DEL BUSCADOR
    // ==========================================

    const buscador = document.querySelector("#newsSearch");

    const clearButton =
        document.querySelector("#newsSearchClear");

    const formulario =
        document.querySelector("#newsSearchForm");

    const sugerencias =
        document.querySelector("#newsSearchSuggestions");


    if (
        !buscador ||
        !formulario ||
        !sugerencias
    ) {

        console.warn(
            "⚠️ No se encontró el buscador de Noticias."
        );

        return;
    }


    // ==========================================
    // CARGAR DICCIONARIO
    // ==========================================

    const datos =
        await cargarDiccionario();


    if (
        !datos ||
        datos.length === 0
    ) {

        console.error(
            "❌ No se pudo cargar el diccionario."
        );

        return;
    }


    console.log(
        "📰 Buscador de términos en Noticias activo."
    );


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
            // ocultar recomendaciones

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
                buscarTerminosNoticias(
                    texto,
                    datos
                );


            if (
                resultados.length > 0
            ) {

                const indice =
                    resultados[0].indice;


                window.location.href =
                    `termino.html?registro=${indice}`;

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
                    ".news-header-search"
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


    // ==========================================
    // BUSCAR TÉRMINOS
    // ==========================================

    function buscarTerminosNoticias(
        texto,
        datos
    ) {

        const consulta =
            normalizarTextoNoticias(
                texto
            );


        if (!consulta) {

            return [];
        }


        return datos

            .map(
                (
                    item,
                    indice
                ) => ({

                    item: item,

                    indice: indice

                })
            )

            .filter(
                registro => {

                    const item =
                        registro.item;


                    const termino =
                        normalizarTextoNoticias(
                            item.termino || ""
                        );


                    const ingles =
                        normalizarTextoNoticias(
                            item.ingles || ""
                        );


                    const sigla =
                        normalizarTextoNoticias(
                            item.sigla ||
                            item["Sigla / Abreviatura"] ||
                            ""
                        );


                    return (

                        termino.includes(
                            consulta
                        ) ||

                        ingles.includes(
                            consulta
                        ) ||

                        sigla.includes(
                            consulta
                        )

                    );

                }
            )

            .sort(
                (
                    a,
                    b
                ) => {

                    const terminoA =
                        normalizarTextoNoticias(
                            a.item.termino || ""
                        );


                    const terminoB =
                        normalizarTextoNoticias(
                            b.item.termino || ""
                        );


                    const empiezaA =
                        terminoA.startsWith(
                            consulta
                        );


                    const empiezaB =
                        terminoB.startsWith(
                            consulta
                        );


                    if (
                        empiezaA &&
                        !empiezaB
                    ) {

                        return -1;
                    }


                    if (
                        !empiezaA &&
                        empiezaB
                    ) {

                        return 1;
                    }


                    return terminoA.localeCompare(
                        terminoB,
                        "es",
                        {
                            sensitivity: "base"
                        }
                    );

                }
            )

            .slice(
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

        const resultados =
            buscarTerminosNoticias(
                texto,
                datos
            );


        sugerencias.innerHTML =
            "";


        if (
            resultados.length === 0
        ) {

            sugerencias.innerHTML = `

                <div class="news-search-no-results">

                    No se encontraron términos.

                </div>

            `;


            sugerencias.classList.add(
                "is-visible"
            );


            sugerencias.setAttribute(
                "aria-hidden",
                "false"
            );


            return;
        }


        resultados.forEach(
            registro => {

                const item =
                    registro.item;


                const indice =
                    registro.indice;


                const opcion =
                    document.createElement(
                        "button"
                    );


                opcion.type =
                    "button";


                opcion.className =
                    "news-search-suggestion";


                opcion.innerHTML = `

                    <span
                        class="news-search-suggestion__term"
                    >

                        ${escaparHTMLNoticias(
                            item.termino ||
                            item.sigla ||
                            "Sin término"
                        )}

                    </span>

                    ${
                        item.ingles
                            ? `

                                <span
                                    class="news-search-suggestion__english"
                                >

                                    ${escaparHTMLNoticias(
                                        item.ingles
                                    )}

                                </span>

                              `
                            : ""
                    }

                `;


                opcion.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            `termino.html?registro=${indice}`;

                    }
                );


                sugerencias.appendChild(
                    opcion
                );

            }
        );


        sugerencias.classList.add(
            "is-visible"
        );


        sugerencias.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    // ==========================================
    // OCULTAR RECOMENDACIONES
    // ==========================================

    function ocultarSugerencias() {

        sugerencias.classList.remove(
            "is-visible"
        );


        sugerencias.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    // ==========================================
    // NORMALIZAR TEXTO
    // ==========================================

    function normalizarTextoNoticias(
        texto
    ) {

        return String(
            texto || ""
        )

            .toLowerCase()

            .normalize(
                "NFD"
            )

            .replace(
                /[\u0300-\u036f]/g,
                ""
            )

            .trim();

    }


    // ==========================================
    // ESCAPAR HTML
    // ==========================================

    function escaparHTMLNoticias(
        texto
    ) {

        return String(
            texto || ""
        )

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

});