/**
 * Probability Analyzer
 * Advanced probability calculations for conversion likelihood at different stages
 */

const moment = require('moment');

class ProbabilityAnalyzer {
    constructor() {
        this.baseWeights = {
            initial_analysis: 0.2,
            post_conversation: 0.3,
            test_drive_booked: 0.6,
            post_test_drive: 0.8
        };
        
        this.behaviorModifiers = {
            excitement_high: 0.25,    // 8-10
            excitement_medium: 0.15,  // 5-7
            excitement_low: -0.1,     // 1-4
            buying_signals: 0.3,
            new_concerns: -0.15,
            multiple_interactions: 0.1,
            time_decay_factor: -0.05  // per week
        };
        
        this.discMultipliers = {
            'D': { decision_speed: 1.2, price_sensitivity: 0.9 },
            'I': { social_proof: 1.3, immediate_gratification: 1.1 },
            'S': { trust_building: 1.2, family_approval: 1.1 },
            'C': { technical_proof: 1.3, research_time: 0.8 }
        };
    }

    calculateInitialProbability(analysis) {
        let baseProbability = analysis.scores.total / 100;
        
        // Personality-based adjustments
        const personality = analysis.personality.detected;
        if (personality) {
            const discType = personality.DISC;
            const multipliers = this.discMultipliers[discType] || {};
            
            // Apply DISC-specific multipliers
            if (multipliers.decision_speed) {
                baseProbability *= multipliers.decision_speed;
            }
        }
        
        // Trigger quality adjustment
        const triggerQuality = this.assessTriggerQuality(analysis.triggers);
        baseProbability += triggerQuality * 0.1;
        
        return Math.min(Math.max(baseProbability, 0), 1);
    }

    calculatePostConversationProbability({ previousAnalysis, conversationData }) {
        const journey = previousAnalysis;
        if (!journey || !journey.stages.length) {
            return this.calculateBaseProbability(conversationData);
        }
        
        const initialStage = journey.stages.find(s => s.analysis);
        let probability = initialStage ? 
            this.calculateInitialProbability(initialStage.analysis) : 0.3;
        
        // Apply conversation outcome modifiers
        const { outcome, newTriggers, reactions } = conversationData;
        
        switch (outcome) {
            case 'very_interested':
                probability += 0.3;
                break;
            case 'interested':
                probability += 0.2;
                break;
            case 'neutral':
                probability += 0.05;
                break;
            case 'skeptical':
                probability -= 0.1;
                break;
            case 'not_interested':
                probability -= 0.3;
                break;
        }
        
        // New triggers discovered
        if (newTriggers && newTriggers.length > 0) {
            probability += newTriggers.length * 0.05;
        }
        
        // Positive reactions boost
        if (reactions) {
            const positiveReactions = reactions.filter(r => 
                ['excited', 'interested', 'impressed'].includes(r.type)
            ).length;
            probability += positiveReactions * 0.1;
            
            const negativeReactions = reactions.filter(r => 
                ['concerned', 'skeptical', 'bored'].includes(r.type)
            ).length;
            probability -= negativeReactions * 0.05;
        }
        
        return {
            probability: Math.min(Math.max(probability, 0), 1),
            stage: 'post_conversation',
            factors: this.getInfluencingFactors(conversationData),
            recommendations: this.generateProbabilityRecommendations(probability, conversationData)
        };
    }

    calculatePostDriveProbability({ customerJourney, testDriveData }) {
        if (!customerJourney) {
            return this.calculateBaseProbability(testDriveData);
        }
        
        const conversationStage = customerJourney.stages
            .filter(s => s.stage === 'post_conversation')
            .pop();
            
        let probability = conversationStage ? 
            (conversationStage.probability || 0.5) : 0.4;
        
        // Test drive specific factors
        const { excitement, buyingSignals, newConcerns, feedback } = testDriveData;
        
        // Excitement level impact (most important factor)
        if (excitement >= 9) {
            probability += 0.4;
        } else if (excitement >= 7) {
            probability += 0.25;
        } else if (excitement >= 5) {
            probability += 0.1;
        } else {
            probability -= 0.2;
        }
        
        // Buying signals
        if (buyingSignals && buyingSignals.length > 0) {
            probability += buyingSignals.length * 0.1;
            
            // Specific high-value signals
            const highValueSignals = buyingSignals.filter(signal =>
                ['asked_about_financing', 'discussed_delivery', 'mentioned_timeline', 'asked_about_trade_in']
                .includes(signal)
            );
            probability += highValueSignals.length * 0.15;
        }
        
        // New concerns penalty
        if (newConcerns && newConcerns.length > 0) {
            probability -= newConcerns.length * 0.1;
        }
        
        // Feedback analysis
        if (feedback) {
            const positiveKeywords = ['amazing', 'love', 'perfect', 'impressed', 'wow'];
            const negativeKeywords = ['disappointed', 'expected', 'issues', 'problems'];
            
            const feedbackText = feedback.toLowerCase();
            const positiveCount = positiveKeywords.filter(word => feedbackText.includes(word)).length;
            const negativeCount = negativeKeywords.filter(word => feedbackText.includes(word)).length;
            
            probability += (positiveCount * 0.05) - (negativeCount * 0.08);
        }
        
        return {
            probability: Math.min(Math.max(probability, 0), 1),
            stage: 'post_test_drive',
            confidence: this.calculateConfidence(testDriveData),
            urgency: this.calculateUrgency(testDriveData),
            factors: this.getTestDriveFactors(testDriveData),
            recommendations: this.generateClosingRecommendations(probability, testDriveData)
        };
    }

