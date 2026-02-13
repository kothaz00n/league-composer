import React from 'react';

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

function PickSlot({ player, isAlly, getChampionName, getChampionIcon }) {
    const champName = player.championId > 0 ? getChampionName(player.championId) : null;
    const champIcon = champName ? getChampionIcon(champName) : null;
    const roleLabel = ROLE_LABELS[player.role?.toLowerCase()] || '?';

    return (
        <div className={`pick-slot ${player.isLocalPlayer ? 'pick-slot--local' : ''}`}>
            <div className="pick-slot__avatar">
                {champIcon ? (
                    <img src={champIcon} alt={champName} loading="lazy" />
                ) : (
                    <span className="pick-slot__avatar--empty">?</span>
                )}
            </div>
            <div className="pick-slot__info">
                <span className="pick-slot__name">
                    {champName || 'Picking...'}
                </span>
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

export default function DraftBoard({ allies, enemies, bans, localPlayer, getChampionName, getChampionIcon }) {
    // Ensure we always show 5 slots per team
    const allySlots = Array.from({ length: 5 }, (_, i) => allies?.[i] || { cellId: i, championId: 0, role: '' });
    const enemySlots = Array.from({ length: 5 }, (_, i) => enemies?.[i] || { cellId: i + 5, championId: 0, role: '' });

    // Show up to 10 ban slots
    const banSlots = Array.from({ length: 10 }, (_, i) => bans?.[i] || 0);

    return (
        <div className="draft-board">
            {/* Section Header */}
            <div className="section-header">
                <span className="section-header__icon">📋</span>
                <span className="section-header__title">Draft Board</span>
                {localPlayer?.role && (
                    <span className="section-header__badge">
                        {ROLE_LABELS[localPlayer.role?.toLowerCase()] || localPlayer.role}
                    </span>
                )}
            </div>

            {/* Bans Row */}
            <div className="bans-row">
                {banSlots.map((banId, idx) => (
                    <BanSlot
                        key={idx}
                        championId={banId}
                        getChampionName={getChampionName}
                        getChampionIcon={getChampionIcon}
                    />
                ))}
            </div>

            {/* Teams */}
            <div className="teams-container">
                <div className="team">
                    <div className="team__label team__label--ally">ALLY TEAM</div>
                    {allySlots.map((player, idx) => (
                        <PickSlot
                            key={`ally-${idx}`}
                            player={player}
                            isAlly={true}
                            getChampionName={getChampionName}
                            getChampionIcon={getChampionIcon}
                        />
                    ))}
                </div>
                <div className="team">
                    <div className="team__label team__label--enemy">ENEMY TEAM</div>
                    {enemySlots.map((player, idx) => (
                        <PickSlot
                            key={`enemy-${idx}`}
                            player={player}
                            isAlly={false}
                            getChampionName={getChampionName}
                            getChampionIcon={getChampionIcon}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
