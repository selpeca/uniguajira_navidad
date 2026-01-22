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

  const nombreFuncionario = row[4];
  const correoFuncionario = row[5];

  // Validación mínima
  if (!correoFuncionario) return;

  template = HtmlService.createTemplateFromFile("template_agradecimiento.html");
  template.nombreFuncionario = nombreFuncionario;

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
