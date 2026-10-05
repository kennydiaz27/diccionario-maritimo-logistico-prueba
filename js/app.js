// ==========================================
// DICCIONARIO - APP PRINCIPAL
// ==========================================


// ==========================================
// CONFIGURACIÓN
// ==========================================

const TERMINOS_POR_PAGINA = 9;

let paginaActual = 1;

let datosFiltradosActuales = [];


// Compatibilidad con filters.js
// ------------------------------------------
// filters.js utiliza esta variable para
// procesar la búsqueda.
var textoBusqueda = "";


// ==========================================
// INICIAR APLICACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const datos = await cargarDiccionario();

    console.log("📚 Registros cargados:", datos.length);

    window.diccionario = datos;

    // ==========================================
    // LEER NIVEL DESDE LA URL
    // ==========================================

    const parametrosURL =
        new URLSearchParams(
            window.location.search
        );

    const nivelURL =
    parametrosURL.get("nivel");

const origenURL =
    parametrosURL.get("origen");


// ==========================================
// SI VENIMOS DESDE INICIO
// ==========================================

if (origenURL === "inicio") {

    // No debemos recuperar el estado anterior
    // del catálogo.

    sessionStorage.removeItem(
        "catalogoEstado"
    );

    sessionStorage.setItem(
        "restaurarCatalogo",
        "false"
    );

    sessionStorage.removeItem(
        "paginaAnteriorTermino"
    );


    // ==========================================
    // APLICAR NIVEL SELECCIONADO DESDE INICIO
    // ==========================================

    if (nivelURL) {

        filtros.nivel =
            nivelURL;

    } else {

        filtros.nivel =
            "all";
    }


    // ==========================================
    // LIMPIAR LOS DEMÁS FILTROS
    // ==========================================

    filtros.categoria =
        "all";

    filtros.subcategoria =
        "all";

    filtros.letra =
        "all";

    filtros.busqueda =
        "";

}


// ==========================================
// SI VENIMOS DEL CATÁLOGO
// ==========================================

else {

    restaurarEstadoCatalogo();

}
    // ==========================================
    // RESTAURAR ESTADO DEL CATÁLOGO
    // ==========================================

    function restaurarEstadoCatalogo() {

        const estadoGuardado =
            sessionStorage.getItem("catalogoEstado");


        if (!estadoGuardado) {

            console.log(
                "ℹ️ No existe un estado anterior del catálogo."
            );

            return;
        }


        try {

            const estado =
                JSON.parse(estadoGuardado);


            // ==========================================
            // RESTAURAR FILTROS
            // ==========================================

            if (estado.filtros) {

                filtros.categoria =
                    estado.filtros.categoria || "all";

                filtros.nivel =
                    estado.filtros.nivel || "all";

                filtros.subcategoria =
                    estado.filtros.subcategoria || "all";

                filtros.letra =
                    estado.filtros.letra || "all";

                filtros.busqueda =
                    estado.filtros.busqueda || "";
            }


            // ==========================================
            // RESTAURAR PÁGINA
            // ==========================================

            paginaActual =
                Number(estado.paginaActual) || 1;


            console.log(
                "🔄 Estado del catálogo restaurado:",
                estado
            );


        } catch (error) {

            console.error(
                "❌ Error restaurando estado del catálogo:",
                error
            );

            sessionStorage.removeItem(
                "catalogoEstado"
            );
        }
    }
    inicializarEventos();
    inicializarMenuSubcategorias();

    restaurarInterfazFiltros();

    mostrarResultados();

});


// ==========================================
// RESTAURAR INTERFAZ DE FILTROS
// ==========================================

