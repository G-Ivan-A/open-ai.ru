# Clarify Engine — Инструкции по развёртыванию

Clarify Engine доступен в четырёх конфигурациях. Выберите подходящую исходя из размера команды и требований к инфраструктуре.

---

## Starter

**Для кого**: Разработчик, фрилансер, исследователь — один пользователь на собственном компьютере.

**Инфраструктура**: Один компьютер или ноутбук.

**Ограничения**: Нет многопользовательского режима, нет балансировки нагрузки.

### Системные требования

| Компонент | Минимум | Рекомендуется |
|---|---|---|
| CPU | 4 ядра | 6+ ядер |
| RAM | 8 ГБ | 16 ГБ |
| Диск | 20 ГБ | 50 ГБ SSD |
| ОС | Linux, macOS, Windows WSL2 | Ubuntu 22.04+ |

### Установка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/clarify-engine/clarify-engine
cd clarify-engine

# 2. Скопировать и настроить переменные окружения
cp .env.example .env
# Отредактируйте .env: укажите LLM_PROVIDER и API-ключ (если нужен)

# 3. Запустить
docker compose -f docker-compose.starter.yml up -d

# 4. Открыть интерфейс
open http://localhost:3000
```

### Состав `docker-compose.starter.yml`

- **clarify-api** — основной API-сервер
- **clarify-ui** — веб-интерфейс
- **qdrant** — векторная база данных
- **ollama** _(опционально)_ — локальный LLM без облака

### Загрузка документов

```bash
# Загрузить PDF-файлы из папки ./docs
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: multipart/form-data" \
  -F "files=@./docs/manual.pdf"
```

---

## SMB

**Для кого**: Малый бизнес, команда 5–50 человек.

**Инфраструктура**: Локальный сервер в офисе или недорогой VPS.

**Возможности**: Многопользовательский режим, разграничение прав доступа, история диалогов.

### Системные требования

| Компонент | Минимум | Рекомендуется |
|---|---|---|
| CPU | 6 ядер | 8+ ядер |
| RAM | 16 ГБ | 32 ГБ |
| Диск | 100 ГБ SSD | 500 ГБ SSD |
| Сеть | 100 Мбит/с | 1 Гбит/с |
| ОС | Ubuntu 20.04+ | Ubuntu 22.04+ |

### Установка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/clarify-engine/clarify-engine
cd clarify-engine

# 2. Настроить окружение
cp .env.smb.example .env
# Обязательные параметры в .env:
#   SECRET_KEY — уникальный секретный ключ
#   ADMIN_EMAIL — email администратора
#   ADMIN_PASSWORD — пароль администратора
#   LLM_PROVIDER — openai | yandexgpt | ollama

# 3. Запустить
docker compose -f docker-compose.smb.yml up -d

# 4. Создать первого администратора
docker compose exec clarify-api python manage.py createsuperuser

# 5. Открыть интерфейс
open http://<IP-сервера>:3000
```

### Состав `docker-compose.smb.yml`

- **clarify-api** — API-сервер (2 реплики)
- **clarify-ui** — веб-интерфейс
- **qdrant** — векторная база данных
- **postgres** — реляционная БД для пользователей и истории
- **redis** — кэш и очереди задач
- **nginx** — обратный прокси

### Настройка SSL

```bash
# Установить Certbot и получить сертификат
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.ru

# Обновить .env
echo "BASE_URL=https://your-domain.ru" >> .env
docker compose restart nginx
```

### Управление пользователями

Через веб-интерфейс администратора (`/admin`) можно:
- Создавать пользователей и группы
- Назначать роли: `reader`, `editor`, `admin`
- Ограничивать доступ к отдельным коллекциям документов

---

## Corporate

**Для кого**: Средний бизнес, 50–500 человек.

**Инфраструктура**: Выделенный сервер или кластер виртуальных машин (на-premises или облако).

**Возможности**: Все возможности SMB + SSO-интеграция (LDAP/Active Directory), аудит-лог, резервное копирование, расширенный мониторинг.

### Системные требования

| Компонент | Минимум | Рекомендуется |
|---|---|---|
| CPU | 16 ядер | 32+ ядер |
| RAM | 64 ГБ | 128 ГБ |
| Диск | 1 ТБ NVMe | 2+ ТБ RAID |
| GPU | — | NVIDIA A10 / A100 |
| ОС | Ubuntu 22.04 | Ubuntu 22.04 + Docker Swarm |

### Установка с Docker Swarm

```bash
# 1. Инициализировать Swarm (на управляющем узле)
docker swarm init

# 2. Добавить рабочие узлы (на каждом рабочем узле)
docker swarm join --token <token> <manager-ip>:2377

# 3. Клонировать и настроить
git clone https://github.com/clarify-engine/clarify-engine
cd clarify-engine
cp .env.corporate.example .env
# Настройте .env согласно документации

# 4. Развернуть стек
docker stack deploy -c docker-compose.corporate.yml clarify

# 5. Проверить статус
docker stack services clarify
```

### LDAP / Active Directory интеграция

