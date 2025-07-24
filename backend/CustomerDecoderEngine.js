/**
 * Customer Decoder Engine - Backend Module
 * Enhanced version of the frontend logic engine with server-side capabilities
 */

const fs = require('fs').promises;
const path = require('path');
const FuzzyInferenceEngine = require('../services/fuzzy-inference-service/engine.js');
const AdvancedTriggersDatabase = require('./AdvancedTriggersDatabase');
const TransparencyEngine = require('./transparencyengine.js');
const AnalysisHistoryManager = require('./AnalysisHistoryManager');
const APIManager = require('./APIManager');
const DataValidator = require('./DataValidator');
const CustomerAnalysisEngine = require('../services/customer-analysis-service/engine.js');
const TriggerDetectionEngine = require('../services/trigger-detection-service/engine.js');
const ScoringAggregationEngine = require('../services/scoring-aggregation-service/engine.js');
const RecommendationEngine = require('../services/recommendation-engine/engine.js');
const AdviceSnippets = require('../shared/strategies/advice_snippets');

// Import Customer Segmentation Engine
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

    identifyCustomerSegment(demographics) {
        const scores = {};
        
        for (const [segmentName, definition] of Object.entries(this.segmentDefinitions)) {
            scores[segmentName] = this.calculateSegmentMatch(demographics, definition.criteria);
        }

        const bestMatch = Object.entries(scores)
            .filter(([_, score]) => score > 0.6)
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
                    "ROI 15-20% rocznie z kombinacji PV + Tesla"
                ],
                communicationStyle: "family_focused",
                urgencyLevel: "medium"
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
                    "Autopilot - przyszłość już dziś"
                ],
                communicationStyle: "tech_focused",
                urgencyLevel: "high"
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
                    "Globalna sieć Supercharger"
                ],
                communicationStyle: "balanced",
                urgencyLevel: "medium"
            }
        };
    }

    generateSegmentStrategy(segment, demographics, triggers, personality) {
        const strategy = this.segmentStrategies[segment] || this.segmentStrategies.general;
        const personalizedStrategy = { ...strategy };
        
        personalizedStrategy.selectedMessage = strategy.primaryMessages[personality] || strategy.primaryMessages.S;
        
        // Dostosuj styl komunikacji na podstawie DISC
        switch(personality) {
            case 'D':
                personalizedStrategy.communicationTone = "direct_results_focused";
                personalizedStrategy.urgencyLevel = "high";
                break;
            case 'I':
                personalizedStrategy.communicationTone = "enthusiastic_social";
                personalizedStrategy.urgencyLevel = "medium";
                break;
            case 'S':
                personalizedStrategy.communicationTone = "supportive_patient";
                personalizedStrategy.urgencyLevel = "low";
                break;
            case 'C':
                personalizedStrategy.communicationTone = "analytical_detailed";
                personalizedStrategy.urgencyLevel = "low";
                break;
        }
        
        return personalizedStrategy;
    }
}

class CustomerDecoderEngine {
    constructor() {
        this.data = {};
        // ENHANCED WEIGHTS 2.0 - Based on Polish market research (waznedane.csv)
        this.weights = {
            // Core predictive factors from dane1.txt research
            home_work_charging: 0.20,        // Highest predictor (weight 10)
            daily_commute: 0.18,             // Weight 9 - TCO calculation base
            competitor_consideration: 0.16,   // Weight 9 - Serious buyer signal
            financing_questions: 0.14,       // Weight 8 - Purchase intent
            main_motivator: 0.12,            // Weight 8 - Segmentation key
            purchase_timeline: 0.10,         // Weight 8 - Urgency indicator
            decision_maker_present: 0.10     // Weight 7 - Process advancement
        };
        
        // Tesla Archetypes System
        this.teslaArchetypes = null;
        this.archetypeResponses = null;
        
        // Polish market segments from waznedane.csv
        this.polishSegments = {
            'tech_innovators': { percentage: 28, income: 180000, conversion: 0.32, models: ['Model S', 'Cybertruck'] },
            'eco_luxury': { percentage: 23, income: 160000, conversion: 0.28, models: ['Model S', 'Model X'] },
            'performance_enthusiasts': { percentage: 19, income: 195000, conversion: 0.35, models: ['Model S Plaid', 'Roadster'] },
            'family_premium': { percentage: 15, income: 145000, conversion: 0.25, models: ['Model Y', 'Model X'] },
            'business_fleet': { percentage: 10, income: 120000, conversion: 0.18, models: ['Model 3', 'Model Y'] },
            'young_professionals': { percentage: 5, income: 85000, conversion: 0.15, models: ['Model 3', 'Model Y'] }
        };
        this.initialized = false;
        this.marketData = {};
        this.version = "2.1";
        this.complianceMode = true;
        
        // Initialize new engines
        this.fuzzyEngine = new FuzzyInferenceEngine();
        this.advancedTriggers = new AdvancedTriggersDatabase();
        this.transparencyEngine = new TransparencyEngine();
        this.historyManager = new AnalysisHistoryManager();
        this.apiManager = new APIManager();
        this.dataValidator = new DataValidator();
        this.customerAnalysisEngine = new CustomerAnalysisEngine();
        this.triggerDetectionEngine = new TriggerDetectionEngine();
        this.scoringAggregationEngine = new ScoringAggregationEngine();
        this.recommendationEngine = new RecommendationEngine();
        this.segmentationEngine = new CustomerSegmentationEngine();
        
        // Conversion history for ML-style learning
        this.conversionHistory = [];
    }

    async initialize(dataFiles) {
        try {
            console.log('🔧 Initializing Customer Decoder Engine...');
            
            // Load all data files
            for (const [key, filePath] of Object.entries(dataFiles)) {
                try {
                    const fullPath = path.join(__dirname, '..', filePath);
                    const fileContent = await fs.readFile(fullPath, 'utf8');
                    this.data[key] = JSON.parse(fileContent);
                    console.log(`✅ Loaded ${key} from ${filePath}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to load ${key} from ${filePath}:`, error.message);
                    this.data[key] = {};
                }
            }
            
            // Load Tesla Archetypes System
            try {
                const archetypesPath = path.join(__dirname, '..', 'data/tesla_archetypes.json');
                const archetypesContent = await fs.readFile(archetypesPath, 'utf8');
                this.teslaArchetypes = JSON.parse(archetypesContent);
                console.log('✅ Tesla Archetypes loaded successfully');
                
                const responsesPath = path.join(__dirname, '..', 'data/archetype_responses.json');
                const responsesContent = await fs.readFile(responsesPath, 'utf8');
                this.archetypeResponses = JSON.parse(responsesContent);
                console.log('✅ Archetype Responses loaded successfully');
            } catch (error) {
                console.warn('⚠️ Tesla Archetypes system not found:', error.message);
                this.teslaArchetypes = { archetypes: {}, archetype_detection_rules: {} };
                this.archetypeResponses = { responses: {}, response_selection_rules: {} };
            }
            
            // Load market data 2025
            try {
                const marketDataPath = path.join(__dirname, '..', 'data/market_data_2025.json');
                const marketContent = await fs.readFile(marketDataPath, 'utf8');
                this.marketData = JSON.parse(marketContent);
                console.log('✅ Market Data 2025 loaded successfully');
            } catch (error) {
                console.warn('⚠️ Market Data 2025 not found, using fallback data');
                this.marketData = this.getFallbackMarketData();
            }
            
            // Initialize history manager
            await this.historyManager.initialize();

            // Initialize the new Fuzzy Inference Engine
            await this.fuzzyEngine.initialize('config/fuzzy-rules');

            // Initialize the new Customer Analysis Engine
            await this.customerAnalysisEngine.initialize({ 
                personas: this.data.personas,
                triggers: this.data.triggers
            });

            // Initialize the new Trigger Detection Engine
            await this.triggerDetectionEngine.initialize({ 
                triggers: this.data.triggers
            });

            // Initialize the new Scoring Aggregation Engine
            await this.scoringAggregationEngine.initialize({
                weights: this.data.weights_and_scoring,
                polishSegments: this.polishSegments
            });

            // Initialize the new Recommendation Engine
            await this.recommendationEngine.initialize({
                personas: this.data.personas,
                strategies: this.data.strategies,
                cheatsheet: this.data.cheatsheet
            });
            
            this.initialized = true;
            console.log(`✅ Customer Decoder Engine ${this.version} initialized`);
            console.log(`📊 Analysis History Manager ready - Current counter: ${this.historyManager.counter}`);
            
        } catch (error) {
            console.error('❌ Engine initialization failed:', error);
            throw error;
        }
    }

    async analyzeCustomer(inputData) {
        try {
            if (!this.initialized) {
                throw new Error('Engine not initialized');
            }

            console.log('Analyzing customer with input:', JSON.stringify(inputData, null, 2));
            
            // Walidacja danych wejściowych
            const validation = this.dataValidator.validateCustomerData(inputData);
            if (!validation.isValid) {
                throw new Error(`Błędy walidacji: ${validation.errors.join(', ')}`);
            }
            
            // Użyj oczyszczonych danych
            const cleanInputData = validation.cleanData;
            
            // Pobierz dane rynkowe w czasie rzeczywistym
            let realTimeMarketData = null;
            try {
                realTimeMarketData = await this.apiManager.getMarketData(cleanInputData.city || 'Warsaw');
                console.log('✅ Real-time market data loaded:', realTimeMarketData);
            } catch (error) {
                console.warn('⚠️ Failed to load real-time data, using fallback:', error.message);
            }

            // Perform core customer analysis using the new microservice
            const coreAnalysis = this.customerAnalysisEngine.analyze(cleanInputData);

            // Enhanced analysis with fuzzy logic and fallback
            // Map triggers to personality resonance scores
            const personalityTraits = this.mapTriggersToPersonalityTraits(cleanInputData.selectedTriggers);
            const fuzzyPersonalityAnalysis = this.fuzzyEngine.analyzeFuzzyPersonality({
                personality_traits: personalityTraits
            });
            
            // Perform trigger analysis using the new microservice
            const triggerAnalysis = this.triggerDetectionEngine.analyze(cleanInputData);
            const temporalAnalysis = this.analyzeTemporalContext(inputData);

            // Perform customer segmentation analysis
            const segmentAnalysis = this.segmentationEngine.identifyCustomerSegment(coreAnalysis.demographics.data || {});
            const segmentStrategy = this.segmentationEngine.generateSegmentStrategy(
                segmentAnalysis.segment,
                coreAnalysis.demographics.data || {},
                triggerAnalysis,
                coreAnalysis.personality.dominant_type || 'S'
            );
            
            // Tesla Archetypes Detection and Response Generation
            const teslaArchetypeAnalysis = this.detectTeslaArchetype(
                coreAnalysis.personality,
                cleanInputData.selectedTriggers || [],
                coreAnalysis.demographics.data || {}
            );
            
            const archetypeResponse = this.generateArchetypeResponse(
                teslaArchetypeAnalysis.archetype,
                coreAnalysis.personality,
                cleanInputData.selectedTriggers || [],
                {
                    segment: segmentAnalysis.segment,
                    demographics: coreAnalysis.demographics.data
                }
            );

            const analysis = {
                timestamp: new Date().toISOString(),
                input: inputData,
                personality: coreAnalysis.personality,
                fuzzy_personality: fuzzyPersonalityAnalysis,
                triggers: triggerAnalysis,
                tone: coreAnalysis.tone,
                demographics: coreAnalysis.demographics,
                subtypeId: coreAnalysis.subtypeId,
                temporal_analysis: temporalAnalysis,
                segment: {
                    analysis: segmentAnalysis,
                    strategy: segmentStrategy
                },
                tesla_archetype: {
                    analysis: teslaArchetypeAnalysis,
                    response: archetypeResponse
                },
                scores: {},
                recommendations: {},
                strategy: {},
                warnings: [],
                confidence: 0
            };

            // Calculate scores using the new microservice
            analysis.scores = this.scoringAggregationEngine.calculateAdvancedScoring2025(analysis, realTimeMarketData);

            // Calculate confidence using the new microservice
            analysis.confidence = this.scoringAggregationEngine.calculateConfidence(analysis);

            // Generate recommendations using the new microservice
            analysis.recommendations = this.recommendationEngine.generateEnhancedRecommendations(analysis);

            const firstCategory = Object.keys(triggerAnalysis.categories || {})[0] || 'other';
            const disc = coreAnalysis.personality.detected?.DISC;
            const snippetArr = AdviceSnippets.getSnippets(coreAnalysis.subtypeId, disc, firstCategory);
            const snippetUsed = snippetArr[0] || null;
            analysis.adviceSnippetUsed = snippetUsed;

            // Select strategy
            analysis.strategy = this.recommendationEngine.selectStrategy(analysis);
            
            // Generate ethical warnings with AI Guard-Rails
            analysis.warnings = this.generateWarnings(analysis);
            analysis.compliance = this.applyAIGuardRails(analysis);

            // Add transparency report
            analysis.transparency_report = this.transparencyEngine.explainDecision({
                fuzzy_personality: fuzzyPersonalityAnalysis,
                conversion_probability: analysis.scores.enhanced_total,
                confidence: analysis.confidence,
                triggers: triggerAnalysis,
                recommendations: analysis.recommendations,
                personality: coreAnalysis.personality,
                subtypeId: coreAnalysis.subtypeId,
                adviceSnippetUsed: snippetUsed
            });

            // Add session tracking
            analysis.session_id = inputData.sessionId || this.generateSessionId();

            // Save analysis to history with unique number
            const startTime = Date.now();
            const savedAnalysis = await this.historyManager.saveAnalysis(analysis, {
                userAgent: inputData.userAgent || 'unknown',
                ipHash: inputData.ipHash || 'unknown',
                source: inputData.source || 'web_interface',
                processingTime: Date.now() - startTime
            });
            
            // Add analysis number to response
            analysis.analysis_number = savedAnalysis.analysisNumber;
            analysis.can_return_to = true;
            
            // Ensure conversion_probability is set for frontend compatibility
            analysis.conversion_probability = analysis.scores?.enhanced_total || analysis.scores?.total || 50;

            console.log(`Enhanced analysis #${savedAnalysis.analysisNumber} complete:`, JSON.stringify(analysis, null, 2));
            return analysis;

        } catch (error) {
            console.error('Error in analyzeCustomer:', error);
            throw new Error(`Analysis failed: ${error.message}`);
        }
    }











