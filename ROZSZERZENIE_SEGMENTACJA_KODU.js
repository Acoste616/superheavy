// ROZSZERZENIE CustomerDecoderEngine.js - SEGMENTACJA I STRATEGIE GRUPOWE
// Dodać do istniejącego pliku CustomerDecoderEngine.js

class CustomerSegmentationEngine {
    constructor() {
        this.segmentDefinitions = {
            eco_family: {
                criteria: {
                    hasChildren: ['yes_young', 'yes_school'],
                    hasPV: ['true', 'planned'],
                    housingType: ['dom'],
                    age: ['26-35', '36-45']
                },
                priority_score: 95,
                conversion_multiplier: 1.4
            },
            tech_professional: {
                criteria: {
                    age: ['26-35', '36-45'],
                    housingType: ['mieszkanie', 'mieszkanie_ulica'],
                    teslaExperience: ['researching', 'test_driven'],
                    carRole: ['primary', 'replacement']
                },
                priority_score: 88,
                conversion_multiplier: 1.2
            },
            senior_comfort: {
                criteria: {
                    age: ['56-65', '65+'],
                    housingType: ['dom'],
                    relationshipStatus: ['married'],
                    teslaExperience: ['first_time', 'researching']
                },
                priority_score: 92,
                conversion_multiplier: 1.35
            },
            business_roi: {
                criteria: {
                    carRole: ['business', 'fleet'],
                    age: ['36-45', '46-55'],
                    relationshipStatus: ['married', 'single']
                },
                priority_score: 85,
                conversion_multiplier: 1.15
            },
            young_urban: {
                criteria: {
                    age: ['18-25', '26-35'],
                    housingType: ['mieszkanie', 'mieszkanie_ulica'],
                    relationshipStatus: ['single', 'relationship'],
                    hasChildren: ['none']
                },
                priority_score: 75,
                conversion_multiplier: 1.1
            }
        };

        this.segmentStrategies = this.initializeSegmentStrategies();
    }

    // Identyfikacja segmentu klienta
    identifyCustomerSegment(demographics) {
        const scores = {};
        
        for (const [segmentName, definition] of Object.entries(this.segmentDefinitions)) {
            scores[segmentName] = this.calculateSegmentMatch(demographics, definition.criteria);
        }

        // Znajdź najlepiej pasujący segment
        const bestMatch = Object.entries(scores)
            .filter(([_, score]) => score > 0.6) // Minimum 60% dopasowania
            .sort(([,a], [,b]) => b - a)[0];

        return bestMatch ? {
            segment: bestMatch[0],
            confidence: bestMatch[1],
            priority_score: this.segmentDefinitions[bestMatch[0]].priority_score,
            conversion_multiplier: this.segmentDefinitions[bestMatch[0]].conversion_multiplier
        } : {
            segment: 'general',
            confidence: 0,
            priority_score: 50,
            conversion_multiplier: 1.0
        };
    }

    // Obliczanie dopasowania do segmentu
    calculateSegmentMatch(demographics, criteria) {
        let matches = 0;
        let totalCriteria = 0;

        for (const [key, expectedValues] of Object.entries(criteria)) {
            totalCriteria++;
            if (demographics[key] && expectedValues.includes(demographics[key])) {
                matches++;
            }
        }

        return totalCriteria > 0 ? matches / totalCriteria : 0;
    }

    // Generowanie strategii dla konkretnego segmentu
    generateSegmentStrategy(segment, demographics, triggers, personality) {
        const strategy = this.segmentStrategies[segment] || this.segmentStrategies.general;
        
        // Personalizacja na podstawie DISC
        const personalizedStrategy = this.personalizeForDISC(strategy, personality);
        
        // Dostosowanie do triggerów
        const triggerEnhancedStrategy = this.enhanceWithTriggers(personalizedStrategy, triggers);
        
        // Dodanie specyficznych dla segmentu modyfikatorów
        return this.addSegmentModifiers(triggerEnhancedStrategy, segment, demographics);
    }

