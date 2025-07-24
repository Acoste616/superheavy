/**
 * Tesla Customer Decoder - Trigger Detection Service
 * Mikro-usługa odpowiedzialna za wykrywanie i analizę triggerów klientów
 * 
 * @version 2.0
 * @author TRAE AI Assistant
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class TriggerDetectionService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3002;
        this.serviceName = 'trigger-detection';
        this.version = '2.0';
        
        // Data storage
        this.triggers = new Map();
        this.triggerRules = new Map();
        this.triggerWeights = new Map();
        
        this.setupMiddleware();
        this.loadData();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            const requestId = req.headers['x-request-id'] || uuidv4();
            req.requestId = requestId;
            
            console.log(`[${this.serviceName}] [${new Date().toISOString()}] ${req.method} ${req.path} - Request ID: ${requestId}`);
            
            res.setHeader('X-Request-ID', requestId);
            res.setHeader('X-Service', this.serviceName);
            res.setHeader('X-Version', this.version);
            
            next();
        });
    }

    loadData() {
        try {
            // Load triggers data
            const triggersPath = path.join(__dirname, '../../../shared/data/triggers.json');
            console.log(`[${this.serviceName}] Loading triggers from: ${triggersPath}`);
            
            if (fs.existsSync(triggersPath)) {
                const triggersData = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
                console.log(`[${this.serviceName}] Triggers file structure:`, {
                    isArray: Array.isArray(triggersData),
                    hasTriggersProperty: !!triggersData.triggers,
                    triggersCount: triggersData.triggers ? triggersData.triggers.length : 0
                });
                
                if (Array.isArray(triggersData)) {
                    triggersData.forEach((trigger, index) => {
                        console.log(`[${this.serviceName}] Processing trigger ${index}: ${trigger.id}`);
                        this.triggers.set(trigger.id || trigger.name, trigger);
                    });
                } else if (triggersData.triggers) {
                    console.log(`[${this.serviceName}] Processing ${triggersData.triggers.length} triggers from triggers array`);
                    triggersData.triggers.forEach((trigger, index) => {
                        if (!trigger.id) {
                            console.warn(`[${this.serviceName}] Trigger at index ${index} has no ID:`, trigger);
                            return;
                        }
                        console.log(`[${this.serviceName}] Processing trigger ${index}: ${trigger.id}`);
                        this.triggers.set(trigger.id || trigger.name, trigger);
                        if (trigger.id === 'price_sensitivity' || trigger.id === 'feature_interest') {
                            console.log(`[${this.serviceName}] ✅ Successfully loaded trigger: ${trigger.id}`);
                        }
                    });
                }
                
                console.log(`[${this.serviceName}] Loaded ${this.triggers.size} triggers`);
                console.log(`[${this.serviceName}] Sample trigger IDs:`, Array.from(this.triggers.keys()).slice(0, 5));
            } else {
                console.error(`[${this.serviceName}] Triggers file not found at: ${triggersPath}`);
            }

            // Load trigger rules
            const rulesPath = path.join(__dirname, '../../../shared/data/rules.json');
            if (fs.existsSync(rulesPath)) {
                const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
                console.log(`[${this.serviceName}] Rules file structure:`, {
                    hasRules: !!rulesData.rules,
                    hasTriggerRules: !!rulesData.triggerRules,
                    rulesCount: rulesData.rules ? rulesData.rules.length : 0
                });
                
                if (rulesData.rules) {
                    rulesData.rules.forEach(rule => {
                        this.triggerRules.set(rule.id, rule);
                    });
                } else if (rulesData.triggerRules) {
                    Object.entries(rulesData.triggerRules).forEach(([key, rule]) => {
                        this.triggerRules.set(key, rule);
                    });
                }
                
                console.log(`[${this.serviceName}] Loaded ${this.triggerRules.size} trigger rules`);
            }

            // Load trigger weights
            const weightsPath = path.join(__dirname, '../../../shared/data/weights.json');
            if (fs.existsSync(weightsPath)) {
                const weightsData = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
                console.log(`[${this.serviceName}] Weights file structure:`, {
                    hasTriggerWeights: !!weightsData.triggerWeights,
                    hasScoringWeights: !!weightsData.scoring_weights,
                    hasBoostFactors: !!weightsData.boost_factors,
                    hasRiskFactors: !!weightsData.risk_factors
                });
                
                // Load all weight categories
                if (weightsData.scoring_weights) {
                    Object.entries(weightsData.scoring_weights).forEach(([key, weight]) => {
                        this.triggerWeights.set(`scoring_${key}`, weight);
                    });
                }
                if (weightsData.boost_factors) {
                    Object.entries(weightsData.boost_factors).forEach(([key, weight]) => {
                        this.triggerWeights.set(`boost_${key}`, weight);
                    });
                }
                if (weightsData.risk_factors) {
                    Object.entries(weightsData.risk_factors).forEach(([key, weight]) => {
                        this.triggerWeights.set(`risk_${key}`, weight);
                    });
                }
                if (weightsData.triggerWeights) {
                    Object.entries(weightsData.triggerWeights).forEach(([key, weight]) => {
                        this.triggerWeights.set(key, weight);
                    });
                }
                
                console.log(`[${this.serviceName}] Loaded ${this.triggerWeights.size} trigger weights`);
            }
            
        } catch (error) {
            console.error(`[${this.serviceName}] Error loading data:`, error);
        }
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                service: this.serviceName,
                version: this.version,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                requestId: req.requestId,
                dataLoaded: {
                    triggers: this.triggers.size,
                    rules: this.triggerRules.size,
                    weights: this.triggerWeights.size
                }
            });
        });

        // Main trigger detection endpoint
        this.app.post('/detect', async (req, res) => {
            try {
                const { triggers, demographics, context } = req.body;
                
                console.log(`[${req.requestId}] Processing trigger detection for ${triggers?.length || 0} triggers`);
                
                if (!triggers || !Array.isArray(triggers)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid triggers data - expected array',
                        requestId: req.requestId
                    });
                }

                const detectionResult = await this.detectTriggers(triggers, demographics, context);
                
                res.json({
                    success: true,
                    detection: detectionResult,
                    requestId: req.requestId,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`[${req.requestId}] Trigger detection failed:`, error);
                
                res.status(500).json({
                    success: false,
                    error: 'Trigger detection failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Get available triggers
        this.app.get('/triggers', (req, res) => {
            const triggersList = Array.from(this.triggers.values());
            
            res.json({
                success: true,
                triggers: triggersList,
                count: triggersList.length,
                requestId: req.requestId
            });
        });

        // Get trigger by ID
        this.app.get('/triggers/:id', (req, res) => {
            const { id } = req.params;
            const trigger = this.triggers.get(id);
            
            if (!trigger) {
                return res.status(404).json({
                    success: false,
                    error: `Trigger ${id} not found`,
                    requestId: req.requestId
                });
            }
            
            res.json({
                success: true,
                trigger,
                requestId: req.requestId
            });
        });

        // Analyze trigger patterns
        this.app.post('/analyze-patterns', async (req, res) => {
            try {
                const { triggers, demographics } = req.body;
                
                const patterns = await this.analyzeTriggerPatterns(triggers, demographics);
                
                res.json({
                    success: true,
                    patterns,
                    requestId: req.requestId
                });
                
            } catch (error) {
                console.error(`[${req.requestId}] Pattern analysis failed:`, error);
                
                res.status(500).json({
                    success: false,
                    error: 'Pattern analysis failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });
    }

    async detectTriggers(selectedTriggers, demographics = {}, context = {}) {
        const detectionResults = {
            triggersAnalyzed: selectedTriggers.length,
            detectedTriggers: [],
            triggerScores: {},
            triggerCategories: {},
            overallTriggerStrength: 0,
            demographicInfluence: {},
            recommendations: []
        };

        let totalScore = 0;
        const categoryScores = {};

        for (const triggerName of selectedTriggers) {
            const trigger = this.triggers.get(triggerName);
            if (!trigger) {
                console.warn(`[detectTriggers] Unknown trigger: ${triggerName}`);
                continue;
            }

            // Calculate base trigger score
            let triggerScore = this.calculateBaseTriggerScore(trigger, demographics);
            
            // Apply demographic modifiers
            triggerScore = this.applyDemographicModifiers(triggerScore, trigger, demographics);
            
            // Apply context modifiers
            triggerScore = this.applyContextModifiers(triggerScore, trigger, context);
            
            // Store results
            detectionResults.triggerScores[triggerName] = triggerScore;
            detectionResults.detectedTriggers.push({
                name: triggerName,
                score: triggerScore,
                category: trigger.category || 'general',
                weight: this.triggerWeights.get(triggerName) || 1.0,
                confidence: this.calculateTriggerConfidence(trigger, demographics)
            });

            // Category aggregation
            const category = trigger.category || 'general';
            if (!categoryScores[category]) {
                categoryScores[category] = { total: 0, count: 0 };
            }
            categoryScores[category].total += triggerScore;
            categoryScores[category].count += 1;

            totalScore += triggerScore;
        }

        // Calculate category averages
        Object.entries(categoryScores).forEach(([category, data]) => {
            detectionResults.triggerCategories[category] = {
                averageScore: data.total / data.count,
                triggerCount: data.count,
                totalScore: data.total
            };
        });

        // Overall trigger strength
        detectionResults.overallTriggerStrength = selectedTriggers.length > 0 
            ? totalScore / selectedTriggers.length 
            : 0;

        // Demographic influence analysis
        detectionResults.demographicInfluence = this.analyzeDemographicInfluence(selectedTriggers, demographics);

        // Generate recommendations
        detectionResults.recommendations = this.generateTriggerRecommendations(detectionResults);

        return detectionResults;
    }

    calculateBaseTriggerScore(trigger, demographics) {
        // Base score from trigger definition
        let baseScore = trigger.baseScore || 0.5;
        
        // Apply trigger-specific rules
        const rule = this.triggerRules.get(trigger.name || trigger.id);
        if (rule && rule.scoreModifier) {
            baseScore *= rule.scoreModifier;
        }
        
        // Apply weight
        const weight = this.triggerWeights.get(trigger.name || trigger.id) || 1.0;
        baseScore *= weight;
        
        return Math.min(Math.max(baseScore, 0), 1); // Clamp between 0 and 1
    }

    applyDemographicModifiers(score, trigger, demographics) {
        let modifiedScore = score;
        
        // Age modifiers
        if (demographics.age && trigger.ageModifiers) {
            const ageGroup = this.getAgeGroup(demographics.age);
            const modifier = trigger.ageModifiers[ageGroup] || 1.0;
            modifiedScore *= modifier;
        }
        
        // Income modifiers
        if (demographics.income && trigger.incomeModifiers) {
            const incomeGroup = this.getIncomeGroup(demographics.income);
            const modifier = trigger.incomeModifiers[incomeGroup] || 1.0;
            modifiedScore *= modifier;
        }
        
        // Location modifiers
        if (demographics.location && trigger.locationModifiers) {
            const modifier = trigger.locationModifiers[demographics.location] || 1.0;
            modifiedScore *= modifier;
        }
        
        return Math.min(Math.max(modifiedScore, 0), 1);
    }

    applyContextModifiers(score, trigger, context) {
        let modifiedScore = score;
        
        // Time-based modifiers
        if (context.timeOfDay && trigger.timeModifiers) {
            const modifier = trigger.timeModifiers[context.timeOfDay] || 1.0;
            modifiedScore *= modifier;
        }
        
        // Channel modifiers
        if (context.channel && trigger.channelModifiers) {
            const modifier = trigger.channelModifiers[context.channel] || 1.0;
            modifiedScore *= modifier;
        }
        
        return Math.min(Math.max(modifiedScore, 0), 1);
    }

    calculateTriggerConfidence(trigger, demographics) {
        // Base confidence
        let confidence = 0.7;
        
        // Increase confidence if we have relevant demographic data
        if (demographics.age && trigger.ageModifiers) confidence += 0.1;
        if (demographics.income && trigger.incomeModifiers) confidence += 0.1;
        if (demographics.location && trigger.locationModifiers) confidence += 0.1;
        
        return Math.min(confidence, 1.0);
    }

    analyzeDemographicInfluence(triggers, demographics) {
        const influence = {
            age: { impact: 0, relevantTriggers: [] },
            income: { impact: 0, relevantTriggers: [] },
            location: { impact: 0, relevantTriggers: [] }
        };
        
        triggers.forEach(triggerName => {
            const trigger = this.triggers.get(triggerName);
            if (!trigger) return;
            
            if (trigger.ageModifiers && demographics.age) {
                const ageGroup = this.getAgeGroup(demographics.age);
                const modifier = trigger.ageModifiers[ageGroup] || 1.0;
                influence.age.impact += Math.abs(modifier - 1.0);
                influence.age.relevantTriggers.push(triggerName);
            }
            
            if (trigger.incomeModifiers && demographics.income) {
                const incomeGroup = this.getIncomeGroup(demographics.income);
                const modifier = trigger.incomeModifiers[incomeGroup] || 1.0;
                influence.income.impact += Math.abs(modifier - 1.0);
                influence.income.relevantTriggers.push(triggerName);
            }
            
            if (trigger.locationModifiers && demographics.location) {
                const modifier = trigger.locationModifiers[demographics.location] || 1.0;
                influence.location.impact += Math.abs(modifier - 1.0);
                influence.location.relevantTriggers.push(triggerName);
            }
        });
        
        return influence;
    }

    generateTriggerRecommendations(detectionResults) {
        const recommendations = [];
        
        // High-scoring triggers
        const highScoreTriggers = detectionResults.detectedTriggers
            .filter(t => t.score > 0.7)
            .sort((a, b) => b.score - a.score);
            
        if (highScoreTriggers.length > 0) {
            recommendations.push({
                type: 'high_impact',
                message: `Focus on high-impact triggers: ${highScoreTriggers.slice(0, 3).map(t => t.name).join(', ')}`,
                triggers: highScoreTriggers.slice(0, 3).map(t => t.name),
                priority: 'high'
            });
        }
        
        // Category recommendations
        const topCategory = Object.entries(detectionResults.triggerCategories)
            .sort(([,a], [,b]) => b.averageScore - a.averageScore)[0];
            
        if (topCategory) {
            recommendations.push({
                type: 'category_focus',
                message: `Strongest trigger category: ${topCategory[0]} (avg score: ${topCategory[1].averageScore.toFixed(2)})`,
                category: topCategory[0],
                priority: 'medium'
            });
        }
        
        // Low confidence warnings
        const lowConfidenceTriggers = detectionResults.detectedTriggers
            .filter(t => t.confidence < 0.6);
            
        if (lowConfidenceTriggers.length > 0) {
            recommendations.push({
                type: 'data_quality',
                message: `Consider gathering more demographic data to improve trigger analysis confidence`,
                affectedTriggers: lowConfidenceTriggers.map(t => t.name),
                priority: 'low'
            });
        }
        
        return recommendations;
    }

    async analyzeTriggerPatterns(triggers, demographics) {
        // Analyze patterns in trigger combinations
        const patterns = {
            commonCombinations: [],
            demographicPatterns: {},
            temporalPatterns: {},
            correlations: []
        };
        
        // This would typically involve more sophisticated pattern analysis
        // For now, return basic pattern information
        
        return patterns;
    }

    getAgeGroup(age) {
        if (age < 25) return 'young';
        if (age < 35) return 'millennial';
        if (age < 50) return 'middle';
        if (age < 65) return 'mature';
        return 'senior';
    }

    getIncomeGroup(income) {
        if (income < 30000) return 'low';
        if (income < 60000) return 'medium';
        if (income < 100000) return 'high';
        return 'premium';
    }

    async start() {
        this.app.listen(this.port, () => {
            console.log(`🎯 ${this.serviceName} service v${this.version} started`);
            console.log(`🌐 Service running on port ${this.port}`);
            console.log(`🔍 Health check: http://localhost:${this.port}/health`);
            console.log(`📊 Detection endpoint: http://localhost:${this.port}/detect`);
        });
    }
}

// Start service if run directly
if (require.main === module) {
    const service = new TriggerDetectionService();
    service.start().catch(console.error);
}

module.exports = TriggerDetectionService;