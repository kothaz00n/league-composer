// --- CONSTANTES ---
const TIPO_PLAN_DERIVACION = 'DERIVACION';
const TIPO_PLAN_CON_IVA = 'CON_IVA';
const REGION_AMBA = 'AMBA';
const CAT_HIJO_1 = 'hijo1';
const CAT_HIJO_ADD = 'hijoAdd';

document.addEventListener('DOMContentLoaded', () => {
    const calcForm = document.getElementById('calcForm');
    const regionSelect = document.getElementById('region');
    const tipoPlanSelect = document.getElementById('tipoPlan');
    const planSelect = document.getElementById('plan');
    const tienePareja = document.getElementById('tienePareja');
    const tieneHijos = document.getElementById('tieneHijos');
    const seccionPareja = document.getElementById('seccionPareja');
    const seccionHijos = document.getElementById('seccionHijos');
    const addHijoBtn = document.getElementById('addHijoBtn');
    const listaHijos = document.getElementById('listaHijos');
    const resultadoCalculo = document.getElementById('resultadoCalculo');
    const resumenContent = document.getElementById('resumenContent');
    const seccionSueldo = document.getElementById('seccionSueldo');

    // --- LOGICA DE CARGA DINÁMICA (Google Sheets) ---
    // URL del CSV (Usamos el link de publicación oficial para evitar CORS)
    const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjjPNCCGg89-Cwq8FAIT_Uwb5O1II39Wb35F63JIwGrZPKy4inLFeHO5RBWxjMzMJnsudW8xFLDZY7/pub?output=csv";

    async function loadPricesFromCSV() {
        if (!SHEET_CSV_URL) return;

        try {
            const response = await fetch(SHEET_CSV_URL);
            if (!response.ok) throw new Error("Network response was not ok");
            const csvText = await response.text();

            // Parsear CSV a la estructura de PRECIOS_DATA
            // Google Sheets suele devolver CSV con comillas: "REGION","TIPO_PLAN",...
            const rows = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
            const dataRows = rows.slice(1);

            dataRows.forEach(line => {
                // Split básico que quita comillas si existen
                const row = line.split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim());
                if (row.length < 5) return;

                const [region, tipo, plan, edadKey, precioStr] = row;
                const precio = parseFloat(precioStr);

                if (!PRECIOS_DATA[region]) return;
                if (!PRECIOS_DATA[region].tipos[tipo]) return;

                const typeData = PRECIOS_DATA[region].tipos[tipo];

                // Asegurar que existe el array de tarifas para esa edad
                if (!typeData.tarifas[edadKey]) {
                    // Si es una edad nueva no prevista en precios.js, habría que inicializarla
                    // Pero necesitamos saber el orden de los planes.
                    return;
                }

                // Encontrar índice del plan
                const planIndex = typeData.planes.indexOf(plan);
                if (planIndex !== -1) {
                    typeData.tarifas[edadKey][planIndex] = precio;
                }
            });

            console.log("Precios actualizados desde Google Sheet");
            updatePlanes(); // Refrescar UI con nuevos datos

        } catch (error) {
            console.error("Error cargando precios de Sheet:", error);
            // Fallback silencioso a precios.js
        }
    }

    // Intentar cargar al inicio
    loadPricesFromCSV();

    // Actualizar planes según región y tipo
    function updatePlanes() {
        const region = regionSelect.value;
        const tipo = tipoPlanSelect.value;

        // Limpiar planes
        planSelect.innerHTML = '<option value="" disabled selected>Selecciona un plan</option>';

        if (region && tipo) {
            const dataRegion = PRECIOS_DATA[region];
            if (dataRegion && dataRegion.tipos[tipo]) {
                const planes = dataRegion.tipos[tipo].planes;
                planes.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p;
                    option.textContent = p;
                    planSelect.appendChild(option);
                });
                planSelect.disabled = false;
            }
        } else {
            planSelect.disabled = true;
        }
    }

    regionSelect.addEventListener('change', updatePlanes);
    tipoPlanSelect.addEventListener('change', updatePlanes);

    const esMonotributistaCheck = document.getElementById('esMonotributista');
    const esZonaEspecialCheck = document.getElementById('esZonaEspecial');
    const esPromo15Check = document.getElementById('esPromo15');
    const discountChecks = [esMonotributistaCheck, esZonaEspecialCheck, esPromo15Check];

    function handleExclusion(activeCheck) {
        if (activeCheck.checked) {
            discountChecks.forEach(check => {
                if (check !== activeCheck) {
                    check.disabled = true;
                    check.checked = false;
                    check.closest('.toggle-group').classList.add('disabled');
                    toggleLegend(check.id);
                }
            });
        } else {
            discountChecks.forEach(check => {
                check.disabled = false;
                check.closest('.toggle-group').classList.remove('disabled');
            });
        }
    }

    function updateSueldoVisibility() {
        const target = document.getElementById('seccionSueldo');
        if (!target) return;

        const isDerivacion = tipoPlanSelect.value === TIPO_PLAN_DERIVACION;
        const isMonotributista = esMonotributistaCheck.checked;

        // El sueldo SOLO se muestra en Derivación y SI NO es monotributista
        const shouldShow = isDerivacion && !isMonotributista;

        target.classList.toggle('hidden', !shouldShow);
        target.style.display = shouldShow ? 'flex' : 'none';

        if (!shouldShow) {
            const sueldoInput = document.getElementById('sueldo');
            if (sueldoInput) sueldoInput.value = '';
        }
    }

    esMonotributistaCheck.addEventListener('change', () => {
        if (esMonotributistaCheck.checked) {
            tipoPlanSelect.value = TIPO_PLAN_CON_IVA;
            tipoPlanSelect.disabled = true; // Bloquear tipo de plan si es monotributista
        } else {
            tipoPlanSelect.disabled = false;
        }

        // Sincronizar planes y visibilidad
        updatePlanes();
        updateSueldoVisibility();

        toggleLegend('esMonotributista');
        handleExclusion(esMonotributistaCheck);
    });

    esZonaEspecialCheck.addEventListener('change', () => {
        if (esZonaEspecialCheck.checked) {
            regionSelect.value = REGION_AMBA;
            updatePlanes();
        }
        toggleLegend('esZonaEspecial');
        handleExclusion(esZonaEspecialCheck);
    });

    esPromo15Check.addEventListener('change', () => {
        toggleLegend('esPromo15');
        handleExclusion(esPromo15Check);
    });


    // Mostrar campo de sueldo automáticamente si es Derivación Directa
    tipoPlanSelect.addEventListener('change', updateSueldoVisibility);

    function toggleLegend(id) {
        const checkbox = document.getElementById(id);
        const legend = document.getElementById(`legend-${id}`);
        if (checkbox && legend) {
            if (checkbox.checked) {
                legend.classList.remove('hidden');
            } else {
                legend.classList.add('hidden');
            }
        }
    }

    const edadParejaRow = document.getElementById('edadPareja');

    // Toggle pareja
    tienePareja.addEventListener('change', () => {
        if (tienePareja.checked) {
            seccionPareja.classList.remove('hidden');
            edadParejaRow.required = true;
        } else {
            seccionPareja.classList.add('hidden');
            edadParejaRow.required = false;
            edadParejaRow.value = '';
        }
    });

    // Toggle hijos
    tieneHijos.addEventListener('change', () => {
        if (tieneHijos.checked) {
            seccionHijos.classList.remove('hidden');
            if (listaHijos.children.length === 0) {
                addHijoInput();
            }
        } else {
            seccionHijos.classList.add('hidden');
            listaHijos.innerHTML = '';
        }
    });

    // Agregar hijo
    addHijoBtn.addEventListener('click', () => {
        addHijoInput();
    });

    function addHijoInput() {
        const div = document.createElement('div');
        div.className = 'hijo-item';
        div.innerHTML = `
            <input type="number" class="message-input hijo-edad" placeholder="Edad" min="0" max="100" required>
            <button type="button" class="btn-remove" title="Eliminar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;

        div.querySelector('.btn-remove').addEventListener('click', () => {
            div.remove();
            if (listaHijos.children.length === 0) {
                tieneHijos.checked = false;
                seccionHijos.classList.add('hidden');
            }
        });

        listaHijos.appendChild(div);
    }

    // Formatear moneda
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    }

    // Calcular/Submit
    calcForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const region = regionSelect.value;
        const tipo = tipoPlanSelect.value;
        const plan = planSelect.value;
        const titularNombre = document.getElementById('titular').value;
        const edadTitular = parseInt(document.getElementById('edad').value);
        const pareja = tienePareja.checked;
        const edadPareja = pareja ? parseInt(document.getElementById('edadPareja').value) : null;
        const hijos = Array.from(document.querySelectorAll('.hijo-edad')).map(input => parseInt(input.value));

        const esMonotributista = document.getElementById('esMonotributista').checked;
        const esZonaEspecial = document.getElementById('esZonaEspecial').checked;
        const esPromo15 = document.getElementById('esPromo15').checked;

        // Determinar la campaña activa
        let campaignActiva = CAMPAIGNS.TRADICIONAL;
        let campaignName = "Venta Tradicional";
        if (esMonotributista) {
            campaignActiva = CAMPAIGNS.MONOTRIBUTO;
            campaignName = "Campaña Monotributo (25%)";
        } else if (esZonaEspecial) {
            campaignActiva = CAMPAIGNS.NORDELTA;
            campaignName = "Campaña Nordelta (25%)";
        } else if (esPromo15) {
            campaignActiva = CAMPAIGNS.PROMO_15;
            campaignName = "Campaña 15% Bienvenida";
        }

        const subaccount = getSubaccount(region, campaignActiva, plan);

        function calcularPrecioMiembro(edad, esHijo, indexHijo = 0) {
            let precioBase = 0;
            let precioFinal = 0;
            let descName = "";
            let descPct = 0;
            let label = "";

            if (esHijo && edad <= 25) {
                const tipoHijo = indexHijo === 0 ? CAT_HIJO_1 : CAT_HIJO_ADD;
                precioBase = getPrecio(region, tipo, plan, tipoHijo);
                label = `Hijo ${indexHijo + 1} (${edad} años)`;
            } else {
                precioBase = getPrecio(region, tipo, plan, edad);
                if (esHijo) label = `Hijo ${indexHijo + 1} (${edad} años) - Cat. Adulto`;
                else label = indexHijo === -1 ? `Titular (${edad} años)` : `Pareja (${edad} años)`;
            }

            // Aplicar descuentos según la campaña seleccionada
            if (campaignActiva === CAMPAIGNS.MONOTRIBUTO) {
                descPct = 0.25;
                descName = "25% Promo Monotributo";
            } else if (campaignActiva === CAMPAIGNS.NORDELTA) {
                if (edad < 26) {
                    descPct = 0.50;
                    descName = "50% Promo Jóvenes (hasta 26 años)";
                } else {
                    descPct = 0.25;
                    descName = "25% Promo Nordelta";
                }
            } else if (campaignActiva === CAMPAIGNS.PROMO_15) {
                if (edad < 26) {
                    descPct = 0.50;
                    descName = "50% Promo Jóvenes (hasta 26 años)";
                } else {
                    descPct = 0.15;
                    descName = "15% Promo Bienvenida";
                }
            } else {
                // Tradicional
                if (edad < 26) {
                    descPct = 0.50;
                    descName = "50% Promo Jóvenes (hasta 26 años)";
                } else {
                    descPct = 0;
                    descName = "Precio de Lista";
                }
            }

            precioFinal = precioBase * (1 - descPct);
            return { precioBase, precioFinal, descPct: descPct * 100, descName, label };
        }

        // Calcular integrantes
        const integrantes = [];
        integrantes.push(calcularPrecioMiembro(edadTitular, false, -1));

        if (pareja) {
            integrantes.push(calcularPrecioMiembro(edadPareja, false, -2));
        }

        hijos.forEach((edadHijo, index) => {
            integrantes.push(calcularPrecioMiembro(edadHijo, true, index));
        });

        let total = 0;
        let resumenHtml = `
            <div class="resumen-header-info">
                <div class="resumen-campaign-badge">${campaignName}</div>
                <div class="resumen-subaccount">Subcuenta: <strong>${subaccount}</strong></div>
            </div>
            <div class="resumen-section-header">Desglose de Costos</div>
        `;

        integrantes.forEach(ing => {
            total += ing.precioFinal;
            resumenHtml += `
                <div class="resumen-item">
                    <div class="resumen-info">
                        <span class="resumen-label">${ing.label}</span>
                        <span class="resumen-sublabel">${ing.descName}</span>
                    </div>
                    <div class="resumen-price-block">
                        <span class="resumen-base-price">${formatCurrency(ing.precioBase)}</span>
                        <span class="resumen-value">${formatCurrency(ing.precioFinal)}</span>
                    </div>
                </div>
            `;
        });

        // Calcular aporte por relación de dependencia (solo para Derivación Directa)
        let aporteDescuento = 0;

        if (tipo === TIPO_PLAN_DERIVACION) {
            const sueldo = parseFloat(document.getElementById('sueldo').value);
            if (sueldo && sueldo > 0) {
                aporteDescuento = AportesCalculator.calcularAporte(sueldo);
                resumenHtml += `
                    <div class="resumen-item" style="border-top: 2px dashed var(--border-color); margin-top: var(--spacing-md); padding-top: var(--spacing-md);">
                        <div class="resumen-info">
                            <span class="resumen-label">💼 Descuento Relación de Dependencia</span>
                            <span class="resumen-sublabel">Aporte sobre sueldo de ${formatCurrency(sueldo)}</span>
                        </div>
                        <div class="resumen-price-block">
                            <span class="resumen-value" style="color: var(--success-color);">-${formatCurrency(aporteDescuento)}</span>
                        </div>
                    </div>
                `;
            }
        }

        // Aplicar descuento de aporte al total
        const totalFinal = total - aporteDescuento;

        // Nota al pie según la campaña
        let notaCampaña = "";
        if (campaignActiva === CAMPAIGNS.MONOTRIBUTO) notaCampaña = "SMMP-Monotributistas Descuento 25% + Form 184";
        else if (campaignActiva === CAMPAIGNS.NORDELTA) notaCampaña = `SMMP-Nordelta ${integrantes.some(i => i.descPct === 50) ? "25%+50% para Menores" : "25%"}`;
        else if (campaignActiva === CAMPAIGNS.PROMO_15) notaCampaña = `SMMP-Descuento ${integrantes.some(i => i.descPct === 50) ? "15%+50% para Menores" : "15%"}`;

        resumenHtml += `
            <div class="resumen-total">
                <span class="total-label">TOTAL MENSUAL:</span>
                <span class="total-value">${formatCurrency(totalFinal)}</span>
            </div>
            
            ${notaCampaña ? `<div class="resumen-note">📝 <strong>Nota:</strong> ${notaCampaña}</div>` : ''}

            <div class="calculo-leyenda">
                <div class="leyenda-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Puntos importantes:
                </div>
                <ul class="leyenda-list">
                    <li>✅ <strong>50% siempre obligatorio:</strong> Excepto en Monotributo.</li>
                    <li>✅ <strong>Solo una campaña:</strong> No son acumulables entre sí.</li>
                    <li>✅ <strong>Solo altas totales:</strong> No aplica para inclusiones de socios.</li>
                    <li>📋 <strong>Monotributo:</strong> Es la única que NO da 50% a menores (aplica 25% lineal).</li>
                    <li>📋 <strong>Nordelta:</strong> Solo para residentes verificados de Tigre, Pilar o Escobar.</li>
                </ul>
            </div>
        `;

        resumenContent.innerHTML = resumenHtml;
        resultadoCalculo.classList.remove('hidden');

        // Scroll to results
        resultadoCalculo.scrollIntoView({ behavior: 'smooth' });
    });

    // Inicializar planes y visibilidad
    updatePlanes();
    updateSueldoVisibility();
});
