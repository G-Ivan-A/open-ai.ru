import React, { useState, useEffect } from 'react';
import { createSession, destroySession, executeAgent } from '../services/api';
import AgentInput from './AgentInput';
import AgentOutput from './AgentOutput';
import SessionInfo from './SessionInfo';
import '../styles/SandboxInterface.css';

function SandboxInterface() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [executing, setExecuting] = useState(false);

  // Create session on mount
  useEffect(() => {
    handleCreateSession();

    // Cleanup on unmount
    return () => {
      if (session) {
        destroySession(session.sessionId).catch(console.error);
      }
    };
  }, []);

  const handleCreateSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const newSession = await createSession('text-analysis');
      setSession(newSession);
      setHistory([]);
    } catch (err) {
      setError(err.message || 'Не удалось создать сессию');
      console.error('Failed to create session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (input, options) => {
    if (!session) {
      setError('Сначала создайте сессию');
      return;
    }

    setExecuting(true);
    setError(null);

    const startTime = Date.now();

    try {
      const result = await executeAgent(session.sessionId, input, options);
      const executionTime = Date.now() - startTime;

      // Add to history
      const historyItem = {
        id: Date.now(),
        input,
        options,
        result: result.result,
        executedAt: result.executedAt,
        executionTime
      };

      setHistory(prev => [historyItem, ...prev]);

    } catch (err) {
      setError(err.message || 'Ошибка выполнения агента');
      console.error('Failed to execute agent:', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleResetSession = async () => {
    if (session) {
      try {
        await destroySession(session.sessionId);
      } catch (err) {
        console.error('Failed to destroy session:', err);
      }
    }

    await handleCreateSession();
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="sandbox-interface">
      <div className="sandbox-header">
        <h2>Демонстрационный агент: Анализ текста</h2>
        <p className="description">
          Этот агент выполняется в изолированной песочнице Docker и может анализировать текст,
          определяя тональность, извлекая ключевые слова и создавая краткое резюме.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button onClick={() => setError(null)} className="error-close">✕</button>
        </div>
      )}

      <div className="sandbox-content">
        <div className="left-panel">
          <SessionInfo
            session={session}
            loading={loading}
            onReset={handleResetSession}
          />

          <AgentInput
            onExecute={handleExecute}
            disabled={!session || executing}
            executing={executing}
          />
        </div>

        <div className="right-panel">
          <div className="history-header">
            <h3>История выполнения</h3>
            {history.length > 0 && (
              <button onClick={handleClearHistory} className="btn-clear">
                Очистить
              </button>
            )}
          </div>

          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <p>История пуста</p>
                <p className="empty-hint">Введите текст и нажмите "Анализировать"</p>
              </div>
            ) : (
              history.map(item => (
                <AgentOutput key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SandboxInterface;
