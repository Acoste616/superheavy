# 🔧 BACKEND IMPLEMENTATION PROMPT
## Tesla Customer Decoder - Zaawansowana Baza Danych i Personalizacja

### 📋 CELE BACKENDU
1. **Duża baza danych** z połączeniami do każdego typu i podtypu DISC
2. **Wyspecjalizowane porady** dopasowane do sytuacji (panele, dzieci, żona, firma)
3. **Informacje uwzględniające kontekst** (dopłaty, odliczenia, features Tesla)
4. **Integracja analizy konkurencji** z rzeczywistymi danymi
5. **Adaptacja kulturowa** dla polskiego rynku

---

## 🗄️ STRUKTURA BAZY DANYCH

### 1. ROZSZERZONE TRIGGERS.JSON

#### Dodaj do każdego triggera:

```json
{
  "id": "price_concern_high",
  "name": "Obawa o wysoką cenę",
  "category": "finansowe",
  "description": "Klient wyraża obawy dotyczące wysokiej ceny Tesla",
  "weight": 0.8,
  "disc_compatibility": {
    "D": 0.7,
    "I": 0.6,
    "S": 0.9,
    "C": 0.95
  },
  
  // NOWA SEKCJA: Rozszerzone odpowiedzi DISC
  "disc_responses": {
    "D": {
      "immediate_reply": "Rozumiem Twoją perspektywę biznesową. Porozmawiajmy o ROI.",
      "detailed_response": "Tesla to inwestycja, nie wydatek. Średni koszt eksploatacji to 0,15 zł/km vs 0,45 zł/km dla spalinowego. Przy 20,000 km rocznie oszczędzasz 6,000 zł. Plus amortyzacja 225k dla firm.",
      "communication_style": "Bezpośredni, oparty na faktach, szybki",
      "focus_areas": ["ROI", "Oszczędności", "Korzyści biznesowe"],
      "pace": "Szybkie tempo, konkretne liczby",
      "key_points": [
        "ROI w 3-4 lata przez oszczędności na paliwie",
        "225,000 PLN amortyzacja vs 150,000 PLN dla spalinowych",
        "Zerowe koszty serwisu przez pierwsze 4 lata",
        "Wartość odsprzedaży wyższa o 15-20%"
      ],
      "next_steps": [
        "Przedstaw kalkulację TCO na 5 lat",
        "Pokaż porównanie z konkurencją",
        "Omów korzyści podatkowe dla firm",
        "Zaproponuj jazdę próbną"
      ],
      "avoid": [
        "Długich wyjaśnień bez liczb",
        "Emocjonalnych argumentów",
        "Mówienia o statusie czy prestiżu"
      ]
    },
    "I": {
      "immediate_reply": "Wiem, że to duża decyzja! Ale pomyśl o tym jako o inwestycji w przyszłość.",
      "detailed_response": "Tesla to nie tylko auto - to styl życia! Wyobraź sobie: cicha jazda, najnowsza technologia, zero emisji. Twoi znajomi będą pod wrażeniem. Plus oszczędzasz na paliwie i serwisach!",
      "communication_style": "Entuzjastyczny, wizualny, społeczny",
      "focus_areas": ["Styl życia", "Technologia", "Społeczny aspekt"],
      "pace": "Energiczne, z przykładami",
      "key_points": [
        "Najnowsza technologia na rynku",
        "Cicha, komfortowa jazda",
        "Pozytywny wpływ na środowisko",
        "Prestiż i uznanie społeczne"
      ],
      "next_steps": [
        "Pokaż najnowsze funkcje technologiczne",
        "Opowiedz historie zadowolonych klientów",
        "Zaproponuj jazdę próbną z rodziną/przyjaciółmi",
        "Przedstaw opcje finansowania"
      ],
      "avoid": [
        "Zbyt technicznych szczegółów",
        "Presji czasowej",
        "Skupiania się tylko na cenie"
      ]
    },
    "S": {
      "immediate_reply": "Rozumiem Twoje obawy. Bezpieczeństwo finansowe rodziny jest najważniejsze.",
      "detailed_response": "Tesla to przemyślana inwestycja dla rodziny. Najwyższe noty bezpieczeństwa, niskie koszty eksploatacji, niezawodność. Wiele rodzin oszczędza 500-800 zł miesięcznie na kosztach eksploatacji.",
      "communication_style": "Spokojny, empatyczny, wspierający",
      "focus_areas": ["Bezpieczeństwo", "Oszczędności", "Rodzina"],
      "pace": "Spokojne, bez presji",
      "key_points": [
        "5 gwiazdek Euro NCAP - najwyższe bezpieczeństwo",
        "Przewidywalne, niskie koszty eksploatacji",
        "Długa gwarancja i niezawodność",
        "Oszczędności dla budżetu rodzinnego"
      ],
      "next_steps": [
        "Przedstaw szczegółową kalkulację oszczędności",
        "Pokaż testy bezpieczeństwa",
        "Omów gwarancje i wsparcie serwisowe",
        "Daj czas na przemyślenie"
      ],
      "avoid": [
        "Presji na szybką decyzję",
        "Agresywnej sprzedaży",
        "Ignorowania obaw finansowych"
      ]
    },
    "C": {
      "immediate_reply": "Masz rację, to znacząca inwestycja. Przeanalizujmy to dokładnie.",
      "detailed_response": "Przygotowałem szczegółową analizę TCO. Tesla Model 3: koszt zakupu 185k, eksploatacja 0,15 zł/km, amortyzacja 8 lat. BMW 320i: koszt 180k, eksploatacja 0,45 zł/km, amortyzacja 6 lat. Przy 20k km/rok Tesla jest tańsza o 45,000 zł w 5 lat.",
      "communication_style": "Analityczny, szczegółowy, oparty na danych",
      "focus_areas": ["Analiza TCO", "Dane techniczne", "Porównania"],
      "pace": "Metodyczne, z czasem na analizę",
      "key_points": [
        "Szczegółowa analiza TCO na 5-8 lat",
        "Porównanie z konkurencją klasa za klasą",
        "Dane o niezawodności i wartości odsprzedaży",
        "Wszystkie koszty ukryte i jawne"
      ],
      "next_steps": [
        "Dostarcz szczegółowy arkusz kalkulacyjny",
        "Przedstaw dane techniczne i testy",
        "Porównaj z 3-4 alternatywami",
        "Daj czas na analizę dokumentów"
      ],
      "avoid": [
        "Emocjonalnych argumentów",
        "Presji czasowej",
        "Niepełnych lub zaokrąglonych danych"
      ]
    }
  },
  
  // NOWA SEKCJA: Personalizacja według sytuacji
  "personalization_contexts": {
    "has_children": {
      "priority_boost": 0.3,
      "additional_points": [
        "Najwyższe noty bezpieczeństwa dla dzieci",
        "Cicha jazda - dzieci śpią podczas podróży",
        "Przestronny bagażnik na wózek i zabawki",
        "Brak spalin - czyste powietrze dla rodziny"
      ],
      "specific_features": [
        "Child safety locks",
        "ISOFIX mounting points",
        "Rear camera and sensors",
        "Climate control for rear passengers"
      ],
      "financial_benefits": [
        "Oszczędności na paliwie = więcej na dzieci",
        "Ulga podatkowa na dzieci + oszczędności Tesla",
        "Bezpieczna inwestycja w przyszłość rodziny"
      ]
    },
    "has_spouse": {
      "priority_boost": 0.2,
      "additional_points": [
        "Decyzja, którą doceni cała rodzina",
        "Komfort i bezpieczeństwo dla partnera",
        "Wspólne oszczędności na eksploatacji",
        "Prestiż i zadowolenie z mądrej decyzji"
      ],
      "communication_strategy": [
        "Uwzględnij partnera w procesie decyzyjnym",
        "Zaproponuj jazdę próbną dla obojga",
        "Przedstaw korzyści dla całej rodziny",
        "Daj czas na wspólne przemyślenie"
      ]
    },
    "has_solar_panels": {
      "priority_boost": 0.4,
      "additional_points": [
        "Idealne dopełnienie Twojego systemu solarnego",
        "Praktycznie darmowa energia do jazdy",
        "Pełna niezależność energetyczna",
        "ROI na panelach wzrasta o 25-30%"
      ],
      "specific_features": [
        "Home charging integration",
        "Solar panel compatibility",
        "Energy management system",
        "Grid tie-in capabilities"
      ],
      "financial_benefits": [
        "Zerowe koszty 'paliwa' przez większość roku",
        "Nadwyżka energii sprzedawana do sieci",
        "Szybszy zwrot inwestycji w panele"
      ]
    },
    "company_owner": {
      "priority_boost": 0.5,
      "additional_points": [
        "225,000 PLN amortyzacja vs 150,000 PLN spalinowe",
        "100% odliczenie VAT od zakupu i eksploatacji",
        "Wizerunek innowacyjnej, odpowiedzialnej firmy",
        "Korzyści dla pracowników (car policy)"
      ],
      "specific_features": [
        "Fleet management tools",
        "Business charging solutions",
        "Corporate leasing options",
        "Tax optimization features"
      ],
      "financial_benefits": [
        "Amortyzacja: 225k vs 150k (75k różnicy)",
        "VAT: 100% odliczenie vs 50% spalinowe",
        "Koszty eksploatacji: 70% niższe",
        "CSR i ESG compliance"
      ]
    },
    "employee": {
      "priority_boost": 0.3,
      "additional_points": [
        "Leasing pracowniczy z korzyściami podatkowymi",
        "Darmowe parkowanie w wielu miejscach",
        "Niskie koszty dojazdów do pracy",
        "Prestiż i komfort codziennych podróży"
      ],
      "financial_benefits": [
        "Leasing pracowniczy - niższy podatek",
        "Oszczędności na parkingu i paliwach",
        "Benefit od pracodawcy"
      ]
    },
    "tech_enthusiast": {
      "priority_boost": 0.4,
      "additional_points": [
        "Najnowsza technologia automotive",
        "Regularne aktualizacje OTA",
        "Autopilot i FSD capabilities",
        "Integracja z smart home"
      ],
      "specific_features": [
        "Over-the-air updates",
        "Autopilot hardware",
        "Mobile app control",
        "API access for developers"
      ]
    }
  },
  
  // NOWA SEKCJA: Analiza konkurencji
  "competitor_analysis": {
    "relevant_competitors": ["bmw_ix3", "hyundai_ioniq5", "vw_id4"],
    "key_differentiators": [
      "Najdłuższy zasięg w klasie (602 km vs 460 km BMW)",
      "Najszybsza sieć ładowania (Supercharger)",
      "Regularne aktualizacje OTA",
      "Najwyższa wartość odsprzedaży"
    ],
    "price_positioning": {
      "vs_bmw_ix3": "Podobna cena, znacznie lepsze parametry",
      "vs_hyundai_ioniq5": "Wyższa cena, ale premium quality",
      "vs_vw_id4": "Wyższa cena, ale znacznie lepsze tech"
    }
  },
  
  // NOWA SEKCJA: Adaptacja kulturowa
  "cultural_adaptation": {
    "polish_specifics": {
      "communication_style": "Formal, respectful, building trust gradually",
      "decision_factors": ["Family approval", "Financial security", "Long-term value"],
      "trust_builders": ["References from Polish customers", "Detailed warranties", "Local service network"],
      "concerns_to_address": ["Service availability", "Winter performance", "Charging infrastructure"]
    },
    "regional_data": {
      "charging_stations_poland": "1,200+ stacji, 150+ Supercharger",
      "winter_performance": "Pompa ciepła standard, zasięg zimą 85%",
      "service_network": "12 salonów, 25 punktów serwisowych"
    }
  }
}
```

