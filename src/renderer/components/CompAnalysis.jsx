import React from 'react';
import { IconArchetypes, IconWarning } from './HextechIcons';

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

    const { name, icon, desc, tier, championCount, metaScore, isOutOfMeta, suggestions } = compositionAnalysis;
    const tierStyle = TIER_COLORS[tier] || TIER_COLORS['D'];

    return (
        <div className="comp-analysis animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="section-header">
                <span className="section-header__icon"><IconArchetypes size={16} /></span>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
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
                    {metaScore !== undefined && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                            Meta Score: <span style={{ color: tierStyle.text }}>{metaScore}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Out of Meta Alert */}
            {isOutOfMeta && (
                <div className="comp-analysis__alert" role="alert">
                    <IconWarning size={16} />
                    <span><strong>Out of Meta:</strong> Low average win rate. Consider substitutions.</span>
                </div>
            )}

            {/* Substitutions */}
            {suggestions && suggestions.length > 0 && (
                <div className="comp-suggestions">
                    <h4 className="comp-suggestions__title">Recommended Substitutions</h4>
                    <div className="comp-suggestions__list">
                        {suggestions.map((s, idx) => (
                            <div key={idx} className="comp-suggestions__item">
                                <span className="comp-suggestions__swap-label">Swap</span>
                                <span className="comp-suggestions__out">{s.out}</span>
                                <span className="comp-suggestions__arrow">⮕</span>
                                <span className="comp-suggestions__in">{s.in}</span>
                                <span className="comp-suggestions__diff">+{s.diff}% WR</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
