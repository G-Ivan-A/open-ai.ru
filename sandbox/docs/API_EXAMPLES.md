# API Usage Examples

## Примеры использования AI Agent Sandbox API

### 1. Создание сессии и выполнение агента (cURL)

```bash
# Создание сессии
SESSION_RESPONSE=$(curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "text-analysis",
    "metadata": {"user": "demo"}
  }')

# Извлечение session ID
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.data.sessionId')

# Выполнение агента
curl -X POST "http://localhost:3001/api/sessions/$SESSION_ID/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Open-AI.ru - это отличная платформа для малого и среднего бизнеса.",
    "options": {
      "sentiment": true,
      "keywords": true,
      "summary": true
    }
  }'

# Удаление сессии
curl -X DELETE "http://localhost:3001/api/sessions/$SESSION_ID"
```

### 2. Использование с JavaScript/Node.js

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function analyzeText(text) {
  try {
    // Создание сессии
    const sessionRes = await axios.post(`${API_URL}/sessions`, {
      agentType: 'text-analysis'
    });

    const sessionId = sessionRes.data.data.sessionId;
    console.log('Session created:', sessionId);

    // Выполнение агента
    const executeRes = await axios.post(
      `${API_URL}/agents/${sessionId}/execute`,
      {
        input: text,
        options: {
          sentiment: true,
          keywords: true,
          summary: true
        }
      }
    );

    console.log('Analysis result:', executeRes.data.data.result);

    // Удаление сессии
    await axios.delete(`${API_URL}/sessions/${sessionId}`);
    console.log('Session destroyed');

    return executeRes.data.data.result;

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Использование
analyzeText('Open-AI.ru помогает малому бизнесу автоматизировать процессы с помощью ИИ.');
```

### 3. Использование с Python

```python
import requests
import json

API_URL = 'http://localhost:3001/api'

def analyze_text(text):
    # Создание сессии
    session_res = requests.post(f'{API_URL}/sessions', json={
        'agentType': 'text-analysis'
    })
    session_res.raise_for_status()

    session_id = session_res.json()['data']['sessionId']
    print(f'Session created: {session_id}')

    try:
        # Выполнение агента
        execute_res = requests.post(
            f'{API_URL}/agents/{session_id}/execute',
            json={
                'input': text,
                'options': {
                    'sentiment': True,
                    'keywords': True,
                    'summary': True
                }
            }
        )
        execute_res.raise_for_status()

        result = execute_res.json()['data']['result']
        print('Analysis result:', json.dumps(result, indent=2))

        return result

    finally:
        # Удаление сессии
        delete_res = requests.delete(f'{API_URL}/sessions/{session_id}')
        print('Session destroyed')

# Использование
analyze_text('Платформа Open-AI.ru предоставляет инструменты для автоматизации бизнеса.')
```

### 4. Batch Processing (множественный анализ)

```javascript
const axios = require('axios');

async function batchAnalyze(texts) {
  const API_URL = 'http://localhost:3001/api';

  // Создание сессии
  const sessionRes = await axios.post(`${API_URL}/sessions`, {
    agentType: 'text-analysis'
  });

  const sessionId = sessionRes.data.data.sessionId;

  try {
    const results = [];

    for (const text of texts) {
      const res = await axios.post(
        `${API_URL}/agents/${sessionId}/execute`,
        {
          input: text,
          options: {
            sentiment: true,
            keywords: true,
            summary: false  // Отключаем summary для скорости
          }
        }
      );

      results.push({
        text: text.substring(0, 50) + '...',
        sentiment: res.data.data.result.sentiment,
        topKeywords: res.data.data.result.keywords.slice(0, 5)
      });
    }

    return results;

  } finally {
    // Очистка сессии
    await axios.delete(`${API_URL}/sessions/${sessionId}`);
  }
}

// Использование
const texts = [
  'Отличный сервис для малого бизнеса!',
  'Ужасный опыт использования платформы.',
  'Нейтральное мнение о продукте.'
];

batchAnalyze(texts).then(results => {
  console.log('Batch results:', JSON.stringify(results, null, 2));
});
```

### 5. React Hook для интеграции

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export function useSandbox(agentType = 'text-analysis') {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Создание сессии при монтировании
  useEffect(() => {
    let sessionId;

    const createSession = async () => {
      try {
        const res = await axios.post(`${API_URL}/sessions`, { agentType });
        const newSession = res.data.data;
        setSession(newSession);
        sessionId = newSession.sessionId;
      } catch (err) {
        setError(err.message);
      }
    };

    createSession();

    // Очистка при размонтировании
    return () => {
      if (sessionId) {
        axios.delete(`${API_URL}/sessions/${sessionId}`).catch(console.error);
      }
    };
  }, [agentType]);

  const executeAgent = async (input, options) => {
    if (!session) {
      throw new Error('Session not ready');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${API_URL}/agents/${session.sessionId}/execute`,
        { input, options }
      );

      return res.data.data.result;

    } catch (err) {
      setError(err.message);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  return { session, loading, error, executeAgent };
}

