import React, { useState, useEffect } from 'react';
import { RoleIcon, IconGlobe, IconTrophy, IconFlex, IconImport, IconEmptyInbox } from './HextechIcons';
import ViewHeader from './ViewHeader';

const QUEUE_TABS = [
    { key: 'soloq', label: 'Solo Q', Icon: IconTrophy },
    { key: 'flex', label: 'Flex', Icon: IconFlex },
];

const ROLE_TABS = ['all', 'top', 'jungle', 'mid', 'adc', 'support'];
const ROLE_NAMES_MAP = { all: 'All Roles', top: 'Top', jungle: 'Jungle', mid: 'Mid', adc: 'Bottom', support: 'Support' };

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
            selectedRole // Pass 'all' explicitly
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
            const role = selectedRole;
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

    const getTierClass = (tier) => {
        if (!tier) return 'tier-c';
        const map = { 'S+': 'tier-s-plus', 'S': 'tier-s', 'A': 'tier-a', 'B': 'tier-b', 'C': 'tier-c', 'D': 'tier-d' };
        return map[tier] || 'tier-c';
    };

    const getWinRateColor = (wr) => {
        if (wr >= 0.53) return '#27ae60';
        if (wr >= 0.51) return '#2ecc71';
        if (wr >= 0.49) return '#a09b8c';
        if (wr >= 0.47) return '#e84057';
        return '#c0392b';
    };

    return (
        <div className="view-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Unified back navigation */}
            <ViewHeader title="Win Rate Reference" onBack={onBack}>
                <button
                    onClick={onOpenImporter}
                    className="btn-hextech"
                    title="Import Data from U.GG or Clipboard"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '11px', padding: '6px 14px' }}
                >
                    <span>Import Data</span>
                    <IconImport size={13} />
                </button>
                {importedChamps.length > 0 && (
                    <label className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showOnlyImported}
                            onChange={(e) => setShowOnlyImported(e.target.checked)}
                            style={{ accentColor: 'var(--hextech-gold)' }}
                        />
                        Imported only
                    </label>
                )}
            </ViewHeader>

            {/* Search bar */}
            <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--hextech-gold-dim)' }}>
                <input
                    className="wr-search-input"
                    placeholder="SEARCH CHAMPION..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Queue & Role Tabs */}
            <div className="wr-tabs-container">
                <div style={{ display: 'flex', gap: '8px' }}>
                    {QUEUE_TABS.map(q => (
                        <button
                            key={q.key}
                            onClick={() => setSelectedQueue(q.key)}
                            className={`btn-hextech ${selectedQueue === q.key ? 'active' : ''}`}
                            style={{ minWidth: '100px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            <q.Icon size={13} />
                            {q.label}
                        </button>
                    ))}
                </div>

                <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 8px' }}></div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {ROLE_TABS.map(r => (
                        <button
                            key={r}
                            onClick={() => setSelectedRole(r)}
                            className={`btn-hextech ${selectedRole === r ? 'active' : ''}`}
                            style={{ fontSize: '11px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            {r === 'all'
                                ? <IconGlobe size={13} />
                                : <RoleIcon role={r} size={13} />}
                            {ROLE_NAMES_MAP[r]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="wr-table-container" style={{ flex: '1 1 auto', overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        <span className="font-display" style={{ fontSize: '24px', letterSpacing: '2px' }}>LOADING DATA...</span>
                    </div>
                ) : champList.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state__icon"><IconEmptyInbox size={40} /></span>
                        <span className="empty-state__title">NO DATA AVAILABLE</span>
                        <span className="empty-state__desc">
                            No win rate data found for {selectedQueue === 'soloq' ? 'Solo Queue' : 'Flex'} — {ROLE_NAMES_MAP[selectedRole]}.
                        </span>
                        <button onClick={onOpenImporter} className="btn-hextech">
                            IMPORT DATA NOW
                        </button>
                    </div>
                ) : (
                    <table className="hex-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('name')}>Champion{sortIndicator('name')}</th>
                                {selectedRole === 'all' && <th>Role</th>}
                                <th onClick={() => toggleSort('tier')} style={{ textAlign: 'center' }}>Tier{sortIndicator('tier')}</th>
                                <th onClick={() => toggleSort('winRate')} style={{ textAlign: 'center' }}>Win Rate{sortIndicator('winRate')}</th>
                                <th onClick={() => toggleSort('pickRate')} style={{ textAlign: 'center' }}>Pick %{sortIndicator('pickRate')}</th>
                                <th onClick={() => toggleSort('banRate')} style={{ textAlign: 'center' }}>Ban %{sortIndicator('banRate')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {champList.map((champ, idx) => {
                                const wr = champ.winRate || 0;
                                const wrPercent = (wr * 100).toFixed(1);
                                const wrColor = getWinRateColor(wr);

                                return (
                                    <tr key={champ.name}>
                                        <td style={{ fontWeight: '600', color: 'var(--hextech-gold-light)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {/* Placeholder for avatar if available in future */}
                                                <span>{selectedRole === 'all' && champ.name.includes('-') ? champ.name.split('-')[0] : champ.name}</span>
                                            </div>
                                        </td>
                                        {selectedRole === 'all' && (
                                            <td className="text-muted" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                                                {champ.role || '-'}
                                            </td>
                                        )}
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`tier-badge ${getTierClass(champ.tier)}`}>
                                                {champ.tier || '?'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '700', color: wrColor, fontSize: '14px' }}>{wrPercent}%</span>
                                                <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.1)', marginTop: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${Math.max(0, (wr - 0.4) / 0.2 * 100)}%`, height: '100%', background: wrColor }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-secondary" style={{ textAlign: 'center' }}>
                                            {champ.pickRate ? `${(champ.pickRate * 100).toFixed(1)}%` : '-'}
                                        </td>
                                        <td className="text-secondary" style={{ textAlign: 'center' }}>
                                            {champ.banRate ? `${(champ.banRate * 100).toFixed(1)}%` : '-'}
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

