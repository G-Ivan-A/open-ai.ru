import React from 'react';
import '../styles/SessionInfo.css';

function SessionInfo({ session, loading, onReset }) {
  if (loading) {
    return (
      <div className="session-info loading">
        <div className="spinner"></div>
        <p>Создание сессии...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="session-info error">
        <p>Сессия не активна</p>
        <button onClick={onReset} className="btn-reset">Создать сессию</button>
      </div>
    );
  }

  const expiresAt = new Date(new Date(session.createdAt).getTime() + session.expiresIn);
  const timeRemaining = Math.max(0, Math.floor((expiresAt - new Date()) / 1000));

  return (
    <div className="session-info active">
      <div className="session-header">
        <h3>Информация о сессии</h3>
        <button onClick={onReset} className="btn-reset" title="Пересоздать сессию">
          🔄
        </button>
      </div>

      <div className="session-details">
        <div className="detail-row">
          <span className="label">ID:</span>
          <span className="value mono">{session.sessionId.substring(0, 8)}...</span>
        </div>

        <div className="detail-row">
          <span className="label">Агент:</span>
          <span className="value">{session.agentType}</span>
        </div>

        <div className="detail-row">
          <span className="label">Статус:</span>
          <span className="status-badge active">Активна</span>
        </div>

        <div className="detail-row">
          <span className="label">Осталось:</span>
          <span className="value">{formatTime(timeRemaining)}</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default SessionInfo;
