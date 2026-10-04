// ==========================================
// HOME - BUSCADOR PRINCIPAL
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const input = document.querySelector("#homeSearch");
    const form = document.querySelector("#homeSearchForm");
    const clearButton = document.querySelector("#homeSearchClear");
    const suggestions = document.querySelector("#homeSearchSuggestions");

    // Si no estamos en el Home, no hacemos nada
    if (!input || !form || !suggestions) {
        return;
    }


    // ==========================================
    // CARGAR DICCIONARIO
    // ==========================================

    const datos = await cargarDiccionario();

    if (!datos.length) {

        console.error("❌ No se pudieron cargar los términos.");

        return;
    }

    console.log("🏠 Home: diccionario cargado");
    console.log(`📚 Términos disponibles: ${datos.length}`);


    // ==========================================
// ESCRIBIR EN EL BUSCADOR
// ==========================================

let indiceSeleccionado = -1;

input.addEventListener("input", () => {

    const texto = input.value.trim();

    // Cada vez que cambia la búsqueda,
    // reiniciamos la selección del teclado.
    indiceSeleccionado = -1;

    actualizarBotonLimpiar(texto);

    // Si está vacío, ocultamos recomendaciones
    if (!texto) {

        ocultarRecomendaciones();

        return;
    }

    // Buscar recomendaciones
    mostrarRecomendaciones(datos, texto);

});


// ==========================================
// NAVEGACIÓN CON TECLADO
// ==========================================

input.addEventListener("keydown", (evento) => {

    const recomendaciones =
        Array.from(
            suggestions.querySelectorAll(
                ".home-search__suggestion"
            )
        );


    // ======================================
    // FLECHA ABAJO
    // ======================================

    if (evento.key === "ArrowDown") {

        if (!recomendaciones.length) {
            return;
        }

        evento.preventDefault();

        indiceSeleccionado++;

        if (
            indiceSeleccionado >=
            recomendaciones.length
        ) {

            indiceSeleccionado = 0;

        }

        actualizarSeleccionTeclado(
            recomendaciones
        );

        return;
    }


    // ======================================
    // FLECHA ARRIBA
    // ======================================

    if (evento.key === "ArrowUp") {

        if (!recomendaciones.length) {
            return;
        }

        evento.preventDefault();

        indiceSeleccionado--;

        if (indiceSeleccionado < 0) {

            indiceSeleccionado =
                recomendaciones.length - 1;

        }

        actualizarSeleccionTeclado(
            recomendaciones
        );

        return;
    }


    // ======================================
    // ENTER
    // ======================================

    if (evento.key === "Enter") {

        if (
            indiceSeleccionado >= 0 &&
            recomendaciones[indiceSeleccionado]
        ) {

            evento.preventDefault();

            recomendaciones[
                indiceSeleccionado
            ].click();

        }

        return;
    }


    // ======================================
    // ESC
    // ======================================

    if (evento.key === "Escape") {

        ocultarRecomendaciones();

        indiceSeleccionado = -1;

    }

});


// ==========================================
// ACTUALIZAR SELECCIÓN VISUAL
// ==========================================

