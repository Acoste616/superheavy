/**
 * Advanced Triggers Database for Tesla Customer Decoder SHU PRO
 * Hierarchical structure with micro-linguistic and behavioral signals
 * Version 2.1 - Enhanced with contextual data
 */

class AdvancedTriggersDatabase {
    constructor() {
        this.version = "2.0";
        this.lastUpdate = new Date().toISOString();
        
        // Polish Market Segments from waznedane.csv
        this.polishMarketSegments = {
            tech_innovators: {
                percentage: 18,
                avg_income: 25000,
                conversion_rate: 0.32,
                key_motivators: ['technology', 'innovation', 'status'],
                primary_models: ['Model S', 'Model X', 'Model 3 Performance']
            },
            eco_luxury: {
                percentage: 16,
                avg_income: 22000,
                conversion_rate: 0.28,
                key_motivators: ['sustainability', 'luxury', 'values'],
                primary_models: ['Model S', 'Model X']
            },
            performance_enthusiasts: {
                percentage: 15,
                avg_income: 20000,
                conversion_rate: 0.35,
                key_motivators: ['performance', 'acceleration', 'design'],
                primary_models: ['Model 3 Performance', 'Model S Plaid']
            },
            family_premium: {
                percentage: 22,
                avg_income: 18000,
                conversion_rate: 0.25,
                key_motivators: ['safety', 'space', 'reliability'],
                primary_models: ['Model Y', 'Model X']
            },
            business_fleet: {
                percentage: 14,
                avg_income: 30000,
                conversion_rate: 0.40,
                key_motivators: ['cost_efficiency', 'fleet_management'],
                primary_models: ['Model 3', 'Model Y']
            },
            young_professionals: {
                percentage: 15,
                avg_income: 15000,
                conversion_rate: 0.22,
                key_motivators: ['style', 'future_oriented', 'social_status'],
                primary_models: ['Model 3']
            }
        };
        
        // Competitive Brand Triggers (based on dane1.txt and dane2.csv)
        this.competitiveTriggers = {
            bmw_consideration: {
                triggers: [
                    "Rozważam BMW iX",
                    "BMW ma lepszą jakość wykonania",
                    "Wolę tradycyjną markę premium",
                    "BMW ma lepszy serwis"
                ],
                threat_level: 'high',
                counter_strategies: [
                    'technology_advantage',
                    'supercharger_network',
                    'ota_updates',
                    'total_cost_ownership'
                ],
                weight: 0.9
            },
            mercedes_consideration: {
                triggers: [
                    "Mercedes EQS wygląda luksusowo",
                    "Wolę Mercedes ze względu na komfort",
                    "EQC ma lepsze wnętrze",
                    "Mercedes to sprawdzona marka"
                ],
                threat_level: 'high',
                counter_strategies: [
                    'innovation_leadership',
                    'performance_advantage',
                    'value_proposition',
                    'future_proof_technology'
                ],
                weight: 0.9
            },
            audi_consideration: {
                triggers: [
                    "Audi e-tron ma quattro",
                    "Wolę design Audi",
                    "e-tron GT wygląda sportowo",
                    "Audi ma lepsze wnętrze"
                ],
                threat_level: 'medium',
                counter_strategies: [
                    'range_superiority',
                    'charging_speed',
                    'tech_features',
                    'autopilot_advantage'
                ],
                weight: 0.7
            },
            volvo_consideration: {
                triggers: [
                    "Volvo jest najbezpieczniejsze",
                    "XC40 Recharge ma ładny design",
                    "Volvo dba o środowisko",
                    "Skandynawski minimalizm"
                ],
                threat_level: 'medium',
                counter_strategies: [
                    'safety_parity',
                    'performance_advantage',
                    'technology_leadership',
                    'charging_infrastructure'
                ],
                weight: 0.6
            },
            polestar_consideration: {
                triggers: [
                    "Polestar 2 ma Google",
                    "Lubię skandynawski design",
                    "Polestar jest bardziej eko",
                    "Polestar 3 wygląda dobrze"
                ],
                threat_level: 'medium',
                counter_strategies: [
                    'supercharger_access',
                    'autopilot_superiority',
                    'brand_recognition',
                    'proven_technology'
                ],
                weight: 0.6
            }
        };
        
        // Decision Maker Tracking Triggers
        this.decisionMakerTriggers = {
            absent_decision_maker: {
                triggers: [
                    "Muszę to przedyskutować z żoną/mężem",
                    "Rodzice muszą to zaakceptować",
                    "To decyzja firmowa",
                    "Muszę się skonsultować"
                ],
                weight: 0.8,
                urgency_impact: -0.3,
                recommended_actions: [
                    'schedule_joint_meeting',
                    'provide_materials_for_discussion',
                    'offer_virtual_presentation'
                ]
            },
            multiple_influencers: {
                triggers: [
                    "Dzieci też mają zdanie",
                    "Współpracownicy radzą",
                    "Przyjaciele mają doświadczenie",
                    "Eksperci online twierdzą"
                ],
                weight: 0.6,
                urgency_impact: -0.2,
                recommended_actions: [
                    'provide_testimonials',
                    'expert_opinions',
                    'peer_references'
                ]
            }
        };
        
        // Hierarchical trigger structure
        this.triggerHierarchy = {
            obawy: {
                ladowanie: {
                    infrastruktura: [
                        {
                            text: "Nie mam garażu",
                            weight: 0.8,
                            personality_resonance: { S: 0.7, C: 0.5 },
                            conversion_impact: -0.3,
                            context_modifiers: {
                                "mieszka w bloku": 0.3,
                                "ma dzieci": 0.2
                            },
                            rebuttal_strategy: "home_charging_solutions",
                            urgency_level: "high"
                        },
                        {
                            text: "Gdzie będę ładować w trasie?",
                            weight: 0.6,
                            personality_resonance: { C: 0.8, S: 0.6 },
                            conversion_impact: -0.2,
                            context_modifiers: {
                                "często jeździ długie trasy": 0.4,
                                "pierwszy EV": 0.3
                            },
                            rebuttal_strategy: "supercharger_network",
                            urgency_level: "medium"
                        }
                    ],
                    czas_ladowania: [
                        {
                            text: "Jak długo trwa ładowanie?",
                            weight: 0.5,
                            personality_resonance: { D: 0.6, C: 0.7 },
                            conversion_impact: -0.1,
                            context_modifiers: {
                                "ma napięty harmonogram": 0.3,
                                "typ D": 0.2
                            },
                            rebuttal_strategy: "fast_charging_benefits",
                            urgency_level: "medium"
                        }
                    ]
                },
                finansowe: {
                    cena_zakupu: [
                        {
                            text: "To bardzo drogie",
                            weight: 0.9,
                            personality_resonance: { S: 0.8, C: 0.7 },
                            conversion_impact: -0.4,
                            context_modifiers: {
                                "pierwszy raz kupuje premium": 0.3,
                                "porównuje z ICE": 0.4
                            },
                            rebuttal_strategy: "tco_analysis",
                            urgency_level: "high"
                        },
                        {
                            text: "Czy to się opłaca?",
                            weight: 0.7,
                            personality_resonance: { C: 0.9, S: 0.6 },
                            conversion_impact: -0.2,
                            context_modifiers: {
                                "prowadzi firmę": 0.4,
                                "liczy koszty eksploatacji": 0.3
                            },
                            rebuttal_strategy: "roi_calculation",
                            urgency_level: "medium"
                        }
                    ],
                    finansowanie: [
                        {
                            text: "Jakie są opcje finansowania?",
                            weight: 0.6,
                            personality_resonance: { C: 0.7, S: 0.5 },
                            conversion_impact: 0.1,
                            context_modifiers: {
                                "nie ma pełnej kwoty": 0.4,
                                "rozważa leasing": 0.3
                            },
                            rebuttal_strategy: "financing_options",
                            urgency_level: "low"
                        }
                    ]
                },
                techniczne: {
                    zasieg: [
                        {
                            text: "Czy zasięg wystarczy?",
                            weight: 0.7,
                            personality_resonance: { S: 0.8, C: 0.6 },
                            conversion_impact: -0.2,
                            context_modifiers: {
                                "jeździ długie trasy": 0.4,
                                "mieszka poza miastem": 0.3
                            },
                            rebuttal_strategy: "range_confidence",
                            urgency_level: "medium"
                        }
                    ],
                    niezawodnosc: [
                        {
                            text: "Czy to niezawodne?",
                            weight: 0.6,
                            personality_resonance: { S: 0.9, C: 0.7 },
                            conversion_impact: -0.2,
                            context_modifiers: {
                                "pierwszy EV": 0.3,
                                "słyszał negatywne opinie": 0.4
                            },
                            rebuttal_strategy: "reliability_data",
                            urgency_level: "medium"
                        }
                    ]
                }
            },
            zainteresowanie: {
                technologia: {
                    autopilot: [
                        {
                            text: "Jak działa autopilot?",
                            weight: 0.8,
                            personality_resonance: { I: 0.7, C: 0.8 },
                            conversion_impact: 0.3,
                            context_modifiers: {
                                "tech enthusiast": 0.4,
                                "często jeździ autostradą": 0.3
                            },
                            rebuttal_strategy: "autopilot_demo",
                            urgency_level: "low"
                        }
                    ],
                    wydajnosc: [
                        {
                            text: "Jakie są osiągi?",
                            weight: 0.7,
                            personality_resonance: { D: 0.8, I: 0.6 },
                            conversion_impact: 0.2,
                            context_modifiers: {
                                "lubi szybką jazdę": 0.4,
                                "ma sportowe auto": 0.3
                            },
                            rebuttal_strategy: "performance_showcase",
                            urgency_level: "low"
                        }
                    ]
                },
                ekologia: {
                    srodowisko: [
                        {
                            text: "Chcę być eko",
                            weight: 0.6,
                            personality_resonance: { I: 0.7, S: 0.5 },
                            conversion_impact: 0.2,
                            context_modifiers: {
                                "ma panele PV": 0.4,
                                "świadomy ekologicznie": 0.3
                            },
                            rebuttal_strategy: "environmental_impact",
                            urgency_level: "low"
                        }
                    ]
                }
            }
        };
        
        // Micro-linguistic signals
        this.microLinguisticSignals = {
            wahania_i_przerwy: {
                "wahanie >3 sekundy": {
                    weight: 0.6,
                    personality_impact: { S: 0.15, uncertainty: 0.2 },
                    conversion_impact: -0.1,
                    context: "decision_difficulty",
                    recommended_action: "provide_reassurance"
                },
                "słowa typu 'chyba', 'może', 'prawdopodobnie'": {
                    weight: 0.7,
                    personality_impact: { S: 0.2, C: 0.1, uncertainty: 0.25 },
                    conversion_impact: -0.15,
                    context: "low_confidence",
                    recommended_action: "build_confidence"
                },
                "powtarzanie tego samego pytania": {
                    weight: 0.8,
                    personality_impact: { C: 0.2, confusion: 0.3 },
                    conversion_impact: -0.2,
                    context: "information_overload",
                    recommended_action: "simplify_explanation"
                },
                "długie pauzy przed odpowiedzią": {
                    weight: 0.5,
                    personality_impact: { S: 0.1, processing: 0.15 },
                    conversion_impact: -0.05,
                    context: "careful_consideration",
                    recommended_action: "give_time_to_process"
                }
            },
            tempo_i_rytm: {
                "mówi bardzo szybko": {
                    weight: 0.6,
                    personality_impact: { D: 0.2, I: 0.15, excitement: 0.2 },
                    conversion_impact: 0.1,
                    context: "high_energy",
                    recommended_action: "match_energy_level"
                },
                "mówi bardzo wolno i rozważnie": {
                    weight: 0.6,
                    personality_impact: { S: 0.2, C: 0.15, deliberation: 0.2 },
                    conversion_impact: 0.05,
                    context: "careful_decision_maker",
                    recommended_action: "provide_detailed_info"
                },
                "często przerywa": {
                    weight: 0.8,
                    personality_impact: { D: 0.25, impatience: 0.2 },
                    conversion_impact: 0.0,
                    context: "wants_control",
                    recommended_action: "let_them_lead"
                }
            },
            emocjonalne_markery: {
                "śmiech po wyjaśnieniu": {
                    weight: 0.7,
                    personality_impact: { I: 0.3, engagement: 0.25 },
                    conversion_impact: 0.2,
                    context: "positive_response",
                    recommended_action: "build_on_enthusiasm"
                },
                "westchnienie lub 'och'": {
                    weight: 0.6,
                    personality_impact: { S: 0.15, concern: 0.2 },
                    conversion_impact: -0.1,
                    context: "disappointment_or_concern",
                    recommended_action: "address_concern"
                },
                "podniesiony ton głosu": {
                    weight: 0.7,
                    personality_impact: { D: 0.2, frustration: 0.15 },
                    conversion_impact: -0.15,
                    context: "frustration_or_excitement",
                    recommended_action: "de_escalate_or_amplify"
                }
            }
        };
        
        // Behavioral signals
        this.behavioralSignals = {
            interakcja_ze_sprzedawca: {
                "przerywa sprzedawcę 2+ razy": {
                    weight: 0.8,
                    personality_impact: { D: 0.25, dominance: 0.2 },
                    conversion_impact: 0.1,
                    context: "wants_control",
                    recommended_action: "give_control_let_them_lead"
                },
                "zadaje bardzo szczegółowe pytania": {
                    weight: 0.7,
                    personality_impact: { C: 0.2, analysis: 0.15 },
                    conversion_impact: 0.15,
                    context: "analytical_buyer",
                    recommended_action: "provide_detailed_data"
                },
                "często kiwa głową i mówi 'tak, tak'": {
                    weight: 0.6,
                    personality_impact: { I: 0.15, S: 0.1, agreement: 0.2 },
                    conversion_impact: 0.2,
                    context: "positive_engagement",
                    recommended_action: "continue_current_approach"
                },
                "robi notatki podczas rozmowy": {
                    weight: 0.7,
                    personality_impact: { C: 0.25, S: 0.1, diligence: 0.2 },
                    conversion_impact: 0.1,
                    context: "serious_consideration",
                    recommended_action: "provide_written_materials"
                }
            },
            zaangazowanie: {
                "pyta o szczegóły techniczne": {
                    weight: 0.8,
                    personality_impact: { C: 0.3, I: 0.1, technical_interest: 0.25 },
                    conversion_impact: 0.2,
                    context: "technical_buyer",
                    recommended_action: "deep_technical_dive"
                },
                "pyta o opinie innych klientów": {
                    weight: 0.7,
                    personality_impact: { I: 0.2, S: 0.15, social_proof_need: 0.25 },
                    conversion_impact: 0.15,
                    context: "needs_social_validation",
                    recommended_action: "provide_testimonials"
                },
                "chce zobaczyć auto na żywo": {
                    weight: 0.9,
                    personality_impact: { S: 0.2, C: 0.15, tactile_learner: 0.3 },
                    conversion_impact: 0.3,
                    context: "hands_on_buyer",
                    recommended_action: "schedule_test_drive"
                }
            }
        };
        
        // Contextual data signals
        this.contextualSignals = {
            sytuacja_mieszkaniowa: {
                "mieszka w bloku": {
                    weight: 0.8,
                    impact: { charging_anxiety: 0.3, infrastructure_dependency: 0.2 },
                    conversion_impact: -0.2,
                    recommended_solutions: ["home_charging_consultation", "public_charging_map"],
                    urgency_modifier: 0.2
                },
                "ma dom z garażem": {
                    weight: 0.7,
                    impact: { charging_confidence: 0.3, convenience: 0.2 },
                    conversion_impact: 0.2,
                    recommended_solutions: ["home_charger_installation"],
                    urgency_modifier: -0.1
                },
                "ma panele fotowoltaiczne": {
                    weight: 0.9,
                    impact: { eco_synergy: 0.4, cost_savings: 0.3 },
                    conversion_impact: 0.3,
                    recommended_solutions: ["solar_ev_integration"],
                    urgency_modifier: -0.2
                }
            },
            sytuacja_rodzinna: {
                "ma dzieci": {
                    weight: 0.7,
                    impact: { safety_focus: 0.25, family_oriented: 0.2 },
                    conversion_impact: 0.1,
                    recommended_solutions: ["safety_features_demo", "family_benefits"],
                    urgency_modifier: 0.1
                },
                "planuje dzieci": {
                    weight: 0.6,
                    impact: { future_planning: 0.2, safety_consideration: 0.15 },
                    conversion_impact: 0.05,
                    recommended_solutions: ["long_term_value"],
                    urgency_modifier: -0.1
                }
            },
            sytuacja_zawodowa: {
                "prowadzi firmę": {
                    weight: 0.8,
                    impact: { business_focus: 0.3, tax_benefits: 0.25 },
                    conversion_impact: 0.2,
                    recommended_solutions: ["business_benefits", "tax_calculator"],
                    urgency_modifier: 0.1
                },
                "pracuje zdalnie": {
                    weight: 0.5,
                    impact: { low_mileage: 0.2, home_charging: 0.15 },
                    conversion_impact: 0.1,
                    recommended_solutions: ["low_mileage_benefits"],
                    urgency_modifier: -0.2
                },
                "często w delegacjach": {
                    weight: 0.7,
                    impact: { high_mileage: 0.3, charging_network_importance: 0.25 },
                    conversion_impact: 0.15,
                    recommended_solutions: ["supercharger_network", "business_mileage"],
                    urgency_modifier: 0.15
                }
            },
            doswiadczenie_motoryzacyjne: {
                "pierwszy samochód elektryczny": {
                    weight: 0.9,
                    impact: { education_needed: 0.4, uncertainty: 0.3 },
                    conversion_impact: -0.1,
                    recommended_solutions: ["ev_education", "myth_busting"],
                    urgency_modifier: 0.3
                },
                "miał już EV": {
                    weight: 0.8,
                    impact: { experience: 0.3, comparison_likely: 0.25 },
                    conversion_impact: 0.1,
                    recommended_solutions: ["tesla_advantages", "upgrade_benefits"],
                    urgency_modifier: -0.1
                },
                "ma samochód premium": {
                    weight: 0.7,
                    impact: { quality_expectations: 0.3, luxury_familiarity: 0.2 },
                    conversion_impact: 0.15,
                    recommended_solutions: ["premium_features", "luxury_comparison"],
                    urgency_modifier: 0.0
                }
            }
        };
    }
    
