/**
 * Fuzzy Inference Service - Engine
 * Version 3.0 - Refactored for Microservice Architecture
 */

const fs = require('fs').promises;
const path = require('path');

class FuzzyInferenceEngine {
    constructor() {
        this.version = "3.0";
        this.config = {};
        this.initialized = false;
    }

    async initialize(configPath) {
        try {
            console.log('🔧 Initializing Fuzzy Inference Service...');
            const fullConfigPath = path.join(__dirname, '..', '..', configPath);

            const personalityWeightsPath = path.join(fullConfigPath, 'personality_weights.json');
            const contextualWeightsPath = path.join(fullConfigPath, 'contextual_weights.json');
            const microSignalsPath = path.join(fullConfigPath, 'micro_signals.json');

            const [personalityWeights, contextualWeights, microSignals] = await Promise.all([
                fs.readFile(personalityWeightsPath, 'utf8').then(JSON.parse),
                fs.readFile(contextualWeightsPath, 'utf8').then(JSON.parse),
                fs.readFile(microSignalsPath, 'utf8').then(JSON.parse)
            ]);

            this.config = {
                personalityWeights,
                contextualWeights,
                microSignals
            };

            this.initialized = true;
            console.log('✅ Fuzzy Inference Service Initialized Successfully');
            console.log('Loaded rules:', Object.keys(this.config));
        } catch (error) {
            console.error('❌ Fuzzy Inference Service initialization failed:', error);
            throw error;
        }
    }

    /**
     * Analyzes the customer's personality traits using fuzzy logic based on the loaded rules.
     * @param {object} inputData - The input data containing personality traits.
     * @param {string[]} inputData.personality_traits - An array of personality trait identifiers.
     * @returns {object} The fuzzy personality analysis result.
     */
    analyzeFuzzyPersonality(inputData) {
        if (!this.initialized) {
            throw new Error('Fuzzy Inference Service not initialized.');
        }

        console.log('🔬 Performing Fuzzy Personality Analysis on:', inputData);
        const { personality_traits = [] } = inputData;
        const fuzzyScores = { D: 0, I: 0, S: 0, C: 0 };

        personality_traits.forEach(trait => {
            if (this.config.personalityWeights[trait]) {
                for (const type in this.config.personalityWeights[trait]) {
                    if (fuzzyScores.hasOwnProperty(type)) {
                        fuzzyScores[type] += this.config.personalityWeights[trait][type];
                    }
                }
            }
        });

        const totalScore = Object.values(fuzzyScores).reduce((sum, score) => sum + score, 0);

        if (totalScore === 0) {
            return {
                dominant_personality: 'Unknown',
                scores: { D: 0, I: 0, S: 0, C: 0 },
                confidence: 0,
                version: this.version
            };
        }

        const normalizedScores = {};
        let maxScore = 0;
        let dominantPersonality = 'Unknown';

        for (const type in fuzzyScores) {
            const normalized = totalScore > 0 ? fuzzyScores[type] / totalScore : 0;
            normalizedScores[type] = parseFloat(normalized.toFixed(4));
            if (normalizedScores[type] > maxScore) {
                maxScore = normalizedScores[type];
                dominantPersonality = type;
            }
        }
        
        const confidence = parseFloat(maxScore.toFixed(4));

        console.log('📊 Fuzzy Analysis Result:', { dominantPersonality, normalizedScores, confidence });

        return {
            dominant_personality: dominantPersonality,
            scores: normalizedScores,
            confidence: confidence,
            version: this.version
        };
    }

    /**
     * Calculates dynamic weights based on the conversation stage.
     * @param {string} stage - The current stage of the conversation (e.g., 'initial', 'mid', 'final').
     * @returns {object} The dynamic weights for the given stage.
     */
    calculateDynamicWeights(stage) {
        if (!this.initialized) {
            throw new Error('Fuzzy Inference Service not initialized.');
        }
        const weights = this.config.contextualWeights[stage] || this.config.contextualWeights.default;
        console.log(`⚖️  Dynamic weights for stage '${stage}':`, weights);
        return weights;
    }

    /**
     * Analyzes the temporal context of the conversation, such as the appearance of triggers.
     * @param {object} inputData - The input data for temporal analysis.
     * @param {string[]} inputData.triggers - A list of triggers that appeared.
     * @param {number} inputData.conversation_duration - The total duration of the conversation in seconds.
     * @returns {object} The temporal analysis result.
     */
    analyzeTemporalContext(inputData) {
        if (!this.initialized) {
            throw new Error('Fuzzy Inference Service not initialized.');
        }
        const { triggers = [], conversation_duration = 1 } = inputData;
        const triggerCount = triggers.length;
        const triggerFrequency = triggerCount / conversation_duration;

        let temporalSignificance = 'low';
        if (triggerFrequency > 0.5) {
            temporalSignificance = 'high';
        } else if (triggerFrequency > 0.2) {
            temporalSignificance = 'medium';
        }

        const result = {
            trigger_count: triggerCount,
            trigger_frequency: parseFloat(triggerFrequency.toFixed(4)),
            temporal_significance: temporalSignificance,
            version: this.version
        };

        console.log('⏳ Temporal Context Analysis:', result);
        return result;
    }
}

module.exports = FuzzyInferenceEngine;