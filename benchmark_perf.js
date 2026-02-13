
// benchmark_perf.js

const { performance } = require('perf_hooks');

// CONFIGURATION
const NUM_FILES = 10;
const PROCESSING_DELAY_MS = 100; // Simulated work per file

// MOCKS
const files = Array.from({ length: NUM_FILES }, (_, i) => ({
    name: `file_${i + 1}.pdf`,
    arrayBuffer: async () => new ArrayBuffer(8)
}));

const pdfjsLib = {
    getDocument: (buffer) => ({
        promise: Promise.resolve({
            numPages: 5,
            getPage: async (i) => ({
                getTextContent: async () => ({ items: [] })
            })
        })
    })
};

// Simulated parsePdfToRawTable with delay
async function parsePdfToRawTable(pdf, filename) {
    return new Promise(resolve => setTimeout(() => resolve([]), PROCESSING_DELAY_MS));
}

function transformRawToStructured(raw, filename) {
    return [];
}

// SERIAL IMPLEMENTATION (Current)
async function processSerial() {
    const start = performance.now();
    let extractedRows = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // console.log(`📂 Procesando archivo ${i + 1}/${files.length}: ${file.name}`);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        // console.log(`   -> Páginas: ${pdf.numPages}`);

        const rawFileRows = await parsePdfToRawTable(pdf, file.name);

        const structuredRows = transformRawToStructured(rawFileRows, file.name);
        extractedRows = extractedRows.concat(structuredRows);

        // console.log(`   -> Filas estructuradas generadas: ${structuredRows.length}`);
    }

    const end = performance.now();
    return end - start;
}

// PARALLEL IMPLEMENTATION (Proposed)
async function processParallel() {
    const start = performance.now();

    // Simulate FileList iteration using Array.from or spread
    const fileArray = Array.from(files);

    const promises = fileArray.map(async (file, i) => {
        // console.log(`📂 Procesando archivo ${i + 1}/${files.length}: ${file.name}`);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        // console.log(`   -> Páginas: ${pdf.numPages}`);

        const rawFileRows = await parsePdfToRawTable(pdf, file.name);

        return transformRawToStructured(rawFileRows, file.name);
    });

    const results = await Promise.all(promises);
    let extractedRows = results.flat();

    const end = performance.now();
    return end - start;
}

// RUN BENCHMARK
(async () => {
    console.log(`\n--- BENCHMARK STARTED ---`);
    console.log(`Files: ${NUM_FILES}`);
    console.log(`Simulated delay per file: ${PROCESSING_DELAY_MS}ms`);

    console.log(`\nRunning Serial Processing...`);
    const serialTime = await processSerial();
    console.log(`>> Serial Time: ${serialTime.toFixed(2)}ms`);

    console.log(`\nRunning Parallel Processing...`);
    const parallelTime = await processParallel();
    console.log(`>> Parallel Time: ${parallelTime.toFixed(2)}ms`);

    const speedup = serialTime / parallelTime;
    console.log(`\n--- RESULTS ---`);
    console.log(`Speedup: ${speedup.toFixed(2)}x`);

    if (speedup > 1.5) {
        console.log(`✅ Success: Parallel processing is significantly faster.`);
    } else {
        console.log(`⚠️ Warning: No significant speedup observed.`);
    }
})();