    /**
     * Get all triggers for a specific category path
     */
    getTriggersForCategory(categoryPath) {
        const pathParts = categoryPath.split('.');
        let current = this.triggerHierarchy;
        
        for (const part of pathParts) {
            if (current[part]) {
                current = current[part];
            } else {
                return [];
            }
        }
        
        return this.flattenTriggers(current);
    }
    
    /**
     * Find trigger data by text
     */
    findTriggerByText(triggerText) {
        if (!triggerText) return null;
        const allTriggers = this.getAllTriggers();
        return allTriggers.find(trigger => 
            trigger.text && (
                trigger.text.toLowerCase().includes(triggerText.toLowerCase()) ||
                triggerText.toLowerCase().includes(trigger.text.toLowerCase())
            )
        );
    }
    
    /**
     * Get micro-linguistic signal data
     */
    getMicroSignal(signalText) {
        if (!signalText) return null;
        for (const category of Object.values(this.microLinguisticSignals)) {
            for (const [signal, data] of Object.entries(category)) {
                if (signal && signalText && (
                    signal.toLowerCase().includes(signalText.toLowerCase()) ||
                    signalText.toLowerCase().includes(signal.toLowerCase())
                )) {
                    return { signal, ...data };
                }
            }
        }
        return null;
    }
    