    // Inicjalizacja strategii dla segmentów
    initializeSegmentStrategies() {
        return {
            eco_family: {
                primaryMessages: {
                    D: "Najlepsza inwestycja w przyszłość rodziny - Tesla + PV = maksymalne oszczędności i bezpieczeństwo",
                    I: "Wyobraź sobie - dzieci bezpieczne, planeta czysta, sąsiedzi zazdroszczą! Dołącz do rodzin Tesla!",
                    S: "Spokojnie i bezpiecznie - Tesla z panelami PV to gwarancja oszczędności i ochrony dla rodziny",
                    C: "Analiza ROI: Tesla + PV = 35% oszczędności rocznie + 5-gwiazdkowe bezpieczeństwo. Liczby nie kłamią."
                },
                keyBenefits: [
                    "Synergia PV + Tesla = darmowa energia",
                    "5-gwiazdkowe bezpieczeństwo dla dzieci",
                    "Ekologiczny legacy dla przyszłych pokoleń",
                    "ROI 15-20% rocznie z kombinacji PV + Tesla",
                    "Cicha jazda = spokojne dzieci",
                    "Frunk = dodatkowa przestrzeń na wózek/zabawki"
                ],
                actionPlan: {
                    immediate: [
                        "Kalkulator oszczędności PV + Tesla",
                        "Video: Rodziny Tesla z panelami słonecznymi",
                        "Case study: Podobna rodzina z regionu"
                    ],
                    shortTerm: [
                        "Spotkanie z rodziną Tesla + PV",
                        "Test drive z dziećmi (fokus na bezpieczeństwo)",
                        "Prezentacja systemów bezpieczeństwa"
                    ],
                    closing: [
                        "Szczegółowa analiza TCO z PV",
                        "Ekologiczny bonus dla rodzin z PV",
                        "Plan finansowania dostosowany do rodziny"
                    ]
                },
                contentPriority: ["safety_data", "pv_calculators", "family_testimonials", "environmental_impact"],
                communicationStyle: "family_focused",
                urgencyLevel: "medium",
                followUpFrequency: "weekly"
            },

            tech_professional: {
                primaryMessages: {
                    D: "Tesla Model S Plaid - najszybszy sedan świata. 0-100 w 2.1s. Chcesz być pierwszy w Polsce?",
                    I: "Wyobraź sobie reakcje na parkingu biurowca! Tesla to ultimate status symbol dla tech profesjonalistów",
                    S: "Tesla to spokój ducha - najnowsza technologia, ale niezawodna. Autopilot zadba o Ciebie w korkach",
                    C: "Specs nie do pobicia: 628 KM, Autopilot 4.0, OTA updates. Żadna konkurencja nie ma takich parametrów"
                },
                keyBenefits: [
                    "Najnowsza technologia na kółkach",
                    "0-100 km/h szybciej niż konkurencja",
                    "OTA updates - samochód się ulepsza",
                    "Autopilot - przyszłość już dziś",
                    "Supercharging network - wolność podróżowania",
                    "Tesla community - networking z innowatorami"
                ],
                actionPlan: {
                    immediate: [
                        "Exclusive preview najnowszego modelu",
                        "Tech specs + performance comparison",
                        "Zaproszenie do Tesla community"
                    ],
                    shortTerm: [
                        "Performance test drive + acceleration demo",
                        "Autopilot demonstration",
                        "Spotkanie z innymi Tesla owners"
                    ],
                    closing: [
                        "Leasing z upgrade options",
                        "Tech pioneer package",
                        "Early access do nowych features"
                    ]
                },
                contentPriority: ["tech_specs", "performance_videos", "innovation_roadmap", "community_access"],
                communicationStyle: "tech_focused",
                urgencyLevel: "high",
                followUpFrequency: "daily"
            },

            senior_comfort: {
                primaryMessages: {
                    D: "Tesla - najwyższa jakość i niezawodność. Inwestycja na lata, nie eksperyment",
                    I: "Dołącz do grona zadowolonych seniorów Tesla. Komfort i prestiż bez kompromisów",
                    S: "Tesla to spokój i bezpieczeństwo. Najprostszy w obsłudze samochód elektryczny + 24/7 wsparcie",
                    C: "Najwyższe oceny niezawodności, 8-letnia gwarancja, najniższe koszty eksploatacji w segmencie"
                },
                keyBenefits: [
                    "Najprostszy w obsłudze samochód elektryczny",
                    "24/7 wsparcie Tesla - zawsze pomożemy",
                    "Najwyższa jakość i niezawodność",
                    "Oszczędności bez kompromisów",
                    "Cicha i komfortowa jazda",
                    "Automatyczne systemy bezpieczeństwa"
                ],
                actionPlan: {
                    immediate: [
                        "Broszura: Tesla dla seniorów",
                        "Testimoniale innych seniorów",
                        "Informacje o wsparciu i serwisie"
                    ],
                    shortTerm: [
                        "Spokojny test drive (bez presji)",
                        "Prezentacja prostoty obsługi",
                        "Spotkanie z Tesla advisor"
                    ],
                    closing: [
                        "Szczegółowe omówienie gwarancji",
                        "Plan serwisowy i wsparcia",
                        "Finansowanie dostosowane do emerytury"
                    ]
                },
                contentPriority: ["simplicity_guides", "support_info", "senior_testimonials", "reliability_data"],
                communicationStyle: "supportive",
                urgencyLevel: "low",
                followUpFrequency: "bi_weekly"
            },

            business_roi: {
                primaryMessages: {
                    D: "Tesla dla biznesu = najlepszy ROI w segmencie premium. Liczby nie kłamią - sprawdź sam",
                    I: "Twoja firma z flotą Tesla? To statement o innowacyjności i odpowiedzialności. Klienci to docenią",
                    S: "Tesla Business - spokojne zarządzanie flotą, przewidywalne koszty, zadowoleni pracownicy",
                    C: "Analiza TCO: Tesla vs konkurencja = 30% niższe koszty + korzyści podatkowe + image firmy"
                },
                keyBenefits: [
                    "Najlepszy ROI w segmencie premium",
                    "Korzyści podatkowe dla firm",
                    "Niskie koszty eksploatacji",
                    "Pozytywny image firmy",
                    "Fleet management tools",
                    "Atrakcyjny benefit dla pracowników"
                ],
                actionPlan: {
                    immediate: [
                        "Business case study",
                        "ROI calculator dla firm",
                        "Informacje o korzyściach podatkowych"
                    ],
                    shortTerm: [
                        "Prezentacja fleet solutions",
                        "Test drive dla decision makers",
                        "Spotkanie z Tesla Business team"
                    ],
                    closing: [
                        "Szczegółowa oferta fleet",
                        "Leasing korporacyjny",
                        "Pilot program dla firmy"
                    ]
                },
                contentPriority: ["roi_analysis", "tax_benefits", "fleet_solutions", "corporate_cases"],
                communicationStyle: "business_focused",
                urgencyLevel: "medium",
                followUpFrequency: "weekly"
            },

            general: {
                primaryMessages: {
                    D: "Tesla - lider innowacji i performance. Najlepsza inwestycja w mobilność przyszłości",
                    I: "Dołącz do rewolucji Tesla! Miliony zadowolonych właścicieli na całym świecie",
                    S: "Tesla - niezawodność i komfort. Spokojnie przejdź na elektryczną przyszłość",
                    C: "Tesla - najwyższe oceny bezpieczeństwa, najlepsza technologia, optymalne TCO"
                },
                keyBenefits: [
                    "Najnowsza technologia",
                    "Najwyższe bezpieczeństwo",
                    "Niskie koszty eksploatacji",
                    "Globalna sieć Supercharger",
                    "Wysoka wartość odsprzedaży",
                    "Ciągłe ulepszenia OTA"
                ],
                actionPlan: {
                    immediate: ["Podstawowe informacje o Tesla", "Test drive booking", "Kalkulator oszczędności"],
                    shortTerm: ["Test drive", "Prezentacja modeli", "Konsultacja z advisor"],
                    closing: ["Personalizowana oferta", "Opcje finansowania", "Delivery planning"]
                },
                contentPriority: ["general_benefits", "model_comparison", "basic_calculator", "testimonials"],
                communicationStyle: "balanced",
                urgencyLevel: "medium",
                followUpFrequency: "weekly"
            }
        };
    }