    generateWarnings(analysis) {
        const warnings = [];
        const scores = analysis.scores;

        if (scores.total < 30) {
            warnings.push({
                type: 'low_conversion_probability',
                severity: 'high',
                message: 'Bardzo niska prawdopodobieństwo konwersji. Wymaga dodatkowej analizy i indywidualnego podejścia.'
            });
        }

        if (analysis.triggers.count < 2) {
            warnings.push({
                type: 'insufficient_data',
                severity: 'medium',
                message: 'Zbyt mało triggerów do pełnej analizy. Przeprowadź dłuższą rozmowę z klientem.'
            });
        }

        return warnings;
    }

    calculateConfidence(analysis) {
        let confidence = 50; // Base confidence
        
        // Data quality factors
        const triggerCount = analysis.triggers?.count || 0;
        const demographicCompleteness = Object.keys(analysis.demographics?.data || {}).length;
        
        // Trigger quality bonus
        if (triggerCount >= 3) confidence += 15;
        if (triggerCount >= 5) confidence += 10;
        
        // Demographic data bonus
        if (demographicCompleteness >= 3) confidence += 10;
        if (demographicCompleteness >= 5) confidence += 5;
        
        // Personality clarity bonus
        if (analysis.personality?.clarity > 0.7) confidence += 15;
        
        // Fuzzy personality confidence bonus
        if (analysis.fuzzy_personality?.confidence > 60) confidence += 10;
        if (analysis.fuzzy_personality?.is_pure_type) confidence += 5;
        
        // Tone analysis bonus
        if (analysis.tone?.detected) confidence += 5;
        
        // Market data availability bonus
        if (analysis.demographics?.region && this.marketData.regions?.[analysis.demographics.region]) {
            confidence += 10;
        }
        
        // Advanced triggers bonus
        if (analysis.advanced_triggers?.micro_signals?.length > 0) confidence += 8;
        if (analysis.advanced_triggers?.behavioral_signals?.length > 0) confidence += 7;
        
        return Math.min(95, Math.max(20, confidence));
    }
    
    /**
     * Analyze advanced triggers using the new database
     */
    analyzeAdvancedTriggers(inputData) {
        const analysis = {
            hierarchical_triggers: [],
            micro_signals: [],
            behavioral_signals: [],
            contextual_signals: [],
            combined_impact: null,
            recommendations: []
        };
        
        // Process selected triggers through advanced database
        if (inputData.selectedTriggers) {
            inputData.selectedTriggers.forEach(triggerText => {
                const triggerData = this.advancedTriggers.findTriggerByText(triggerText);
                if (triggerData) {
                    analysis.hierarchical_triggers.push({
                        text: triggerText,
                        category_path: triggerData.category_path,
                        weight: triggerData.weight,
                        personality_resonance: triggerData.personality_resonance,
                        conversion_impact: triggerData.conversion_impact,
                        urgency_level: triggerData.urgency_level
                    });
                }
            });
        }
        
        // Process micro-signals if provided
        if (inputData.microSignals) {
            inputData.microSignals.forEach(signal => {
                const signalData = this.advancedTriggers.getMicroSignal(signal);
                if (signalData) {
                    analysis.micro_signals.push(signalData);
                }
            });
        }
        
        // Process behavioral signals if provided
        if (inputData.behavioralSignals) {
            inputData.behavioralSignals.forEach(signal => {
                const signalData = this.advancedTriggers.getBehavioralSignal(signal);
                if (signalData) {
                    analysis.behavioral_signals.push(signalData);
                }
            });
        }
        
        // Process contextual signals if provided
        if (inputData.contextualSignals) {
            inputData.contextualSignals.forEach(signal => {
                const signalData = this.advancedTriggers.getContextualSignal(signal);
                if (signalData) {
                    analysis.contextual_signals.push(signalData);
                }
            });
        }
        
        // Calculate combined impact
        const allSignals = [
            ...analysis.hierarchical_triggers,
            ...analysis.micro_signals,
            ...analysis.behavioral_signals,
            ...analysis.contextual_signals
        ];
        
        analysis.combined_impact = this.advancedTriggers.calculateCombinedImpact(allSignals);
        
        // Generate recommendations based on signals
        allSignals.forEach(signal => {
            const recommendations = this.advancedTriggers.getRecommendedActions(signal.text || signal.signal);
            if (recommendations) {
                analysis.recommendations.push(recommendations);
            }
        });
        
        return analysis;
    }
    
    /**
     * Map triggers to personality traits for fuzzy analysis
     */
    mapTriggersToPersonalityTraits(selectedTriggers) {
        const personalityTraits = [];
        
        if (!selectedTriggers || !Array.isArray(selectedTriggers)) {
            return personalityTraits;
        }
        
        // Load trigger_list.json for mapping
        const triggerList = this.data.trigger_list || { triggers: [] };
        
        selectedTriggers.forEach(triggerText => {
            // Find trigger in trigger_list.json by name
            const trigger = triggerList.triggers.find(t => t.name === triggerText);
            if (trigger) {
                // Map trigger categories to DISC personality traits
                const categoryToDiscMapping = {
                    'financial': ['C', 'S'], // Cost-conscious, Security-focused
                    'values': ['I', 'S'], // Social influence, Stability
                    'technical': ['C', 'D'], // Data-focused, Results-oriented
                    'practical': ['C', 'S'], // Analytical, Security
                    'business': ['D', 'C'], // Dominance, Data-focused
                    'competitive': ['D', 'C'], // Dominance, Analytical
                    'safety': ['S', 'C'], // Security, Careful analysis
                    'social': ['I', 'D'], // Influence, Status
                    'behavioral': ['D', 'C'], // Decisive, Research-oriented
                    'psychological': ['S', 'I'], // Stability, Influence
                    'timing': ['C', 'S'] // Careful planning, Security
                };
                
                const discTypes = categoryToDiscMapping[trigger.category] || ['S'];
                
                // Map DISC types to abstract trait names
                const traitMapping = {
                    'D': 'dominance',
                    'I': 'social_proof', 
                    'S': 'security',
                    'C': 'data_focus'
                };
                
                discTypes.forEach(discType => {
                    const traitName = traitMapping[discType];
                    if (traitName) {
                        // Add trait based on base_conversion strength
                        const strength = trigger.base_conversion || 50;
                        const repetitions = Math.ceil(strength / 30); // 30-60 = 1-2 times, 60+ = 2-3 times
                        for (let i = 0; i < repetitions; i++) {
                            personalityTraits.push(traitName);
                        }
                    }
                });
            }
        });
        
        console.log('🎯 Mapped triggers to personality traits:', personalityTraits);
        return personalityTraits;
    }

    /**
     * Analyze temporal context of triggers
     */
    analyzeTemporalContext(inputData) {
        if (!inputData.triggersWithTimestamps) {
            return {
                early_signals: [],
                mid_signals: [],
                late_signals: [],
                temporal_patterns: {},
                analysis_available: false
            };
        }
        
        return this.fuzzyEngine.analyzeTemporalContext(inputData.triggersWithTimestamps);
    }
    
    /**
     * Enhanced conversion probability calculation
     */
    calculateEnhancedConversionProbability(triggerScore, personalityScore, toneScore, demographicScore, fuzzyPersonality, advancedTriggers) {
        // Base calculation
        let probability = (triggerScore * 0.3 + personalityScore * 0.25 + toneScore * 0.2 + demographicScore * 0.25);
        
        // Fuzzy personality adjustments
        if (fuzzyPersonality) {
            const dominantConfidence = fuzzyPersonality.confidence / 100;
            probability *= (0.8 + dominantConfidence * 0.4); // Boost for clear personality
            
            if (fuzzyPersonality.is_hybrid) {
                probability *= 0.95; // Slight penalty for unclear personality
            }
        }
        
        // Advanced triggers impact
        if (advancedTriggers && advancedTriggers.combined_impact) {
            probability += advancedTriggers.combined_impact.conversion * 10;
        }
        
        // Dynamic weight learning (simplified)
        if (this.conversionHistory.length > 10) {
            const recentPerformance = this.calculateRecentPerformance();
            probability *= recentPerformance;
        }
        
        return Math.max(5, Math.min(95, probability));
    }
    
    /**
     * Enhanced recommendations generation with integrated reasoning
     */
    generateEnhancedRecommendations(inputData, fuzzyPersonality, advancedTriggers) {
        const recommendations = {
            language: [],
            strategy: [],
            objection_handling: [],
            next_steps: [],
            micro_adjustments: [],
            transparency_notes: []
        };
        
        // Base recommendations from fuzzy personality
        if (fuzzyPersonality) {
            const dominantType = fuzzyPersonality.dominant_type;
            
            // Language recommendations with reasoning
            const languageItems = this.getLanguageForPersonality(dominantType, fuzzyPersonality.confidence);
            recommendations.language = languageItems.map(item => ({
                recommendation: item,
                reasoning: this.explainLanguageChoice(item, dominantType, fuzzyPersonality.confidence)
            }));
            
            // Strategy recommendations with reasoning
            const strategyItems = this.getStrategyForPersonality(dominantType, fuzzyPersonality.is_hybrid);
            recommendations.strategy = strategyItems.map(strategy => ({
                strategy: strategy,
                reasoning: this.explainStrategyChoice(strategy, dominantType, fuzzyPersonality.is_hybrid)
            }));
            
            // Hybrid personality adjustments
            if (fuzzyPersonality.is_hybrid) {
                const secondaryType = fuzzyPersonality.secondary_type;
                recommendations.micro_adjustments.push({
                    recommendation: `Klient wykazuje cechy mieszane ${dominantType}/${secondaryType} - dostosuj podejście dynamicznie`,
                    reasoning: `Profil hybrydowy ${dominantType}/${secondaryType} wymaga elastycznego podejścia łączącego elementy obu stylów`
                });
            }
        }
        
        // Advanced triggers recommendations
        if (advancedTriggers && advancedTriggers.recommendations) {
            advancedTriggers.recommendations.forEach(rec => {
                if (rec.recommended_action) {
                    recommendations.next_steps.push({
                        recommendation: rec.recommended_action,
                        reasoning: `Rekomendacja oparta na analizie zaawansowanych triggerów: ${rec.trigger_type || 'ogólny'}`
                    });
                }
            });
        }
        
        // Micro-signal adjustments
        if (advancedTriggers && advancedTriggers.micro_signals) {
            advancedTriggers.micro_signals.forEach(signal => {
                if (signal.recommended_action) {
                    recommendations.micro_adjustments.push({
                        recommendation: `${signal.signal}: ${signal.recommended_action}`,
                        reasoning: `Mikrosygnał '${signal.signal}' wskazuje na potrzebę dostosowania podejścia`
                    });
                }
            });
        }
        
        // Transparency notes
        recommendations.transparency_notes.push({
            recommendation: "Rekomendacje oparte na analizie probabilistycznej z wykorzystaniem fuzzy logic",
            reasoning: "System wykorzystuje zaawansowane algorytmy fuzzy logic do analizy wielowymiarowych danych klienta"
        });
        
        return recommendations;
    }

    /**
     * Explain language choice for recommendations
     */
    explainLanguageChoice(recommendation, personalityType, confidence) {
        const explanations = {
            'I': 'Język entuzjastyczny i inspirujący, skupiony na emocjach i wizji',
            'D': 'Język bezpośredni i zorientowany na wyniki, podkreślający korzyści',
            'S': 'Język spokojny i wspierający, budujący zaufanie i bezpieczeństwo',
            'C': 'Język precyzyjny i faktyczny, oparty na danych i szczegółach'
        };
        
        const baseExplanation = explanations[personalityType] || 'Język dostosowany do wykrytego profilu';
        const confidenceNote = confidence > 0.8 ? ' (wysoka pewność)' : confidence > 0.6 ? ' (średnia pewność)' : ' (niska pewność)';
        
        return `${baseExplanation}${confidenceNote}`;
    }

    /**
     * Explain strategy choice for recommendations
     */
    explainStrategyChoice(strategy, personalityType, isHybrid) {
        const strategySpecificExplanations = {
            'Skup się na ROI': 'Podkreśl zwrot z inwestycji i korzyści finansowe',
            'Podkreśl efektywność': 'Pokaż jak Tesla zwiększa produktywność i oszczędza czas',
            'Szybka ścieżka decyzyjna': 'Przedstaw jasny plan zakupu bez zbędnych opóźnień',
            'Pokaż innowacyjność': 'Zaprezentuj najnowsze technologie i funkcje Tesla',
            'Użyj social proof': 'Wykorzystaj opinie innych klientów i case studies',
            'Buduj entuzjazm': 'Stwórz emocjonalne połączenie z marką Tesla',
            'Zapewnij o bezpieczeństwie': 'Podkreśl najwyższe oceny bezpieczeństwa Tesla',
            'Podkreśl stabilność': 'Pokaż niezawodność i długoterminową wartość',
            'Oferuj wsparcie': 'Zapewnij o kompleksowym wsparciu posprzedażowym',
            'Dostarcz szczegółowe dane': 'Przedstaw konkretne specyfikacje i porównania',
            'Pokaż analizy': 'Udostępnij raporty i badania dotyczące Tesla',
            'Odpowiedz na wszystkie pytania': 'Przygotuj się na szczegółowe wyjaśnienia techniczne',
            'Monitoruj reakcje i dostosuj podejście': 'Obserwuj sygnały klienta i elastycznie dostosowuj strategię'
        };
        
        const specificExplanation = strategySpecificExplanations[strategy] || `Strategia ${strategy} dopasowana do profilu ${personalityType}`;
        const hybridNote = isHybrid ? ' (podejście hybrydowe)' : '';
        
        return `${specificExplanation}${hybridNote}`;
    }

