import React from 'react';

const ROLE_LABELS = {
    top: 'TOP', jungle: 'JUNGLE', mid: 'MID',
    adc: 'ADC', support: 'SUPPORT',
    bottom: 'ADC', utility: 'SUPPORT', middle: 'MID',
};

// Tag colors for archetype badges
const TAG_COLORS = {
    tank: '#3b82f6',
    fighter: '#f97316',
    mage: '#a855f7',
    assassin: '#ef4444',
    marksman: '#22c55e',
    support: '#06b6d4',
    enchanter: '#ec4899',
    // comp roles
    engage: '#3b82f6',
    frontline: '#3b82f6',
    dive: '#f97316',
    bruiser: '#f97316',
    poke: '#a855f7',
    teamfight: '#a855f7',
    pick: '#ef4444',
    burst: '#ef4444',
    hypercarry: '#22c55e',
    dps: '#22c55e',
    protect: '#06b6d4',
    'anti-engage': '#06b6d4',
    peel: '#ec4899',
    catcher: '#f59e0b',
    utility: '#06b6d4',
    duelist: '#f97316',
    juggernaut: '#f97316',
    'lane bully': '#ef4444',
    'melee carry': '#f97316',
    diver: '#f97316',
    splitpush: '#f97316',
};

function TagBadge({ tag }) {
    const color = TAG_COLORS[tag?.toLowerCase()] || '#6b7280';
    return (
        <span
            className="rec-card__tag"
            style={{
                background: `${color}22`,
                color: color,
                border: `1px solid ${color}44`,
            }}
        >
            {tag}
        </span>
    );
}

export default function RecommendationPanel({ recommendations, role, getChampionIcon }) {
    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="recommendations">
                <div className="section-header">
                    <span className="section-header__icon">💡</span>
                    <span className="section-header__title">Recommendations</span>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Waiting for enemy picks to generate recommendations...
                </div>
            </div>
        );
    }

    const maxScore = Math.max(...recommendations.map(r => r.score), 1);

    return (
        <div className="recommendations">
            <div className="section-header">
                <span className="section-header__icon">💡</span>
                <span className="section-header__title">Top Picks</span>
                {role && (
                    <span className="section-header__badge">
                        {ROLE_LABELS[role?.toLowerCase()] || role}
                    </span>
                )}
            </div>

            <div className="rec-cards">
                {recommendations.map((rec, idx) => {
                    const iconUrl = getChampionIcon(rec.name);
                    const barWidth = maxScore > 0 ? (rec.score / maxScore) * 100 : 0;

                    return (
                        <div key={rec.name} className="rec-card animate-in">
                            {/* Rank badge */}
                            <div className={`rec-card__rank rec-card__rank--${idx + 1}`}>
                                {idx + 1}
                            </div>

                            {/* Champion avatar */}
                            <div className="rec-card__avatar">
                                {iconUrl ? (
                                    <img src={iconUrl} alt={rec.name} loading="lazy" />
                                ) : (
                                    <div style={{
                                        width: '100%', height: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '12px',
                                    }}>
                                        ?
                                    </div>
                                )}
                            </div>

                            {/* Champion info */}
                            <div className="rec-card__info">
                                <div className="rec-card__name-row">
                                    <span className="rec-card__name">{rec.name}</span>
                                    {rec.winRate && rec.winRate !== 0.50 && (
                                        <span className={`rec-card__wr ${rec.winRate >= 0.51 ? 'rec-card__wr--positive' : 'rec-card__wr--negative'}`}>
                                            {(rec.winRate * 100).toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                                {/* Tags */}
                                {rec.tags && rec.tags.length > 0 && (
                                    <div className="rec-card__tags">
                                        {rec.tags.slice(0, 3).map((tag, i) => (
                                            <TagBadge key={i} tag={tag} />
                                        ))}
                                    </div>
                                )}
                                <div className="rec-card__reasons">
                                    {(rec.details || rec.reasons || []).length > 0 ? (
                                        (rec.details || rec.reasons || []).slice(0, 2).map((reason, i) => (
                                            <span key={i} className="rec-card__reason">{reason}</span>
                                        ))
                                    ) : (
                                        <span className="rec-card__reason">Good pick for {ROLE_LABELS[role?.toLowerCase()] || role}</span>
                                    )}
                                </div>
                            </div>

                            {/* Score */}
                            <div className="rec-card__score">
                                <div className="rec-card__score-value">{rec.score.toFixed(1)}</div>
                                <div className="rec-card__score-label">score</div>
                            </div>

                            {/* Score bar */}
                            <div className="rec-card__bar" style={{ width: `${barWidth}%` }} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
