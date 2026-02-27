class Parser {
    static parse(rawText) {
        if (!rawText.trim()) return [];

        const seenPhones = new Set();
        const lines = rawText.split('\n').filter(line => line.trim());

        // Detect most likely delimiter
        const delimiter = this.detectDelimiter(lines);

        // Pre-process text: Join lines that don't look like new records
        const processedLines = [];
        let currentLine = "";

        lines.forEach(line => {
            // Check if this line looks like a new record start
            const isNewRecord = this.isNewRecordStart(line, delimiter);

            if (isNewRecord && currentLine) {
                processedLines.push(currentLine);
                currentLine = line;
            } else if (!currentLine) {
                currentLine = line;
            } else {
                // Stitch with the detected delimiter
                currentLine += (delimiter === 'auto-space' ? '\t' : delimiter) + line;
            }
        });
        if (currentLine) processedLines.push(currentLine);

        return processedLines.map((line) => {
            let fields = [];
            if (delimiter === 'auto-space') {
                fields = line.split(/\t|\s{2,}/);
            } else {
                fields = this.splitCSV(line, delimiter);
            }

            // Clean up fields but KEEP empty ones to avoid column shifting
            fields = fields.map(field => field.trim());

            const record = {
                id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
                nombre: fields[0] || '',
                email: this.findField(fields, 'email') || fields[1] || '',
                ubicacion: fields[2] || '',
                telefono1: fields[3] || '',
                telefono2: fields[4] || '',
                plan: this.formatPlan(fields[5] || ''),
                ingresos: this.formatIngresos(fields[6] || ''),
                edad: this.formatEdad(fields[7] || '')
            };

            // Detect duplicates and extract info
            record.phoneInfo1 = this.extractPhoneInfo(record.telefono1, seenPhones);
            record.phoneInfo2 = this.extractPhoneInfo(record.telefono2, seenPhones);

            return record;
        });
    }

    static detectDelimiter(lines) {
        const samples = lines.slice(0, 5);
        const counts = {
            '\t': 0,
            ';': 0,
            ',': 0
        };

        samples.forEach(line => {
            Object.keys(counts).forEach(del => {
                counts[del] += (line.split(del).length - 1);
            });
        });

        const best = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a);
        return best[1] > 2 ? best[0] : 'auto-space';
    }

    static isNewRecordStart(line, delimiter) {
        if (delimiter === 'auto-space') {
            const tabs = (line.match(/\t/g) || []).length;
            const spaces = (line.match(/\s{2,}/g) || []).length;
            return (tabs + spaces >= 2);
        }
        return line.includes(delimiter);
    }

    static splitCSV(line, delimiter) {
        // Optimized CSV splitting using a single-pass slice loop.
        // This avoids creating intermediate arrays and strings for parts, and minimizes allocations.
        if (!line) return [''];

        // Fast path: simple split if no quotes are present
        if (line.indexOf('"') === -1) {
            return line.split(delimiter);
        }

        const result = [];
        let inQuotes = false;
        let current = '';
        let lastIndex = 0;
        const len = line.length;

        for (let i = 0; i < len; i++) {
            const char = line[i];
            if (char === '"') {
                if (i > lastIndex) {
                    current += line.substring(lastIndex, i);
                }
                inQuotes = !inQuotes;
                lastIndex = i + 1; // Skip the quote
            } else if (char === delimiter && !inQuotes) {
                if (i > lastIndex) {
                    current += line.substring(lastIndex, i);
                }
                result.push(current);
                current = '';
                lastIndex = i + 1; // Skip the delimiter
            }
        }

        // Add the last segment
        if (lastIndex < len) {
            current += line.substring(lastIndex);
        }
        result.push(current);

        return result;
    }

    static findField(fields, type) {
        if (type === 'email') {
            return fields.find(f => f.includes('@') && f.includes('.'));
        }
        return null;
    }

    static extractPhoneInfo(phoneStr, seenPhones) {
        if (!phoneStr) return { type: 'empty' };

        // Clean to just digits
        const clean = phoneStr.replace(/[^\d]/g, '');

        // If it's just text (no digits)
        if (!clean && phoneStr.trim()) {
            return { type: 'text', text: phoneStr.trim() };
        }

        // If it looks like a number
        if (clean.length >= 6) {
            const isDuplicate = seenPhones.has(clean);
            if (!isDuplicate) {
                seenPhones.add(clean);
            }

            // Detect REAL extra text (exclude digits and common separators)
            const textPart = phoneStr
                .replace(/\d/g, '')
                .replace(/[-\(\)\+\/\s\.]/g, '') // Ignore common separators, spaces and dots
                .trim();

            // If textPart is not empty, we have real extra text
            const extraText = textPart ? phoneStr.replace(/\d/g, '').replace(/[-\(\)\+\/\.]/g, ' ').trim() : '';

            return {
                type: 'number',
                number: clean,
                original: phoneStr,
                isDuplicate: isDuplicate,
                extraText: extraText
            };
        }

        return { type: 'text', text: phoneStr.trim() };
    }

    static formatPlan(plan) {
        return plan
            .replace(/plan_cobertura_/g, '')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    static formatIngresos(ingresos) {
        return ingresos.replace(/_/g, ' ');
    }

    static formatEdad(edad) {
        return edad.replace(/_/g, '-') + (edad ? ' años' : '');
    }
}