function restaurarInterfazFiltros() {

    // ==========================================
    // BÚSQUEDA
    // ==========================================

    const buscador =
        document.querySelector("#catalogSearch");

    if (buscador) {

        buscador.value =
            filtros.busqueda || "";
    }


    // Actualizar visualmente la X de búsqueda
    const botonLimpiarBusqueda =
        document.querySelector("#catalogSearchClear");

    if (botonLimpiarBusqueda) {

        if (
            filtros.busqueda &&
            filtros.busqueda.trim() !== ""
        ) {

            botonLimpiarBusqueda.classList.add(
                "is-visible"
            );

        } else {

            botonLimpiarBusqueda.classList.remove(
                "is-visible"
            );
        }
    }

    // ==========================================
    // CATEGORÍA PRINCIPAL
    // ==========================================

    const botonesCategoria =
        document.querySelectorAll(
            ".category-button"
        );

    botonesCategoria.forEach(boton => {

        boton.classList.remove("active");

        if (
            boton.dataset.category ===
            filtros.categoria
        ) {
            boton.classList.add("active");
        }

    });


    // ==========================================
    // NIVEL
    // ==========================================

    const levelSelected =
        document.querySelector("#levelSelected");

    const levelOptions =
        document.querySelectorAll(
            ".level-option"
        );

    levelOptions.forEach(opcion => {

        opcion.classList.remove("active");

        if (
            opcion.dataset.level ===
            filtros.nivel
        ) {

            opcion.classList.add("active");

            if (levelSelected) {

                levelSelected.textContent =
                    opcion.textContent.trim();
            }
        }

    });


    // ==========================================
    // LETRA
    // ==========================================

    const botonesLetra =
        document.querySelectorAll(
            ".letter-button"
        );

    botonesLetra.forEach(boton => {

        boton.classList.remove("active");

        if (
            boton.dataset.letter ===
            filtros.letra
        ) {

            boton.classList.add("active");
        }

    });


    // ==========================================
    // SUBCATEGORÍAS
    // ==========================================

    actualizarMenuSubcategorias();


    // ==========================================
    // VOLVER A SELECCIONAR SUBCATEGORÍA
    // ==========================================

    if (
        filtros.subcategoria !== "all"
    ) {

        const textoSeleccionado =
            document.querySelector(
                "#subcategorySelected"
            );

        if (textoSeleccionado) {

            textoSeleccionado.textContent =
                filtros.subcategoria;
        }

        const opcionSubcategoria =
            document.querySelector(
                `.subcategory-option[data-subcategory="${CSS.escape(
                    filtros.subcategoria
                )}"]`
            );

        if (opcionSubcategoria) {

            document
                .querySelectorAll(
                    ".subcategory-option"
                )
                .forEach(opcion => {

                    opcion.classList.remove(
                        "active"
                    );

                });

            opcionSubcategoria.classList.add(
                "active"
            );
        }
    }
}


// ==========================================
// EVENTOS PRINCIPALES
// ==========================================

