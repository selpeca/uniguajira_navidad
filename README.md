# Campaña navideña – Universidad de La Guajira

Envío masivo de invitaciones por correo para la campaña navideña que lidera la **Dirección de Extensión y Proyección Social**. En ella, funcionarios y docentes apadrinan a un niño o niña de una comunidad previamente seleccionada y le donan un regalo.

Cada funcionario recibe un correo personalizado con los datos del niño que le correspondió: nombre, edad, género y comunidad. Después del evento se envía un correo de agradecimiento.

**Herramientas:** Google Sheets + Google Apps Script + Gmail, desde la cuenta institucional @uniguajira.edu.co.

---

## Historial

| Año | Nombre de la campaña | Diseño |
|---|---|---|
| 2023 | "En esta navidad construyamos sonrisas" | Tarjetas-imagen individuales (Canva) |
| 2024 | "En esta navidad construyamos sonrisas" | Tarjetas-imagen individuales (Canva) |
| 2025 | "Desde Uniguajira, una Navidad para compartir y sonreír" | HTML + imagen de encabezado `REGALA-SONRISAS.jpg` |
| 2026 | "Abraza la Navidad con Uniguajira" | Diseño de Comunicaciones en Canva, cortado en 3 imágenes + texto HTML |

El código y las plantillas de años anteriores están en el historial de git.

---

## Flujo de trabajo

