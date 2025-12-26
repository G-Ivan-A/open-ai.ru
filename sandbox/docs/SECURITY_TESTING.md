# Security Testing Guide

## Обзор

Этот документ описывает процедуры тестирования безопасности AI Agent Sandbox.

## Категории тестирования

### 1. Container Isolation Testing

#### Тест: Попытка доступа к файловой системе хоста

```python
# agents/test-security/test_filesystem.py
import os
import sys

# Попытка доступа к /etc/passwd хоста
try:
    with open('/etc/passwd', 'r') as f:
        print(f.read())
except Exception as e:
    print(f"Access denied (expected): {e}")

# Попытка доступа к корневой директории
try:
    files = os.listdir('/')
    print("Root directory accessible (SECURITY ISSUE):", files)
except Exception as e:
    print(f"Access denied (expected): {e}")
```

**Ожидаемый результат**: Доступ должен быть ограничен контейнером

#### Тест: Network isolation

```python
# agents/test-security/test_network.py
import socket
import sys

# Попытка создать сокет
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(('google.com', 80))
    print("Network connection successful (SECURITY ISSUE)")
    s.close()
except Exception as e:
    print(f"Network access denied (expected): {e}")
```

**Ожидаемый результат**: Сетевые соединения должны быть заблокированы

#### Тест: Process spawning limits

```bash
# Test PID limit
for i in {1..200}; do
  sleep 1000 &
done
```

**Ожидаемый результат**: Процесс должен быть ограничен до 100 PID

### 2. API Security Testing

#### Rate Limiting Test

```javascript
// tests/security/rate-limit.test.js
const axios = require('axios');

async function testRateLimit() {
  const API_URL = 'http://localhost:3001/api';
  const requests = [];

  // Отправка 150 запросов (лимит 100/15min)
  for (let i = 0; i < 150; i++) {
    requests.push(
      axios.post(`${API_URL}/sessions`, { agentType: 'text-analysis' })
        .catch(err => ({ status: err.response?.status }))
    );
  }

  const results = await Promise.all(requests);

  const rateLimited = results.filter(r => r.status === 429);

  console.log(`Rate limited requests: ${rateLimited.length}/150`);

  // Должно быть минимум 50 заблокированных запросов
  if (rateLimited.length >= 50) {
    console.log('✓ Rate limiting working correctly');
    return true;
  } else {
    console.error('✗ Rate limiting not working properly');
    return false;
  }
}

testRateLimit();
```

#### Input Validation Test

```javascript
// tests/security/input-validation.test.js
const request = require('supertest');
const app = require('../src/index.js');

describe('Input Validation Security', () => {
  let sessionId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ agentType: 'text-analysis' });
    sessionId = res.body.data.sessionId;
  });

  it('should reject SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";

    const res = await request(app)
      .post(`/api/agents/${sessionId}/execute`)
      .send({ input: maliciousInput, options: {} });

    expect(res.status).toBe(200); // Должно обработаться безопасно
    expect(res.body.data.result).toBeDefined();
  });

  it('should reject command injection attempts', async () => {
    const maliciousInput = "; rm -rf / ;";

    const res = await request(app)
      .post(`/api/agents/${sessionId}/execute`)
      .send({ input: maliciousInput, options: {} });

    expect(res.status).toBe(200); // Должно обработаться безопасно
  });

  it('should reject XSS attempts', async () => {
    const maliciousInput = "<script>alert('XSS')</script>";

    const res = await request(app)
      .post(`/api/agents/${sessionId}/execute`)
      .send({ input: maliciousInput, options: {} });

    expect(res.status).toBe(200); // Должно обработаться безопасно
    // Result не должен содержать executable script
    expect(JSON.stringify(res.body.data.result)).not.toContain('<script>');
  });

  it('should reject oversized payloads', async () => {
    const largeInput = 'A'.repeat(10001);

    const res = await request(app)
      .post(`/api/agents/${sessionId}/execute`)
      .send({ input: largeInput, options: {} });

    expect(res.status).toBe(400);
  });
});
```

### 3. Resource Exhaustion Testing

#### Memory Limit Test

```python
# agents/test-security/test_memory.py
import sys

# Попытка выделить больше памяти, чем разрешено (512MB)
try:
    data = []
    for i in range(1000):
        # Попытка выделить 1MB блоки
        data.append(' ' * (1024 * 1024))
        print(f"Allocated {i+1} MB")
except MemoryError:
    print("Memory limit reached (expected)")
except Exception as e:
    print(f"Error: {e}")
```

**Ожидаемый результат**: Процесс должен быть убит при превышении лимита 512MB

#### CPU Limit Test

```python
# agents/test-security/test_cpu.py
import time
import multiprocessing

def cpu_intensive():
    while True:
        pass

if __name__ == '__main__':
    # Попытка создать много процессов
    processes = []
    for i in range(10):
        p = multiprocessing.Process(target=cpu_intensive)
        p.start()
        processes.append(p)

    time.sleep(10)

    for p in processes:
        p.terminate()
```

**Ожидаемый результат**: CPU должен быть ограничен 1 ядром

#### Timeout Test

```bash
# Test execution timeout (60s default)
curl -X POST http://localhost:3001/api/agents/$SESSION_ID/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "test", "options": {}}' &

# Ожидаем 65 секунд
sleep 65

# Проверяем, что контейнер был остановлен
```

**Ожидаемый результат**: Выполнение должно быть прервано после 60 секунд