### 2. NOWY PLIK: personalization_engine.json

```json
{
  "customer_contexts": {
    "family_situations": {
      "has_children_0_3": {
        "priority_features": ["safety", "space", "quiet_operation"],
        "key_messages": [
          "Najcichsze auto - dzieci śpią podczas jazdy",
          "Najwyższe noty bezpieczeństwa Euro NCAP",
          "Przestronny bagażnik na wózek i akcesoria"
        ],
        "financial_angle": "Oszczędności na paliwie = więcej na potrzeby dzieci",
        "demo_focus": "Pokaz systemu ISOFIX i bezpieczeństwa"
      },
      "has_children_4_12": {
        "priority_features": ["safety", "entertainment", "space"],
        "key_messages": [
          "Rozrywka dla dzieci - Netflix, gry, internet",
          "Bezpieczne podróże rodzinne",
          "Miejsce na sprzęt sportowy i szkolny"
        ],
        "financial_angle": "Oszczędności pozwalają na więcej aktywności dla dzieci",
        "demo_focus": "Pokaz systemu rozrywki i przestrzeni"
      },
      "has_teenagers": {
        "priority_features": ["technology", "performance", "style"],
        "key_messages": [
          "Najnowsza technologia - nastolatki będą zachwycone",
          "Bezpieczne auto dla młodych kierowców",
          "Prestiż i styl, który docenią rówieśnicy"
        ],
        "financial_angle": "Inwestycja w bezpieczeństwo młodego kierowcy",
        "demo_focus": "Pokaz technologii i systemów bezpieczeństwa"
      }
    },
    
    "housing_situations": {
      "apartment_no_garage": {
        "concerns": ["charging_access", "parking", "security"],
        "solutions": [
          "Mapa 1,200+ publicznych stacji ładowania",
          "Aplikacja do znajdowania wolnych miejsc",
          "Sentry Mode - ochrona podczas parkowania"
        ],
        "charging_strategy": "Ładowanie w pracy + centra handlowe + Supercharger"
      },
      "house_with_garage": {
        "advantages": ["home_charging", "security", "convenience"],
        "solutions": [
          "Wall Connector - ładowanie w domu",
          "Tańsze ładowanie nocą (taryfa G12)",
          "Pełna bateria każdego ranka"
        ],
        "financial_benefit": "Koszt ładowania: 0,60 zł/100km vs 45 zł/100km benzyna"
      },
      "house_with_solar": {
        "synergy_benefits": [
          "Praktycznie darmowa energia do jazdy",
          "Pełna niezależność energetyczna",
          "ROI na panelach wzrasta o 30%"
        ],
        "technical_integration": "Tesla Powerwall + Solar + Model 3 = kompletny ekosystem",
        "financial_benefit": "Zerowe koszty paliwa przez 8-9 miesięcy w roku"
      }
    },
    
    "business_contexts": {
      "small_business_owner": {
        "tax_benefits": [
          "225,000 PLN amortyzacja (vs 150,000 spalinowe)",
          "100% odliczenie VAT",
          "Niższe koszty eksploatacji = wyższy zysk"
        ],
        "business_image": "Innowacyjna firma dbająca o środowisko",
        "practical_benefits": "Niskie koszty fleet management"
      },
      "corporate_executive": {
        "status_benefits": ["prestige", "technology_leadership", "environmental_responsibility"],
        "business_case": "CSR i ESG compliance",
        "practical_benefits": "Darmowe parkowanie VIP, dostęp do bus lanes"
      },
      "sales_representative": {
        "practical_focus": ["low_operating_costs", "reliability", "professional_image"],
        "financial_benefits": "Oszczędności 1,500-2,000 zł/miesiąc na kosztach eksploatacji",
        "business_advantage": "Więcej czasu na klientów, mniej na stacje benzynowe"
      }
    }
  },
  
  "financial_calculators": {
    "tco_calculator": {
      "tesla_model_3": {
        "purchase_price": 185000,
        "insurance_annual": 2400,
        "maintenance_annual": 800,
        "energy_cost_per_100km": 6,
        "depreciation_annual": 0.12,
        "tax_benefits_business": {
          "amortization_limit": 225000,
          "vat_deduction": 1.0
        }
      },
      "bmw_320i_comparison": {
        "purchase_price": 180000,
        "insurance_annual": 2800,
        "maintenance_annual": 3200,
        "fuel_cost_per_100km": 45,
        "depreciation_annual": 0.15,
        "tax_benefits_business": {
          "amortization_limit": 150000,
          "vat_deduction": 0.5
        }
      }
    }
  }
}
```

