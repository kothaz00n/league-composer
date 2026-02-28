import React, { useMemo } from 'react';

// ─── Synergy Color Mapping ────────────────────────────────────────────────────
// Score 0-10 → color tokens (no purple/violet)
function scoreToColor(score) {
    if (score >= 8) return { bg: 'hsl(142, 55%, 28%)', text: '#6ee087', border: 'hsl(142, 55%, 40%)' };
    if (score >= 6) return { bg: 'hsl(142, 40%, 20%)', text: '#4dc96d', border: 'hsl(142, 40%, 32%)' };
    if (score >= 4) return { bg: 'hsl(43, 45%, 20%)', text: '#c8aa6e', border: 'hsl(43, 45%, 35%)' };
    if (score >= 2) return { bg: 'hsl(30, 40%, 18%)', text: '#b8955e', border: 'hsl(30, 40%, 30%)' };
    return { bg: 'hsl(0, 45%, 18%)', text: '#c9736e', border: 'hsl(0, 45%, 30%)' };
}

function ScoreBar({ score }) {
    const pct = (score / 10) * 100;
    const { border } = scoreToColor(score);
    return (
        <div style={{
            height: '3px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
            marginTop: '4px',
            overflow: 'hidden',
        }}>
            <div style={{
                height: '100%',
                width: `${pct}%`,
                background: border,
                borderRadius: '2px',
                transition: 'width 0.4s ease',
            }} />
        </div>
    );
}

/**
 * SynergyHeatmap — Displays a 5x5 pairwise synergy grid for a team.
 *
 * Props:
 *   matrix: Array from getTeamSynergyMatrix().matrix
 *   teamRoles: { top, jungle, mid, adc, support } - champion names
 *   avgScore: number - overall team synergy (0-10)
 *   label: string - overall label
 *   loading: boolean
 */
const SynergyHeatmap = ({ matrix = [], teamRoles = {}, avgScore = 0, label = '', loading = false }) => {
    const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];
    const ROLE_LABELS = { top: 'Top', jungle: 'JGL', mid: 'Mid', adc: 'ADC', support: 'SUP' };

    // Build lookup: "champA|champB" → cell data
    const cellMap = useMemo(() => {
        const map = {};
        matrix.forEach(entry => {
            map[`${entry.champA}|${entry.champB}`] = entry;
            map[`${entry.champB}|${entry.champA}`] = entry; // bidirectional
        });
        return map;
    }, [matrix]);

    const filledRoles = ROLES.filter(r => teamRoles[r]);
    const hasData = filledRoles.length >= 2;

    if (loading) {
        return (
            <div style={styles.emptyState}>
                <span style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️</span>
                <span>Analyzing synergy...</span>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div style={styles.emptyState}>
                <span style={{ fontSize: '24px', marginBottom: '8px' }}>🔗</span>
                <span>Select 2+ champions to see synergy</span>
            </div>
        );
    }

    const overallColor = scoreToColor(avgScore);

    return (
        <div style={styles.wrapper}>
            {/* Overall Score Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ ...styles.overallScore, color: overallColor.text }}>
                        {avgScore.toFixed(1)}
                    </span>
                    <span style={styles.overallLabel}>{label}</span>
                </div>
                <span style={styles.overallSub}>Team Synergy</span>
            </div>

            {/* Grid */}
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.cornerCell} />
                            {filledRoles.map(role => (
                                <th key={role} style={styles.headerCell}>
                                    <span style={styles.roleLabel}>{ROLE_LABELS[role]}</span>
                                    <span style={styles.champName}>{teamRoles[role]?.split(' ')[0]}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filledRoles.map((roleA) => (
                            <tr key={roleA}>
                                <td style={styles.rowHeaderCell}>
                                    <span style={styles.roleLabel}>{ROLE_LABELS[roleA]}</span>
                                    <span style={styles.champName}>{teamRoles[roleA]?.split(' ')[0]}</span>
                                </td>
                                {filledRoles.map((roleB) => {
                                    if (roleA === roleB) {
                                        return (
                                            <td key={roleB} style={styles.selfCell}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>—</span>
                                            </td>
                                        );
                                    }
                                    const cell = cellMap[`${teamRoles[roleA]}|${teamRoles[roleB]}`];
                                    if (!cell) {
                                        return <td key={roleB} style={styles.selfCell}><span style={{ opacity: 0.3 }}>?</span></td>;
                                    }
                                    const colors = scoreToColor(cell.score);
                                    return (
                                        <td
                                            key={roleB}
                                            style={{ ...styles.cell, background: colors.bg, borderColor: colors.border }}
                                            title={`${cell.champA} + ${cell.champB}: ${cell.reason}`}
                                        >
                                            <span style={{ color: colors.text, fontSize: '15px', fontWeight: 'bold' }}>
                                                {cell.score}
                                            </span>
                                            <ScoreBar score={cell.score} />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div style={styles.legend}>
                {[
                    { color: '#6ee087', label: '8-10 Exceptional' },
                    { color: '#c8aa6e', label: '4-7 Decent' },
                    { color: '#c9736e', label: '0-3 Weak' },
                ].map(item => (
                    <span key={item.label} style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, background: item.color }} />
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    wrapper: {
        padding: '12px 0',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '16px',
    },
    overallScore: {
        fontSize: '28px',
        fontWeight: '700',
        fontFamily: 'var(--font-heading, monospace)',
        lineHeight: 1,
    },
    overallLabel: {
        fontSize: '13px',
        color: 'var(--text-primary)',
        fontWeight: '600',
    },
    overallSub: {
        fontSize: '11px',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    table: {
        borderCollapse: 'separate',
        borderSpacing: '3px',
        width: '100%',
    },
    cornerCell: {
        width: '60px',
    },
    headerCell: {
        textAlign: 'center',
        padding: '6px 4px',
        minWidth: '70px',
    },
    rowHeaderCell: {
        textAlign: 'right',
        padding: '6px 8px 6px 4px',
        verticalAlign: 'middle',
    },
    roleLabel: {
        display: 'block',
        fontSize: '9px',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        letterSpacing: '0.05em',
        marginBottom: '2px',
    },
    champName: {
        display: 'block',
        fontSize: '11px',
        color: 'var(--text-primary)',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '64px',
    },
    cell: {
        padding: '8px 6px',
        textAlign: 'center',
        borderRadius: '4px',
        border: '1px solid',
        cursor: 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        verticalAlign: 'middle',
    },
    selfCell: {
        textAlign: 'center',
        padding: '8px 6px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.06)',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        color: 'var(--text-secondary)',
        fontSize: '13px',
        gap: '4px',
        textAlign: 'center',
    },
    legend: {
        display: 'flex',
        gap: '16px',
        marginTop: '12px',
        flexWrap: 'wrap',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        color: 'var(--text-secondary)',
    },
    legendDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        flexShrink: 0,
    },
};

export default SynergyHeatmap;
