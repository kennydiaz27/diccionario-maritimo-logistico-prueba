// ==========================================
// DETALLE DEL TÉRMINO
// ==========================================

function abrirDetalle(id) {

    if (!id) {
        console.error("❌ No se recibió un ID de término.");
        return;
    }

    const idCodificado =
        encodeURIComponent(id);

    window.location.href =
        `termino.html?id=${idCodificado}`;
}