import React, { useState, useEffect, useCallback } from 'react';
import { RoleIcon } from './HextechIcons';
import ViewHeader from './ViewHeader';

const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];
const ROLE_LABELS = { top: 'Top', jungle: 'Jungle', mid: 'Mid', adc: 'Bot', support: 'Support' };

// ─── Score Ring Component ──────────────────────────────────────────────────────
function ScoreRing({ value, max = 100, color = '#c8aa6e', size = 72 }) {
    const r = size / 2 - 6;
    const circ = 2 * Math.PI * r;
    const filled = (value / max) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={5}
                strokeDasharray={`${filled} ${circ - filled}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
        </svg>
    );
}

// ─── Champion Slot ─────────────────────────────────────────────────────────────
function ChampSlot({ role, name, winRate }) {
    const hasPick = Boolean(name);
    const wrColor = !winRate ? '#aaa' : winRate > 0.52 ? '#6ee087' : winRate < 0.48 ? '#c9736e' : '#c8aa6e';
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            padding: '14px 10px', background: hasPick ? 'var(--bg-secondary)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${hasPick ? 'var(--border-active, #c8aa6e44)' : 'var(--border)'}`,
            borderRadius: '6px', minWidth: '90px', flex: 1,
            transition: 'all 0.2s',
        }}>
            <RoleIcon role={role} size={18} />
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {ROLE_LABELS[role]}
            </span>
            {hasPick ? (
                <>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>
                        {name}
                    </span>
                    {winRate && (
                        <span style={{ fontSize: '11px', color: wrColor, fontWeight: '600' }}>
                            {(winRate * 100).toFixed(1)}% WR
                        </span>
                    )}
                </>
            ) : (
                <span style={{ fontSize: '22px', opacity: 0.15 }}>?</span>
            )}
        </div>
    );
}

