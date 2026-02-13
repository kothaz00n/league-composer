import React from 'react';

const Dashboard = ({ onViewChange, isClientReady }) => {
    return (
        <div className="flex flex-col h-full">
            {/* Titlebar */}
            <div className="titlebar">
                <span className="titlebar__title">⚔ Draft Recommender</span>
                <div className="titlebar__controls">
                    <button className="titlebar__btn" onClick={() => window.electronAPI?.minimizeWindow()}>─</button>
                    <button className="titlebar__btn titlebar__btn--close" onClick={() => window.electronAPI?.closeWindow()}>✕</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gold mb-1">League Team Comp</h1>
                    <p className="text-sm text-gray-400">Master your draft. Plan your victory.</p>
                </header>

                <div className="grid grid-cols-1 gap-4 mb-6">
                    {/* Team Builder Card */}
                    <div
                        className="bg-gray-800/50 p-5 rounded-xl border border-white/10 hover:border-gold/50 hover:bg-white/5 transition cursor-pointer group flex items-center gap-4"
                        onClick={() => onViewChange('builder')}
                    >
                        <div className="text-3xl group-hover:scale-110 transition-transform">🛠️</div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-100">Team Builder</h2>
                            <p className="text-xs text-gray-400">
                                Plan your composition. Drag & drop champions, check synergies and tier stats.
                            </p>
                        </div>
                    </div>

                    {/* Roster Card */}
                    <div
                        className="bg-gray-800/50 p-5 rounded-xl border border-white/10 hover:border-gold/50 hover:bg-white/5 transition cursor-pointer group flex items-center gap-4"
                        onClick={() => onViewChange('roster')}
                    >
                        <div className="text-3xl group-hover:scale-110 transition-transform">👥</div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-100">Roster & Favorites</h2>
                            <p className="text-xs text-gray-400">
                                Configure your team. Set favorite champions for personalized recommendations.
                            </p>
                        </div>
                    </div>

                    {/* Win Rates Card */}
                    <div
                        className="bg-gray-800/50 p-5 rounded-xl border border-white/10 hover:border-gold/50 hover:bg-white/5 transition cursor-pointer group flex items-center gap-4"
                        onClick={() => onViewChange('winrates')}
                    >
                        <div className="text-3xl group-hover:scale-110 transition-transform">📊</div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-100">Win Rates</h2>
                            <p className="text-xs text-gray-400">
                                Browse champion win rates, tiers, pick rates, and ban rates by role.
                            </p>
                        </div>
                    </div>

                    {/* Import Data Card */}
                    <div
                        className="bg-gray-800/50 p-5 rounded-xl border border-white/10 hover:border-gold/50 hover:bg-white/5 transition cursor-pointer group flex items-center gap-4"
                        onClick={() => onViewChange('editor')}
                    >
                        <div className="text-3xl group-hover:scale-110 transition-transform">📋</div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-100">Compositions Editor</h2>
                            <p className="text-xs text-gray-400">
                                Edit composition archetypes and data imports.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Section */}
                <div className="mt-auto bg-black/20 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isClientReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                        <span className="text-sm text-gray-300">
                            {isClientReady ? 'League Client Connected' : 'Waiting for League Client...'}
                        </span>
                    </div>
                    {isClientReady && (
                        <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-800">
                            Ready
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
