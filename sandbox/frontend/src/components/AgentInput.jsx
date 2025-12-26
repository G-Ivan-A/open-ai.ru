import React, { useState } from 'react';
import '../styles/AgentInput.css';

function AgentInput({ onExecute, disabled, executing }) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState({
    sentiment: true,
    keywords: true,
    summary: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) {
      return;
    }

    onExecute(input, options);
  };

  const handleOptionToggle = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleExampleClick = (exampleText) => {
    setInput(exampleText);
  };

  const examples = [
    "Open-AI.ru - это отличная платформа для малого и среднего бизнеса. Она предоставляет инновационные решения для автоматизации процессов с помощью искусственного интеллекта. Пользователи могут найти различные ИИ-агенты и инструменты, которые помогут оптимизировать их бизнес-процессы.",
    "The AI agent sandbox is a secure isolated environment for testing artificial intelligence solutions. It provides Docker-based containerization, network isolation, resource limits, and comprehensive security measures including rate limiting and timeout controls.",
  ];

  return (
    <div className="agent-input">
      <h3>Ввод текста</h3>

      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите текст для анализа..."
          rows={8}
          maxLength={10000}
          disabled={disabled}
          className="input-textarea"
        />

        <div className="char-counter">
          {input.length} / 10000 символов
        </div>

        <div className="options-section">
          <h4>Параметры анализа</h4>
          <div className="options-grid">
            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={options.sentiment}
                onChange={() => handleOptionToggle('sentiment')}
                disabled={disabled}
              />
              <span>Анализ тональности</span>
            </label>

            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={options.keywords}
                onChange={() => handleOptionToggle('keywords')}
                disabled={disabled}
              />
              <span>Извлечение ключевых слов</span>
            </label>

            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={options.summary}
                onChange={() => handleOptionToggle('summary')}
                disabled={disabled}
              />
              <span>Суммаризация текста</span>
            </label>
          </div>
        </div>

        <div className="examples-section">
          <h4>Примеры:</h4>
          <div className="examples-buttons">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                disabled={disabled}
                className="btn-example"
              >
                Пример {index + 1}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={`btn-submit ${executing ? 'executing' : ''}`}
        >
          {executing ? (
            <>
              <span className="spinner-small"></span>
              Выполняется...
            </>
          ) : (
            'Анализировать'
          )}
        </button>
      </form>
    </div>
  );
}

export default AgentInput;