// Использование в компоненте
function TextAnalyzer() {
  const { session, loading, executeAgent } = useSandbox('text-analysis');
  const [result, setResult] = useState(null);

  const handleAnalyze = async (text) => {
    const result = await executeAgent(text, {
      sentiment: true,
      keywords: true,
      summary: true
    });

    setResult(result);
  };

  return (
    <div>
      {session && <p>Session: {session.sessionId}</p>}
      <button onClick={() => handleAnalyze('Sample text')}>
        Analyze
      </button>
      {loading && <p>Loading...</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### 6. Error Handling

```javascript
async function analyzeWithErrorHandling(text) {
  const API_URL = 'http://localhost:3001/api';

  try {
    // Создание сессии
    const sessionRes = await axios.post(`${API_URL}/sessions`, {
      agentType: 'text-analysis'
    });

    const sessionId = sessionRes.data.data.sessionId;

    try {
      // Выполнение агента
      const executeRes = await axios.post(
        `${API_URL}/agents/${sessionId}/execute`,
        { input: text, options: { sentiment: true } }
      );

      return executeRes.data.data.result;

    } catch (executeError) {
      if (executeError.response?.status === 404) {
        console.error('Session not found or expired');
      } else if (executeError.response?.status === 400) {
        console.error('Invalid input:', executeError.response.data.error);
      } else if (executeError.response?.status === 429) {
        console.error('Rate limit exceeded. Please wait and try again.');
      } else {
        console.error('Execution error:', executeError.message);
      }

      throw executeError;

    } finally {
      // Всегда пытаемся очистить сессию
      try {
        await axios.delete(`${API_URL}/sessions/${sessionId}`);
      } catch (deleteError) {
        console.warn('Failed to delete session:', deleteError.message);
      }
    }

  } catch (sessionError) {
    if (sessionError.response?.status === 429) {
      console.error('Too many sessions. Please wait.');
    } else {
      console.error('Session creation error:', sessionError.message);
    }

    throw sessionError;
  }
}
```

### 7. Monitoring Session Status

```javascript
async function monitorSession(sessionId) {
  const API_URL = 'http://localhost:3001/api';

  const interval = setInterval(async () => {
    try {
      const res = await axios.get(`${API_URL}/sessions/${sessionId}`);
      console.log('Session status:', res.data.data.status);

      if (res.data.data.status !== 'active') {
        console.log('Session no longer active');
        clearInterval(interval);
      }

    } catch (error) {
      console.error('Session check failed:', error.message);
      clearInterval(interval);
    }
  }, 5000); // Check every 5 seconds

  return interval;
}
```

## Rate Limiting Examples

### Handling Rate Limits

```javascript
async function analyzeWithRetry(text, maxRetries = 3) {
  const API_URL = 'http://localhost:3001/api';

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await analyzeText(text);

    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        console.log(`Rate limited. Retrying after ${retryAfter}s...`);

        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}
```
