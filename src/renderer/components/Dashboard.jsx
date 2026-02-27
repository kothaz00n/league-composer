import React from 'react';
import {
    IconSword,
    IconTeamBuilderDashboard,
    IconRosterDashboard,
    IconWinRateDashboard,
    IconCompositionsDashboard,
} from './HextechIcons';

const Dashboard = ({ onViewChange, isClientReady }) => {
    return (
        <div className="flex flex-col h-full theme-transition dashboard-wrapper">
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
                <header className="dashboard-header text-center">
                    <h1 className="dashboard-title">League Team Comp</h1>
                    <p className="dashboard-subtitle">MASTER YOUR DRAFT. DOMINATE THE RIFT.</p>
                    <div className="dashboard-divider">
                        <div className="dashboard-divider-line"></div>
                        <div className="dashboard-divider-diamond"></div>
                        <div className="dashboard-divider-line"></div>
                    </div>
                </header>

                <div className="dashboard-grid mx-auto">
                    {/* Team Builder Card */}
                    <div
                        className="dashboard-card group"
                        onClick={() => onViewChange('builder')}
                        style={{ animationDelay: '0ms' }}
                    >
                        <div className="dashboard-card__border"></div>
                        <div className="dashboard-card__inner">
                            <div className="dashboard-card__icon">
                                <IconTeamBuilderDashboard size={80} />
                            </div>
                            <h2 className="dashboard-card__title">Team Builder</h2>
                            <p className="dashboard-card__desc">
                                Plan your composition. Drag &amp; drop champions, verify synergies, and analyze tier stats.
                            </p>
                        </div>
                    </div>

                    {/* Roster Card */}
                    <div
                        className="dashboard-card group"
                        onClick={() => onViewChange('roster')}
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="dashboard-card__border"></div>
                        <div className="dashboard-card__inner">
                            <div className="dashboard-card__icon">
                                <IconRosterDashboard size={80} />
                            </div>
                            <h2 className="dashboard-card__title">Roster &amp; Favorites</h2>
                            <p className="dashboard-card__desc">
                                Configure your team roster. Set favorite champions for tailored draft recommendations.
                            </p>
                        </div>
                    </div>

                    {/* Win Rates Card */}
                    <div
                        className="dashboard-card group"
                        onClick={() => onViewChange('winrates')}
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="dashboard-card__border"></div>
                        <div className="dashboard-card__inner">
                            <div className="dashboard-card__icon">
                                <IconWinRateDashboard size={80} />
                            </div>
                            <h2 className="dashboard-card__title">Win Rates Reference</h2>
                            <p className="dashboard-card__desc">
                                Browse champion win rates, tier lists, pick rates, and ban rates by role.
                            </p>
                        </div>
                    </div>

                    {/* Compositions Editor Card */}
                    <div
                        className="dashboard-card group"
                        onClick={() => onViewChange('editor')}
                        style={{ animationDelay: '300ms' }}
                    >
                        <div className="dashboard-card__border"></div>
                        <div className="dashboard-card__inner">
                            <div className="dashboard-card__icon">
                                <IconCompositionsDashboard size={80} />
                            </div>
                            <h2 className="dashboard-card__title">Compositions Editor</h2>
                            <p className="dashboard-card__desc">
                                Design custom composition archetypes and manage data imports for the engine.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-footer">
                    <div className="dashboard-status-bar">
                        <div className={`status-dot-glow ${isClientReady ? 'connected' : 'waiting'}`}></div>
                        <span className="status-text-glow">
                            {isClientReady ? 'WAITING FOR LEAGUE CLIENT... (CONNECTED)' : 'WAITING FOR LEAGUE CLIENT...'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
