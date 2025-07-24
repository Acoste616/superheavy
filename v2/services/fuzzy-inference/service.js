/**
 * Tesla Customer Decoder - Fuzzy Inference Service
 * Mikro-usługa implementująca logikę rozmytą dla analizy klientów
 * 
 * @version 2.0
 * @author TRAE AI Assistant
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class FuzzyInferenceService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3003;
        this.serviceName = 'fuzzy-inference';
        this.version = '2.0';
        
        // Fuzzy logic components
        this.membershipFunctions = new Map();
        this.fuzzyRules = [];
        this.linguisticVariables = new Map();
        
        this.setupMiddleware();
        this.initializeFuzzyLogic();
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

    initializeFuzzyLogic() {
        // Initialize membership functions for DISC profiles
        this.initializeDISCMembershipFunctions();
        
        // Initialize membership functions for triggers
        this.initializeTriggerMembershipFunctions();
        
        // Initialize membership functions for demographics
        this.initializeDemographicMembershipFunctions();
        
        // Initialize fuzzy rules
        this.initializeFuzzyRules();
        
        console.log(`[${this.serviceName}] Fuzzy logic initialized with ${this.membershipFunctions.size} membership functions and ${this.fuzzyRules.length} rules`);
    }

    initializeDISCMembershipFunctions() {
        // DISC Profile membership functions
        this.membershipFunctions.set('dominance', {
            low: (x) => this.triangularMF(x, 0, 0, 0.4),
            medium: (x) => this.triangularMF(x, 0.2, 0.5, 0.8),
            high: (x) => this.triangularMF(x, 0.6, 1, 1)
        });
        
        this.membershipFunctions.set('influence', {
            low: (x) => this.triangularMF(x, 0, 0, 0.4),
            medium: (x) => this.triangularMF(x, 0.2, 0.5, 0.8),
            high: (x) => this.triangularMF(x, 0.6, 1, 1)
        });
        
        this.membershipFunctions.set('steadiness', {
            low: (x) => this.triangularMF(x, 0, 0, 0.4),
            medium: (x) => this.triangularMF(x, 0.2, 0.5, 0.8),
            high: (x) => this.triangularMF(x, 0.6, 1, 1)
        });
        
        this.membershipFunctions.set('compliance', {
            low: (x) => this.triangularMF(x, 0, 0, 0.4),
            medium: (x) => this.triangularMF(x, 0.2, 0.5, 0.8),
            high: (x) => this.triangularMF(x, 0.6, 1, 1)
        });
    }

    initializeTriggerMembershipFunctions() {
        // Trigger strength membership functions
        this.membershipFunctions.set('trigger_strength', {
            weak: (x) => this.triangularMF(x, 0, 0, 0.3),
            moderate: (x) => this.triangularMF(x, 0.2, 0.5, 0.8),
            strong: (x) => this.triangularMF(x, 0.7, 1, 1)
        });
        
        // Trigger frequency
        this.membershipFunctions.set('trigger_frequency', {
            rare: (x) => this.triangularMF(x, 0, 0, 0.25),
            occasional: (x) => this.triangularMF(x, 0.15, 0.4, 0.65),
            frequent: (x) => this.triangularMF(x, 0.5, 0.75, 1),
            constant: (x) => this.triangularMF(x, 0.8, 1, 1)
        });
    }

    initializeDemographicMembershipFunctions() {
        // Age groups
        this.membershipFunctions.set('age', {
            young: (x) => this.triangularMF(x, 18, 25, 35),
            middle: (x) => this.triangularMF(x, 30, 45, 60),
            mature: (x) => this.triangularMF(x, 55, 70, 85)
        });
        
        // Income levels
        this.membershipFunctions.set('income', {
            low: (x) => this.triangularMF(x, 0, 30000, 50000),
            medium: (x) => this.triangularMF(x, 40000, 70000, 100000),
            high: (x) => this.triangularMF(x, 80000, 120000, 200000),
            premium: (x) => this.triangularMF(x, 150000, 250000, 500000)
        });
        
        // Conversion probability output
        this.membershipFunctions.set('conversion_probability', {
            very_low: (x) => this.triangularMF(x, 0, 0, 0.2),
            low: (x) => this.triangularMF(x, 0.1, 0.25, 0.4),
            medium: (x) => this.triangularMF(x, 0.3, 0.5, 0.7),
            high: (x) => this.triangularMF(x, 0.6, 0.75, 0.9),
            very_high: (x) => this.triangularMF(x, 0.8, 1, 1)
        });
    }

    initializeFuzzyRules() {
        this.fuzzyRules = [
            // High Dominance rules
            {
                id: 'rule_1',
                condition: (inputs) => 
                    this.membershipFunctions.get('dominance').high(inputs.dominance) &&
                    this.membershipFunctions.get('trigger_strength').strong(inputs.triggerStrength),
                conclusion: 'very_high',
                weight: 0.9
            },
            
            // High Influence rules
            {
                id: 'rule_2',
                condition: (inputs) => 
                    this.membershipFunctions.get('influence').high(inputs.influence) &&
                    this.membershipFunctions.get('trigger_strength').moderate(inputs.triggerStrength),
                conclusion: 'high',
                weight: 0.8
            },
            
            // High Steadiness rules
            {
                id: 'rule_3',
                condition: (inputs) => 
                    this.membershipFunctions.get('steadiness').high(inputs.steadiness) &&
                    this.membershipFunctions.get('trigger_frequency').frequent(inputs.triggerFrequency),
                conclusion: 'medium',
                weight: 0.7
            },
            
            // High Compliance rules
            {
                id: 'rule_4',
                condition: (inputs) => 
                    this.membershipFunctions.get('compliance').high(inputs.compliance) &&
                    this.membershipFunctions.get('trigger_strength').strong(inputs.triggerStrength),
                conclusion: 'high',
                weight: 0.8
            },
            
            // Age-based rules
            {
                id: 'rule_5',
                condition: (inputs) => 
                    this.membershipFunctions.get('age').young(inputs.age) &&
                    this.membershipFunctions.get('income').high(inputs.income),
                conclusion: 'very_high',
                weight: 0.85
            },
            
            {
                id: 'rule_6',
                condition: (inputs) => 
                    this.membershipFunctions.get('age').mature(inputs.age) &&
                    this.membershipFunctions.get('income').premium(inputs.income),
                conclusion: 'very_high',
                weight: 0.9
            },
            
            // Combined DISC rules
            {
                id: 'rule_7',
                condition: (inputs) => 
                    this.membershipFunctions.get('dominance').high(inputs.dominance) &&
                    this.membershipFunctions.get('influence').high(inputs.influence),
                conclusion: 'very_high',
                weight: 0.95
            },
            
            {
                id: 'rule_8',
                condition: (inputs) => 
                    this.membershipFunctions.get('steadiness').high(inputs.steadiness) &&
                    this.membershipFunctions.get('compliance').high(inputs.compliance),
                conclusion: 'medium',
                weight: 0.6
            },
            
            // Low engagement rules
            {
                id: 'rule_9',
                condition: (inputs) => 
                    this.membershipFunctions.get('trigger_strength').weak(inputs.triggerStrength) &&
                    this.membershipFunctions.get('trigger_frequency').rare(inputs.triggerFrequency),
                conclusion: 'very_low',
                weight: 0.8
            },
            
            // Moderate engagement rules
            {
                id: 'rule_10',
                condition: (inputs) => 
                    this.membershipFunctions.get('dominance').medium(inputs.dominance) &&
                    this.membershipFunctions.get('influence').medium(inputs.influence) &&
                    this.membershipFunctions.get('trigger_strength').moderate(inputs.triggerStrength),
                conclusion: 'medium',
                weight: 0.7
            }
        ];
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
                fuzzyComponents: {
                    membershipFunctions: this.membershipFunctions.size,
                    rules: this.fuzzyRules.length
                }
            });
        });

        // Main fuzzy inference endpoint
        this.app.post('/infer', async (req, res) => {
            try {
                const { discProfile, triggers, demographics, context } = req.body;
                
                console.log(`[${req.requestId}] Processing fuzzy inference`);
                
                if (!discProfile) {
                    return res.status(400).json({
                        success: false,
                        error: 'DISC profile is required',
                        requestId: req.requestId
                    });
                }

                const inferenceResult = await this.performFuzzyInference(discProfile, triggers, demographics, context);
                
                res.json({
                    success: true,
                    inference: inferenceResult,
                    requestId: req.requestId,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`[${req.requestId}] Fuzzy inference failed:`, error);
                
                res.status(500).json({
                    success: false,
                    error: 'Fuzzy inference failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Get membership function values
        this.app.post('/membership', (req, res) => {
            try {
                const { variable, value } = req.body;
                
                if (!this.membershipFunctions.has(variable)) {
                    return res.status(404).json({
                        success: false,
                        error: `Membership function ${variable} not found`,
                        requestId: req.requestId
                    });
                }
                
                const mf = this.membershipFunctions.get(variable);
                const memberships = {};
                
                Object.keys(mf).forEach(term => {
                    memberships[term] = mf[term](value);
                });
                
                res.json({
                    success: true,
                    variable,
                    value,
                    memberships,
                    requestId: req.requestId
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Membership calculation failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Test fuzzy rules
        this.app.post('/test-rules', (req, res) => {
            try {
                const inputs = req.body;
                
                const ruleResults = this.fuzzyRules.map(rule => {
                    const activation = rule.condition(inputs);
                    return {
                        id: rule.id,
                        activation,
                        conclusion: rule.conclusion,
                        weight: rule.weight,
                        fired: activation > 0
                    };
                });
                
                res.json({
                    success: true,
                    inputs,
                    ruleResults,
                    firedRules: ruleResults.filter(r => r.fired).length,
                    requestId: req.requestId
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Rule testing failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });
    }

    async performFuzzyInference(discProfile, triggers = [], demographics = {}, context = {}) {
        // Prepare inputs for fuzzy inference
        const inputs = this.prepareInputs(discProfile, triggers, demographics, context);
        
        // Fuzzification - convert crisp inputs to fuzzy values
        const fuzzifiedInputs = this.fuzzifyInputs(inputs);
        
        // Rule evaluation - apply fuzzy rules
        const ruleActivations = this.evaluateRules(inputs);
        
        // Aggregation - combine rule outputs
        const aggregatedOutput = this.aggregateRuleOutputs(ruleActivations);
        
        // Defuzzification - convert fuzzy output to crisp value
        const crispOutput = this.defuzzify(aggregatedOutput);
        
        return {
            inputs,
            fuzzifiedInputs,
            ruleActivations,
            aggregatedOutput,
            conversionProbability: crispOutput,
            confidence: this.calculateConfidence(ruleActivations),
            explanation: this.generateExplanation(ruleActivations, crispOutput)
        };
    }

    prepareInputs(discProfile, triggers, demographics, context) {
        // Calculate trigger metrics
        const triggerStrength = triggers.length > 0 
            ? triggers.reduce((sum, t) => sum + (t.score || 0.5), 0) / triggers.length 
            : 0;
            
        const triggerFrequency = triggers.length / 10; // Normalize by max expected triggers
        
        return {
            dominance: discProfile.D || 0,
            influence: discProfile.I || 0,
            steadiness: discProfile.S || 0,
            compliance: discProfile.C || 0,
            triggerStrength: Math.min(triggerStrength, 1),
            triggerFrequency: Math.min(triggerFrequency, 1),
            age: demographics.age || 35,
            income: demographics.income || 50000
        };
    }

    fuzzifyInputs(inputs) {
        const fuzzified = {};
        
        Object.keys(inputs).forEach(variable => {
            if (this.membershipFunctions.has(variable)) {
                const mf = this.membershipFunctions.get(variable);
                fuzzified[variable] = {};
                
                Object.keys(mf).forEach(term => {
                    fuzzified[variable][term] = mf[term](inputs[variable]);
                });
            }
        });
        
        return fuzzified;
    }

    evaluateRules(inputs) {
        return this.fuzzyRules.map(rule => {
            const activation = rule.condition(inputs);
            return {
                id: rule.id,
                activation: activation * rule.weight,
                conclusion: rule.conclusion,
                weight: rule.weight,
                fired: activation > 0
            };
        });
    }

    aggregateRuleOutputs(ruleActivations) {
        const outputTerms = ['very_low', 'low', 'medium', 'high', 'very_high'];
        const aggregated = {};
        
        outputTerms.forEach(term => {
            const relevantRules = ruleActivations.filter(r => r.conclusion === term && r.fired);
            aggregated[term] = relevantRules.length > 0 
                ? Math.max(...relevantRules.map(r => r.activation))
                : 0;
        });
        
        return aggregated;
    }

    defuzzify(aggregatedOutput) {
        // Centroid defuzzification
        const outputMF = this.membershipFunctions.get('conversion_probability');
        
        let numerator = 0;
        let denominator = 0;
        
        // Sample the output space
        for (let x = 0; x <= 1; x += 0.01) {
            let membershipValue = 0;
            
            Object.keys(aggregatedOutput).forEach(term => {
                const termMembership = outputMF[term](x);
                const ruleActivation = aggregatedOutput[term];
                membershipValue = Math.max(membershipValue, Math.min(termMembership, ruleActivation));
            });
            
            numerator += x * membershipValue;
            denominator += membershipValue;
        }
        
        return denominator > 0 ? numerator / denominator : 0.5;
    }

    calculateConfidence(ruleActivations) {
        const firedRules = ruleActivations.filter(r => r.fired);
        if (firedRules.length === 0) return 0;
        
        const avgActivation = firedRules.reduce((sum, r) => sum + r.activation, 0) / firedRules.length;
        const rulesCoverage = firedRules.length / this.fuzzyRules.length;
        
        return (avgActivation + rulesCoverage) / 2;
    }

    generateExplanation(ruleActivations, output) {
        const firedRules = ruleActivations.filter(r => r.fired).sort((a, b) => b.activation - a.activation);
        
        const explanation = {
            primaryFactors: [],
            rulesSummary: {
                total: this.fuzzyRules.length,
                fired: firedRules.length,
                topRules: firedRules.slice(0, 3).map(r => ({
                    id: r.id,
                    activation: r.activation.toFixed(3),
                    conclusion: r.conclusion
                }))
            },
            reasoning: this.generateReasoningText(firedRules, output)
        };
        
        return explanation;
    }

    generateReasoningText(firedRules, output) {
        if (firedRules.length === 0) {
            return "No fuzzy rules were activated, indicating insufficient data for reliable inference.";
        }
        
        const topRule = firedRules[0];
        let reasoning = `Primary inference based on ${topRule.conclusion} probability rules. `;
        
        if (output > 0.7) {
            reasoning += "High conversion probability indicated by strong rule activations.";
        } else if (output > 0.4) {
            reasoning += "Moderate conversion probability with mixed rule signals.";
        } else {
            reasoning += "Lower conversion probability suggested by weak rule activations.";
        }
        
        return reasoning;
    }

    // Triangular membership function
    triangularMF(x, a, b, c) {
        if (x <= a || x >= c) return 0;
        if (x === b) return 1;
        if (x < b) return (x - a) / (b - a);
        return (c - x) / (c - b);
    }

    // Trapezoidal membership function
    trapezoidalMF(x, a, b, c, d) {
        if (x <= a || x >= d) return 0;
        if (x >= b && x <= c) return 1;
        if (x < b) return (x - a) / (b - a);
        return (d - x) / (d - c);
    }

    async start() {
        this.app.listen(this.port, () => {
            console.log(`🧠 ${this.serviceName} service v${this.version} started`);
            console.log(`🌐 Service running on port ${this.port}`);
            console.log(`🔍 Health check: http://localhost:${this.port}/health`);
            console.log(`📊 Inference endpoint: http://localhost:${this.port}/infer`);
        });
    }
}

// Start service if run directly
if (require.main === module) {
    const service = new FuzzyInferenceService();
    service.start().catch(console.error);
}

module.exports = FuzzyInferenceService;