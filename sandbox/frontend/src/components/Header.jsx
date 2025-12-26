import React from 'react';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Open-AI.ru</h1>
          <span className="subtitle">Песочница для ИИ-агентов</span>
        </div>
        <nav className="nav">
          <a href="#demo" className="nav-link">Демо</a>
          <a href="#docs" className="nav-link">Документация</a>
          <a href="https://github.com/G-Ivan-A/open-ai.ru" className="nav-link" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
