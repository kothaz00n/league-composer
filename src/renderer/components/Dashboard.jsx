import React from 'react';
import {
    IconSword,
    IconTeamBuilder,
    IconRoster,
    IconWinRate,
    IconCompositions,
    IconClashPlan,
    IconDraftPreview,
} from './HextechIcons';

const Dashboard = ({ onViewChange, isClientReady }) => {
    return (
        <div className="flex flex-col h-full theme-transition">
            {/* Titlebar */}
            <div className="titlebar">
                <span className="titlebar__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconSword size={16} style={{ color: 'var(--hextech-gold)' }} />
                    Draft Recommender
                </span>
                <div className="titlebar__controls" style={{ display: 'flex', gap: '8px' }}>
                    <button className="titlebar__btn" onClick={() => window.electronAPI?.minimizeWindow()}>─</button>
                    <button className="titlebar__btn titlebar__btn--close" onClick={() => window.electronAPI?.closeWindow()}>✕</button>
                </div>
            </div>

            <div className="dashboard-page">
                <header className="dashboard-header">
                    <h1 className="dashboard-title">League Team Comp</h1>
                    <p className="dashboard-subtitle">MASTER YOUR DRAFT. DOMINATE THE RIFT.</p>
                </header>

                <div className="dashboard-grid">
                    {/* Team Builder Card */}
                    <div
                        className="dashboard-card group animate-entry"
                        onClick={() => onViewChange('builder')}
                        onKeyDown={e => e.key === 'Enter' && onViewChange('builder')}
                        tabIndex={0}
                        role="button"
                        aria-label="Open Team Builder"
                        style={{ animationDelay: '0ms' }}
                    >
                        <div className="dashboard-card__icon">
                            <IconTeamBuilder size={28} />
                        </div>
                        <div className="dashboard-card__content">
                            <h2 className="dashboard-card__title">Team Builder</h2>
                            <p className="dashboard-card__desc">
                                Plan your composition. Drag &amp; drop champions, verify synergies, and analyze tier stats.
                            </p>
                        </div>
                    </div>

                    {/* Roster Card */}
                    <div
                        className="dashboard-card group animate-entry"
                        onClick={() => onViewChange('roster')}
                        onKeyDown={e => e.key === 'Enter' && onViewChange('roster')}
                        tabIndex={0}
                        role="button"
                        aria-label="Open Roster & Favorites"
                        style={{ animationDelay: '80ms' }}
                    >
                        <div className="dashboard-card__icon">
                            <IconRoster size={28} />
                        </div>
                        <div className="dashboard-card__content">
                            <h2 className="dashboard-card__title">Roster &amp; Favorites</h2>
                            <p className="dashboard-card__desc">
                                Configure your team roster. Set favorite champions for tailored draft recommendations.
                            </p>
                        </div>
                    </div>

                    {/* Win Rates Card */}
                    <div
                        className="dashboard-card group animate-entry"
                        onClick={() => onViewChange('winrates')}
                        onKeyDown={e => e.key === 'Enter' && onViewChange('winrates')}
                        tabIndex={0}
                        role="button"
                        aria-label="Open Win Rates Reference"
                        style={{ animationDelay: '160ms' }}
                    >
                        <div className="dashboard-card__icon">
                            <IconWinRate size={28} />
                        </div>
                        <div className="dashboard-card__content">
                            <h2 className="dashboard-card__title">Win Rates Reference</h2>
                            <p className="dashboard-card__desc">
                                Browse champion win rates, tier lists, pick rates, and ban rates by role.
                            </p>
                        </div>
                    </div>

                    {/* Compositions Editor Card */}
                    <div
                        className="dashboard-card group animate-entry"
                        onClick={() => onViewChange('editor')}
                        onKeyDown={e => e.key === 'Enter' && onViewChange('editor')}
                        tabIndex={0}
                        role="button"
                        aria-label="Open Compositions Editor"
                        style={{ animationDelay: '240ms' }}
                    >
                        <div className="dashboard-card__icon">
                            <IconCompositions size={28} />
                        </div>
                        <div className="dashboard-card__content">
                            <h2 className="dashboard-card__title">Compositions Editor</h2>
                            <p className="dashboard-card__desc">
                                Design custom composition archetypes and manage data imports for the engine.
                            </p>
                        </div>
                    </div>

                    {/* Clash Plan Card */}
                    <div
                        className="dashboard-card group animate-entry"
                        onClick={() => onViewChange('clashplan')}
                        onKeyDown={e => e.key === 'Enter' && onViewChange('clashplan')}
                        tabIndex={0}
                        role="button"
                        aria-label="Open Clash Plan"
                        style={{ animationDelay: '320ms' }}
                    >
                        <div className="dashboard-card__icon">
                            <IconClashPlan size={28} />
                        </div>
                        <div className="dashboard-card__content">
                            <h2 className="dashboard-card__title">Clash Plan</h2>
                            <p className="dashboard-card__desc">
                                Build your full 5v5 plan. Analyze synergy, detect gaps, and get targeted ban recommendations.
                            </p>
                        </div>
                    </div>

                    {/* Draft Preview Card */}
                    <div
                        className="dashboard-card group animate-entry"
                        onClick={() => onViewChange('preview')}
                        onKeyDown={e => e.key === 'Enter' && onViewChange('preview')}
                        tabIndex={0}
                        role="button"
                        aria-label="Open Draft Preview"
                        style={{ animationDelay: '400ms' }}
                    >
                        <div className="dashboard-card__icon">
                            <IconDraftPreview size={28} />
                        </div>
                        <div className="dashboard-card__content">
                            <h2 className="dashboard-card__title">Draft Preview</h2>
                            <p className="dashboard-card__desc">
                                Sandbox mode — explore predefined comps, see pick recommendations and analyze them without a live game.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Section */}
                <div className="dashboard-status" role="status" aria-live="polite">
                    <div className="status-indicator">
                        <div className={`status-dot ${isClientReady ? 'connected' : 'waiting'}`} aria-hidden="true"></div>
                        <span className="status-text">
                            {isClientReady ? 'LEAGUE CLIENT CONNECTED' : 'WAITING FOR LEAGUE CLIENT...'}
                        </span>
                    </div>
                    {isClientReady && (
                        <span className="status-badge ready" aria-label="System ready">
                            SYSTEM READY
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
