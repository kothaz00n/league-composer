import React, { useState, useCallback } from 'react';
import initialData from '../../data/compositions.json';
import {
    RoleIcon,
    IconEdit, IconDelete, IconSave, IconExport, IconClipboard,
    IconCompositions, IconArchetypes,
    IconGood, IconBad, IconDifficulty, IconFocus, IconPool, IconExamples,
} from './HextechIcons';
import ViewHeader from './ViewHeader';

const ROLES_ORDER = ['top', 'jungle', 'mid', 'adc', 'support'];

const DIFF_COLORS = {
    easy: '#27ae60',
    medium: '#f1c40f',
    hard: '#e84057',
    advanced: '#a855f7',
};

function getDifficultyColor(diff) {
    const lower = diff?.toLowerCase() || '';
    for (const [key, color] of Object.entries(DIFF_COLORS)) {
        if (lower.startsWith(key)) return color;
    }
    return '#6b7280';
}

// ─── Role Chip ───────────────────────────────────────────────────────────
function RoleChip({ role, champion }) {
    return (
        <span className="editor-card__role-chip" title={role.toUpperCase()}>
            <RoleIcon role={role} size={13} style={{ flexShrink: 0 }} />
            <span className="role-chip__name">{champion || '—'}</span>
        </span>
    );
}

