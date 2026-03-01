import React from 'react';

export default function StatusBar({ status, onRetry }) {
    const { status: statusType, message } = status;

    return (
        <div className="status-bar" role="status" aria-live="polite">
            <span className={`status-dot status-dot--${statusType}`} aria-hidden="true" />
            <span>{message}</span>
            {statusType === 'disconnected' && (
                <button
                    className="status-bar__retry"
                    onClick={onRetry}
                    aria-label="Retry connection"
                >
                    RETRY
                </button>
            )}
        </div>
    );
}
