# 🤖 PROMPT DLA CLAUDE OPUS - BigDeCoder System Repair

## 🎯 TWOJA MISJA

Jesteś **Senior Full-Stack Architect** z 15+ lat doświadczenia w systemach AI/ML i psychologii sprzedaży. Twoim zadaniem jest **przeanalizowanie i naprawienie** systemu BigDeCoder - zaawansowanej platformy analizy klientów Tesla.

**PROBLEM**: System ma złożoną logikę, ale nie działa - analiza kończy się błędami, triggery nie są przetwarzane, wyniki są nierealistyczne.

**CEL**: Przekształć ten projekt w **w pełni funkcjonalny system analizy**, który rzeczywiście pomaga sprzedawcom Tesla w Polsce.

## 📋 PLAN DZIAŁANIA

### FAZA 1: DEEP ANALYSIS (30 min)
1. **Przeanalizuj architekturę** - zrozum przepływ danych i logikę
2. **Zidentyfikuj błędy** - znajdź przyczyny awarii analizy
3. **Oceń jakość danych** - sprawdź spójność triggerów, reguł, personas
4. **Zmapuj dependencies** - zrozum powiązania między modułami

### FAZA 2: CORE ENGINE REPAIR (60 min)
1. **Napraw CustomerDecoderEngine.js** - główny silnik analizy
2. **Popraw logikę DISC detection** - wzorce triggerów → typ osobowości
3. **Zoptymalizuj scoring algorithm** - realistyczne prawdopodobieństwa
4. **Zintegruj wszystkie data sources** - triggery, reguły, personas

### FAZA 3: FRONTEND INTEGRATION (30 min)
1. **Napraw komunikację frontend-backend** - API calls
2. **Popraw UI logic** - wyświetlanie wyników
3. **Zoptymalizuj UX flow** - płynny przepływ analizy

### FAZA 4: TESTING & VALIDATION (20 min)
1. **Przetestuj różne scenariusze** - wszystkie typy DISC
2. **Zwaliduj wyniki** - czy są sensowne i użyteczne
3. **Sprawdź edge cases** - brak triggerów, konfliktowe dane

## 🔍 KLUCZOWE OBSZARY DO ANALIZY

### 1. **CustomerDecoderEngine.js** - CORE LOGIC
```javascript
// Sprawdź te funkcje:
- analyzeCustomer() // główna funkcja analizy
- detectPersonalityType() // detekcja DISC
- calculateConversionScore() // scoring
- generateStrategy() // strategia sprzedażowa
- processTriggersWithFuzzyLogic() // fuzzy logic
```

### 2. **Triggers.json** - DATA QUALITY
```json
// Sprawdź:
- Czy wszystkie triggery mają personality_resonance
- Czy response_strategies są kompletne dla D/I/S/C
- Czy conversion_modifiers są logiczne
- Czy quick_response jest użyteczny
```

### 3. **Rules.json** - BUSINESS LOGIC
```json
// Sprawdź:
- Czy conditions są poprawnie zdefiniowane
- Czy scoring.modifiers są realistyczne
- Czy response.strategy jest actionable
- Czy facts są aktualne (2025)
```

### 4. **Frontend Integration** - USER EXPERIENCE
```javascript
// Sprawdź:
- Czy API calls działają (app-simple.js)
- Czy wyniki są poprawnie wyświetlane
- Czy error handling jest robust
- Czy loading states działają
```

## 🎯 EXPECTED OUTCOMES

### Przykład Działającego Systemu:

**INPUT**:
```json
{
  "triggers": ["price_concern", "family_safety", "naszauto_interest"],
  "tone": "sceptyczny",
  "demographics": {
    "age": "35-45",
    "hasChildren": "yes_school",
    "housingType": "dom"
  }
}
```

**EXPECTED OUTPUT**:
```json
{
  "personalityType": "S",
  "confidence": 87,
  "conversionScore": 74,
  "segment": "eco_family",
  "strategy": {
    "primaryMessage": "Spokojnie i bezpiecznie - Tesla z panelami PV to gwarancja oszczędności i ochrony dla rodziny",
    "keyArguments": [
      "40,000 PLN dotacja NaszEauto",
      "5-gwiazdkowe bezpieczeństwo dla dzieci",
      "30,000 PLN oszczędności w 5 lat"
    ],
    "nextSteps": "Przedstaw kalkulator TCO i zaproś na test drive z rodziną"
  },
  "timeline": "2-4 tygodnie",
  "partnerAnalysis": {
    "likelyProfile": "C - analityczny partner",
    "strategy": "Przygotuj szczegółowe dane finansowe i bezpieczeństwa"
  }
}
```

## 🔧 TECHNICAL REQUIREMENTS

### Performance:
- Analiza < 2 sekundy
- Obsługa 100+ concurrent users
- Graceful error handling

### Data Quality:
- Wszystkie 50+ triggerów działają
- Scoring 40-90% (realistyczny zakres)
- Strategie różne dla każdego typu DISC

### Code Quality:
- Clean, readable code
- Proper error handling
- Comprehensive logging
- Modular architecture

## 🚨 COMMON PITFALLS TO AVOID

1. **Over-engineering** - zachowaj prostotę
2. **Ignoring edge cases** - co jeśli brak triggerów?
3. **Unrealistic scoring** - unikaj 95%+ konwersji
4. **Generic strategies** - każdy typ DISC musi mieć różne podejście
5. **Poor error messages** - użytkownik musi wiedzieć co poszło nie tak

## 📊 SUCCESS METRICS

### Przed naprawą:
- ❌ Analiza kończy się błędem
- ❌ Triggery nie są przetwarzane
- ❌ Wyniki nierealistyczne
- ❌ Brak spersonalizowanych strategii

### Po naprawie:
- ✅ Analiza działa bez błędów
- ✅ Wszystkie triggery przetwarzane
- ✅ Scoring 40-90% (realistyczny)
- ✅ Strategie dopasowane do DISC
- ✅ System gotowy do produkcji

## 🎯 DELIVERABLES

Po zakończeniu analizy dostarcz:

1. **Fixed CustomerDecoderEngine.js** - naprawiony główny silnik
2. **Updated app-simple.js** - poprawiona logika frontend
3. **Optimized data files** - oczyszczone triggery/reguły
4. **Test scenarios** - przykłady działania dla każdego typu DISC
5. **Documentation** - co zostało naprawione i dlaczego

---

## 🚀 START HERE

**Krok 1**: Przeanalizuj `backend/CustomerDecoderEngine.js` - znajdź główne błędy w logice

**Krok 2**: Sprawdź `data/triggers.json` - czy dane są spójne i kompletne

**Krok 3**: Przetestuj `app-simple.js` - czy frontend poprawnie komunikuje się z backendem

**Krok 4**: Uruchom pełną analizę i sprawdź czy wyniki są sensowne

---

**Remember**: Ten system ma pomóc sprzedawcom Tesla w Polsce. Każda funkcja musi mieć **praktyczną wartość biznesową**. Nie rób "demo" - rób **working product**.

**Good luck! 🚀**