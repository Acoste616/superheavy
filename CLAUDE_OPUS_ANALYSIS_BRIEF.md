# BigDeCoder Tesla Customer Analysis System - Brief dla Claude Opus

## 🎯 MISJA PROJEKTU

System BigDeCoder to zaawansowana platforma psychologicznej analizy klientów Tesla, oparta na badaniach rynku polskiego 2025. Głównym celem jest dopasowanie strategii sprzedażowej do typu osobowości DISC klienta i jego intencji zakupowych.

## 🔧 AKTUALNY PROBLEM

System ma złożoną logikę, ale **nie działa poprawnie** - analiza kończy się błędami, triggery nie są prawidłowo przetwarzane, a wyniki nie odzwierciedlają rzeczywistych danych wejściowych. Potrzebujemy **funkcjonalnego silnika analizy**, który:

1. ✅ Poprawnie przetwarza wybrane triggery
2. ✅ Wykrywa typ osobowości DISC na podstawie wzorców
3. ✅ Generuje realistyczne wyniki konwersji
4. ✅ Dopasowuje strategie do konkretnych triggerów
5. ✅ Wykorzystuje pełną bazę danych triggerów i reguł

## 📁 KLUCZOWE PLIKI DO ANALIZY

### 1. **Backend Logic Engine** (PRIORYTET 1)
- `backend/CustomerDecoderEngine.js` (2877 linii) - główny silnik analizy
- `data/triggers.json` (1252 linie) - baza triggerów z strategiami DISC
- `data/rules.json` (410 linii) - reguły logiki biznesowej
- `config.json` (167 linii) - konfiguracja systemu

### 2. **Frontend Interface** (PRIORYTET 2)
- `main.html` (683 linie) - interfejs użytkownika
- `app-simple.js` (2317 linii) - logika frontend
- `server.js` - serwer Node.js

### 3. **Data Sources** (PRIORYTET 3)
- `data/personas.json` - profile osobowości
- `data/weights_and_scoring.json` - wagi i scoring
- `cheatsheet_phrases.json` - frazy sprzedażowe
- `objections_and_rebuttals.json` - obiekcje i odpowiedzi

## 🧠 LOGIKA SYSTEMU (JAK POWINNO DZIAŁAĆ)

### Przepływ Analizy:
1. **Input**: Użytkownik wybiera triggery z rozmowy + ton klienta + dane demograficzne
2. **Processing**: System analizuje wzorce triggerów → wykrywa typ DISC
3. **Scoring**: Oblicza prawdopodobieństwo konwersji na podstawie:
   - Typu osobowości (D/I/S/C)
   - Wybranych triggerów
   - Tonu rozmowy
   - Danych demograficznych
4. **Strategy**: Generuje spersonalizowaną strategię sprzedażową
5. **Output**: Wyświetla wyniki z rekomendacjami

### Przykład Działania:
```
Input: ["price_concern", "naszauto_interest"] + ton "sceptyczny" + wiek "35-45"
↓
Detekcja: Typ S (Stabilny) - 85% pewności
↓
Scoring: 72% prawdopodobieństwo konwersji
↓
Strategia: "Podkreśl bezpieczeństwo inwestycji, użyj dotacji NaszEauto jako argumentu"
```

## 🎯 WYMAGANIA FUNKCJONALNE

### Must-Have:
1. **Działająca analiza** - bez błędów JavaScript
2. **Poprawna detekcja DISC** - na podstawie wzorców triggerów
3. **Realistyczny scoring** - 40-90% zakresu konwersji
4. **Dopasowane strategie** - różne dla D/I/S/C
5. **Wykorzystanie pełnej bazy** - wszystkie 50+ triggerów

### Nice-to-Have:
1. Segmentacja klientów (eco_family, tech_professional, etc.)
2. Analiza partnera w decyzji
3. Timeline przewidywanego zakupu
4. Eksport raportu

## 🔍 KLUCZOWE WZORCE W DANYCH

### Triggery DISC:
- **D (Dominujący)**: "business_tax_benefits", "performance_focus", "time_pressure"
- **I (Wpływowy)**: "social_proof", "innovation_interest", "environmental_interest"
- **S (Stabilny)**: "family_safety", "reliability_concern", "price_concern"
- **C (Analityczny)**: "technical_specs", "competition_comparison", "maintenance_cost"

### Scoring Modifiers:
- NaszEauto subsidy: +25 punktów
- Business use: +20 punktów
- Family context: +15 punktów
- PV panels: +12 punktów

## 🚀 OCZEKIWANY REZULTAT

Po Twojej analizie i poprawkach system powinien:

1. ✅ **Działać bez błędów** - analiza się kończy sukcesem
2. ✅ **Generować sensowne wyniki** - scoring 40-90%, typ DISC wykryty
3. ✅ **Pokazywać spersonalizowane strategie** - różne dla każdego typu
4. ✅ **Wykorzystywać wszystkie dane** - triggery, reguły, personas
5. ✅ **Być gotowym do produkcji** - stabilny, wydajny, skalowalny

## 💡 WSKAZÓWKI TECHNICZNE

- System używa **Node.js + Express** backend
- Frontend to **vanilla JavaScript** + Tailwind CSS
- Dane w **JSON files** (nie baza danych)
- **Fuzzy logic** do analizy wzorców
- **DISC personality model** jako core framework

---

**Cel**: Przekształć ten projekt z "demo wizualnego" w **funkcjonalny system analizy klientów**, który rzeczywiście pomaga sprzedawcom Tesla w Polsce.