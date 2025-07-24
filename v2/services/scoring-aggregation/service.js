/**
 * Tesla Customer Decoder - Scoring Aggregation Service
 * Mikro-usługa odpowiedzialna za agregację wyników i obliczanie końcowych score'ów
 * 
 * @version 2.0
 * @author TRAE AI Assistant
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class ScoringAggregationService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3004;
        this.serviceName = 'scoring-aggregation';
        this.version = '2.0';
        
        // Scoring components
        this.scoringWeights = new Map();
        this.scoringRules = new Map();
        this.aggregationStrategies = new Map();
        
        this.setupMiddleware();
        this.loadScoringData();
        this.initializeAggregationStrategies();
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

    loadScoringData() {
        try {
            // Load scoring weights
            const weightsPath = path.join(__dirname, '../../../shared/data/weights.json');
            if (fs.existsSync(weightsPath)) {
                const weightsData = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
                
                if (weightsData.scoringWeights) {
                    Object.entries(weightsData.scoringWeights).forEach(([key, weight]) => {
                        this.scoringWeights.set(key, weight);
                    });
                }
                
                console.log(`[${this.serviceName}] Loaded ${this.scoringWeights.size} scoring weights`);
            }

            // Load scoring rules
            const rulesPath = path.join(__dirname, '../../../shared/data/rules.json');
            if (fs.existsSync(rulesPath)) {
                const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
                
                if (rulesData.scoringRules) {
                    Object.entries(rulesData.scoringRules).forEach(([key, rule]) => {
                        this.scoringRules.set(key, rule);
                    });
                }
                
                console.log(`[${this.serviceName}] Loaded ${this.scoringRules.size} scoring rules`);
            }
            
        } catch (error) {
            console.error(`[${this.serviceName}] Error loading scoring data:`, error);
        }
    }

    initializeAggregationStrategies() {
        // Weighted Average Strategy
        this.aggregationStrategies.set('weighted_average', (scores, weights) => {
            let totalScore = 0;
            let totalWeight = 0;
            
            Object.entries(scores).forEach(([component, score]) => {
                const weight = weights[component] || 1.0;
                totalScore += score * weight;
                totalWeight += weight;
            });
            
            return totalWeight > 0 ? totalScore / totalWeight : 0;
        });
        
        // Harmonic Mean Strategy
        this.aggregationStrategies.set('harmonic_mean', (scores, weights) => {
            const validScores = Object.values(scores).filter(s => s > 0);
            if (validScores.length === 0) return 0;
            
            const harmonicSum = validScores.reduce((sum, score) => sum + (1 / score), 0);
            return validScores.length / harmonicSum;
        });
        
        // Geometric Mean Strategy
        this.aggregationStrategies.set('geometric_mean', (scores, weights) => {
            const validScores = Object.values(scores).filter(s => s > 0);
            if (validScores.length === 0) return 0;
            
            const product = validScores.reduce((prod, score) => prod * score, 1);
            return Math.pow(product, 1 / validScores.length);
        });
        
        // Max Strategy
        this.aggregationStrategies.set('max', (scores, weights) => {
            return Math.max(...Object.values(scores));
        });
        
        // Min Strategy
        this.aggregationStrategies.set('min', (scores, weights) => {
            return Math.min(...Object.values(scores));
        });
        
        // Ensemble Strategy (combines multiple strategies)
        this.aggregationStrategies.set('ensemble', (scores, weights) => {
            const strategies = ['weighted_average', 'geometric_mean', 'harmonic_mean'];
            const results = strategies.map(strategy => 
                this.aggregationStrategies.get(strategy)(scores, weights)
            );
            
            // Weighted combination of strategies
            const strategyWeights = [0.5, 0.3, 0.2];
            return results.reduce((sum, result, index) => 
                sum + result * strategyWeights[index], 0
            );
        });
        
        console.log(`[${this.serviceName}] Initialized ${this.aggregationStrategies.size} aggregation strategies`);
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
                components: {
                    scoringWeights: this.scoringWeights.size,
                    scoringRules: this.scoringRules.size,
                    aggregationStrategies: this.aggregationStrategies.size
                }
            });
        });

        // Main scoring aggregation endpoint
        this.app.post('/aggregate', async (req, res) => {
            try {
                const { customerAnalysis, triggerDetection, fuzzyInference, inputData } = req.body;
                
                console.log(`[${req.requestId}] Processing scoring aggregation`);
                
                if (!customerAnalysis || !triggerDetection || !fuzzyInference) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required analysis components',
                        requestId: req.requestId
                    });
                }

                const aggregationResult = await this.aggregateScores(
                    customerAnalysis, 
                    triggerDetection, 
                    fuzzyInference, 
                    inputData
                );
                
                res.json({
                    success: true,
                    scoring: aggregationResult,
                    requestId: req.requestId,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`[${req.requestId}] Scoring aggregation failed:`, error);
                
                res.status(500).json({
                    success: false,
                    error: 'Scoring aggregation failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Test different aggregation strategies
        this.app.post('/test-strategies', (req, res) => {
            try {
                const { scores, weights } = req.body;
                
                if (!scores || typeof scores !== 'object') {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid scores object',
                        requestId: req.requestId
                    });
                }
                
                const results = {};
                
                this.aggregationStrategies.forEach((strategy, name) => {
                    try {
                        results[name] = strategy(scores, weights || {});
                    } catch (error) {
                        results[name] = { error: error.message };
                    }
                });
                
                res.json({
                    success: true,
                    inputScores: scores,
                    inputWeights: weights,
                    strategyResults: results,
                    requestId: req.requestId
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Strategy testing failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Get scoring weights
        this.app.get('/weights', (req, res) => {
            const weights = Object.fromEntries(this.scoringWeights);
            
            res.json({
                success: true,
                weights,
                count: this.scoringWeights.size,
                requestId: req.requestId
            });
        });

        // Update scoring weights
        this.app.post('/weights', (req, res) => {
            try {
                const { weights } = req.body;
                
                if (!weights || typeof weights !== 'object') {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid weights object',
                        requestId: req.requestId
                    });
                }
                
                Object.entries(weights).forEach(([key, weight]) => {
                    if (typeof weight === 'number' && weight >= 0) {
                        this.scoringWeights.set(key, weight);
                    }
                });
                
                res.json({
                    success: true,
                    message: 'Weights updated successfully',
                    updatedWeights: Object.fromEntries(this.scoringWeights),
                    requestId: req.requestId
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Weight update failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });
    }

    async aggregateScores(customerAnalysis, triggerDetection, fuzzyInference, inputData) {
        // Extract component scores
        const componentScores = this.extractComponentScores(
            customerAnalysis, 
            triggerDetection, 
            fuzzyInference
        );
        
        // Calculate weighted scores
        const weightedScores = this.calculateWeightedScores(componentScores);
        
        // Apply different aggregation strategies
        const aggregationResults = this.applyAggregationStrategies(componentScores);
        
        // Calculate final conversion probability
        const conversionProbability = this.calculateFinalConversionProbability(
            aggregationResults, 
            inputData
        );
        
        // Calculate confidence metrics
        const confidence = this.calculateConfidenceMetrics(
            componentScores, 
            aggregationResults
        );
        
        // Generate scoring breakdown
        const breakdown = this.generateScoringBreakdown(
            componentScores, 
            weightedScores, 
            aggregationResults
        );
        
        return {
            conversionProbability,
            confidence,
            componentScores,
            weightedScores,
            aggregationResults,
            breakdown,
            metadata: {
                strategy: 'ensemble',
                timestamp: new Date().toISOString(),
                version: this.version
            }
        };
    }

    extractComponentScores(customerAnalysis, triggerDetection, fuzzyInference) {
        return {
            // Customer Analysis scores
            discProfile: this.calculateDISCScore(customerAnalysis.discProfile),
            customerSegment: this.calculateSegmentScore(customerAnalysis.customerSegment),
            
            // Trigger Detection scores
            triggerStrength: triggerDetection.overallTriggerStrength || 0,
            triggerCount: Math.min(triggerDetection.triggersAnalyzed / 10, 1), // Normalize
            
            // Fuzzy Inference scores
            fuzzyProbability: fuzzyInference.conversionProbability || 0,
            fuzzyConfidence: fuzzyInference.confidence || 0,
            
            // Derived scores
            demographicAlignment: this.calculateDemographicAlignment(customerAnalysis),
            behavioralConsistency: this.calculateBehavioralConsistency(
                customerAnalysis, 
                triggerDetection
            )
        };
    }

    calculateDISCScore(discProfile) {
        if (!discProfile) return 0;
        
        // High D and I typically correlate with higher conversion
        const dominanceScore = (discProfile.D || 0) * 0.4;
        const influenceScore = (discProfile.I || 0) * 0.4;
        const steadinessScore = (discProfile.S || 0) * 0.1;
        const complianceScore = (discProfile.C || 0) * 0.1;
        
        return dominanceScore + influenceScore + steadinessScore + complianceScore;
    }

    calculateSegmentScore(customerSegment) {
        const segmentScores = {
            'early_adopter': 0.9,
            'tech_enthusiast': 0.85,
            'luxury_seeker': 0.8,
            'eco_conscious': 0.75,
            'performance_oriented': 0.8,
            'practical_buyer': 0.6,
            'price_sensitive': 0.4,
            'skeptical': 0.3
        };
        
        return segmentScores[customerSegment] || 0.5;
    }

    calculateDemographicAlignment(customerAnalysis) {
        // This would analyze how well the customer's demographics
        // align with typical Tesla buyer profiles
        let alignment = 0.5; // Base alignment
        
        // Add demographic-specific logic here
        // For now, return base alignment
        
        return alignment;
    }

    calculateBehavioralConsistency(customerAnalysis, triggerDetection) {
        // Analyze consistency between DISC profile and trigger responses
        let consistency = 0.5;
        
        // Add behavioral consistency logic here
        
        return consistency;
    }

    calculateWeightedScores(componentScores) {
        const weightedScores = {};
        
        Object.entries(componentScores).forEach(([component, score]) => {
            const weight = this.scoringWeights.get(component) || 1.0;
            weightedScores[component] = score * weight;
        });
        
        return weightedScores;
    }

    applyAggregationStrategies(componentScores) {
        const results = {};
        
        this.aggregationStrategies.forEach((strategy, name) => {
            try {
                results[name] = strategy(componentScores, Object.fromEntries(this.scoringWeights));
            } catch (error) {
                console.error(`Strategy ${name} failed:`, error);
                results[name] = 0;
            }
        });
        
        return results;
    }

    calculateFinalConversionProbability(aggregationResults, inputData) {
        // Use ensemble strategy as primary result
        let probability = aggregationResults.ensemble || aggregationResults.weighted_average || 0;
        
        // Apply input-specific modifiers
        if (inputData) {
            // Time-based modifiers
            if (inputData.urgency === 'high') {
                probability *= 1.1;
            }
            
            // Budget modifiers
            if (inputData.budget && inputData.budget > 80000) {
                probability *= 1.05;
            }
        }
        
        // Ensure probability is within valid range
        return Math.min(Math.max(probability, 0), 1);
    }

    calculateConfidenceMetrics(componentScores, aggregationResults) {
        // Calculate variance across strategies
        const strategyValues = Object.values(aggregationResults).filter(v => typeof v === 'number');
        const mean = strategyValues.reduce((sum, val) => sum + val, 0) / strategyValues.length;
        const variance = strategyValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / strategyValues.length;
        
        // Lower variance = higher confidence
        const strategyConsistency = Math.max(0, 1 - variance);
        
        // Data completeness
        const nonZeroScores = Object.values(componentScores).filter(score => score > 0).length;
        const dataCompleteness = nonZeroScores / Object.keys(componentScores).length;
        
        // Overall confidence
        const overallConfidence = (strategyConsistency * 0.6) + (dataCompleteness * 0.4);
        
        return {
            overall: overallConfidence,
            strategyConsistency,
            dataCompleteness,
            variance,
            mean
        };
    }

    generateScoringBreakdown(componentScores, weightedScores, aggregationResults) {
        return {
            components: Object.entries(componentScores).map(([name, score]) => ({
                name,
                rawScore: score,
                weight: this.scoringWeights.get(name) || 1.0,
                weightedScore: weightedScores[name] || 0,
                contribution: ((weightedScores[name] || 0) / Object.values(weightedScores).reduce((sum, s) => sum + s, 1)) * 100
            })),
            strategies: Object.entries(aggregationResults).map(([name, result]) => ({
                name,
                result,
                description: this.getStrategyDescription(name)
            })),
            topContributors: Object.entries(componentScores)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([name, score]) => ({ name, score }))
        };
    }

    getStrategyDescription(strategyName) {
        const descriptions = {
            weighted_average: 'Weighted average of all component scores',
            harmonic_mean: 'Harmonic mean emphasizing lower scores',
            geometric_mean: 'Geometric mean for balanced aggregation',
            max: 'Maximum score across all components',
            min: 'Minimum score across all components',
            ensemble: 'Ensemble combination of multiple strategies'
        };
        
        return descriptions[strategyName] || 'Unknown strategy';
    }

    async start() {
        this.app.listen(this.port, () => {
            console.log(`📊 ${this.serviceName} service v${this.version} started`);
            console.log(`🌐 Service running on port ${this.port}`);
            console.log(`🔍 Health check: http://localhost:${this.port}/health`);
            console.log(`📈 Aggregation endpoint: http://localhost:${this.port}/aggregate`);
        });
    }
}

// Start service if run directly
if (require.main === module) {
    const service = new ScoringAggregationService();
    service.start().catch(console.error);
}

module.exports = ScoringAggregationService;