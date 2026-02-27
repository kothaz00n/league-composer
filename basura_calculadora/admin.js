document.addEventListener('DOMContentLoaded', () => {
    const pdfInput = document.getElementById('pdfInput');
    const processBtn = document.getElementById('processBtn');
    const fileInfo = document.getElementById('fileInfo');
    const previewSection = document.getElementById('previewSection');
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    const statusLog = document.getElementById('statusLog');
    const authBtn = document.getElementById('authBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const authStatus = document.getElementById('authStatus');
    const promotionsList = document.getElementById('promotionsList');
    const addPromoBtn = document.getElementById('addPromoBtn');
    const savePromosBtn = document.getElementById('savePromosBtn');

    // Variables de estado
    let currentFile = null;
    let extractedRows = []; // Array de arrays (filas del CSV)
    let promotions = [];    // Array de objetos {nombre, porcentaje, alcance, observaciones}
    let gapiInited = false;
    let gisInited = false;
    let tokenClient;

    // --- CONFIGURACIÓN GOOGLE SHEETS ---
    const CLIENT_ID = '16773279998-jacs84p25hbhc8o13ct3lnm5dcnc5oa5.apps.googleusercontent.com';
    const API_KEY = 'AIzaSyBgIceVRTKyjXhjNWQ8QS4nwEH1QHiT9iE';
    const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
    const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

    // --- 1. Inicialización Google API ---
    function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
    }

    async function initializeGapiClient() {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        maybeEnableButtons();
    }

    function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '',
        });
        gisInited = true;
        maybeEnableButtons();
    }

    function maybeEnableButtons() {
        if (gapiInited && gisInited) {
            authBtn.style.display = 'block';
        }
    }

    if (document.getElementById('gapiScript')) {
        document.getElementById('gapiScript').onload = gapiLoaded;
        document.getElementById('gisScript').onload = gisLoaded;
    }

    authBtn.addEventListener('click', () => {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) throw (resp);
            authStatus.textContent = "Autenticado correctamente";
            authStatus.style.color = "var(--success-color)";
            if (extractedRows.length > 0) uploadBtn.disabled = false;
            savePromosBtn.disabled = false;
            fetchPromotions(); // Cargar promociones al autenticar
        };
        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });

    uploadBtn.addEventListener('click', async () => {
        if (extractedRows.length === 0) {
            alert("No hay datos para subir. Procesa el PDF primero.");
            return;
        }

        // Incluimos los encabezados antes de subir
        const dataWithHeaders = [
            ["REGION", "TIPO_PLAN", "PLAN", "EDAD_CATEGORIA", "PRECIO"],
            ...extractedRows
        ];

        await createAndPopulateSheet(dataWithHeaders);
    });

    // ID de la Hoja Maestra (Proporcionada por el usuario)
    const PRECIOS_SPREADSHEET_ID = '1rjRWfyGtnWFFhbI7EvGbvLBdEtSrsegb61h_10-Pnxo';

    async function createAndPopulateSheet(rows) {
        try {
            uploadBtn.disabled = true;
            uploadBtn.textContent = "Actualizando hoja...";
            log("Conectando con Google Sheets...");

            // 1. Limpiar hoja existente
            log("Limpiando datos antiguos...");
            await gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: PRECIOS_SPREADSHEET_ID,
                range: "Hoja 1!A:E", // Asumimos que la pestaña se llama "Hoja 1" y limpiamos todo
            });

            // 2. Subir nuevos datos
            log("Subiendo nuevos datos estructurados...");
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: PRECIOS_SPREADSHEET_ID,
                range: "Hoja 1!A1",
                valueInputOption: "RAW",
                resource: { values: rows }
            });

            const url = `https://docs.google.com/spreadsheets/d/${PRECIOS_SPREADSHEET_ID}/edit`;
            log(`✅ Datos actualizados exitosamente en la Hoja Maestra.`);

            const successMsg = document.createElement('div');
            successMsg.innerHTML = `✅ Éxito! <a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">Ver Hoja de Precios</a>`;
            statusLog.appendChild(successMsg);

        } catch (err) {
            console.error(err);
            log("Error al subir a Sheets: " + err.message);
            if (err.message.includes("403")) {
                log("⚠️ Error de Permisos: Asegúrate de que el usuario logueado tenga permiso de Edición en esa hoja.");
            }
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Subir Precios a Sheets";
        }
    }

    // --- 3. GESTIÓN DE PROMOCIONES ---

    function renderPromotions() {
        promotionsList.innerHTML = '';
        promotions.forEach((promo, index) => {
            const card = document.createElement('div');
            card.className = 'promo-card';
            card.innerHTML = `
                <button class="btn-danger" onclick="removePromotion(${index})">Eliminar</button>
                <div class="promo-row">
                    <div class="promo-field">
                        <label>Nombre de Promoción</label>
                        <input type="text" value="${promo.nombre}" onchange="updatePromo(${index}, 'nombre', this.value)" placeholder="Ej: Promo Invierno">
                    </div>
                    <div class="promo-field">
                        <label>Porcentaje (%)</label>
                        <input type="number" value="${promo.porcentaje}" onchange="updatePromo(${index}, 'porcentaje', this.value)" placeholder="0">
                    </div>
                    <div class="promo-field">
                        <label>Alcance</label>
                        <select onchange="updatePromo(${index}, 'alcance', this.value)">
                            <option value="total" ${promo.alcance === 'total' ? 'selected' : ''}>Sobre todo el precio</option>
                            <option value="titular" ${promo.alcance === 'titular' ? 'selected' : ''}>Solo para el titular</option>
                        </select>
                    </div>
                </div>
                <div class="promo-field">
                    <label>Observaciones</label>
                    <textarea onchange="updatePromo(${index}, 'observaciones', this.value)" placeholder="Detalles adicionales...">${promo.observaciones || ''}</textarea>
                </div>
            `;
            promotionsList.appendChild(card);
        });
    }

    window.updatePromo = (index, field, value) => {
        promotions[index][field] = value;
    };

    window.removePromotion = (index) => {
        promotions.splice(index, 1);
        renderPromotions();
    };

    addPromoBtn.addEventListener('click', () => {
        promotions.push({
            nombre: '',
            porcentaje: 0,
            alcance: 'total',
            observaciones: ''
        });
        renderPromotions();
    });

    savePromosBtn.addEventListener('click', async () => {
        try {
            savePromosBtn.disabled = true;
            savePromosBtn.textContent = "Guardando...";

            const rows = [
                ["NOMBRE", "PORCENTAJE", "ALCANCE", "OBSERVACIONES"],
                ...promotions.map(p => [p.nombre, p.porcentaje, p.alcance, p.observaciones])
            ];

            await updatePromotionsSheet(rows);
            alert("Promociones guardadas correctamente.");
        } catch (err) {
            console.error(err);
            alert("Error al guardar promociones: " + err.message);
        } finally {
            savePromosBtn.disabled = false;
            savePromosBtn.textContent = "Guardar Promociones en Sheets";
        }
    });

    async function fetchPromotions() {
        try {
            log("Cargando promociones desde Sheets...");
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: PRECIOS_SPREADSHEET_ID,
                range: "Promociones!A2:D",
            });

            const rows = response.result.values;
            if (rows && rows.length > 0) {
                promotions = rows.map(row => ({
                    nombre: row[0] || '',
                    porcentaje: row[1] || 0,
                    alcance: row[2] || 'total',
                    observaciones: row[3] || ''
                }));
                log(`✅ Se cargaron ${promotions.length} promociones.`);
            } else {
                log("No se encontraron promociones guardadas.");
                promotions = [];
            }
            renderPromotions();
        } catch (err) {
            console.error("Error al cargar promociones:", err);
            log("Aviso: No se pudo cargar la pestaña 'Promociones'. Se creará al guardar.");
        }
    }

    async function updatePromotionsSheet(rows) {
        // Primero intentamos asegurar que la pestaña existe
        try {
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: PRECIOS_SPREADSHEET_ID,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: { title: "Promociones" }
                        }
                    }]
                }
            });
            log("Creada nueva pestaña 'Promociones'");
        } catch (err) {
            // Si ya existe dará error, lo ignoramos
        }

        // Limpiar
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: PRECIOS_SPREADSHEET_ID,
            range: "Promociones!A:D",
        });

        // Actualizar
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: PRECIOS_SPREADSHEET_ID,
            range: "Promociones!A1",
            valueInputOption: "RAW",
            resource: { values: rows }
        });
    }


    // --- 2. Manejo de Archivos ---

    // --- 2. Manejo de Archivos ---

    pdfInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            fileInfo.textContent = `${files.length} archivo(s) seleccionado(s)`;
            processBtn.disabled = false;
        } else {
            fileInfo.textContent = '';
            processBtn.disabled = true;
        }
    });

    processBtn.addEventListener('click', async () => {
        const files = pdfInput.files;
        if (!files || files.length === 0) return;

        log("Iniciando procesamiento...");
        processBtn.disabled = true;
        processBtn.textContent = "Procesando...";
        statusLog.innerHTML = '';
        extractedRows = []; // Reset global extracted rows

        try {
            // Iterar sobre cada archivo seleccionado (Procesamiento Paralelo)
            log(`🚀 Iniciando procesamiento concurrente de ${files.length} archivos...`);

            const processPromises = Array.from(files).map(async (file, i) => {
                log(`⏳ [${i + 1}/${files.length}] Analizando: ${file.name}`);

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

                const rawFileRows = await parsePdfToRawTable(pdf, file.name);

                // TRANSFORMACIÓN A CSV ESTRUCTURADO
                const structuredRows = transformRawToStructured(rawFileRows, file.name);

                log(`✅ [${i + 1}/${files.length}] Listo: ${file.name} (${structuredRows.length} filas)`);
                return structuredRows;
            });

            const results = await Promise.all(processPromises);

            // Aplanar resultados y agregar a la lista principal
            results.forEach(rows => {
                extractedRows = extractedRows.concat(rows);
            });

            // --- DEDUPLICACIÓN ---
            // Evitar duplicados mismos datos (clave: Region + Tipo + Plan + Edad)
            const uniqueRows = [];
            const seenKeys = new Set();

            extractedRows.forEach(row => {
                const key = `${row[0]}|${row[1]}|${row[2]}|${row[3]}`;
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueRows.push(row);
                }
            });
            extractedRows = uniqueRows; // Actualizamos la lista principal con los únicos

            // AGREGAR ENCABEZADOS PARA LA DB
            const dataToUpload = [
                ["REGION", "TIPO_PLAN", "PLAN", "EDAD_CATEGORIA", "PRECIO"],
                ...extractedRows
            ];

            log(`✂️ Deduplicación: ${extractedRows.length} registros únicos finales.`);

            if (extractedRows.length > 0) {
                renderPreviewTable(extractedRows);
                previewSection.classList.remove('hidden');

                if (authStatus.textContent.includes("Autenticado")) {
                    uploadBtn.disabled = false;
                }
                log(`✅ Completado. Listos para subir ${extractedRows.length} registros a DB.`);
            } else {
                log("⚠️ No se pudo extraer información estructurada.");
            }

        } catch (error) {
            console.error(error);
            log("Error procesando PDF: " + error.message);
        } finally {
            processBtn.disabled = false;
            processBtn.textContent = "Procesar PDF(s)";
        }
    });

    // --- 3. Lógica de Parsing (PDF.js) -> Raw Table ---

    async function parsePdfToRawTable(pdf, filename) {
        const allRows = [];
        const BATCH_SIZE = 50;

        for (let i = 1; i <= pdf.numPages; i += BATCH_SIZE) {
            const batchPromises = [];
            const limit = Math.min(i + BATCH_SIZE, pdf.numPages + 1);

            for (let j = i; j < limit; j++) {
                batchPromises.push((async () => {
                    const page = await pdf.getPage(j);
                    const textContent = await page.getTextContent();
                    if (textContent.items.length === 0) return [];

                    const items = textContent.items.map(item => ({
                        str: item.str,
                        x: item.transform[4],
                        y: item.transform[5],
                        h: item.height,
                        w: item.width
                    }));

                    const rows = [];
                    const groupedRows = groupItemsByRow(items);
                    groupedRows.forEach(rowItems => {
                        rowItems.sort((a, b) => a.x - b.x);
                        const rowData = rowItems.map(item => item.str.trim()).filter(s => s.length > 0);
                        if (rowData.length > 0) rows.push(rowData);
                    });
                    return rows;
                })());
            }

            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach(pageRows => {
                if (pageRows && pageRows.length > 0) allRows.push(...pageRows);
            });
        }

        return allRows;
    }

    // --- NUEVA LÓGICA: Transformación a Estructura DB ---

    function transformRawToStructured(rawRows, filename) {
        const output = [];

        // 1. Detectar Región por Nombre de Archivo
        const region = getRegionFromFilename(filename);

        // 2. Variables de Contexto de página
        let currentPlanType = "DIRECTO"; // Default si no se encuentra
        let headerRowIndex = -1;
        let planColumns = []; // Map: index -> planName (S1, SMG02, etc.)

        // 3. Escanear filas
        for (let i = 0; i < rawRows.length; i++) {
            const row = rawRows[i];
            // Normalizamos texto (sacamos acentos) para detectar "DERIVACION" aunque venga como "DERIVACIÓN"
            const rowStr = row.join(" ").toUpperCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // A) Detectar Tipo de Plan (Header Context)
            // Lógica estricta para coincidir con precios.js (CON_IVA o DERIVACION)

            // "Directos AMBA - Precios sin I.V.A." -> En realidad la calculadora usa CON_IVA para todo lo directo.
            // Si el PDF dice "Sin I.V.A", asumiremos que es la base para CON_IVA.

            if (rowStr.includes("DIRECTO") || rowStr.includes("CON I.V.A") || rowStr.includes("CON IVA")) {
                currentPlanType = "CON_IVA";
            }

            if (rowStr.includes("DERIVADO") || rowStr.includes("DERIVACION") || rowStr.includes("APORTES")) {
                currentPlanType = "DERIVACION";
            }

            // EXCLUSIÓN EXPLÍCITA: Si dice "SIN IVA", ignoramos esta sección
            if (rowStr.includes("SIN I.V.A") || rowStr.includes("SIN IVA")) {
                currentPlanType = null;
            }

            // Nota: "Derivación Directa" contiene "DERIVACION", así que caerá correctamente en el segundo if.

            // B) Detectar Header de Tabla (donde están los planes S1, S2, etc)
            // Buscamos una fila que tenga "S1" o "SMG20" o "EDAD"
            const isHeader = row.some(cell => /^S\d+/i.test(cell) || /^SMG\d+/i.test(cell) || cell.toUpperCase() === "EDAD");

            if (isHeader) {
                headerRowIndex = i;
                // Mapear columnas
                planColumns = [];
                row.forEach((cell, idx) => {
                    const cleanCell = cell.replace(/\s/g, "").toUpperCase();
                    // Guardamos si parece un plan válido o es la columna de edad
                    // Asumimos que las columnas de planes empiezan en un índice > 0 generalmente
                    planColumns[idx] = cleanCell;
                });
                continue; // Pasamos a la siguiente fila (data)
            }

            // C) Procesar Filas de Datos (solo si ya tenemos header)
            if (headerRowIndex !== -1 && planColumns.length > 0) {
                // Heurística: La primera celda suele ser la EDAD ("Hasta 25", "26 a 30", etc.)
                const ageCell = row[0]; // Asumimos columna 0 es Edad

                // Heurística de Validación de Fila de Datos
                // 1. Debe tener celda de EDAD válida (evitar títulos que se cuelan)
                // "Directos AMBA" no tiene "años" ni "Hijo"
                const isValidAgeRow = ageCell && (ageCell.includes("años") || ageCell.includes("Hijo") || ageCell.includes("Desde") || ageCell.includes("Hasta"));

                // 2. Validar que sea una fila de precios (debe tener números grandes)
                const hasNumbers = row.some(c => /\d{3,}/.test(c));

                if (isValidAgeRow && hasNumbers) {
                    // Iterar por las columnas de precios
                    for (let col = 1; col < row.length; col++) {
                        const planName = planColumns[col];
                        const priceRaw = row[col];

                        // Si tenemos nombre de plan y precio, y el plan no es "EDAD"
                        // Y tenemos un Tipo de Plan válido (no ignorado)
                        if (planName && planName !== "EDAD" && priceRaw && currentPlanType) {

                            // Limpiar precio: sacar puntos, signos, dejar solo numero
                            // Cuidado con decimales si los hubiera, pero en ARS suelen ser enteros con separador de miles '.'
                            // La calculadora espera enteros puros
                            /* 
                               Ej: "149.665" -> 149665
                               Ej: "$ 149.665" -> 149665
                            */
                            const priceClean = priceRaw.replace(/[^0-9]/g, '');

                            if (priceClean.length > 0) {
                                // Normalizamos la llave de edad para que coincida con precios.js
                                const normalizedAge = normalizeAgeKey(ageCell);

                                output.push([
                                    region,                         // REGION
                                    currentPlanType,                // TIPO_PLAN
                                    planName,                       // PLAN
                                    normalizedAge,                  // EDAD_CATEGORIA (35, 40, hijo1, etc)
                                    priceClean                      // PRECIO
                                ]);
                            }
                        }
                    }
                }
            }
        }

        return output;
    }

    function groupItemsByRow(items) {
        items.sort((a, b) => b.y - a.y);
        const rows = [];
        const TOLERANCE = 8;
        let currentRow = [];
        let currentY = -Infinity;

        items.forEach(item => {
            if (currentY === -Infinity || Math.abs(item.y - currentY) > TOLERANCE) {
                if (currentRow.length > 0) rows.push(currentRow);
                currentRow = [item];
                currentY = item.y;
            } else {
                currentRow.push(item);
            }
        });
        if (currentRow.length > 0) rows.push(currentRow);
        return rows;
    }

    // --- 4. Renderizado de Tabla PREVIEW (Estructurada) ---

    function renderPreviewTable(rows) {
        tableHeader.innerHTML = `
            <th>REGIÓN</th>
            <th>TIPO PLAN</th>
            <th>PLAN</th>
            <th>EDAD</th>
            <th>PRECIO</th>
        `;
        tableBody.innerHTML = '';

        // Mostrar primeras 100 filas
        const previewRows = rows.slice(0, 100);

        previewRows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });

        if (rows.length > 100) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" style="text-align: center; color: #666;">... y ${rows.length - 100} registros más ...</td>`;
            tableBody.appendChild(tr);
        }
    }

    // --- 6. Helper: Detección de Región por Filename ---

    function getRegionFromFilename(filename) {
        // 1. Normalizar: minusculas, sin acentos, solo alfanumerico
        // Ejemplo: "Lista-de-precios...Bs.As_.-Interior-Sta.Fe_" -> "listadeprecios...bsasinteriorstafe"
        const normalized = filename.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .replace(/[^a-z0-9]/g, ""); // Eliminar todo lo que no sea letra o numero

        // 2. Mapeo por Prioridad de Palabras Clave

        // A) AMBA
        if (normalized.includes("amba")) return "AMBA";

        // B) CORDOBA (Prioridad antes que el grupo grande si viniera junto, aunque la idea es separarlos)
        // Keywords: cordoba, cba
        if (normalized.includes("cordoba") || normalized.includes("cba")) {
            return "CORDOBA";
        }

        // C) TIERRA DEL FUEGO
        // Keywords: tierra, tdf
        if (normalized.includes("tierra") || normalized.includes("tdf")) {
            return "TIERRA_DEL_FUEGO";
        }

        // D) BS. AS. + SANTA FE
        // Keywords: bsas, santafe, stafe
        if (normalized.includes("bsas") ||
            normalized.includes("santafe") ||
            normalized.includes("stafe")) {
            return "BSAS_SF";
        }

        // E) PATAGONIA + SALTA
        // Keywords: patagonia, salta, neuquen, rionegro, chubut, santacruz
        // Quitamos "tierra" de aquí
        if (normalized.includes("patagonia") ||
            normalized.includes("salta") ||
            normalized.includes("neuquen") ||
            normalized.includes("rionegro") ||
            normalized.includes("chubut") ||
            normalized.includes("santacruz")) {
            return "PATAGONIA_SALTA";
        }

        // D) RESTO DEL PAIS (INTERIOR)
        // Por descarte o exlicito "resto"
        return "INTERIOR";
    }

    // --- 7. Helper: Normalización de Llaves de Edad para Calculadora ---

    function normalizeAgeKey(ageStr) {
        const clean = ageStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (clean.includes("hijo") && (clean.includes("1") || clean.includes("primer"))) return "hijo1";
        if (clean.includes("hijo") && (clean.includes("adicional") || clean.includes("otro"))) return "hijoAdd";

        // Extraer números si los hay
        const match = clean.match(/\d+/);
        if (!match) return "99"; // Fallback

        const num = parseInt(match[0]);
        if (num <= 35) return "35";
        if (num <= 40) return "40";
        if (num <= 45) return "45";
        if (num <= 50) return "50";
        if (num <= 55) return "55";
        if (num <= 60) return "60";
        return "99";
    }

    // --- 5. Utilidades ---

    function log(msg) {
        statusLog.classList.add('active');
        const div = document.createElement('div');
        div.textContent = `> ${msg}`;
        statusLog.appendChild(div);
        statusLog.scrollTop = statusLog.scrollHeight;
    }

});
