# Tesla Customer Decoder v2.0 - Microservices Architecture

🚀 **Nowa architektura mikro-usług dla Tesla Customer Decoder**

## 📋 Spis treści

- [Przegląd](#przegląd)
- [Architektura](#architektura)
- [Szybki start](#szybki-start)
- [Mikro-usługi](#mikro-usługi)
- [API Gateway](#api-gateway)
- [Konfiguracja](#konfiguracja)
- [Rozwój](#rozwój)
- [Testowanie](#testowanie)
- [Wdrożenie](#wdrożenie)
- [Monitoring](#monitoring)
- [Rozwiązywanie problemów](#rozwiązywanie-problemów)

## 🎯 Przegląd

Tesla Customer Decoder v2.0 to przeprojektowana wersja systemu analizy klientów, zbudowana w oparciu o architekturę mikro-usług. System analizuje profil klienta, wykrywa triggery zakupowe i generuje spersonalizowane rekomendacje.

### ✨ Kluczowe funkcjonalności

- **Analiza profilu DISC** - Psychologiczna analiza osobowości klienta
- **Wykrywanie triggerów** - Identyfikacja sygnałów zakupowych
- **Logika rozmyta** - Zaawansowane wnioskowanie AI
- **Agregacja wyników** - Inteligentne łączenie analiz
- **Rekomendacje** - Spersonalizowane sugestie produktów
- **Explainable AI** - Transparentność decyzji AI

### 🔄 Migracja z v1

System v1 pozostaje dostępny w katalogu `v1/` podczas migracji. Dane współdzielone znajdują się w `shared/`.

## 🏗️ Architektura

```
Tesla Customer Decoder v2.0
├── API Gateway (Port 3000)
│   ├── Routing & Load Balancing
│   ├── Authentication & Authorization
│   ├── Rate Limiting
│   └── Request/Response Transformation
│
├── Microservices
│   ├── Customer Analysis (Port 3001)
│   ├── Trigger Detection (Port 3002)
│   ├── Fuzzy Inference (Port 3003)
│   ├── Scoring Aggregation (Port 3004)
│   ├── Recommendation Engine (Port 3005)
│   └── Transparency/XAI (Port 3006)
│
├── Shared Data Layer
│   ├── Customer Profiles
│   ├── Triggers & Rules
│   ├── ML Models
│   └── Configuration
│
└── Event Bus (Future)
    ├── Service Communication
    ├── Event Sourcing
    └── Real-time Updates
```

## 🚀 Szybki start

### Wymagania systemowe

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **RAM** >= 4GB (zalecane 8GB)
- **Dysk** >= 2GB wolnego miejsca

### Instalacja

1. **Klonowanie repozytorium**
   ```bash
   git clone <repository-url>
   cd tesla/v2
   ```

2. **Instalacja zależności**
   ```bash
   npm install
   npm run install:all
   ```

3. **Uruchomienie wszystkich usług**
   ```bash
   npm start
   ```

4. **Weryfikacja**
   ```bash
   npm run health:all
   ```

### Dostęp do systemu

- **API Gateway**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api/docs

## 🔧 Mikro-usługi

### 1. Customer Analysis Service (Port 3001)

**Odpowiedzialność**: Analiza profilu klienta i klasyfikacja DISC

**Endpointy**:
- `GET /health` - Status usługi
- `POST /analyze` - Analiza klienta
- `POST /disc-profile` - Profil DISC
- `GET /segments` - Dostępne segmenty

**Przykład użycia**:
```javascript
POST http://localhost:3001/analyze
{
  "customerData": {
    "age": 35,
    "income": 75000,
    "location": "California",
    "responses": [...]
  }
}
```

### 2. Trigger Detection Service (Port 3002)

**Odpowiedzialność**: Wykrywanie i analiza triggerów zakupowych

**Endpointy**:
- `GET /health` - Status usługi
- `POST /detect` - Wykrywanie triggerów
- `GET /triggers` - Lista triggerów
- `POST /analyze-patterns` - Analiza wzorców

### 3. Fuzzy Inference Service (Port 3003)

**Odpowiedzialność**: Logika rozmyta i wnioskowanie

**Endpointy**:
- `GET /health` - Status usługi
- `POST /infer` - Wnioskowanie rozmyte
- `GET /membership/:function` - Funkcje przynależności
- `POST /test-rules` - Test reguł

### 4. Scoring Aggregation Service (Port 3004)

**Odpowiedzialność**: Agregacja wyników i kalkulacja końcowych wyników

**Endpointy**:
- `GET /health` - Status usługi
- `POST /aggregate` - Agregacja wyników
- `POST /test-strategy` - Test strategii
- `GET /weights` - Wagi agregacji

### 5. Recommendation Engine Service (Port 3005)

**Odpowiedzialność**: Generowanie spersonalizowanych rekomendacji

**Endpointy**:
- `GET /health` - Status usługi
- `POST /generate` - Generowanie rekomendacji
- `GET /products` - Katalog produktów
- `GET /communication-templates` - Szablony komunikacji

### 6. Transparency/XAI Service (Port 3006)

**Odpowiedzialność**: Wyjaśnianie decyzji AI (Explainable AI)

**Endpointy**:
- `GET /health` - Status usługi
- `POST /explain` - Wyjaśnienie decyzji
- `GET /feature-importance` - Ważność cech
- `POST /counterfactual` - Analiza kontrfaktyczna

## 🌐 API Gateway

### Główne endpointy

- `GET /health` - Status całego systemu
- `POST /api/analyze` - Kompletna analiza klienta
- `GET /api/services` - Status mikro-usług
- `POST /api/explain` - Wyjaśnienie wyników

### Przykład kompletnej analizy

```javascript
POST http://localhost:3000/api/analyze
{
  "customerData": {
    "age": 35,
    "income": 75000,
    "location": "California",
    "interests": ["technology", "environment"],
    "responses": [
      { "question": "Q1", "answer": "A1" },
      { "question": "Q2", "answer": "A2" }
    ]
  },
  "options": {
    "includeExplanation": true,
    "detailLevel": "comprehensive"
  }
}
```

**Odpowiedź**:
```javascript
{
  "success": true,
  "results": {
    "customerAnalysis": { ... },
    "triggerDetection": { ... },
    "fuzzyInference": { ... },
    "scoring": {
      "conversionProbability": 0.75,
      "confidence": 0.82
    },
    "recommendations": { ... },
    "explanation": { ... }
  },
  "requestId": "uuid",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## ⚙️ Konfiguracja

### Zmienne środowiskowe

```bash
# Porty usług
API_GATEWAY_PORT=3000
CUSTOMER_ANALYSIS_PORT=3001
TRIGGER_DETECTION_PORT=3002
FUZZY_INFERENCE_PORT=3003
SCORING_AGGREGATION_PORT=3004
RECOMMENDATION_ENGINE_PORT=3005
TRANSPARENCY_XAI_PORT=3006

# Konfiguracja bazy danych
DATA_PATH=../shared/data
CONFIG_PATH=../shared/config

# Monitoring
LOG_LEVEL=info
HEALTH_CHECK_INTERVAL=30000

# Bezpieczeństwo
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Pliki konfiguracyjne

- `shared/config/` - Konfiguracja współdzielona
- `shared/data/` - Dane współdzielone
- Każda usługa ma własny `package.json`

## 💻 Rozwój

### Struktura projektu

```
v2/
├── api-gateway/                 # API Gateway
│   ├── server.js
│   ├── package.json
│   └── routes/
├── services/                    # Mikro-usługi
│   ├── customer-analysis/
│   ├── trigger-detection/
│   ├── fuzzy-inference/
│   ├── scoring-aggregation/
│   ├── recommendation-engine/
│   └── transparency-xai/
├── shared/                      # Dane współdzielone
│   ├── data/
│   └── config/
├── start-all-services.js        # Orkiestrator usług
├── package.json                 # Główny package.json
└── README.md                    # Ta dokumentacja
```

### Dodawanie nowej usługi

1. **Utwórz katalog usługi**
   ```bash
   mkdir services/new-service
   cd services/new-service
   ```

2. **Utwórz package.json**
   ```bash
   npm init -y
   ```

3. **Utwórz service.js**
   ```javascript
   const express = require('express');
   const app = express();
   const port = process.env.PORT || 3007;
   
   app.get('/health', (req, res) => {
     res.json({ status: 'healthy', service: 'new-service' });
   });
   
   app.listen(port, () => {
     console.log(`New service running on port ${port}`);
   });
   ```

4. **Dodaj do orkiestratora**
   Edytuj `start-all-services.js` i dodaj nową usługę do listy.

### Uruchamianie w trybie deweloperskim

```bash
# Wszystkie usługi
npm run start:dev

# Pojedyncza usługa
cd services/customer-analysis
npm run dev

# API Gateway
cd api-gateway
npm run dev
```

## 🧪 Testowanie

### Uruchamianie testów

```bash
# Wszystkie testy
npm run test:all

# Testy API Gateway
npm run test:gateway

# Testy usług
npm run test:services

# Testy pojedynczej usługi
cd services/customer-analysis
npm test
```

### Testy integracyjne

```bash
# Uruchom wszystkie usługi
npm start

# W nowym terminalu
npm run test:integration
```

### Testy obciążeniowe

```bash
# Zainstaluj narzędzia
npm install -g artillery

# Uruchom test obciążeniowy
artillery run load-test.yml
```

## 🚀 Wdrożenie

### Docker (Zalecane)

1. **Utwórz Dockerfile dla każdej usługi**
2. **Utwórz docker-compose.yml**
3. **Uruchom**
   ```bash
   docker-compose up -d
   ```

### PM2 (Produkcja)

```bash
# Zainstaluj PM2
npm install -g pm2

# Utwórz ecosystem.config.js
# Uruchom
pm2 start ecosystem.config.js
```

### Kubernetes

```bash
# Utwórz manifesty k8s
# Wdróż
kubectl apply -f k8s/
```

## 📊 Monitoring

### Health Checks

```bash
# Status wszystkich usług
npm run health:all

# Status pojedynczej usługi
curl http://localhost:3001/health
```

### Metryki

- **Dostępność usług**: Health check endpoints
- **Wydajność**: Response time monitoring
- **Błędy**: Error rate tracking
- **Zasoby**: CPU, Memory, Disk usage

### Logi

```bash
# Logi wszystkich usług (PM2)
pm2 logs

# Logi pojedynczej usługi
pm2 logs customer-analysis

# Logi w czasie rzeczywistym
tail -f logs/api-gateway.log
```

## 🔧 Rozwiązywanie problemów

### Częste problemy

#### 1. Usługa nie startuje

```bash
# Sprawdź porty
netstat -tulpn | grep :3001

# Sprawdź logi
npm run logs

# Restart usługi
npm run restart customer-analysis
```

#### 2. Błędy komunikacji między usługami

```bash
# Sprawdź health check
curl http://localhost:3001/health

# Sprawdź konfigurację sieci
ping localhost

# Sprawdź firewall
sudo ufw status
```

#### 3. Wysokie zużycie zasobów

```bash
# Sprawdź zużycie CPU/RAM
top
htop

# Sprawdź procesy Node.js
ps aux | grep node

# Optymalizuj konfigurację
# Zwiększ limity pamięci w package.json
```

#### 4. Błędy bazy danych

```bash
# Sprawdź ścieżki do danych
ls -la shared/data/

# Sprawdź uprawnienia
chmod 755 shared/data/

# Sprawdź integralność danych
npm run validate:data
```

### Debugowanie

```bash
# Uruchom z debuggerem
node --inspect services/customer-analysis/service.js

# Verbose logging
DEBUG=* npm start

# Profiling
node --prof services/customer-analysis/service.js
```

### Kontakt i wsparcie

- **Dokumentacja**: Ten README
- **Issues**: GitHub Issues
- **Wiki**: GitHub Wiki
- **Slack**: #tesla-decoder-v2

---

## 📈 Roadmapa

### v2.1 (Q2 2024)
- [ ] Event Bus implementation
- [ ] Real-time analytics
- [ ] Advanced caching
- [ ] Performance optimizations

### v2.2 (Q3 2024)
- [ ] Machine Learning pipeline
- [ ] A/B testing framework
- [ ] Advanced monitoring
- [ ] Auto-scaling

### v2.3 (Q4 2024)
- [ ] Multi-tenant support
- [ ] Advanced security
- [ ] GraphQL API
- [ ] Mobile SDK

---

**Tesla Customer Decoder v2.0** - Zbudowany z ❤️ przez TRAE AI Assistant

*Ostatnia aktualizacja: Styczeń 2024*