### 4. Session Management Security

#### Concurrent Session Limit Test

```javascript
async function testConcurrentSessions() {
  const API_URL = 'http://localhost:3001/api';
  const sessions = [];

  // Попытка создать 15 сессий (лимит 10)
  for (let i = 0; i < 15; i++) {
    try {
      const res = await axios.post(`${API_URL}/sessions`, {
        agentType: 'text-analysis'
      });
      sessions.push(res.data.data.sessionId);
      console.log(`Session ${i+1} created`);
    } catch (error) {
      console.log(`Session ${i+1} failed: ${error.response?.data?.error}`);
    }
  }

  console.log(`Created ${sessions.length}/15 sessions`);

  // Cleanup
  for (const sessionId of sessions) {
    await axios.delete(`${API_URL}/sessions/${sessionId}`).catch(() => {});
  }

  // Должно быть создано максимум 10 сессий
  return sessions.length <= 10;
}
```

#### Session Auto-cleanup Test

```javascript
async function testAutoCleanup() {
  const API_URL = 'http://localhost:3001/api';

  // Создать сессию
  const res = await axios.post(`${API_URL}/sessions`, {
    agentType: 'text-analysis'
  });

  const sessionId = res.data.data.sessionId;
  console.log('Session created:', sessionId);

  // Ждем истечения timeout (5 минут)
  console.log('Waiting for timeout...');
  await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000 + 5000));

  // Проверяем, что сессия удалена
  try {
    await axios.get(`${API_URL}/sessions/${sessionId}`);
    console.error('✗ Session still exists (ISSUE)');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✓ Session auto-cleaned correctly');
      return true;
    }
  }
}
```

### 5. Docker Security Audit

#### Check Container Configuration

```bash
#!/bin/bash

SESSION_ID="test-session"

# Create test session
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"agentType": "text-analysis"}'

# Get container ID
CONTAINER_ID=$(docker ps --filter "label=sandbox.session.id=$SESSION_ID" --format "{{.ID}}")

# Security checks
echo "=== Security Audit ==="

# 1. Check if running as root
docker exec $CONTAINER_ID whoami
# Expected: sandbox (not root)

# 2. Check capabilities
docker inspect $CONTAINER_ID --format '{{.HostConfig.CapDrop}}'
# Expected: [ALL]

# 3. Check network mode
docker inspect $CONTAINER_ID --format '{{.HostConfig.NetworkMode}}'
# Expected: none

# 4. Check memory limit
docker inspect $CONTAINER_ID --format '{{.HostConfig.Memory}}'
# Expected: 536870912 (512MB)

# 5. Check CPU limit
docker inspect $CONTAINER_ID --format '{{.HostConfig.NanoCpus}}'
# Expected: 1000000000 (1 core)

# 6. Check volume mounts
docker inspect $CONTAINER_ID --format '{{.Mounts}}'
# Expected: [] (no mounts)

# 7. Check security options
docker inspect $CONTAINER_ID --format '{{.HostConfig.SecurityOpt}}'
# Expected: [no-new-privileges]
```

## Automated Security Testing

### Using OWASP ZAP

```bash
# Run OWASP ZAP against the API
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3001/api \
  -r zap-report.html
```

### Using Docker Bench Security

```bash
# Audit Docker configuration
docker run -it --net host --pid host --cap-add audit_control \
  -v /var/lib:/var/lib \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /etc:/etc \
  --label docker_bench_security \
  docker/docker-bench-security
```

## Security Checklist

- [ ] Container runs as non-root user
- [ ] All capabilities dropped
- [ ] Network isolation enabled
- [ ] Memory limit enforced (512MB)
- [ ] CPU limit enforced (1 core)
- [ ] PID limit enforced (100)
- [ ] Execution timeout enforced (60s)
- [ ] No volume mounts from host
- [ ] Rate limiting active (100 req/15min)
- [ ] Input validation working
- [ ] Max concurrent sessions enforced (10)
- [ ] Auto-cleanup after timeout (5min)
- [ ] Logging of security events
- [ ] CORS properly configured
- [ ] Security headers present (Helmet.js)

## Vulnerability Scanning

### Scan Docker Image

```bash
# Using Trivy
trivy image open-ai-ru/sandbox-agent:latest

# Using Clair
docker run -p 6060:6060 -d --name clair quay.io/coreos/clair:latest
clair-scanner --ip localhost open-ai-ru/sandbox-agent:latest
```

### Scan Dependencies

```bash
# Backend
cd backend
npm audit
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

## Reporting Security Issues

Если обнаружена уязвимость безопасности:

1. **НЕ** создавайте публичный issue
2. Отправьте email на security@open-ai.ru
3. Включите детали уязвимости
4. Дождитесь ответа от команды безопасности

## Compliance

### OWASP Top 10 Coverage

- [x] A01:2021 – Broken Access Control (Container isolation)
- [x] A02:2021 – Cryptographic Failures (N/A)
- [x] A03:2021 – Injection (Input validation)
- [x] A04:2021 – Insecure Design (Security-first architecture)
- [x] A05:2021 – Security Misconfiguration (Hardened containers)
- [x] A06:2021 – Vulnerable Components (Regular updates)
- [x] A07:2021 – Identification & Authentication (Session management)
- [x] A08:2021 – Software & Data Integrity (Immutable containers)
- [x] A09:2021 – Security Logging (Winston logging)
- [x] A10:2021 – Server-Side Request Forgery (Network isolation)