### 3. NOWY PLIK: competitor_database.json

```json
{
  "competitors": {
    "bmw_ix3": {
      "basic_info": {
        "name": "BMW iX3",
        "price_range": "297,000 PLN",
        "segment": "Premium SUV",
        "target_audience": "Business executives, luxury seekers"
      },
      "specifications": {
        "battery_capacity": "74 kWh",
        "range_wltp": "460 km",
        "power": "282 hp",
        "acceleration_0_100": "6.8 s",
        "top_speed": "180 km/h",
        "drive_type": "RWD"
      },
      "strengths": [
        "Premium brand perception",
        "Comfortable ride quality",
        "Quiet cabin",
        "Good build quality"
      ],
      "weaknesses": [
        "Rear-wheel drive only",
        "Smaller battery capacity",
        "Lower range than Tesla",
        "No OTA updates",
        "Higher service costs"
      ],
      "tesla_advantages": [
        "142 km longer range (602 vs 460)",
        "Faster acceleration (3.3s vs 6.8s)",
        "All-wheel drive standard",
        "Regular OTA updates",
        "Supercharger network access",
        "Lower total cost of ownership"
      ],
      "price_comparison": {
        "bmw_price": 297000,
        "tesla_price": 225000,
        "savings": 72000,
        "value_proposition": "Better performance for 72,000 PLN less"
      }
    },
    
    "hyundai_ioniq5": {
      "basic_info": {
        "name": "Hyundai Ioniq 5",
        "price_range": "214,900 - 289,900 PLN",
        "segment": "Mid-size SUV",
        "target_audience": "Tech-savvy families, early EV adopters"
      },
      "specifications": {
        "battery_capacity": "58/77.4 kWh",
        "range_wltp": "384/481 km",
        "power": "170/225/305 hp",
        "acceleration_0_100": "5.2-8.5 s",
        "charging_speed": "235 kW"
      },
      "strengths": [
        "Fast charging capability",
        "Spacious interior",
        "Innovative design",
        "Good warranty"
      ],
      "weaknesses": [
        "Lower brand prestige",
        "Limited service network",
        "Software not as advanced",
        "Lower resale value"
      ],
      "tesla_advantages": [
        "Superior software ecosystem",
        "Larger Supercharger network",
        "Better resale value",
        "More advanced autopilot",
        "Premium brand perception"
      ]
    },
    
    "vw_id4": {
      "basic_info": {
        "name": "Volkswagen ID.4",
        "price_range": "137,190 - 189,990 PLN",
        "segment": "Compact SUV",
        "target_audience": "Mainstream families, practical buyers"
      },
      "specifications": {
        "battery_capacity": "52/77 kWh",
        "range_wltp": "346/520 km",
        "power": "148/204 hp",
        "acceleration_0_100": "8.5-10.9 s"
      },
      "strengths": [
        "Lower price point",
        "Traditional VW quality",
        "Good interior space",
        "Established dealer network"
      ],
      "weaknesses": [
        "Slower performance",
        "Less advanced technology",
        "Significant range loss in winter",
        "Slower charging speeds"
      ],
      "tesla_advantages": [
        "Much better performance",
        "Superior technology",
        "Better efficiency",
        "More advanced features",
        "Higher build quality"
      ]
    }
  },
  
  "comparison_matrices": {
    "key_metrics": {
      "range": {
        "tesla_model_3": 602,
        "bmw_ix3": 460,
        "hyundai_ioniq5": 481,
        "vw_id4": 520,
        "winner": "tesla_model_3"
      },
      "acceleration": {
        "tesla_model_3": 3.3,
        "bmw_ix3": 6.8,
        "hyundai_ioniq5": 5.2,
        "vw_id4": 8.5,
        "winner": "tesla_model_3"
      },
      "charging_network": {
        "tesla": "50,000+ Superchargers globally",
        "others": "Limited fast charging options",
        "winner": "tesla"
      }
    }
  }
}
```

