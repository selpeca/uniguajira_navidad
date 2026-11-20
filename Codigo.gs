// ===================== CONFIGURACIÓN 2026 =====================
const CONFIG = {
  hoja: "Base de datos",
  asunto: "Abraza la Navidad con Uniguajira: hoy te invito a donar un regalo",
  remitente: "Dirección de Extensión y Proyección Social",
  // Estos datos ya están en la imagen de Canva; aquí solo se usan para la versión en texto plano
  fechaLimite: "30 de noviembre de 2026",
  lugarEntrega: "Dirección de Extensión y Proyección Social (Bloque Administrativo B Cristóbal Fonseca Siosi) " +
                "o Emisora institucional Uniguajira Estéreo (Calle 8 # 10-140)",
  // Carpeta pública con los cortes del diseño (arriba.jpg, medio.jpg, abajo.jpg)
  imgBase: "https://raw.githubusercontent.com/selpeca/uniguajira_navidad/main/img/2026/",
  colEnvio: 9,                  // Columna I: Fecha último envío (o error)
  tiempoMaximoMs: 5 * 60 * 1000 // Se detiene antes del límite de 6 min de Apps Script
};

// ===================== FORMATO DE DATOS =====================
// "PAULIMAR ISABEL JUSAYU" -> "Paulimar Isabel Jusayu"
function formatearNombre(texto) {
  const minusculas = ["de", "del", "la", "las", "los", "y"];
  return String(texto || "").trim().toLowerCase().split(/\s+/)
    .map((p, i) => (i > 0 && minusculas.indexOf(p) >= 0) ? p : p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// GENERO "NIÑA"/"NIÑO" (también F/M) + EDAD "1 AÑO" / 7 -> "una niña de 1 año"
function describirNino(genero, edad) {
  const g = String(genero || "").trim().toUpperCase();
  const esNina = g.indexOf("NIÑA") === 0 || g.indexOf("NINA") === 0 || g.charAt(0) === "F";
  let e = String(edad || "").trim().toLowerCase();
  if (/^\d+$/.test(e)) e += (e === "1" ? " año" : " años");
  return (esNina ? "una niña" : "un niño") + (e ? " de " + e : "");
}

// ===================== ENVÍO MASIVO (INVITACIÓN) =====================
function enviarCorreosNavidad() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(CONFIG.hoja);
  const data = sheet.getDataRange().getValues();
  const inicio = Date.now();

  // Remover encabezado
  data.shift();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2;

    // No reenviar a quien ya recibió (columna I con fecha)
    if (row[CONFIG.colEnvio - 1] instanceof Date) continue;

    // Cupo diario de Gmail
    if (MailApp.getRemainingDailyQuota() < 1) {
      Logger.log("Cupo diario agotado. Continúa mañana desde la fila " + rowNumber);
      return;
    }

    // Tiempo de ejecución: al volver a ejecutar continúa donde quedó
    if (Date.now() - inicio > CONFIG.tiempoMaximoMs) {
      Logger.log("Tiempo límite alcanzado en la fila " + rowNumber + ". Ejecuta de nuevo para continuar.");
      return;
    }

    procesarEnvio(sheet, row, rowNumber);
  }
  Logger.log("Envío masivo terminado.");
}

function enviarCorreoIndividual(numeroFila) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(CONFIG.hoja);
  const row = sheet.getRange(numeroFila, 1, 1, sheet.getLastColumn()).getValues()[0];

  procesarEnvio(sheet, row, numeroFila);
}

function procesarEnvio(sheet, row, rowNumber) {

  const comunidad         = row[0]; // A
  const nombreNino        = row[1]; // B
  const edad              = row[2]; // C: EDAD (ej. "1 AÑO")
  const sexo              = row[3]; // D: GENERO (NIÑA / NIÑO)
  const nombreFuncionario = row[4]; // E
  const correoFuncionario = row[5]; // F
  const medio             = row[6]; // G: si tiene valor (regalo, transferencia, NO ENVIAR CORREO...) NO se envía

  // Validación mínima
  if (!correoFuncionario || medio) return;
  if (!nombreNino) {
    sheet.getRange(rowNumber, CONFIG.colEnvio).setValue("SIN NIÑO ASIGNADO");
    return;
  }

  const funcionario = formatearNombre(nombreFuncionario);
  const nino        = formatearNombre(nombreNino);
  const comunidadTx = formatearNombre(comunidad);
  const descripcion = describirNino(sexo, edad);

  const template = HtmlService.createTemplateFromFile("template.html");
  template.imgBase           = CONFIG.imgBase;
  template.nombreFuncionario = funcionario;
  template.nombreNino        = nino;
  template.descripcion       = descripcion;
  template.comunidad         = comunidadTx;

  const mensaje = template.evaluate().getContent();

  // Versión en texto plano (para clientes que no muestran HTML)
  const textoPlano =
    "¡Hola, " + funcionario + "!\n\n" +
    "Mi nombre es " + nino + ". Soy " + descripcion + " y hago parte de la comunidad " + comunidadTx + ".\n" +
    "¡Hoy te invito a donar un regalo y despertar una sonrisa!\n\n" +
    "Fecha límite de entrega: " + CONFIG.fechaLimite + "\n" +
    "Lugar de entrega: " + CONFIG.lugarEntrega + "\n\n" +
    CONFIG.remitente + " - Universidad de La Guajira";

  try {
    GmailApp.sendEmail(
      correoFuncionario,
      CONFIG.asunto,
      textoPlano,
      {
        htmlBody: mensaje,
        name: CONFIG.remitente
      }
    );

    // Registrar fecha/hora de envío en columna I (columna 9)
    sheet.getRange(rowNumber, CONFIG.colEnvio).setValue(new Date());

  } catch (error) {
    sheet.getRange(rowNumber, CONFIG.colEnvio).setValue("ERROR: " + error);
  }
}

// ===================== AGRADECIMIENTO (se conserva para después del evento) =====================
function enviarAgradecimientos() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(CONFIG.hoja);
  const data = sheet.getDataRange().getValues();

  // Remover encabezado
  data.shift();

  data.forEach((row, index) => {
    procesarAgradecimiento(sheet, row, index + 2);
  });
}

function procesarAgradecimiento(sheet, row, rowNumber) {

  const nombreFuncionario = row[4];
  const correoFuncionario = row[5];

  // Validación mínima
  if (!correoFuncionario) return;

  const template = HtmlService.createTemplateFromFile("template_agradecimiento.html");
  template.nombreFuncionario = nombreFuncionario;

  const mensaje = template.evaluate().getContent();

  try {
    GmailApp.sendEmail(
      correoFuncionario,
      "Agradecimiento – Campaña “Desde Uniguajira, una Navidad para compartir y sonreír”  ",
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

// ===================== MENÚ =====================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📨 Envíos")
    .addItem("Enviar correo de esta fila", "enviarCorreoMenu")
    .addItem("Enviar invitaciones pendientes (masivo)", "enviarCorreosNavidadMenu")
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

function enviarCorreosNavidadMenu() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    "Envío masivo",
    "Se enviará la invitación a todas las filas sin fecha en la columna I. ¿Continuar?",
    ui.ButtonSet.YES_NO
  );
  if (resp === ui.Button.YES) enviarCorreosNavidad();
}
