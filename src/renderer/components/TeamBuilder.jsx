import React, { useState, useEffect } from 'react';
import CompAnalysis from './CompAnalysis';

// ─── Inlined Archetype Logic ────────────────────────────────────────────
// Broadened to capture more Support-role champions (many have Tank/Mage tags)
const TAG_TO_COMP_ROLES = {
    'Tank': ['engage', 'frontline', 'protect'],
    'Fighter': ['dive', 'bruiser'],
    'Mage': ['poke', 'teamfight'],
    'Assassin': ['dive', 'pick'],
    'Marksman': ['hypercarry', 'dps'],
    'Support': ['protect', 'anti-engage', 'teamfight'],
};

const COMP_ARCHETYPES = {
    hardEngage: { name: 'Hard Engage', icon: '⚔️', desc: 'Strong initiation with heavy CC and frontline', requiredRoles: ['engage', 'frontline'], bonusRoles: ['teamfight', 'dps'] },
    protect: { name: 'Protect the Carry', icon: '🛡️', desc: 'Peel-heavy comp focused on keeping the hypercarry alive', requiredRoles: ['protect', 'hypercarry'], bonusRoles: ['anti-engage', 'frontline'] },
    dive: { name: 'Dive / Pick', icon: '🗡️', desc: 'Aggressive comp that dives the backline', requiredRoles: ['dive'], bonusRoles: ['pick', 'bruiser'] },
    poke: { name: 'Poke / Siege', icon: '🏹', desc: 'Long-range poke to win fights before they start', requiredRoles: ['poke', 'dps'], bonusRoles: ['anti-engage'] },
    splitpush: { name: 'Splitpush', icon: '🔱', desc: 'Strong sidelaners that create map pressure', requiredRoles: ['bruiser'], bonusRoles: ['dive', 'dps'] },
    teamfight: { name: 'Teamfight / Wombo', icon: '💥', desc: 'AoE-heavy composition for devastating 5v5 fights', requiredRoles: ['teamfight', 'engage'], bonusRoles: ['frontline', 'dps'] },
};

function getCompositionRoles(riotTags) {
    if (!riotTags || !Array.isArray(riotTags)) return [];
    const roles = new Set();
    for (const tag of riotTags) {
        const mapped = TAG_TO_COMP_ROLES[tag];
        if (mapped) mapped.forEach(r => roles.add(r));
    }
    return [...roles];
}

function detectTeamComposition(teamChampions) {
    if (!teamChampions || teamChampions.length === 0) {
        return { archetype: 'unknown', name: 'Unknown', icon: '❓', desc: 'Not enough data', confidence: 0 };
    }
    const teamRoles = [];
    for (const champ of teamChampions) { teamRoles.push(...getCompositionRoles(champ.tags || [])); }
    const roleCounts = {};
    for (const role of teamRoles) { roleCounts[role] = (roleCounts[role] || 0) + 1; }
    let bestArchetype = null;
    let bestScore = 0;
    for (const [key, archetype] of Object.entries(COMP_ARCHETYPES)) {
        let score = 0;
        for (const req of archetype.requiredRoles) { score += (roleCounts[req] || 0) * 3; }
        for (const bonus of archetype.bonusRoles) { score += (roleCounts[bonus] || 0) * 1; }
        if (score > bestScore) { bestScore = score; bestArchetype = { archetype: key, ...archetype, confidence: score }; }
    }
    return bestArchetype || { archetype: 'mixed', name: 'Mixed', icon: '🔀', desc: 'A balanced but unfocused composition', confidence: 0 };
}

function getCompositionTier(teamChampions) {
    if (!teamChampions || teamChampions.length === 0) return 'D';
    const comp = detectTeamComposition(teamChampions);
    const maxConf = teamChampions.length * 3 * 2;
    const winRates = teamChampions.map(c => c.winRate || 0.50).filter(wr => wr > 0);
    const avgWR = winRates.length > 0 ? winRates.reduce((s, w) => s + w, 0) / winRates.length : 0.50;
    const compFit = Math.min(comp.confidence / maxConf, 1.0);
    const wrScore = (avgWR - 0.45) / 0.10;
    const combined = compFit * 50 + Math.max(0, Math.min(wrScore, 1)) * 50;
    if (combined >= 80) return 'S';
    if (combined >= 60) return 'A';
    if (combined >= 40) return 'B';
    if (combined >= 20) return 'C';
    return 'D';
}