### 4. ROZSZERZ UnifiedCustomerEngine.js

#### Dodaj nowe klasy:

```javascript
// Dodaj na początku pliku

class PersonalizationEngine {
    constructor() {
        this.personalizationData = null;
        this.loadPersonalizationData();
    }
    
    async loadPersonalizationData() {
        try {
            const response = await fetch('./data/personalization_engine.json');
            this.personalizationData = await response.json();
        } catch (error) {
            console.error('Error loading personalization data:', error);
        }
    }
    
    /**
     * Generuje spersonalizowaną odpowiedź na podstawie kontekstu klienta
     */
    generatePersonalizedResponse(trigger, customerContext, discType) {
        if (!this.personalizationData) return trigger.disc_responses[discType];
        
        const baseResponse = trigger.disc_responses[discType];
        const personalizations = this.getPersonalizationsForContext(customerContext);
        
        return {
            ...baseResponse,
            personalized_points: personalizations.additional_points,
            financial_benefits: personalizations.financial_benefits,
            specific_features: personalizations.specific_features,
            communication_adjustments: personalizations.communication_strategy
        };
    }
    
    /**
     * Pobiera personalizacje dla danego kontekstu
     */
    getPersonalizationsForContext(context) {
        const personalizations = {
            additional_points: [],
            financial_benefits: [],
            specific_features: [],
            communication_strategy: []
        };
        
        // Analiza sytuacji rodzinnej
        if (context.has_children) {
            const childrenData = this.getChildrenPersonalization(context.children_ages);
            personalizations.additional_points.push(...childrenData.key_messages);
            personalizations.financial_benefits.push(childrenData.financial_angle);
        }
        
        // Analiza sytuacji mieszkaniowej
        if (context.housing_situation) {
            const housingData = this.personalizationData.customer_contexts.housing_situations[context.housing_situation];
            if (housingData) {
                personalizations.additional_points.push(...(housingData.solutions || []));
                if (housingData.financial_benefit) {
                    personalizations.financial_benefits.push(housingData.financial_benefit);
                }
            }
        }
        
        // Analiza kontekstu biznesowego
        if (context.business_context) {
            const businessData = this.personalizationData.customer_contexts.business_contexts[context.business_context];
            if (businessData) {
                personalizations.additional_points.push(...(businessData.tax_benefits || []));
                personalizations.financial_benefits.push(...(businessData.tax_benefits || []));
            }
        }
        
        return personalizations;
    }
    
    /**
     * Pobiera personalizację dla dzieci w różnym wieku
     */
    getChildrenPersonalization(childrenAges) {
        if (!childrenAges || childrenAges.length === 0) {
            return this.personalizationData.customer_contexts.family_situations.has_children_0_3;
        }
        
        const maxAge = Math.max(...childrenAges);
        
        if (maxAge <= 3) {
            return this.personalizationData.customer_contexts.family_situations.has_children_0_3;
        } else if (maxAge <= 12) {
            return this.personalizationData.customer_contexts.family_situations.has_children_4_12;
        } else {
            return this.personalizationData.customer_contexts.family_situations.has_teenagers;
        }
    }
    
    /**
     * Kalkuluje TCO dla danego kontekstu
     */
    calculateTCO(customerContext, years = 5) {
        if (!this.personalizationData) return null;
        
        const calculator = this.personalizationData.financial_calculators.tco_calculator;
        const tesla = calculator.tesla_model_3;
        const bmw = calculator.bmw_320i_comparison;
        
        const annualKm = customerContext.annual_km || 20000;
        
        // Kalkulacja Tesla
        const teslaTCO = this.calculateVehicleTCO(tesla, annualKm, years, customerContext.is_business);
        
        // Kalkulacja BMW (porównanie)
        const bmwTCO = this.calculateVehicleTCO(bmw, annualKm, years, customerContext.is_business);
        
        return {
            tesla: teslaTCO,
            bmw: bmwTCO,
            savings: bmwTCO.total - teslaTCO.total,
            savings_monthly: (bmwTCO.total - teslaTCO.total) / (years * 12)
        };
    }
    
    calculateVehicleTCO(vehicle, annualKm, years, isBusiness) {
        const purchasePrice = vehicle.purchase_price;
        const annualInsurance = vehicle.insurance_annual;
        const annualMaintenance = vehicle.maintenance_annual;
        const fuelCostPer100km = vehicle.energy_cost_per_100km || vehicle.fuel_cost_per_100km;
        
        const totalFuelCost = (annualKm / 100) * fuelCostPer100km * years;
        const totalInsurance = annualInsurance * years;
        const totalMaintenance = annualMaintenance * years;
        const depreciation = purchasePrice * (vehicle.depreciation_annual * years);
        
        let taxBenefits = 0;
        if (isBusiness && vehicle.tax_benefits_business) {
            const amortizationBenefit = Math.min(purchasePrice, vehicle.tax_benefits_business.amortization_limit) * 0.19; // 19% CIT
            const vatBenefit = purchasePrice * 0.23 * vehicle.tax_benefits_business.vat_deduction;
            taxBenefits = amortizationBenefit + vatBenefit;
        }
        
        const total = purchasePrice + totalFuelCost + totalInsurance + totalMaintenance - taxBenefits;
        
        return {
            purchase_price: purchasePrice,
            fuel_costs: totalFuelCost,
            insurance: totalInsurance,
            maintenance: totalMaintenance,
            tax_benefits: taxBenefits,
            total: total
        };
    }
}

class CompetitorAnalyzer {
    constructor() {
        this.competitorData = null;
        this.loadCompetitorData();
    }
    
    async loadCompetitorData() {
        try {
            const response = await fetch('./data/competitor_database.json');
            this.competitorData = await response.json();
        } catch (error) {
            console.error('Error loading competitor data:', error);
        }
    }
    
    /**
     * Pobiera analizę konkurencji dla danego triggera
     */
    getCompetitorAnalysisForTrigger(trigger) {
        if (!this.competitorData || !trigger.competitor_analysis) {
            return null;
        }
        
        const relevantCompetitors = trigger.competitor_analysis.relevant_competitors;
        const competitors = relevantCompetitors.map(competitorId => {
            return this.competitorData.competitors[competitorId];
        }).filter(Boolean);
        
        return {
            competitors: competitors,
            key_differentiators: trigger.competitor_analysis.key_differentiators,
            price_positioning: trigger.competitor_analysis.price_positioning,
            key_arguments: this.generateKeyArguments(competitors)
        };
    }
    
    generateKeyArguments(competitors) {
        const arguments = [];
        
        // Argument o zasięgu
        const rangeComparison = competitors.map(c => c.specifications.range_wltp);
        const maxCompetitorRange = Math.max(...rangeComparison.map(r => parseInt(r)));
        if (maxCompetitorRange < 602) {
            arguments.push({
                title: "Najdłuższy zasięg",
                description: `Tesla: 602 km vs najlepszy konkurent: ${maxCompetitorRange} km`
            });
        }
        
        // Argument o przyspieszeniu
        arguments.push({
            title: "Najszybsze przyspieszenie",
            description: "Tesla Model 3: 3.3s 0-100 km/h - szybciej niż większość aut sportowych"
        });
        
        // Argument o sieci ładowania
        arguments.push({
            title: "Największa sieć ładowania",
            description: "50,000+ Superchargers na świecie, 150+ w Polsce"
        });
        
        return arguments;
    }
}

class CulturalAdapter {
    constructor() {
        this.culturalData = {
            polish_market: {
                communication_preferences: {
                    formality_level: "high",
                    trust_building: "gradual",
                    decision_style: "analytical",
                    family_involvement: "high"
                },
                key_concerns: [
                    "Service availability",
                    "Winter performance",
                    "Charging infrastructure",
                    "Total cost of ownership",
                    "Resale value"
                ],
                trust_builders: [
                    "References from Polish customers",
                    "Detailed technical specifications",
                    "Comprehensive warranty",
                    "Local service network information"
                ]
            }
        };
    }
    
    /**
     * Adaptuje komunikację dla polskiego rynku
     */
    adaptForPolishMarket(response, customerContext) {
        const polishData = this.culturalData.polish_market;
        
        return {
            ...response,
            cultural_adaptations: {
                communication_style: this.adaptCommunicationStyle(response, polishData),
                trust_building_elements: polishData.trust_builders,
                address_concerns: this.addressPolishConcerns(polishData.key_concerns),
                family_considerations: this.addFamilyConsiderations(customerContext)
            }
        };
    }
    
    adaptCommunicationStyle(response, polishData) {
        return {
            formality: "Use formal address (Pan/Pani)",
            pace: "Allow time for consideration",
            approach: "Build trust gradually with facts and references",
            family_inclusion: "Consider family decision-making process"
        };
    }
    
    addressPolishConcerns(concerns) {
        const responses = {
            "Service availability": "12 salonów Tesla w Polsce, 25 punktów serwisowych, mobilny serwis",
            "Winter performance": "Pompa ciepła w standardzie, zasięg zimą 85% (vs 70% konkurencja)",
            "Charging infrastructure": "1,200+ publicznych stacji, 150+ Superchargers, rozwój 50% rocznie",
            "Total cost of ownership": "TCO o 30-40% niższy niż spalinowe przez 5 lat",
            "Resale value": "Najwyższa wartość odsprzedaży w segmencie EV (65% po 3 latach)"
        };
        
        return concerns.map(concern => ({
            concern: concern,
            response: responses[concern] || "Szczegółowe informacje dostępne na życzenie"
        }));
    }
    
    addFamilyConsiderations(customerContext) {
        const considerations = [];
        
        if (customerContext.has_children) {
            considerations.push("Najwyższe noty bezpieczeństwa dla całej rodziny");
            considerations.push("Cicha jazda - komfort dla dzieci");
        }
        
        if (customerContext.has_spouse) {
            considerations.push("Czas na wspólne przemyślenie decyzji");
            considerations.push("Jazda próbna dla całej rodziny");
        }
        
        return considerations;
    }
}

// Rozszerz główną klasę UnifiedCustomerEngine
class EnhancedUnifiedCustomerEngine extends UnifiedCustomerEngine {
    constructor() {
        super();
        this.personalizationEngine = new PersonalizationEngine();
        this.competitorAnalyzer = new CompetitorAnalyzer();
        this.culturalAdapter = new CulturalAdapter();
    }
    
    /**
     * Rozszerzona analiza klienta z personalizacją
     */
    async analyzeCustomerEnhanced(inputData) {
        // Podstawowa analiza
        const baseAnalysis = await this.analyzeCustomer(inputData);
        
        // Dodaj personalizację
        const personalizedResponses = {};
        inputData.selectedTriggers.forEach(triggerId => {
            const trigger = this.triggers.find(t => t.id === triggerId);
            if (trigger) {
                personalizedResponses[triggerId] = this.personalizationEngine.generatePersonalizedResponse(
                    trigger,
                    inputData.customerContext,
                    inputData.personality_type
                );
            }
        });
        
        // Dodaj analizę konkurencji
        const competitorAnalysis = {};
        inputData.selectedTriggers.forEach(triggerId => {
            const trigger = this.triggers.find(t => t.id === triggerId);
            if (trigger) {
                const analysis = this.competitorAnalyzer.getCompetitorAnalysisForTrigger(trigger);
                if (analysis) {
                    competitorAnalysis[triggerId] = analysis;
                }
            }
        });
        
        // Dodaj adaptację kulturową
        const culturalAdaptation = this.culturalAdapter.adaptForPolishMarket(
            baseAnalysis,
            inputData.customerContext
        );
        
        // Kalkulacja TCO
        const tcoAnalysis = this.personalizationEngine.calculateTCO(
            inputData.customerContext,
            5 // 5 lat
        );
        
        return {
            ...baseAnalysis,
            personalized_responses: personalizedResponses,
            competitor_analysis: competitorAnalysis,
            cultural_adaptation: culturalAdaptation,
            tco_analysis: tcoAnalysis,
            enhanced_strategies: this.generateEnhancedStrategies(inputData),
            next_best_actions: this.generateNextBestActions(inputData)
        };
    }
    
    generateEnhancedStrategies(inputData) {
        const strategies = [];
        const context = inputData.customerContext;
        
        // Strategia rodzinna
        if (context.has_children) {
            strategies.push({
                type: "family_focused",
                title: "Strategia Rodzinna",
                priority: "high",
                steps: [
                    "Podkreśl najwyższe noty bezpieczeństwa (5 gwiazdek Euro NCAP)",
                    "Pokaż przestrzeń bagażową i wygodę dla dzieci",
                    "Omów oszczędności - więcej pieniędzy na potrzeby rodziny",
                    "Zaproponuj jazdę próbną z całą rodziną",
                    "Przedstaw cichy tryb jazdy - dzieci śpią podczas podróży"
                ],
                timeline: "2-3 spotkania, decyzja rodzinna"
            });
        }
        
        // Strategia biznesowa
        if (context.is_business || context.company_owner) {
            strategies.push({
                type: "business_focused",
                title: "Strategia Biznesowa",
                priority: "high",
                steps: [
                    "Przedstaw korzyści podatkowe (225k amortyzacja vs 150k)",
                    "Pokaż ROI i business case z konkretną kalkulacją",
                    "Omów wizerunek firmy i CSR/ESG compliance",
                    "Zaproponuj fleet solutions dla większych firm",
                    "Przedstaw case studies polskich firm"
                ],
                timeline: "1-2 spotkania, szybka decyzja biznesowa"
            });
        }
        
        // Strategia technologiczna
        if (context.tech_enthusiast) {
            strategies.push({
                type: "tech_focused",
                title: "Strategia Technologiczna",
                priority: "medium",
                steps: [
                    "Pokaż najnowsze funkcje OTA updates",
                    "Demonstracja Autopilot i FSD capabilities",
                    "Integracja z smart home i aplikacjami",
                    "API access i możliwości customizacji",
                    "Roadmapa przyszłych funkcji"
                ],
                timeline: "1 spotkanie + demo, szybka decyzja"
            });
        }
        
        return strategies;
    }
    
    generateNextBestActions(inputData) {
        const actions = [];
        const context = inputData.customerContext;
        const personality = inputData.personality_type;
        
        // Akcje bazowane na typie DISC
        switch (personality) {
            case 'D':
                actions.push({
                    action: "Przedstaw konkretną ofertę z kalkulacją ROI",
                    priority: "immediate",
                    timeline: "W tym spotkaniu"
                });
                break;
            case 'I':
                actions.push({
                    action: "Zaproponuj jazdę próbną z rodziną/przyjaciółmi",
                    priority: "high",
                    timeline: "W ciągu tygodnia"
                });
                break;
            case 'S':
                actions.push({
                    action: "Dostarcz szczegółowe materiały do przemyślenia",
                    priority: "high",
                    timeline: "Daj 1-2 tygodnie na decyzję"
                });
                break;
            case 'C':
                actions.push({
                    action: "Przygotuj szczegółową analizę TCO i porównanie z konkurencją",
                    priority: "immediate",
                    timeline: "Następne spotkanie"
                });
                break;
        }
        
        // Akcje bazowane na kontekście
        if (context.has_solar_panels) {
            actions.push({
                action: "Przygotuj kalkulację synergii Tesla + panele słoneczne",
                priority: "high",
                timeline: "W ciągu 2-3 dni"
            });
        }
        
        if (context.first_ev) {
            actions.push({
                action: "Zaproponuj edukacyjną sesję o samochodach elektrycznych",
                priority: "medium",
                timeline: "Przed główną prezentacją"
            });
        }
        
        return actions;
    }
}

// Zastąp globalną instancję
window.customerEngine = new EnhancedUnifiedCustomerEngine();
```

