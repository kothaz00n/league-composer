class UIManager {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        this.messageInput = document.getElementById('messageInput');
        this.resultsSection = document.getElementById('resultsSection');
        this.emptyState = document.getElementById('emptyState');
        this.tableBody = document.getElementById('tableBody');
        this.tableContainer = document.querySelector('.table-container');
        this.cardContainer = document.getElementById('cardContainer');
        this.viewTableBtn = document.getElementById('viewTableBtn');
        this.viewCardsBtn = document.getElementById('viewCardsBtn');
        this.recordCount = document.getElementById('recordCount');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
    }

    renderContent(data, viewMode = 'table') {
        if (viewMode === 'table') {
            this.renderTable(data);
        } else {
            this.renderCards(data);
        }

        this.recordCount.textContent = `${data.length} registros`;
        this.resultsSection.classList.remove('hidden');
        this.emptyState.classList.add('hidden');

        this.updateViewButtons(viewMode);
    }

    updateViewButtons(mode) {
        this.viewTableBtn.classList.toggle('active', mode === 'table');
        this.viewCardsBtn.classList.toggle('active', mode === 'cards');
        this.tableContainer.classList.toggle('hidden', mode === 'cards');
        this.cardContainer.classList.toggle('hidden', mode === 'table');
    }

    renderTable(data) {
        this.tableBody.innerHTML = '';

        data.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${Utils.escapeHtml(record.nombre)}</td>
                <td>${Utils.escapeHtml(record.email)}</td>
                <td>${Utils.escapeHtml(record.ubicacion)}</td>
                <td>${this.renderPhoneCell(record.phoneInfo1)}</td>
                <td>${this.renderPhoneCell(record.phoneInfo2)}</td>
                <td>${Utils.escapeHtml(record.plan)}</td>
                <td>${Utils.escapeHtml(record.ingresos)}</td>
                <td>${Utils.escapeHtml(record.edad)}</td>
                <td>
                    <button class="btn-icon-only delete-btn" data-id="${record.id}" title="Eliminar registro">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;

            row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.02}s both`;
            this.tableBody.appendChild(row);
        });
    }

    renderCards(data) {
        this.cardContainer.innerHTML = '';

        data.forEach((record, index) => {
            const card = document.createElement('div');
            card.className = 'data-card';
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-name">${Utils.escapeHtml(record.nombre)}</span>
                    <div class="card-header-actions">
                        <span class="card-id">#${index + 1}</span>
                        <button class="btn-icon-only delete-btn small" data-id="${record.id}" title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-field">
                        <span class="field-label">Email</span>
                        <span class="field-value">${Utils.escapeHtml(record.email) || '-'}</span>
                    </div>
                    <div class="card-field">
                        <span class="field-label">Ubicación</span>
                        <span class="field-value">${Utils.escapeHtml(record.ubicacion) || '-'}</span>
                    </div>
                    <div class="card-field-grid">
                        <div class="card-field">
                            <span class="field-label">Plan</span>
                            <span class="field-value">${Utils.escapeHtml(record.plan) || '-'}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Edad</span>
                            <span class="field-value">${Utils.escapeHtml(record.edad) || '-'}</span>
                        </div>
                    </div>
                    <div class="card-field">
                        <span class="field-label">Ingresos</span>
                        <span class="field-value">${Utils.escapeHtml(record.ingresos) || '-'}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-phone-section">
                        ${this.renderPhoneCell(record.phoneInfo1)}
                        ${this.renderPhoneCell(record.phoneInfo2)}
                    </div>
                </div>
            `;

            card.style.animation = `fadeInUp 0.3s ease-out ${index * 0.02}s both`;
            this.cardContainer.appendChild(card);
        });
    }

    renderPhoneCell(info) {
        if (info.type === 'empty') return '';

        if (info.isDuplicate) {
            let html = `
                <div class="phone-cell duplicate" title="Número repetido: ${info.number}">
                    <svg class="duplicate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span class="duplicate-label">Duplicado: ${info.number}</span>
                </div>
            `;

            if (info.extraText) {
                html += `
                    <div class="info-tip" title="Nota adicional: ${Utils.escapeHtml(info.extraText)}">
                        <svg class="info-icon small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </div>
                `;
            }
            return `<div class="phone-cell">${html}</div>`;
        }

        if (info.type === 'text') {
            return `
                <div class="phone-cell text-only" title="${Utils.escapeHtml(info.text)}">
                    <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span class="info-label">${Utils.escapeHtml(info.text)}</span>
                </div>
            `;
        }

        if (info.type === 'number') {
            let html = `
                <div class="phone-actions">
                    ${this.createWhatsAppLink(info.number)}
                    ${this.createCallLink(info.number)}
                </div>
            `;

            if (info.extraText) {
                html += `
                    <div class="info-tip" title="${Utils.escapeHtml(info.extraText)}">
                        <svg class="info-icon small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </div>
                `;
            }

            return `<div class="phone-cell">${html}</div>`;
        }

        return '';
    }

    createWhatsAppLink(phoneNumber) {
        if (!phoneNumber || !phoneNumber.trim()) return '';
        const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
        const whatsappUrl = `https://wa.me/54${cleanPhone}`;

        return `<a href="${whatsappUrl}" target="_blank" class="whatsapp-link" title="WhatsApp">
            <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>WS</span>
        </a>`;
    }

    createCallLink(phoneNumber) {
        if (!phoneNumber || !phoneNumber.trim()) return '';
        const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
        const callUrl = `tel:${cleanPhone}`;

        return `<a href="${callUrl}" class="call-link" title="Llamar">
            <svg class="call-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.19-2.19a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Llamar</span>
        </a>`;
    }

    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        this.notification.classList.remove('hidden');
        setTimeout(() => {
            this.notification.classList.add('hidden');
        }, 3000);
    }

    setTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('light-theme', !isDark);

        const sunIcon = document.querySelector('.theme-sun');
        const moonIcon = document.querySelector('.theme-moon');

        if (sunIcon && moonIcon) {
            sunIcon.classList.toggle('hidden', isDark);
            moonIcon.classList.toggle('hidden', !isDark);
        }
    }

    clearInput() {
        this.messageInput.value = '';
        this.resultsSection.classList.add('hidden');
        this.emptyState.classList.remove('hidden');
        this.messageInput.focus();
    }
}
