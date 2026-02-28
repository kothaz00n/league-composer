import React from 'react';

export default function StatusBar({ status, onRetry }) {
    const { status: statusType, message } = status;

    return (
        <div className="status-bar">
            <span className={`status-dot status-dot--${statusType}`} />
            <span>{message}</span>
            {statusType === 'disconnected' && (
                <button className="status-bar__retry" onClick={onRetry}>
                    RETRY
                </button>
            )}
        </div>
    );
}