    /**
     * Enhanced confidence calculation
     */
    calculateEnhancedConfidence(inputData, fuzzyPersonality, advancedTriggers) {
        let confidence = 50;
        
        // Data completeness
        const dataFields = ['selectedTriggers', 'demographics', 'tone'];
        const presentFields = dataFields.filter(field => inputData[field] && 
            (Array.isArray(inputData[field]) ? inputData[field].length > 0 : true)
        );
        confidence += (presentFields.length / dataFields.length) * 20;
        
        // Fuzzy personality confidence
        if (fuzzyPersonality) {
            confidence += fuzzyPersonality.confidence * 0.3;
            
            if (fuzzyPersonality.is_pure_type) {
                confidence += 10;
            } else if (fuzzyPersonality.is_hybrid) {
                confidence -= 5;
            }
        }
        
        // Advanced triggers confidence
        if (advancedTriggers) {
            const signalCount = (
                (advancedTriggers.hierarchical_triggers?.length || 0) +
                (advancedTriggers.micro_signals?.length || 0) +
                (advancedTriggers.behavioral_signals?.length || 0)
            );
            
            confidence += Math.min(signalCount * 2, 15);
        }
        
        // Historical performance adjustment
        if (this.conversionHistory.length > 5) {
            const recentAccuracy = this.calculateRecentAccuracy();
            confidence *= recentAccuracy;
        }
        
        return Math.max(20, Math.min(95, confidence));
    }
    
    /**
     * Generate session ID for tracking
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Record conversion result for learning
     */
    recordConversionResult(sessionId, converted, actualPersonality = null) {
        this.conversionHistory.push({
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            converted: converted,
            actual_personality: actualPersonality
        });
        
        // Keep only recent history (last 100 sessions)
        if (this.conversionHistory.length > 100) {
            this.conversionHistory = this.conversionHistory.slice(-100);
        }
        
        return {
            success: true,
            message: 'Wynik konwersji zapisany - system będzie się uczył'
        };
    }
    
    /**
     * Collect feedback for transparency engine
     */
    collectFeedback(sessionId, feedbackData) {
        return this.transparencyEngine.collectFeedback(sessionId, feedbackData);
    }
    
    /**
     * Get performance report
     */
    getPerformanceReport(timeframe = '30d') {
        return this.transparencyEngine.generatePerformanceReport(timeframe);
    }
    
    /**
     * Setup A/B test
     */
    setupABTest(testName, variants) {
        return this.transparencyEngine.setupABTest(testName, variants);
    }
    
    /**
     * Get A/B test results
     */
    getABTestResults(testName) {
        return this.transparencyEngine.getABTestResults(testName);
    }
    
    // Helper methods
    calculateRecentPerformance() {
        if (this.conversionHistory.length < 10) return 1.0;
        
        const recent = this.conversionHistory.slice(-10);
        const conversionRate = recent.filter(h => h.converted).length / recent.length;
        
        // Adjust based on performance (0.8 to 1.2 range)
        return 0.8 + (conversionRate * 0.4);
    }
    
    calculateRecentAccuracy() {
        if (this.conversionHistory.length < 5) return 1.0;
        
        // Simplified accuracy calculation
        return 0.85 + (Math.random() * 0.3); // Mock implementation
    }
    
    getLanguageForPersonality(type, confidence) {
        const baseLanguage = {
            D: ['Konkretne fakty', 'Szybkie decyzje', 'Wyniki i efektywność'],
            I: ['Entuzjazm', 'Innowacyjność', 'Społeczne korzyści'],
            S: ['Bezpieczeństwo', 'Stabilność', 'Wsparcie'],
            C: ['Szczegółowe dane', 'Analizy', 'Precyzyjne informacje']
        };
        
        let language = baseLanguage[type] || baseLanguage.S;
        
        // Adjust based on confidence
        if (confidence < 60) {
            language = language.concat(['Uniwersalne podejście', 'Elastyczna komunikacja']);
        }
        
        return language;
    }
    
    getStrategyForPersonality(type, isHybrid) {
        const strategies = {
            D: ['Skup się na ROI', 'Podkreśl efektywność', 'Szybka ścieżka decyzyjna'],
            I: ['Pokaż innowacyjność', 'Użyj social proof', 'Buduj entuzjazm'],
            S: ['Zapewnij o bezpieczeństwie', 'Podkreśl stabilność', 'Oferuj wsparcie'],
            C: ['Dostarcz szczegółowe dane', 'Pokaż analizy', 'Odpowiedz na wszystkie pytania']
        };
        
        let strategy = strategies[type] || strategies.S;
        
        if (isHybrid) {
            strategy.push('Monitoruj reakcje i dostosuj podejście');
        }
        
        return strategy;
    }

    // Helper methods
    findTrigger(triggerText) {
        return this.data.triggers?.triggers?.find(t => t.text === triggerText);
    }

    getToneDescription(tone) {
        const descriptions = {
            'entuzjastyczny': 'Energetyczny i pozytywny',
            'profesjonalny': 'Formalny i biznesowy',
            'przyjacielski': 'Ciepły i osobisty',
            'techniczny': 'Precyzyjny i faktyczny'
        };
        return descriptions[tone] || 'Standardowy';
    }

    calculateDemographicScore(demographics) {
        let score = 30; // Lower base score
        
        // Age bonus - older clients more stable
        if (demographics.age) {
            score += 8;
            if (demographics.age === '35-45' || demographics.age === '45-55') {
                score += 5; // Peak buying power age
            }
        }
        
        // Housing type - critical for charging
        if (demographics.housingType) {
            score += 5;
            if (demographics.housingType === 'dom') {
                score += 15; // Home charging huge advantage
            } else if (demographics.housingType === 'mieszkanie_parking') {
                score += 8; // Some charging options
            }
            // Street parking gets no bonus (charging anxiety)
        }
        
        // PV panels - major cost savings
        if (demographics.hasPV === 'true') {
            score += 18; // Huge TCO improvement
        }
        
        // Region - infrastructure availability  
        if (demographics.region) {
            score += 5;
            if (['mazowieckie', 'slaskie'].includes(demographics.region)) {
                score += 3; // Better charging infrastructure
            }
        }
        
        // Relationship status - decision complexity
        if (demographics.relationshipStatus) {
            score += 3;
            if (demographics.relationshipStatus === 'single') {
                score += 8; // Faster decision making
            } else if (demographics.relationshipStatus === 'married') {
                score += 5; // Stable finances but needs partner approval
            } else if (demographics.relationshipStatus === 'relationship') {
                score += 3; // Some consultation needed
            }
        }
        
        // Children status - safety priority and family needs
        if (demographics.hasChildren) {
            score += 4;
            if (demographics.hasChildren === 'yes_young') {
                score += 12; // Safety priority, space needs
            } else if (demographics.hasChildren === 'yes_older') {
                score += 8; // Safety important, less space constraints
            } else if (demographics.hasChildren === 'planning') {
                score += 6; // Future-oriented thinking
            }
        }
        
        // Tesla experience - familiarity and trust
        if (demographics.teslaExperience) {
            score += 5;
            if (demographics.teslaExperience === 'owner') {
                score += 15; // High trust and familiarity
            } else if (demographics.teslaExperience === 'test_drive') {
                score += 10; // Positive experience
            } else if (demographics.teslaExperience === 'research') {
                score += 8; // Informed interest
            } else if (demographics.teslaExperience === 'referral') {
                score += 12; // Social proof
            }
        }
        
        // Car role - purchase urgency and budget
        if (demographics.carRole) {
            score += 4;
            if (demographics.carRole === 'primary') {
                score += 10; // Essential purchase, higher budget
            } else if (demographics.carRole === 'replacement') {
                score += 8; // Planned upgrade
            } else if (demographics.carRole === 'additional') {
                score += 6; // Luxury purchase, price sensitive
            } else if (demographics.carRole === 'business') {
                score += 12; // Tax benefits, faster decisions
            }
        }
        
        return Math.min(score, 100);
    }

    getDemographicModifiers(demographics) {
        const modifiers = {};
        
        // Housing-based modifiers
        if (demographics.housingType === 'dom') {
            modifiers.home_charging_available = true;
            modifiers.charging_anxiety_reduced = 20;
        } else if (demographics.housingType === 'mieszkanie_ulica') {
            modifiers.charging_anxiety_high = true;
            modifiers.infrastructure_dependency = 15;
        }
        
        // PV synergy
        if (demographics.hasPV === 'true') {
            modifiers.energy_cost_savings = true;
            modifiers.tco_advantage = 25;
        }
        
        // Age-based decision making
        if (demographics.age) {
            if (demographics.age === '25-35') {
                modifiers.tech_savvy = true;
                modifiers.environmental_conscious = 10;
            } else if (demographics.age === '35-45' || demographics.age === '45-55') {
                modifiers.financial_focused = true;
                modifiers.family_oriented = 15;
            } else if (demographics.age === '55+') {
                modifiers.safety_focused = true;
                modifiers.reliability_important = 20;
            }
        }
        
        // Relationship status modifiers
        if (demographics.relationshipStatus) {
            if (demographics.relationshipStatus === 'single') {
                modifiers.decision_autonomy = true;
                modifiers.faster_decision_process = 15;
            } else if (demographics.relationshipStatus === 'married') {
                modifiers.partner_approval_needed = true;
                modifiers.consensus_building_required = 10;
                modifiers.financial_stability = 12;
            } else if (demographics.relationshipStatus === 'relationship') {
                modifiers.consultation_needed = true;
                modifiers.influence_consideration = 8;
            }
        }
        
        // Children status modifiers
        if (demographics.hasChildren) {
            if (demographics.hasChildren === 'yes_young') {
                modifiers.safety_priority = true;
                modifiers.space_requirements = 15;
                modifiers.family_focused_messaging = 20;
                modifiers.environmental_legacy = 12;
            } else if (demographics.hasChildren === 'yes_older') {
                modifiers.safety_important = true;
                modifiers.independence_teaching = 10;
                modifiers.technology_showcase = 8;
            } else if (demographics.hasChildren === 'planning') {
                modifiers.future_planning = true;
                modifiers.investment_mindset = 12;
                modifiers.family_preparation = 10;
            } else if (demographics.hasChildren === 'no') {
                modifiers.lifestyle_focused = true;
                modifiers.performance_priority = 8;
                modifiers.luxury_appeal = 10;
            }
        }
        
        // Tesla experience modifiers
        if (demographics.teslaExperience) {
            if (demographics.teslaExperience === 'owner') {
                modifiers.brand_loyalty = true;
                modifiers.upgrade_motivation = 18;
                modifiers.referral_potential = 15;
                modifiers.technical_knowledge = 20;
            } else if (demographics.teslaExperience === 'test_drive') {
                modifiers.positive_experience = true;
                modifiers.feature_familiarity = 12;
                modifiers.reduced_anxiety = 10;
            } else if (demographics.teslaExperience === 'research') {
                modifiers.informed_buyer = true;
                modifiers.specification_focused = 15;
                modifiers.comparison_aware = 10;
            } else if (demographics.teslaExperience === 'referral') {
                modifiers.social_proof = true;
                modifiers.trust_transfer = 15;
                modifiers.recommendation_influence = 18;
            } else if (demographics.teslaExperience === 'none') {
                modifiers.education_needed = true;
                modifiers.skepticism_potential = 8;
                modifiers.demonstration_important = 15;
            }
        }
        
        // Car role modifiers
        if (demographics.carRole) {
            if (demographics.carRole === 'primary') {
                modifiers.essential_purchase = true;
                modifiers.reliability_critical = 18;
                modifiers.budget_priority = 15;
                modifiers.daily_use_focus = 20;
            } else if (demographics.carRole === 'replacement') {
                modifiers.upgrade_motivation = true;
                modifiers.comparison_with_current = 12;
                modifiers.improvement_focused = 15;
            } else if (demographics.carRole === 'additional') {
                modifiers.luxury_purchase = true;
                modifiers.price_sensitivity = 10;
                modifiers.lifestyle_enhancement = 12;
                modifiers.optional_nature = 8;
            } else if (demographics.carRole === 'business') {
                modifiers.tax_benefits = true;
                modifiers.roi_focused = 18;
                modifiers.professional_image = 15;
                modifiers.faster_decision = 12;
            }
        }
        
        return modifiers;
    }

    getFallbackMarketData() {
        return {
            infrastructure: { regional_density: { other: { charging_anxiety_modifier: 0 } } },
            competitor_pricing: { competitors: {} },
            financing: { affordability_threshold: 0.25, regional_income_estimates: { other: 6500 } },
            subsidies: { naszEauto: { expected_availability: 0.5 } },
            compliance: { scarcity_block_threshold: 0.40 }
        };
    }

    // NEW SCORING 2.0 METHODS

    calculateChargerDensityScore(region) {
        const regionalData = this.marketData?.infrastructure?.regional_density || {};
        const regionData = regionalData[region] || regionalData['other'] || { charging_anxiety_modifier: 0 };
        
        const densityScore = regionData.points_per_100km2 || 25;
        const modifier = regionData.charging_anxiety_modifier || 0;
        
        // Normalize density to 0-100 scale (30+ points/100km2 = good coverage)
        const normalizedDensity = Math.min((densityScore / 30) * 100, 100);
        
        return {
            density: densityScore,
            normalized_score: normalizedDensity,
            anxiety_modifier: modifier
        };
    }

    calculateCompetitorPriceGap() {
        const competitors = this.marketData?.competitor_pricing?.competitors || {};
        let worstGap = 0;
        let mainCompetitor = null;
        
        for (const [name, data] of Object.entries(competitors)) {
            if (data.gap_percentage < worstGap) {
                worstGap = data.gap_percentage;
                mainCompetitor = { name, ...data };
            }
        }
        
        // Convert gap to scoring modifier: -2.3% gap = -12pp to probability
        const gapModifier = Math.max(worstGap * 5, -25); // Cap at -25pp
        
        return {
            worst_gap: worstGap,
            main_competitor: mainCompetitor,
            price_pressure_modifier: gapModifier
        };
    }

    calculateFinancingAffordability(demographics, monthlyPayment = 1899) {
        const region = demographics.region || 'other';
        const estimatedIncome = this.marketData?.financing?.regional_income_estimates?.[region] || 6500;
        const threshold = this.marketData?.financing?.affordability_threshold || 0.25;
        
        const affordabilityRatio = monthlyPayment / estimatedIncome;
        let affordabilityScore = 100;
        
        if (affordabilityRatio > threshold) {
            // Above threshold = penalty
            const excess = affordabilityRatio - threshold;
            affordabilityScore = Math.max(20, 100 - (excess * 400)); // 0.1 excess = -40pp
        }
        
        return {
            monthly_payment: monthlyPayment,
            estimated_income: estimatedIncome,
            affordability_ratio: affordabilityRatio,
            affordability_score: affordabilityScore,
            is_affordable: affordabilityRatio <= threshold
        };
    }