function inicializarEventos() {


    // ==========================================
    // BÚSQUEDA DEL CATÁLOGO
    // ==========================================

    const buscador =
        document.querySelector("#catalogSearch");

    const botonLimpiarBusqueda =
        document.querySelector("#catalogSearchClear");


    // ==========================================
    // ACTUALIZAR VISIBILIDAD DE LA X
    // ==========================================

    function actualizarBotonLimpiarBusqueda() {

        if (!botonLimpiarBusqueda) {
            return;
        }

        const tieneTexto =
            buscador &&
            buscador.value.trim() !== "";

        if (tieneTexto) {

            botonLimpiarBusqueda.classList.add(
                "is-visible"
            );

        } else {

            botonLimpiarBusqueda.classList.remove(
                "is-visible"
            );

        }
    }


    // ==========================================
    // ESCRIBIR EN EL BUSCADOR
    // ==========================================

    if (buscador) {

        buscador.addEventListener(
            "input",
            () => {

                filtros.busqueda =
                    buscador.value;

                textoBusqueda =
                    normalizarTexto(
                        filtros.busqueda
                    );

                paginaActual = 1;


                // Actualizar X
                actualizarBotonLimpiarBusqueda();


                // IMPORTANTE:
                // La búsqueda se aplica junto con
                // categoría, nivel, subcategoría
                // y letra.
                mostrarResultados();

            }
        );

    }


    // ==========================================
    // FORMULARIO DE BÚSQUEDA
    // ==========================================

    const formulario =
        document.querySelector(
            "#catalogSearchForm"
        );


    if (formulario) {

        formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();


                filtros.busqueda =
                    buscador
                        ? buscador.value
                        : "";


                textoBusqueda =
                    normalizarTexto(
                        filtros.busqueda
                    );


                paginaActual = 1;

                mostrarResultados();

                desplazarAlInicioResultados();

            }
        );

    }
    // ==========================================
    // LIMPIAR BÚSQUEDA
    // ==========================================

    if (botonLimpiarBusqueda) {

        botonLimpiarBusqueda.addEventListener(
            "click",
            () => {

                buscador.value = "";

                filtros.busqueda = "";

                textoBusqueda = "";

                paginaActual = 1;

                actualizarBotonLimpiarBusqueda();

                mostrarResultados();

                buscador.focus();

            }
        );

    }

    // ==========================================
    // CATEGORÍAS PRINCIPALES
    // ==========================================

    const botonesCategoria =
        document.querySelectorAll(
            ".category-button"
        );


    botonesCategoria.forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                const categoria =
                    boton.dataset.category;


                filtros.categoria =
                    categoria;


                // Al cambiar de categoría,
                // reiniciamos la subcategoría.

                filtros.subcategoria =
                    "all";


                paginaActual = 1;


                // Activar botón visualmente

                botonesCategoria.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                boton.classList.add(
                    "active"
                );


                // Actualizar menú

                actualizarMenuSubcategorias();


                mostrarResultados();

            }
        );

    });


    // ==========================================
    // NIVEL DE DIFICULTAD
    // ==========================================

    const levelMenu =
        document.querySelector(
            "#levelMenu"
        );

    const levelTrigger =
        document.querySelector(
            "#levelTrigger"
        );

    const levelSelected =
        document.querySelector(
            "#levelSelected"
        );

    const levelOptions =
        document.querySelectorAll(
            ".level-option"
        );


    if (
        levelMenu &&
        levelTrigger
    ) {

        // ======================================
        // ABRIR / CERRAR
        // ======================================

        // 🖱️ Abrir al pasar el mouse
        levelMenu.addEventListener(
            "mouseenter",
            () => {

                // Solo ejecutar en dispositivos con mouse
                if (
                    !window.matchMedia(
                        "(hover: hover) and (pointer: fine)"
                    ).matches
                ) {
                    return;
                }

                const subcategoryMenu =
                    document.querySelector(
                        "#subcategoryMenu"
                    );

                // Cerrar Subcategoría
                if (subcategoryMenu) {
                    subcategoryMenu.classList.remove(
                        "open"
                    );
                }

                // Abrir Nivel
                levelMenu.classList.add(
                    "open"
                );

            }
        );


        // 🖱️ Cerrar al sacar el mouse
        levelMenu.addEventListener(
            "mouseleave",
            () => {

                // Solo ejecutar en dispositivos con mouse
                if (
                    !window.matchMedia(
                        "(hover: hover) and (pointer: fine)"
                    ).matches
                ) {
                    return;
                }

                levelMenu.classList.remove(
                    "open"
                );

            }
        );


        // 👆 Abrir / cerrar al hacer clic o tocar
        levelTrigger.addEventListener(
            "click",
            (evento) => {

                evento.stopPropagation();

                const estaAbierto =
                    levelMenu.classList.contains("open");

                const subcategoryMenu =
                    document.querySelector(
                        "#subcategoryMenu"
                    );

                // Cerrar subcategorías
                if (subcategoryMenu) {
                    subcategoryMenu.classList.remove(
                        "open"
                    );
                }

                // Alternar nivel
                if (estaAbierto) {

                    levelMenu.classList.remove(
                        "open"
                    );

                } else {

                    levelMenu.classList.add(
                        "open"
                    );

                }

            }
        );

        // ======================================
        // SELECCIONAR NIVEL
        // ======================================

        levelOptions.forEach(
            opcion => {

                opcion.addEventListener(
                    "click",
                    (evento) => {

                        evento.stopPropagation();


                        const nivelSeleccionado =
                            opcion.dataset.level;


                        // Guardar filtro

                        filtros.nivel =
                            nivelSeleccionado;


                        // Cambiar texto

                        if (levelSelected) {

                            levelSelected.textContent =
                                opcion.textContent.trim();

                        }


                        // Cambiar estado activo

                        levelOptions.forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        opcion.classList.add(
                            "active"
                        );


                        // Cerrar menú

                        levelMenu.classList.remove(
                            "open"
                        );


                        // Reiniciar página

                        paginaActual = 1;


                        // Actualizar resultados

                        mostrarResultados();

                    }
                );

            }
        );


        // ======================================
        // CERRAR AL HACER CLIC AFUERA
        // ======================================

        document.addEventListener(
            "click",
            (evento) => {

                if (
                    !levelMenu.contains(
                        evento.target
                    )
                ) {

                    levelMenu.classList.remove(
                        "open"
                    );

                }

            }
        );

    }


    // ==========================================
    // LETRAS A-Z
    // ==========================================

    const botonesLetra =
        document.querySelectorAll(
            ".letter-button"
        );


    botonesLetra.forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                const letra =
                    boton.dataset.letter;


                filtros.letra =
                    letra;


                paginaActual = 1;


                botonesLetra.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                boton.classList.add(
                    "active"
                );


                mostrarResultados();

            }
        );

    });

}


// ==========================================
// MENÚ JERÁRQUICO DE SUBCATEGORÍAS
// ==========================================

