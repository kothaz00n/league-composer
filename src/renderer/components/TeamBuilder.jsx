import React, { useState, useEffect } from 'react';
import CompAnalysis from './CompAnalysis';
import { RoleIcon, IconSave } from './HextechIcons';
import ViewHeader from './ViewHeader';

// ─── UI Helpers ─────────────────────────────────────────────────────────
const TAG_TO_COMP_ROLES = {
    'Tank': ['engage', 'frontline', 'protect'],
    'Fighter': ['dive', 'bruiser'],
    'Mage': ['poke', 'teamfight'],
    'Assassin': ['dive', 'pick'],
    'Marksman': ['hypercarry', 'dps'],
    'Support': ['protect', 'anti-engage', 'teamfight'],
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

// ─── Save Modal ─────────────────────────────────────────────────────────
function SaveCompositionModal({ isOpen, onClose, onSaveArchetype, onSaveComposition, existingCompositions }) {
    const [mode, setMode] = useState('archetype'); // 'archetype' or 'composition'
    const [name, setName] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(-1); // -1 = new, 0+ = overwrite

    if (!isOpen) return null;

    const handleSave = () => {
        if (mode === 'archetype') {
            onSaveArchetype(name);
        } else {
            onSaveComposition(name, selectedSlot);
        }
        setName('');
        setSelectedSlot(-1);
    };

    return (
        <div className="editor-modal__overlay" onClick={onClose}>
            <div className="editor-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <h2 className="editor-modal__title">Save Composition</h2>

                <div className="editor-tabs" style={{ marginBottom: '16px' }}>
                    <button
                        className={`editor-tab ${mode === 'archetype' ? 'editor-tab--active' : ''}`}
                        onClick={() => setMode('archetype')}
                    >
                        As Archetype
                    </button>
                    <button
                        className={`editor-tab ${mode === 'composition' ? 'editor-tab--active' : ''}`}
                        onClick={() => { setMode('composition'); setSelectedSlot(-1); setName(''); }}
                    >
                        To Slot
                    </button>
                </div>

                {mode === 'archetype' ? (
                    <>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '13px' }}>
                            Save as a reusable archetype template (e.g. "Dive Comp").
                        </p>
                        <div className="editor-modal__field">
                            <label>Archetype Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., Dive Comp 2.0"
                                autoFocus
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '13px' }}>
                            Save to a composition slot for future editing or reference.
                        </p>
                        <div className="editor-modal__field">
                            <label>Target Slot</label>
                            <select
                                value={selectedSlot}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setSelectedSlot(val);
                                    if (val !== -1) {
                                        const comp = existingCompositions[val];
                                        if (comp) setName(comp.name);
                                    } else {
                                        setName('');
                                    }
                                }}
                                style={{ width: '100%', padding: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white' }}
                            >
                                <option value={-1}>Min + Create New Composition</option>
                                {existingCompositions.map((comp, idx) => (
                                    <option key={idx} value={idx}>Slot {idx + 1}: {comp.name} {comp.roles?.mid ? `(${comp.roles.mid})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div className="editor-modal__field">
                            <label>Composition Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., My Clash Team"
                            />
                        </div>
                    </>
                )}

                <div className="editor-modal__actions">
                    <button className="editor-btn editor-btn--cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="editor-btn editor-btn--save"
                        onClick={handleSave}
                        disabled={!name.trim()}
                    >
                        <IconSave size={14} /> Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// Role labels now use SVG icons rendered inline in JSX (see builder-slot-label below)
const ROLE_NAMES = { top: 'Top', jungle: 'Jungle', mid: 'Mid', adc: 'Bottom', support: 'Support' };

const TeamBuilder = ({ allChampions, championData, onBack }) => {
    const { tagsMap } = championData || {};

    const [team, setTeam] = useState({ top: null, jungle: null, mid: null, adc: null, support: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [statsMap, setStatsMap] = useState({});
    const [selectedChamp, setSelectedChamp] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [existingCompositions, setExistingCompositions] = useState([]);
    const [opPicks, setOpPicks] = useState([]);

    useEffect(() => {
        if (window.electronAPI?.getAllCompositions) {
            window.electronAPI.getAllCompositions().then(data => {
                if (data && data.compositions) {
                    setExistingCompositions(data.compositions);
                }
            });
        }
        if (window.electronAPI?.getOpPicks) {
            window.electronAPI.getOpPicks('soloq').then(data => {
                if (data) setOpPicks(data);
            });
        }
    }, [showSaveModal]);

    // Save handler
    const handleSaveArchetype = (name) => {
        if (!window.electronAPI?.saveArchetype) return;
        const composition = {
            top: team.top || '',
            jungle: team.jungle || '',
            mid: team.mid || '',
            adc: team.adc || '',
            support: team.support || ''
        };
        window.electronAPI.saveArchetype({ name, composition });
        setShowSaveModal(false);
    };

    const handleSaveComposition = (name, index) => {
        if (!window.electronAPI?.saveComposition) return;
        const composition = {
            name,
            roles: { ...team },
            difficulty: 'Medium',
            best_in_meta: false,
            good_against: '',
            bad_against: '',
            key_focus: 'Created in Team Builder'
        };
        Object.keys(composition.roles).forEach(key => { if (!composition.roles[key]) composition.roles[key] = ''; });

        window.electronAPI.saveComposition({ composition, index });
        setShowSaveModal(false);
    };

    // Fetch stats when team changes (for individual slots)
    useEffect(() => {
        Object.entries(team).forEach(([role, name]) => {
            if (name) {
                const key = `${name}-${role}`;
                if (!statsMap[key] && window.electronAPI?.getChampionStats) {
                    window.electronAPI.getChampionStats(name, role, 'flex').then(data => {
                        setStatsMap(prev => ({ ...prev, [key]: data }));
                    });
                }
            }
        });
    }, [team]);

    // Update analysis when team changes
    useEffect(() => {
        const hasChamps = Object.values(team).some(Boolean);
        if (hasChamps && window.electronAPI?.analyzeComposition) {
            window.electronAPI.analyzeComposition(team, 'flex').then(result => {
                if (result) {
                    setAnalysis(result);
                }
            });
        } else {
            setAnalysis(null);
        }
    }, [team]);

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
        if (assignedNames.has(champName)) return;
        const emptyRole = Object.entries(team).find(([_, v]) => v === null);
        if (emptyRole) setTeam(prev => ({ ...prev, [emptyRole[0]]: champName }));
    };

    const addOpPick = (pick) => {
        setTeam(prev => ({ ...prev, [pick.role]: pick.name }));
    };

    const assignedNames = new Set(Object.values(team).filter(Boolean));
    const filteredChamps = allChampions
        .filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort();

    const getChampArchetype = (name) => {
        const tags = tagsMap?.[name] || [];
        const compRoles = getCompositionRoles(tags);
        return { tags, compRoles };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Unified back navigation */}
            <ViewHeader title="Team Builder" onBack={onBack}>
                <button
                    className="editor-btn editor-btn--primary"
                    onClick={() => setShowSaveModal(true)}
                    disabled={Object.values(team).every(v => !v)}
                    style={{ fontSize: '11px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                    <IconSave size={13} /> Save
                </button>
            </ViewHeader>

            <div className="builder-container">
                {/* Sidebar */}
                <div className="builder-sidebar">
                    <div className="builder-sidebar-header">
                        <input
                            className="builder-search"
                            placeholder="Search Champions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="builder-list">
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
                                    className={`builder-list-item ${isUsed ? 'used' : ''} ${isSelected ? 'selected' : ''}`}
                                >
                                    <span className="builder-champ-label">{champ}</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {tags.slice(0, 1).map(t => (
                                            <span key={t} className="builder-tag">
                                                {t.slice(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="builder-main">
                    <div className="builder-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="builder-title">Team Builder</h1>
                            <p className="dashboard-subtitle">DRAG CHAMPIONS TO PLAN YOUR COMPOSITION</p>
                        </div>
                        <div>
                            {/* Could put queue selector here if desired */}
                            <button
                                className="editor-btn editor-btn--primary"
                                onClick={() => setShowSaveModal(true)}
                                disabled={Object.values(team).every(v => !v)}
                            >
                                <IconSave size={14} /> Save Composition
                            </button>
                        </div>
                    </div>

                    <SaveCompositionModal
                        isOpen={showSaveModal}
                        onClose={() => setShowSaveModal(false)}
                        onSaveArchetype={handleSaveArchetype}
                        onSaveComposition={handleSaveComposition}
                        existingCompositions={existingCompositions}
                    />

                    {/* Slots */}
                    <div className="builder-slots-grid">
                        {Object.entries(ROLE_NAMES).map(([role, name]) => {
                            const currentChamp = team[role];
                            const stats = currentChamp ? statsMap[`${currentChamp}-${role}`] : null;
                            const isWeak = stats && (stats.winRate < 0.48);
                            const isStrong = stats && (stats.winRate > 0.52);

                            return (
                                <div
                                    key={role}
                                    className={`builder-slot ${currentChamp ? 'filled' : ''} ${isWeak ? 'weak' : ''} ${isStrong ? 'strong' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, role)}
                                >
                                    <span className="builder-slot-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <RoleIcon role={role} size={14} />
                                        {name}
                                    </span>
                                    {currentChamp ? (
                                        <>
                                            <span className="builder-champ-name">{currentChamp}</span>
                                            {stats && (
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                    <span className={`builder-tag ${isWeak ? 'weak' : 'strong'}`}>
                                                        {Math.round(stats.winRate * 100)}% WR
                                                    </span>
                                                </div>
                                            )}
                                            <button onClick={() => handleRemove(role)} className="builder-remove-btn">
                                                ✕
                                            </button>
                                        </>
                                    ) : (
                                        <span style={{ fontSize: '24px', opacity: 0.2 }}>+</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Analysis & Details */}
                    <div className="builder-analysis-grid">
                        <div className="builder-panel">
                            <h3 className="builder-panel-title">
                                {analysis ? 'Composition Analysis' : 'Recommended Starters'}
                            </h3>
                            {analysis ? (
                                <CompAnalysis compositionAnalysis={analysis} />
                            ) : (
                                <div className="animate-in">
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '13px' }}>
                                        Start your composition with one of the current OP picks:
                                    </p>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {opPicks.map((pick, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => addOpPick(pick)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '10px',
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    border: '1px solid transparent',
                                                    transition: 'all 0.2s'
                                                }}
                                                className="op-pick-item"
                                            >
                                                <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '80px' }}>{pick.name}</span>
                                                <span style={{
                                                    fontSize: '11px',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--text-secondary)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    padding: '2px 6px',
                                                    borderRadius: '3px'
                                                }}>
                                                    {pick.role}
                                                </span>
                                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--accent-success)', fontSize: '12px', fontWeight: 'bold' }}>
                                                        {(pick.winRate * 100).toFixed(1)}% WR
                                                    </span>
                                                    {pick.tier && pick.tier.startsWith('S') && (
                                                        <span style={{
                                                            color: '#c8aa6e',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            border: '1px solid #c8aa6e',
                                                            padding: '0 4px',
                                                            borderRadius: '3px'
                                                        }}>
                                                            {pick.tier}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {opPicks.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                                <p style={{ fontSize: '12px' }}>No OP picks found.</p>
                                                <p style={{ fontSize: '11px', marginTop: '4px' }}>Import win rate data to see suggestions.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="builder-panel">
                            <h3 className="builder-panel-title">Champion Details</h3>
                            {selectedChamp ? (() => {
                                const { tags, compRoles } = getChampArchetype(selectedChamp);
                                return (
                                    <div>
                                        <div className="builder-champ-name" style={{ fontSize: '24px', marginBottom: '16px' }}>{selectedChamp}</div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <div className="builder-slot-label">Tags</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {tags.map(t => <span key={t} className="builder-tag">{t}</span>)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="builder-slot-label">Roles</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {compRoles.map(r => <span key={r} className="builder-tag" style={{ borderColor: 'var(--hextech-blue)', color: 'var(--hextech-blue)' }}>{r}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <p className="dashboard-subtitle">Select a champion to view details.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamBuilder;

