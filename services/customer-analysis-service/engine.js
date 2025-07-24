/**
 * Customer Analysis Service - Engine
 * Analyzes core customer attributes like personality, tone, and demographics.
 */
class CustomerAnalysisEngine {
    constructor() {
        this.version = "1.0";
    }

    async initialize(config) {
        console.log('🔧 Initializing Customer Analysis Service...');
        this.personas = config.personas;
        this.triggers = config.triggers;
        console.log('✅ Customer Analysis Service Initialized Successfully');
    }

    analyze(customerData) {
        console.log('🔬 Analyzing customer data:', customerData);
        const personality = this.analyzePersonality(customerData);
        const tone = this.analyzeTone(customerData.tone);
        const demographics = this.analyzeDemographics(customerData.demographics);
        const subtypeId = this.detectSubtype(demographics.data || demographics);

        return {
            personality,
            tone,
            demographics,
            subtypeId,
            version: this.version
        };
    }

    analyzePersonality(inputData, marketData = null) {
        const selectedTriggers = inputData.selectedTriggers || [];
        const personas = this.personas?.personas || [];
        
        if (personas.length === 0) {
            console.warn('No personas loaded');
            return { detected: null, confidence: 0, autoDetected: true, fallback_used: true };
        }

        let bestMatch = null;
        let highestScore = 0;
        let fallbackUsed = false;

        if (selectedTriggers.length === 0) {
            console.log('🔄 No triggers selected, using demographic + market data fallback');
            bestMatch = this.predictPersonalityFromDemographics(inputData, marketData);
            fallbackUsed = true;
            
            return {
                detected: bestMatch,
                confidence: 0.5, // 50% confidence for fallback
                autoDetected: true,
                fallback_used: true,
                fallback_reason: 'no_triggers_selected',
                alternatives: personas.filter(p => p !== bestMatch).slice(0, 2)
            };
        }

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

        const confidence = Math.min(highestScore / 100, 1);
        if (confidence < 0.3) {
            console.log('🔄 Low trigger confidence, enhancing with demographic data');
            const demographicPersonality = this.predictPersonalityFromDemographics(inputData, marketData);
            
            if (demographicPersonality && demographicPersonality.DISC !== bestMatch?.DISC) {
                bestMatch = demographicPersonality;
                fallbackUsed = true;
            }
        }

        return {
            detected: bestMatch || personas.find(p => p.DISC === 'S'),
            confidence: Math.max(confidence, 0.4),
            autoDetected: true,
            fallback_used: fallbackUsed,
            alternatives: personas.filter(p => p !== bestMatch).slice(0, 2)
        };
    }

    analyzeTone(tone) {
        // TODO: Move logic from CustomerDecoderEngine
        return { message: 'Tone analysis pending implementation.' };
    }

    predictPersonalityFromDemographics(inputData, marketData = null) {
        const personas = this.personas?.personas || [];
        if (personas.length === 0) return null;

        const demographics = inputData.demographics || {};
        const age = parseInt(demographics.age) || 35;
        const city = inputData.city || demographics.city || 'Warsaw';
        const income = this.parseIncome(demographics.income || inputData.income || 100000);
        
        const discScores = {
            'D': 0, 'I': 0, 'S': 0, 'C': 0
        };

        if (income > 150000) discScores['D'] += 2;
        if (income < 90000) discScores['S'] += 1;
        if (age > 40) discScores['S'] += 1; discScores['C'] += 1;
        if (age < 30) discScores['I'] += 2;

        let highestScore = -1;
        let predictedDisc = 'S';
        for (const disc in discScores) {
            if (discScores[disc] > highestScore) {
                highestScore = discScores[disc];
                predictedDisc = disc;
            }
        }

        return personas.find(p => p.DISC === predictedDisc);
    }

    findTrigger(triggerText) {
        if (!triggerText || !this.triggers?.triggers) return null;
        return this.triggers.triggers.find(t => 
            t.trigger && triggerText && 
            t.trigger.toLowerCase() === triggerText.toLowerCase()
        );
    }

    parseIncome(income) {
        if (typeof income === 'number') return income;
        if (typeof income === 'string') {
            return parseInt(income.replace(/[^0-9]/g, '')) || 0;
        }
        return 0;
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

    getToneDescription(tone) {
        const descriptions = {
            'entuzjastyczny': 'Wysoka energia, skupienie na wizji i korzyściach emocjonalnych.',
            'profesjonalny': 'Fakty, dane, ROI, merytoryczna argumentacja.',
            'przyjacielski': 'Budowanie relacji, bezpieczeństwo, wsparcie.',
            'techniczny': 'Specyfikacje, szczegóły, porównania, dane techniczne.'
        };
        return descriptions[tone] || 'Brak opisu dla wybranego tonu.';
    }

    analyzeDemographics(demographics = {}) {
        return {
            age: demographics.age || 'unknown',
            housingType: demographics.housingType || 'unknown', 
            hasPV: demographics.hasPV || 'unknown',
            region: demographics.region || 'unknown',
            relationshipStatus: demographics.relationshipStatus || 'unknown',
            hasChildren: demographics.hasChildren || 'unknown',
            teslaExperience: demographics.teslaExperience || 'unknown',
            carRole: demographics.carRole || 'unknown',
            score: this.calculateDemographicScore(demographics),
            modifiers: this.getDemographicModifiers(demographics)
        };
    }

    calculateDemographicScore(demographics) {
        let score = 0;
        if (demographics.hasPV === 'tak') score += 15;
        if (demographics.housingType === 'dom') score += 10;
        if (parseInt(demographics.age) > 30 && parseInt(demographics.age) < 55) score += 5;
        return score;
    }

    getDemographicModifiers(demographics) {
        const modifiers = [];
        if (demographics.hasChildren === 'tak') modifiers.push({ factor: 'family_focus', value: 1.2 });
        if (demographics.teslaExperience === 'wlasciciel') modifiers.push({ factor: 'loyalty_boost', value: 1.5 });
        return modifiers;
    }

    detectSubtype(demographics) {
        const age = parseInt(demographics.age) || 0;
        if (demographics.hasChildren === 'tak' && demographics.hasPV === 'tak') return 1; // eco_family
        if (demographics.carRole === 'business') return 4; // business_roi
        if (age > 60) return 3; // senior_comfort
        if (demographics.relationshipStatus === 'single' && age < 30) return 5; // young_urban
        // ❓ TODO refine subtype rules
        return 10; // default budget_driver
    }
}

module.exports = CustomerAnalysisEngine;
