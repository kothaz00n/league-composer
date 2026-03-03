import React, { useState, useEffect, useCallback } from 'react';
import CompAnalysis from './CompAnalysis';
import RecommendationPanel from './RecommendationPanel';
import ViewHeader from './ViewHeader';
import { IconGame, IconInsight } from './HextechIcons';

// All compositions from compositions.json — used as scenario list
const SCENARIOS = [
    'Hard Engage (Wombo Combo)',
    'Dive',
    'Peel ADC (Protect comp)',
    'Anti Engage',
    'Pick (Catch)',
    'Poke (Siege)',
    'Early game',
    '1-3-1',
    'Mid game Teamfights',
    'Simple Scaling Teamfight',
];

const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];
const ROLE_LABELS = { top: 'TOP', jungle: 'JGL', mid: 'MID', adc: 'ADC', support: 'SUP' };

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com/cdn';

function getIcon(champName, version = '14.3.1') {
    if (!champName) return null;
    const clean = champName.split('/')[0].replace(/\*/g, '').trim();
    if (!clean) return null;
    return `${DDRAGON_BASE}/${version}/img/champion/${clean}.png`;
}

// ─── Scenario Selector Card ────────────────────────────────────────────────
function ScenarioCard({ scenario, isSelected, onClick }) {
    const metaScenarios = ['Dive', 'Peel ADC (Protect comp)', 'Mid game Teamfights'];
    const isMeta = metaScenarios.includes(scenario);

    return (
        <button
            className={`preview-scenario-card ${isSelected ? 'preview-scenario-card--active' : ''}`}
            onClick={onClick}
        >
            {isMeta && <span className="preview-scenario-card__meta">META</span>}
            <span className="preview-scenario-card__name">{scenario}</span>
        </button>
    );
}

// ─── Ally Row inside Preview ───────────────────────────────────────────────
function PreviewAllySlot({ ally, isActiveRole, version, onClick }) {
    const icon = getIcon(ally.champName, version);
    return (
        <div
            className={`preview-ally-slot ${isActiveRole ? 'preview-ally-slot--active' : ''}`}
            onClick={onClick}
            title={`View recommendations for ${ROLE_LABELS[ally.role] || ally.role}`}
        >
            <div className="preview-ally-slot__avatar">
                {icon ? (
                    <img src={icon} alt={ally.champName} loading="lazy" />
                ) : (
                    <span className="preview-ally-slot__placeholder">?</span>
                )}
            </div>
            <div className="preview-ally-slot__info">
                <span className="preview-ally-slot__name">
                    {ally.champName || '—'}
                </span>
                <span className="preview-ally-slot__role">
                    {ROLE_LABELS[ally.role] || ally.role}
                </span>
            </div>
            {isActiveRole && (
                <div className="preview-ally-slot__active-dot" title="Viewing recs for this role" />
            )}
        </div>
    );
}

