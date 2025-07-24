# TECHNICAL API SPECIFICATION
## Tesla BigDeCoder - Complete API & Integration Guide

---

## 🔌 **API ENDPOINTS**

### **POST /api/analyze**
**Główny endpoint analizy klienta**

#### Request Body:
```json
{
  "selectedTriggers": [
    {
      "id": "trigger_001",
      "text": "Interesuje mnie czas ładowania",
      "category": "technical",
      "intensity": 0.8
    }
  ],
  "tone": "professional", // professional|casual|enthusiastic|analytical
  "demographics": {
    "age": "35-44",
    "housingType": "dom_z_garazem",
    "pvInstallation": "tak",
    "region": "mazowieckie",
    "relationshipStatus": "w_zwiazku",
    "children": "tak",
    "teslaExperience": "brak_doswiadczenia",
    "carRole": "glowny_samochod"
  },
  "additionalContext": "Klient pyta o Model Y, ma budżet 300k PLN"
}
```

#### Response:
```json
{
  "success": true,
  "analysis": {
    "conversionProbability": 0.78,
    "personalityMatch": {
      "primaryType": "C",
      "scores": { "D": 0.2, "I": 0.3, "S": 0.4, "C": 0.8 },
      "confidence": 0.85
    },
    "triggerIntensity": 0.72,
    "toneCompatibility": 0.91,
    "confidenceLevel": 0.83,
    "customerSegment": {
      "primary": "tech_innovators",
      "score": 0.89,
      "characteristics": [...]
    },
    "recommendations": {
      "strategy": "technical_deep_dive",
      "quickResponses": [...],
      "nextSteps": [...],
      "objectionHandling": [...]
    },
    "transparencyReport": {
      "decisionFactors": [...],
      "confidenceBreakdown": {...},
      "ethicalConsiderations": [...]
    }
  }
}
```

### **POST /api/conversation/complete**
**Endpoint do trackingu zakończonych rozmów**

#### Request Body:
```json
{
  "sessionId": "session_123",
  "outcome": "test_drive_scheduled", // converted|test_drive|follow_up|lost
  "finalTriggers": [...],
  "conversionFactors": [...]
}
```

---

## 🧠 **CORE ENGINE METHODS**

### **CustomerDecoderEngine.analyzeCustomer()**
```javascript
// Główna metoda analizy - 11-etapowy proces
async analyzeCustomer(inputData) {
  // 1. Walidacja danych wejściowych
  const validation = this.dataValidator.validateCustomerData(inputData);
  
  // 2. Podstawowa analiza klienta
  const coreAnalysis = await this.customerAnalysisEngine.analyze(validation.cleanData);
  
  // 3. Fuzzy logic dla osobowości
  const fuzzyAnalysis = this.fuzzyInferenceEngine.analyzeFuzzyPersonality(coreAnalysis.traits);
  
  // 4. Detekcja i analiza triggerów
  const triggerAnalysis = await this.triggerDetectionEngine.analyze(inputData);
  
  // 5. Analiza temporalna (timing, urgency)
  const temporalAnalysis = this.analyzeTemporalContext(inputData);
  
  // 6. Segmentacja klienta
  const segmentAnalysis = this.customerSegmentationEngine.identifySegment(validation.cleanData.demographics);
  
  // 7. Zaawansowane scorowanie 2025
  const scores = this.scoringAggregationEngine.calculateAdvancedScoring2025({
    triggers: triggerAnalysis,
    personality: fuzzyAnalysis,
    segment: segmentAnalysis,
    temporal: temporalAnalysis,
    marketData: await this.getMarketData()
  });
  
  // 8. Kalkulacja confidence
  const confidence = this.scoringAggregationEngine.calculateConfidence({
    dataQuality: validation.quality,
    personalityConfidence: fuzzyAnalysis.confidence,
    triggerReliability: triggerAnalysis.reliability
  });
  
  // 9. Generowanie rekomendacji
  const recommendations = await this.recommendationEngine.generateEnhancedRecommendations({
    personality: fuzzyAnalysis,
    segment: segmentAnalysis,
    triggers: triggerAnalysis,
    scores: scores
  });
  
  // 10. Selekcja strategii
  const strategy = this.recommendationEngine.selectStrategy({
    personality: fuzzyAnalysis.primaryType,
    segment: segmentAnalysis.primary,
    intent: scores.intentLevel
  });
  
  // 11. Raport transparentności
  const transparencyReport = this.transparencyEngine.explainDecision({
    analysis: { coreAnalysis, fuzzyAnalysis, triggerAnalysis, segmentAnalysis },
    scores: scores,
    confidence: confidence,
    recommendations: recommendations
  });
  
  return this.formatFinalResponse({
    scores, confidence, recommendations, strategy, transparencyReport
  });
}
```

