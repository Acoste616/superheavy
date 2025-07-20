/**
 * TCD SHU PRO - Tesla Customer Decoder Logic Engine
 * Advanced customer psychology analysis and sales strategy engine
 * 
 * @author Claude AI Assistant
 * @version 2.0
 */

class CustomerDecoderEngine {
    constructor() {
        this.data = {};
        this.analysisCache = new Map();
        this.debugMode = false;
        
        // Advanced scoring weights
        this.weights = {
            trigger_match: 0.35,
            personality_alignment: 0.25,
            tone_compatibility: 0.15,
            trigger_combinations: 0.15,
            demographic_fit: 0.10
        };
        
        // Trigger relationship matrix
        this.triggerRelationships = {
            // Financial triggers amplify each other
            financial_cluster: ['Martwi mnie cena', 'A wartość odsprzedaży?', 'Ile kosztuje serwis?'],
            // Technical skepticism cluster  
            technical_doubt: ['Co będzie jak się zepsuje?', 'A ten zasięg zimą?', 'Czy autopilot jest bezpieczny?'],
            // High-intent signals
            high_intent: ['Przetestowałem ponad 20 samochodów', 'Słyszałem o programie NaszEauto', 'Decyduję o flocie firmowej'],
            // Infrastructure concerns
            infrastructure: ['Gdzie będę ładować?', 'Nie mogę ładować w domu', 'Jak długo to trwa ładowanie?']
        };
    }

    async initialize(dataFiles) {
        try {
            console.log('🔄 Initializing TCD SHU PRO Logic Engine...');
            
            for (const [key, file] of Object.entries(dataFiles)) {
                const response = await fetch(file);
                if (!response.ok) throw new Error(`Failed to load ${file}`);
                this.data[key] = await response.json();
            }
            
            this.validateData();
            console.log('✅ Logic Engine initialized successfully');
            
            if (this.debugMode) {
                console.log('📊 Loaded data:', Object.keys(this.data));
            }
            
            return true;
        } catch (error) {
            console.error('❌ Logic Engine initialization failed:', error);
            throw error;
        }
    }