    // Personalizacja strategii na podstawie DISC
    personalizeForDISC(strategy, personality) {
        const personalizedStrategy = { ...strategy };
        
        personalizedStrategy.selectedMessage = strategy.primaryMessages[personality] || strategy.primaryMessages.S;
        
        // Dostosuj styl komunikacji
        switch(personality) {
            case 'D':
                personalizedStrategy.communicationTone = "direct_results_focused";
                personalizedStrategy.urgencyLevel = "high";
                personalizedStrategy.followUpFrequency = "daily";
                break;
            case 'I':
                personalizedStrategy.communicationTone = "enthusiastic_social";
                personalizedStrategy.urgencyLevel = "medium";
                personalizedStrategy.followUpFrequency = "every_other_day";
                break;
            case 'S':
                personalizedStrategy.communicationTone = "supportive_patient";
                personalizedStrategy.urgencyLevel = "low";
                personalizedStrategy.followUpFrequency = "weekly";
                break;
            case 'C':
                personalizedStrategy.communicationTone = "analytical_detailed";
                personalizedStrategy.urgencyLevel = "low";
                personalizedStrategy.followUpFrequency = "bi_weekly";
                break;
        }
        
        return personalizedStrategy;
    }

    // Wzmocnienie strategii triggerami
    enhanceWithTriggers(strategy, triggers) {
        const enhancedStrategy = { ...strategy };
        
        // Analiza kombinacji triggerów
        const triggerTypes = triggers.map(t => t.category || 'general');
        
        if (triggerTypes.includes('safety') && triggerTypes.includes('environmental')) {
            enhancedStrategy.combinedMessage = "Bezpieczna przyszłość dla rodziny + czysta planeta dla dzieci";
            enhancedStrategy.urgencyBonus = 15;
        }
        
        if (triggerTypes.includes('financial') && triggerTypes.includes('technical')) {
            enhancedStrategy.combinedMessage = "Najlepsza technologia + optymalne TCO = smart choice";
            enhancedStrategy.urgencyBonus = 10;
        }
        
        return enhancedStrategy;
    }