    /**
     * Get behavioral signal data
     */
    getBehavioralSignal(signalText) {
        if (!signalText) return null;
        for (const category of Object.values(this.behavioralSignals)) {
            for (const [signal, data] of Object.entries(category)) {
                if (signal && signalText && (
                    signal.toLowerCase().includes(signalText.toLowerCase()) ||
                    signalText.toLowerCase().includes(signal.toLowerCase())
                )) {
                    return { signal, ...data };
                }
            }
        }
        return null;
    }
    
    /**
     * Get contextual signal data
     */
    getContextualSignal(signalText) {
        if (!signalText) return null;
        for (const category of Object.values(this.contextualSignals)) {
            for (const [signal, data] of Object.entries(category)) {
                if (signal && signalText && (
                    signal.toLowerCase().includes(signalText.toLowerCase()) ||
                    signalText.toLowerCase().includes(signal.toLowerCase())
                )) {
                    return { signal, ...data };
                }
            }
        }
        return null;
    }
    
    /**
     * Get all triggers flattened
     */
    getAllTriggers() {
        return this.flattenTriggers(this.triggerHierarchy);
    }
    
    /**
     * Helper method to flatten nested trigger structure
     */
    flattenTriggers(obj, path = '') {
        let triggers = [];
        
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (Array.isArray(value)) {
                // This is a trigger array
                triggers = triggers.concat(value.map(trigger => ({
                    ...trigger,
                    category_path: currentPath,
                    category: key
                })));
            } else if (typeof value === 'object') {
                // Recurse deeper
                triggers = triggers.concat(this.flattenTriggers(value, currentPath));
            }
        }
        