// ─── Comp Meta Card ────────────────────────────────────────────────────────
function CompMetaCard({ meta }) {
    if (!meta) return null;
    return (
        <div className="preview-meta-card">
            <div className="preview-meta-card__header">
                {meta.best_in_meta && (
                    <span className="preview-meta-card__badge">✦ META PICK</span>
                )}
            </div>
            <div className="preview-meta-card__grid">
                <div className="preview-meta-card__item">
                    <span className="preview-meta-card__label">Strong vs</span>
                    <span className="preview-meta-card__value preview-meta-card__value--green">
                        {meta.good_against || '—'}
                    </span>
                </div>
                <div className="preview-meta-card__item">
                    <span className="preview-meta-card__label">Weak vs</span>
                    <span className="preview-meta-card__value preview-meta-card__value--red">
                        {meta.bad_against || '—'}
                    </span>
                </div>
                <div className="preview-meta-card__item preview-meta-card__item--full">
                    <span className="preview-meta-card__label">Key Focus</span>
                    <span className="preview-meta-card__value">
                        {meta.key_focus || '—'}
                    </span>
                </div>
                <div className="preview-meta-card__item preview-meta-card__item--full">
                    <span className="preview-meta-card__label">Difficulty</span>
                    <span className="preview-meta-card__value preview-meta-card__value--muted">
                        {meta.difficulty || '—'}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function DraftPreview({ onBack, championData }) {
    const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
    const [activeRole, setActiveRole] = useState('mid');
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ddVersion, setDdVersion] = useState('14.3.1');

    const fetchPreview = useCallback(async (scenario, role) => {
        if (!window.electronAPI?.getDraftPreview) {
            setError('Preview mode requires Electron. Run the app via npm run dev.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await window.electronAPI.getDraftPreview(scenario, role);
            if (result?.error) {
                setError(result.error);
            } else {
                setPreviewData(result);
                if (result.ddragonVersion) setDdVersion(result.ddragonVersion);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load on mount and when scenario/role changes
    useEffect(() => {
        fetchPreview(selectedScenario, activeRole);
    }, [selectedScenario, activeRole, fetchPreview]);

    const handleScenarioSelect = (scenario) => {
        setSelectedScenario(scenario);
    };

    const handleRoleSelect = (role) => {
        setActiveRole(role);
    };

    return (
        <div className="draft-preview">
            <ViewHeader title="Draft Preview" onBack={onBack}>
                <span className="preview-header-badge">SANDBOX MODE</span>
            </ViewHeader>

            <div className="draft-preview__body">
                {/* ── Left: Scenario Selector ── */}
                <aside className="draft-preview__sidebar">
                    <div className="preview-sidebar-title">Compositions</div>
                    <div className="preview-scenario-list">
                        {SCENARIOS.map(s => (
                            <ScenarioCard
                                key={s}
                                scenario={s}
                                isSelected={s === selectedScenario}
                                onClick={() => handleScenarioSelect(s)}
                            />
                        ))}
                    </div>
                </aside>

                {/* ── Center: Team + Analysis ── */}
                <main className="draft-preview__main">
                    {/* Role tabs */}
                    <div className="preview-role-tabs">
                        <span className="preview-role-tabs__label">View recs for:</span>
                        {ROLES.map(r => (
                            <button
                                key={r}
                                className={`draft-controls__role-btn ${activeRole === r ? 'active' : ''}`}
                                onClick={() => handleRoleSelect(r)}
                            >
                                {ROLE_LABELS[r]}
                            </button>
                        ))}
                    </div>

                    {/* Team grid */}
                    <div className="preview-team">
                        <div className="preview-team__label">ALLY TEAM — {selectedScenario}</div>
                        <div className="preview-team__slots">
                            {(previewData?.allies || ROLES.map(r => ({ role: r, champName: null }))).map((ally) => (
                                <PreviewAllySlot
                                    key={ally.role}
                                    ally={ally}
                                    isActiveRole={ally.role === activeRole}
                                    version={ddVersion}
                                    onClick={() => handleRoleSelect(ally.role)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div className="preview-loading">
                            <span className="preview-loading__dot" />
                            <span className="preview-loading__dot" style={{ animationDelay: '0.15s' }} />
                            <span className="preview-loading__dot" style={{ animationDelay: '0.30s' }} />
                            <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>Analyzing composition...</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="preview-error">
                            <IconGame size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Comp Analysis */}
                    {!loading && !error && previewData?.compositionAnalysis && (
                        <div className="preview-analysis-section">
                            <CompAnalysis compositionAnalysis={previewData.compositionAnalysis} />
                        </div>
                    )}

                    {/* Comp Meta */}
                    {!loading && !error && previewData?.compMeta && (
                        <CompMetaCard meta={previewData.compMeta} />
                    )}
                </main>

                {/* ── Right: Recommendations ── */}
                <aside className="draft-preview__recs">
                    <div className="preview-recs-header">
                        <IconInsight size={14} />
                        <span>Picks for {ROLE_LABELS[activeRole]}</span>
                    </div>
                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                            Loading recommendations...
                        </div>
                    ) : !previewData?.recommendations?.length ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                            No recommendations found for this role.<br />
                            <span style={{ fontSize: '11px', opacity: 0.7 }}>Import win rate data to improve suggestions.</span>
                        </div>
                    ) : (
                        <RecommendationPanel
                            recommendations={previewData.recommendations}
                            role={activeRole}
                            getChampionIcon={(name) => getIcon(name, ddVersion)}
                        />
                    )}
                </aside>
            </div>
        </div>
    );
}
