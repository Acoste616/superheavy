/**
 * Scoring Aggregation Service - Engine
 * Calculates and aggregates various scores.
 */
class ScoringAggregationEngine {
    async initialize(config) {
        this.weights = config.weights || {};
        this.polishSegments = config.polishSegments || {};
        console.log('✅ Initializing ScoringAggregationEngine...');
    }

    calculateScores(analysis) {
        const scores = {};

        // 1. BASE TRIGGER INTENSITY
        scores.trigger_match = Math.min(analysis.triggers.intensity / analysis.triggers.count || 0, 100);

        // 2. PERSONALITY RESONANCE
        let personalityResonanceScore = 0;
        const personality = analysis.personality.detected;
        if (personality && personality.DISC) {
            for (const trigger of analysis.triggers.matched) {
                const resonance = trigger.personality_resonance?.[personality.DISC] || 0.5;
                personalityResonanceScore += (resonance * 100);
            }
            personalityResonanceScore = personalityResonanceScore / analysis.triggers.count || 50;
        }
        scores.personality_alignment = personalityResonanceScore || 50;

        // 3. TONE COMPATIBILITY
        if (personality && analysis.tone.compatibility[personality.DISC]) {
            scores.tone_compatibility = analysis.tone.compatibility[personality.DISC] * 100;
        } else {
            scores.tone_compatibility = 50;
        }

        // 4. DEMOGRAPHIC SCORE
        scores.demographic_fit = analysis.demographics.score || 50;

        // Obliczanie wyniku końcowego
        const total = (scores.trigger_match * 0.4) + 
                      (scores.personality_alignment * 0.3) + 
                      (scores.tone_compatibility * 0.15) + 
                      (scores.demographic_fit * 0.15);

        scores.total_score = Math.round(total);
        return scores;
    }

    calculateAdvancedScoring2025(analysis, marketData) {
        const baseScores = this.calculateScores(analysis);
        let enhancedTotal = baseScores.total_score;

        // Modyfikatory z danych rynkowych
        if (marketData) {
            enhancedTotal += marketData.market_readiness_score * 0.1;
            enhancedTotal += (marketData.charging_infrastructure?.total_stations / 100);
        }

        // Modyfikatory z segmentów rynku
        const segment = this.polishSegments[analysis.strategy?.segment];
        if (segment) {
            enhancedTotal += segment.conversion * 20;
        }

        return {
            ...baseScores,
            enhanced_total: Math.min(Math.round(enhancedTotal), 100),
            market_opportunity: marketData?.market_readiness_score || 0
        };
    }

    calculateConfidence(analysis) {
        let confidence = 0.5;
        confidence += (analysis.triggers.count / 10); // +0.1 za każdy trigger
        confidence += analysis.personality.confidence * 0.2;
        confidence += analysis.fuzzy_personality.confidence * 0.2;
        return Math.min(confidence, 1.0);
    }
}

module.exports = ScoringAggregationEngine;