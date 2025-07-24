const AdvancedTriggersDatabase = require('../../backend/AdvancedTriggersDatabase');

class TriggerDetectionEngine {
    async initialize(config) {
        this.triggers = config.triggers?.triggers || [];
        this.advancedTriggers = new AdvancedTriggersDatabase(); // Używamy istniejącej logiki
        console.log('✅ Initializing TriggerDetectionEngine...');
    }

    analyze(customerData) {
        const basicTriggers = this.analyzeTriggers(customerData.selectedTriggers);
        const advancedTriggers = this.analyzeAdvancedTriggers(customerData);
        return { ...basicTriggers, advanced: advancedTriggers };
    }

    analyzeTriggers(selectedTriggers = []) {
        if (!this.triggers) {
            return { matched: [], count: 0, intensity: 0, relationships: {} };
        }
        const matched = [];
        let totalIntensity = 0;
        const categoryCount = {};

        for (const triggerText of selectedTriggers) {
            if (!triggerText) continue;
            const trigger = this.triggers.find(t =>
                t.trigger && triggerText &&
                t.trigger.toLowerCase() === triggerText.toLowerCase()
            );
            if (trigger) {
                matched.push(trigger);
                totalIntensity += trigger.base_conversion_rate;
                const cat = trigger.category || 'other';
                categoryCount[cat] = (categoryCount[cat] || 0) + 1;
            }
        }

        return {
            matched: matched,
            count: matched.length,
            intensity: totalIntensity,
            categories: categoryCount
        };
    }

    analyzeAdvancedTriggers(customerData) {
        if (!this.advancedTriggers) {
            return { detected: [], patterns: [], confidence: 0 };
        }
        // Przekazujemy całe dane, ponieważ AdvancedTriggersDatabase może ich potrzebować
        return this.advancedTriggers.analyze(customerData, this.triggers);
    }
}

module.exports = TriggerDetectionEngine;
