import React, { useState, useEffect, useRef } from 'react';
import { IconTrophy, IconFlex, IconClipboard, IconImport } from './HextechIcons';

const QUEUE_OPTIONS = [
    { key: 'soloq', label: 'Solo/Duo Queue', Icon: IconTrophy },
    { key: 'flex', label: 'Flex Queue', Icon: IconFlex },
];

const WinRateImporter = ({ onClose }) => {
    const [selectedQueue, setSelectedQueue] = useState('soloq');
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'auto'
    const [inputs, setInputs] = useState({
        all: '',
        top: '',
        jungle: '',
        mid: '',
        adc: '',
        support: ''
    });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [forceUpdate, setForceUpdate] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeLogs, setScrapeLogs] = useState([]);
    const logsEndRef = useRef(null);

    useEffect(() => {
        if (!window.electronAPI) {
            console.error('[Importer] electronAPI not found!');
            return;
        }

        console.log('[Importer] Registering scraper listeners...');

        const handleProgress = (msg) => {
            console.log('[Importer] Scraper Progress:', msg);
            setScrapeLogs(prev => [...prev, msg]);
        };

        const handleComplete = (result) => {
            console.log('[Importer] Scraper Complete:', result);
            setIsScraping(false);
            if (result.success) {
                setSuccessMsg(result.message);
                setScrapeLogs(prev => [...prev, '[OK] ' + result.message]);
            } else {
                setError(result.message);
                setScrapeLogs(prev => [...prev, '[ERR] ' + result.message]);
            }
        };

        window.electronAPI.onScraperProgress(handleProgress);
        window.electronAPI.onScraperComplete(handleComplete);

        return () => {
            console.log('[Importer] Component unmounting...');
        };
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [scrapeLogs]);

    const handleInput = (role, val) => {
        setInputs(prev => ({ ...prev, [role]: val }));
        setError(null);
    };

    const handleAutoImport = (force = false) => {
        console.log(`[Importer] Requesting scrape (force=${force}, queue=${selectedQueue})`);
        setIsScraping(true);
        setScrapeLogs(['[SYSTEM] Initializing request...', force ? 'Forcing update...' : 'Checking data freshness...']);
        setError(null);
        setSuccessMsg(null);
        window.electronAPI?.runUggScrape(force, selectedQueue);
    };

    const handleImport = () => {
        try {
            const roleData = {};
            let count = 0;

            // Helper to merge data
            const mergeData = (targetRole, data) => {
                if (!roleData[targetRole]) roleData[targetRole] = {};
                Object.assign(roleData[targetRole], data);
                count += Object.keys(data).length;
            };

            ['all', 'top', 'jungle', 'mid', 'adc', 'support'].forEach(inputKey => {
                const raw = inputs[inputKey];
                if (raw && raw.trim()) {
                    try {
                        const parsed = JSON.parse(raw);

                        // Check if this is a Bulk Import (nested roles)
                        const keys = Object.keys(parsed);
                        const isBulk = keys.some(k => ['top', 'jungle', 'mid', 'adc', 'support'].includes(k));

                        if (isBulk) {
                            keys.forEach(r => {
                                if (['top', 'jungle', 'mid', 'adc', 'support'].includes(r)) {
                                    mergeData(r, parsed[r]);
                                }
                            });
                        } else {
                            if (inputKey === 'all') {
                                if (Object.keys(parsed).length > 0) {
                                    // Fallback for flat paste into All
                                    mergeData('mid', parsed); // Defaulting to mid to avoid loss, user should use bulk script
                                }
                            } else {
                                mergeData(inputKey, parsed);
                            }
                        }
                    } catch (e) {
                        throw new Error(`Invalid JSON for ${inputKey.toUpperCase()}: ${e.message}`);
                    }
                }
            });

            if (Object.keys(roleData).length === 0) {
                setError('Please paste valid JSON data.');
                return;
            }

            // Send with queue identifier
            window.electronAPI.saveWinRates({
                _queue: selectedQueue,
                _roleData: roleData,
            });

            const queueLabel = selectedQueue === 'soloq' ? 'Solo Queue' : 'Flex Queue';
            setSuccessMsg(`Imported ${queueLabel} win rates for ${Object.keys(roleData).length} roles (~${count} entries)!`);
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.message || 'Invalid JSON format.');
        }
    };

    const copyScript = () => {
        const script = `
// 📋 U.GG Win Rate Extractor (v4 - Bulk Support)
(function() {
    const data = { top: {}, jungle: {}, mid: {}, adc: {}, support: {} };
    const normalize = (str) => str.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const validChampions = ["Aatrox","Ahri","Akali","Akshan","Alistar","Ambessa","Amumu","Anivia","Annie","Aphelios","Ashe","AurelionSol","Aurora","Azir","Bard","Belveth","Blitzcrank","Brand","Braum","Briar","Caitlyn","Camille","Cassiopeia","Chogath","Corki","Darius","Diana","DrMundo","Draven","Ekko","Elise","Evelynn","Ezreal","Fiddlesticks","Fiora","Fizz","Galio","Gangplank","Garen","Gnar","Gragas","Graves","Gwen","Hecarim","Heimerdinger","Hwei","Illaoi","Irelia","Ivern","Janna","JarvanIV","Jax","Jayce","Jhin","Jinx","KSante","Kaisa","Kalista","Karma","Karthus","Kassadin","Katarina","Kayle","Kayn","Kennen","Khazix","Kindred","Kled","KogMaw","Leblanc","LeeSin","Leona","Lillia","Lissandra","Lucian","Lulu","Lux","Malphite","Malzahar","Maokai","MasterYi","Mel","Milio","MissFortune","MonkeyKing","Mordekaiser","Morgana","Naafiri","Nami","Nasus","Nautilus","Neeko","Nidalee","Nilah","Nocturne","Nunu","Olaf","Orianna","Ornn","Pantheon","Poppy","Pyke","Qiyana","Quinn","Rakan","Rammus","RekSai","Rell","Renata","Renekton","Rengar","Riven","Rumble","Ryze","Samira","Sejuani","Senna","Seraphine","Sett","Shaco","Shen","Shyvana","Singed","Sion","Sivir","Skarner","Smolder","Sona","Soraka","Swain","Sylas","Syndra","TahmKench","Taliyah","Talon","Taric","Teemo","Thresh","Tristana","Trundle","Tryndamere","TwistedFate","Twitch","Udyr","Urgot","Varus","Vayne","Veigar","Velkoz","Vex","Vi","Viego","Viktor","Vladimir","Volibear","Warwick","Xayah","Xerath","XinZhao","Yasuo","Yone","Yorick","Yunara","Yuumi","Zaahen","Zac","Zed","Zeri","Ziggs","Zilean","Zoe","Zyra"];
    const validSet = new Set(validChampions.map(n => n.toUpperCase()));
    let rows = Array.from(document.querySelectorAll('[role="row"]'));
    if (rows.length < 5) rows = Array.from(document.querySelectorAll('.rt-tr, .rt-tr-group'));
    if (rows.length === 0) { alert("❌ Could not find data rows on this page."); return; }
    let foundCount = 0;
    rows.forEach(row => {
        const text = row.innerText || "";
        const html = row.innerHTML;
        let role = null;
        if (html.match(/alt="Top"|role-top/i)) role = 'top';
        else if (html.match(/alt="Jungle"|role-jungle/i)) role = 'jungle';
        else if (html.match(/alt="Mid"|role-mid/i)) role = 'mid';
        else if (html.match(/alt="ADC"|alt="Bottom"|role-adc/i)) role = 'adc';
        else if (html.match(/alt="Support"|role-support/i)) role = 'support';
        if (!role) {
            const url = window.location.href;
            if (url.includes('top-lane')) role = 'top';
            if (url.includes('jungle')) role = 'jungle';
            if (url.includes('mid-lane')) role = 'mid';
            if (url.includes('adc')) role = 'adc';
            if (url.includes('support')) role = 'support';
        }
        if (!role) return; 
        const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
        let champName = null;
        for (const line of lines) {
            const clean = normalize(line);
            if (validSet.has(clean)) { champName = validChampions.find(c => c.toUpperCase() === clean); break; }
            if (clean === 'WUKONG') { champName = 'MonkeyKing'; break; }
            if (clean === 'RENATA') { champName = 'Renata'; break; }
            if (clean === 'RENATAGLASC') { champName = 'Renata'; break; }
            if (clean === 'NUNU') { champName = 'Nunu'; break; }
            if (clean === 'NUNUWILLUMP') { champName = 'Nunu'; break; }
        }
        if (!champName) return;
        let winRate = null; let pickRate = 0; let banRate = 0; let matches = 0; let tier = '';
        let percentages = [];
        lines.forEach(line => {
             if (line.endsWith('%')) { 
                 const num = parseFloat(line); 
                 if (!isNaN(num) && num < 100) percentages.push(num / 100); 
             }
             if (line.match(/^[0-9,]+$/) && line.length > 2) { 
                 const m = parseInt(line.replace(/,/g, '')); 
                 if (!isNaN(m) && m > matches) matches = m; 
             }
             if (line.match(/^[SABCD][+]?$/)) tier = line;
        });
        if (percentages.length > 0) winRate = percentages[0];
        if (percentages.length > 1) pickRate = percentages[1];
        if (percentages.length > 2) banRate = percentages[2];
        
        if (winRate) { 
            data[role][champName] = { winRate, pickRate, banRate, matches, tier }; 
            foundCount++; 
        }
    });
    const json = JSON.stringify(data, null, 2);
    const el = document.createElement('textarea');
    el.value = json; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
    alert("✅ Copied " + foundCount + " entries!\\nPaste into the 'All' box (or specific role box).");
})();
        `.trim();
        navigator.clipboard.writeText(script);
        setSuccessMsg('Script copied! (Supports All Roles)');
        setTimeout(() => setSuccessMsg(null), 2000);
    };

    return (
        <div className="editor-modal__overlay">
            <div className="editor-modal" style={{ width: '700px', maxWidth: '95%' }}>
                <h2 className="editor-modal__title">Import Win Rates</h2>

                {/* Queue Selector */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {QUEUE_OPTIONS.map(q => (
                        <button
                            key={q.key}
                            onClick={() => setSelectedQueue(q.key)}
                            className={`importer-queue-btn ${selectedQueue === q.key ? 'importer-queue-btn--active' : ''}`}
                        >
                            <q.Icon size={15} />
                            {q.label}
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <div className="importer-tabs">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`importer-tab ${activeTab === 'manual' ? 'importer-tab--active' : ''}`}
                    >
                        Manual Import
                    </button>
                    <button
                        onClick={() => setActiveTab('auto')}
                        className={`importer-tab ${activeTab === 'auto' ? 'importer-tab--active' : ''}`}
                    >
                        Auto-Import
                    </button>
                </div>

                {activeTab === 'auto' ? (
                    <div className="import-auto">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Automatically scrape <strong>{selectedQueue === 'soloq' ? 'Ranked Solo/Duo' : 'Ranked Flex'}</strong> win rates from U.GG.
                            Also includes "All Roles" data.
                        </p>

                        <div className="importer-logs">
                            {scrapeLogs.length === 0 ? (
                                <span className="importer-logs__placeholder">Logs will appear here...</span>
                            ) : (
                                scrapeLogs.map((log, i) => (
                                    <div key={i} className={`importer-log-entry ${log.startsWith('[OK]') ? 'importer-log-entry--ok' : log.startsWith('[ERR]') ? 'importer-log-entry--err' : log.startsWith('[SYSTEM]') ? 'importer-log-entry--system' : ''}`}>
                                        {log}
                                    </div>
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </div>

                        {error && <div className="importer-message--error">{error}</div>}
                        {successMsg && <div className="importer-message--success">{successMsg}</div>}

                        <div className="importer-checkbox">
                            <input
                                type="checkbox"
                                id="forceUpdate"
                                checked={forceUpdate}
                                onChange={(e) => {
                                    setForceUpdate(e.target.checked);
                                    if (e.target.checked) setError(null);
                                }}
                            />
                            <label htmlFor="forceUpdate">
                                Force Update (Ignore 24h limit)
                            </label>
                        </div>

                        <div className="editor-modal__actions">
                            <button className="editor-btn editor-btn--cancel" onClick={onClose} disabled={isScraping}>
                                {isScraping ? 'Scraping...' : 'Close'}
                            </button>
                            <button
                                className="editor-btn editor-btn--save"
                                onClick={() => handleAutoImport(forceUpdate)}
                                disabled={isScraping}
                                style={{ opacity: isScraping ? 0.5 : 1 }}
                            >
                                {isScraping ? 'Scraping in progress...' : 'Start Auto-Import'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Queue Selector Removed (Global now) */}

                        <div className="import-steps">
                            <div className="import-step">
                                <span className="import-step__num">1</span>
                                <div className="import-step__content">
                                    <p>Go to <strong><a href="https://u.gg/lol/tier-list" target="_blank" rel="noreferrer">u.gg/lol/tier-list</a></strong>.</p>
                                    <p>Select <strong>{selectedQueue === 'soloq' ? 'Ranked Solo/Duo' : 'Ranked Flex'}</strong>.</p>
                                </div>
                            </div>

                            <div className="import-step">
                                <span className="import-step__num">2</span>
                                <div className="import-step__content">
                                    <p>Open Console (<strong>F12</strong>), run this script:</p>
                                    <button className="editor-btn editor-btn--edit" onClick={copyScript} style={{ marginTop: '8px', width: '100%' }}>
                                        <IconClipboard size={14} /> Copy Script (v4)
                                    </button>
                                </div>
                            </div>

                            <div className="import-step">
                                <span className="import-step__num">3</span>
                                <div className="import-step__content">
                                    <p>Paste the result below.</p>
                                    <div style={{ marginBottom: '10px' }}>
                                        <textarea
                                            className="editor-modal__field"
                                            value={inputs.all}
                                            onChange={(e) => handleInput('all', e.target.value)}
                                            placeholder="Paste bulk JSON here..."
                                            style={{ height: '100px', fontSize: '11px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <div className="importer-message--error" style={{ marginTop: '10px' }}>{error}</div>}
                        {successMsg && <div className="importer-message--success" style={{ marginTop: '10px' }}>{successMsg}</div>}

                        <div className="editor-modal__actions">
                            <button className="editor-btn editor-btn--cancel" onClick={onClose}>Cancel</button>
                            <button className="editor-btn editor-btn--save" onClick={handleImport}>
                                Import Data
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WinRateImporter;
