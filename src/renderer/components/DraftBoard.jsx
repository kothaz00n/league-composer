import React from 'react';
import { IconCompositions } from './HextechIcons';

const ROLE_LABELS = {
    top: 'TOP',
    jungle: 'JGL',
    mid: 'MID',
    middle: 'MID',
    adc: 'ADC',
    bottom: 'ADC',
    support: 'SUP',
    utility: 'SUP',
};

function PickSlot({ player, side, getChampionName, getChampionIcon }) {
    const champName = player.championId > 0 ? getChampionName(player.championId) : null;
    const champIcon = champName ? getChampionIcon(champName) : null;
    const roleLabel = ROLE_LABELS[player.role?.toLowerCase()] || '?';

    const classes = [
        'pick-slot',
        side === 'red' ? 'pick-slot--red' : 'pick-slot--blue',
        player.isLocalPlayer ? 'pick-slot--local' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            <div className="pick-slot__avatar">
                {champIcon ? (
                    <img src={champIcon} alt={champName} loading="lazy" />
                ) : (
                    <span className="pick-slot__avatar--empty">?</span>
                )}
            </div>
            <div className="pick-slot__info">
                <span className="pick-slot__name">{champName || 'Picking...'}</span>
                <span className="pick-slot__role">{roleLabel}</span>
            </div>
        </div>
    );
}

function BanSlot({ championId, getChampionName, getChampionIcon }) {
    const champName = championId > 0 ? getChampionName(championId) : null;
    const champIcon = champName ? getChampionIcon(champName) : null;

    return (
        <div className={`ban-slot ${champName ? 'ban-slot--filled' : ''}`}>
            {champIcon ? (
                <img src={champIcon} alt={champName} loading="lazy" />
            ) : (
                <span className="ban-slot__empty">—</span>
            )}
        </div>
    );
}

export default function DraftBoard({ allies, enemies, bans, localPlayer, enemyComposition, getChampionName, getChampionIcon }) {
    const allySlots  = Array.from({ length: 5 }, (_, i) => allies?.[i]  || { cellId: i,     championId: 0, role: '' });
    const enemySlots = Array.from({ length: 5 }, (_, i) => enemies?.[i] || { cellId: i + 5, championId: 0, role: '' });

    // First 5 bans belong to blue/ally side, next 5 to red/enemy side
    const allBans  = Array.from({ length: 10 }, (_, i) => bans?.[i] || 0);
    const blueBans = allBans.slice(0, 5);
    const redBans  = allBans.slice(5, 10);

    const hasEnemyPicks = enemies?.some(e => e.championId > 0);

    return (
        <div className="draft-board">
            {/* Section Header */}
            <div className="section-header">
                <span className="section-header__icon"><IconCompositions size={16} /></span>
                <span className="section-header__title">Draft Board</span>
                {localPlayer?.role && (
                    <span className="section-header__badge">
                        {ROLE_LABELS[localPlayer.role?.toLowerCase()] || localPlayer.role}
                    </span>
                )}
            </div>

            {/* Bans row — blue side left, VS center, red side right */}
            <div className="draft-header">
                <div className="draft-bans draft-bans--blue">
                    {blueBans.map((banId, idx) => (
                        <BanSlot key={idx} championId={banId}
                            getChampionName={getChampionName}
                            getChampionIcon={getChampionIcon} />
                    ))}
                </div>
                <div className="draft-vs">VS</div>
                <div className="draft-bans draft-bans--red">
                    {redBans.map((banId, idx) => (
                        <BanSlot key={idx} championId={banId}
                            getChampionName={getChampionName}
                            getChampionIcon={getChampionIcon} />
                    ))}
                </div>
            </div>

            {/* Picks — blue side left, red side right */}
            <div className="draft-picks">
                <div className="draft-side draft-side--blue">
                    <div className="draft-side__label">BLUE SIDE</div>
                    {allySlots.map((player, idx) => (
                        <PickSlot key={`ally-${idx}`} player={player} side="blue"
                            getChampionName={getChampionName}
                            getChampionIcon={getChampionIcon} />
                    ))}
                </div>

                <div className="draft-side draft-side--red">
                    <div className="draft-side__label">RED SIDE</div>
                    {enemySlots.map((player, idx) => (
                        <PickSlot key={`enemy-${idx}`} player={player} side="red"
                            getChampionName={getChampionName}
                            getChampionIcon={getChampionIcon} />
                    ))}
                </div>
            </div>

            {/* Enemy Comp Badge */}
            {hasEnemyPicks && enemyComposition && enemyComposition.archetype !== 'unknown' && (
                <div style={{
                    margin: '8px 0 0',
                    padding: '8px 12px',
                    background: 'rgba(200, 60, 60, 0.08)',
                    border: '1px solid rgba(200, 60, 60, 0.25)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Enemy Comp:
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#e84057' }}>
                        {enemyComposition.icon} {enemyComposition.name}
                    </span>
                    {enemyComposition.desc && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            — {enemyComposition.desc}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