    // Dodanie modyfikatorów specyficznych dla segmentu
    addSegmentModifiers(strategy, segment, demographics) {
        const modifiedStrategy = { ...strategy };
        
        switch(segment) {
            case 'eco_family':
                if (demographics.hasPV === 'true') {
                    modifiedStrategy.pvSynergyBonus = 25;
                    modifiedStrategy.specialOffer = "Eco-Family Package: Tesla + PV optimization";
                }
                if (demographics.hasChildren === 'yes_young') {
                    modifiedStrategy.safetyPriorityBonus = 30;
                    modifiedStrategy.familyIncentive = "Family Safety Guarantee";
                }
                break;
                
            case 'tech_professional':
                modifiedStrategy.techEarlyAdopterBonus = 20;
                modifiedStrategy.specialOffer = "Tech Pioneer Package: Latest features first";
                break;
                
            case 'senior_comfort':
                modifiedStrategy.comfortPriorityBonus = 25;
                modifiedStrategy.specialOffer = "Senior Care Package: Extended support";
                break;
        }
        
        return modifiedStrategy;
    }

    // Generowanie spersonalizowanych następnych kroków
    generatePersonalizedNextSteps(strategy, segment, personality, demographics) {
        const baseSteps = strategy.actionPlan;
        const personalizedSteps = [];
        
        // Immediate actions
        baseSteps.immediate.forEach(step => {
            personalizedSteps.push({
                action: step,
                timing: "0-24h",
                priority: "high",
                channel: this.getPreferredChannel(personality),
                personalization: this.getPersonalizationForStep(step, demographics)
            });
        });
        
        // Short-term actions
        baseSteps.shortTerm.forEach(step => {
            personalizedSteps.push({
                action: step,
                timing: personality === 'D' ? "1-3 dni" : personality === 'C' ? "1-2 tygodnie" : "3-7 dni",
                priority: "medium",
                channel: this.getPreferredChannel(personality),
                personalization: this.getPersonalizationForStep(step, demographics)
            });
        });
        
        return personalizedSteps;
    }

