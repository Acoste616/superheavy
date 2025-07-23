# Research Data Structure

Ten folder zawiera wszystkie dane badawcze i analizy związane z projektem Tesla Customer Decoder.

## Struktura folderów:

### `/analysis/`
Zawiera pliki z analizami i wynikami badań:
- `analiza_disc_polska_ev.csv` - Analiza profili DISC dla polskiego rynku EV
- `analiza_wag_silnik_kwalifikacji.csv` - Analiza wag silnika kwalifikacji
- `confidence_score_analysis.csv` - Analiza wskaźników pewności
- `key_metrics_targets.csv` - Kluczowe metryki i cele
- `tesla_research_summary.json` - Podsumowanie badań Tesla (podstawowe)
- `tesla_research_summary_enhanced.json` - Rozszerzone podsumowanie badań Tesla

### `/csv-data/`
Surowe dane badawcze w formacie CSV:
- `ARCHETYPES_RESPONSE_BASE.csv` - Baza odpowiedzi archetypów
- `danesprzedazowe.csv` - Dane sprzedażowe
- `marketdata.csv` - Dane rynkowe
- `mshop.csv` - Dane z badań sklepowych
- `poland_bev_macro_correlations.csv` - Korelacje makroekonomiczne dla polskiego rynku BEV

### `/segmentation/`
Pliki związane z implementacją systemu segmentacji 12 typów klientów:
- `ROZSZERZENIE_SEGMENTACJA_KODU.js` - Kod silnika segmentacji
- `ROZSZERZENIE_TRIGGERS_SEGMENTY.json` - Triggery specyficzne dla segmentów
- `ROZSZERZENIE_UI_SEGMENTACJA.js` - Rozszerzenia UI dla segmentacji

### `/implementation-docs/`
Dokumentacja implementacji i planów rozwoju:
- `ANALIZA_ULEPSZENIA_RESEARCH.md` - Analiza ulepszeń badań
- `IMPLEMENTACJA_STRATEGII_GRUPOWYCH.md` - Implementacja strategii grupowych
- `PLAN_IMPLEMENTACJI_SEGMENTACJA.md` - Plan implementacji segmentacji
- `RESEARCH_PROMPT_INDYWIDUALIZACJA_STRATEGII.md` - Prompt badawczy dla indywidualizacji strategii

## Następne kroki:

1. **Integracja danych** - Połączenie nowych danych badawczych z istniejącym systemem
2. **Implementacja segmentacji** - Wdrożenie systemu 12 typów klientów
3. **Rozszerzenie UI** - Dodanie nowych elementów interfejsu
4. **Testy i walidacja** - Sprawdzenie poprawności nowych funkcji

## Uwagi:

- Wszystkie pliki CSV używają kodowania UTF-8
- Pliki JSON są sformatowane dla czytelności
- Dokumentacja jest w języku polskim zgodnie z charakterem projektu