```bash
# В .env добавить:
AUTH_LDAP_SERVER_URI=ldap://ldap.company.ru
AUTH_LDAP_BIND_DN=cn=service,dc=company,dc=ru
AUTH_LDAP_BIND_PASSWORD=secret
AUTH_LDAP_USER_SEARCH_BASE=ou=users,dc=company,dc=ru
AUTH_LDAP_GROUP_SEARCH_BASE=ou=groups,dc=company,dc=ru

docker stack deploy -c docker-compose.corporate.yml clarify
```

### Резервное копирование

```bash
# Создать резервную копию (запускать по cron)
docker exec clarify_postgres pg_dump -U clarify clarify_db | \
  gzip > /backups/clarify_$(date +%Y%m%d).sql.gz

# Резервная копия векторной базы
docker exec clarify_qdrant tar czf - /qdrant/storage | \
  cat > /backups/qdrant_$(date +%Y%m%d).tar.gz
```

### Мониторинг (Prometheus + Grafana)

```bash
# Включить мониторинг
docker stack deploy -c docker-compose.monitoring.yml monitoring

# Grafana доступна по адресу :3001
# Готовые дашборды для Clarify Engine загружаются автоматически
```

---

## Cloud Enterprise

**Для кого**: Крупный бизнес, 500+ человек, высокие требования к доступности.

**Инфраструктура**: Kubernetes в облаке (Yandex Cloud, VK Cloud, AWS, Azure, GCP) или собственный кластер.

**Возможности**: Автоматическое масштабирование, высокая доступность (HA), распределённая векторная база, мультирегиональность, SLA.

### Системные требования

Kubernetes-кластер:
- Минимум 3 worker-узла по 8 ядер / 32 ГБ RAM
- Persistent Volume с поддержкой ReadWriteMany
- LoadBalancer или Ingress Controller
- Cert-Manager для TLS

### Установка через Helm

```bash
# 1. Добавить Helm-репозиторий
helm repo add clarify https://charts.clarify-engine.io
helm repo update

# 2. Создать namespace
kubectl create namespace clarify

# 3. Создать секреты
kubectl create secret generic clarify-secrets \
  --from-literal=SECRET_KEY=<ваш-секретный-ключ> \
  --from-literal=POSTGRES_PASSWORD=<пароль-бд> \
  -n clarify

# 4. Установить с базовыми значениями
helm install clarify clarify/clarify-engine \
  --namespace clarify \
  --values values.yaml

# 5. Проверить деплой
kubectl get pods -n clarify
```

### Пример `values.yaml`

```yaml
replicaCount:
  api: 3
  worker: 2

resources:
  api:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "4"
      memory: "8Gi"

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70

ingress:
  enabled: true
  host: clarify.your-company.ru
  tls: true

llm:
  provider: openai          # openai | yandexgpt | azure-openai
  model: gpt-4o-mini

vectorDb:
  type: qdrant              # qdrant | weaviate | pgvector
  replicas: 3
```

### Автоматическое масштабирование

```bash
# HPA автоматически масштабирует API-поды при нагрузке
kubectl get hpa -n clarify

# Вертикальное масштабирование через VPA (опционально)
kubectl apply -f vpa.yaml
```

### Мультирегиональность

Для критически важных систем с требованием RPO=0:

```bash
# Развернуть в двух регионах
helm install clarify-primary clarify/clarify-engine \
  --set global.region=ru-central1 \
  --values values-primary.yaml

helm install clarify-secondary clarify/clarify-engine \
  --set global.region=ru-central2 \
  --set replication.primary=clarify-primary \
  --values values-secondary.yaml
```

---

## Сравнение уровней

| Возможность | Starter | SMB | Corporate | Cloud Enterprise |
|---|:---:|:---:|:---:|:---:|
| Веб-интерфейс | ✅ | ✅ | ✅ | ✅ |
| REST API | ✅ | ✅ | ✅ | ✅ |
| Загрузка документов | ✅ | ✅ | ✅ | ✅ |
| Многопользовательский режим | ❌ | ✅ | ✅ | ✅ |
| Разграничение прав | ❌ | ✅ | ✅ | ✅ |
| SSL/TLS | ❌ | ✅ | ✅ | ✅ |
| SSO / LDAP / AD | ❌ | ❌ | ✅ | ✅ |
| Аудит-лог | ❌ | ❌ | ✅ | ✅ |
| Резервное копирование | ❌ | ❌ | ✅ | ✅ |
| Мониторинг (Prometheus) | ❌ | ❌ | ✅ | ✅ |
| Автомасштабирование | ❌ | ❌ | ❌ | ✅ |
| Высокая доступность (HA) | ❌ | ❌ | ❌ | ✅ |
| Мультирегиональность | ❌ | ❌ | ❌ | ✅ |
| GPU-ускорение (локальный LLM) | ✅ | ✅ | ✅ | ✅ |
| Поддержка Kubernetes | ❌ | ❌ | ✅ | ✅ |

## Переход между уровнями

Данные и документы полностью переносятся при переходе на следующий уровень:

```bash
# Экспорт данных с текущего уровня
./scripts/export.sh > clarify_export.tar.gz

# Импорт на новом уровне
./scripts/import.sh clarify_export.tar.gz
```