1. **Recibir listados:** niños (de las comunidades) y funcionarios/docentes.
2. **Limpiar los datos** y cargarlos en la hoja `Base de datos` del Google Sheet del año.
3. **Asignar** cada niño a un funcionario (1 a 1). La asignación la hacen manualmente los funcionarios de Extensión. Por ejemplo, los niños cuyo regalo resulta menos atractivo se reasignan o se busca un plan B.
4. **Actualizar el diseño** (ver [Cómo actualizar el diseño](#cómo-actualizar-el-diseño-cada-año)).
5. **Copiar** `Codigo.gs` y `template.html` al proyecto de Apps Script del Sheet (*Extensiones → Apps Script*).
6. **Probar** enviando una fila con tu propio correo.
7. **Envío masivo** desde el menú `📨 Envíos`.
8. **Registrar donaciones** en la columna *Medio* a medida que llegan los regalos o aportes.
9. **Después del evento:** enviar el agradecimiento (`enviarAgradecimientos()`).

---

## Estructura de la hoja `Base de datos`

El código lee las columnas **por posición**, no por nombre. Si se agrega, quita o mueve una columna, hay que actualizar los índices en `procesarEnvio()`.

| Col | Encabezado | Uso | Ejemplo |
|---|---|---|---|
| A | Comunidad | Texto del correo | Jullamana |
| B | NIÑO/A | Texto del correo | NOMBRE APELLIDO |
| C | EDAD | Texto del correo | 1 AÑO / 7 |
| D | GENERO | "una niña" / "un niño" | NIÑA / NIÑO (también F / M) |
| E | FUNCIONARIO | Saludo | NOMBRE APELLIDO |
| F | Correo | Destinatario | usuario@uniguajira.edu.co |
| G | Medio | **Si tiene valor, NO se envía** | Regalo / Transferencia / Efectivo / NO ENVIAR CORREO |
| H | Valor | Solo control (no lo usa el código) | |
| I | Fecha ultimo envio | La escribe el script | 19/11/2026 o `ERROR: …` |
| J | Observación | Solo control (no lo usa el código) | |

Los datos pueden venir en MAYÚSCULAS: el script los formatea antes de enviarlos. Por ejemplo, `PÉREZ CAMARGO` sale como "Pérez Camargo", `1 AÑO` como "1 año" y `NIÑA` como "una niña".

> ⚠️ **Datos de menores de edad (Ley 1581 de 2012).** Nunca subas al repositorio la hoja, exportaciones CSV ni capturas con datos reales. Este repo es público.

---

## Archivos

| Archivo | Descripción |
|---|---|
| `Codigo.gs` | Script de Apps Script: configuración, envío masivo, envío por fila, agradecimiento y menú |
| `template.html` | Plantilla de la invitación del año en curso |
| `img/2026/arriba.jpg` | Corte superior del diseño (logos, foto, título, moño, "¡Hola!") |
| `img/2026/medio.jpg` | Fondo de la franja personalizada (verde del regalo) |
| `img/2026/abajo.jpg` | Corte inferior (llamado a donar, fecha límite, puntos de entrega) |
| `template_agradecimiento.html` | Correo de agradecimiento (diseño 2025; actualizarlo antes de usarlo) |
| `template_blank.html` | Versión 2025 sin niño asignado. **No se usa desde 2026** |
| `REGALA-SONRISAS.jpg`, `evidencias.jpg` | Imágenes de 2025 (invitación y agradecimiento) |

---

## Configuración (`Codigo.gs`)

Todo lo que cambia cada año está en el objeto `CONFIG`, al inicio del archivo:

```javascript
const CONFIG = {
  hoja: "Base de datos",
  asunto: "Abraza la Navidad con Uniguajira: hoy te invito a donar un regalo",
  remitente: "Dirección de Extensión y Proyección Social",
  fechaLimite: "30 de noviembre de 2026",       // solo para la versión en texto plano
  lugarEntrega: "…",                            // solo para la versión en texto plano
  imgBase: "https://raw.githubusercontent.com/selpeca/uniguajira_navidad/main/img/2026/",
  colEnvio: 9,                                  // columna I
  tiempoMaximoMs: 5 * 60 * 1000
};
```

- `imgBase` debe apuntar a una carpeta **pública** con `arriba.jpg`, `medio.jpg` y `abajo.jpg`. Por eso las imágenes se suben al repo antes de enviar.
- Desde 2026, la fecha límite y los puntos de entrega están **dentro de la imagen** de Canva. Si cambian, hay que volver a exportar el diseño.

---

## Cómo actualizar el diseño cada año

El correo copia el esquema de los boletines de Comunicaciones (MailUp): **imagen superior + franja con texto HTML sobre una imagen de fondo + imagen inferior**. Así el diseño se exporta una sola vez y cada correo sale personalizado con texto real, no con 400 imágenes distintas.

1. **Pedir a Comunicaciones el diseño en Canva.** En 2026 fue *"Plantilla campaña navidad 2026"*, de 1080 × 1500 px.
2. **Hacer una copia** del diseño y, en ella, **borrar los textos variables:** el nombre del funcionario y el párrafo del niño. Se dejan los textos fijos ("¡Hola!", llamado a donar, fecha, puntos de entrega).
3. **Exportar la copia en PNG** al ancho original (1080 px).
4. **Cortar la imagen en 3 partes.** En 2026 se usaron estos rangos verticales:

   | Corte | Rango (px) | Contenido |
   |---|---|---|
   | `arriba.jpg` | 0 – 840 | Hasta el "¡Hola!" |
   | `medio.jpg` | 840 – 1100 | Zona donde iban el nombre y el texto del niño |
   | `abajo.jpg` | 1100 – 1500 | Desde "¡Hoy te invito a donar…!" |

   Con Python/Pillow:

   ```python
   from PIL import Image
   im = Image.open("diseno_sin_textos.png").convert("RGB")
   for nombre, (a, b) in {"arriba": (0, 840), "medio": (840, 1100), "abajo": (1100, 1500)}.items():
       im.crop((0, a, im.width, b)).save(f"img/2027/{nombre}.jpg", quality=86, optimize=True)
   ```

5. **Subir** los cortes a `img/<año>/` y actualizar `CONFIG.imgBase`.
6. **Revisar `template.html`:** textos alternativos (`alt`) de las imágenes, color del texto de la franja (2026: `#fff3d7`), color de respaldo del fondo (2026: `#1f3f2c`) y el preheader.

Si un año no hay diseño de Comunicaciones, el historial de git tiene dos versiones 100 % HTML/ilustración (noviembre 2026), hechas con la línea gráfica de la plantilla institucional **CI-F-07**.

---

## Envío

### Prueba
1. Pon **tu correo** en la columna F de una fila y deja vacía la columna G.
2. Selecciona cualquier celda de esa fila.
3. Usa **📨 Envíos → Enviar correo de esta fila**.

El envío por fila **no revisa** la columna I: se puede repetir las veces que se necesite. La fecha de la columna I se sobrescribe con cada envío.

### Masivo
Usa **📨 Envíos → Enviar invitaciones pendientes (masivo)**, que pide confirmación antes de enviar.

Reglas del envío masivo:

| Columna I | Columna G (Medio) | ¿Envía? |
|---|---|---|
| Vacía | Vacía | ✅ Sí |
| Tiene una **fecha** | — | ❌ No, nunca (la fecha no vence) |
| Texto (`ERROR: …`, `SIN NIÑO ASIGNADO`) | Vacía | 🔁 Sí, lo intenta de nuevo |
| — | Con valor | ❌ No |
| Sin niño en la columna B | — | ❌ No; escribe `SIN NIÑO ASIGNADO` |

- **Para reenviarle a alguien en el masivo**, borra la fecha de su fila en la columna I.
- **No hay pausa entre correos:** sale aproximadamente uno por segundo.
- **Límite de tiempo:** cada ejecución se detiene a los **5 minutos**, unos 200 a 300 correos, por el límite de 6 minutos de Apps Script. **Vuelve a ejecutarlo** y continúa donde quedó.
- **Límite diario:** también se detiene si se agota el cupo de Gmail, que en Workspace es de unos 1.500 destinatarios al día. El resultado queda en *Ver → Registros de ejecución*.

### Agradecimiento (después del evento)
`enviarAgradecimientos()` envía `template_agradecimiento.html` a todas las filas con correo.

> ⚠️ No revisa la columna I ni la columna G, y **sobrescribe** la fecha de la columna I. Antes de usarlo, actualiza la plantilla al diseño del año y decide a quién se envía (¿a todos los invitados o solo a quienes donaron?).

---

## Compatibilidad del correo

- **Gmail (web y app):** se ve como el diseño.
- **Outlook de escritorio:** no muestra la imagen de fondo de la franja del medio, así que el texto sale sobre verde liso.
- **Tipografía:** la de la franja es Poppins o Arial, porque las fuentes de Canva no se pueden usar en correos.
- **Texto plano:** cada correo incluye una versión en texto plano, por si el cliente no muestra HTML.

---

## Lista de verificación para el próximo año

- [ ] Hoja nueva con la misma estructura de columnas (A–J)
- [ ] Datos limpios; columna G vacía salvo excepciones
- [ ] Diseño de Comunicaciones exportado sin textos variables y cortado en 3
- [ ] Imágenes subidas a `img/<año>/` y `CONFIG.imgBase` actualizado
- [ ] `CONFIG.asunto`, `fechaLimite` y `lugarEntrega` actualizados
- [ ] `template.html` revisado (`alt`, colores, preheader)
- [ ] `Codigo.gs` y `template.html` copiados al proyecto de Apps Script
- [ ] Prueba con tu correo en Gmail (web y celular)
- [ ] Envío masivo y verificación de la columna I (fechas / errores)
- [ ] Agradecimiento actualizado al diseño del año

## Pendientes conocidos

- `template_agradecimiento.html` sigue con el diseño y los textos de 2025.
- `template_blank.html` ya no se usa. Se puede eliminar o adaptar si vuelve a haber funcionarios sin niño asignado.
- La fecha de la columna I no vence: no hay recordatorio automático para quienes no han donado.
- El repositorio cambió de nombre (`uniguajira_navidad_2025` → `uniguajira_navidad`). Verificar que `CONFIG.imgBase` use el nombre vigente.
