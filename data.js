// ==========================================
// CARGAR DICCIONARIO
// ==========================================

async function cargarDiccionario() {

    try {

        /*
        ==========================================
        DETERMINAR LA RUTA DEL JSON
        ==========================================

        El Home está en:

        index.html
        → data/diccionario.json

        Las páginas internas están en:

        pages/catalogo.html
        → ../data/diccionario.json

        Por eso utilizamos una ruta diferente
        dependiendo de dónde se encuentre la página.
        */

        const estamosEnPages =
            window.location.pathname.includes("/pages/");


        const rutaDiccionario = estamosEnPages
            ? "../data/diccionario.json"
            : "data/diccionario.json";


        console.log(
            "📂 Cargando diccionario desde:",
            rutaDiccionario
        );


        // ==========================================
        // CARGAR JSON
        // ==========================================

        const respuesta =
            await fetch(rutaDiccionario);


        if (!respuesta.ok) {

            throw new Error(
                `No se pudo cargar el diccionario. Código: ${respuesta.status}`
            );

        }


        // ==========================================
        // CONVERTIR JSON
        // ==========================================

        const datos =
            await respuesta.json();


        console.log(
            "✅ Diccionario cargado correctamente"
        );


        console.log(
            `📚 Registros encontrados: ${datos.length}`
        );


        return datos;


    } catch (error) {

        console.error(
            "❌ Error al cargar el diccionario:",
            error
        );


        return [];

    }

}