    calculateNaszEautoAvailability() {
        const subsidy = this.marketData?.subsidies?.naszEauto || {};
        const availability = subsidy.expected_availability || 0.5;
        const pressureEffectiveness = subsidy.pressure_effectiveness || 0.3;
        
        // High availability = less pressure tactic effectiveness
        const urgencyModifier = (1 - availability) * 20; // 95% avail = 1pp urgency
        
        return {
            expected_availability: availability,
            urgency_modifier: urgencyModifier,
            can_use_scarcity: availability < 0.7 // Only if <70% available
        };
    }

    // ENHANCED SCORING 2.0 - Polish market research based
    calculateAdvancedScoring2025(analysis) {
        const scores = this.calculateScores(analysis); // Keep old system as base
        const demographics = analysis.demographics;
        const inputData = analysis.input;
        
        // Initialize Advanced Triggers Database for enhanced analysis
        const AdvancedTriggersDatabase = require('./AdvancedTriggersDatabase');
        const triggersDb = new AdvancedTriggersDatabase();
        
        // POLISH MARKET SEGMENTATION (waznedane.csv)
        const polishSegment = triggersDb.identifyPolishSegment({
            income: demographics.income,
            motivators: inputData.motivators || [],
            interestedModels: inputData.interestedModels || []
        });
        
        // TOP 20 PREDICTIVE FACTORS (dane1.txt weights)
        const predictiveScore = this.calculatePredictiveFactors(inputData, demographics);
        
        // GLOBAL MARKET INSIGHTS (dane2.csv)
        const globalInsights = this.calculateGlobalMarketFactors(inputData);
        
        // COMPETITIVE ANALYSIS - detect competitor mentions
        const conversationText = analysis.conversation_history ? 
            analysis.conversation_history.map(h => h.message || h.text || '').join(' ') : '';
        const competitiveThreats = triggersDb.detectCompetitiveThreat(conversationText);
        
        // DECISION MAKER ANALYSIS
        const decisionMakerStatus = triggersDb.detectDecisionMakerStatus(conversationText);
        
        // SEGMENT-SPECIFIC RECOMMENDATIONS
        const segmentRecommendations = polishSegment && polishSegment.segment !== 'unknown' ?
            triggersDb.getSegmentRecommendations(polishSegment.segment) : null;
        
        // COMPETITIVE RESPONSE STRATEGIES
        const competitiveResponses = competitiveThreats.map(threat => 
            triggersDb.generateCompetitiveResponse(threat.brand, polishSegment?.segment || 'unknown')
        ).filter(response => response !== null);
        
        // NEW FEATURES FROM RESEARCH 2025
        const chargerDensity = this.calculateChargerDensityScore(demographics.region);
        const competitorGap = this.calculateCompetitorPriceGap();
        const financing = this.calculateFinancingAffordability(demographics);
        const subsidyAvail = this.calculateNaszEautoAvailability();
        
        // ENHANCED FEATURE VECTOR 3.0 (ML-ready) - May 2025 Reality Check
        const features = {
            // Core behavioral features
            trigger_strength: scores.trigger_match / 100,
            personality_alignment: scores.personality_alignment / 100,
            sentiment_match: (analysis.sentiment?.score || 50) / 100,
            
            // NEW CRITICAL FACTORS 3.0 - May 2025
            competitive_price_position: this.calculateCompetitivePricePosition(inputData, demographics),
            used_ev_consideration: this.calculateUsedEvConsideration(inputData, demographics),
            brand_sentiment_realtime: this.calculateBrandSentimentRealtime(inputData),
            naszeauto_eligibility: this.calculateNaszEautoEligibility(demographics),
            infrastructure_reality: this.calculateInfrastructureReality(demographics),
            
            // NEW FACTORS 3.1 - Tesla Challenges & Competition
            tesla_specific_challenges: this.calculateTeslaSpecificChallenges(inputData, demographics),
            competitive_response_factor: this.calculateCompetitiveResponse(inputData, demographics),
            regional_variation_impact: this.calculateRegionalVariation(demographics).modifier,
            financial_reality_check: this.calculateFinancialReality(inputData, demographics),
            
            // Legacy features (reduced importance)
            demographic_match: scores.demographic_match / 100,
            tone_compatibility: scores.tone_compatibility / 100,
            charger_density: chargerDensity.normalized_score / 100,
            financing_affordability: financing.affordability_score / 100
        };
        
        // ML COEFFICIENTS 3.1 - Tesla Challenges & Competition Reality - June 2025
        const coefficients = {
            // Core behavioral (reduced for new factors)
            trigger_strength: 0.22,              // ↓ from 0.25
            personality_alignment: 0.16,         // ↓ from 0.18
            sentiment_match: 0.13,               // ↓ from 0.15
            
            // Market reality factors 3.0
            competitive_price_position: 0.11,    // ↓ from 0.12
            used_ev_consideration: 0.09,         // ↓ from 0.10
            brand_sentiment_realtime: 0.07,      // ↓ from 0.08
            naszeauto_eligibility: 0.05,         // ↓ from 0.06
            infrastructure_reality: 0.05,        // ↓ from 0.06
            
            // NEW CRITICAL FACTORS 3.1 - Tesla-specific reality
            tesla_specific_challenges: 0.08,     // NEW - delivery, service, FSD
            competitive_response_factor: 0.07,   // NEW - brand threats
            regional_variation_impact: 0.06,     // NEW - tier-based scoring
            financial_reality_check: 0.05,       // NEW - TCO, insurance reality
            
            // Legacy features (minimal weight)
            charger_density: 0.02,               // ↓ legacy
            financing_affordability: 0.02,       // ↓ legacy
            demographic_match: 0.015,            // ↓ legacy
            tone_compatibility: 0.015            // ↓ legacy
        };
        
        // CALCULATE ENHANCED SCORE
        let enhancedScore = 0;
        const featureContributions = {};
        
        for (const [feature, value] of Object.entries(features)) {
            const coefficient = coefficients[feature] || 0;
            const contribution = value * coefficient * 100;
            enhancedScore += contribution;
            featureContributions[feature] = {
                value: value,
                coefficient: coefficient,
                contribution: contribution
            };
        }
        
        // APPLY MARKET MODIFIERS
        enhancedScore += chargerDensity.anxiety_modifier;
        enhancedScore += competitorGap.price_pressure_modifier;
        
        if (!financing.is_affordable) {
            enhancedScore -= 20; // Major penalty for unaffordable
        }
        
        // CONFIDENCE ADJUSTMENTS - From weights_and_scoring.json
        const dataCompleteness = this.assessDataCompleteness(inputData, demographics);
        const confidenceMultiplier = this.getConfidenceMultiplier(dataCompleteness);
        
        // Apply confidence adjustment
        enhancedScore = enhancedScore * confidenceMultiplier;
        
        // POLISH MARKET SPECIFICS - Regional and infrastructure adjustments
        enhancedScore = this.applyPolishMarketModifiers(enhancedScore, demographics, chargerDensity);
        
        // CALIBRATION - Ensure realistic range
        enhancedScore = Math.max(15, Math.min(enhancedScore, 92));
        
        return {
            ...scores, // Keep original scores for comparison
            enhanced_total: Math.round(enhancedScore),
            polish_segment: polishSegment,
            predictive_factors: predictiveScore,
            global_insights: globalInsights,
            competitive_threats: competitiveThreats,
            decision_maker_status: decisionMakerStatus,
            segment_recommendations: segmentRecommendations,
            competitive_responses: competitiveResponses,
            feature_contributions: featureContributions,
            market_factors: {
                charger_density: chargerDensity,
                competitor_gap: competitorGap,
                financing: financing,
                subsidy_availability: subsidyAvail
            },
            confidence: this.calculateEnhancedConfidence(featureContributions),
            enhanced_conversion_probability: this.calculateEnhancedConversionProbability({
                enhanced_total: enhancedScore,
                polish_segment: polishSegment,
                competitive_threats: competitiveThreats,
                decision_maker_status: decisionMakerStatus
            }),
            version: "3.1"
        };
    }

    calculateHousingChargingSynergy(demographics, chargerDensity) {
        if (demographics.housingType === 'dom') {
            return 1.0; // Perfect home charging
        } else if (demographics.housingType === 'mieszkanie_parking') {
            return 0.6 + (chargerDensity.normalized_score / 100) * 0.3; // Some home + public
        } else {
            return (chargerDensity.normalized_score / 100) * 0.8; // Dependent on public
        }
    }

    calculatePriceSensitivityContext(triggers, competitorGap) {
        const hasPriceTriggers = triggers.some(t => 
            t.text.toLowerCase().includes('cena') || 
            t.text.toLowerCase().includes('drogo') ||
            t.text.toLowerCase().includes('koszt')
        );
        
        if (hasPriceTriggers && competitorGap.worst_gap < -10) {
            return -0.3; // High price sensitivity + bad price gap
        } else if (hasPriceTriggers) {
            return -0.1; // Price conscious but competitive
        }
        return 0;
    }

    calculateEnhancedConfidence(contributions) {
        // Higher confidence when multiple strong features align
        const strongFeatures = Object.values(contributions)
            .filter(c => c.contribution > 8)
            .length;
        
        const baseConfidence = 0.65;
        const confidenceBonus = Math.min(strongFeatures * 0.05, 0.25);
        
        return Math.min(baseConfidence + confidenceBonus, 0.95);
    }
    
    /**
     * Assess data completeness for confidence adjustment
     */
    assessDataCompleteness(inputData, demographics) {
        let completenessScore = 0;
        let totalFields = 0;
        
        // Core demographic fields
        const demographicFields = ['age', 'income', 'region', 'housingType'];
        demographicFields.forEach(field => {
            totalFields++;
            if (demographics[field] && demographics[field] !== 'unknown') {
                completenessScore++;
            }
        });
        
        // Behavioral data fields
        const behavioralFields = ['motivators', 'concerns', 'timeline', 'budget'];
        behavioralFields.forEach(field => {
            totalFields++;
            if (inputData[field] && inputData[field].length > 0) {
                completenessScore++;
            }
        });
        
        // Interaction history
        totalFields++;
        if (inputData.conversationHistory && inputData.conversationHistory.length > 2) {
            completenessScore++;
        }
        
        const completenessRatio = completenessScore / totalFields;
        
        if (completenessRatio >= 0.8) return 'full_data_with_history';
        if (completenessRatio >= 0.6) return 'standard_profile';
        if (completenessRatio >= 0.3) return 'minimal_data';
        return 'cold_prospect';
    }
    
    /**
     * Get confidence multiplier based on data completeness
     */
    getConfidenceMultiplier(dataCompleteness) {
        const multipliers = {
            'full_data_with_history': 0.85,
            'standard_profile': 0.70,
            'minimal_data': 0.55,
            'cold_prospect': 0.45
        };
        
        return multipliers[dataCompleteness] || 0.45;
    }
    
    /**
     * Apply Polish market specific modifiers
     */
    applyPolishMarketModifiers(score, demographics, chargerDensity) {
        let adjustedScore = score;
        
        // Infrastructure concerns (30% higher in Poland)
        if (chargerDensity.normalized_score < 50) {
            adjustedScore *= 0.87; // -13% for poor infrastructure
        }
        
        // Price sensitivity (20% more significant)
        if (demographics.income && demographics.income < 8000) {
            adjustedScore *= 0.88; // -12% for price sensitivity
        }
        
        // Regional variations
        const region = demographics.region?.toLowerCase() || '';
        if (region.includes('warszawa') || region.includes('kraków')) {
            // Base scoring - no adjustment
        } else if (region.includes('gdańsk') || region.includes('wrocław') || region.includes('poznań')) {
            adjustedScore *= 0.95; // -5% for other major cities
        } else {
            adjustedScore *= 0.85; // -15% for rural/smaller cities
        }
        
        return adjustedScore;
    }
    
    /**
     * Calculate enhanced conversion probability based on 2.0 factors
     */
    calculateEnhancedConversionProbability(analysisData) {
        let baseScore = analysisData.enhanced_total || 50;
        let conversionProbability = baseScore;
        
        // Polish segment modifiers (from waznedane.csv)
        if (analysisData.polish_segment) {
            const segment = analysisData.polish_segment;
            if (segment.conversion_rate) {
                // Apply segment-specific conversion rate
                conversionProbability = conversionProbability * (segment.conversion_rate / 100) * 1.2;
            }
            
            // High confidence segment match bonus
            if (segment.confidence > 0.8) {
                conversionProbability += 5;
            }
        }
        
        // Competitive threat penalties
        if (analysisData.competitive_threats && analysisData.competitive_threats.length > 0) {
            analysisData.competitive_threats.forEach(threat => {
                if (threat.threat_level === 'high') {
                    conversionProbability -= 15;
                } else if (threat.threat_level === 'medium') {
                    conversionProbability -= 8;
                } else {
                    conversionProbability -= 3;
                }
            });
        }
        
        // Decision maker status modifiers
        if (analysisData.decision_maker_status && analysisData.decision_maker_status.length > 0) {
            const hasAbsentDecisionMaker = analysisData.decision_maker_status.some(
                status => status.type === 'absent_decision_maker'
            );
            const hasMultipleInfluencers = analysisData.decision_maker_status.some(
                status => status.type === 'multiple_influencers'
            );
            
            if (hasAbsentDecisionMaker) {
                conversionProbability -= 20; // Major penalty for absent decision maker
            }
            if (hasMultipleInfluencers) {
                conversionProbability -= 10; // Penalty for complex decision process
            }
        }
        
        // Ensure realistic range
        conversionProbability = Math.max(5, Math.min(95, conversionProbability));
        
        return {
            probability: Math.round(conversionProbability),
            confidence_level: this.getConfidenceLevel(conversionProbability),
            key_factors: this.getKeyConversionFactors(analysisData),
            recommended_actions: this.getRecommendedActions(analysisData)
        };
    }
    
    /**
     * Get confidence level for conversion probability
     */
    getConfidenceLevel(probability) {
        if (probability >= 80) return 'very_high';
        if (probability >= 65) return 'high';
        if (probability >= 45) return 'medium';
        if (probability >= 25) return 'low';
        return 'very_low';
    }
    
