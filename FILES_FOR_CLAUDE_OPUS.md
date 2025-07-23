# 📁 PLIKI DO PRZEKAZANIA CLAUDE OPUS

## 🔥 PRIORYTET 1 - CORE SYSTEM (MUST HAVE)

### Backend Logic Engine
1. **`backend/CustomerDecoderEngine.js`** (2877 linii)
   - Główny silnik analizy
   - Zawiera logikę DISC detection, scoring, segmentację
   - **PROBLEM**: Prawdopodobnie tutaj są główne błędy

2. **`data/triggers.json`** (1252 linie)
   - Kompletna baza triggerów z strategiami DISC
   - Response strategies dla każdego typu osobowości
   - Conversion modifiers i quick responses

3. **`data/rules.json`** (410 linii)
   - Reguły logiki biznesowej
   - Conditions, scoring modifiers, persuasion techniques
   - Mapowanie triggerów na strategie

4. **`config.json`** (167 linii)
   - Konfiguracja systemu
   - Fuzzy logic settings, weights, thresholds
   - API i performance settings

### Frontend Integration
5. **`app-simple.js`** (2317 linii)
   - Główna logika frontend
   - API communication, UI handling
   - **PROBLEM**: Prawdopodobnie błędy w komunikacji z backendem

6. **`main.html`** (683 linie)
   - Interface użytkownika
   - Trigger selection, results display
   - Struktura UI i flow

7. **`server.js`**
   - Node.js server setup
   - API endpoints
   - Routing i middleware

## ⚡ PRIORYTET 2 - DATA SOURCES (IMPORTANT)

8. **`data/personas.json`**
   - Profile osobowości DISC
   - Detailed characteristics, motivations, fears

9. **`data/weights_and_scoring.json`**
   - Wagi dla różnych czynników
   - Scoring algorithms i modifiers

10. **`cheatsheet_phrases.json`**
    - Gotowe frazy sprzedażowe
    - Quick responses dla sprzedawców

11. **`objections_and_rebuttals.json`**
    - Typowe obiekcje klientów
    - Przygotowane odpowiedzi

## 📊 PRIORYTET 3 - SUPPORTING FILES (NICE TO HAVE)

12. **`data/market_data_2025.json`**
    - Aktualne dane rynkowe
    - Statystyki, trendy, benchmarki

13. **`backend/AdvancedTriggersDatabase.js`**
    - Rozszerzona baza triggerów
    - Advanced pattern matching

14. **`backend/TransparencyEngine.js`**
    - Explainable AI logic
    - Decision tracking i feedback

## 📋 INSTRUKCJE DLA CLAUDE OPUS

### Kolejność Analizy:
1. **START**: `CLAUDE_OPUS_ANALYSIS_BRIEF.md` + `CLAUDE_OPUS_PROMPT.md`
2. **CORE**: `CustomerDecoderEngine.js` - znajdź główne błędy
3. **DATA**: `triggers.json` + `rules.json` - sprawdź spójność
4. **FRONTEND**: `app-simple.js` - napraw komunikację API
5. **CONFIG**: `config.json` - zoptymalizuj settings
6. **TEST**: Uruchom pełną analizę i zwaliduj wyniki

### Kluczowe Pytania do Rozwiązania:
- ❓ Dlaczego analiza kończy się błędem?
- ❓ Czy triggery są poprawnie mapowane na typy DISC?
- ❓ Czy scoring algorithm generuje realistyczne wyniki?
- ❓ Czy frontend poprawnie komunikuje się z backendem?
- ❓ Czy wszystkie data sources są wykorzystywane?

### Expected Deliverables:
1. ✅ **Fixed CustomerDecoderEngine.js** - działający silnik
2. ✅ **Updated app-simple.js** - naprawiona komunikacja
3. ✅ **Optimized config.json** - lepsze settings
4. ✅ **Test scenarios** - przykłady dla każdego typu DISC
5. ✅ **Bug report** - co było złe i jak zostało naprawione

## 🚀 QUICK START GUIDE

```bash
# 1. Pobierz pliki z priorytetem 1
# 2. Przeczytaj CLAUDE_OPUS_ANALYSIS_BRIEF.md
# 3. Wykonaj instrukcje z CLAUDE_OPUS_PROMPT.md
# 4. Zacznij od CustomerDecoderEngine.js
# 5. Przetestuj naprawki na różnych scenariuszach
```

## 💡 WSKAZÓWKI TECHNICZNE

- **Node.js + Express** backend
- **Vanilla JavaScript** frontend (no frameworks)
- **JSON files** jako baza danych (nie SQL)
- **Fuzzy logic** do pattern matching
- **DISC model** jako core framework
- **Polish market data** (2025)

---

**UWAGA**: Nie przekazuj całego folderu `archive/` - to stare, nieaktualne pliki. Skup się na plikach z głównego katalogu i `backend/`, `data/`, `services/`.

**CEL**: System ma być **production-ready**, nie demo. Każda funkcja musi działać i mieć praktyczną wartość dla sprzedawców Tesla w Polsce.