function inicializarMenuSubcategorias() {

    const menu =
        document.querySelector(
            "#subcategoryMenu"
        );


    const trigger =
        document.querySelector(
            "#subcategoryTrigger"
        );


    if (!menu || !trigger) {
        return;
    }



    // ==========================================
    // ABRIR / CERRAR SUBCATEGORÍA
    // ==========================================

    const subcategoryWrapper =
        document.querySelector("#subcategoryMenu");

    if (subcategoryWrapper) {

        // 🖱️ Abrir / cerrar con mouse solamente en dispositivos con mouse
        if (
            window.matchMedia(
                "(hover: hover) and (pointer: fine)"
            ).matches
        ) {

            // Abrir al pasar el mouse
            subcategoryWrapper.addEventListener(
                "mouseenter",
                () => {

                    const levelMenu =
                        document.querySelector(
                            "#levelMenu"
                        );

                    if (levelMenu) {
                        levelMenu.classList.remove(
                            "open"
                        );
                    }

                    subcategoryWrapper.classList.add(
                        "open"
                    );

                }
            );

            // 🖱️ Abrir al pasar el mouse
            subcategoryWrapper.addEventListener(
                "mouseenter",
                () => {

                    // Solo ejecutar en dispositivos con mouse
                    if (
                        !window.matchMedia(
                            "(hover: hover) and (pointer: fine)"
                        ).matches
                    ) {
                        return;
                    }

                    const levelMenu =
                        document.querySelector(
                            "#levelMenu"
                        );

                    // Cerrar Nivel
                    if (levelMenu) {
                        levelMenu.classList.remove(
                            "open"
                        );
                    }

                    // Abrir Subcategoría
                    subcategoryWrapper.classList.add(
                        "open"
                    );

                }
            );


            // 🖱️ Cerrar al sacar el mouse
            subcategoryWrapper.addEventListener(
                "mouseleave",
                () => {

                    // Solo ejecutar en dispositivos con mouse
                    if (
                        !window.matchMedia(
                            "(hover: hover) and (pointer: fine)"
                        ).matches
                    ) {
                        return;
                    }

                    subcategoryWrapper.classList.remove(
                        "open"
                    );

                }
            );

        }


        // 👆 Abrir / cerrar al tocar
        trigger.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();
                evento.stopPropagation();

                const estaAbierto =
                    subcategoryWrapper.classList.contains("open");


                // Cerrar Nivel de dificultad
                const levelMenu =
                    document.querySelector("#levelMenu");

                if (levelMenu) {
                    levelMenu.classList.remove("open");
                }


                // Abrir / cerrar Subcategoría
                if (estaAbierto) {

                    subcategoryWrapper.classList.remove(
                        "open"
                    );

                } else {

                    subcategoryWrapper.classList.add(
                        "open"
                    );

                }

            }
        );
    }


    // ==========================================
    // CATEGORÍAS DEL MENÚ
    // ==========================================

    const botones =
        document.querySelectorAll(
            ".subcategory-category"
        );


    botones.forEach(boton => {

        boton.addEventListener(
            "click",
            (evento) => {

                evento.stopPropagation();

                const categoria =
                    boton.dataset.category;


                // ======================================
                // ACTUALIZAR CATEGORÍA ACTUAL
                // ======================================

                filtros.categoria =
                    categoria;


                // Reiniciar subcategoría

                filtros.subcategoria =
                    "all";


                paginaActual = 1;


                // ======================================
                // CAMBIAR A MODO CATEGORÍA ÚNICA
                // ======================================

                const dropdown =
                    document.querySelector(
                        "#subcategoryDropdown"
                    );


                if (dropdown) {

                    dropdown.classList.add(
                        "single-category"
                    );

                }


                // ======================================
                // ACTIVAR CATEGORÍA
                // ======================================

                botones.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                boton.classList.add(
                    "active"
                );


                // ======================================
                // MOSTRAR SOLO SUS SUBCATEGORÍAS
                // ======================================

                mostrarSubcategoriasDeCategoria(
                    categoria
                );

            }
        );

    });

    // ==========================================
    // ESTADO INICIAL
    // ==========================================

    actualizarMenuSubcategorias();


    // ==========================================
    // CERRAR AL HACER CLIC AFUERA
    // ==========================================

    document.addEventListener(
        "click",
        (evento) => {

            if (
                !menu.contains(
                    evento.target
                )
            ) {

                menu.classList.remove(
                    "open"
                );

            }

        }
    );

}


// ==========================================
// ACTUALIZAR MENÚ SEGÚN CATEGORÍA
// ==========================================

