import React from 'react';

export default function StatusBar({ status, onRetry }) {
    const { status: statusType, message } = status;

    return (
        <div className="status-bar">
            <span className={`status-dot status-dot--${statusType}`} />
            <span>{message}</span>
            {statusType === 'disconnected' && (
                <button
                    onClick={onRetry}
                    style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: '1px solid rgba(200, 170, 110, 0.3)',
                        color: '#c8aa6e',
                        padding: '2px 10px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    RETRY
                </button>
            )}
        </div>
    );
}