    validateData() {
        const requiredKeys = ['triggers', 'personas', 'rules', 'weights', 'cheatsheet', 'objections'];
        const missing = requiredKeys.filter(key => !this.data[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required data: ${missing.join(', ')}`);
        }
    }

    /**
     * Main analysis function - the heart of TCD SHU PRO
     */
    analyzeCustomer(input) {
        const startTime = performance.now();
        
        try {
            const analysis = {
                timestamp: new Date().toISOString(),
                input: input,
                scores: {},
                recommendations: {},
                warnings: [],
                confidence: 0
            };

            // Step 1: Personality Analysis
            analysis.personality = this.analyzePersonality(input);
            
            // Step 2: Trigger Analysis with relationships
            analysis.triggers = this.analyzeTriggers(input.selectedTriggers);
            
            // Step 3: Tone Compatibility
            analysis.tone = this.analyzeTone(input.tone, analysis.personality);
            
            // Step 4: Advanced Scoring
            analysis.scores = this.calculateAdvancedScoring(analysis);
            
            // Step 5: Strategy Matching
            analysis.strategy = this.matchStrategy(analysis);
            
            // Step 6: Generate Recommendations
            analysis.recommendations = this.generateRecommendations(analysis);
            
            // Step 7: Ethical Warnings
            analysis.warnings = this.generateEthicalWarnings(analysis);
            
            // Final confidence calculation
            analysis.confidence = this.calculateConfidence(analysis);
            
            const endTime = performance.now();
            analysis.processingTime = Math.round(endTime - startTime);
            
            // Cache result for potential reuse
            const cacheKey = this.generateCacheKey(input);
            this.analysisCache.set(cacheKey, analysis);
            
            if (this.debugMode) {
                console.log('🎯 Analysis completed:', analysis);
            }
            
            return analysis;
            
        } catch (error) {
            console.error('❌ Customer analysis failed:', error);
            return this.generateErrorResponse(error, input);
        }
    }

    analyzePersonality(input) {
        const personas = this.data.personas?.personas || [];
        const selectedPersona = personas.find(p => p.id === input.personaId);
        
        if (!selectedPersona) {
            // Auto-detect personality based on triggers
            return this.autoDetectPersonality(input.selectedTriggers);
        }
        
        return {
            detected: selectedPersona,
            confidence: input.personaId ? 0.95 : 0.75,
            traits: this.extractPersonalityTraits(selectedPersona),
            communicationStyle: selectedPersona.communication_style || 'adaptive'
        };
    }

    autoDetectPersonality(triggers) {
        const personalityScores = { D: 0, I: 0, S: 0, C: 0 };
        
        triggers.forEach(trigger => {
            const triggerData = this.data.triggers?.triggers?.find(t => t.text === trigger);
            if (triggerData && triggerData.personality_resonance) {
                Object.entries(triggerData.personality_resonance).forEach(([type, weight]) => {
                    if (personalityScores.hasOwnProperty(type)) {
                        personalityScores[type] += weight * 100; // Convert to percentage
                    }
                });
            }
        });
        
        const dominantType = Object.keys(personalityScores)
            .reduce((a, b) => personalityScores[a] > personalityScores[b] ? a : b);
        
        const personas = this.data.personas?.personas || [];
        const matchedPersona = personas.find(p => p.DISC === dominantType) || personas[0];
        
        return {
            detected: matchedPersona,
            confidence: 0.65,
            autoDetected: true,
            scores: personalityScores,
            traits: this.extractPersonalityTraits(matchedPersona)
        };
    }

    analyzeTriggers(selectedTriggers) {
        const triggerAnalysis = {
            selected: selectedTriggers,
            categories: {},
            relationships: {},
            intensityScore: 0,
            dominantCategory: null
        };

        // Categorize triggers
        selectedTriggers.forEach(trigger => {
            const triggerData = this.data.triggers?.triggers?.find(t => t.text === trigger);
            if (triggerData) {
                const category = triggerData.category;
                if (!triggerAnalysis.categories[category]) {
                    triggerAnalysis.categories[category] = [];
                }
                triggerAnalysis.categories[category].push(triggerData);
                triggerAnalysis.intensityScore += triggerData.base_conversion_rate || 50;
            }
        });

        // Analyze trigger relationships
        triggerAnalysis.relationships = this.analyzeTriggerRelationships(selectedTriggers);
        
        // Find dominant category
        triggerAnalysis.dominantCategory = Object.keys(triggerAnalysis.categories)
            .reduce((a, b) => 
                triggerAnalysis.categories[a].length > triggerAnalysis.categories[b].length ? a : b
            );

        return triggerAnalysis;
    }

    analyzeTriggerRelationships(triggers) {
        const relationships = {};
        
        for (const [clusterName, clusterTriggers] of Object.entries(this.triggerRelationships)) {
            const matchingTriggers = triggers.filter(t => clusterTriggers.includes(t));
            if (matchingTriggers.length > 1) {
                relationships[clusterName] = {
                    triggers: matchingTriggers,
                    synergy: matchingTriggers.length * 15, // Bonus points for related triggers
                    strategy: this.getClusterStrategy(clusterName)
                };
            }
        }
        
        return relationships;
    }

    getClusterStrategy(clusterName) {
        const strategies = {
            financial_cluster: 'Focus on TCO, NaszEauto subsidies, and long-term savings',
            technical_doubt: 'Address concerns with facts, warranty, and testimonials',
            high_intent: 'Move quickly to test drive and closing',
            infrastructure: 'Provide charging solutions and infrastructure map'
        };
        
        return strategies[clusterName] || 'Adaptive approach';
    }

    analyzeTone(selectedTone, personality) {
        const toneCompatibility = {
            D: { entuzjastyczny: 0.8, neutralny: 0.9, sceptyczny: 0.6, negatywny: 0.4 },
            I: { entuzjastyczny: 0.95, neutralny: 0.7, sceptyczny: 0.5, negatywny: 0.3 },
            S: { entuzjastyczny: 0.6, neutralny: 0.9, sceptyczny: 0.8, negatywny: 0.7 },
            C: { entuzjastyczny: 0.4, neutralny: 0.8, sceptyczny: 0.9, negatywny: 0.6 }
        };
        
        const discType = personality.detected.DISC;
        const compatibility = toneCompatibility[discType]?.[selectedTone] || 0.5;
        
        return {
            selected: selectedTone,
            compatibility: compatibility,
            recommendedApproach: this.getRecommendedApproach(selectedTone, discType),
            adjustments: this.getToneAdjustments(selectedTone, compatibility)
        };
    }

    calculateAdvancedScoring(analysis) {
        const scores = {
            base: 0,
            personality: 0,
            triggers: 0,
            tone: 0,
            relationships: 0,
            demographic: 0,
            total: 0
        };
        
        // Base personality score
        scores.personality = analysis.personality.confidence * 100;
        
        // Trigger intensity score
        scores.triggers = Math.min(analysis.triggers.intensityScore / 10, 100);
        
        // Tone compatibility score  
        scores.tone = analysis.tone.compatibility * 100;
        
        // Relationship bonuses
        scores.relationships = Object.values(analysis.triggers.relationships)
            .reduce((sum, rel) => sum + rel.synergy, 0);
        
        // Demographic fit (simplified for now)
        scores.demographic = 50;
        
        // Calculate weighted total
        scores.total = Math.round(
            scores.personality * this.weights.personality_alignment +
            scores.triggers * this.weights.trigger_match +
            scores.tone * this.weights.tone_compatibility +
            scores.relationships * this.weights.trigger_combinations +
            scores.demographic * this.weights.demographic_fit
        );
        
        scores.total = Math.min(Math.max(scores.total, 5), 95); // Clamp between 5-95%
        
        return scores;
    }

    matchStrategy(analysis) {
        const strategies = this.data.rules || [];
        const personality = analysis.personality.detected;
        const triggers = analysis.triggers.selected;
        
        // Find matching strategies
        const matchingStrategies = strategies.filter(strategy => {
            // Check trigger match
            const triggerMatch = strategy.Triggers?.some(t => triggers.includes(t));
            
            // Check personality match
            const personalityMatch = strategy.Profil_DISC === 'All' || 
                                  strategy.Profil_DISC.includes(personality.DISC);
            
            return triggerMatch && personalityMatch;
        });
        
        // Select best strategy (first match for now, can be improved)
        const selectedStrategy = matchingStrategies[0] || strategies[0];
        
        return {
            selected: selectedStrategy,
            alternatives: matchingStrategies.slice(1, 3),
            confidence: matchingStrategies.length > 0 ? 0.85 : 0.6
        };
    }

    generateRecommendations(analysis) {
        const recommendations = {
            language: this.getLanguageRecommendations(analysis),
            actions: this.getActionRecommendations(analysis),
            objectionHandling: this.getObjectionHandling(analysis),
            nextSteps: this.getNextSteps(analysis)
        };
        
        return recommendations;
    }

    getLanguageRecommendations(analysis) {
        const personality = analysis.personality.detected;
        const discMapping = {
            'D': 'Dominant',
            'I': 'Influence', 
            'S': 'Steady',
            'C': 'Conscientious'
        };
        const discName = discMapping[personality.DISC] || 'Steady';
        const cheatsheet = this.data.cheatsheet?.profiles?.[discName] || {};
        
        return {
            keywords: cheatsheet.keywords || [],
            phrases: cheatsheet.phrases || [],
            avoidWords: cheatsheet.avoid || [],
            tone: this.getRecommendedTone(personality.DISC, analysis.tone.selected)
        };
    }

    getActionRecommendations(analysis) {
        const score = analysis.scores.total;
        const personality = analysis.personality.detected.DISC;
        
        if (score >= 70) {
            return {
                priority: 'HIGH',
                immediate: 'Move to test drive or closing',
                approach: 'Direct and confident',
                timeline: 'Same day'
            };
        } else if (score >= 50) {
            return {
                priority: 'MEDIUM', 
                immediate: 'Address main objections',
                approach: 'Educational and supportive',
                timeline: 'Follow up within 48h'
            };
        } else {
            return {
                priority: 'LOW',
                immediate: 'Build rapport and educate',
                approach: 'Patient and informative',
                timeline: 'Long-term nurturing'
            };
        }
    }

    getObjectionHandling(analysis) {
        const triggers = analysis.triggers.selected;
        const objections = this.data.objections?.objections || [];
        
        const relevantObjections = objections.filter(obj =>
            obj.triggers?.some(t => triggers.includes(t))
        );
        
        return relevantObjections.map(obj => ({
            objection: obj.objection,
            responses: obj.rebuttals || [],
            technique: obj.technique,
            warning: obj.ethical_warning
        }));
    }

    getNextSteps(analysis) {
        const score = analysis.scores.total;
        const relationships = analysis.triggers.relationships;
        
        const steps = [];
        
        // High score - move to action
        if (score >= 70) {
            steps.push({
                action: 'Schedule test drive immediately',
                priority: 1,
                timeframe: 'Today'
            });
        }
        
        // Handle specific trigger clusters
        if (relationships.financial_cluster) {
            steps.push({
                action: 'Prepare detailed TCO calculation',
                priority: 2,
                timeframe: 'Next meeting'
            });
        }
        
        if (relationships.technical_doubt) {
            steps.push({
                action: 'Schedule technical demo with engineer',
                priority: 2,
                timeframe: 'This week'
            });
        }
        
        return steps.sort((a, b) => a.priority - b.priority);
    }

    generateEthicalWarnings(analysis) {
        const warnings = [];
        const strategy = analysis.strategy.selected;
        
        if (strategy?.Technika?.toLowerCase().includes('pressure')) {
            warnings.push({
                type: 'PRESSURE_RISK',
                message: '⚠️ Avoid high-pressure tactics. Build trust through transparency.',
                severity: 'medium'
            });
        }
        
        if (analysis.scores.total < 30) {
            warnings.push({
                type: 'LOW_INTENT',
                message: '⚠️ Customer shows low buying intent. Focus on education, not selling.',
                severity: 'high'
            });
        }
        
        if (analysis.triggers.selected.includes('Nie mogę ładować w domu')) {
            warnings.push({
                type: 'INFRASTRUCTURE_BARRIER',
                message: '⚠️ Major barrier detected. Don\'t oversell - provide realistic alternatives.',
                severity: 'high'
            });
        }
        
        return warnings;
    }

    calculateConfidence(analysis) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence based on data quality
        if (analysis.personality.confidence > 0.8) confidence += 0.2;
        if (analysis.triggers.selected.length >= 3) confidence += 0.15;
        if (Object.keys(analysis.triggers.relationships).length > 0) confidence += 0.15;
        
        return Math.min(confidence, 0.95);
    }

    // Utility methods
    generateCacheKey(input) {
        return JSON.stringify(input);
    }

    generateErrorResponse(error, input) {
        return {
            error: true,
            message: error.message,
            timestamp: new Date().toISOString(),
            input: input,
            fallback: {
                personality: { detected: this.data.personas?.personas?.[0] || {}, confidence: 0.3 },
                scores: { total: 30 },
                recommendations: { language: { phrases: ['Focus on building rapport'] } }
            }
        };
    }

    getRecommendedTone(discType, selectedTone) {
        const recommendations = {
            D: 'Direct and results-focused',
            I: 'Enthusiastic and social',
            S: 'Patient and supportive',
            C: 'Detailed and factual'
        };
        
        return recommendations[discType] || 'Adaptive';
    }

    getRecommendedApproach(tone, discType) {
        return `${tone} approach optimized for ${discType}-type personality`;
    }

    getToneAdjustments(tone, compatibility) {
        if (compatibility < 0.6) {
            return ['Consider adjusting tone', 'Add more data/facts', 'Reduce emotional appeals'];
        }
        return ['Tone is well-matched', 'Continue current approach'];
    }

    extractPersonalityTraits(persona) {
        return {
            strengths: persona.motivations || [],
            weaknesses: persona.pain_points || [],
            communication: persona.communication_style || 'adaptive',
            decisionSpeed: persona.decision_speed || 'medium'
        };
    }

    // Debug and testing methods
    enableDebugMode(enabled = true) {
        this.debugMode = enabled;
        console.log(`🐛 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    getAnalyticsData() {
        return {
            cacheSize: this.analysisCache.size,
            dataLoaded: Object.keys(this.data),
            version: '2.0'
        };
    }

    clearCache() {
        this.analysisCache.clear();
        console.log('🗑️ Analysis cache cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomerDecoderEngine;
} else {
    window.CustomerDecoderEngine = CustomerDecoderEngine;
}