    /**
     * Get key factors affecting conversion
     */
    getKeyConversionFactors(analysisData) {
        const factors = [];
        
        if (analysisData.polish_segment && analysisData.polish_segment.confidence > 0.7) {
            factors.push({
                factor: 'segment_match',
                impact: 'positive',
                description: `Strong match with ${analysisData.polish_segment.segment} segment`
            });
        }
        
        if (analysisData.competitive_threats && analysisData.competitive_threats.length > 0) {
            factors.push({
                factor: 'competitive_pressure',
                impact: 'negative',
                description: `Considering ${analysisData.competitive_threats.length} competitor(s)`
            });
        }
        
        if (analysisData.decision_maker_status && analysisData.decision_maker_status.length > 0) {
            factors.push({
                factor: 'decision_complexity',
                impact: 'negative',
                description: 'Complex decision-making process detected'
            });
        }
        
        return factors;
    }

    // ==========================================
    // NEW SCORING 3.0 METHODS - MAY 2025
    // ==========================================

    /**
     * Calculate Used EV Consideration Impact (NEW 3.0)
     * 62% of Poles consider used EVs - fundamentally changes Tesla profile
     */
    calculateUsedEvConsideration(inputData, demographics) {
        let usedEvScore = 0;
        const conversationText = (inputData.conversationHistory || [])
            .map(h => h.message || h.text || '').join(' ').toLowerCase();
        
        // Direct mentions of used/second-hand
        const usedEvKeywords = ['używany', 'z drugiej ręki', 'second hand', 'używane', 'po leasingu'];
        const hasUsedEvMention = usedEvKeywords.some(keyword => 
            conversationText.includes(keyword)
        );
        
        if (hasUsedEvMention) {
            usedEvScore = 85; // High consideration
        } else {
            // Infer from price sensitivity and demographics
            const isPriceSensitive = demographics.income < 8000 || 
                conversationText.includes('cena') || 
                conversationText.includes('drogo');
            
            const isYounger = demographics.age && demographics.age < 35;
            
            if (isPriceSensitive && isYounger) {
                usedEvScore = 70; // Likely to consider used
            } else if (isPriceSensitive) {
                usedEvScore = 55; // Moderate consideration
            } else {
                usedEvScore = 30; // Low consideration
            }
        }
        
        // Check price sensitivity from triggers and demographics
        const priceTriggers = (inputData.selectedTriggers || []).filter(trigger => 
            trigger.toLowerCase().includes('cena') || 
            trigger.toLowerCase().includes('drogo') ||
            trigger.toLowerCase().includes('stać') ||
            trigger.toLowerCase().includes('raty')
        );
        const isPriceSensitive = priceTriggers.length > 0 || 
                                (demographics.income && demographics.income < 8000);
        
        // Tesla-specific concerns when considering used
        const teslaImpact = {
            depreciation_anxiety: hasUsedEvMention ? 0.2 : 0,
            warranty_concerns: hasUsedEvMention ? 0.4 : 0,
            price_sensitivity_increase: isPriceSensitive ? 0.3 : 0
        };
        
        return {
            score: usedEvScore,
            normalized_score: usedEvScore,
            tesla_impact: teslaImpact,
            market_reality: "62% consideration rate in Poland",
            recommendation: usedEvScore > 60 ? 
                "Address used EV concerns, highlight Tesla warranty and updates" :
                "Focus on new car benefits and long-term value"
        };
    }

    /**
     * Calculate Brand Sentiment Real-time (NEW 3.0)
     * Includes Elon Musk factor impact on Tesla perception
     */
    calculateBrandSentimentRealtime(inputData) {
        let brandScore = 75; // Neutral baseline
        const conversationText = (inputData.conversationHistory || [])
            .map(h => h.message || h.text || '').join(' ').toLowerCase();
        
        // Positive Tesla sentiment indicators
        const positiveKeywords = [
            'innowacyjny', 'nowoczesny', 'przyszłość', 'technologia',
            'autopilot', 'supercharger', 'ekologiczny', 'prestiż'
        ];
        
        // Negative sentiment indicators (including Elon factor)
        const negativeKeywords = [
            'musk', 'twitter', 'kontrowersyjny', 'problemy',
            'recall', 'awarie', 'serwis', 'drogi'
        ];
        
        // Elon Musk specific mentions
        const elonKeywords = ['musk', 'elon', 'ceo tesla'];
        const hasElonMention = elonKeywords.some(keyword => 
            conversationText.includes(keyword)
        );
        
        // Calculate sentiment adjustments
        const positiveCount = positiveKeywords.filter(keyword => 
            conversationText.includes(keyword)
        ).length;
        
        const negativeCount = negativeKeywords.filter(keyword => 
            conversationText.includes(keyword)
        ).length;
        
        brandScore += (positiveCount * 5) - (negativeCount * 8);
        
        // Elon factor adjustment (Polish market sensitivity: Medium-High)
        if (hasElonMention) {
            // In Poland, Elon mentions tend to be more negative due to political sensitivity
            brandScore -= 12;
        }
        
        // Ensure realistic range
        brandScore = Math.max(20, Math.min(95, brandScore));
        
        return {
            score: brandScore,
            normalized_score: brandScore,
            elon_factor_detected: hasElonMention,
            sentiment_indicators: {
                positive_count: positiveCount,
                negative_count: negativeCount,
                elon_mentions: hasElonMention
            },
            polish_market_sensitivity: "Medium-High",
            recommendation: brandScore < 50 ? 
                "Address brand concerns, focus on product benefits" :
                "Leverage positive brand perception"
        };
    }

    /**
     * Calculate Competitive Price Position (NEW 3.0)
     * Tesla price competitiveness vs alternatives in Polish market
     */
    calculateCompetitivePricePosition(inputData, demographics) {
        let priceScore = 60; // Neutral baseline
        
        // Model-specific competitive analysis (Q1 2025 data)
        const interestedModels = inputData.interestedModels || [];
        const modelY = interestedModels.includes('Model Y');
        const model3 = interestedModels.includes('Model 3');
        
        // Competitive pressure by model (based on Q1 2025 sales data)
        if (modelY) {
            // Model Y: 51% of Tesla sales, strong position vs BMW iX, Audi e-tron
            priceScore = 72;
        } else if (model3) {
            // Model 3: 46% of Tesla sales, pressure from Kia EV6, Polestar 2
            priceScore = 58;
        }
        
        // Income-based price sensitivity
        if (demographics.income) {
            if (demographics.income < 6000) {
                priceScore -= 20; // High price pressure
            } else if (demographics.income < 10000) {
                priceScore -= 10; // Moderate pressure
            } else if (demographics.income > 15000) {
                priceScore += 10; // Low price pressure
            }
        }
        
        // Used EV market pressure (62% consideration)
        const conversationText = (inputData.conversationHistory || [])
            .map(h => h.message || h.text || '').join(' ').toLowerCase();
        
        const mentionsUsed = conversationText.includes('używany') || 
                           conversationText.includes('z drugiej ręki');
        
        if (mentionsUsed) {
            priceScore -= 15; // Used EV alternative pressure
        }
        
        // NaszEauto subsidy impact
        const eligibleForSubsidy = demographics.income && demographics.income < 12000;
        if (eligibleForSubsidy) {
            priceScore += 12; // Subsidy improves price position
        }
        
        priceScore = Math.max(20, Math.min(90, priceScore));
        
        return {
            score: priceScore,
            normalized_score: priceScore,
            competitive_factors: {
                model_position: modelY ? "Strong (Model Y)" : model3 ? "Moderate (Model 3)" : "Unknown",
                income_pressure: demographics.income < 8000 ? "High" : "Moderate",
                used_ev_pressure: mentionsUsed ? "High" : "Moderate",
                subsidy_help: eligibleForSubsidy ? "Available" : "Not applicable"
            },
            key_competitors: modelY ? ["BMW iX", "Audi e-tron", "Mercedes EQC"] : 
                           model3 ? ["Kia EV6", "Polestar 2", "Dacia Spring"] : [],
            recommendation: priceScore < 50 ? 
                "Emphasize value proposition, financing options, NaszEauto subsidy" :
                "Competitive pricing advantage - leverage it"
        };
    }

    /**
     * Calculate Infrastructure Reality (NEW 3.0)
     * Real charging infrastructure data May 2025: 9,814 points
     */
    calculateInfrastructureReality(demographics) {
        let infraScore = 55; // Updated baseline based on real data
        
        const region = demographics.region?.toLowerCase() || '';
        
        // Real data May 2025: 9,814 charging points, 33% fast DC
        // 9.6 EVs per charging point, 36% consumer anxiety
        
        // Regional infrastructure reality
        if (region.includes('warszawa')) {
            infraScore = 78; // Best infrastructure
        } else if (region.includes('kraków') || region.includes('gdańsk') || 
                  region.includes('wrocław') || region.includes('poznań')) {
            infraScore = 65; // Good infrastructure
        } else if (region.includes('katowice') || region.includes('lublin') || 
                  region.includes('białystok')) {
            infraScore = 52; // Moderate infrastructure
        } else {
            infraScore = 35; // Rural/small cities - limited infrastructure
        }
        
        // Housing type impact on charging anxiety
        if (demographics.housingType === 'dom') {
            infraScore += 15; // Home charging reduces anxiety
        } else if (demographics.housingType === 'mieszkanie_parking') {
            infraScore += 5; // Some home charging possibility
        }
        // No bonus for apartment without parking
        
        // Apply real market anxiety (36% of consumers concerned)
        const anxietyMultiplier = 0.64; // Reduce by anxiety percentage
        infraScore = infraScore * anxietyMultiplier;
        
        infraScore = Math.max(15, Math.min(85, infraScore));
        
        return {
            score: infraScore,
            normalized_score: infraScore,
            real_data_may_2025: {
                total_points: 9814,
                fast_dc_percentage: 33,
                ev_per_point: 9.6,
                consumer_anxiety: 36
            },
            regional_assessment: this.getRegionalInfraAssessment(region),
            housing_advantage: demographics.housingType === 'dom' ? "High" : 
                             demographics.housingType === 'mieszkanie_parking' ? "Medium" : "Low",
            recommendation: infraScore < 40 ? 
                "Address charging concerns, highlight Supercharger network, home charging solutions" :
                "Infrastructure adequate - focus on convenience benefits"
        };
    }

    /**
     * Get regional infrastructure assessment
     */
    getRegionalInfraAssessment(region) {
        if (region.includes('warszawa')) {
            return "Excellent - Dense network, multiple fast chargers";
        } else if (region.includes('kraków') || region.includes('gdańsk') || 
                  region.includes('wrocław') || region.includes('poznań')) {
            return "Good - Adequate coverage, growing network";
        } else if (region.includes('katowice') || region.includes('lublin') || 
                  region.includes('białystok')) {
            return "Moderate - Basic coverage, some gaps";
        } else {
            return "Limited - Sparse network, range planning required";
        }
    }
    
    /**
     * Calculate NaszEauto program eligibility and impact
     * Based on 1.6B PLN budget, max 40k PLN subsidy, 225k PLN price limit
     */
    calculateNaszEautoEligibility(demographics) {
        // Tesla Model Y qualifies (all versions under 225k PLN netto)
        const teslaModels = {
            'model_3': { price_netto: 180000, eligible: true },
            'model_y': { price_netto: 220000, eligible: true },
            'model_s': { price_netto: 350000, eligible: false },
            'model_x': { price_netto: 380000, eligible: false }
        };
        
        // Base subsidy for individuals: 18,750 PLN
        // Max subsidy: 40,000 PLN (with additional criteria)
        const baseSubsidy = 18750;
        const maxSubsidy = 40000;
        
        // Income-based eligibility (higher income = lower subsidy impact)
        const incomeMultiplier = {
            'low': 1.0,      // Full impact
            'medium': 0.8,   // Good impact
            'high': 0.6,     // Moderate impact
            'premium': 0.3   // Low impact (less price sensitive)
        }[demographics.income] || 0.5;
        
        // Family status bonus (families get higher subsidies)
        const familyBonus = demographics.children_status === 'dzieci' ? 0.2 : 0;
        
        // Calculate subsidy impact on purchase decision
        const subsidyImpact = (baseSubsidy / 200000) * incomeMultiplier + familyBonus;
        
        // Program utilization factor (limited budget)
        const utilizationFactor = 0.7; // 70% chance of getting subsidy
        
        return Math.min(1.0, subsidyImpact * utilizationFactor);
    }
    
    /**
     * Calculate Tesla-specific challenges impact (NEW 3.1)
     * Delivery delays, service distance, FSD relevance
     */
    calculateTeslaSpecificChallenges(inputData, demographics) {
        let challengeScore = 1.0;
        
        // Delivery delays impact (Model Y Performance Q2 2025)
        const hasUrgentNeed = inputData.timeline === 'immediate' || 
                             inputData.conversationHistory?.some(msg => 
                                 msg.toLowerCase().includes('pilnie') || 
                                 msg.toLowerCase().includes('szybko'));
        
        if (hasUrgentNeed) {
            challengeScore -= 0.25; // Major penalty for urgent needs
        }
        
        // Service center distance impact
        const serviceDistance = this.calculateServiceCenterDistance(demographics.region);
        if (serviceDistance > 100) {
            challengeScore -= 0.15; // Service anxiety penalty
        } else if (serviceDistance > 50) {
            challengeScore -= 0.08; // Moderate concern
        }
        
        // FSD relevance in Poland (limited value)
        const mentionsFSD = inputData.conversationHistory?.some(msg => 
            msg.toLowerCase().includes('autopilot') || 
            msg.toLowerCase().includes('fsd') ||
            msg.toLowerCase().includes('autonomiczny'));
        
        if (mentionsFSD) {
            challengeScore -= 0.1; // FSD expectations vs reality gap
        }
        
        return Math.max(0.1, challengeScore);
    }
    
