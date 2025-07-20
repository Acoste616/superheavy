/**
 * Customer Decoder Engine - Backend Module
 * Enhanced version of the frontend logic engine with server-side capabilities
 */

const fs = require('fs').promises;
const path = require('path');

class CustomerDecoderEngine {
    constructor() {
        this.data = {};
        this.weights = {
            trigger_match: 0.35,
            personality_alignment: 0.25,
            tone_compatibility: 0.15,
            trigger_combinations: 0.15,
            demographic_fit: 0.10
        };
        this.initialized = false;
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
            
            this.initialized = true;
            console.log('✅ Customer Decoder Engine initialized');
            
        } catch (error) {
            console.error('❌ Engine initialization failed:', error);
            throw error;
        }
    }

    analyzeCustomer(inputData) {
        if (!this.initialized) {
            throw new Error('Engine not initialized');
        }

        const analysis = {
            timestamp: new Date().toISOString(),
            input: inputData,
            personality: this.analyzePersonality(inputData),
            triggers: this.analyzeTriggers(inputData.selectedTriggers),
            tone: this.analyzeTone(inputData.tone),
            demographics: this.analyzeDemographics(inputData.demographics),
            scores: {},
            recommendations: {},
            strategy: {},
            warnings: [],
            confidence: 0
        };

        // Calculate comprehensive scores
        analysis.scores = this.calculateScores(analysis);
        
        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(analysis);
        
        // Select strategy
        analysis.strategy = this.selectStrategy(analysis);
        
        // Generate ethical warnings
        analysis.warnings = this.generateWarnings(analysis);
        
        // Calculate overall confidence
        analysis.confidence = this.calculateConfidence(analysis);

        return analysis;
    }

    analyzePersonality(inputData) {
        const selectedTriggers = inputData.selectedTriggers || [];
        const personas = this.data.personas?.personas || [];
        
        if (personas.length === 0) {
            console.warn('No personas loaded');
            return { detected: null, confidence: 0, autoDetected: true };
        }

        let bestMatch = null;
        let highestScore = 0;

        // Auto-detect personality based on triggers
        for (const persona of personas) {
            let score = 0;
            let triggerMatches = 0;

            for (const triggerText of selectedTriggers) {
                const trigger = this.findTrigger(triggerText);
                if (trigger && trigger.personality_resonance) {
                    const resonance = trigger.personality_resonance[persona.DISC] || 0;
                    score += resonance * trigger.base_conversion_rate;
                    triggerMatches++;
                }
            }

            if (triggerMatches > 0) {
                score = score / triggerMatches; // Average score
                
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = persona;
                }
            }
        }

        return {
            detected: bestMatch || personas[0],
            confidence: Math.min(highestScore / 100, 1),
            autoDetected: true,
            alternatives: personas.filter(p => p !== bestMatch).slice(0, 2)
        };
    }

    analyzeTriggers(selectedTriggers = []) {
        const triggers = this.data.triggers?.triggers || [];
        const triggerData = [];
        let totalIntensity = 0;
        const relationships = {};

        for (const triggerText of selectedTriggers) {
            const trigger = triggers.find(t => t.text === triggerText);
            if (trigger) {
                triggerData.push(trigger);
                totalIntensity += trigger.base_conversion_rate || 0;
            }
        }

        // Analyze trigger relationships
        if (triggerData.length >= 2) {
            const relationshipMatrix = this.data.triggers?.relationship_matrix || {};
            
            for (let i = 0; i < triggerData.length; i++) {
                for (let j = i + 1; j < triggerData.length; j++) {
                    const trigger1 = triggerData[i];
                    const trigger2 = triggerData[j];
                    const relationshipKey = `${trigger1.category}_${trigger2.category}`;
                    
                    if (relationshipMatrix[relationshipKey]) {
                        const synergy = relationshipMatrix[relationshipKey].synergy || 0;
                        if (synergy > 0) {
                            relationships[relationshipKey] = {
                                triggers: [trigger1.text, trigger2.text],
                                synergy: synergy,
                                description: relationshipMatrix[relationshipKey].description
                            };
                        }
                    }
                }
            }
        }

        return {
            selected: triggerData,
            count: triggerData.length,
            intensityScore: totalIntensity,
            relationships: relationships,
            categories: [...new Set(triggerData.map(t => t.category))]
        };
    }

    analyzeTone(selectedTone) {
        const toneCompatibility = {
            'entuzjastyczny': { I: 0.9, D: 0.7, S: 0.6, C: 0.4 },
            'profesjonalny': { D: 0.9, C: 0.8, S: 0.7, I: 0.6 },
            'przyjacielski': { S: 0.9, I: 0.8, D: 0.6, C: 0.5 },
            'techniczny': { C: 0.9, D: 0.7, S: 0.6, I: 0.4 }
        };

        return {
            selected: selectedTone,
            compatibility: toneCompatibility[selectedTone] || {},
            description: this.getToneDescription(selectedTone)
        };
    }

    analyzeDemographics(demographics = {}) {
        return {
            age: demographics.age || 'unknown',
            hasPV: demographics.hasPV || 'unknown',
            region: demographics.region || 'unknown',
            score: this.calculateDemographicScore(demographics)
        };
    }

    calculateScores(analysis) {
        const scores = {};

        // Trigger match score
        scores.trigger_match = Math.min(analysis.triggers.intensityScore / 10, 100);

        // Personality alignment score  
        const personality = analysis.personality.detected;
        if (personality && analysis.tone.compatibility[personality.DISC]) {
            scores.personality_alignment = analysis.tone.compatibility[personality.DISC] * 100;
        } else {
            scores.personality_alignment = 50; // Default
        }

        // Tone compatibility score
        scores.tone_compatibility = (analysis.personality.confidence * 100) || 50;

        // Trigger combinations score
        const relationshipBonus = Object.values(analysis.triggers.relationships)
            .reduce((sum, rel) => sum + rel.synergy, 0);
        scores.trigger_combinations = Math.min(50 + relationshipBonus, 100);

        // Demographic fit score
        scores.demographic_fit = analysis.demographics.score;

        // Calculate weighted total
        scores.total = Math.round(
            scores.trigger_match * this.weights.trigger_match +
            scores.personality_alignment * this.weights.personality_alignment +
            scores.tone_compatibility * this.weights.tone_compatibility +
            scores.trigger_combinations * this.weights.trigger_combinations +
            scores.demographic_fit * this.weights.demographic_fit
        );

        return scores;
    }

    generateRecommendations(analysis) {
        const personality = analysis.personality.detected;
        const recommendations = {
            language: {
                keywords: personality?.communication_preferences?.key_language || [],
                avoidWords: personality?.communication_preferences?.avoid_language || [],
                phrases: this.generatePersonalizedPhrases(personality)
            },
            objectionHandling: this.generateObjectionHandling(analysis),
            nextSteps: this.generateNextSteps(analysis)
        };

        return recommendations;
    }

    selectStrategy(analysis) {
        const personality = analysis.personality.detected;
        const rules = this.data.rules || [];
        
        // Find best matching strategy
        let bestStrategy = null;
        let highestMatch = 0;

        for (const rule of rules) {
            let matchScore = 0;
            const ruleTriggers = rule.Triggers || [];
            
            for (const trigger of analysis.triggers.selected) {
                if (ruleTriggers.some(rt => rt.toLowerCase().includes(trigger.text.toLowerCase()))) {
                    matchScore += trigger.base_conversion_rate || 0;
                }
            }

            if (matchScore > highestMatch) {
                highestMatch = matchScore;
                bestStrategy = rule;
            }
        }

        return {
            selected: bestStrategy,
            matchScore: highestMatch,
            personalizedApproach: personality?.sales_approach
        };
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
        let confidence = 0;
        let factors = 0;

        if (analysis.personality.confidence > 0) {
            confidence += analysis.personality.confidence;
            factors++;
        }

        if (analysis.triggers.count > 0) {
            confidence += Math.min(analysis.triggers.count / 5, 1);
            factors++;
        }

        if (Object.keys(analysis.triggers.relationships).length > 0) {
            confidence += 0.2;
            factors++;
        }

        return factors > 0 ? confidence / factors : 0;
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
        let score = 50; // Base score
        
        if (demographics.age) score += 10;
        if (demographics.hasPV === 'tak') score += 20;
        if (demographics.region) score += 10;
        
        return Math.min(score, 100);
    }

    generatePersonalizedPhrases(personality) {
        if (!personality) return [];
        
        const cheatsheet = this.data.cheatsheet?.phrases || {};
        const discType = personality.DISC;
        
        return cheatsheet[discType] || [];
    }

    generateObjectionHandling(analysis) {
        const objections = this.data.objections?.objections || [];
        const relevantObjections = [];

        for (const trigger of analysis.triggers.selected) {
            const matchingObjections = objections.filter(obj => 
                obj.trigger_patterns?.some(pattern => 
                    trigger.text.toLowerCase().includes(pattern.toLowerCase())
                )
            );
            relevantObjections.push(...matchingObjections);
        }

        return [...new Set(relevantObjections)]; // Remove duplicates
    }

    generateNextSteps(analysis) {
        const steps = [];
        const personality = analysis.personality.detected;
        
        if (analysis.scores.total >= 70) {
            steps.push({
                priority: 1,
                action: 'Zaproponuj jazdę testową',
                timeframe: '24-48 godzin',
                reason: 'Wysokie prawdopodobieństwo konwersji'
            });
        } else if (analysis.scores.total >= 40) {
            steps.push({
                priority: 2,
                action: 'Wyślij dodatkowe materiały',
                timeframe: '24 godziny',
                reason: 'Potrzeba budowania zaufania'
            });
        } else {
            steps.push({
                priority: 3,
                action: 'Przeprowadź kolejną rozmowę',
                timeframe: '1 tydzień',
                reason: 'Zbyt niskie zainteresowanie'
            });
        }

        return steps;
    }
}

module.exports = CustomerDecoderEngine;