### 5. TESTOWANIE BACKENDU

#### Skrypt testowy (test_backend.js):

```javascript
// Test personalizacji
const testPersonalization = async () => {
    const testContext = {
        has_children: true,
        children_ages: [3, 7],
        has_solar_panels: true,
        is_business: true,
        company_owner: true,
        annual_km: 25000
    };
    
    const testInput = {
        selectedTriggers: ['price_concern_high'],
        customerContext: testContext,
        personality_type: 'C'
    };
    
    const result = await window.customerEngine.analyzeCustomerEnhanced(testInput);
    console.log('Personalization Test Result:', result);
};

// Test analizy konkurencji
const testCompetitorAnalysis = () => {
    const competitorAnalyzer = new CompetitorAnalyzer();
    setTimeout(() => {
        const trigger = {
            competitor_analysis: {
                relevant_competitors: ['bmw_ix3', 'hyundai_ioniq5'],
                key_differentiators: ['Longer range', 'Faster charging']
            }
        };
        
        const analysis = competitorAnalyzer.getCompetitorAnalysisForTrigger(trigger);
        console.log('Competitor Analysis Test:', analysis);
    }, 1000);
};

// Test kalkulacji TCO
const testTCOCalculation = () => {
    const personalizationEngine = new PersonalizationEngine();
    setTimeout(() => {
        const context = {
            annual_km: 20000,
            is_business: true
        };
        
        const tco = personalizationEngine.calculateTCO(context, 5);
        console.log('TCO Calculation Test:', tco);
    }, 1000);
};

// Uruchom testy
testPersonalization();
testCompetitorAnalysis();
testTCOCalculation();
```

---

## 🚀 PLAN WDROŻENIA BACKENDU

### Faza 1 (Dzień 1): Podstawowe pliki danych
1. Stwórz `personalization_engine.json`
2. Stwórz `competitor_database.json`
3. Rozszerz istniejące `triggers.json`

### Faza 2 (Dzień 2): Implementacja klas
1. Dodaj `PersonalizationEngine`
2. Dodaj `CompetitorAnalyzer`
3. Dodaj `CulturalAdapter`

### Faza 3 (Dzień 3): Integracja
1. Rozszerz `UnifiedCustomerEngine`
2. Dodaj `EnhancedUnifiedCustomerEngine`
3. Przetestuj wszystkie funkcjonalności

### Faza 4 (Dzień 4): Optymalizacja
1. Dodaj error handling
2. Zoptymalizuj wydajność
3. Dodaj logging i monitoring

**Czy chcesz, żebym rozpoczął implementację od konkretnej części?**