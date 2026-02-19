import React from 'react';
import { IconHome } from './HextechIcons';

/**
 * ViewHeader — Barra de navegación superior unificada para todas las vistas.
 *
 * Props:
 *  - title     {string}  Título de la sección
 *  - onBack    {fn}      Callback al clickear "← Dashboard"
 *  - children  {node}    Acciones opcionales (botones a la derecha)
 */
export default function ViewHeader({ title, onBack, children }) {
    return (
        <div className="view-header">
            <button
                className="view-header__back"
                onClick={onBack}
                title="Back to Dashboard"
            >
                <IconHome size={15} />
                <span>Dashboard</span>
            </button>

            <h1 className="view-header__title">{title}</h1>

            <div className="view-header__actions">
                {children}
            </div>
        </div>
    );
}