// ─── Composition Card ───────────────────────────────────────────────────
function CompCard({ comp, index, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const diffColor = getDifficultyColor(comp.difficulty);

    return (
        <div className="editor-card animate-entry" style={{ animationDelay: `${index * 40}ms` }}>
            <div className="editor-card__header" onClick={() => setExpanded(!expanded)}>
                <div className="editor-card__title-row">
                    {comp.best_in_meta && <span className="editor-card__meta-badge">META</span>}
                    <h3 className="editor-card__name">{comp.name}</h3>
                    <span className="editor-card__expand">{expanded ? '▾' : '▸'}</span>
                </div>
                <div className="editor-card__roles-preview">
                    {ROLES_ORDER.map(role => (
                        <RoleChip key={role} role={role} champion={comp.roles[role]} />
                    ))}
                </div>
            </div>

            {expanded && (
                <div className="editor-card__body animate-entry">
                    <div className="editor-card__matchups">
                        <div className="editor-card__matchup editor-card__matchup--good">
                            <span className="editor-card__matchup-label">
                                <IconGood size={13} style={{ marginRight: 6 }} />
                                Good vs
                            </span>
                            <span>{comp.good_against}</span>
                        </div>
                        <div className="editor-card__matchup editor-card__matchup--bad">
                            <span className="editor-card__matchup-label">
                                <IconBad size={13} style={{ marginRight: 6 }} />
                                Bad vs
                            </span>
                            <span>{comp.bad_against}</span>
                        </div>
                    </div>
                    <div className="editor-card__detail">
                        <span className="editor-card__detail-label" style={{ color: diffColor }}>
                            <IconDifficulty size={13} style={{ marginRight: 6 }} />
                            Difficulty
                        </span>
                        <span className="editor-card__detail-text">{comp.difficulty}</span>
                    </div>
                    <div className="editor-card__detail">
                        <span className="editor-card__detail-label">
                            <IconFocus size={13} style={{ marginRight: 6 }} />
                            Focus
                        </span>
                        <span className="editor-card__detail-text">{comp.key_focus}</span>
                    </div>
                    <div className="editor-card__actions">
                        <button className="editor-btn editor-btn--edit" onClick={() => onEdit(index)}>
                            <IconEdit size={14} /> Edit
                        </button>
                        <button className="editor-btn editor-btn--delete" onClick={() => onDelete(index)}>
                            <IconDelete size={14} /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Archetype Card ─────────────────────────────────────────────────────
function ArchetypeCard({ arch, index, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="editor-card editor-card--archetype animate-entry" style={{ animationDelay: `${index * 40}ms` }}>
            <div className="editor-card__header" onClick={() => setExpanded(!expanded)}>
                <div className="editor-card__title-row">
                    <h3 className="editor-card__name">{arch.name}</h3>
                    <span className="editor-card__expand">{expanded ? '▾' : '▸'}</span>
                </div>
                <div className="editor-card__roles-preview">
                    {ROLES_ORDER.map(role => (
                        <RoleChip key={role} role={role} champion={arch.typical_comp?.[role]} />
                    ))}
                </div>
            </div>

            {expanded && (
                <div className="editor-card__body animate-entry">
                    {arch.examples && (
                        <div className="editor-card__detail">
                            <span className="editor-card__detail-label">
                                <IconExamples size={13} style={{ marginRight: 6 }} />
                                Examples
                            </span>
                            <span className="editor-card__detail-text">{arch.examples}</span>
                        </div>
                    )}

                    <div className="editor-card__pool-section">
                        <span className="editor-card__detail-label">
                            <IconPool size={13} style={{ marginRight: 6 }} />
                            Champion Pool
                        </span>
                        <div className="editor-card__pool-grid">
                            {ROLES_ORDER.map(role => {
                                const pool = arch.champion_pool?.[role] || [];
                                if (pool.length === 0) return null;
                                return (
                                    <div key={role} className="editor-card__pool-role">
                                        <span className="editor-card__pool-role-label">
                                            <RoleIcon role={role} size={13} />
                                            {role.toUpperCase()}
                                        </span>
                                        <div className="editor-card__pool-champs">
                                            {pool.map((champ, i) => (
                                                <span key={i} className="editor-card__pool-chip">{champ}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="editor-card__actions">
                        <button className="editor-btn editor-btn--edit" onClick={() => onEdit(index)}>
                            <IconEdit size={14} /> Edit
                        </button>
                        <button className="editor-btn editor-btn--delete" onClick={() => onDelete(index)}>
                            <IconDelete size={14} /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Edit Modal (Composition) ───────────────────────────────────────────
function CompEditModal({ comp, onSave, onCancel }) {
    const [form, setForm] = useState(JSON.parse(JSON.stringify(comp || {
        best_in_meta: false,
        name: '',
        roles: { top: '', jungle: '', mid: '', adc: '', support: '' },
        good_against: '',
        bad_against: '',
        difficulty: '',
        key_focus: '',
    })));

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
    const updateRole = (role, value) => setForm(prev => ({
        ...prev,
        roles: { ...prev.roles, [role]: value },
    }));

    return (
        <div className="editor-modal__overlay" onClick={onCancel}>
            <div className="editor-modal" onClick={e => e.stopPropagation()}>
                <h2 className="editor-modal__title">{comp ? 'Edit Composition' : 'New Composition'}</h2>

                <div className="editor-modal__field">
                    <label>Name</label>
                    <input value={form.name} onChange={e => updateField('name', e.target.value)} />
                </div>

                <div className="editor-modal__field editor-modal__field--check">
                    <label>
                        <input type="checkbox" checked={form.best_in_meta}
                            onChange={e => updateField('best_in_meta', e.target.checked)} />
                        Best in Meta
                    </label>
                </div>

                <div className="editor-modal__roles-grid">
                    {ROLES_ORDER.map(role => (
                        <div key={role} className="editor-modal__field">
                            <label>
                                <RoleIcon role={role} size={13} style={{ marginRight: 6 }} />
                                {role.toUpperCase()}
                            </label>
                            <input value={form.roles[role] || ''} onChange={e => updateRole(role, e.target.value)} />
                        </div>
                    ))}
                </div>

                <div className="editor-modal__field">
                    <label>
                        <IconGood size={13} style={{ marginRight: 6 }} />
                        Good Against
                    </label>
                    <input value={form.good_against} onChange={e => updateField('good_against', e.target.value)} />
                </div>
                <div className="editor-modal__field">
                    <label>
                        <IconBad size={13} style={{ marginRight: 6 }} />
                        Bad Against
                    </label>
                    <input value={form.bad_against} onChange={e => updateField('bad_against', e.target.value)} />
                </div>
                <div className="editor-modal__field">
                    <label>
                        <IconDifficulty size={13} style={{ marginRight: 6 }} />
                        Difficulty
                    </label>
                    <input value={form.difficulty} onChange={e => updateField('difficulty', e.target.value)} />
                </div>
                <div className="editor-modal__field">
                    <label>
                        <IconFocus size={13} style={{ marginRight: 6 }} />
                        Key Focus
                    </label>
                    <textarea value={form.key_focus} onChange={e => updateField('key_focus', e.target.value)} rows={3} />
                </div>

                <div className="editor-modal__actions">
                    <button className="editor-btn editor-btn--cancel" onClick={onCancel}>Cancel</button>
                    <button className="editor-btn editor-btn--save" onClick={() => onSave(form)}>
                        <IconSave size={14} /> Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Edit Modal (Archetype) ─────────────────────────────────────────────
function ArchEditModal({ arch, onSave, onCancel, allChampions = [] }) {
    const [form, setForm] = useState(JSON.parse(JSON.stringify(arch || {
        name: '',
        description: '',
        notes: '',
        examples: '',
        typical_comp: { top: '', jungle: '', mid: '', adc: '', support: '' },
        champion_pool: { top: [], jungle: [], mid: [], adc: [], support: [] },
        pro_games_info: '',
    })));

    if (!form.typical_comp) form.typical_comp = { top: '', jungle: '', mid: '', adc: '', support: '' };

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const [editingRole, setEditingRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSlotClick = (role) => { setEditingRole(role); setSearchTerm(''); };

    const handleSelectChampion = (champName) => {
        if (editingRole) {
            setForm(prev => ({
                ...prev,
                typical_comp: { ...prev.typical_comp, [editingRole]: champName }
            }));
            setEditingRole(null);
        }
    };

    const handleRemoveChampion = (role, e) => {
        e.stopPropagation();
        setForm(prev => ({
            ...prev,
            typical_comp: { ...prev.typical_comp, [role]: '' }
        }));
    };

    const toggleFlex = (role, e) => {
        e.stopPropagation();
        const current = form.typical_comp[role];
        if (!current) return;
        const newVal = current.endsWith('*') ? current.slice(0, -1) : current + '*';
        setForm(prev => ({
            ...prev,
            typical_comp: { ...prev.typical_comp, [role]: newVal }
        }));
    };

    const updatePool = (role, value) => {
        const champs = value.split(',').map(s => s.trim()).filter(Boolean);
        setForm(prev => ({
            ...prev,
            champion_pool: { ...prev.champion_pool, [role]: champs },
        }));
    };

    const filteredChampions = allChampions
        .filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort();

    return (
        <div className="editor-modal__overlay" onClick={onCancel}>
            <div className="editor-modal editor-modal--wide" onClick={e => e.stopPropagation()}>
                <h2 className="editor-modal__title">{arch ? 'Edit Archetype' : 'New Archetype'}</h2>

                <div className="editor-modal__field">
                    <label>Name</label>
                    <input value={form.name} onChange={e => updateField('name', e.target.value)} />
                </div>
                <div className="editor-modal__field">
                    <label>
                        <IconExamples size={13} style={{ marginRight: 6 }} />
                        Examples / Strategy
                    </label>
                    <textarea value={form.examples} onChange={e => updateField('examples', e.target.value)} rows={3} />
                </div>

                <div className="editor-modal__section-label">Typical Comp (Define Roles &amp; Flex Picks *)</div>

                <div className="builder-slots-grid" style={{ marginBottom: '20px' }}>
                    {ROLES_ORDER.map(role => {
                        const rawName = form.typical_comp[role] || '';
                        const isFlex = rawName.endsWith('*');
                        const champName = isFlex ? rawName.slice(0, -1) : rawName;

                        return (
                            <div
                                key={role}
                                className={`builder-slot ${champName ? 'filled' : ''}`}
                                onClick={() => handleSlotClick(role)}
                                style={{ height: '120px', cursor: 'pointer', position: 'relative' }}
                            >
                                <span className="builder-slot-label">
                                    <RoleIcon role={role} size={14} style={{ marginRight: 4 }} />
                                    {role.toUpperCase()}
                                </span>
                                {champName ? (
                                    <>
                                        <span className="builder-champ-name">{champName}</span>
                                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                            <button
                                                className={`editor-chip ${isFlex ? 'editor-chip--flex-active' : ''}`}
                                                onClick={(e) => toggleFlex(role, e)}
                                                title="Toggle Flex Pick priority"
                                                style={{
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    border: '1px solid var(--hextech-gold-dim)',
                                                    background: isFlex ? 'var(--hextech-gold)' : 'transparent',
                                                    color: isFlex ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    borderRadius: '0',
                                                    fontFamily: 'var(--font-display)',
                                                    fontWeight: 700,
                                                    letterSpacing: '1px',
                                                }}
                                            >
                                                {isFlex ? '★ FLEX' : 'Flex?'}
                                            </button>
                                        </div>
                                        <button
                                            onClick={(e) => handleRemoveChampion(role, e)}
                                            className="builder-remove-btn"
                                            style={{ top: '4px', right: '4px' }}
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '20px', opacity: 0.2, fontFamily: 'var(--font-display)' }}>+</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {editingRole && (
                    <div className="champion-picker-overlay" onClick={() => setEditingRole(null)}>
                        <div className="champion-picker" onClick={e => e.stopPropagation()}>
                            <div className="champion-picker__header">
                                <h3>Select {editingRole}</h3>
                                <input
                                    autoFocus
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="champion-picker__grid">
                                {filteredChampions.map(c => (
                                    <div
                                        key={c}
                                        className="champion-picker__item"
                                        onClick={() => handleSelectChampion(c)}
                                    >
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="editor-modal__section-label">Champion Pool (comma separated)</div>
                <div className="editor-modal__pool-inputs">
                    {ROLES_ORDER.map(role => (
                        <div key={role} className="editor-modal__field">
                            <label>
                                <RoleIcon role={role} size={13} style={{ marginRight: 6 }} />
                                {role.toUpperCase()}
                            </label>
                            <input
                                value={(form.champion_pool?.[role] || []).join(', ')}
                                onChange={e => updatePool(role, e.target.value)}
                                placeholder="Champ1, Champ2, Champ3"
                            />
                        </div>
                    ))}
                </div>

                <div className="editor-modal__actions">
                    <button className="editor-btn editor-btn--cancel" onClick={onCancel}>Cancel</button>
                    <button className="editor-btn editor-btn--save" onClick={() => onSave(form)}>
                        <IconSave size={14} /> Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Editor ────────────────────────────────────────────────────────
export default function CompositionsEditor({ onBack, allChampions = [] }) {
    const [data, setData] = useState(JSON.parse(JSON.stringify(initialData)));
    const [activeTab, setActiveTab] = useState('compositions');
    const [editingComp, setEditingComp] = useState(null);
    const [editingArch, setEditingArch] = useState(null);
    const [showExport, setShowExport] = useState(false);

    // ─── Composition CRUD ───────────────────────────────────────
    const handleSaveComp = useCallback((form) => {
        setData(prev => {
            const next = { ...prev, compositions: [...prev.compositions] };
            if (editingComp.index === -1) next.compositions.push(form);
            else next.compositions[editingComp.index] = form;
            return next;
        });
        setEditingComp(null);
    }, [editingComp]);

    const handleDeleteComp = useCallback((index) => {
        if (!confirm('Delete this composition?')) return;
        setData(prev => ({
            ...prev,
            compositions: prev.compositions.filter((_, i) => i !== index),
        }));
    }, []);

    // ─── Archetype CRUD ─────────────────────────────────────────
    const handleSaveArch = useCallback((form) => {
        setData(prev => {
            const next = { ...prev, archetypes: [...prev.archetypes] };
            if (editingArch.index === -1) next.archetypes.push(form);
            else next.archetypes[editingArch.index] = form;
            return next;
        });
        setEditingArch(null);
    }, [editingArch]);

    const handleDeleteArch = useCallback((index) => {
        if (!confirm('Delete this archetype?')) return;
        setData(prev => ({
            ...prev,
            archetypes: prev.archetypes.filter((_, i) => i !== index),
        }));
    }, []);

    // ─── Export ──────────────────────────────────────────────────
    const exportJSON = () => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compositions.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyJSON = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setShowExport(false);
    };

    return (
        <div className="editor-page">
            {/* Unified back navigation */}
            <ViewHeader title="Compositions Editor" onBack={onBack}>
                <button className="editor-btn editor-btn--export" onClick={() => setShowExport(!showExport)}>
                    <IconExport size={14} /> Export
                </button>
            </ViewHeader>

            {showExport && (
                <div className="editor-export-bar animate-entry">
                    <button className="editor-btn editor-btn--save" onClick={exportJSON}>
                        <IconSave size={14} /> Download JSON
                    </button>
                    <button className="editor-btn editor-btn--edit" onClick={copyJSON}>
                        <IconClipboard size={14} /> Copy to Clipboard
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="editor-tabs">
                <button
                    className={`editor-tab ${activeTab === 'compositions' ? 'editor-tab--active' : ''}`}
                    onClick={() => setActiveTab('compositions')}
                >
                    <IconCompositions size={15} style={{ marginRight: 8 }} />
                    Compositions ({data.compositions.length})
                </button>
                <button
                    className={`editor-tab ${activeTab === 'archetypes' ? 'editor-tab--active' : ''}`}
                    onClick={() => setActiveTab('archetypes')}
                >
                    <IconArchetypes size={15} style={{ marginRight: 8 }} />
                    Archetypes ({data.archetypes.length})
                </button>
            </div>

            {/* Content */}
            <div className="editor-content">
                {activeTab === 'compositions' && (
                    <>
                        <div className="editor-cards">
                            {data.compositions.map((comp, i) => (
                                <CompCard
                                    key={`${comp.name}-${i}`}
                                    comp={comp}
                                    index={i}
                                    onEdit={(idx) => setEditingComp({ index: idx, item: data.compositions[idx] })}
                                    onDelete={handleDeleteComp}
                                />
                            ))}
                        </div>
                        <button className="editor-btn editor-btn--add" onClick={() => setEditingComp({ index: -1, item: null })}>
                            + Add Composition
                        </button>
                    </>
                )}

                {activeTab === 'archetypes' && (
                    <>
                        <div className="editor-cards">
                            {data.archetypes.map((arch, i) => (
                                <ArchetypeCard
                                    key={`${arch.name}-${i}`}
                                    arch={arch}
                                    index={i}
                                    onEdit={(idx) => setEditingArch({ index: idx, item: data.archetypes[idx] })}
                                    onDelete={handleDeleteArch}
                                />
                            ))}
                        </div>
                        <button className="editor-btn editor-btn--add" onClick={() => setEditingArch({ index: -1, item: null })}>
                            + Add Archetype
                        </button>
                    </>
                )}
            </div>

            {/* Modals */}
            {editingComp && (
                <CompEditModal
                    comp={editingComp.item}
                    onSave={handleSaveComp}
                    onCancel={() => setEditingComp(null)}
                />
            )}
            {editingArch && (
                <ArchEditModal
                    arch={editingArch.item}
                    onSave={handleSaveArch}
                    onCancel={() => setEditingArch(null)}
                    allChampions={allChampions}
                />
            )}
        </div>
    );
}