    // Preferowany kanał komunikacji na podstawie DISC
    getPreferredChannel(personality) {
        const channels = {
            'D': 'phone', // Bezpośredni kontakt
            'I': 'video_call', // Interakcja społeczna
            'S': 'email', // Spokojny, przemyślany kontakt
            'C': 'email_with_attachments' // Szczegółowe informacje
        };
        return channels[personality] || 'email';
    }

    // Personalizacja kroków na podstawie demografii
    getPersonalizationForStep(step, demographics) {
        const personalizations = {
            "Kalkulator oszczędności PV + Tesla": demographics.hasPV === 'true' ? 
                "Kalkulator z Twoimi rzeczywistymi danymi PV" : 
                "Kalkulator z potencjałem PV dla Twojego domu",
            "Test drive z dziećmi": demographics.hasChildren === 'yes_young' ? 
                "Test drive z fotelkami dla dzieci" : 
                "Test drive z prezentacją przestronności",
            "Performance test drive": demographics.age === '18-25' ? 
                "Track day experience" : 
                "Professional performance demonstration"
        };
        
        return personalizations[step] || step;
    }
}

// ROZSZERZENIE GŁÓWNEJ KLASY CustomerDecoderEngine
// Dodać te metody do istniejącej klasy CustomerDecoderEngine

// Nowa metoda w CustomerDecoderEngine
analyzeCustomerWithSegmentation(customerData) {
    const segmentationEngine = new CustomerSegmentationEngine();
    
    // Podstawowa analiza (istniejąca funkcjonalność)
    const baseAnalysis = this.analyzeCustomer(customerData);
    
    // Identyfikacja segmentu
    const segmentInfo = segmentationEngine.identifyCustomerSegment(customerData.demographics);
    
    // Generowanie strategii dla segmentu
    const segmentStrategy = segmentationEngine.generateSegmentStrategy(
        segmentInfo.segment,
        customerData.demographics,
        customerData.triggers,
        baseAnalysis.personality?.detected?.DISC || 'S'
    );
    
    // Spersonalizowane następne kroki
    const personalizedSteps = segmentationEngine.generatePersonalizedNextSteps(
        segmentStrategy,
        segmentInfo.segment,
        baseAnalysis.personality?.detected?.DISC || 'S',
        customerData.demographics
    );
    
    // Połączenie z podstawową analizą
    return {
        ...baseAnalysis,
        segment_analysis: {
            identified_segment: segmentInfo.segment,
            segment_confidence: segmentInfo.confidence,
            priority_score: segmentInfo.priority_score,
            conversion_multiplier: segmentInfo.conversion_multiplier
        },
        segment_strategy: {
            ...segmentStrategy,
            personalized_next_steps: personalizedSteps
        },
        enhanced_conversion_probability: baseAnalysis.conversion_probability * segmentInfo.conversion_multiplier
    };
}

// Export dla użycia w innych plikach
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CustomerSegmentationEngine };
}