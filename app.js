class App {
    constructor() {
        this.data = [];
        this.viewMode = 'table';
        this.theme = 'dark';
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.columnFilters = {};

        this.ui = new UIManager();
        this.initialize();
    }

    initialize() {
        this.attachEventListeners();
        this.loadState();
    }

    loadState() {
        const saved = StorageManager.load();
        if (saved) {
            if (saved.rawInput) this.ui.messageInput.value = saved.rawInput;
            this.data = saved.data || [];
            this.viewMode = saved.viewMode || 'table';
            this.theme = saved.theme || 'dark';
            this.ui.setTheme(this.theme);

            if (this.data.length > 0) {
                this.prepareSearchIndex();
                this.render();
                this.populateFilterDropdowns();
            }
        }
    }

    saveState() {
        StorageManager.save({
            rawInput: this.ui.messageInput.value,
            data: this.data,
            viewMode: this.viewMode,
            theme: this.theme
        });
    }

    attachEventListeners() {
        document.getElementById('parseBtn').addEventListener('click', () => this.handleParse());
        document.getElementById('clearBtn').addEventListener('click', () => this.handleClear());
        document.getElementById('copyBtn').addEventListener('click', () => this.handleCopy());
        document.getElementById('exportBtn').addEventListener('click', () => this.handleExport());

        this.ui.viewTableBtn.addEventListener('click', () => this.switchView('table'));
        this.ui.viewCardsBtn.addEventListener('click', () => this.switchView('cards'));
        document.getElementById('themeBtn').addEventListener('click', () => this.toggleTheme());

        this.ui.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('clearSearchBtn').addEventListener('click', () => this.clearSearch());

        this.ui.messageInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') this.handleParse();
        });

        // Sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header.dataset.column));
        });

        // Global delegator for deletions (table and cards)
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                this.handleDelete(deleteBtn.dataset.id);
            }
        });
    }

    handleParse() {
        const rawText = this.ui.messageInput.value.trim();
        if (!rawText) {
            this.ui.showNotification('Por favor, pega algunos datos primero', 'error');
            return;
        }

        this.data = Parser.parse(rawText);
        this.prepareSearchIndex();
        this.render();
        this.populateFilterDropdowns();
        this.saveState();
        this.ui.showNotification(`✓ ${this.data.length} registros procesados exitosamente`);
    }

    handleClear() {
        this.data = [];
        this.columnFilters = {};
        this.ui.clearInput();
        this.saveState();
        this.ui.showNotification('Todo despejado');
    }

    handleCopy() {
        const headers = ['Nombre', 'Email', 'Ubicación', 'Teléfono 1', 'Teléfono 2', 'Plan', 'Ingresos', 'Edad'];
        const rows = [headers.join('\t')];

        this.data.forEach(r => {
            rows.push([r.nombre, r.email, r.ubicacion, r.telefono1, r.telefono2, r.plan, r.ingresos, r.edad].join('\t'));
        });

        navigator.clipboard.writeText(rows.join('\n'))
            .then(() => this.ui.showNotification('✓ Tabla copiada al portapapeles'))
            .catch(() => this.ui.showNotification('Error al copiar', 'error'));
    }

    handleExport() {
        const headers = ['Nombre', 'Email', 'Ubicación', 'Teléfono 1', 'Teléfono 2', 'Plan', 'Ingresos', 'Edad'];
        const csvRows = [headers.join(',')];

        this.data.forEach(record => {
            const row = [
                Utils.escapeCSV(record.nombre),
                Utils.escapeCSV(record.email),
                Utils.escapeCSV(record.ubicacion),
                Utils.escapeCSV(record.telefono1),
                Utils.escapeCSV(record.telefono2),
                Utils.escapeCSV(record.plan),
                Utils.escapeCSV(record.ingresos),
                Utils.escapeCSV(record.edad)
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `datos_${new Date().getTime()}.csv`;
        link.click();
        this.ui.showNotification('✓ CSV exportado');
    }

    switchView(mode) {
        this.viewMode = mode;
        this.render();
        this.saveState();
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.ui.setTheme(this.theme);
        this.saveState();
    }

    handleSearch(term) {
        this.ui.clearSearchBtn.classList.toggle('hidden', !term.trim());
        this.render();
    }

    clearSearch() {
        this.ui.searchInput.value = '';
        this.ui.clearSearchBtn.classList.add('hidden');
        this.render();
    }

    handleSort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.data.sort((a, b) => {
            let vA = String(a[column] || '').toLowerCase();
            let vB = String(b[column] || '').toLowerCase();
            if (vA < vB) return this.sortDirection === 'asc' ? -1 : 1;
            if (vA > vB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.updateSortIndicators();
        this.render();
    }

    handleDelete(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
            this.data = this.data.filter(r => r.id !== id);
            this.render();
            this.saveState();
            this.ui.showNotification('Registro eliminado');
        }
    }

    updateSortIndicators() {
        document.querySelectorAll('.sort-indicator').forEach(i => i.textContent = '');
        const active = document.querySelector(`[data-column="${this.sortColumn}"] .sort-indicator`);
        if (active) active.textContent = this.sortDirection === 'asc' ? '▲' : '▼';
    }

    handleColumnFilter(column, value) {
        if (value) this.columnFilters[column] = value;
        else delete this.columnFilters[column];
        this.render();
    }

    prepareSearchIndex() {
        this.data.forEach(record => {
            if (record._searchIndex) return;

            const fields = [
                record.nombre,
                record.email,
                record.ubicacion,
                record.telefono1,
                record.telefono2,
                record.plan,
                record.ingresos,
                record.edad
            ];

            if (record.phoneInfo1) {
                if (record.phoneInfo1.extraText) fields.push(record.phoneInfo1.extraText);
                if (record.phoneInfo1.number) fields.push(record.phoneInfo1.number);
                if (record.phoneInfo1.text) fields.push(record.phoneInfo1.text);
            }
            if (record.phoneInfo2) {
                if (record.phoneInfo2.extraText) fields.push(record.phoneInfo2.extraText);
                if (record.phoneInfo2.number) fields.push(record.phoneInfo2.number);
                if (record.phoneInfo2.text) fields.push(record.phoneInfo2.text);
            }

            const searchString = fields.join(' ').toLowerCase();

            Object.defineProperty(record, '_searchIndex', {
                value: searchString,
                enumerable: false,
                writable: true
            });
        });
    }

    getFilteredData() {
        const searchTerm = this.ui.searchInput.value.toLowerCase().trim();
        return this.data.filter(record => {
            // Search term check
            const matchesSearch = !searchTerm || (record._searchIndex && record._searchIndex.includes(searchTerm));

            // Column filters check
            const matchesFilters = Object.entries(this.columnFilters).every(([col, val]) => {
                return (record[col] || '') === val;
            });

            return matchesSearch && matchesFilters;
        });
    }

    render() {
        const filtered = this.getFilteredData();
        this.ui.renderContent(filtered, this.viewMode);

        // Update count with filter info
        if (filtered.length !== this.data.length) {
            this.ui.recordCount.textContent = `${filtered.length} de ${this.data.length} registros`;
        }
    }

    populateFilterDropdowns() {
        const columns = ['nombre', 'ubicacion', 'plan', 'ingresos', 'edad'];
        const uniqueValues = {};
        columns.forEach(col => uniqueValues[col] = new Set());

        this.data.forEach(record => {
            columns.forEach(col => {
                const val = record[col];
                if (val) uniqueValues[col].add(val);
            });
        });

        columns.forEach(column => {
            const select = document.querySelector(`.column-filter[data-column="${column}"]`);
            if (!select) return;
            const unique = [...uniqueValues[column]].sort();
            const current = this.columnFilters[column] || '';
            select.innerHTML = '<option value="">Todos</option>' +
                unique.map(v => `<option value="${v}" ${v === current ? 'selected' : ''}>${v}</option>`).join('');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
