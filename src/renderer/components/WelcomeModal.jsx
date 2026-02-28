import React from 'react';
import { IconSword, IconTeamBuilder, IconImport } from './HextechIcons';

const FEATURES = [
    {
        Icon: IconSword,
        title: 'Draft Assistant',
        desc: 'Real-time champion recommendations during champion select. Counter-picks, synergies, and composition fit — all in one panel.',
    },
    {
        Icon: IconTeamBuilder,
        title: 'Team Builder',
        desc: 'Plan your composition before the game. Drag & drop champions, analyze synergies, and save archetypes for future drafts.',
    },
    {
        Icon: IconImport,
        title: 'Win Rate Import',
        desc: 'Import tier list data from U.GG automatically or paste from clipboard to power up your recommendations with current meta stats.',
    },
];

export default function WelcomeModal({ onClose }) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)',
            }}
        >
            <div
                style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--hextech-gold-dim)',
                    borderRadius: '8px',
                    padding: '32px',
                    maxWidth: '520px',
                    width: '90%',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div
                        className="font-display"
                        style={{
                            fontSize: '22px',
                            letterSpacing: '3px',
                            color: 'var(--hextech-gold)',
                            marginBottom: '6px',
                        }}
                    >
                        LEAGUE COMPOSER
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Your real-time draft assistant for League of Legends
                    </div>
                </div>

                {/* Feature cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                    {FEATURES.map(({ Icon, title, desc }) => (
                        <div
                            key={title}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '14px',
                                padding: '12px 14px',
                                background: 'rgba(200, 170, 80, 0.05)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                            }}
                        >
                            <div style={{ color: 'var(--hextech-gold)', flexShrink: 0, paddingTop: '2px' }}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <div
                                    className="font-display"
                                    style={{ fontSize: '13px', color: 'var(--hextech-gold-light)', letterSpacing: '1px', marginBottom: '4px' }}
                                >
                                    {title}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    {desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        className="btn-hextech active"
                        onClick={onClose}
                        style={{ padding: '10px 40px', fontSize: '13px', letterSpacing: '2px' }}
                    >
                        GET STARTED
                    </button>
                </div>
            </div>
        </div>
    );
}