        return triggers;
    }
    
    /**
     * Get recommended actions for a signal
     */
    getRecommendedActions(signalText, signalType = 'trigger') {
        let signalData = null;
        
        switch (signalType) {
            case 'micro':
                signalData = this.getMicroSignal(signalText);
                break;
            case 'behavioral':
                signalData = this.getBehavioralSignal(signalText);
                break;
            case 'contextual':
                signalData = this.getContextualSignal(signalText);
                break;
            default:
                signalData = this.findTriggerByText(signalText);
        }
        
        if (signalData) {
            return {
                recommended_action: signalData.recommended_action || signalData.rebuttal_strategy,
                urgency_level: signalData.urgency_level || 'medium',
                solutions: signalData.recommended_solutions || []
            };
        }
        
        return null;
    }
    
    /**
     * Calculate combined signal impact
     */
    calculateCombinedImpact(signals) {
        let totalImpact = {
            conversion: 0,
            personality: { D: 0, I: 0, S: 0, C: 0 },
            urgency: 0,
            confidence: 0
        };
        
        signals.forEach(signal => {
            const triggerData = this.findTriggerByText(signal.text || signal);
            const microData = this.getMicroSignal(signal.text || signal);
            const behavioralData = this.getBehavioralSignal(signal.text || signal);
            const contextualData = this.getContextualSignal(signal.text || signal);
            
            // Aggregate impacts
            [triggerData, microData, behavioralData, contextualData].forEach(data => {
                if (data) {
                    totalImpact.conversion += data.conversion_impact || 0;
                    
                    if (data.personality_impact) {
                        Object.keys(data.personality_impact).forEach(key => {
                            if (['D', 'I', 'S', 'C'].includes(key)) {
                                totalImpact.personality[key] += data.personality_impact[key];
                            }
                        });
                    }
                    
                    if (data.personality_resonance) {
                        Object.keys(data.personality_resonance).forEach(key => {
                            if (['D', 'I', 'S', 'C'].includes(key)) {
                                totalImpact.personality[key] += data.personality_resonance[key];
                            }
                        });
                    }
                    
                    totalImpact.urgency += data.urgency_modifier || 0;
                    totalImpact.confidence += data.weight || 0.5;
                }
            });
        });
        
        return totalImpact;
    }
    
    /**
     * CUSTOMER DECODER ENGINE 2.0 - NEW METHODS
     */
    
    /**
     * Identify Polish market segment based on customer data
     */
    identifyPolishSegment(customerData) {
        const income = customerData.income || 0;
        const motivators = customerData.motivators || [];
        const interestedModels = customerData.interestedModels || [];
        
        let bestMatch = null;
        let highestScore = 0;
        
        Object.entries(this.polishMarketSegments).forEach(([segmentKey, segment]) => {
            let score = 0;
            
            // Income alignment (40% weight)
            const incomeScore = Math.max(0, 100 - Math.abs(income - segment.avg_income) / segment.avg_income * 100);
            score += incomeScore * 0.4;
            
            // Motivator alignment (35% weight)
            const motivatorMatches = motivators.filter(m => 
                segment.key_motivators.some(km => m.toLowerCase().includes(km.toLowerCase()))
            ).length;
            score += (motivatorMatches / Math.max(1, segment.key_motivators.length)) * 35;
            
            // Model interest alignment (25% weight)
            const modelMatches = interestedModels.filter(model => 
                segment.primary_models.some(pm => model.includes(pm.split(' ')[1]))
            ).length;
            score += (modelMatches / Math.max(1, interestedModels.length)) * 25;
            
            if (score > highestScore) {
                highestScore = score;
                bestMatch = {
                    segment: segmentKey,
                    ...segment,
                    confidence: score / 100,
                    match_score: score
                };
            }
        });
        
        return bestMatch || { segment: 'unknown', confidence: 0 };
    }
    
    /**
     * Detect competitive brand mentions and threats
     */
    detectCompetitiveThreat(customerText) {
        const threats = [];
        
        Object.entries(this.competitiveTriggers).forEach(([brand, data]) => {
            data.triggers.forEach(trigger => {
                if (customerText.toLowerCase().includes(trigger.toLowerCase())) {
                    threats.push({
                        brand: brand.replace('_consideration', ''),
                        trigger: trigger,
                        threat_level: data.threat_level,
                        weight: data.weight,
                        counter_strategies: data.counter_strategies,
                        confidence: this.calculateTriggerConfidence(customerText, trigger)
                    });
                }
            });
        });
        
        return threats.sort((a, b) => b.weight - a.weight);
    }
    
    /**
     * Detect decision maker status
     */
    detectDecisionMakerStatus(customerText) {
        const signals = [];
        
        Object.entries(this.decisionMakerTriggers).forEach(([type, data]) => {
            data.triggers.forEach(trigger => {
                if (customerText.toLowerCase().includes(trigger.toLowerCase())) {
                    signals.push({
                        type,
                        trigger,
                        weight: data.weight,
                        urgency_impact: data.urgency_impact,
                        recommended_actions: data.recommended_actions,
                        confidence: this.calculateTriggerConfidence(customerText, trigger)
                    });
                }
            });
        });
        
        return signals;
    }
    
    /**
     * Calculate trigger confidence based on context
     */
    calculateTriggerConfidence(text, trigger) {
        const triggerWords = trigger.toLowerCase().split(' ');
        const textWords = text.toLowerCase().split(' ');
        
        let matchCount = 0;
        triggerWords.forEach(word => {
            if (textWords.some(tw => tw.includes(word) || word.includes(tw))) {
                matchCount++;
            }
        });
        
        return Math.min(1.0, matchCount / triggerWords.length);
    }
    
    /**
     * Get segment-specific recommendations
     */
    getSegmentRecommendations(segmentKey) {
        const segment = this.polishMarketSegments[segmentKey];
        if (!segment) return null;
        
        const recommendations = {
            tech_innovators: {
                focus_areas: ['autopilot_demo', 'ota_updates', 'tech_specs'],
                messaging: 'cutting_edge_technology',
                models_to_highlight: ['Model S', 'Model X'],
                key_features: ['autopilot', 'performance', 'tech_integration']
            },
            eco_luxury: {
                focus_areas: ['sustainability', 'luxury_features', 'environmental_impact'],
                messaging: 'sustainable_luxury',
                models_to_highlight: ['Model S', 'Model X'],
                key_features: ['eco_credentials', 'premium_interior', 'solar_integration']
            },
            performance_enthusiasts: {
                focus_areas: ['acceleration', 'track_mode', 'performance_specs'],
                messaging: 'ultimate_performance',
                models_to_highlight: ['Model 3 Performance', 'Model S Plaid'],
                key_features: ['ludicrous_mode', 'track_performance', 'racing_features']
            },
            family_premium: {
                focus_areas: ['safety_features', 'space_utility', 'family_benefits'],
                messaging: 'family_safety_first',
                models_to_highlight: ['Model Y', 'Model X'],
                key_features: ['safety_rating', 'cargo_space', 'child_safety']
            },
            business_fleet: {
                focus_areas: ['tco_analysis', 'fleet_management', 'tax_benefits'],
                messaging: 'business_efficiency',
                models_to_highlight: ['Model 3', 'Model Y'],
                key_features: ['low_maintenance', 'fleet_software', 'business_incentives']
            },
            young_professionals: {
                focus_areas: ['style_design', 'social_status', 'future_tech'],
                messaging: 'future_forward_lifestyle',
                models_to_highlight: ['Model 3'],
                key_features: ['modern_design', 'app_integration', 'social_features']
            }
        };
        
        return recommendations[segmentKey] || null;
    }
    
    /**
     * Generate competitive response strategy
     */
    generateCompetitiveResponse(competitorBrand, customerSegment) {
        const competitorData = this.competitiveTriggers[`${competitorBrand}_consideration`];
        const segmentData = this.polishMarketSegments[customerSegment];
        
        if (!competitorData || !segmentData) return null;
        
        return {
            competitor: competitorBrand,
            threat_level: competitorData.threat_level,
            counter_strategies: competitorData.counter_strategies,
            segment_specific_approach: this.getSegmentRecommendations(customerSegment),
            key_differentiators: this.getKeyDifferentiators(competitorBrand),
            recommended_actions: this.getCompetitiveActions(competitorBrand, customerSegment)
        };
    }
    
    /**
     * Get key differentiators vs competitor
     */
    getKeyDifferentiators(competitor) {
        const differentiators = {
            bmw: [
                'Supercharger network access',
                'Over-the-air updates',
                'Advanced Autopilot technology',
                'Better total cost of ownership'
            ],
            mercedes: [
                'Innovation leadership',
                'Superior performance metrics',
                'Better value proposition',
                'Future-proof technology stack'
            ],
            audi: [
                'Superior range capabilities',
                'Faster charging speeds',
                'More advanced tech features',
                'Autopilot advantage'
            ],
            volvo: [
                'Comparable safety ratings',
                'Better performance',
                'Technology leadership',
                'Extensive charging infrastructure'
            ],
            polestar: [
                'Supercharger network access',
                'Superior Autopilot technology',
                'Stronger brand recognition',
                'Proven EV technology'
            ]
        };
        
        return differentiators[competitor] || [];
    }
    
    /**
     * Get competitive actions based on competitor and segment
     */
    getCompetitiveActions(competitor, segment) {
        return {
            immediate: [
                'Highlight Tesla advantages',
                'Provide comparison data',
                'Schedule test drive'
            ],
            follow_up: [
                'Send competitive analysis',
                'Arrange expert consultation',
                'Provide customer testimonials'
            ],
            long_term: [
                'Monitor competitor activities',
                'Update value proposition',
                'Enhance customer experience'
            ]
        };
    }

    /**
     * Main analyze method for TriggerDetectionEngine compatibility
     */
    analyze(customerData, triggers = []) {
        const analysis = {
            detected: [],
            patterns: [],
            confidence: 0,
            micro_signals: [],
            behavioral_signals: [],
            contextual_signals: [],
            competitive_threats: [],
            decision_maker_status: [],
            polish_segment: null
        };

        try {
            // Analyze selected triggers if any
            if (customerData.selectedTriggers && customerData.selectedTriggers.length > 0) {
                customerData.selectedTriggers.forEach(triggerText => {
                    const triggerData = this.findTriggerByText(triggerText);
                    if (triggerData) {
                        analysis.detected.push({
                            text: triggerText,
                            data: triggerData,
                            confidence: 0.8
                        });
                    }
                });
            }

            // Analyze context if provided
            const context = customerData.context || '';
            if (context) {
                // Detect competitive threats
                analysis.competitive_threats = this.detectCompetitiveThreat(context);
                
                // Detect decision maker status
                analysis.decision_maker_status = this.detectDecisionMakerStatus(context);
            }

            // Identify Polish market segment
            analysis.polish_segment = this.identifyPolishSegment(customerData);

            // Calculate overall confidence
            analysis.confidence = analysis.detected.length > 0 ? 0.7 : 0.3;

        } catch (error) {
            console.warn('AdvancedTriggersDatabase analyze error:', error);
            // Return safe fallback
            analysis.confidence = 0.1;
        }

        return analysis;
    }
}

module.exports = AdvancedTriggersDatabase;