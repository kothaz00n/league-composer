import React, { useState, useEffect } from 'react';
import { RoleIcon } from './HextechIcons';
import ViewHeader from './ViewHeader';

const RosterManager = ({ rosterData, onSave, onBack, allChampions = [] }) => {
    const ROLE_ORDER = ['top', 'jungle', 'mid', 'adc', 'support'];
    const ROLE_NAMES = { top: 'Top', jungle: 'Jungle', mid: 'Mid', adc: 'Bottom', support: 'Support' };

    const [formData, setFormData] = useState({
        myRole: 'top',
        gameMode: 'solo',
        roster: {}
    });

    // Initialize state from props or defaults
    useEffect(() => {
        if (rosterData) {
            setFormData(rosterData);
        } else {
            // Default structure
            const defaultRoster = {};
            ROLE_ORDER.forEach(r => defaultRoster[r] = { player: '', favorites: [] });
            setFormData({ myRole: 'top', gameMode: 'solo', roster: defaultRoster });
        }
    }, [rosterData]);

    const [champInput, setChampInput] = useState('');
    const [activeRoleForInput, setActiveRoleForInput] = useState(null);

    const handleMainRoleChange = (role) => {
        setFormData(prev => ({ ...prev, myRole: role }));
    };

    const handleGameModeChange = (mode) => {
        setFormData(prev => ({ ...prev, gameMode: mode }));
    };

    const handlePlayerNameChange = (role, name) => {
        setFormData(prev => ({
            ...prev,
            roster: {
                ...prev.roster,
                [role]: { ...prev.roster[role], player: name }
            }
        }));
    };

    const addFavorite = (role, champName) => {
        if (!champName) return;
        // Validate against allChampions
        const validName = allChampions.find(c => c.toLowerCase() === champName.toLowerCase());
        if (!validName) {
            alert('Invalid champion name');
            return;
        }

        setFormData(prev => {
            const currentFavs = prev.roster[role]?.favorites || [];
            if (currentFavs.includes(validName)) return prev;
            return {
                ...prev,
                roster: {
                    ...prev.roster,
                    [role]: { ...prev.roster[role], favorites: [...currentFavs, validName] }
                }
            };
        });
        setChampInput('');
        setActiveRoleForInput(null);
    };

    const removeFavorite = (role, champName) => {
        setFormData(prev => ({
            ...prev,
            roster: {
                ...prev.roster,
                [role]: {
                    ...prev.roster[role],
                    favorites: prev.roster[role].favorites.filter(c => c !== champName)
                }
            }
        }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="roster-container">
            {/* Unified back navigation */}
            <ViewHeader title="Roster & Favorites" onBack={onBack}>
                <button onClick={handleSave} className="editor-btn editor-btn--primary"
                    style={{ fontSize: '11px', padding: '6px 14px' }}>
                    Save Changes
                </button>
            </ViewHeader>

            {/* Scrollable content area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>

                {/* Global Settings */}
                <div className="roster-settings">
                    <div>
                        <span className="roster-label">My Main Role</span>
                        <select
                            value={formData.myRole}
                            onChange={(e) => handleMainRoleChange(e.target.value)}
                            className="roster-select"
                        >
                            {ROLE_ORDER.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div>
                        <span className="roster-label">Game Mode</span>
                        <div className="roster-toggle-group">
                            <button
                                onClick={() => handleGameModeChange('solo')}
                                className={`roster-toggle-btn ${formData.gameMode === 'solo' ? 'active' : ''}`}
                            >
                                Solo/Duo
                            </button>
                            <button
                                onClick={() => handleGameModeChange('flex')}
                                className={`roster-toggle-btn ${formData.gameMode === 'flex' ? 'active' : ''}`}
                            >
                                Flex / Clash
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-subtitle" style={{ maxWidth: '300px', marginBottom: '4px' }}>
                        {formData.gameMode === 'solo'
                            ? "In SoloQ, we prioritize YOUR favorites and the meta for your role."
                            : "In Flex, we consider EVERYONE'S favorites to suggest team synergies."}
                    </div>
                </div>

                {/* Role Grid */}
                <div className="roster-grid">
                    {ROLE_ORDER.map(role => {
                        const roleData = formData.roster[role] || { player: '', favorites: [] };
                        const isMyRole = formData.myRole === role;

                        return (
                            <div key={role} className={`roster-card ${isMyRole ? 'main' : ''}`}>
                                <div className="roster-role-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <RoleIcon role={role} size={16} />
                                    <span>{ROLE_NAMES[role]}</span>
                                    {isMyRole && <span className="roster-tag-main">MAIN</span>}
                                </div>

                                <input
                                    type="text"
                                    placeholder={isMyRole ? "Me" : "Player Name"}
                                    value={roleData.player}
                                    onChange={(e) => handlePlayerNameChange(role, e.target.value)}
                                    className="roster-input"
                                />

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <span className="roster-label">Favorites</span>
                                    <div className="roster-fav-list">
                                        {roleData.favorites.map(fav => (
                                            <span key={fav} className="roster-fav-chip">
                                                {fav}
                                                <span
                                                    onClick={() => removeFavorite(role, fav)}
                                                    className="roster-remove-fav"
                                                >
                                                    ✕
                                                </span>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="relative mt-auto">
                                        {activeRoleForInput === role ? (
                                            <input
                                                autoFocus
                                                list="champion-list"
                                                className="roster-input"
                                                style={{ marginBottom: 0, padding: '8px' }}
                                                placeholder="Type champ name..."
                                                value={champInput}
                                                onChange={(e) => setChampInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') addFavorite(role, champInput);
                                                    if (e.key === 'Escape') {
                                                        setActiveRoleForInput(null);
                                                        setChampInput('');
                                                    }
                                                }}
                                                onBlur={() => {
                                                    setTimeout(() => {
                                                        setActiveRoleForInput(null);
                                                        setChampInput('');
                                                    }, 200);
                                                }}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => setActiveRoleForInput(role)}
                                                className="roster-add-btn"
                                            >
                                                + Add Favorite
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <datalist id="champion-list">
                    {allChampions.map(c => <option key={c} value={c} />)}
                </datalist>
            </div>
        </div>
    );
};

export default RosterManager;
