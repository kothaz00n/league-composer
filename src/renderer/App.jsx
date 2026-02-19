import React, { useState, useEffect } from 'react';
import StatusBar from './components/StatusBar';
import DraftBoard from './components/DraftBoard';
import CompAnalysis from './components/CompAnalysis';
import RecommendationPanel from './components/RecommendationPanel';
import CompositionsEditor from './components/CompositionsEditor';
import WinRateImporter from './components/WinRateImporter';
import { IconSword, IconHome, IconCompositions, IconImport, IconGame } from './components/HextechIcons';

// Data Dragon base URL for champion assets
const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com/cdn';

// Default version (updated dynamically when receiving data from Electron)
let currentDdragonVersion = '14.3.1';

// Champion ID → name mapping (mirrors the engine's map for the renderer)
const CHAMPION_ID_MAP = {
    266: 'Aatrox', 103: 'Ahri', 32: 'Amumu', 22: 'Ashe',
    164: 'Camille', 122: 'Darius', 119: 'Draven', 81: 'Ezreal',
    114: 'Fiora', 105: 'Fizz', 86: 'Garen', 39: 'Irelia',
    202: 'Jhin', 222: 'Jinx', 55: 'Katarina', 64: 'Lee Sin',
    89: 'Leona', 99: 'Lux', 54: 'Malphite', 21: 'Miss Fortune',
    111: 'Nautilus', 61: 'Orianna', 412: 'Thresh', 67: 'Vayne',
    157: 'Yasuo', 238: 'Zed', 117: 'Lulu', 25: 'Morgana',
    254: 'Vi', 59: 'Jarvan IV',
    // Extended list — common champions
    1: 'Annie', 2: 'Olaf', 3: 'Galio', 4: 'TwistedFate',
    5: 'XinZhao', 6: 'Urgot', 7: 'LeBlanc', 8: 'Vladimir',
    9: 'Fiddlesticks', 10: 'Kayle', 11: 'MasterYi', 12: 'Alistar',
    13: 'Ryze', 14: 'Sion', 15: 'Sivir', 16: 'Soraka',
    17: 'Teemo', 18: 'Tristana', 19: 'Warwick', 20: 'Nunu',
    23: 'Tryndamere', 24: 'Jax', 26: 'Zilean', 27: 'Singed',
    28: 'Evelynn', 29: 'Twitch', 30: 'Karthus', 31: 'ChoGath',
    33: 'Rammus', 34: 'Anivia', 35: 'Shaco', 36: 'DrMundo',
    42: 'Corki', 43: 'Karma', 44: 'Taric', 45: 'Veigar',
    48: 'Trundle', 51: 'Caitlyn', 53: 'Blitzcrank', 56: 'Nocturne',
    57: 'Maokai', 58: 'Renekton', 62: 'MonkeyKing', 63: 'Brand',
    69: 'Cassiopeia', 72: 'Skarner', 74: 'Heimerdinger', 75: 'Nasus',
    76: 'Nidalee', 77: 'Udyr', 78: 'Poppy', 79: 'Gragas',
    80: 'Pantheon', 82: 'Mordekaiser', 83: 'Yorick', 84: 'Akali',
    85: 'Kennen', 90: 'Malzahar', 91: 'Talon', 92: 'Riven',
    96: 'KogMaw', 98: 'Shen', 101: 'Xerath', 102: 'Shyvana',
    104: 'Graves', 106: 'Volibear', 110: 'Varus', 112: 'Viktor',
    113: 'Sejuani', 115: 'Ziggs', 120: 'Hecarim', 121: 'Khazix',
    126: 'Jayce', 127: 'Lissandra', 131: 'Diana', 133: 'Quinn',
    134: 'Syndra', 136: 'AurelionSol', 141: 'Kayn', 142: 'Zoe',
    143: 'Zyra', 145: 'Kaisa', 147: 'Seraphine', 150: 'Gnar',
    154: 'Zac', 161: 'Velkoz', 163: 'Taliyah', 166: 'Akshan',
    200: 'Belveth', 201: 'Braum', 203: 'Kindred', 221: 'Zeri',
    223: 'TahmKench', 233: 'Briar', 234: 'Viego', 235: 'Senna',
    236: 'Lucian', 240: 'Kled', 245: 'Ekko', 246: 'Qiyana',
    350: 'Yuumi', 360: 'Samira', 497: 'Rakan', 498: 'Xayah',
    516: 'Ornn', 517: 'Sylas', 518: 'Neeko', 523: 'Aphelios',
    526: 'Rell', 555: 'Pyke', 711: 'Vex', 777: 'Yone',
    875: 'Sett', 876: 'Lillia', 887: 'Gwen', 888: 'Renata',
    895: 'Nilah', 897: 'KSante', 901: 'Smolder', 902: 'Milio',
    910: 'Hwei', 950: 'Naafiri',
};