function actualizarMenuSubcategorias() {

    const dropdown =
        document.querySelector(
            "#subcategoryDropdown"
        );

    const opciones =
        document.querySelector(
            "#subcategoryOptions"
        );

    const botones =
        document.querySelectorAll(
            ".subcategory-category"
        );

    const textoSeleccionado =
        document.querySelector(
            "#subcategorySelected"
        );


    if (
        !dropdown ||
        !opciones
    ) {
        return;
    }


    // ==========================================
    // RESTABLECER VISUALMENTE
    // ==========================================

    // Solo mostramos "Todas las subcategorías"
    // cuando realmente no hay una selección guardada.

    if (filtros.subcategoria === "all") {

        if (textoSeleccionado) {

            textoSeleccionado.textContent =
                "Todas las subcategorías";
        }
    }

    // ==========================================
    // TODOS
    // ==========================================

    if (
        filtros.categoria === "all"
    ) {

        // En "Todos" NO mostramos
        // el panel de las tres categorías.
        // Mostramos directamente todas
        // las subcategorías.

        dropdown.classList.add(
            "single-category"
        );

        // Ninguna categoría queda activa

        botones.forEach(boton => {

            boton.classList.remove(
                "active"
            );

        });

        // Mostrar TODAS las subcategorías
        // de las tres categorías principales.
        // Las categorías de Siglas y Abreviaturas
        // también aparecen aquí como subcategorías.

        mostrarTodasLasSubcategorias();

        return;
    }


    // ==========================================
    // CATEGORÍA ESPECÍFICA
    // ==========================================

    dropdown.classList.add(
        "single-category"
    );


    // Quitar estado activo

    botones.forEach(boton => {

        boton.classList.remove(
            "active"
        );

    });


    // Activar categoría actual

    const botonActivo =
        document.querySelector(
            `.subcategory-category[data-category="${filtros.categoria}"]`
        );


    if (botonActivo) {

        botonActivo.classList.add(
            "active"
        );

    }


    // Mostrar solamente sus subcategorías

    mostrarSubcategoriasDeCategoria(
        filtros.categoria
    );

}
// ==========================================
// MOSTRAR TODAS LAS SUBCATEGORÍAS
// ==========================================

function mostrarTodasLasSubcategorias() {

    const contenedor =
        document.querySelector(
            "#subcategoryOptions"
        );


    if (!contenedor) {
        return;
    }


    const datos =
        window.diccionario || [];


    // ==========================================
    // OBTENER TODAS LAS SUBCATEGORÍAS
    // ==========================================

    const subcategorias = [];


    datos.forEach(item => {

        const categoria =
            obtenerCategoriaPrincipal(item);


        const subcategoria =
            obtenerSubcategoriaFiltro(item);


        if (
            categoria &&
            subcategoria &&
            subcategoria.trim() !== ""
        ) {

            subcategorias.push(
                subcategoria.trim()
            );

        }

    });


    // ==========================================
    // ELIMINAR DUPLICADOS
    // ==========================================

    const subcategoriasUnicas =
        [
            ...new Map(

                subcategorias.map(
                    subcategoria => [

                        normalizarTexto(
                            subcategoria
                        ),

                        subcategoria

                    ]
                )

            ).values()
        ];


    // ==========================================
    // ORDEN ALFABÉTICO
    // ==========================================

    subcategoriasUnicas.sort(
        (a, b) => {

            return a.localeCompare(
                b,
                "es",
                {
                    sensitivity: "base"
                }
            );

        }
    );


    // ==========================================
    // CREAR HTML
    // ==========================================

    let html = `

        <button
            type="button"
            class="subcategory-option active"
            data-subcategory="all"
        >
            Todas las subcategorías
        </button>

    `;


    subcategoriasUnicas.forEach(
        subcategoria => {

            html += `

                <button
                    type="button"
                    class="subcategory-option"
                    data-subcategory="${escaparHTML(
                subcategoria
            )}"
                >
                    ${escaparHTML(
                subcategoria
            )}
                </button>

            `;

        }
    );


    contenedor.innerHTML =
        html;


    // ==========================================
    // EVENTOS
    // ==========================================

    const opciones =
        contenedor.querySelectorAll(
            ".subcategory-option"
        );


    opciones.forEach(opcion => {

        opcion.addEventListener(
            "click",
            () => {

                const subcategoria =
                    opcion.dataset.subcategory;


                filtros.subcategoria =
                    subcategoria;


                paginaActual = 1;


                const textoSeleccionado =
                    document.querySelector(
                        "#subcategorySelected"
                    );


                if (textoSeleccionado) {

                    textoSeleccionado.textContent =
                        subcategoria === "all"
                            ? "Todas las subcategorías"
                            : subcategoria;

                }


                opciones.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                opcion.classList.add(
                    "active"
                );


                const menu =
                    document.querySelector(
                        "#subcategoryMenu"
                    );


                if (menu) {

                    menu.classList.remove(
                        "open"
                    );

                }


                mostrarResultados();

            }
        );

    });

}

// ==========================================
// MOSTRAR SUBCATEGORÍAS
// ==========================================

