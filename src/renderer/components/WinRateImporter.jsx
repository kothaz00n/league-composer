import React, { useState } from 'react';

const QUEUE_OPTIONS = [
    { key: 'soloq', label: '🏆 Solo/Duo Queue' },
    { key: 'flex', label: '👥 Flex Queue' },
];

const WinRateImporter = ({ onClose }) => {
    const [selectedQueue, setSelectedQueue] = useState('soloq');
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

    const handleInput = (role, val) => {
        setInputs(prev => ({ ...prev, [role]: val }));
        setError(null);
    };

    const handleImport = () => {
        try {
            const roleData = {};
            let count = 0;

            ['all', 'top', 'jungle', 'mid', 'adc', 'support'].forEach(role => {
                const raw = inputs[role];
                if (raw && raw.trim()) {
                    try {
                        const parsed = JSON.parse(raw);
                        roleData[role] = parsed;
                        count += Object.keys(parsed).length;
                    } catch (e) {
                        throw new Error(`Invalid JSON for ${role.toUpperCase()}: ${e.message}`);
                    }
                }
            });

            if (Object.keys(roleData).length === 0) {
                setError('Please paste JSON data for at least one role.');
                return;
            }

            // Send with queue identifier
            window.electronAPI.saveWinRates({
                _queue: selectedQueue,
                _roleData: roleData,
            });

            const queueLabel = selectedQueue === 'soloq' ? 'Solo Queue' : 'Flex Queue';
            setSuccessMsg(`Imported ${queueLabel} win rates for ${Object.keys(roleData).length} roles (${count} entries)!`);
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.message || 'Invalid JSON format.');
        }
    };

    const copyScript = () => {
        const script = `
// 📋 U.GG Win Rate Extractor (v3)
// Run this in the console on u.gg/lol/tier-list to get win rates

(function() {
    const data = {};
    
    // Strategy: Parse visible text content for champion names near percentages
    const text = document.body.innerText;
    const lines = text.split('\\n').map(l => l.trim()).filter(l => l);

    // List of known champions to filter out UI text like "Counters", "Tier", etc.
    const validChampions = ["Aatrox","Ahri","Akali","Akshan","Alistar","Ambessa","Amumu","Anivia","Annie","Aphelios","Ashe","AurelionSol","Aurora","Azir","Bard","Belveth","Blitzcrank","Brand","Braum","Briar","Caitlyn","Camille","Cassiopeia","Chogath","Corki","Darius","Diana","DrMundo","Draven","Ekko","Elise","Evelynn","Ezreal","Fiddlesticks","Fiora","Fizz","Galio","Gangplank","Garen","Gnar","Gragas","Graves","Gwen","Hecarim","Heimerdinger","Hwei","Illaoi","Irelia","Ivern","Janna","JarvanIV","Jax","Jayce","Jhin","Jinx","KSante","Kaisa","Kalista","Karma","Karthus","Kassadin","Katarina","Kayle","Kayn","Kennen","Khazix","Kindred","Kled","KogMaw","Leblanc","LeeSin","Leona","Lillia","Lissandra","Lucian","Lulu","Lux","Malphite","Malzahar","Maokai","MasterYi","Mel","Milio","MissFortune","MonkeyKing","Mordekaiser","Morgana","Naafiri","Nami","Nasus","Nautilus","Neeko","Nidalee","Nilah","Nocturne","Nunu","Olaf","Orianna","Ornn","Pantheon","Poppy","Pyke","Qiyana","Quinn","Rakan","Rammus","RekSai","Rell","Renata","Renekton","Rengar","Riven","Rumble","Ryze","Samira","Sejuani","Senna","Seraphine","Sett","Shaco","Shen","Shyvana","Singed","Sion","Sivir","Skarner","Smolder","Sona","Soraka","Swain","Sylas","Syndra","TahmKench","Taliyah","Talon","Taric","Teemo","Thresh","Tristana","Trundle","Tryndamere","TwistedFate","Twitch","Udyr","Urgot","Varus","Vayne","Veigar","Velkoz","Vex","Vi","Viego","Viktor","Vladimir","Volibear","Warwick","Xayah","Xerath","XinZhao","Yasuo","Yone","Yorick","Yunara","Yuumi","Zaahen","Zac","Zed","Zeri","Ziggs","Zilean","Zoe","Zyra"];
    const validSet = new Set(validChampions.map(n => n.toUpperCase()));

    // Helper to normalize name (remove spaces, punctuation)
    const normalize = (str) => str.replace(/[^a-zA-Z]/g, '').toUpperCase();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const cleanLine = normalize(line);
        
        let dbName = null;
        // Common mappings
        if (cleanLine === 'WUKONG') dbName = 'MonkeyKing';
        else if (cleanLine === 'RENATAGLASC') dbName = 'Renata';
        else if (cleanLine === 'NUNUWILLUMP') dbName = 'Nunu';
        else if (cleanLine === 'KOGMAW') dbName = 'KogMaw';
        else if (cleanLine === 'REKSAI') dbName = 'RekSai';
        else if (cleanLine === 'DRMUNDO') dbName = 'DrMundo';
        else if (cleanLine === 'JARVANIV') dbName = 'JarvanIV';
        else if (cleanLine === 'LEESIN') dbName = 'LeeSin';
        else if (cleanLine === 'MASTERYI') dbName = 'MasterYi';
        else if (cleanLine === 'MISSFORTUNE') dbName = 'MissFortune';
        else if (cleanLine === 'TAHMKENCH') dbName = 'TahmKench';
        else if (cleanLine === 'TWISTEDFATE') dbName = 'TwistedFate';
        else if (cleanLine === 'XINZHAO') dbName = 'XinZhao';
        else if (validSet.has(cleanLine)) {
            dbName = validChampions.find(c => c.toUpperCase() === cleanLine);
        }

        if (dbName) {
            let stats = {};
            let currentIndex = i + 1;
            let checks = 0;
            
            while (checks < 8 && currentIndex < lines.length) {
                const nextLine = lines[currentIndex];
                
                if (!stats.tier && /^[SABCD][+]?$/.test(nextLine)) {
                    stats.tier = nextLine;
                }
                else if (nextLine.endsWith('%')) {
                    const val = parseFloat(nextLine);
                    if (!isNaN(val)) {
                        if (!stats.winRate) stats.winRate = val / 100;
                        else if (!stats.pickRate) stats.pickRate = val / 100;
                        else if (!stats.banRate) stats.banRate = val / 100;
                    }
                }
                else if (!stats.matches && /^[0-9,]+$/.test(nextLine) && nextLine.length > 3) {
                     const m = parseInt(nextLine.replace(/,/g, ''));
                     if (!isNaN(m)) stats.matches = m;
                }

                if (stats.winRate && stats.pickRate && stats.banRate) break;
                currentIndex++;
                checks++;
            }

            if (stats.winRate) {
                data[dbName] = { 
                    winRate: stats.winRate,
                    pickRate: stats.pickRate || 0,
                    banRate: stats.banRate || 0,
                    matches: stats.matches || 0,
                    tier: stats.tier || ''
                };
            }
        }
    }

    if (Object.keys(data).length === 0) {
        console.error("❌ Still could not find data.");
        alert("Could not extract data.");
    } else {
        const json = JSON.stringify(data, null, 2);
        console.log(json);
        copy(json);
        console.log("✅ Data copied! (" + Object.keys(data).length + " champions)");
        alert("✅ Data copied! (" + Object.keys(data).length + " champions)\\nPaste it into the app.");
    }
})();
        `.trim();

        navigator.clipboard.writeText(script);
        setSuccessMsg('Script copied to clipboard!');
        setTimeout(() => setSuccessMsg(null), 2000);
    };

    return (
        <div className="editor-modal__overlay">
            <div className="editor-modal" style={{ width: '700px', maxWidth: '95%' }}>
                <h2 className="editor-modal__title">Import Win Rates from U.GG</h2>

                {/* Queue Selector */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {QUEUE_OPTIONS.map(q => (
                        <button
                            key={q.key}
                            onClick={() => setSelectedQueue(q.key)}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: selectedQueue === q.key ? '2px solid var(--gold)' : '2px solid rgba(255,255,255,0.1)',
                                background: selectedQueue === q.key ? 'rgba(201,171,102,0.15)' : 'rgba(255,255,255,0.03)',
                                color: selectedQueue === q.key ? 'var(--gold)' : 'var(--text-secondary)',
                                fontSize: '14px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {q.label}
                        </button>
                    ))}
                </div>

                <div className="import-steps">
                    <div className="import-step">
                        <span className="import-step__num">1</span>
                        <div className="import-step__content">
                            <p>Go to <strong><a href="https://u.gg/lol/tier-list" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>u.gg/lol/tier-list</a></strong>.</p>
                            <p>Select a role (e.g. <strong>Top Lane</strong>) and the queue type (<strong>{selectedQueue === 'soloq' ? 'Ranked Solo/Duo' : 'Ranked Flex'}</strong>).</p>
                        </div>
                    </div>

                    <div className="import-step">
                        <span className="import-step__num">2</span>
                        <div className="import-step__content">
                            <p>Open Developer Console (<strong>F12</strong>), copy this script, and run it:</p>
                            <button className="editor-btn editor-btn--edit" onClick={copyScript} style={{ marginTop: '8px', width: '100%' }}>
                                📋 Copy Script
                            </button>
                        </div>
                    </div>

                    <div className="import-step">
                        <span className="import-step__num">3</span>
                        <div className="import-step__content">
                            <p>Paste the output below into the matching role box. Repeat for other roles.</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Importing for: <strong style={{ color: 'var(--gold)' }}>{selectedQueue === 'soloq' ? 'Solo Queue' : 'Flex Queue'}</strong>
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                {['all', 'top', 'jungle', 'mid', 'adc', 'support'].map(role => (
                                    <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                                            {role}
                                        </label>
                                        <textarea
                                            className="editor-modal__field"
                                            value={inputs[role]}
                                            onChange={(e) => handleInput(role, e.target.value)}
                                            placeholder={`Paste ${role.toUpperCase()} JSON here...`}
                                            style={{ height: '80px', fontSize: '11px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {error && <div style={{ color: 'var(--red-accent)', fontSize: '12px', marginTop: '10px' }}>{error}</div>}
                {successMsg && <div style={{ color: 'var(--green-accent)', fontSize: '12px', marginTop: '10px' }}>{successMsg}</div>}

                <div className="editor-modal__actions">
                    <button className="editor-btn editor-btn--cancel" onClick={onClose}>Cancel</button>
                    <button className="editor-btn editor-btn--save" onClick={handleImport}>
                        Import {selectedQueue === 'soloq' ? 'Solo Q' : 'Flex'} Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WinRateImporter;