    /**
     * Calculate competitive response factor (NEW 3.1)
     * Brand-specific threats and counter-strategies
     */
    calculateCompetitiveResponse(inputData, demographics) {
        let competitiveScore = 1.0;
        const conversationText = inputData.conversationHistory?.join(' ').toLowerCase() || '';
        
        // Kia EV6 threat (800V architecture, price)
        if (conversationText.includes('kia') || conversationText.includes('ev6')) {
            competitiveScore -= 0.15; // Strong price/tech competition
        }
        
        // Hyundai threat (warranty, service network)
        if (conversationText.includes('hyundai') || conversationText.includes('ioniq')) {
            competitiveScore -= 0.12; // Service network advantage
        }
        
        // Mercedes threat (luxury positioning)
        if (conversationText.includes('mercedes') || conversationText.includes('eqs')) {
            if (demographics.income === 'premium') {
                competitiveScore -= 0.18; // Strong luxury competition
            } else {
                competitiveScore -= 0.08; // Less relevant for lower income
            }
        }
        
        // Dacia Spring threat (budget disruption)
        if (conversationText.includes('dacia') || conversationText.includes('spring')) {
            if (demographics.income === 'low' || demographics.income === 'medium') {
                competitiveScore -= 0.25; // Major price gap concern
            }
        }
        
        return Math.max(0.1, competitiveScore);
    }
    
    /**
     * Calculate regional variation impact (NEW 3.1)
     * 4-tier city classification with specific modifiers
     */
    calculateRegionalVariation(demographics) {
        const region = demographics.region?.toLowerCase() || '';
        
        // Tier 1: Warszawa/Kraków - Tesla positive
        if (region.includes('warszawa') || region.includes('kraków')) {
            return {
                tier: 1,
                modifier: 1.15,
                infrastructure_bonus: 0.15,
                brand_perception_bonus: 0.10,
                service_confidence: 0.08
            };
        }
        
        // Tier 2: Średnie miasta - infrastructure anxiety
        if (region.includes('lublin') || region.includes('białystok') || 
            region.includes('rzeszów') || region.includes('kielce') ||
            region.includes('wrocław') || region.includes('poznań') ||
            region.includes('gdańsk')) {
            return {
                tier: 2,
                modifier: 0.85,
                infrastructure_penalty: -0.20,
                price_sensitivity_penalty: -0.15,
                service_anxiety: -0.10
            };
        }
        
        // Tier 3: Śląsk/Gdańsk - industrial, practical
        if (region.includes('katowice') || region.includes('śląsk') ||
            region.includes('gliwice') || region.includes('sosnowiec')) {
            return {
                tier: 3,
                modifier: 0.92,
                practical_bonus: 0.03,
                tco_focus_bonus: 0.05,
                brand_skepticism_penalty: -0.08
            };
        }
        
        // Tier 4: Rural areas - charging desert
        return {
            tier: 4,
            modifier: 0.65,
            infrastructure_penalty: -0.35,
            range_anxiety_penalty: -0.25,
            service_penalty: -0.20
        };
    }
    
    /**
     * Calculate financial reality check (NEW 3.1)
     * TCO, insurance, resale value reality
     */
    calculateFinancialReality(inputData, demographics) {
        let financialScore = 1.0;
        
        // Insurance cost reality (Tesla 40% higher than competition)
        const insuranceConcern = inputData.concerns?.some(concern => 
            concern.toLowerCase().includes('ubezpieczenie') ||
            concern.toLowerCase().includes('koszt'));
        
        if (insuranceConcern) {
            financialScore -= 0.12; // Insurance cost anxiety
        }
        
        // TCO vs competition reality
        const mentionsCompetition = inputData.conversationHistory?.some(msg => 
            msg.toLowerCase().includes('porównanie') ||
            msg.toLowerCase().includes('alternatywa'));
        
        if (mentionsCompetition && demographics.income !== 'premium') {
            financialScore -= 0.15; // TCO comparison unfavorable
        }
        
        // Resale value anxiety
        const resaleWorries = inputData.concerns?.some(concern => 
            concern.toLowerCase().includes('wartość') ||
            concern.toLowerCase().includes('sprzedaż'));
        
        if (resaleWorries) {
            financialScore += 0.08; // Tesla actually better than German premium
        }
        
        // Leasing vs cash NaszEauto impact
        if (demographics.purchaseMethod === 'leasing' && demographics.income !== 'premium') {
            financialScore -= 0.10; // No NaszEauto for personal leasing
        }
        
        return Math.max(0.1, financialScore);
    }
    
    /**
     * Calculate service center distance
     */
    calculateServiceCenterDistance(region) {
        const serviceCenters = {
            'warszawa': 0,
            'kraków': 15,
            'gdańsk': 25,
            'wrocław': 30,
            'poznań': 35,
            'katowice': 45,
            'lublin': 120,
            'białystok': 180,
            'rzeszów': 150,
            'olsztyn': 200
        };
        
        const regionKey = Object.keys(serviceCenters).find(key => 
            region?.toLowerCase().includes(key));
        
        return serviceCenters[regionKey] || 100; // Default 100km
    }
    
    /**
     * Get recommended actions based on analysis
     */
    getRecommendedActions(analysisData) {
        const actions = [];
        
        // Segment-specific actions
        if (analysisData.polish_segment && analysisData.polish_segment.segment !== 'unknown') {
            actions.push({
                priority: 'high',
                action: `Apply ${analysisData.polish_segment.segment} segment strategy`,
                timeframe: 'immediate'
            });
        }
        
        // Competitive response actions
        if (analysisData.competitive_threats && analysisData.competitive_threats.length > 0) {
            actions.push({
                priority: 'high',
                action: 'Address competitive concerns with differentiation strategy',
                timeframe: 'immediate'
            });
        }
        
        // Decision maker actions
        if (analysisData.decision_maker_status && analysisData.decision_maker_status.length > 0) {
            const hasAbsentDecisionMaker = analysisData.decision_maker_status.some(
                status => status.type === 'absent_decision_maker'
            );
            
            if (hasAbsentDecisionMaker) {
                actions.push({
                    priority: 'critical',
                    action: 'Schedule meeting with all decision makers',
                    timeframe: 'within_24h'
                });
            }
        }
        
        return actions;
    }

    // AI GUARD-RAILS - UOKiK Compliance System
    applyAIGuardRails(analysis) {
        const compliance = {
            blocked_tactics: [],
            allowed_tactics: [],
            risk_level: 'low',
            audit_log: []
        };

        const scores = analysis.scores;
        const personality = analysis.personality.detected;
        const blockThreshold = this.marketData?.compliance?.scarcity_block_threshold || 0.40;

        // RULE 1: Block pressure tactics for low-intent customers
        if (scores.enhanced_total < (blockThreshold * 100)) {
            compliance.blocked_tactics.push('scarcity', 'countdown', 'limited_offer');
            compliance.risk_level = 'high';
            compliance.audit_log.push({
                rule: 'LOW_INTENT_PROTECTION',
                reason: `Score ${scores.enhanced_total}% below threshold ${blockThreshold * 100}%`,
                action: 'BLOCK_PRESSURE_TACTICS'
            });
        }

        // RULE 2: Extra protection for Steady/Conscientious personalities
        if (personality && ['S', 'C'].includes(personality.DISC) && scores.enhanced_total < 50) {
            compliance.blocked_tactics.push('emotional_appeal', 'social_pressure');
            compliance.risk_level = 'high';
            compliance.audit_log.push({
                rule: 'VULNERABLE_PERSONALITY_PROTECTION',
                reason: `${personality.DISC} type with low score needs extra protection`,
                action: 'BLOCK_EMOTIONAL_MANIPULATION'
            });
        }

        // RULE 3: Price gap ethics - don't oversell when Tesla is significantly more expensive
        const priceGap = scores.market_factors?.competitor_gap?.worst_gap || 0;
        if (priceGap < -15) { // Tesla >15% more expensive
            compliance.blocked_tactics.push('premium_justification_oversell');
            compliance.audit_log.push({
                rule: 'PRICE_TRANSPARENCY',
                reason: `Tesla ${Math.abs(priceGap)}% more expensive than competition`,
                action: 'REQUIRE_HONEST_PRICE_COMPARISON'
            });
        }

        // RULE 4: Financing affordability - don't push unaffordable deals
        const financing = scores.market_factors?.financing;
        if (financing && !financing.is_affordable) {
            compliance.blocked_tactics.push('payment_focus', 'extended_terms');
            compliance.risk_level = 'medium';
            compliance.audit_log.push({
                rule: 'AFFORDABILITY_PROTECTION',
                reason: `Payment ratio ${(financing.affordability_ratio * 100).toFixed(1)}% exceeds safe threshold`,
                action: 'BLOCK_FINANCING_PRESSURE'
            });
        }

        // ALLOWED TACTICS - What's still OK to use
        const allowedTactics = ['education', 'facts', 'testimonials', 'technical_demo', 'tco_calculation'];
        
        if (scores.enhanced_total > 60) {
            allowedTactics.push('test_drive_push', 'closing_questions');
        }

        if (scores.market_factors?.subsidy_availability?.can_use_scarcity && 
            !compliance.blocked_tactics.includes('scarcity')) {
            allowedTactics.push('subsidy_urgency');
        }

        compliance.allowed_tactics = allowedTactics;

        return compliance;
    }

    generatePersonalizedPhrases(personality, teslaArchetype = null, triggers = []) {
        if (!personality) return [];
        
        const phrases = [];
        
        // Get base DISC phrases
        const cheatsheet = this.data.cheatsheet?.profiles || {};
        const discType = personality.DISC;
        
        // Map DISC types to profile names
        const discMapping = {
            'D': 'Dominant',
            'I': 'Influence', 
            'S': 'Steady',
            'C': 'Conscientious'
        };
        
        const profileName = discMapping[discType];
        const basePhrases = cheatsheet[profileName]?.phrases || [];
        phrases.push(...basePhrases);
        
        // Add Tesla Archetype-specific phrases if available
        if (teslaArchetype && this.archetypeResponses?.archetypes?.[teslaArchetype]) {
            const archetypeData = this.archetypeResponses.archetypes[teslaArchetype];
            
            // Add opening lines
            if (archetypeData.opening_lines) {
                phrases.push(...archetypeData.opening_lines);
            }
            
            // Add argument stack phrases based on trigger intensity
            const triggerCount = triggers.length;
            let argumentStack = 'soft';
            
            if (triggerCount >= 5) {
                argumentStack = 'strong';
            } else if (triggerCount >= 3) {
                argumentStack = 'medium';
            }
            
            if (archetypeData.argument_stacks?.[argumentStack]) {
                phrases.push(...archetypeData.argument_stacks[argumentStack]);
            }
            
            // Add ROI hooks if available
            if (archetypeData.roi_hooks) {
                phrases.push(...archetypeData.roi_hooks);
            }
        }
        
        // Remove duplicates and return
        return [...new Set(phrases)];
    }

    getKeywords(personality) {
        if (!personality) return [];
        
        const cheatsheet = this.data.cheatsheet?.profiles || {};
        const discType = personality.DISC;
        
        // Map DISC types to profile names
        const discMapping = {
            'D': 'Dominant',
            'I': 'Influence', 
            'S': 'Steady',
            'C': 'Conscientious'
        };
        
        const profileName = discMapping[discType];
        return cheatsheet[profileName]?.keywords || [];
    }

    getAvoidWords(personality) {
        if (!personality) return [];
        
        // General words to avoid based on DISC type
        const avoidMapping = {
            'D': ['powolny', 'może', 'być może', 'myślę że'],
            'I': ['nudny', 'techniczny', 'szczegółowy', 'analiza'],
            'S': ['presja', 'natychmiast', 'ryzykowny', 'zmiana'],
            'C': ['emocjonalny', 'intuicyjny', 'popularne', 'trendy']
        };
        
        return avoidMapping[personality.DISC] || [];
    }

    generateObjectionHandling(analysis) {
        const objections = this.data.objections?.objections || [];
        const relevantObjections = [];

        for (const trigger of analysis.triggers.selected) {
            const matchingObjections = objections.filter(obj => 
                obj.triggers?.some(objTrigger => 
                    trigger.text.toLowerCase().includes(objTrigger.toLowerCase())
                )
            );
            relevantObjections.push(...matchingObjections);
        }

        // Remove duplicates and format for frontend
        const uniqueObjections = [...new Set(relevantObjections)];
        return uniqueObjections.map(obj => ({
            objection: obj.objection,
            responses: obj.rebuttals || [],
            technique: obj.rebuttals?.[0]?.technique || 'Standard approach',
            warning: obj.rebuttals?.find(r => r.ethical_warning?.includes('Ryzyko'))?.ethical_warning
        }));
    }

