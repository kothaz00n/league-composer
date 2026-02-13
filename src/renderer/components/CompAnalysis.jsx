import React from 'react';

const TIER_COLORS = {
    S: { bg: 'rgba(200, 170, 110, 0.15)', border: 'rgba(200, 170, 110, 0.5)', text: '#c8aa6e' },
    A: { bg: 'rgba(10, 200, 185, 0.12)', border: 'rgba(10, 200, 185, 0.4)', text: '#0ac8b9' },
    B: { bg: 'rgba(39, 174, 96, 0.12)', border: 'rgba(39, 174, 96, 0.4)', text: '#27ae60' },
    C: { bg: 'rgba(241, 196, 15, 0.12)', border: 'rgba(241, 196, 15, 0.4)', text: '#f1c40f' },
    D: { bg: 'rgba(232, 64, 87, 0.12)', border: 'rgba(232, 64, 87, 0.4)', text: '#e84057' },
};

export default function CompAnalysis({ compositionAnalysis }) {
    if (!compositionAnalysis || compositionAnalysis.archetype === 'unknown') {
        return null;
    }

    const { name, icon, desc, tier, championCount, archetype } = compositionAnalysis;
    const tierStyle = TIER_COLORS[tier] || TIER_COLORS['D'];

    return (
        <div className="comp-analysis animate-in">
            <div className="section-header">
                <span className="section-header__icon">🧩</span>
                <span className="section-header__title">Team Composition</span>
                {championCount > 0 && (
                    <span className="section-header__badge">
                        {championCount}/5 picked
                    </span>
                )}
            </div>

            <div className="comp-analysis__body">
                {/* Archetype info */}
                <div className="comp-analysis__archetype">
                    <span className="comp-analysis__icon">{icon}</span>
                    <div className="comp-analysis__info">
                        <div className="comp-analysis__name">{name}</div>
                        <div className="comp-analysis__desc">{desc}</div>
                    </div>
                </div>

                {/* Tier badge */}
                <div
                    className="comp-analysis__tier"
                    style={{
                        background: tierStyle.bg,
                        borderColor: tierStyle.border,
                        color: tierStyle.text,
                    }}
                >
                    <span className="comp-analysis__tier-label">TIER</span>
                    <span className="comp-analysis__tier-value">{tier}</span>
                </div>
            </div>
        </div>
    );
}
