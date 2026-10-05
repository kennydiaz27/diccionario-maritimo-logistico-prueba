// ==========================================
// FILTROS DEL DICCIONARIO
// ==========================================


// ==========================================
// SUBCATEGORÍAS DE SIGLAS
// ==========================================

const SIGLAS_SUBCATEGORIAS = [
    "Contenedores y Carga",
    "Costos y Tarifas",
    "Documentos Comerciales",
    "Términos Incoterms®",
    "Operaciones y Otros",
    "Aduanas y Normatividad"
];


// ==========================================
// ESTADO ACTUAL DE LOS FILTROS
// ==========================================

const filtros = {
    categoria: "all",
    nivel: "all",
    subcategoria: "all",
    letra: "all",
    busqueda: ""
};


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(texto) {

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


// ==========================================
// DETECTAR SI ES UNA SIGLA
// ==========================================

function esRegistroSigla(item) {

    if (!item) return false;

    // Si el JSON tiene un tipo explícito
    const tipo = normalizarTexto(item.tipo);

    if (
        tipo === "sigla" ||
        tipo === "siglas" ||
        tipo === "abreviatura" ||
        tipo === "abreviaturas"
    ) {
        return true;
    }

    // Si el JSON tiene una marca explícita
    if (item.esSigla === true) {
        return true;
    }

    // Si alguna de las categorías propias de siglas
    // aparece como categoría o subcategoría
    const categoria = normalizarTexto(item.categoria);
    const subcategoria = normalizarTexto(item.subcategoria);

    const perteneceASiglas = SIGLAS_SUBCATEGORIAS.some(
        sub => {
            const subNormalizada = normalizarTexto(sub);

            return (
                categoria === subNormalizada ||
                subcategoria === subNormalizada
            );
        }
    );

    if (perteneceASiglas) {
        return true;
    }

    // También soportamos el caso en que posteriormente
    // el JSON tenga "Siglas y Abreviaturas" como categoría principal
    if (categoria === normalizarTexto("Siglas y Abreviaturas")) {
        return true;
    }

    return false;
}


// ==========================================
// OBTENER CATEGORÍA PRINCIPAL
// ==========================================

function obtenerCategoriaPrincipal(item) {

    if (!item) return "";

    if (esRegistroSigla(item)) {
        return "Siglas y Abreviaturas";
    }

    return String(item.categoria || "").trim();
}


// ==========================================
// OBTENER SUBCATEGORÍA
// ==========================================

function obtenerSubcategoriaFiltro(item) {

    if (!item) return "";

    if (esRegistroSigla(item)) {

        const subcategoria = String(
            item.subcategoria || ""
        ).trim();

        // Si ya existe una subcategoría válida
        if (
            SIGLAS_SUBCATEGORIAS.some(
                sub => normalizarTexto(sub) === normalizarTexto(subcategoria)
            )
        ) {
            return subcategoria;
        }

        // En el JSON actual, la categoría de Excel
        // puede estar guardada en "categoria"
        const categoria = String(
            item.categoria || ""
        ).trim();

        if (
            SIGLAS_SUBCATEGORIAS.some(
                sub => normalizarTexto(sub) === normalizarTexto(categoria)
            )
        ) {
            return categoria;
        }

        return "";
    }

    return String(item.subcategoria || "").trim();
}


// ==========================================
// OBTENER TÉRMINO PARA LA BÚSQUEDA
// ==========================================

function obtenerTerminoBusqueda(item) {

    return [
        item.termino,
        item.sigla,
        item["Sigla / Abreviatura"]
    ]
        .filter(Boolean)
        .join(" ");
}


// ==========================================
// OBTENER INGLÉS PARA LA BÚSQUEDA
// ==========================================

function obtenerInglesBusqueda(item) {

    return [
        item.ingles,
        item.traduccionIngles,
        item.nombreOriginalIngles,
        item.nombre_original,
        item.nombreOriginal,
        item["Nombre Original (Inglés)"]
    ]
        .filter(Boolean)
        .join(" ");
}


// ==========================================
// APLICAR FILTROS
// ==========================================

function aplicarFiltros(datos) {

    if (!Array.isArray(datos)) {
        return [];
    }

    let resultados = [...datos];


    // ======================================
    // CATEGORÍA
    // ======================================

    if (filtros.categoria !== "all") {

        resultados = resultados.filter(item => {

            const categoriaPrincipal =
                obtenerCategoriaPrincipal(item);

            return normalizarTexto(categoriaPrincipal) ===
                normalizarTexto(filtros.categoria);
        });
    }


    // ======================================
    // NIVEL
    // ======================================

    if (filtros.nivel !== "all") {

        resultados = resultados.filter(item => {

            return normalizarTexto(item.nivel) ===
                normalizarTexto(filtros.nivel);
        });
    }


    // ======================================
    // SUBCATEGORÍA
    // ======================================

    if (filtros.subcategoria !== "all") {

        resultados = resultados.filter(item => {

            const subcategoria =
                obtenerSubcategoriaFiltro(item);

            return normalizarTexto(subcategoria) ===
                normalizarTexto(filtros.subcategoria);
        });
    }


    // ======================================
    // LETRA
    // ======================================

    if (filtros.letra !== "all") {

        resultados = resultados.filter(item => {

            const termino =
                obtenerTerminoBusqueda(item);

            const primeraLetra =
                normalizarTexto(termino).charAt(0);

            return primeraLetra ===
                normalizarTexto(filtros.letra);
        });
    }


    // ======================================
    // BÚSQUEDA
    // ======================================

// ======================================
// BÚSQUEDA INTELIGENTE
// ======================================

if (filtros.busqueda) {

    const busqueda =
        normalizarTexto(filtros.busqueda);

    resultados = resultados
        .filter(item => {

            const termino =
                normalizarTexto(
                    obtenerTerminoBusqueda(item)
                );

            const ingles =
                normalizarTexto(
                    obtenerInglesBusqueda(item)
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
        })
        .sort((a, b) => {

            // ----------------------------------
            // PREPARAR TEXTOS
            // ----------------------------------

            const terminoA =
                normalizarTexto(
                    obtenerTerminoBusqueda(a)
                );

            const terminoB =
                normalizarTexto(
                    obtenerTerminoBusqueda(b)
                );

            const inglesA =
                normalizarTexto(
                    obtenerInglesBusqueda(a)
                );

            const inglesB =
                normalizarTexto(
                    obtenerInglesBusqueda(b)
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


            // ----------------------------------
            // PRIORIDAD DE COINCIDENCIA
            // ----------------------------------

            function obtenerPrioridad(
                termino,
                ingles,
                sigla
            ) {

                // 1. El término comienza
                //    exactamente con la búsqueda
                if (termino.startsWith(busqueda)) {
                    return 1;
                }

                // 2. La sigla comienza
                //    con la búsqueda
                if (sigla.startsWith(busqueda)) {
                    return 2;
                }

                // 3. El inglés comienza
                //    con la búsqueda
                if (ingles.startsWith(busqueda)) {
                    return 3;
                }

                // 4. La búsqueda aparece
                //    en cualquier otra posición
                return 4;
            }


            const prioridadA =
                obtenerPrioridad(
                    terminoA,
                    inglesA,
                    siglaA
                );

            const prioridadB =
                obtenerPrioridad(
                    terminoB,
                    inglesB,
                    siglaB
                );


            // ----------------------------------
            // ORDENAR POR PRIORIDAD
            // ----------------------------------

            if (prioridadA !== prioridadB) {
                return prioridadA - prioridadB;
            }


            // ----------------------------------
            // SI TIENEN LA MISMA PRIORIDAD,
            // ORDEN ALFABÉTICO
            // ----------------------------------

            return terminoA.localeCompare(
                terminoB,
                "es",
                {
                    sensitivity: "base"
                }
            );
        });
    }

    return resultados;
}