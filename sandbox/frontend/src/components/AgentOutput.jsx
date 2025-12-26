import React, { useState } from 'react';
import '../styles/AgentOutput.css';

function AgentOutput({ item }) {
  const [expanded, setExpanded] = useState(true);

  const { input, result, executedAt, executionTime } = item;

  return (
    <div className="agent-output">
      <div className="output-header" onClick={() => setExpanded(!expanded)}>
        <div className="output-meta">
          <span className="timestamp">{new Date(executedAt).toLocaleString('ru-RU')}</span>
          <span className="execution-time">{executionTime}ms</span>
        </div>
        <button className="toggle-btn">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="output-content">
          <div className="input-preview">
            <h4>Входной текст:</h4>
            <p className="input-text">{input.substring(0, 200)}{input.length > 200 ? '...' : ''}</p>
          </div>

          <div className="results-grid">
            {result.sentiment && (
              <div className="result-card">
                <h4>Тональность</h4>
                <div className="sentiment-display">
                  <div className={`sentiment-badge ${result.sentiment.label}`}>
                    {getSentimentLabel(result.sentiment.label)}
                  </div>
                  <div className="sentiment-details">
                    <p>Оценка: {result.sentiment.score}</p>
                    <p>Уверенность: {(result.sentiment.confidence * 100).toFixed(1)}%</p>
                    <p>Позитивных слов: {result.sentiment.positive_words}</p>
                    <p>Негативных слов: {result.sentiment.negative_words}</p>
                  </div>
                </div>
              </div>
            )}

            {result.keywords && (
              <div className="result-card">
                <h4>Ключевые слова</h4>
                <div className="keywords-list">
                  {result.keywords.slice(0, 10).map((kw, index) => (
                    <div key={index} className="keyword-item">
                      <span className="keyword">{kw.keyword}</span>
                      <span className="frequency">{kw.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.summary && (
              <div className="result-card full-width">
                <h4>Краткое содержание</h4>
                <p className="summary-text">{result.summary.summary}</p>
                <div className="summary-stats">
                  <span>Предложений: {result.summary.original_sentences} → {result.summary.summary_sentences}</span>
                  <span>Сжатие: {(result.summary.compression_ratio * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}

            <div className="result-card">
              <h4>Статистика</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Символов:</span>
                  <span className="stat-value">{result.text_length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Слов:</span>
                  <span className="stat-value">{result.word_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Предложений:</span>
                  <span className="stat-value">{result.sentence_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSentimentLabel(label) {
  const labels = {
    'positive': 'Позитивная',
    'negative': 'Негативная',
    'neutral': 'Нейтральная'
  };
  return labels[label] || label;
}

export default AgentOutput;
