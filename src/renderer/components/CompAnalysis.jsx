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
                <div style={{
                    padding: '8px 12px',
                    background: 'rgba(232, 64, 87, 0.15)',
                    border: '1px solid rgba(232, 64, 87, 0.4)',
                    borderRadius: '4px',
                    color: '#e84057',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <IconWarning size={16} />
                    <span><strong>Out of Meta:</strong> Low average win rate. Consider substitutions.</span>
                </div>
            )}

            {/* Substitutions */}
            {suggestions && suggestions.length > 0 && (
                <div className="comp-suggestions">
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Recommended Substitutions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {suggestions.map((s, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'var(--bg-secondary)',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                borderLeft: '3px solid var(--accent-success)'
                            }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Swap</span>
                                <span style={{ color: '#e84057', fontWeight: 'bold' }}>{s.out}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>⮕</span>
                                <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>{s.in}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--accent-success)' }}>
                                    +{s.diff}% WR
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
