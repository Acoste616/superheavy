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
        this.marketData = {};
        this.version = "2.0";
        this.complianceMode = true;
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
            
            this.initialized = true;
            console.log(`✅ Customer Decoder Engine ${this.version} initialized`);
            
        } catch (error) {
            console.error('❌ Engine initialization failed:', error);
            throw error;
        }
    }

    analyzeCustomer(inputData) {
        if (!this.initialized) {
            throw new Error('Engine not initialized');
        }

        const personalityAnalysis = this.analyzePersonality(inputData);
        
        const analysis = {
            timestamp: new Date().toISOString(),
            input: inputData,
            personality: personalityAnalysis,
            triggers: this.analyzeTriggers(inputData.selectedTriggers),
            tone: this.analyzeTone(inputData.tone),
            demographics: this.analyzeDemographics(inputData.demographics),
            scores: {},
            recommendations: {},
            strategy: {},
            warnings: [],
            confidence: 0
        };

        // Calculate comprehensive scores (2.0 with market data)
        analysis.scores = this.calculateAdvancedScoring2025(analysis);
        
        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(analysis);
        
        // Select strategy
        analysis.strategy = this.selectStrategy(analysis);
        
        // Generate ethical warnings with AI Guard-Rails
        analysis.warnings = this.generateWarnings(analysis);
        analysis.compliance = this.applyAIGuardRails(analysis);
        
        // Calculate overall confidence
        analysis.confidence = this.calculateConfidence(analysis);
        
        // Add conversion_probability for frontend compatibility
        analysis.conversion_probability = analysis.scores.enhanced_total || analysis.scores.total || 0;
        
        // Add quick_responses for frontend compatibility
        analysis.quick_responses = this.generateQuickResponses(analysis);

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
                    // Scale resonance (0-1) to percentage and combine with base rate
                    const triggerScore = (resonance * 100) * (trigger.base_conversion_rate / 100);
                    score += triggerScore;
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

        const finalConfidence = isNaN(highestScore) || highestScore <= 0 ? 75 : Math.min(highestScore, 100);
        
        // Create a copy of the detected persona with confidence
        const detectedPersona = bestMatch || personas[0];
        const detectedWithConfidence = {
            ...detectedPersona,
            confidence: finalConfidence
        };
        
        return {
            detected: detectedWithConfidence,
            confidence: finalConfidence,
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
            housingType: demographics.housingType || 'unknown', 
            hasPV: demographics.hasPV || 'unknown',
            region: demographics.region || 'unknown',
            score: this.calculateDemographicScore(demographics),
            modifiers: this.getDemographicModifiers(demographics)
        };
    }

    calculateScores(analysis) {
        const scores = {};

        // 1. BASE TRIGGER INTENSITY - sum of base_conversion_rates
        let baseTriggerScore = 0;
        for (const trigger of analysis.triggers.selected) {
            baseTriggerScore += trigger.base_conversion_rate || 0;
        }
        // Normalize: 3 triggers x 60% average = 180, scale to 100
        scores.trigger_match = Math.min(baseTriggerScore / analysis.triggers.selected.length || 0, 100);

        // 2. PERSONALITY RESONANCE - how well triggers match detected personality
        let personalityResonanceScore = 0;
        const personality = analysis.personality.detected;
        if (personality && personality.DISC) {
            for (const trigger of analysis.triggers.selected) {
                const resonance = trigger.personality_resonance?.[personality.DISC] || 0.5;
                personalityResonanceScore += (resonance * 100);
            }
            personalityResonanceScore = personalityResonanceScore / analysis.triggers.selected.length || 50;
        }
        scores.personality_alignment = personalityResonanceScore || 50;

        // 3. TONE COMPATIBILITY - proper tone vs personality match
        if (personality && analysis.tone.compatibility[personality.DISC]) {
            scores.tone_compatibility = analysis.tone.compatibility[personality.DISC] * 100;
        } else {
            scores.tone_compatibility = 50;
        }

        // 4. CONVERSION MODIFIERS - the most important missing piece!
        let modifierBonus = 0;
        const demographics = analysis.demographics;
        
        for (const trigger of analysis.triggers.selected) {
            const modifiers = trigger.conversion_modifiers || {};
            
            // Apply demographic-based modifiers from trigger data
            if (demographics.hasPV === 'true' && modifiers.has_home_pv) {
                modifierBonus += modifiers.has_home_pv;
            }
            if (demographics.housingType === 'dom' && modifiers.has_home_charging) {
                modifierBonus += modifiers.has_home_charging;
            }
            if (modifiers.business_owner && (
                analysis.triggers.selected.some(t => 
                    t.text.toLowerCase().includes('firma') || 
                    t.text.toLowerCase().includes('flota') ||
                    t.text.toLowerCase().includes('biznes') ||
                    t.text.toLowerCase().includes('tax') ||
                    t.id.includes('business') ||
                    t.id.includes('fleet')
                ) || modifiers.business_owner > 0)) { // If trigger has business modifier, assume business context
                modifierBonus += modifiers.business_owner;
            }
            if (modifiers.family_with_children && analysis.triggers.selected.some(t => 
                t.text.toLowerCase().includes('rodzin') || t.text.toLowerCase().includes('dziec'))) {
                modifierBonus += modifiers.family_with_children;
            }
            if (modifiers.first_time_ev_buyer && !analysis.triggers.selected.some(t => 
                t.text.toLowerCase().includes('testowałem'))) {
                modifierBonus += modifiers.first_time_ev_buyer;
            }
            // Negative modifiers
            if (modifiers.luxury_car_background && analysis.triggers.selected.some(t => 
                t.text.toLowerCase().includes('prestiż') || t.text.toLowerCase().includes('status'))) {
                modifierBonus += modifiers.luxury_car_background; // Already negative
            }
        }
        
        scores.conversion_modifiers = Math.max(0, Math.min(modifierBonus, 50)); // Cap at +50%

        // 5. TRIGGER RELATIONSHIPS - synergies between triggers
        const relationshipBonus = Object.values(analysis.triggers.relationships)
            .reduce((sum, rel) => sum + rel.synergy, 0);
        scores.trigger_combinations = Math.min(relationshipBonus, 30); // Max 30 points

        // ENHANCED WEIGHTS - more realistic distribution
        const enhancedWeights = {
            trigger_match: 0.30,           // Base trigger strength
            personality_alignment: 0.25,   // How well triggers fit personality
            conversion_modifiers: 0.20,    // Demographic fit (was missing!)
            tone_compatibility: 0.15,      // Tone matching
            trigger_combinations: 0.10     // Synergy bonuses
        };

        // Calculate weighted total
        scores.total = Math.round(
            scores.trigger_match * enhancedWeights.trigger_match +
            scores.personality_alignment * enhancedWeights.personality_alignment +
            scores.conversion_modifiers * enhancedWeights.conversion_modifiers +
            scores.tone_compatibility * enhancedWeights.tone_compatibility +
            scores.trigger_combinations * enhancedWeights.trigger_combinations
        );

        // Final demographic adjustment
        scores.total = Math.round(scores.total + analysis.demographics.score * 0.05); // Small boost

        // Ensure realistic range: 15-95%
        scores.total = Math.max(15, Math.min(scores.total, 95));

        return scores;
    }

    generateRecommendations(analysis) {
        const personality = analysis.personality.detected;
        const selectedTriggers = analysis.triggers.selected || [];
        
        // Extract key messages from personality and triggers
        const keyMessages = [];
        if (personality && personality.sales_approach && personality.sales_approach.key_messages) {
            keyMessages.push(...personality.sales_approach.key_messages);
        }
        
        // Add trigger-specific messages
        for (const trigger of selectedTriggers) {
            if (trigger.response_strategies && trigger.response_strategies[personality.DISC]) {
                const strategy = trigger.response_strategies[personality.DISC];
                if (strategy.key_messages) {
                    keyMessages.push(...strategy.key_messages.slice(0, 2));
                }
            }
        }

        const recommendations = {
            strategy: personality && personality.sales_approach ? personality.sales_approach.primary_strategy : "Personalized approach based on detected personality",
            key_messages: [...new Set(keyMessages)].slice(0, 5), // Remove duplicates and limit
            language: {
                keywords: this.getKeywords(personality),
                avoidWords: this.getAvoidWords(personality),
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

    // ENHANCED SCORING 2.0 - Now uses ML-style feature weighting
    calculateAdvancedScoring2025(analysis) {
        const scores = this.calculateScores(analysis); // Keep old system as base
        const demographics = analysis.demographics;
        
        // NEW FEATURES FROM RESEARCH 2025
        const chargerDensity = this.calculateChargerDensityScore(demographics.region);
        const competitorGap = this.calculateCompetitorPriceGap();
        const financing = this.calculateFinancingAffordability(demographics);
        const subsidyAvail = this.calculateNaszEautoAvailability();
        
        // ENHANCED FEATURE VECTOR (ML-ready)
        const features = {
            // Original features (transformed)
            trigger_strength: scores.trigger_match / 100,
            personality_alignment: scores.personality_alignment / 100,
            tone_compatibility: scores.tone_compatibility / 100,
            
            // NEW 2025 FEATURES
            charger_density: chargerDensity.normalized_score / 100,
            competitor_price_pressure: Math.max(0, (competitorGap.price_pressure_modifier + 25) / 50),
            financing_affordability: financing.affordability_score / 100,
            subsidy_availability: subsidyAvail.expected_availability,
            
            // INTERACTION FEATURES
            housing_charging_synergy: this.calculateHousingChargingSynergy(demographics, chargerDensity),
            price_sensitivity_context: this.calculatePriceSensitivityContext(analysis.triggers.selected, competitorGap)
        };
        
        // ML-STYLE COEFFICIENTS (would be trained on real data)
        const coefficients = {
            trigger_strength: 0.28,
            personality_alignment: 0.20,
            charger_density: 0.15,
            financing_affordability: 0.12,
            competitor_price_pressure: 0.10,
            tone_compatibility: 0.08,
            subsidy_availability: 0.04,
            housing_charging_synergy: 0.02,
            price_sensitivity_context: 0.01
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
        
        // CALIBRATION - Ensure realistic range
        enhancedScore = Math.max(15, Math.min(enhancedScore, 92));
        
        return {
            ...scores, // Keep original scores for comparison
            enhanced_total: Math.round(enhancedScore),
            feature_contributions: featureContributions,
            market_factors: {
                charger_density: chargerDensity,
                competitor_gap: competitorGap,
                financing: financing,
                subsidy_availability: subsidyAvail
            },
            confidence: this.calculateEnhancedConfidence(featureContributions),
            version: "2.0"
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

    generatePersonalizedPhrases(personality) {
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
        return cheatsheet[profileName]?.phrases || [];
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

    generateQuickResponses(analysis) {
        if (!analysis.personality.detected || !analysis.triggers.selected) {
            return [];
        }

        const personality = analysis.personality.detected;
        const selectedTriggers = analysis.triggers.selected;
        const quickResponses = [];

        // First priority: Get trigger-specific responses based on personality
        for (const trigger of selectedTriggers) {
            if (trigger.response_strategies && trigger.response_strategies[personality.DISC]) {
                const strategy = trigger.response_strategies[personality.DISC];
                if (strategy.key_messages && strategy.key_messages.length > 0) {
                    quickResponses.push(...strategy.key_messages.slice(0, 2));
                }
            } else if (trigger.quick_response && trigger.quick_response.immediate_reply) {
                quickResponses.push(trigger.quick_response.immediate_reply);
            }
        }

        // Second priority: Get personality-specific phrases from cheatsheet
        if (quickResponses.length < 3) {
            const phrases = this.generatePersonalizedPhrases(personality);
            quickResponses.push(...phrases.slice(0, 3 - quickResponses.length));
        }

        // Third priority: Fallback responses
        if (quickResponses.length === 0) {
            const defaultResponses = {
                'D': [
                    "Tesla oferuje najlepszy ROI na rynku elektrycznych pojazdów.",
                    "Ta technologia da Panu przewagę konkurencyjną.",
                    "Tesla to lider w innowacyjnych rozwiązaniach transportowych."
                ],
                'I': [
                    "Tesla to nie tylko samochód - to społeczność innowatorów!",
                    "Będzie Pan częścią rewolucji transportowej.",
                    "Tesla przyciąga uwagę i pokazuje wizjonerskie myślenie."
                ],
                'S': [
                    "Tesla oferuje 8-letnią gwarancję na baterie dla Pana spokoju.",
                    "To sprawdzona, niezawodna technologia - zaufały jej już tysiące rodzin.",
                    "Naszym priorytetem jest bezpieczeństwo i stabilność."
                ],
                'C': [
                    "Tesla ma najwyższą ocenę bezpieczeństwa - 5 gwiazdek Euro NCAP.",
                    "Oto szczegółowe dane techniczne potwierdzające efektywność.",
                    "Analiza TCO pokazuje oszczędności na poziomie 30,000 PLN rocznie."
                ]
            };
            
            const disc = personality.DISC;
            quickResponses.push(...(defaultResponses[disc] || defaultResponses['S']));
        }

        // Remove duplicates and limit to 5
        const uniqueResponses = [...new Set(quickResponses)];
        return uniqueResponses.slice(0, 5);
    }
}

module.exports = CustomerDecoderEngine;