function actualizarSeleccionTeclado(
    recomendaciones
) {

    recomendaciones.forEach(
        (elemento, indice) => {

            if (
                indice ===
                indiceSeleccionado
            ) {

                elemento.classList.add(
                    "is-keyboard-selected"
                );

                elemento.scrollIntoView({
                    block: "nearest"
                });

            } else {

                elemento.classList.remove(
                    "is-keyboard-selected"
                );

            }

        }
    );

}


    // ==========================================
    // BOTÓN LIMPIAR
    // ==========================================

    if (clearButton) {

        clearButton.addEventListener("click", () => {

            input.value = "";

            actualizarBotonLimpiar("");

            ocultarRecomendaciones();

            input.focus();

        });

    }


    // ==========================================
    // ENVIAR BÚSQUEDA
    // ==========================================

    form.addEventListener("submit", (evento) => {

        evento.preventDefault();

        const texto = input.value.trim();

        if (!texto) {

            input.focus();

            return;
        }

        // Ir al catálogo con la búsqueda
        const busqueda =
            encodeURIComponent(texto);

        window.location.href =
            `pages/catalogo.html?busqueda=${busqueda}`;

    });


    // ==========================================
    // CERRAR RECOMENDACIONES
    // AL HACER CLICK AFUERA
    // ==========================================

    document.addEventListener("click", (evento) => {

        const dentroDelBuscador =
            evento.target.closest(".home-search");

        if (!dentroDelBuscador) {

            ocultarRecomendaciones();

        }

    });


    // ==========================================
    // BOTÓN LIMPIAR
    // ==========================================

    function actualizarBotonLimpiar(texto) {

        if (!clearButton) {
            return;
        }

        if (texto) {

            clearButton.classList.add("is-visible");

        } else {

            clearButton.classList.remove("is-visible");

        }

    }


    // ==========================================
    // MOSTRAR RECOMENDACIONES
    // ==========================================

    function mostrarRecomendaciones(datos, texto) {

        const busqueda =
            normalizarTexto(texto);

        if (!busqueda) {

            ocultarRecomendaciones();

            return;
        }


        // ======================================
        // FILTRAR
        // ======================================

        let resultados = datos
            .map((item, indice) => {

                return {
                    item: item,
                    indice: indice
                };

            })
            .filter(registro => {

                const item = registro.item;

                const termino =
                    normalizarTexto(
                        item.termino || ""
                    );

                const ingles =
                    normalizarTexto(
                        item.ingles || ""
                    );

                const sigla =
                    normalizarTexto(
                        item.sigla ||
                        item["Sigla / Abreviatura"] ||
                        ""
                    );

                return (
                    termino.includes(busqueda) ||
                    ingles.includes(busqueda) ||
                    sigla.includes(busqueda)
                );

            });


        // ======================================
        // ORDENAR
        // ======================================

        resultados.sort((a, b) => {

            const terminoA =
                normalizarTexto(
                    a.item.termino || ""
                );

            const terminoB =
                normalizarTexto(
                    b.item.termino || ""
                );

            const empiezaA =
                terminoA.startsWith(busqueda);

            const empiezaB =
                terminoB.startsWith(busqueda);


            // Primero los que comienzan
            // exactamente con lo escrito

            if (empiezaA && !empiezaB) {
                return -1;
            }

            if (!empiezaA && empiezaB) {
                return 1;
            }


            // Después orden alfabético

            return terminoA.localeCompare(
                terminoB,
                "es",
                {
                    sensitivity: "base"
                }
            );

        });


        // ======================================
        // LIMITAR RESULTADOS
        // ======================================

        resultados =
            resultados.slice(0, 6);


        // ======================================
        // SI NO HAY RESULTADOS
        // ======================================

        if (!resultados.length) {

            suggestions.innerHTML = `

                <div class="home-search__no-results">

                    No se encontraron términos.

                </div>

            `;

            suggestions.hidden = false;

            return;
        }


        // ======================================
        // LIMPIAR RECOMENDACIONES ANTERIORES
        // ======================================

        suggestions.innerHTML = "";


        // ======================================
        // CREAR RECOMENDACIONES
        // ======================================

        resultados.forEach(registro => {

            const item =
                registro.item;

            const indice =
                registro.indice;


            const recomendacion =
                document.createElement("button");


            recomendacion.type = "button";

            recomendacion.className =
                "home-search__suggestion";


            // ==================================
            // TÉRMINO
            // ==================================

            const termino =
                item.termino ||
                item.sigla ||
                "Sin término";


            // ==================================
            // INGLÉS
            // ==================================

            const ingles =
                item.ingles ||
                item.traduccionIngles ||
                "";


            // ==================================
            // NIVEL
            // ==================================

            const nivel =
                item.nivel ||
                "Sin nivel";


            // ==================================
            // CLASE DEL NIVEL
            // ==================================

            const claseNivel =
                obtenerClaseNivel(nivel);


            // ==================================
            // HTML DE LA RECOMENDACIÓN
            // ==================================

            recomendacion.innerHTML = `

                <span class="home-search__suggestion-info">

                    <strong class="home-search__suggestion-term">

                        ${escaparHTML(termino)}

                    </strong>


                    ${
                        ingles
                            ? `

                                <span class="home-search__suggestion-english">

                                    ${escaparHTML(ingles)}

                                </span>

                              `
                            : ""
                    }

                </span>


                <span class="home-search__suggestion-level ${claseNivel}">

                    ${escaparHTML(nivel)}

                </span>

            `;


            // ==================================
            // CLICK EN RECOMENDACIÓN
            // ==================================

            recomendacion.addEventListener(
                "click",
                () => {

                    /*
                     * En lugar de depender únicamente
                     * del ID, enviamos la posición exacta
                     * del registro dentro del JSON.
                     */

                    window.location.href =
                        `pages/termino.html?registro=${indice}`;

                }
            );


            suggestions.appendChild(
                recomendacion
            );

        });


        // Mostrar recomendaciones

        suggestions.hidden = false;

    }


    // ==========================================
    // OCULTAR RECOMENDACIONES
    // ==========================================

    function ocultarRecomendaciones() {

        suggestions.hidden = true;

        suggestions.innerHTML = "";

    }


    // ==========================================
    // CLASE DEL NIVEL
    // ==========================================

    function obtenerClaseNivel(nivel) {

        const nivelNormalizado =
            normalizarTexto(nivel);


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
    // ESCAPAR HTML
    // ==========================================

    function escaparHTML(texto) {

        return String(texto || "")

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