import Dashboard from './components/Dashboard';
import RosterManager from './components/RosterManager';
import TeamBuilder from './components/TeamBuilder';
import WinRateBrowser from './components/WinRateBrowser';

// Moved into component to access championData state — see below

function getChampionIcon(championName) {
    if (!championName) return null;
    return `${DDRAGON_BASE}/${currentDdragonVersion}/img/champion/${championName}.png`;
}

export default function App() {
    const [connectionStatus, setConnectionStatus] = useState({
        status: 'disconnected',
        message: 'Waiting for League Client...',
    });

    const [draftState, setDraftState] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [compositionAnalysis, setCompositionAnalysis] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isImporterOpen, setIsImporterOpen] = useState(false);

    const [rosterData, setRosterData] = useState(null);
    const [championData, setChampionData] = useState(null);

    // Memoize the champion list so it doesn't break React dependency arrays in children
    const allChampions = React.useMemo(() => {
        return Object.values(championData?.idToName || {});
    }, [championData]);

    // Use full DDragon map when available, fallback to hardcoded subset
    const getChampionName = (id) => {
        return championData?.idToName?.[id] || CHAMPION_ID_MAP[id] || null;
    };

    useEffect(() => {
        // Check if running inside Electron
        if (window.electronAPI) {
            window.electronAPI.onConnectionStatus((data) => {
                setConnectionStatus(data);
            });

            window.electronAPI.onChampSelectUpdate((data) => {
                setDraftState(data);
                if (data.recommendations) {
                    setRecommendations(data.recommendations);
                }
                if (data.compositionAnalysis) {
                    setCompositionAnalysis(data.compositionAnalysis);
                }
                if (data.ddragonVersion) {
                    currentDdragonVersion = data.ddragonVersion;
                }
            });

            window.electronAPI.onChampSelectEnded(() => {
                setDraftState(null);
                setRecommendations([]);
                setCompositionAnalysis(null);
                setCurrentView('dashboard');
            });

            // Load initial data
            window.electronAPI.getChampionData().then(data => {
                if (data) {
                    setChampionData(data);
                    if (data.version) {
                        currentDdragonVersion = data.version;
                    }
                }
            });
            window.electronAPI.loadRoster().then(data => {
                if (data) setRosterData(data);
            });

        } else {
            // Running in browser (dev mode without Electron) — show mock state
            setConnectionStatus({
                status: 'disconnected',
                message: 'Running in browser — Electron features disabled',
            });
        }
    }, []);

    // Auto-switch to draft view when champ select starts
    useEffect(() => {
        if (draftState && currentView !== 'draft') {
            setCurrentView('draft');
        }
    }, [draftState]);

    // Fetch custom archetypes
    const [customArchetypes, setCustomArchetypes] = useState([]);
    useEffect(() => {
        if (window.electronAPI?.getAllCompositions) {
            window.electronAPI.getAllCompositions().then(data => {
                if (data && data.archetypes) {
                    setCustomArchetypes(data.archetypes);
                }
            });
        }
    }, [currentView]); // Refresh when view changes (e.g. coming back from editor)

    // ─── Draft Controls ─────────────────────────────────────────────────
    const [targetArchetype, setTargetArchetype] = useState('auto');
    const [overrideRole, setOverrideRole] = useState(null);

    const handleArchetypeChange = (e) => {
        const newVal = e.target.value;
        setTargetArchetype(newVal);
        window.electronAPI?.updateDraftPreferences({ targetArchetype: newVal });
    };

    const handleRoleTabClick = (role) => {
        // If clicking the current assigned role, clear override to auto
        // But here we want explicit control, so let's just set it.
        setOverrideRole(role);
        window.electronAPI?.updateDraftPreferences({ overrideRole: role });
    };

    // Derived state for role tabs
    const currentRole = overrideRole || draftState?.localPlayer?.role || 'mid'; // default to mid if unknown

    const handleMinimize = () => window.electronAPI?.minimizeWindow();
    const handleClose = () => window.electronAPI?.closeWindow();
    const handleRetry = () => window.electronAPI?.retryConnection();

    const handleSaveRoster = (newData) => {
        setRosterData(newData);
        window.electronAPI?.saveRoster(newData);
        // Optional: show notification?
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <Dashboard
                        onViewChange={setCurrentView}
                        isClientReady={connectionStatus.status !== 'disconnected'}
                    />
                );
            case 'roster':
                return (
                    <RosterManager
                        rosterData={rosterData}
                        onSave={handleSaveRoster}
                        onBack={() => setCurrentView('dashboard')}
                        allChampions={allChampions}
                    />
                );
            case 'builder':
                return (
                    <TeamBuilder
                        allChampions={allChampions}
                        championData={championData}
                        onBack={() => setCurrentView('dashboard')}
                    />
                );
            case 'winrates':
                return (
                    <WinRateBrowser
                        allChampions={allChampions}
                        onBack={() => setCurrentView('dashboard')}
                        onOpenImporter={() => setIsImporterOpen(true)}
                    />
                );
            case 'editor':
                return (
                    <CompositionsEditor
                        onBack={() => setCurrentView('dashboard')}
                        allChampions={allChampions}
                    />
                );
            case 'draft':
                return (
                    <>
                        {/* Frameless Titlebar */}
                        <div className="titlebar">
                            <span className="titlebar__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <IconSword size={15} style={{ color: 'var(--hextech-gold)' }} />
                                Draft Recommender
                            </span>
                            <div className="titlebar__controls">
                                <button className="titlebar__btn titlebar__btn--nav" onClick={() => setCurrentView('dashboard')} title="Home">
                                    <IconHome size={14} />
                                </button>
                                <button className="titlebar__btn titlebar__btn--nav" onClick={() => setCurrentView('editor')} title="Compositions Editor">
                                    <IconCompositions size={14} />
                                </button>
                                <button className="titlebar__btn titlebar__btn--nav" onClick={() => setIsImporterOpen(true)} title="Import Data">
                                    <IconImport size={14} />
                                </button>
                                <button className="titlebar__btn" onClick={handleMinimize}>─</button>
                                <button className="titlebar__btn titlebar__btn--close" onClick={handleClose}>✕</button>
                            </div>
                        </div>

                        {/* Connection Status */}
                        <StatusBar status={connectionStatus} onRetry={handleRetry} />

                        {/* Main Content */}
                        <div className="main-content">
                            {draftState ? (
                                <>
                                    <DraftBoard
                                        allies={draftState.allies}
                                        enemies={draftState.enemies}
                                        bans={draftState.bans}
                                        localPlayer={draftState.localPlayer}
                                        getChampionName={getChampionName}
                                        getChampionIcon={getChampionIcon}
                                    />
                                    <CompAnalysis compositionAnalysis={compositionAnalysis} />

                                    {/* Draft Controls Bar */}
                                    <div className="draft-controls">
                                        <div className="draft-controls__group">
                                            <label className="draft-controls__label">Target Comp:</label>
                                            <select
                                                className="draft-controls__select"
                                                value={targetArchetype}
                                                onChange={handleArchetypeChange}
                                            >
                                                <option value="auto">Auto-Detect</option>
                                                <optgroup label="Standard Archetypes">
                                                    <option value="hardEngage">Hard Engage</option>
                                                    <option value="dive">Dive / Pick</option>
                                                    <option value="protect">Protect / Peel</option>
                                                    <option value="poke">Poke / Siege</option>
                                                    <option value="splitpush">Splitpush</option>
                                                    <option value="teamfight">Teamfight</option>
                                                </optgroup>
                                                {customArchetypes.length > 0 && (
                                                    <optgroup label="Custom Archetypes">
                                                        {customArchetypes.map((arch, idx) => (
                                                            <option key={idx} value={arch.name}>{arch.name}</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                        </div>

                                        <div className="draft-controls__roles">
                                            {['top', 'jungle', 'mid', 'adc', 'support'].map(r => (
                                                <button
                                                    key={r}
                                                    className={`draft-controls__role-btn ${currentRole === r ? 'active' : ''}`}
                                                    onClick={() => handleRoleTabClick(r)}
                                                    title={`Show recommendations for ${r}`}
                                                >
                                                    {r.toUpperCase().slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <RecommendationPanel
                                        recommendations={recommendations}
                                        role={currentRole}
                                        getChampionIcon={getChampionIcon}
                                    />
                                </>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state__icon"><IconGame size={40} /></div>
                                    <div className="empty-state__title">Waiting for Draft</div>
                                    <div className="empty-state__desc">
                                        Waiting for Champion Select to start...
                                    </div>
                                    <button className="empty-state__btn" onClick={() => setCurrentView('dashboard')}>
                                        Return home
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="app-container">
            <div className="app-content">
                {renderView()}
                {isImporterOpen && <WinRateImporter onClose={() => setIsImporterOpen(false)} />}
            </div>
        </div>
    );
}