---

## 📊 **DATA STRUCTURES**

### **Trigger Object (Enhanced)**
```javascript
const triggerStructure = {
  id: "trigger_001",
  text: "Pytanie o czas ładowania",
  category: "technical", // 9 kategorii
  base_conversion_rate: 0.75,
  intent_level: "high", // high|medium|low
  
  // DISC personality resonance
  personality_resonance: {
    D: 0.6, // Dominujący
    I: 0.4, // Inspirujący  
    S: 0.7, // Stabilny
    C: 0.9  // Consciencyjny
  },
  
  // Quick response system
  quick_response: {
    immediate_reply: "Świetne pytanie! Tesla oferuje...",
    follow_up_questions: [
      "Gdzie planujesz najczęściej ładować?",
      "Jaki masz dzienny przebieg?"
    ],
    strategy_hint: "Focus on convenience and time-saving"
  },
  
  // Context modifiers
  context_modifiers: {
    urgency_boost: 1.2,
    demographic_weights: {
      age_35_44: 1.1,
      dom_z_garazem: 1.3,
      pv_installation: 1.4
    },
    temporal_factors: {
      weekend_boost: 0.9,
      evening_boost: 1.1
    }
  },
  
  // Advanced features
  ml_features: {
    conversion_history: [0.78, 0.82, 0.75], // ostatnie 3 miesiące
    segment_performance: {
      tech_innovators: 0.85,
      eco_luxury: 0.72
    }
  }
};
```

### **Customer Segment (Polish Market)**
```javascript
const polishSegments = {
  tech_innovators: {
    percentage: 28,
    avg_income: 180000,
    conversion_rate: 0.32,
    characteristics: [
      "Early adopters technologii",
      "Wysokie dochody (150k+ PLN)",
      "Mieszkańcy dużych miast",
      "Zainteresowani performance i tech"
    ],
    preferred_models: ["Model S", "Model 3 Performance"],
    decision_timeline: "2-4 tygodnie",
    key_triggers: ["autopilot", "performance", "tech_features"],
    communication_style: "Technical details, data-driven"
  },
  
  eco_luxury: {
    percentage: 23,
    avg_income: 160000,
    conversion_rate: 0.28,
    characteristics: [
      "Świadomość ekologiczna",
      "Premium lifestyle",
      "Wartości rodzinne",
      "Długoterminowe myślenie"
    ],
    preferred_models: ["Model Y", "Model X"],
    decision_timeline: "4-8 tygodni",
    key_triggers: ["environmental", "safety", "family_space"],
    communication_style: "Values-based, family-focused"
  }
  // ... pozostałe 4 segmenty
};
```

---

## 🔧 **MICROSERVICES ARCHITECTURE**

### **1. FuzzyInferenceEngine**
```javascript
// services/fuzzy-inference-service/engine.js
class FuzzyInferenceEngine {
  analyzeFuzzyPersonality(traits) {
    // Mapowanie cech → DISC scores z niepewnością
    const fuzzyScores = this.calculateFuzzyScores(traits);
    const confidence = this.calculateConfidence(fuzzyScores);
    const primaryType = this.determinePrimaryType(fuzzyScores);
    
    return {
      scores: fuzzyScores,
      primaryType,
      confidence,
      reasoning: this.explainReasoning(traits, fuzzyScores)
    };
  }
}
```

### **2. TriggerDetectionEngine**
```javascript
// services/trigger-detection-service/engine.js
class TriggerDetectionEngine {
  async analyze(inputData) {
    const triggers = inputData.selectedTriggers;
    const analysis = {
      totalIntensity: this.calculateTotalIntensity(triggers),
      categoryDistribution: this.analyzeCategoryDistribution(triggers),
      intentSignals: this.detectIntentSignals(triggers),
      personalityIndicators: this.extractPersonalityIndicators(triggers),
      conversionPredictors: this.identifyConversionPredictors(triggers)
    };
    
    return analysis;
  }
}
```