// ─── ClashPlan ────────────────────────────────────────────────────────────────
const ClashPlan = ({ onBack }) => {
    const [team, setTeam] = useState({ top: '', jungle: '', mid: '', adc: '', support: '' });
    const [synergy, setSynergy] = useState(null);
    const [compositions, setCompositions] = useState([]);
    const [selectedComp, setSelectedComp] = useState('');
    const [statsMap, setStatsMap] = useState({});
    const [banRecs, setBanRecs] = useState([]);
    const [copied, setCopied] = useState(false);
    const [archetypeKey, setArchetypeKey] = useState('');

    const ARCHETYPE_OPTIONS = [
        { key: '', label: 'Auto Detect' },
        { key: 'hardEngage', label: '⚔️ Hard Engage' },
        { key: 'protect', label: '🛡️ Protect Carry' },
        { key: 'dive', label: '🗡️ Dive / Pick' },
        { key: 'poke', label: '🏹 Poke / Siege' },
        { key: 'splitpush', label: '🔱 Splitpush' },
        { key: 'teamfight', label: '💥 Wombo Combo' },
    ];

    // Load compositions from storage
    useEffect(() => {
        window.electronAPI?.getAllCompositions?.().then(data => {
            if (data?.compositions) setCompositions(data.compositions);
        });
    }, []);

    // When a composition is selected, populate the team
    useEffect(() => {
        if (!selectedComp) return;
        const comp = compositions.find(c => c.name === selectedComp);
        if (comp?.roles) {
            const normalized = {
                top: comp.roles.top || '',
                jungle: comp.roles.jungle || '',
                mid: comp.roles.mid || '',
                adc: comp.roles.adc || '',
                support: comp.roles.support || '',
            };
            setTeam(normalized);
        }
    }, [selectedComp]);

    // Fetch stats + synergy when team changes
    useEffect(() => {
        const filledRoles = Object.entries(team).filter(([, v]) => v);
        if (filledRoles.length === 0) { setSynergy(null); return; }

        // Fetch stats per champion
        filledRoles.forEach(([role, name]) => {
            const key = `${name}-${role}`;
            if (!statsMap[key] && window.electronAPI?.getChampionStats) {
                window.electronAPI.getChampionStats(name, role, 'soloq').then(s => {
                    if (s) setStatsMap(prev => ({ ...prev, [key]: s }));
                });
            }
        });

        // Synergy analysis
        if (filledRoles.length >= 2 && window.electronAPI?.analyzeTeamSynergy) {
            window.electronAPI.analyzeTeamSynergy({ teamRoles: team, archetypeKey })
                .then(r => { if (r) setSynergy(r); });
        }
    }, [team, archetypeKey]);

    // Derive ban recommendations from gaps
    useEffect(() => {
        if (!synergy?.gaps?.length) { setBanRecs([]); return; }
        // Map common gaps to what counters the strategy
        const gapBanMap = {
            'No engage tool': ['Yasuo', 'Yone', 'Zed'],
            'No frontline/tank': ['Darius', 'Garen', 'Malphite'],
            'No peel support': ['Lulu', 'Janna', 'Soraka'],
            'No hypercarry': ['Jinx', 'Vayne', 'Kog\'Maw'],
            'No primary DPS': ['Miss Fortune', 'Jinx', 'Ezreal'],
            'No poke/ranged damage': ['Ezreal', 'Lux', 'Xerath'],
        };
        const recs = new Set();
        for (const gap of synergy.gaps) {
            const mapped = gapBanMap[gap] || [];
            mapped.forEach(b => recs.add(b));
        }
        setBanRecs([...recs].slice(0, 3));
    }, [synergy]);

    const handleCopyPlan = useCallback(() => {
        const lines = [
            '╔══════════════════════════════╗',
            '║      LEAGUE COMPOSER PLAN    ║',
            '╚══════════════════════════════╝',
            '',
            '──── TEAM COMPOSITION ────',
            ...ROLES.map(r => `  ${ROLE_LABELS[r].padEnd(8)} → ${team[r] || '(empty)'}`),
            '',
            '──── SYNERGY ────',
            `  Score: ${synergy?.avgScore ?? '—'}/10  (${synergy?.label ?? 'No data'})`,
            '',
            synergy?.gaps?.length ? `  ⚠ Gaps: ${synergy.gaps.join(', ')}` : '  ✓ No critical gaps',
            synergy?.strengths?.length ? `  ✓ Strengths: ${synergy.strengths.join(', ')}` : '',
            '',
            banRecs.length ? `──── TOP BANS TO CONSIDER ────\n  ${banRecs.join(' · ')}` : '',
        ].filter(l => l !== undefined).join('\n');

        navigator.clipboard.writeText(lines).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [team, synergy, banRecs]);

    const avgWR = (() => {
        const wrs = ROLES.map(r => {
            const key = `${team[r]}-${r}`;
            return statsMap[key]?.winRate;
        }).filter(Boolean);
        return wrs.length ? wrs.reduce((a, b) => a + b, 0) / wrs.length : null;
    })();

    const metaScore = avgWR ? Math.round(((avgWR - 0.45) / 0.10) * 60 + (synergy?.avgScore || 0) * 4) : null;
    const tier = !metaScore ? '—' : metaScore >= 85 ? 'S' : metaScore >= 70 ? 'A' : metaScore >= 55 ? 'B' : metaScore >= 40 ? 'C' : 'D';
    const tierColor = { S: '#6ee087', A: '#c8aa6e', B: '#9ab3c0', C: '#b8955e', D: '#c9736e' }[tier] || '#aaa';
    const synergyColor = !synergy?.avgScore ? '#aaa' : synergy.avgScore >= 7 ? '#6ee087' : synergy.avgScore >= 5 ? '#c8aa6e' : '#c9736e';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <ViewHeader title="Clash Plan" onBack={onBack}>
                <button
                    className="editor-btn editor-btn--primary"
                    onClick={handleCopyPlan}
                    style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                    {copied ? '✓ Copied!' : '📋 Copy Plan'}
                </button>
            </ViewHeader>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                {/* Composition Loader */}
                {compositions.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={s.label}>Load from saved composition</label>
                        <select
                            value={selectedComp}
                            onChange={e => setSelectedComp(e.target.value)}
                            style={s.select}
                        >
                            <option value="">— Manual Entry —</option>
                            {compositions.map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Archetype Selector */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label style={s.label}>Target Archetype</label>
                        <select value={archetypeKey} onChange={e => setArchetypeKey(e.target.value)} style={s.select}>
                            {ARCHETYPE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Champion Slots */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={s.section}>TEAM COMPOSITION</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {ROLES.map(role => (
                            <div key={role} style={{ flex: '1 1 80px' }}>
                                {/* Inline input for manual entry */}
                                <input
                                    value={team[role]}
                                    onChange={e => setTeam(prev => ({ ...prev, [role]: e.target.value }))}
                                    placeholder={ROLE_LABELS[role]}
                                    style={{ ...s.input, marginBottom: '6px' }}
                                />
                                <ChampSlot
                                    role={role}
                                    name={team[role]}
                                    winRate={statsMap[`${team[role]}-${role}`]?.winRate}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Score Summary */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {/* Meta Score */}
                    <div style={s.scoreCard}>
                        <div style={{ position: 'relative', width: 72, height: 72 }}>
                            <ScoreRing value={metaScore ?? 0} max={100} color={tierColor} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: tierColor, lineHeight: 1 }}>{tier}</span>
                            </div>
                        </div>
                        <div>
                            <div style={s.scoreLabel}>Meta Score</div>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: tierColor }}>{metaScore ?? '—'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>out of 100</div>
                        </div>
                    </div>

                    {/* Synergy Score */}
                    <div style={s.scoreCard}>
                        <div style={{ position: 'relative', width: 72, height: 72 }}>
                            <ScoreRing value={(synergy?.avgScore ?? 0) * 10} max={100} color={synergyColor} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: synergyColor, lineHeight: 1 }}>
                                    {synergy?.avgScore ?? '—'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div style={s.scoreLabel}>Synergy</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: synergyColor }}>{synergy?.label ?? 'No data'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{synergy?.pairCount ?? 0} pairs analyzed</div>
                        </div>
                    </div>

                    {/* Avg Win Rate */}
                    {avgWR && (
                        <div style={s.scoreCard}>
                            <div style={{ position: 'relative', width: 72, height: 72 }}>
                                <ScoreRing value={Math.round((avgWR - 0.45) / 0.10 * 100)} max={100} color="#c8aa6e" />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#c8aa6e', lineHeight: 1 }}>
                                        {(avgWR * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div style={s.scoreLabel}>Avg Win Rate</div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: '#c8aa6e' }}>{(avgWR * 100).toFixed(1)}%</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>team average</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gaps & Strengths */}
                {synergy && (
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {synergy.gaps?.length > 0 && (
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={s.section}>GAPS</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {synergy.gaps.map(g => (
                                        <span key={g} style={s.gapChip}>⚠️ {g}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {synergy.strengths?.length > 0 && (
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={s.section}>STRENGTHS</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {synergy.strengths.map(str => (
                                        <span key={str} style={s.strengthChip}>✅ {str}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Ban Recommendations */}
                {banRecs.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={s.section}>TOP BAN TARGETS</div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            These champions exploit your composition's identified gaps.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {banRecs.map((ban, idx) => (
                                <div key={ban} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px',
                                    background: 'rgba(201,115,110,0.1)', border: '1px solid hsl(0,45%,30%)',
                                    borderRadius: '6px', flex: '1 1 120px',
                                }}>
                                    <span style={{ fontSize: '16px', color: '#c9736e', fontWeight: '700' }}>#{idx + 1}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>BAN {ban}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Shared Styles ────────────────────────────────────────────────────────────
const s = {
    label: {
        display: 'block', fontSize: '11px', color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px',
    },
    select: {
        width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)',
        border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '13px',
    },
    input: {
        width: '100%', padding: '5px 8px', background: 'var(--bg-secondary)',
        border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px',
        fontSize: '12px', boxSizing: 'border-box',
    },
    section: {
        fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase',
        letterSpacing: '0.08em', fontWeight: '700', marginBottom: '10px',
        borderBottom: '1px solid var(--border)', paddingBottom: '6px',
    },
    scoreCard: {
        display: 'flex', gap: '14px', alignItems: 'center',
        padding: '16px', background: 'var(--bg-secondary)',
        border: '1px solid var(--border)', borderRadius: '8px',
        flex: '1 1 200px',
    },
    scoreLabel: {
        fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase',
        letterSpacing: '0.05em', marginBottom: '4px',
    },
    gapChip: {
        background: 'hsl(0,45%,18%)', border: '1px solid hsl(0,45%,30%)',
        color: '#c9736e', fontSize: '11px', padding: '3px 10px', borderRadius: '12px',
    },
    strengthChip: {
        background: 'hsl(142,45%,16%)', border: '1px solid hsl(142,45%,28%)',
        color: '#6ee087', fontSize: '11px', padding: '3px 10px', borderRadius: '12px',
    },
};

export default ClashPlan;
