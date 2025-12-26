import React, { useState } from 'react';
import SandboxInterface from './components/SandboxInterface';
import Header from './components/Header';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <SandboxInterface />
      </main>
      <footer className="footer">
        <p>&copy; 2025 Open-AI.ru. Песочница для ИИ-агентов.</p>
      </footer>
    </div>
  );
}

export default App;
