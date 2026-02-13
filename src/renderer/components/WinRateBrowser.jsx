import React, { useState, useEffect, useCallback } from 'react';

const QUEUE_TABS = [
    { key: 'soloq', label: '🏆 Solo Q' },
    { key: 'flex', label: '👥 Flex' },
];

const ROLE_TABS = ['all', 'top', 'jungle', 'mid', 'adc', 'support'];
const ROLE_LABELS = { all: '🌐 ALL', top: '🗡 TOP', jungle: '🌿 JNG', mid: '🔥 MID', adc: '🏹 ADC', support: '🛡 SUP' };

export default function WinRateBrowser({ allChampions, onBack, onOpenImporter }) {
    const [stats, setStats] = useState({});
    const [importedChamps, setImportedChamps] = useState([]);
    const [selectedQueue, setSelectedQueue] = useState('soloq');
    const [selectedRole, setSelectedRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('winRate');
    const [sortDir, setSortDir] = useState('desc');
    const [loading, setLoading] = useState(true);
    const [showOnlyImported, setShowOnlyImported] = useState(true);
    const [availableQueues, setAvailableQueues] = useState([]);

    // Check which queues have data
    useEffect(() => {
        if (window.electronAPI?.getAvailableQueues) {
            window.electronAPI.getAvailableQueues().then(queues => {
                setAvailableQueues(queues);
            });
        }
    }, []);

    // Fetch the imported champion list for the selected queue+role
    useEffect(() => {
        if (!window.electronAPI?.getImportedChampions) {
            setImportedChamps([]);
            return;
        }

        window.electronAPI.getImportedChampions(
            selectedQueue,
            selectedRole === 'all' ? null : selectedRole
        ).then(list => {
            setImportedChamps(list || []);
        });
    }, [selectedQueue, selectedRole]);

    // Fetch stats for visible champions
    useEffect(() => {
        if (!window.electronAPI?.getChampionStats) {
            setLoading(false);
            return;
        }

        const championsToFetch = showOnlyImported && importedChamps.length > 0
            ? importedChamps
            : allChampions;

        const fetchAll = async () => {
            setLoading(true);
            const results = {};
            const role = selectedRole === 'all' ? null : selectedRole;
            const batchSize = 30;

            for (let i = 0; i < championsToFetch.length; i += batchSize) {
                const batch = championsToFetch.slice(i, i + batchSize);
                const promises = batch.map(async (name) => {
                    try {
                        const data = await window.electronAPI.getChampionStats(name, role, selectedQueue);
                        results[`${name}-${selectedQueue}-${selectedRole}`] = { ...data, name };
                    } catch (e) {
                        results[`${name}-${selectedQueue}-${selectedRole}`] = {
                            name, winRate: 0.50, tier: '?', pickRate: 0, banRate: 0, hasData: false
                        };
                    }
                });
                await Promise.all(promises);
            }

            setStats(prev => ({ ...prev, ...results }));
            setLoading(false);
        };

        fetchAll();
    }, [allChampions, importedChamps, selectedQueue, selectedRole, showOnlyImported]);

    // Build display data
    const championsToShow = showOnlyImported && importedChamps.length > 0
        ? importedChamps
        : allChampions;

    const champList = championsToShow
        .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(name => {
            const key = `${name}-${selectedQueue}-${selectedRole}`;
            const s = stats[key] || { winRate: 0.50, tier: '?', pickRate: 0, banRate: 0, hasData: false };
            return { name, ...s };
        });

    // Sort
    const tierOrder = { 'S+': 0, 'S': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5, '?': 6 };
    champList.sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'winRate') cmp = (a.winRate || 0) - (b.winRate || 0);
        else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortBy === 'tier') cmp = (tierOrder[a.tier] || 6) - (tierOrder[b.tier] || 6);
        else if (sortBy === 'pickRate') cmp = (a.pickRate || 0) - (b.pickRate || 0);
        else if (sortBy === 'banRate') cmp = (a.banRate || 0) - (b.banRate || 0);
        return sortDir === 'desc' ? -cmp : cmp;
    });

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
    };

    const sortIndicator = (field) => {
        if (sortBy !== field) return '';
        return sortDir === 'desc' ? ' ▼' : ' ▲';
    };

    const wrColor = (wr) => {
        if (wr >= 0.53) return '#4ade80';
        if (wr >= 0.51) return '#86efac';
        if (wr >= 0.49) return '#d1d5db';
        if (wr >= 0.47) return '#fca5a5';
        return '#f87171';
    };

    const tierStyle = (tier) => {
        const styles = {
            'S+': { color: '#fde047', bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.3)' },
            'S': { color: '#c9ab66', bg: 'rgba(201,171,102,0.1)', border: 'rgba(201,171,102,0.3)' },
            'A': { color: '#67e8f9', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' },
            'B': { color: '#86efac', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
            'C': { color: '#d1d5db', bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)' },
            'D': { color: '#fca5a5', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
        };
        return styles[tier] || styles['C'];
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onBack} style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: '4px 8px'
                    }}>← Back</button>
                    <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--gold)', margin: 0 }}>Win Rates</h1>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {champList.length} champions {importedChamps.length > 0 ? `(${importedChamps.length} imported)` : ''}
                    </span>
                    <button
                        onClick={onOpenImporter}
                        title="Import Data"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginLeft: '8px'
                        }}
                    >
                        📥
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {importedChamps.length > 0 && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showOnlyImported}
                                onChange={e => setShowOnlyImported(e.target.checked)}
                                style={{ accentColor: 'var(--gold)' }}
                            />
                            Imported only
                        </label>
                    )}
                    <input
                        style={{
                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px', padding: '6px 10px', fontSize: '12px', outline: 'none',
                            color: 'white', width: '160px'
                        }}
                        placeholder="Search champion..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Queue Tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
                {QUEUE_TABS.map(q => (
                    <button
                        key={q.key}
                        onClick={() => setSelectedQueue(q.key)}
                        style={{
                            padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
                            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                            background: selectedQueue === q.key ? 'rgba(201,171,102,0.2)' : 'transparent',
                            color: selectedQueue === q.key ? 'var(--gold)' : 'var(--text-muted)',
                            outline: selectedQueue === q.key ? '1px solid rgba(201,171,102,0.3)' : 'none',
                        }}
                    >
                        {q.label}
                        {!availableQueues.includes(q.key) && (
                            <span style={{ fontSize: '9px', marginLeft: '4px', opacity: 0.5 }}>○</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Role Tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '6px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {ROLE_TABS.map(r => (
                    <button
                        key={r}
                        onClick={() => setSelectedRole(r)}
                        style={{
                            padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                            background: selectedRole === r ? 'rgba(201,171,102,0.15)' : 'transparent',
                            color: selectedRole === r ? 'var(--gold)' : 'var(--text-muted)',
                            outline: selectedRole === r ? '1px solid rgba(201,171,102,0.2)' : 'none',
                        }}
                    >
                        {ROLE_LABELS[r]}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        Loading stats...
                    </div>
                ) : champList.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '8px' }}>
                        <span style={{ fontSize: '32px' }}>📭</span>
                        <span>No data for {selectedQueue === 'soloq' ? 'Solo Queue' : 'Flex'} — {ROLE_LABELS[selectedRole]}</span>
                        <span style={{ fontSize: '11px' }}>Import data from the Dashboard → Import icon</span>
                    </div>
                ) : (
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 1 }}>
                                <ThCell onClick={() => toggleSort('name')} align="left">Champion{sortIndicator('name')}</ThCell>
                                <ThCell onClick={() => toggleSort('tier')}>Tier{sortIndicator('tier')}</ThCell>
                                <ThCell onClick={() => toggleSort('winRate')}>Win Rate{sortIndicator('winRate')}</ThCell>
                                <ThCell onClick={() => toggleSort('pickRate')}>Pick %{sortIndicator('pickRate')}</ThCell>
                                <ThCell onClick={() => toggleSort('banRate')}>Ban %{sortIndicator('banRate')}</ThCell>
                                <ThCell>WR Bar</ThCell>
                            </tr>
                        </thead>
                        <tbody>
                            {champList.map((champ, idx) => {
                                const ts = tierStyle(champ.tier);
                                const wrWidth = Math.max(0, Math.min(((champ.winRate - 0.40) / 0.20) * 100, 100));

                                return (
                                    <tr key={champ.name} style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    }}>
                                        <td style={{ padding: '8px 12px', fontWeight: '600', color: 'white' }}>{champ.name}</td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                                                color: ts.color, background: ts.bg, border: `1px solid ${ts.border}`,
                                            }}>
                                                {champ.tier || '?'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700', color: wrColor(champ.winRate) }}>
                                            {(champ.winRate * 100).toFixed(1)}%
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            {champ.pickRate ? `${(champ.pickRate * 100).toFixed(1)}%` : '-'}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            {champ.banRate ? `${(champ.banRate * 100).toFixed(1)}%` : '-'}
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: '3px', transition: 'width 0.3s',
                                                    background: champ.winRate >= 0.50 ? '#22c55e' : '#ef4444',
                                                    width: `${wrWidth}%`,
                                                }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function ThCell({ children, onClick, align = 'center' }) {
    return (
        <th
            onClick={onClick}
            style={{
                padding: '10px 12px', color: 'var(--text-muted)', fontWeight: '700', fontSize: '11px',
                textAlign: align, cursor: onClick ? 'pointer' : 'default', userSelect: 'none',
                textTransform: 'uppercase', letterSpacing: '0.5px',
            }}
        >
            {children}
        </th>
    );
}