// ─── Tag colors for visual badges ───────────────────────────────────────
const TAG_COLORS = {
    'Tank': 'bg-blue-900/40 text-blue-300 border-blue-700/40',
    'Fighter': 'bg-orange-900/40 text-orange-300 border-orange-700/40',
    'Mage': 'bg-purple-900/40 text-purple-300 border-purple-700/40',
    'Assassin': 'bg-red-900/40 text-red-300 border-red-700/40',
    'Marksman': 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
    'Support': 'bg-green-900/40 text-green-300 border-green-700/40',
};

const ROLE_COMP = {
    'engage': '⚔️', 'frontline': '🛡️', 'protect': '🤝',
    'dive': '🗡️', 'bruiser': '💪', 'pick': '🎯',
    'poke': '🏹', 'teamfight': '💥', 'dps': '🔫',
    'hypercarry': '👑', 'anti-engage': '🚫',
};
// ─── End Inlined Logic ──────────────────────────────────────────────────

const ROLE_LABELS = { top: '🗡 TOP', jungle: '🌿 JNG', mid: '🔥 MID', adc: '🏹 ADC', support: '🛡 SUP' };

const TeamBuilder = ({ allChampions, championData, onBack }) => {
    const { tagsMap } = championData || {};

    const [team, setTeam] = useState({ top: null, jungle: null, mid: null, adc: null, support: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [statsMap, setStatsMap] = useState({});
    const [selectedChamp, setSelectedChamp] = useState(null); // For archetype detail view

    // Fetch stats when team changes
    useEffect(() => {
        Object.entries(team).forEach(([role, name]) => {
            if (name) {
                const key = `${name}-${role}`;
                if (!statsMap[key] && window.electronAPI?.getChampionStats) {
                    window.electronAPI.getChampionStats(name, role).then(data => {
                        setStatsMap(prev => ({ ...prev, [key]: data }));
                    });
                }
            }
        });
    }, [team]);

    // Update analysis when team changes
    useEffect(() => {
        const teamChamps = Object.values(team).filter(Boolean).map(name => ({
            name,
            tags: tagsMap?.[name] || [],
        }));
        if (teamChamps.length > 0) {
            const comp = detectTeamComposition(teamChamps);
            const tier = getCompositionTier(teamChamps);
            setAnalysis({ ...comp, tier, championCount: teamChamps.length });
        } else {
            setAnalysis(null);
        }
    }, [team, tagsMap]);

    const handleDragStart = (e, champName) => {
        e.dataTransfer.setData('text/plain', champName);
        e.dataTransfer.effectAllowed = 'copy';
    };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
    const handleDrop = (e, role) => {
        e.preventDefault();
        const champName = e.dataTransfer.getData('text/plain');
        if (champName) setTeam(prev => ({ ...prev, [role]: champName }));
    };
    const handleRemove = (role) => setTeam(prev => ({ ...prev, [role]: null }));

    const handleChampClick = (champName) => {
        // If already assigned, do nothing
        if (assignedNames.has(champName)) return;
        const emptyRole = Object.entries(team).find(([_, v]) => v === null);
        if (emptyRole) setTeam(prev => ({ ...prev, [emptyRole[0]]: champName }));
    };

    const assignedNames = new Set(Object.values(team).filter(Boolean));
    const filteredChamps = allChampions
        .filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort();

    // Get archetype data for a champion
    const getChampArchetype = (name) => {
        const tags = tagsMap?.[name] || [];
        const compRoles = getCompositionRoles(tags);
        return { tags, compRoles };
    };

    return (
        <div className="flex h-full bg-gray-900 text-gray-100 overflow-hidden">
            {/* Sidebar: Champion List */}
            <div className="w-60 bg-gray-800 border-r border-white/10 flex flex-col">
                <div className="p-3 border-b border-white/10">
                    <h2 className="text-lg font-bold text-gold mb-2">Champions</h2>
                    <input
                        className="w-full bg-black/40 border border-white/20 rounded px-2 py-1.5 text-sm outline-none focus:border-gold/50 text-white placeholder-gray-500"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                    {filteredChamps.map(champ => {
                        const isUsed = assignedNames.has(champ);
                        const isSelected = selectedChamp === champ;
                        const { tags } = getChampArchetype(champ);
                        return (
                            <div
                                key={champ}
                                draggable={!isUsed}
                                onDragStart={(e) => handleDragStart(e, champ)}
                                onClick={() => { if (!isUsed) handleChampClick(champ); setSelectedChamp(champ); }}
                                className={`
                                    px-3 py-1.5 text-sm rounded cursor-grab active:cursor-grabbing select-none transition flex items-center justify-between gap-1
                                    ${isUsed ? 'text-gray-600 line-through cursor-not-allowed opacity-40' : ''}
                                    ${isSelected ? 'bg-gold/15 text-gold' : isUsed ? '' : 'text-gray-200 hover:bg-gold/10 hover:text-gold'}
                                `}
                            >
                                <span className="truncate">{champ}</span>
                                <div className="flex gap-0.5 shrink-0">
                                    {tags.slice(0, 2).map(t => (
                                        <span key={t} className={`text-[9px] px-1 rounded border ${TAG_COLORS[t] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                                            {t.slice(0, 3)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-2 border-t border-white/10">
                    <button
                        onClick={onBack}
                        className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white font-bold transition"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 p-6 flex flex-col overflow-y-auto">
                <h1 className="text-2xl font-bold text-gold mb-1">Team Builder</h1>
                <p className="text-gray-400 text-sm mb-4">Drag champions into roles or click to auto-fill.</p>

                {/* 5 Role Slots */}
                <div className="grid grid-cols-5 gap-4 w-full mb-6">
                    {Object.entries(ROLE_LABELS).map(([role, label]) => {
                        const currentChamp = team[role];
                        const stats = currentChamp ? statsMap[`${currentChamp}-${role}`] : null;
                        const isWeak = stats && (stats.winRate < 0.48 || (stats.tier && ['C', 'D'].includes(stats.tier)));
                        const isStrong = stats && (stats.winRate > 0.52 || (stats.tier && ['S+', 'S'].includes(stats.tier)));
                        const champArch = currentChamp ? getChampArchetype(currentChamp) : null;

                        return (
                            <div
                                key={role}
                                className={`
                                    min-h-[160px] bg-gray-800/50 rounded-xl border-2 border-dashed relative transition-all flex flex-col items-center justify-center p-3 group
                                    ${currentChamp ? 'border-solid bg-gray-800' : 'border-white/10 hover:border-white/20'}
                                    ${isWeak ? 'border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]' : ''}
                                    ${isStrong && !isWeak ? 'border-gold/50' : ''}
                                `}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, role)}
                            >
                                <span className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">{label}</span>

                                {currentChamp ? (
                                    <>
                                        <span className="font-bold text-base text-white mb-1">{currentChamp}</span>

                                        {/* Champion Tags */}
                                        {champArch && (
                                            <div className="flex flex-wrap gap-1 justify-center mb-2">
                                                {champArch.tags.map(t => (
                                                    <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border ${TAG_COLORS[t] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Comp Roles */}
                                        {champArch && champArch.compRoles.length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-center mb-2">
                                                {champArch.compRoles.map(r => (
                                                    <span key={r} className="text-[10px] px-1 py-0.5 bg-white/5 rounded text-gray-400" title={r}>
                                                        {ROLE_COMP[r] || '•'} {r}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Stats */}
                                        {stats && (
                                            <div className="flex gap-1 text-xs items-center">
                                                <span className={`px-2 py-0.5 rounded font-bold ${isWeak ? 'bg-red-900/50 text-red-300 border border-red-800' : 'bg-green-900/30 text-green-300 border border-green-800/30'}`}>
                                                    {Math.round(stats.winRate * 100)}% WR
                                                </span>
                                                {stats.tier && (
                                                    <span className={`px-2 py-0.5 rounded bg-white/5 border border-white/10 ${isWeak ? 'text-red-400' : 'text-gold'}`}>
                                                        {stats.tier}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleRemove(role)}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ×
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-gray-600 text-sm">Drop here</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom row: Analysis + Selected Champion Detail */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Team Composition Analysis */}
                    <div>
                        <CompAnalysis compositionAnalysis={analysis} />
                    </div>

                    {/* Selected Champion Archetype Detail */}
                    <div className="bg-gray-800/40 rounded-xl border border-white/5 p-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Champion Archetypes</h3>
                        {selectedChamp ? (() => {
                            const { tags, compRoles } = getChampArchetype(selectedChamp);
                            return (
                                <div>
                                    <div className="text-lg font-bold text-white mb-2">{selectedChamp}</div>
                                    <div className="mb-3">
                                        <span className="text-xs text-gray-500 uppercase font-bold">Riot Tags</span>
                                        <div className="flex gap-1 mt-1">
                                            {tags.length > 0 ? tags.map(t => (
                                                <span key={t} className={`text-xs px-2 py-1 rounded border ${TAG_COLORS[t] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                                                    {t}
                                                </span>
                                            )) : <span className="text-xs text-gray-600">No tags</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase font-bold">Composition Roles</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {compRoles.length > 0 ? compRoles.map(r => (
                                                <span key={r} className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-300">
                                                    {ROLE_COMP[r] || '•'} {r}
                                                </span>
                                            )) : <span className="text-xs text-gray-600">No composition roles</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : (
                            <p className="text-sm text-gray-600">Click a champion in the list to see their archetype details.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamBuilder;
