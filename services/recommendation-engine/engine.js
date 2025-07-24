/**
 * Recommendation Engine Service
 * Generates recommendations and strategies.
 */
class RecommendationEngine {
    async initialize(config) {
        this.personas = config.personas || {};
        this.strategies = config.strategies || {};
        this.cheatsheet = config.cheatsheet || {};
        console.log('✅ Initializing RecommendationEngine...');
    }

    generate(analysis) {
        const personality = analysis.personality.detected;
        if (!personality) return {};

        // Extract Tesla archetype information if available
        const teslaArchetype = analysis.tesla_archetype?.analysis?.archetype || null;
        const triggers = analysis.triggers?.matched || analysis.input?.selectedTriggers || [];

        return {
            language: {
                keywords: this.getKeywords(personality),
                avoidWords: this.getAvoidWords(personality),
                phrases: this.generatePersonalizedPhrases(personality, triggers, teslaArchetype)
            },
            objectionHandling: this.generateObjectionHandling(analysis),
            nextSteps: this.generateNextSteps(analysis)
        };
    }

    generateEnhancedRecommendations(analysis) {
        const baseRecommendations = this.generate(analysis);
        const strategy = this.selectStrategy(analysis);

        // Dodaj kluczowe punkty sprzedaży na podstawie strategii
        baseRecommendations.key_selling_points = strategy.key_selling_points || [];

        // Sugestia jazdy próbnej
        if (analysis.scores.total_score > 60 && !analysis.input.hasTakenTestDrive) {
            baseRecommendations.suggested_test_drive = {
                model: strategy.recommended_models?.[0] || 'Model Y',
                reason: 'High potential score and no prior test drive indicates strong interest.'
            };
        }

        return baseRecommendations;
    }

    selectStrategy(analysis) {
        const { personality, demographics, triggers, scores } = analysis;
        let bestStrategy = { name: 'default', reason: 'No specific strategy matched' };
        let maxScore = 0;

        for (const [key, strategy] of Object.entries(this.strategies)) {
            let score = 0;
            if (strategy.personality_profile.includes(personality.detected?.DISC)) score++;
            if (demographics.income > (strategy.min_income || 0)) score++;
            if (scores.total_score > (strategy.min_score || 0)) score++;

            const triggerOverlap = triggers.matched.filter(t => strategy.target_triggers.includes(t.id)).length;
            score += triggerOverlap;

            if (score > maxScore) {
                maxScore = score;
                bestStrategy = { name: key, reason: `Best match with score ${score}`, ...strategy };
            }
        }
        return bestStrategy;
    }

    // Helper methods - to be moved from CustomerDecoderEngine
    getKeywords(personality) {
        if (!personality?.DISC || !this.cheatsheet?.profiles) return [];
        return this.cheatsheet.profiles[personality.DISC]?.keywords || [];
    }

    getAvoidWords(personality) {
        if (!personality?.DISC || !this.cheatsheet?.profiles) return [];
        return this.cheatsheet.profiles[personality.DISC]?.avoid_words || [];
    }

    generatePersonalizedPhrases(personality, triggers, teslaArchetype = null) {
        const disc = personality?.DISC;
        if (!disc || !this.cheatsheet?.profiles) return [];

        const phrases = this.cheatsheet.profiles[disc]?.phrases || [];
        const triggerKeywords = triggers.map(t => t.keywords || []).flat();

        // Filter base DISC phrases by trigger keywords
        let filteredPhrases = phrases.filter(p => p && triggerKeywords.some(kw => kw && p.toLowerCase().includes(kw)));
        
        // If no filtered phrases, return all base phrases
        if (filteredPhrases.length === 0) {
            filteredPhrases = phrases;
        }
        
        // Note: Tesla archetype-specific phrases are handled in CustomerDecoderEngine
        // This service focuses on DISC-based filtering
        return filteredPhrases;
    }

    generateObjectionHandling(analysis) {
        // Placeholder - more complex logic needed
        return [{ objection: 'Price is too high', rebuttal: 'Let\'s talk about the total cost of ownership...' }];
    }

    generateNextSteps(analysis) {
        // Placeholder - more complex logic needed
        const steps = ['Send a follow-up email'];
        if (analysis.scores.total_score > 75) {
            steps.push('Schedule a call with a product specialist');
        }
        return steps;
    }
}

module.exports = RecommendationEngine;