### **3. ScoringAggregationEngine**
```javascript
// services/scoring-aggregation-service/engine.js
class ScoringAggregationEngine {
  calculateAdvancedScoring2025(analysisData) {
    // Enhanced Weights 2.0 dla polskiego rynku
    const weights = {
      home_work_charging: 0.20,
      daily_commute: 0.18,
      competitor_consideration: 0.16,
      financing_questions: 0.14,
      main_motivator: 0.12,
      purchase_timeline: 0.10,
      decision_maker_present: 0.10
    };
    
    const baseScore = this.calculateBaseScore(analysisData.triggers, weights);
    const personalityBoost = this.applyPersonalityBoost(baseScore, analysisData.personality);
    const segmentMultiplier = this.applySegmentMultiplier(personalityBoost, analysisData.segment);
    const temporalAdjustment = this.applyTemporalFactors(segmentMultiplier, analysisData.temporal);
    const marketDataBoost = this.applyMarketData(temporalAdjustment, analysisData.marketData);
    
    return {
      finalScore: marketDataBoost,
      breakdown: {
        base: baseScore,
        personality: personalityBoost - baseScore,
        segment: segmentMultiplier - personalityBoost,
        temporal: temporalAdjustment - segmentMultiplier,
        market: marketDataBoost - temporalAdjustment
      }
    };
  }
}
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Caching Strategy**
```javascript
// Implementacja w CustomerDecoderEngine
class CustomerDecoderEngine {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minut
  }
  
  async analyzeCustomer(inputData) {
    const cacheKey = this.generateCacheKey(inputData);
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.result;
    }
    
    const result = await this.performFullAnalysis(inputData);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }
}
```

### **Memory Management**
```javascript
// Optymalizacja pamięci dla dużych analiz
class MemoryOptimizer {
  static optimizeAnalysisData(data) {
    // Usuwanie niepotrzebnych pól
    const optimized = {
      essential: this.extractEssentialData(data),
      compressed: this.compressLargeObjects(data)
    };
    
    return optimized;
  }
}
```

---

## 🧪 **TESTING FRAMEWORK**

### **Unit Tests Example**
```javascript
// tests/customer-decoder-engine.test.js
describe('CustomerDecoderEngine', () => {
  test('should correctly identify tech_innovator segment', async () => {
    const inputData = {
      demographics: {
        age: '35-44',
        housingType: 'dom_z_garazem',
        region: 'mazowieckie'
      },
      selectedTriggers: [
        { id: 'autopilot_interest', category: 'technical' },
        { id: 'performance_questions', category: 'technical' }
      ]
    };
    
    const result = await engine.analyzeCustomer(inputData);
    
    expect(result.analysis.customerSegment.primary).toBe('tech_innovators');
    expect(result.analysis.conversionProbability).toBeGreaterThan(0.7);
  });
});
```

---

## 🔐 **SECURITY & COMPLIANCE**

### **Data Privacy**
```javascript
// Implementacja GDPR compliance
class DataPrivacyManager {
  static sanitizeCustomerData(data) {
    // Usuwanie PII, hashowanie identyfikatorów
    return {
      ...data,
      personalInfo: this.hashPersonalInfo(data.personalInfo),
      sessionId: this.generateAnonymousId()
    };
  }
}
```

### **Ethical AI**
```javascript
// services/transparency-service/engine.js
class TransparencyEngine {
  explainDecision(analysisData) {
    return {
      decisionFactors: this.identifyKeyFactors(analysisData),
      biasCheck: this.checkForBias(analysisData),
      confidenceBreakdown: this.explainConfidence(analysisData),
      ethicalConsiderations: this.assessEthicalImplications(analysisData)
    };
  }
}
```

---

## 🚀 **DEPLOYMENT & MONITORING**

### **Health Check Endpoint**
```javascript
// GET /api/health
app.get('/api/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      customerDecoder: engine.isHealthy(),
      database: database.isConnected(),
      cache: cache.isOperational()
    },
    performance: {
      avgResponseTime: metrics.getAverageResponseTime(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  res.json(health);
});
```

---

**To jest kompletna specyfikacja techniczna systemu Tesla BigDeCoder. Użyj tej dokumentacji do dalszego rozwoju i optymalizacji zaawansowanej architektury AI.**