function mostrarSubcategoriasDeCategoria(
    categoria
) {

    const contenedor =
        document.querySelector(
            "#subcategoryOptions"
        );


    if (!contenedor) {
        return;
    }


    // ==========================================
    // OBTENER DICCIONARIO
    // ==========================================

    const datos =
        window.diccionario || [];


    // ==========================================
    // FILTRAR SOLAMENTE LA CATEGORÍA
    // SELECCIONADA
    // ==========================================

    const datosCategoria =
        datos.filter(item => {

            const categoriaPrincipal =
                obtenerCategoriaPrincipal(item);


            return normalizarTexto(
                categoriaPrincipal
            ) ===
                normalizarTexto(
                    categoria
                );

        });


    // ==========================================
    // OBTENER SUBCATEGORÍAS
    // ==========================================

    const subcategorias =
        datosCategoria
            .map(item => {

                return obtenerSubcategoriaFiltro(
                    item
                );

            })
            .filter(subcategoria => {

                return (
                    subcategoria &&
                    subcategoria.trim() !== ""
                );

            });


    // ==========================================
    // ELIMINAR DUPLICADOS
    // ==========================================

    const subcategoriasUnicas =
        [
            ...new Map(

                subcategorias.map(
                    subcategoria => {

                        return [
                            normalizarTexto(
                                subcategoria
                            ),
                            subcategoria
                        ];

                    }
                )

            ).values()
        ];


    // ==========================================
    // ORDEN ALFABÉTICO
    // ==========================================

    subcategoriasUnicas.sort(
        (a, b) => {

            return a.localeCompare(
                b,
                "es",
                {
                    sensitivity: "base"
                }
            );

        }
    );


    // ==========================================
    // SI NO HAY SUBCATEGORÍAS
    // ==========================================

    if (
        subcategoriasUnicas.length === 0
    ) {

        contenedor.innerHTML = `
            <div class="subcategory-placeholder">
                No hay subcategorías disponibles.
            </div>
        `;


        return;

    }


    // ==========================================
    // OPCIÓN "TODAS"
    // ==========================================

    let html = `

        <button
            type="button"
            class="subcategory-option"
            data-subcategory="all"
        >
            Todas las subcategorías
        </button>

    `;


    // ==========================================
    // CREAR SUBCATEGORÍAS
    // ==========================================

    subcategoriasUnicas.forEach(
        subcategoria => {

            html += `

                <button
                    type="button"
                    class="subcategory-option"
                    data-subcategory="${escaparHTML(
                subcategoria
            )}"
                >
                    ${escaparHTML(
                subcategoria
            )}
                </button>

            `;

        }
    );


    // ==========================================
    // MOSTRAR RESULTADO
    // ==========================================

    contenedor.innerHTML =
        html;


    // ==========================================
    // EVENTOS DE LAS SUBCATEGORÍAS
    // ==========================================

    const opciones =
        contenedor.querySelectorAll(
            ".subcategory-option"
        );


    opciones.forEach(opcion => {

        opcion.addEventListener(
            "click",
            () => {

                const subcategoria =
                    opcion.dataset
                        .subcategory;


                // Guardar filtro

                filtros.subcategoria =
                    subcategoria;


                // Reiniciar página

                paginaActual = 1;


                // ==================================
                // ACTUALIZAR TEXTO DEL SELECTOR
                // ==================================

                const textoSeleccionado =
                    document.querySelector(
                        "#subcategorySelected"
                    );


                if (
                    textoSeleccionado
                ) {

                    if (
                        subcategoria ===
                        "all"
                    ) {

                        textoSeleccionado
                            .textContent =
                            "Todas las subcategorías";

                    } else {

                        textoSeleccionado
                            .textContent =
                            subcategoria;

                    }

                }


                // ==================================
                // CERRAR MENÚ
                // ==================================

                const menu =
                    document.querySelector(
                        "#subcategoryMenu"
                    );


                if (menu) {

                    menu.classList.remove(
                        "open"
                    );

                }


                // ==================================
                // ACTUALIZAR RESULTADOS
                // ==================================

                mostrarResultados();

            }
        );

    });

}


// ==========================================
// MOSTRAR RESULTADOS
// ==========================================

function mostrarResultados() {

    const datos =
        window.diccionario || [];


    // ==========================================
    // ACTUALIZAR VARIABLE DE BÚSQUEDA
    // ==========================================

    textoBusqueda =
        normalizarTexto(
            filtros.busqueda
        );


    // ==========================================
    // APLICAR FILTROS
    // ==========================================

    let resultados =
        aplicarFiltros(datos)
            .filter(item => {
                const termino = String(
                    item.termino || ""
                ).trim();

                const sigla = String(
                    item.sigla ||
                    item["Sigla / Abreviatura"] ||
                    ""
                ).trim();

                return termino !== "" || sigla !== "";
            });


    // ==========================================
    // ORDENAR
    // BÁSICO → INTERMEDIO → AVANZADO
    // ==========================================

    resultados.sort(
        (a, b) => {

            const ordenNivel = {

                "basico": 1,

                "intermedio": 2,

                "avanzado": 3

            };


            const nivelA =
                normalizarTexto(
                    a.nivel
                );


            const nivelB =
                normalizarTexto(
                    b.nivel
                );


            const diferenciaNivel =
                (
                    ordenNivel[nivelA] || 99
                ) -
                (
                    ordenNivel[nivelB] || 99
                );


            if (
                diferenciaNivel !== 0
            ) {

                return diferenciaNivel;

            }


            // ==================================
            // ORDEN ALFABÉTICO
            // ==================================

            return String(
                a.termino || ""
            ).localeCompare(
                String(
                    b.termino || ""
                ),
                "es",
                {
                    sensitivity: "base"
                }
            );

        }
    );


    datosFiltradosActuales =
        resultados;


    // ==========================================
    // CONTADOR
    // ==========================================

    actualizarContador(
        resultados.length
    );


    // ==========================================
    // MOSTRAR PÁGINA
    // ==========================================

    mostrarPaginaActual();


    // ==========================================
    // PAGINACIÓN
    // ==========================================

    mostrarPaginacion(
        resultados.length
    );

}


