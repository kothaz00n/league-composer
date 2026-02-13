import React, { useState, useEffect } from 'react';

const RosterManager = ({ rosterData, onSave, onBack, allChampions = [] }) => {
    const ROLE_ORDER = ['top', 'jungle', 'mid', 'adc', 'support'];

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
        <div className="flex flex-col h-full bg-gray-900 text-gray-100 p-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
                    Start
                </button>
                <h2 className="text-2xl font-bold text-gold">Roster Management</h2>
                <button
                    onClick={handleSave}
                    className="bg-gold text-black px-6 py-2 rounded font-bold hover:bg-yellow-400 transition"
                >
                    Save Changes
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {/* Global Settings */}
                <div className="bg-gray-800/50 p-4 rounded-xl border border-white/10 mb-6 flex gap-8 items-center">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-400 uppercase font-bold">My Main Role</label>
                        <select
                            value={formData.myRole}
                            onChange={(e) => handleMainRoleChange(e.target.value)}
                            className="bg-black/40 border border-white/20 rounded p-2 text-gold font-bold"
                        >
                            {ROLE_ORDER.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-400 uppercase font-bold">Game Mode</label>
                        <div className="flex bg-black/40 rounded p-1 border border-white/10">
                            <button
                                onClick={() => handleGameModeChange('solo')}
                                className={`px-4 py-1 rounded transition ${formData.gameMode === 'solo' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Solo/Duo
                            </button>
                            <button
                                onClick={() => handleGameModeChange('flex')}
                                className={`px-4 py-1 rounded transition ${formData.gameMode === 'flex' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Flex / Clash
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 max-w-xs ml-auto">
                        {formData.gameMode === 'solo'
                            ? "In SoloQ, we prioritize YOUR favorites and the meta for your role."
                            : "In Flex, we consider EVERYONE'S favorites to suggest team synergies."}
                    </div>
                </div>

                {/* Role Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {ROLE_ORDER.map(role => {
                        const roleData = formData.roster[role] || { player: '', favorites: [] };
                        const isMyRole = formData.myRole === role;

                        return (
                            <div
                                key={role}
                                className={`bg-gray-800/30 p-4 rounded-xl border ${isMyRole ? 'border-gold/50 bg-gold/5' : 'border-white/5'}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold uppercase text-gray-300">{role}</h3>
                                    {isMyRole && <span className="text-xs text-gold bg-gold/10 px-2 rounded">ME</span>}
                                </div>

                                {/* Player Name Input */}
                                <input
                                    type="text"
                                    placeholder={isMyRole ? "Me" : "Player Name"}
                                    value={roleData.player}
                                    onChange={(e) => handlePlayerNameChange(role, e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm mb-4 focus:border-gold/50 outline-none"
                                />

                                {/* Favorites List */}
                                <div className="mb-2">
                                    <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Favorites</label>
                                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                                        {roleData.favorites.map(fav => (
                                            <span key={fav} className="bg-gray-700 text-xs px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                                                {fav}
                                                <button
                                                    onClick={() => removeFavorite(role, fav)}
                                                    className="w-3 h-3 flex items-center justify-center text-red-400 hover:text-red-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Add Favorite Input */}
                                <div className="relative">
                                    {activeRoleForInput === role ? (
                                        <div className="flex gap-1">
                                            <input
                                                autoFocus
                                                list="champion-list"
                                                className="w-full bg-black/40 border border-gold/50 rounded p-1 text-xs"
                                                placeholder="Champ Name..."
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
                                                    // Delay to allow click
                                                    setTimeout(() => {
                                                        // If input creates valid add on blur? Maybe annoying.
                                                        // Just close for now.
                                                        setActiveRoleForInput(null);
                                                        setChampInput('');
                                                    }, 200);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setActiveRoleForInput(role)}
                                            className="w-full text-xs text-gray-400 hover:text-gold border border-dashed border-white/20 rounded p-2 hover:border-gold/30"
                                        >
                                            + Add Favorite
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hidden Datalist for Autocomplete */}
            <datalist id="champion-list">
                {allChampions.map(c => <option key={c} value={c} />)}
            </datalist>
        </div>
    );
};

export default RosterManager;