    generateNextSteps(analysis) {
        const steps = [];
        const personality = analysis.personality.detected;
        const triggers = analysis.triggers.selected;
        const score = analysis.scores.total;
        
        // Base actions based on score
        if (score >= 70) {
            steps.push({
                priority: 1,
                action: 'Zaproponuj jazdę testową NATYCHMIAST',
                timeframe: 'Dzisiaj',
                reason: 'Bardzo wysokie prawdopodobieństwo konwersji'
            });
        } else if (score >= 50) {
            steps.push({
                priority: 1,
                action: 'Zaproponuj jazdę testową',
                timeframe: '24-48 godzin',
                reason: 'Wysokie prawdopodobieństwo konwersji'
            });
        } else if (score >= 30) {
            steps.push({
                priority: 2,
                action: 'Adresuj główne obawy klienta',
                timeframe: '24 godziny',
                reason: 'Potrzeba rozwiania wątpliwości'
            });
        } else {
            steps.push({
                priority: 3,
                action: 'Przeprowadź dłuższą rozmowę edukacyjną',
                timeframe: '1 tydzień',
                reason: 'Niskie zainteresowanie - potrzeba budowania relacji'
            });
        }

        // Add specific actions based on detected trigger patterns
        const triggerTexts = triggers.map(t => t.text);
        
        // Financial concerns
        if (triggerTexts.some(t => t.toLowerCase().includes('cena'))) {
            steps.push({
                priority: 2,
                action: 'Przygotuj kalkulację TCO i informacje o dotacjach',
                timeframe: '6 godzin',
                reason: 'Klient ma obawy finansowe'
            });
        }
        
        // Technical concerns  
        if (triggerTexts.some(t => t.toLowerCase().includes('zasięg') || t.toLowerCase().includes('zima'))) {
            steps.push({
                priority: 2,
                action: 'Przygotuj dane techniczne o zasięgu zimowym',
                timeframe: '6 godzin',
                reason: 'Klient ma wątpliwości techniczne'
            });
        }
        
        // Charging infrastructure
        if (triggerTexts.some(t => t.toLowerCase().includes('ładowanie'))) {
            steps.push({
                priority: 2,
                action: 'Pokaż mapę ładowarek i możliwości domowe',
                timeframe: '12 godzin',
                reason: 'Obawy dotyczące infrastruktury ładowania'
            });
        }
        
        // High intent signals
        if (triggerTexts.some(t => t.toLowerCase().includes('testowałem') || t.toLowerCase().includes('porównałem'))) {
            steps.push({
                priority: 1,
                action: 'Skorzystaj z doświadczenia klienta - zapytaj o wcześniejsze testy',
                timeframe: 'Podczas rozmowy',
                reason: 'Klient ma doświadczenie z rynkiem EV'
            });
        }
        
        // Environmental interest
        if (triggerTexts.some(t => t.toLowerCase().includes('środowisko') || t.toLowerCase().includes('emisje'))) {
            steps.push({
                priority: 3,
                action: 'Przygotuj materiały o korzyściach ekologicznych',
                timeframe: '24 godziny',
                reason: 'Motywacja ekologiczna'
            });
        }
        
        // Business/company context
        if (triggerTexts.some(t => t.toLowerCase().includes('firmowy') || t.toLowerCase().includes('flota'))) {
            steps.push({
                priority: 1,
                action: 'Przygotuj ofertę flotową i korzyści podatkowe',
                timeframe: '24 godziny',
                reason: 'Zakup biznesowy - inne procedury'
            });
        }
        
        // Personality-specific actions
        if (personality && personality.DISC) {
            switch (personality.DISC) {
                case 'D':
                    steps.push({
                        priority: 1,
                        action: 'Przedstaw kluczowe korzyści biznesowe - krótko i na temat',
                        timeframe: 'Następna rozmowa',
                        reason: 'Profil dominujący - czas to pieniądz'
                    });
                    break;
                case 'I':
                    steps.push({
                        priority: 2,
                        action: 'Pokaż testimoniale i historie sukcesu innych klientów',
                        timeframe: '12 godzin',
                        reason: 'Profil wpływowy - ważny dowód społeczny'
                    });
                    break;
                case 'S':
                    steps.push({
                        priority: 2,
                        action: 'Zapewnij o gwarancji i bezpieczeństwie inwestycji',
                        timeframe: 'Następna rozmowa',
                        reason: 'Profil stabilny - potrzebuje pewności'
                    });
                    break;
                case 'C':
                    steps.push({
                        priority: 2,
                        action: 'Przygotuj szczegółowe dane techniczne i porównania',
                        timeframe: '24 godziny',
                        reason: 'Profil sumiennego - potrzebuje faktów'
                    });
                    break;
            }
        }
        
        // Sort by priority and return top 5
        return steps.sort((a, b) => a.priority - b.priority).slice(0, 5);
    }
    
    // Analysis History Management methods
    
    async getAnalysisByNumber(analysisNumber) {
        return this.historyManager.getAnalysis(analysisNumber);
    }
    
    async searchAnalyses(criteria) {
        return this.historyManager.searchAnalyses(criteria);
    }
    
    async addTagToAnalysis(analysisNumber, tag) {
        return this.historyManager.addTag(analysisNumber, tag);
    }
    
    async removeTagFromAnalysis(analysisNumber, tag) {
        return this.historyManager.removeTag(analysisNumber, tag);
    }
    
    async addNoteToAnalysis(analysisNumber, note, author = 'user') {
        return this.historyManager.addNote(analysisNumber, note, author);
    }
    
    async updateAnalysisConversionResult(analysisNumber, converted, actualPersonality = null) {
        return this.historyManager.updateConversionResult(analysisNumber, converted, actualPersonality);
    }
    
    async markAnalysisAsReviewed(analysisNumber, effectivenessScore = null) {
        return this.historyManager.markAsReviewed(analysisNumber, effectivenessScore);
    }
    
    async getOptimizationReport(timeframe = '30d') {
        return this.historyManager.generateOptimizationReport(timeframe);
    }
    
    async getAnalysisStats() {
        return this.historyManager.getStats();
    }
    
    async starAnalysis(analysisNumber) {
        const analysis = await this.historyManager.getAnalysis(analysisNumber);
        analysis.starred = !analysis.starred;
        await this.historyManager.saveHistory();
        return analysis;
    }
    
    async getRecentAnalyses(limit = 10) {
        return this.historyManager.searchAnalyses({
            sortBy: 'timestamp',
            sortOrder: 'desc',
            limit: limit
        });
    }
    
    async getAnalysesByPersonality(personality, limit = 20) {
        return this.historyManager.searchAnalyses({
            personality: personality,
            limit: limit
        });
    }
    
    async getHighPerformingAnalyses(minConversion = 70, limit = 20) {
        return this.historyManager.searchAnalyses({
            minConversion: minConversion,
            limit: limit,
            sortBy: 'conversion_probability',
            sortOrder: 'desc'
        });
    }
    
    // Post-sales tracking methods
    
    async updatePurchaseResult(analysisNumber, purchased, purchaseDetails = {}) {
        return this.historyManager.updatePurchaseResult(analysisNumber, purchased, purchaseDetails);
    }
    
    async addTestDriveFeedback(analysisNumber, feedback) {
        return this.historyManager.addTestDriveFeedback(analysisNumber, feedback);
    }
    
    async calculateClientReadiness(analysisNumber, discussedTopics) {
        return this.historyManager.calculateReadinessScore(analysisNumber, discussedTopics);
    }
    
    async generateFollowUpRecommendation(analysisNumber) {
        return this.historyManager.generateFollowUpRecommendation(analysisNumber);
    }
    
    async getAnalysesWithTestDriveFeedback(limit = 50) {
        return this.historyManager.getAnalysesWithTestDriveFeedback(limit);
    }
    
    async getSalesEffectivenessReport(timeframe = '30d') {
        return this.historyManager.generateSalesEffectivenessReport(timeframe);
    }
    
    async analyzeReadinessVsConversion(timeframe = '30d') {
        return this.historyManager.analyzeReadinessVsConversion(timeframe);
    }

    // CUSTOMER DECODER ENGINE 2.0 - POLISH MARKET METHODS
    
    /**
     * Identify Polish market segment based on waznedane.csv data
     */
    identifyPolishSegment(inputData, demographics) {
        const income = demographics.income || 0;
        const age = demographics.age || 0;
        const motivators = inputData.motivators || [];
        const interestedModels = inputData.interestedModels || [];
        
        let bestSegment = null;
        let highestScore = 0;
        
        for (const [segmentKey, segment] of Object.entries(this.polishSegments)) {
            let score = 0;
            
            // Income alignment (30% weight)
            const incomeScore = Math.max(0, 100 - Math.abs(income - segment.income) / segment.income * 100);
            score += incomeScore * 0.3;
            
            // Model interest alignment (40% weight)
            const modelMatches = interestedModels.filter(model => 
                segment.models.some(segModel => model.includes(segModel.split(' ')[1]))
            ).length;
            score += (modelMatches / Math.max(1, interestedModels.length)) * 40;
            
            // Motivator alignment (30% weight)
            const motivatorScore = this.calculateMotivatorAlignment(motivators, segmentKey);
            score += motivatorScore * 0.3;
            
            if (score > highestScore) {
                highestScore = score;
                bestSegment = { key: segmentKey, ...segment, confidence: score };
            }
        }
        
        return bestSegment || { key: 'unknown', confidence: 0 };
    }
    
    /**
     * Calculate motivator alignment for Polish segments
     */
    calculateMotivatorAlignment(motivators, segmentKey) {
        const segmentMotivators = {
            'tech_innovators': ['technology', 'innovation', 'status'],
            'eco_luxury': ['sustainability', 'luxury', 'values'],
            'performance_enthusiasts': ['performance', 'acceleration', 'design'],
            'family_premium': ['safety', 'space', 'reliability'],
            'business_fleet': ['cost_efficiency', 'fleet_management'],
            'young_professionals': ['style', 'future_oriented', 'social_status']
        };
        
        const expectedMotivators = segmentMotivators[segmentKey] || [];
        const matches = motivators.filter(m => 
            expectedMotivators.some(em => m.toLowerCase().includes(em.toLowerCase()))
        ).length;
        
        return (matches / Math.max(1, expectedMotivators.length)) * 100;
    }
    
    /**
     * Calculate top 20 predictive factors from dane1.txt research
     */
    calculatePredictiveFactors(inputData, demographics) {
        const factors = {
            home_work_charging: this.evaluateFactor(inputData.homeWorkCharging, 10),
            daily_commute: this.evaluateFactor(inputData.dailyCommute, 9),
            competitor_consideration: this.evaluateFactor(inputData.competitorConsidered, 9),
            financing_questions: this.evaluateFactor(inputData.financingQuestions, 8),
            main_motivator: this.evaluateFactor(inputData.mainMotivator, 8),
            purchase_timeline: this.evaluateFactor(inputData.purchaseTimeline, 8),
            decision_maker_present: this.evaluateFactor(inputData.decisionMakerPresent, 7),
            postal_code_context: this.evaluateFactor(demographics.postalCode, 7),
            other_vehicles: this.evaluateFactor(inputData.otherVehicles, 7),
            future_language: this.evaluateFactor(inputData.futureLanguage, 6),
            test_drive_reaction: this.evaluateFactor(inputData.testDriveReaction, 6),
            rental_car_arrival: this.evaluateFactor(inputData.rentalCarArrival, 6),
            configuration_questions: this.evaluateFactor(inputData.configurationQuestions, 6),
            clean_trade_in: this.evaluateFactor(inputData.cleanTradeIn, 5),
            current_brand: this.evaluateFactor(inputData.currentBrand, 5),
            warranty_questions: this.evaluateFactor(inputData.warrantyQuestions, 5),
            age_factor: this.evaluateFactor(demographics.age, 4),
            residence_type: this.evaluateFactor(demographics.residenceType, 4),
            prepared_documents: this.evaluateFactor(inputData.preparedDocuments, 4),
            current_frustration: this.evaluateFactor(inputData.currentFrustration, 4)
        };
        
        const totalScore = Object.values(factors).reduce((sum, factor) => sum + factor.score, 0);
        const maxPossibleScore = Object.values(factors).reduce((sum, factor) => sum + factor.weight * 100, 0);
        
        return {
            factors,
            total_score: totalScore,
            max_possible: maxPossibleScore,
            percentage: Math.round((totalScore / maxPossibleScore) * 100),
            top_factors: Object.entries(factors)
                .sort((a, b) => b[1].score - a[1].score)
                .slice(0, 5)
                .map(([key, value]) => ({ factor: key, ...value }))
        };
    }
    
    /**
     * Evaluate individual predictive factor
     */
    evaluateFactor(value, weight) {
        if (value === undefined || value === null) {
            return { score: 0, weight, present: false };
        }
        
        let score = 0;
        let present = true;
        
        if (typeof value === 'boolean') {
            score = value ? weight * 100 : 0;
        } else if (typeof value === 'string') {
            score = value.length > 0 ? weight * 80 : 0;
        } else if (typeof value === 'number') {
            score = value > 0 ? weight * 90 : 0;
        } else if (Array.isArray(value)) {
            score = value.length > 0 ? weight * 85 : 0;
        }
        
        return { score: Math.round(score), weight, present };
    }
    
    /**
     * Calculate global market insights from dane2.csv
     */
    calculateGlobalMarketFactors(inputData) {
        const insights = {
            demographic_fit: this.calculateDemographicFit(inputData),
            technology_adoption: this.calculateTechnologyAdoption(inputData),
            purchase_behavior: this.calculatePurchaseBehavior(inputData),
            competitive_analysis: this.calculateCompetitivePosition(inputData),
            experience_expectations: this.calculateExperienceExpectations(inputData)
        };
        
        const overallScore = Object.values(insights).reduce((sum, insight) => sum + insight.score, 0) / Object.keys(insights).length;
        
        return {
            ...insights,
            overall_global_fit: Math.round(overallScore),
            market_readiness: overallScore > 70 ? 'high' : overallScore > 50 ? 'medium' : 'low'
        };
    }
    
    /**
     * Calculate demographic fit based on global data
     */
    calculateDemographicFit(inputData) {
        const demographics = inputData.demographics || {};
        let score = 50; // Base score
        
        // Age factor (45-54 optimal from dane2.csv)
        if (demographics.age >= 45 && demographics.age <= 54) score += 20;
        else if (demographics.age >= 35 && demographics.age <= 64) score += 10;
        
        // Income factor ($144k average)
        if (demographics.income >= 140000) score += 15;
        else if (demographics.income >= 100000) score += 10;
        
        // Education factor (higher education dominates)
        if (demographics.education === 'higher') score += 10;
        
        // Home ownership (enables home charging)
        if (demographics.homeOwner) score += 15;
        
        return {
            score: Math.min(100, Math.max(0, score)),
            factors: ['age_alignment', 'income_level', 'education', 'home_ownership']
        };
    }
    
    /**
     * Calculate technology adoption readiness
     */
    calculateTechnologyAdoption(inputData) {
        let score = 50;
        
        // Mobile app usage
        if (inputData.mobileAppUsage) score += 15;
        
        // OTA updates interest
        if (inputData.otaUpdatesInterest) score += 20;
        
        // Autonomous driving interest
        if (inputData.autonomousDrivingInterest) score += 15;
        
        // Tech comfort level
        if (inputData.techComfortLevel === 'high') score += 20;
        else if (inputData.techComfortLevel === 'medium') score += 10;
        
        return {
            score: Math.min(100, Math.max(0, score)),
            factors: ['mobile_apps', 'ota_updates', 'autonomous_driving', 'tech_comfort']
        };
    }
    
    /**
     * Calculate purchase behavior alignment
     */
    calculatePurchaseBehavior(inputData) {
        let score = 50;
        
        // Online research (95% starts online)
        if (inputData.onlineResearch) score += 20;
        
        // Decision timeline (4 months typical)
        if (inputData.decisionTimeline <= 4) score += 15;
        
        // Test drive importance
        if (inputData.testDriveImportant) score += 15;
        
        // Financing consideration
        if (inputData.financingConsidered) score += 10;
        
        return {
            score: Math.min(100, Math.max(0, score)),
            factors: ['online_research', 'decision_timeline', 'test_drive', 'financing']
        };
    }
    
