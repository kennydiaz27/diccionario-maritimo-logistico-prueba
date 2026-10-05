// ==========================================
// DETALLE DEL TÉRMINO
// ==========================================

function abrirDetalle(id) {

    if (!id) {
        console.error("❌ No se recibió un ID de término.");
        return;
    }


    // ==========================================
    // DETERMINAR DESDE DÓNDE SE ABRIÓ
    // ==========================================

    const rutaActual =
        window.location.pathname;

    const esCatalogo =
        rutaActual.endsWith("catalogo.html");


    // ==========================================
    // SI VENIMOS DEL CATÁLOGO
    // ==========================================

    if (
        esCatalogo &&
        typeof filtros !== "undefined"
    ) {

        const estadoCatalogo = {

            filtros: {

                categoria:
                    filtros.categoria,

                nivel:
                    filtros.nivel,

                subcategoria:
                    filtros.subcategoria,

                letra:
                    filtros.letra,

                busqueda:
                    filtros.busqueda
            },

            paginaActual:
                typeof paginaActual !== "undefined"
                    ? paginaActual
                    : 1
        };


        sessionStorage.setItem(
            "catalogoEstado",
            JSON.stringify(
                estadoCatalogo
            )
        );


        // Indicamos que al regresar
        // debemos restaurar el catálogo.

        sessionStorage.setItem(
            "restaurarCatalogo",
            "true"
        );


        console.log(
            "💾 Estado del catálogo guardado:",
            estadoCatalogo
        );

    }


    // ==========================================
    // SI VENIMOS DE OTRA PÁGINA
    // ==========================================

    else {

        // No debemos restaurar el catálogo
        // cuando el término fue abierto
        // desde Inicio u otra página.

        sessionStorage.setItem(
            "restaurarCatalogo",
            "false"
        );


        sessionStorage.setItem(
            "paginaAnteriorTermino",
            window.location.href
        );

    }


    // ==========================================
    // ABRIR TÉRMINO
    // ==========================================

    const idCodificado =
        encodeURIComponent(id);


    window.location.href =
        `termino.html?id=${idCodificado}`;
}