/**
 * Imágenes que se incrustan en el correo (inlineImages -> src="cid:<clave>").
 * Por defecto se descargan del repo en GitHub (carpeta img/). Si prefieres Drive,
 * reemplaza la URL por: DriveApp.getFileById("ID").getBlob() en cargarImagenes().
 */
const IMAGENES = {
  escena: "https://raw.githubusercontent.com/selpeca/uniguajira_navidad/main/img/escena.jpg",
  sellos: "https://raw.githubusercontent.com/selpeca/uniguajira_navidad/main/img/sellos.png"
};

function cargarImagenes() {
  const blobs = {};
  Object.keys(IMAGENES).forEach(clave => {
    blobs[clave] = UrlFetchApp.fetch(IMAGENES[clave]).getBlob().setName(clave);
  });
  return blobs;
}

/**
 * Envía la invitación con datos de ejemplo a tu propio correo (o al que indiques).
 * Ejecutar desde el editor de Apps Script: enviarPrueba
 */
function enviarPrueba(correoDestino) {
  const destino = correoDestino || Session.getActiveUser().getEmail();

  const template = HtmlService.createTemplateFromFile("template.html");
  template.nombreFuncionario = "Funcionario de Prueba";
  template.nombreNino        = "Valentina";
  template.edad              = 7;          // acepta 7, "7" o "7 años"
  template.sexo              = "F";        // acepta F, f, Femenino; cualquier otro valor = niño
  template.comunidad         = "Comunidad de Prueba";
  template.fechaLimite       = "Por definir";
  template.lugarEntrega      = "Bloque 1, Piso 1, Dirección de Extensión y Proyección Social";
  template.anio              = new Date().getFullYear();

  GmailApp.sendEmail(
    destino,
    "[PRUEBA] Únete a la campaña: Desde Uniguajira, una Navidad para Compartir y Sonreír",
    "Hola, te invitamos a la campaña navideña de la Universidad de La Guajira.",
    {
      htmlBody: template.evaluate().getContent(),
      inlineImages: cargarImagenes(),
      name: "Dirección de Extensión y Proyección Social"
    }
  );
  Logger.log("Prueba enviada a " + destino);
}
