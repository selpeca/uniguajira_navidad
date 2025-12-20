function enviarCorreosNavidad() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Base de datos");
  const data = sheet.getDataRange().getValues();

  // Remover encabezado
  data.shift();

  data.forEach((row, index) => {
    procesarEnvio(sheet, row, index + 2);
  });
}
function enviarCorreoIndividual(numeroFila) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Base de datos");
  const row = sheet.getRange(numeroFila, 1, 1, sheet.getLastColumn()).getValues()[0];

  procesarEnvio(sheet, row, numeroFila);
}
function procesarEnvio(sheet, row, rowNumber) {

  const comunidad        = row[0];
  const nombreNino       = row[1];
  const edad             = row[2];
  const sexo             = row[3];
  const nombreFuncionario = row[4];
  const correoFuncionario = row[5];
  const medio             = row[6];  // si tiene valor, NO se debe enviar

  // Validación mínima
  if (!correoFuncionario || medio) return;

  // Selección del template
  let template;
  if (nombreNino) {
    template = HtmlService.createTemplateFromFile("template.html");
    template.nombreFuncionario = nombreFuncionario;
    template.nombreNino = nombreNino;
    template.edad = edad;
    template.sexo = sexo;
    template.comunidad = comunidad;

  } else {
    template = HtmlService.createTemplateFromFile("template_blank.html");
    template.nombreFuncionario = nombreFuncionario;
    template.comunidad = comunidad;
  }

  const mensaje = template.evaluate().getContent();

  try {
    GmailApp.sendEmail(
      correoFuncionario,
      "Recordatorio: Únete a la campaña: Desde Uniguajira, una Navidad para Compartir y Sonreír",
      "",
      {
        htmlBody: mensaje,
        name: "Dirección de Extensión y Proyección Social"
      }
    );

    // Registrar fecha/hora de envío en columna I (columna 9)
    sheet.getRange(rowNumber, 9).setValue(new Date());

  } catch (error) {
    sheet.getRange(rowNumber, 9).setValue("ERROR: " + error);
  }
}
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📨 Envíos")
    .addItem("Enviar correo de esta fila", "enviarCorreoMenu")
    .addToUi();
}

function enviarCorreoMenu() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const fila = sheet.getActiveCell().getRow();

  if (fila === 1) {
    SpreadsheetApp.getUi().alert("Selecciona una fila válida.");
    return;
  }

  enviarCorreoIndividual(fila);
}
