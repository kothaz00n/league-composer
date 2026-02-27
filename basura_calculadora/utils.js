class Utils {
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static escapeCSV(field) {
        if (typeof field !== 'string') field = String(field || '');
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    }
}

class StorageManager {
    static KEY = 'msg_parser_data';

    static save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    }

    static load() {
        const saved = localStorage.getItem(this.KEY);
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading from storage:', e);
            return null;
        }
    }
}