// ==========================================
// MOSTRAR PÁGINA ACTUAL
// ==========================================

function mostrarPaginaActual() {

    const contenedor =
        document.querySelector(
            "#termGrid"
        );


    if (!contenedor) {

        console.error(
            "❌ No se encontró #termGrid"
        );

        return;

    }


    contenedor.innerHTML =
        "";


    // ==========================================
    // SIN RESULTADOS
    // ==========================================

    if (
        datosFiltradosActuales.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="empty-state">

                <p>
                    No se encontraron términos.
                </p>

            </div>

        `;


        return;

    }


    // ==========================================
    // TOTAL DE PÁGINAS
    // ==========================================

    const totalPaginas =
        Math.ceil(
            datosFiltradosActuales.length /
            TERMINOS_POR_PAGINA
        );


    // Seguridad

    if (
        paginaActual >
        totalPaginas
    ) {

        paginaActual =
            totalPaginas;

    }


    if (
        paginaActual < 1
    ) {

        paginaActual = 1;

    }


    // ==========================================
    // ÍNDICES
    // ==========================================

    const inicio =
        (
            paginaActual - 1
        ) *
        TERMINOS_POR_PAGINA;


    const fin =
        inicio +
        TERMINOS_POR_PAGINA;


    const resultadosPagina =
        datosFiltradosActuales.slice(
            inicio,
            fin
        );


    // ==========================================
    // CREAR TARJETAS
    // ==========================================

    resultadosPagina.forEach(
        item => {

            const tarjeta =
                document.createElement(
                    "article"
                );


            tarjeta.className =
                "term-card";


            tarjeta.innerHTML = `

                <div class="term-card__top">

                    <span
                        class="badge-nivel ${obtenerClaseNivel(
                item.nivel
            )}"
                    >
                        ${escaparHTML(
                item.nivel ||
                "Sin nivel"
            )}
                    </span>

                </div>


                <div class="term-card__body">

                    <h3>
                        ${escaparHTML(
                item.termino ||
                "Sin término"
            )}
                    </h3>


                    <p
                        class="term-card__ingles"
                    >
                        ${escaparHTML(
                item.ingles ||
                ""
            )}
                    </p>


                    <p
                        class="term-card__category"
                    >
                        ${escaparHTML(
                item.categoria ||
                ""
            )}
                    </p>


                    <button
                        type="button"
                        class="term-card__link"
                        data-id="${escaparHTML(
                item.id
            )}"
                    >
                        Ver más →
                    </button>

                </div>

            `;


            // ==================================
            // BOTÓN VER MÁS
            // ==================================

            const boton =
                tarjeta.querySelector(
                    ".term-card__link"
                );


            if (boton) {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirDetalle(
                            item.id
                        );

                    }
                );

            }


            contenedor.appendChild(
                tarjeta
            );

        }
    );

}


// ==========================================
// PAGINACIÓN
// ==========================================

function mostrarPaginacion(
    cantidadResultados
) {

    const contenedor =
        document.querySelector(
            "#pagination"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    const totalPaginas =
        Math.ceil(
            cantidadResultados /
            TERMINOS_POR_PAGINA
        );


    // ==========================================
    // UNA SOLA PÁGINA
    // ==========================================

    if (totalPaginas <= 1) {
        return;
    }


    // ==========================================
    // FUNCIÓN PARA CAMBIAR DE PÁGINA
    // ==========================================

    function irAPagina(pagina) {

        paginaActual = pagina;

        mostrarPaginaActual();

        mostrarPaginacion(
            datosFiltradosActuales.length
        );

        desplazarAlInicioResultados();
    }


    // ==========================================
    // BOTÓN ANTERIOR
    // ==========================================

    const anterior =
        document.createElement("button");

    anterior.type = "button";

    anterior.className =
        "pagination-button pagination-arrow";

    anterior.textContent = "←";

    anterior.setAttribute(
        "aria-label",
        "Página anterior"
    );

    anterior.disabled =
        paginaActual === 1;


    anterior.addEventListener(
        "click",
        () => {

            if (paginaActual > 1) {

                irAPagina(
                    paginaActual - 1
                );

            }

        }
    );


    contenedor.appendChild(
        anterior
    );


    // ==========================================
    // FUNCIÓN PARA CREAR BOTÓN
    // ==========================================

    function crearBotonPagina(pagina) {

        const boton =
            document.createElement("button");


        boton.type = "button";

        boton.className =
            "pagination-button";


        boton.textContent =
            pagina;


        boton.setAttribute(
            "aria-label",
            `Ir a la página ${pagina}`
        );


        if (
            pagina === paginaActual
        ) {

            boton.classList.add(
                "active"
            );

            boton.setAttribute(
                "aria-current",
                "page"
            );

        }


        boton.addEventListener(
            "click",
            () => {

                if (
                    paginaActual !== pagina
                ) {

                    irAPagina(pagina);

                }

            }
        );


        contenedor.appendChild(
            boton
        );
    }


    // ==========================================
    // FUNCIÓN PARA CREAR "..."
    // ==========================================

    function crearPuntos() {

        const puntos =
            document.createElement("span");


        puntos.className =
            "pagination-dots";


        puntos.textContent =
            "…";


        contenedor.appendChild(
            puntos
        );
    }


    // ==========================================
    // PAGINACIÓN COMPACTA
    // ==========================================

    // ------------------------------------------
    // SI HAY 7 PÁGINAS O MENOS
    // ------------------------------------------

    if (totalPaginas <= 7) {

        for (
            let pagina = 1;
            pagina <= totalPaginas;
            pagina++
        ) {

            crearBotonPagina(pagina);

        }

    }


    // ------------------------------------------
    // PRIMERAS PÁGINAS
    // ------------------------------------------

    else if (
        paginaActual <= 4
    ) {

        // 1 2 3 4 5 ... 44

        for (
            let pagina = 1;
            pagina <= 5;
            pagina++
        ) {

            crearBotonPagina(pagina);

        }


        crearPuntos();


        crearBotonPagina(
            totalPaginas
        );

    }


    // ------------------------------------------
    // ÚLTIMAS PÁGINAS
    // ------------------------------------------

    else if (
        paginaActual >=
        totalPaginas - 3
    ) {

        // 1 ... 40 41 42 43 44

        crearBotonPagina(1);


        crearPuntos();


        for (
            let pagina =
                totalPaginas - 4;

            pagina <= totalPaginas;

            pagina++
        ) {

            crearBotonPagina(pagina);

        }

    }


    // ------------------------------------------
    // PÁGINAS DEL CENTRO
    // ------------------------------------------

    else {

        // 1 ... 10 11 12 ... 44

        crearBotonPagina(1);


        crearPuntos();


        crearBotonPagina(
            paginaActual - 1
        );


        crearBotonPagina(
            paginaActual
        );


        crearBotonPagina(
            paginaActual + 1
        );


        crearPuntos();


        crearBotonPagina(
            totalPaginas
        );

    }


    // ==========================================
    // BOTÓN SIGUIENTE
    // ==========================================

    const siguiente =
        document.createElement("button");


    siguiente.type = "button";

    siguiente.className =
        "pagination-button pagination-arrow";

    siguiente.textContent = "→";

    siguiente.setAttribute(
        "aria-label",
        "Página siguiente"
    );


    siguiente.disabled =
        paginaActual ===
        totalPaginas;


    siguiente.addEventListener(
        "click",
        () => {

            if (
                paginaActual <
                totalPaginas
            ) {

                irAPagina(
                    paginaActual + 1
                );

            }

        }
    );


    contenedor.appendChild(
        siguiente
    );

}


// ==========================================
// CONTADOR DE RESULTADOS
// ==========================================

function actualizarContador(
    cantidad
) {

    const contador =
        document.querySelector(
            "#resultsCount"
        );


    if (!contador) {
        return;
    }


    if (
        cantidad === 1
    ) {

        contador.textContent =
            "1 término";

    } else {

        contador.textContent =
            `${cantidad} términos`;

    }

}


// ==========================================
// CLASE DEL NIVEL
// ==========================================

function obtenerClaseNivel(
    nivel
) {

    if (!nivel) {
        return "";
    }


    const nivelNormalizado =
        normalizarTexto(
            nivel
        );


    if (
        nivelNormalizado ===
        "basico"
    ) {

        return "nivel-basico";

    }


    if (
        nivelNormalizado ===
        "intermedio"
    ) {

        return "nivel-intermedio";

    }


    if (
        nivelNormalizado ===
        "avanzado"
    ) {

        return "nivel-avanzado";

    }


    return "";

}


// ==========================================
// DESPLAZAR AL INICIO DE RESULTADOS
// ==========================================

function desplazarAlInicioResultados() {

    const resultados =
        document.querySelector(
            ".results-header"
        );


    if (!resultados) {
        return;
    }


    resultados.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escaparHTML(
    valor
) {

    return String(
        valor || ""
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