    /**
     * Calculate competitive position
     */
    calculateCompetitivePosition(inputData) {
        let score = 60; // Tesla starts with advantage
        
        // Competitor testing
        if (inputData.competitorTesting) {
            if (inputData.competitorTesting.includes('BMW')) score -= 10;
            if (inputData.competitorTesting.includes('Mercedes')) score -= 10;
            if (inputData.competitorTesting.includes('Audi')) score -= 5;
        }
        
        // Tesla advantages mentioned
        if (inputData.teslaAdvantages) {
            if (inputData.teslaAdvantages.includes('technology')) score += 15;
            if (inputData.teslaAdvantages.includes('range')) score += 10;
            if (inputData.teslaAdvantages.includes('supercharger')) score += 10;
        }
        
        return {
            score: Math.min(100, Math.max(0, score)),
            factors: ['competitor_testing', 'tesla_advantages', 'brand_preference']
        };
    }
    
    /**
     * Calculate experience expectations
     */
    calculateExperienceExpectations(inputData) {
        let score = 50;
        
        // Service quality expectations
        if (inputData.serviceExpectations === 'premium') score += 15;
        
        // Communication preferences
        if (inputData.communicationPreference === 'app') score += 10;
        
        // Delivery flexibility
        if (inputData.deliveryFlexibility) score += 10;
        
        // Personalization importance
        if (inputData.personalizationImportant) score += 15;
        
        return {
            score: Math.min(100, Math.max(0, score)),
            factors: ['service_expectations', 'communication', 'delivery', 'personalization']
        };
    }
    
    /**
     * Tesla Archetypes Detection System
     * Detects customer archetype based on DISC profile and triggers
     */
    detectTeslaArchetype(discProfile, triggers, demographics) {
        console.log('🔍 Tesla Archetype Detection:', {
            discProfile,
            triggers: triggers?.map(t => t.text || t),
            demographics,
            hasArchetypes: !!this.teslaArchetypes?.archetypes
        });
        
        if (!this.teslaArchetypes || !this.teslaArchetypes.archetypes) {
            return { archetype: 'general', confidence: 0, reasoning: 'Archetypes system not loaded' };
        }
        
        const archetypeScores = {};
        const detectionRules = this.teslaArchetypes.archetype_detection_rules;
        
        // Score each archetype based on DISC alignment and trigger patterns
        for (const [archetypeKey, archetypeData] of Object.entries(this.teslaArchetypes.archetypes)) {
            let score = 0;
            let reasoning = [];
            
            // DISC Profile Matching (40% weight)
            const discScore = this.calculateDiscAlignment(discProfile, archetypeData.disc_mix);
            score += discScore * 0.4;
            if (discScore > 0.7) reasoning.push(`Strong DISC alignment (${archetypeData.disc_mix})`);
            
            // Trigger Pattern Matching (35% weight)
            const triggerScore = this.calculateTriggerAlignment(triggers, archetypeData.triggers);
            score += triggerScore * 0.35;
            if (triggerScore > 0.6) reasoning.push(`Matching trigger patterns`);
            
            // Demographics Alignment (15% weight)
            const demoScore = this.calculateDemographicsAlignment(demographics, archetypeData);
            score += demoScore * 0.15;
            if (demoScore > 0.5) reasoning.push(`Demographics fit`);
            
            // Market Scope Alignment (10% weight)
            const marketScore = this.calculateMarketScopeAlignment(demographics, archetypeData.market_scope);
            score += marketScore * 0.1;
            
            archetypeScores[archetypeKey] = {
                score: Math.round(score * 100),
                reasoning: reasoning,
                archetype_data: archetypeData
            };
        }
        
        // Find best matching archetype
        const bestMatch = Object.entries(archetypeScores)
            .sort(([,a], [,b]) => b.score - a.score)[0];
        
        if (!bestMatch || bestMatch[1].score < 50) {
            return {
                archetype: 'general',
                confidence: 0,
                reasoning: 'No strong archetype match found',
                all_scores: archetypeScores
            };
        }
        
        return {
            archetype: bestMatch[0],
            confidence: bestMatch[1].score,
            reasoning: bestMatch[1].reasoning.join(', '),
            archetype_data: bestMatch[1].archetype_data,
            all_scores: archetypeScores
        };
    }
    
    /**
     * Calculate DISC profile alignment with archetype
     */
    calculateDiscAlignment(discProfile, archetypeDiscMix) {
        if (!discProfile || !archetypeDiscMix) return 0;
        
        const primaryDisc = discProfile.primary || discProfile.type || discProfile.DISC;
        const secondaryDisc = discProfile.secondary;
        
        // Parse archetype DISC mix (e.g., "S+I", "D+C")
        const [archetypePrimary, archetypeSecondary] = archetypeDiscMix.split('+');
        
        let alignment = 0;
        
        // Primary DISC match (70% weight)
        if (primaryDisc === archetypePrimary) {
            alignment += 0.7;
        }
        
        // Secondary DISC match (30% weight)
        if (secondaryDisc === archetypeSecondary) {
            alignment += 0.3;
        } else if (primaryDisc === archetypeSecondary) {
            alignment += 0.15; // Partial match
        }
        
        // If no secondary DISC, give partial credit for primary match
        if (!secondaryDisc && primaryDisc === archetypePrimary) {
            alignment += 0.15;
        }
        
        return Math.min(1, alignment);
    }
    
    /**
     * Calculate trigger pattern alignment
     */
    calculateTriggerAlignment(customerTriggers, archetypeTriggers) {
        if (!customerTriggers || !archetypeTriggers || customerTriggers.length === 0) {
            return 0;
        }
        
        // Extract text from trigger objects if needed
        const customerTriggerTexts = customerTriggers.map(trigger => 
            typeof trigger === 'string' ? trigger : trigger.text || trigger.name || ''
        );
        
        const matches = customerTriggerTexts.filter(triggerText => 
            archetypeTriggers.some(archTrigger => {
                const lowerTrigger = triggerText.toLowerCase();
                const lowerArchTrigger = archTrigger.toLowerCase();
                return lowerTrigger.includes(lowerArchTrigger) || 
                       lowerArchTrigger.includes(lowerTrigger) ||
                       this.checkTriggerSemantic(lowerTrigger, lowerArchTrigger);
            })
        );
        
        return matches.length / Math.max(customerTriggerTexts.length, archetypeTriggers.length);
    }
    
    /**
     * Check semantic similarity between triggers
     */
    checkTriggerSemantic(trigger1, trigger2) {
        const semanticMappings = {
            'środowisko': ['environmental', 'eco', 'green', 'planet'],
            'dzieci': ['family', 'children', 'kids', 'safety'],
            'technologia': ['tech', 'innovation', 'autopilot', 'fsd'],
            'oszczędności': ['savings', 'cost', 'financial', 'money'],
            'bezpieczeństwo': ['safety', 'protection', 'secure'],
            'wydajność': ['performance', 'speed', 'power'],
            'przyszłość': ['future', 'innovation', 'advanced']
        };
        
        for (const [key, synonyms] of Object.entries(semanticMappings)) {
            if ((trigger1.includes(key) || synonyms.some(s => trigger1.includes(s))) &&
                (trigger2.includes(key) || synonyms.some(s => trigger2.includes(s)))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Calculate demographics alignment
     */
    calculateDemographicsAlignment(demographics, archetypeData) {
        if (!demographics) return 0.5; // Neutral if no demographics
        
        let score = 0.5; // Base score
        
        // Age-based alignment
        if (demographics.age) {
            if (archetypeData.name.includes('Family') && demographics.hasChildren) score += 0.2;
            if (archetypeData.name.includes('Executive') && demographics.age >= 35) score += 0.2;
            if (archetypeData.name.includes('Young') && demographics.age <= 35) score += 0.2;
        }
        
        // Income-based alignment
        if (demographics.income) {
            if (archetypeData.name.includes('Budget') && demographics.income < 100000) score += 0.15;
            if (archetypeData.name.includes('Luxury') && demographics.income > 150000) score += 0.15;
        }
        
        return Math.min(1, score);
    }
    
    /**
     * Calculate market scope alignment
     */
    calculateMarketScopeAlignment(demographics, marketScope) {
        // Simple market scope matching - can be enhanced
        if (!demographics || !marketScope) return 0.5;
        
        if (marketScope.includes('family') && demographics.hasChildren) return 1;
        if (marketScope.includes('executive') && demographics.income > 120000) return 1;
        if (marketScope.includes('budget') && demographics.income < 100000) return 1;
        
        return 0.5;
    }
    
    /**
     * Generate personalized response based on detected archetype
     */
    generateArchetypeResponse(archetype, discProfile, triggers, context = {}) {
        if (!this.archetypeResponses || !this.archetypeResponses.responses[archetype]) {
            return this.generateFallbackResponse(discProfile, triggers);
        }
        
        const archetypeData = this.archetypeResponses.responses[archetype];
        const selectionRules = this.archetypeResponses.response_selection_rules;
        
        // Select appropriate argument stack based on DISC
        let argumentLevel = 'medium'; // Default
        if (discProfile.primary === 'D') argumentLevel = 'strong';
        else if (discProfile.primary === 'S') argumentLevel = 'soft';
        else if (discProfile.primary === 'C') argumentLevel = 'medium';
        
        // Select opening line
        const openingLine = this.selectRandomFromArray(archetypeData.opening_lines);
        
        // Select arguments based on triggers and DISC
        const keyArguments = this.selectRelevantArguments(
            archetypeData.argument_stacks[argumentLevel],
            triggers
        );
        
        // Handle objections if present
        const objectionHandling = this.selectObjectionHandling(
            archetypeData.objection_handling,
            triggers
        );
        
        // Select social proof
        const socialProof = this.selectRandomFromArray(archetypeData.social_proof || []);
        
        // Select ROI hooks
        const roiHooks = this.selectRelevantROIHooks(
            archetypeData.roi_hooks || [],
            triggers
        );
        
        return {
            archetype: archetype,
            opening_line: openingLine,
            key_arguments: keyArguments,
            objection_handling: objectionHandling,
            social_proof: socialProof,
            roi_hooks: roiHooks,
            next_questions: archetypeData.next_questions || [],
            emotional_triggers: archetypeData.emotional_triggers || [],
            communication_style: this.getArchetypeCommunicationStyle(archetype, discProfile)
        };
    }
    
    /**
     * Select relevant arguments based on customer triggers
     */
    selectRelevantArguments(argumentStack, triggers) {
        if (!argumentStack || !triggers) return [];
        
        const relevantArgs = [];
        
        // Match arguments to customer triggers
        for (const [key, argument] of Object.entries(argumentStack)) {
            const isRelevant = triggers.some(trigger => 
                key.includes(trigger) || trigger.includes(key) ||
                argument.toLowerCase().includes(trigger.toLowerCase())
            );
            
            if (isRelevant) {
                relevantArgs.push({ key, argument });
            }
        }
        
        // If no specific matches, return top 3 arguments
        if (relevantArgs.length === 0) {
            return Object.entries(argumentStack)
                .slice(0, 3)
                .map(([key, argument]) => ({ key, argument }));
        }
        
        return relevantArgs.slice(0, 3); // Limit to top 3
    }
    
    /**
     * Select objection handling based on triggers
     */
    selectObjectionHandling(objectionHandling, triggers) {
        if (!objectionHandling || !triggers) return null;
        
        // Find matching objections in customer triggers
        for (const trigger of triggers) {
            for (const [objectionKey, objectionData] of Object.entries(objectionHandling)) {
                if (trigger.includes(objectionKey) || objectionKey.includes(trigger)) {
                    return {
                        objection: objectionKey,
                        response: objectionData.response,
                        proof_points: objectionData.proof_points || []
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Select relevant ROI hooks based on triggers
     */
    selectRelevantROIHooks(roiHooks, triggers) {
        if (!roiHooks || !triggers) return [];
        
        const relevantHooks = roiHooks.filter(hook => 
            triggers.some(trigger => 
                hook.toLowerCase().includes(trigger.toLowerCase()) ||
                trigger.toLowerCase().includes('cost') ||
                trigger.toLowerCase().includes('price') ||
                trigger.toLowerCase().includes('saving')
            )
        );
        
        return relevantHooks.length > 0 ? relevantHooks.slice(0, 3) : roiHooks.slice(0, 2);
    }
    
    /**
     * Get communication style for archetype and DISC combination
     */
    getArchetypeCommunicationStyle(archetype, discProfile) {
        const baseStyle = {
            tone: 'professional',
            pace: 'medium',
            detail_level: 'medium',
            emotional_appeal: 'medium'
        };
        
        // Adjust based on DISC
        switch (discProfile.primary) {
            case 'D':
                baseStyle.tone = 'direct';
                baseStyle.pace = 'fast';
                baseStyle.detail_level = 'low';
                baseStyle.emotional_appeal = 'low';
                break;
            case 'I':
                baseStyle.tone = 'enthusiastic';
                baseStyle.pace = 'fast';
                baseStyle.detail_level = 'medium';
                baseStyle.emotional_appeal = 'high';
                break;
            case 'S':
                baseStyle.tone = 'supportive';
                baseStyle.pace = 'slow';
                baseStyle.detail_level = 'medium';
                baseStyle.emotional_appeal = 'medium';
                break;
            case 'C':
                baseStyle.tone = 'analytical';
                baseStyle.pace = 'slow';
                baseStyle.detail_level = 'high';
                baseStyle.emotional_appeal = 'low';
                break;
        }
        
        return baseStyle;
    }
    
    /**
     * Generate fallback response when archetype system is not available
     */
    generateFallbackResponse(discProfile, triggers) {
        return {
            archetype: 'general',
            opening_line: 'Tesla oferuje najlepszą kombinację technologii, wydajności i wartości na rynku.',
            key_arguments: [
                { key: 'technology', argument: 'Najnowsza technologia EV na świecie' },
                { key: 'performance', argument: 'Niezrównana wydajność i zasięg' },
                { key: 'value', argument: 'Najlepszy stosunek jakości do ceny' }
            ],
            objection_handling: null,
            social_proof: 'Ponad 5 milionów zadowolonych klientów na całym świecie',
            roi_hooks: ['Oszczędności na paliwie', 'Niskie koszty serwisu'],
            next_questions: ['Jakie są Twoje główne potrzeby transportowe?'],
            emotional_triggers: ['innovation', 'quality', 'savings'],
            communication_style: this.getArchetypeCommunicationStyle('general', discProfile)
        };
    }
    
    /**
     * Utility function to select random item from array
     */
    selectRandomFromArray(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }
}

module.exports = CustomerDecoderEngine;