    getCurrentProbability(journey) {
        if (!journey || !journey.stages.length) {
            return { probability: 0.1, stage: 'unknown' };
        }
        
        const stages = journey.stages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const latestStage = stages[stages.length - 1];
        
        // Find the most advanced stage with probability data
        const stageOrder = ['initial_analysis', 'post_conversation', 'test_drive_booked', 'post_test_drive', 'purchase'];
        let highestStageIndex = -1;
        let probability = 0.1;
        
        stages.forEach(stage => {
            const stageIndex = stageOrder.indexOf(stage.stage);
            if (stageIndex > highestStageIndex) {
                highestStageIndex = stageIndex;
                
                if (stage.probability) {
                    probability = stage.probability;
                } else if (stage.analysis) {
                    probability = this.calculateInitialProbability(stage.analysis);
                }
            }
        });
        
        // Apply time decay
        const daysSinceUpdate = moment().diff(moment(latestStage.timestamp), 'days');
        const timeDecay = Math.min(daysSinceUpdate * 0.02, 0.3); // Max 30% decay
        probability = Math.max(probability - timeDecay, 0.05);
        
        return {
            probability,
            stage: stageOrder[highestStageIndex] || 'unknown',
            lastUpdate: latestStage.timestamp,
            daysSinceUpdate
        };
    }

    assessTriggerQuality(triggers) {
        if (!triggers.selected || triggers.selected.length === 0) {
            return 0;
        }
        
        let qualityScore = 0;
        
        // Diversity bonus
        const categories = [...new Set(triggers.selected.map(t => t.category))];
        qualityScore += Math.min(categories.length * 0.1, 0.3);
        
        // High-conversion triggers
        const highValueTriggers = triggers.selected.filter(t => 
            t.base_conversion_rate >= 70
        ).length;
        qualityScore += highValueTriggers * 0.1;
        
        // Relationship synergies
        const relationshipCount = Object.keys(triggers.relationships || {}).length;
        qualityScore += relationshipCount * 0.05;
        
        return Math.min(qualityScore, 0.5);
    }

    calculateConfidence(data) {
        let confidence = 0.5; // Base confidence
        
        // Data richness
        if (data.excitement !== undefined) confidence += 0.2;
        if (data.buyingSignals && data.buyingSignals.length > 0) confidence += 0.2;
        if (data.feedback) confidence += 0.1;
        
        return Math.min(confidence, 1);
    }

    calculateUrgency(testDriveData) {
        let urgency = 'medium'; // default
        
        if (testDriveData.excitement >= 8 && 
            testDriveData.buyingSignals && 
            testDriveData.buyingSignals.length >= 2) {
            urgency = 'high';
        } else if (testDriveData.excitement <= 5 || 
                   (testDriveData.newConcerns && testDriveData.newConcerns.length >= 2)) {
            urgency = 'low';
        }
        
        return urgency;
    }

    getInfluencingFactors(data) {
        const factors = [];
        
        if (data.outcome === 'very_interested') {
            factors.push({ factor: 'High interest expressed', impact: '+30%' });
        }
        
        if (data.newTriggers && data.newTriggers.length > 0) {
            factors.push({ 
                factor: `${data.newTriggers.length} new triggers discovered`, 
                impact: `+${data.newTriggers.length * 5}%` 
            });
        }
        
        return factors;
    }

    getTestDriveFactors(data) {
        const factors = [];
        
        factors.push({ 
            factor: 'Excitement Level', 
            value: `${data.excitement}/10`,
            impact: data.excitement >= 7 ? 'Positive' : data.excitement >= 5 ? 'Neutral' : 'Negative'
        });
        
        if (data.buyingSignals && data.buyingSignals.length > 0) {
            factors.push({
                factor: 'Buying Signals',
                value: data.buyingSignals.length,
                impact: 'Very Positive'
            });
        }
        
        if (data.newConcerns && data.newConcerns.length > 0) {
            factors.push({
                factor: 'New Concerns',
                value: data.newConcerns.length,
                impact: 'Negative'
            });
        }
        
        return factors;
    }

    generateProbabilityRecommendations(probability, data) {
        const recommendations = [];
        
        if (probability >= 0.7) {
            recommendations.push({
                priority: 'high',
                action: 'Schedule test drive immediately',
                reason: 'High conversion probability'
            });
        } else if (probability >= 0.4) {
            recommendations.push({
                priority: 'medium',
                action: 'Send personalized follow-up materials',
                reason: 'Moderate interest, needs nurturing'
            });
        } else {
            recommendations.push({
                priority: 'low',
                action: 'Long-term nurturing campaign',
                reason: 'Low current probability'
            });
        }
        
        return recommendations;
    }

    generateClosingRecommendations(probability, testDriveData) {
        const recommendations = [];
        
        if (probability >= 0.8) {
            recommendations.push({
                priority: 'critical',
                action: 'Present purchase offer NOW',
                timing: 'Immediate',
                reason: 'Optimal closing moment'
            });
        } else if (probability >= 0.6) {
            recommendations.push({
                priority: 'high',
                action: 'Address remaining concerns and follow up within 24h',
                timing: '24 hours',
                reason: 'Strong interest with minor hesitations'
            });
        } else {
            recommendations.push({
                priority: 'medium',
                action: 'Nurture relationship and provide additional value',
                timing: '3-7 days',
                reason: 'Interest present but needs development'
            });
        }
        
        return recommendations;
    }

    calculateBaseProbability(data) {
        return {
            probability: 0.3,
            stage: 'unknown',
            confidence: 0.1,
            factors: []
        };
    }
}

module.exports = ProbabilityAnalyzer;