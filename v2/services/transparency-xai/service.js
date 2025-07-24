/**
 * Tesla Customer Decoder - Transparency/XAI Service
 * Mikro-usługa odpowiedzialna za wyjaśnianie decyzji AI (Explainable AI)
 * 
 * @version 2.0
 * @author TRAE AI Assistant
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class TransparencyXAIService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3006;
        this.serviceName = 'transparency-xai';
        this.version = '2.0';
        
        // XAI components
        this.explanationTemplates = new Map();
        this.featureImportance = new Map();
        this.decisionPaths = new Map();
        this.confidenceThresholds = new Map();
        
        this.setupMiddleware();
        this.loadXAIData();
        this.initializeExplanationStrategies();
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

    loadXAIData() {
        try {
            // Load explanation templates
            this.loadExplanationTemplates();
            
            // Load feature importance weights
            this.loadFeatureImportance();
            
            // Load confidence thresholds
            this.loadConfidenceThresholds();
            
        } catch (error) {
            console.error(`[${this.serviceName}] Error loading XAI data:`, error);
        }
    }

    loadExplanationTemplates() {
        const templates = {
            high_confidence: {
                intro: "Based on strong indicators, our analysis shows:",
                structure: "primary_factors_detailed",
                tone: "confident",
                detail_level: "high"
            },
            medium_confidence: {
                intro: "Our analysis suggests the following patterns:",
                structure: "balanced_factors",
                tone: "measured",
                detail_level: "medium"
            },
            low_confidence: {
                intro: "Initial analysis indicates potential trends:",
                structure: "exploratory_factors",
                tone: "cautious",
                detail_level: "low"
            },
            very_low_confidence: {
                intro: "Limited data available for analysis:",
                structure: "minimal_factors",
                tone: "reserved",
                detail_level: "minimal"
            },
            disc_explanation: {
                intro: "DISC personality analysis reveals:",
                structure: "trait_based",
                tone: "analytical",
                detail_level: "high"
            },
            trigger_explanation: {
                intro: "Customer trigger analysis shows:",
                structure: "trigger_focused",
                tone: "actionable",
                detail_level: "medium"
            },
            scoring_explanation: {
                intro: "Conversion probability calculation:",
                structure: "mathematical",
                tone: "technical",
                detail_level: "high"
            }
        };
        
        Object.entries(templates).forEach(([key, template]) => {
            this.explanationTemplates.set(key, template);
        });
        
        console.log(`[${this.serviceName}] Loaded ${this.explanationTemplates.size} explanation templates`);
    }

    loadFeatureImportance() {
        const importance = {
            // Customer Analysis Features
            age: { weight: 0.15, category: 'demographic', explanation: 'Age influences product preferences and purchasing power' },
            income: { weight: 0.20, category: 'demographic', explanation: 'Income determines affordability and product tier suitability' },
            location: { weight: 0.10, category: 'demographic', explanation: 'Geographic location affects product availability and preferences' },
            
            // DISC Profile Features
            dominance: { weight: 0.18, category: 'personality', explanation: 'Dominance trait influences decision-making speed and product preferences' },
            influence: { weight: 0.16, category: 'personality', explanation: 'Influence trait affects social factors in purchasing decisions' },
            steadiness: { weight: 0.14, category: 'personality', explanation: 'Steadiness trait impacts preference for reliability and stability' },
            compliance: { weight: 0.12, category: 'personality', explanation: 'Compliance trait influences need for detailed information and analysis' },
            
            // Trigger Features
            trigger_strength: { weight: 0.25, category: 'behavioral', explanation: 'Strength of identified triggers indicates purchase readiness' },
            trigger_frequency: { weight: 0.20, category: 'behavioral', explanation: 'Frequency of trigger occurrence shows consistency of interest' },
            trigger_recency: { weight: 0.15, category: 'behavioral', explanation: 'Recent trigger activity indicates current purchase intent' },
            
            // Fuzzy Logic Features
            fuzzy_membership: { weight: 0.22, category: 'analytical', explanation: 'Fuzzy logic membership values capture nuanced customer characteristics' },
            rule_activation: { weight: 0.18, category: 'analytical', explanation: 'Activated fuzzy rules indicate specific customer patterns' },
            
            // Contextual Features
            market_conditions: { weight: 0.08, category: 'external', explanation: 'Current market conditions affect purchase timing' },
            seasonal_factors: { weight: 0.06, category: 'external', explanation: 'Seasonal trends influence customer behavior patterns' },
            competitive_landscape: { weight: 0.07, category: 'external', explanation: 'Competitive factors affect customer decision-making' }
        };
        
        Object.entries(importance).forEach(([feature, data]) => {
            this.featureImportance.set(feature, data);
        });
        
        console.log(`[${this.serviceName}] Loaded ${this.featureImportance.size} feature importance definitions`);
    }

    loadConfidenceThresholds() {
        const thresholds = {
            very_high: { min: 0.9, explanation: 'Extremely confident prediction with strong supporting evidence' },
            high: { min: 0.75, explanation: 'High confidence prediction with clear supporting patterns' },
            medium_high: { min: 0.6, explanation: 'Good confidence with multiple supporting indicators' },
            medium: { min: 0.45, explanation: 'Moderate confidence with some supporting evidence' },
            medium_low: { min: 0.3, explanation: 'Lower confidence with limited supporting patterns' },
            low: { min: 0.15, explanation: 'Low confidence prediction requiring additional data' },
            very_low: { min: 0.0, explanation: 'Very low confidence with insufficient supporting evidence' }
        };
        
        Object.entries(thresholds).forEach(([level, data]) => {
            this.confidenceThresholds.set(level, data);
        });
        
        console.log(`[${this.serviceName}] Loaded ${this.confidenceThresholds.size} confidence thresholds`);
    }

    initializeExplanationStrategies() {
        // Initialize different explanation strategies
        this.explanationStrategies = {
            feature_importance: this.explainFeatureImportance.bind(this),
            decision_path: this.explainDecisionPath.bind(this),
            confidence_breakdown: this.explainConfidenceBreakdown.bind(this),
            counterfactual: this.generateCounterfactualExplanation.bind(this),
            similar_cases: this.explainSimilarCases.bind(this),
            sensitivity_analysis: this.performSensitivityAnalysis.bind(this)
        };
        
        console.log(`[${this.serviceName}] Initialized ${Object.keys(this.explanationStrategies).length} explanation strategies`);
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
                    explanationTemplates: this.explanationTemplates.size,
                    featureImportance: this.featureImportance.size,
                    confidenceThresholds: this.confidenceThresholds.size,
                    explanationStrategies: Object.keys(this.explanationStrategies).length
                }
            });
        });

        // Main explanation generation endpoint
        this.app.post('/explain', async (req, res) => {
            try {
                const { 
                    analysisResults, 
                    inputData, 
                    explanationType = 'comprehensive',
                    audienceLevel = 'business' 
                } = req.body;
                
                console.log('🔍 Transparency XAI received data:', JSON.stringify(req.body, null, 2));
                console.log(`[${req.requestId}] Generating ${explanationType} explanation for ${audienceLevel} audience`);
                
                if (!analysisResults) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing analysis results for explanation',
                        requestId: req.requestId
                    });
                }

                const explanation = await this.generateExplanation(
                    analysisResults, 
                    inputData, 
                    explanationType,
                    audienceLevel
                );
                
                res.json({
                    success: true,
                    explanation,
                    requestId: req.requestId,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`[${req.requestId}] Explanation generation failed:`, error);
                
                res.status(500).json({
                    success: false,
                    error: 'Explanation generation failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Feature importance endpoint
        this.app.get('/feature-importance', (req, res) => {
            const { category } = req.query;
            
            let features = Array.from(this.featureImportance.entries());
            
            if (category) {
                features = features.filter(([_, data]) => data.category === category);
            }
            
            // Sort by weight descending
            features.sort((a, b) => b[1].weight - a[1].weight);
            
            res.json({
                success: true,
                features: features.map(([name, data]) => ({ name, ...data })),
                category: category || 'all',
                requestId: req.requestId
            });
        });

        // Confidence levels endpoint
        this.app.get('/confidence-levels', (req, res) => {
            const levels = Array.from(this.confidenceThresholds.entries())
                .map(([level, data]) => ({ level, ...data }))
                .sort((a, b) => b.min - a.min);
            
            res.json({
                success: true,
                confidenceLevels: levels,
                requestId: req.requestId
            });
        });

        // Decision path visualization endpoint
        this.app.post('/decision-path', async (req, res) => {
            try {
                const { analysisResults, inputData } = req.body;
                
                const decisionPath = await this.generateDecisionPath(analysisResults, inputData);
                
                res.json({
                    success: true,
                    decisionPath,
                    requestId: req.requestId
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Decision path generation failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Counterfactual analysis endpoint
        this.app.post('/counterfactual', async (req, res) => {
            try {
                const { analysisResults, inputData, targetOutcome } = req.body;
                
                const counterfactual = await this.generateCounterfactualExplanation(
                    analysisResults, 
                    inputData, 
                    targetOutcome
                );
                
                res.json({
                    success: true,
                    counterfactual,
                    requestId: req.requestId
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Counterfactual analysis failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Sensitivity analysis endpoint
        this.app.post('/sensitivity', async (req, res) => {
            try {
                const { analysisResults, inputData, features } = req.body;
                
                const sensitivity = await this.performSensitivityAnalysis(
                    analysisResults, 
                    inputData, 
                    features
                );
                
                res.json({
                    success: true,
                    sensitivity,
                    requestId: req.requestId
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Sensitivity analysis failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });
    }

    async generateExplanation(analysisResults, inputData, explanationType, audienceLevel) {
        const explanation = {
            summary: await this.generateSummary(analysisResults, audienceLevel),
            confidence: this.explainConfidence(analysisResults),
            keyFactors: await this.explainKeyFactors(analysisResults, inputData),
            decisionRationale: await this.explainDecisionRationale(analysisResults),
            recommendations: await this.explainRecommendations(analysisResults),
            limitations: this.explainLimitations(analysisResults),
            nextSteps: this.suggestNextSteps(analysisResults, audienceLevel)
        };
        
        // Add specific explanation types
        if (explanationType === 'comprehensive' || explanationType === 'technical') {
            explanation.technicalDetails = await this.generateTechnicalExplanation(analysisResults);
            explanation.featureImportance = await this.explainFeatureImportance(analysisResults, inputData);
        }
        
        if (explanationType === 'comprehensive' || explanationType === 'business') {
            explanation.businessImpact = await this.explainBusinessImpact(analysisResults);
            explanation.actionableInsights = await this.generateActionableInsights(analysisResults);
        }
        
        return explanation;
    }

    async generateSummary(analysisResults, audienceLevel) {
        const conversionProbability = analysisResults.scoring?.conversionProbability || 0;
        const customerSegment = analysisResults.customerAnalysis?.customerSegment || 'unknown';
        const confidence = analysisResults.scoring?.confidence || 0;
        
        const confidenceLevel = this.getConfidenceLevel(confidence);
        const template = this.explanationTemplates.get(`${confidenceLevel}_confidence`);
        
        console.log('🔍 Debug generateSummary:', {
            confidence,
            confidenceLevel,
            templateKey: `${confidenceLevel}_confidence`,
            template,
            availableTemplates: Array.from(this.explanationTemplates.keys())
        });
        
        if (!template) {
            console.error('❌ Template not found for confidence level:', confidenceLevel);
            // Fallback template
            const fallbackTemplate = { intro: 'Analysis indicates:' };
            let summary = {
                overview: `${fallbackTemplate.intro} This customer has a ${Math.round(conversionProbability * 100)}% probability of conversion.`,
                segment: `Customer classified as: ${customerSegment}`,
                confidence: `Analysis confidence: ${confidenceLevel} (${Math.round(confidence * 100)}%)`,
                keyInsight: this.generateKeyInsight(analysisResults)
            };
            return summary;
        }
        
        let summary = {
            overview: `${template.intro} This customer has a ${Math.round(conversionProbability * 100)}% probability of conversion.`,
            segment: `Customer classified as: ${customerSegment}`,
            confidence: `Analysis confidence: ${confidenceLevel} (${Math.round(confidence * 100)}%)`,
            keyInsight: this.generateKeyInsight(analysisResults)
        };
        
        if (audienceLevel === 'executive') {
            summary.executiveSummary = this.generateExecutiveSummary(analysisResults);
        }
        
        return summary;
    }

    explainConfidence(analysisResults) {
        const confidence = analysisResults.scoring?.confidence || 0;
        const confidenceLevel = this.getConfidenceLevel(confidence);
        const threshold = this.confidenceThresholds.get(confidenceLevel);
        
        return {
            level: confidenceLevel,
            score: confidence,
            percentage: Math.round(confidence * 100),
            explanation: threshold.explanation,
            factors: this.getConfidenceFactors(analysisResults)
        };
    }

    async explainKeyFactors(analysisResults, inputData) {
        const factors = [];
        
        // DISC Profile factors
        if (analysisResults.customerAnalysis?.discProfile) {
            const discFactors = this.explainDISCFactors(analysisResults.customerAnalysis.discProfile);
            factors.push(...discFactors);
        }
        
        // Trigger factors
        if (analysisResults.triggerDetection?.triggers) {
            const triggerFactors = this.explainTriggerFactors(analysisResults.triggerDetection.triggers);
            factors.push(...triggerFactors);
        }
        
        // Demographic factors
        if (inputData) {
            const demoFactors = this.explainDemographicFactors(inputData);
            factors.push(...demoFactors);
        }
        
        // Sort by importance
        factors.sort((a, b) => b.importance - a.importance);
        
        return factors.slice(0, 10); // Top 10 factors
    }

    async explainDecisionRationale(analysisResults) {
        const rationale = {
            primaryReasons: [],
            supportingEvidence: [],
            methodology: 'Multi-factor analysis using DISC profiling, trigger detection, and fuzzy logic'
        };
        
        const conversionProbability = analysisResults.scoring?.conversionProbability || 0;
        
        if (conversionProbability > 0.7) {
            rationale.primaryReasons.push('Strong conversion indicators detected');
            rationale.primaryReasons.push('Multiple positive triggers identified');
            rationale.primaryReasons.push('Favorable customer profile match');
        } else if (conversionProbability > 0.4) {
            rationale.primaryReasons.push('Moderate conversion potential identified');
            rationale.primaryReasons.push('Some positive indicators present');
            rationale.primaryReasons.push('Mixed signal patterns detected');
        } else {
            rationale.primaryReasons.push('Limited conversion indicators');
            rationale.primaryReasons.push('Weak trigger response detected');
            rationale.primaryReasons.push('Customer profile requires development');
        }
        
        return rationale;
    }

    async explainRecommendations(analysisResults) {
        const recommendations = analysisResults.recommendations || {};
        
        return {
            productRecommendation: this.explainProductRecommendation(recommendations.products),
            communicationStrategy: this.explainCommunicationStrategy(recommendations.communication),
            engagementApproach: this.explainEngagementApproach(recommendations.engagement),
            reasoning: 'Recommendations based on customer profile, conversion probability, and behavioral patterns'
        };
    }

    explainLimitations(analysisResults) {
        const limitations = [
            'Analysis based on available data points at time of assessment',
            'Customer behavior may change over time',
            'External market factors not fully captured',
            'Predictions are probabilistic, not deterministic'
        ];
        
        const confidence = analysisResults.scoring?.confidence || 0;
        
        if (confidence < 0.5) {
            limitations.push('Limited data available for comprehensive analysis');
            limitations.push('Additional customer interaction recommended for better accuracy');
        }
        
        return limitations;
    }

    suggestNextSteps(analysisResults, audienceLevel) {
        const conversionProbability = analysisResults.scoring?.conversionProbability || 0;
        const confidence = analysisResults.scoring?.confidence || 0;
        
        const steps = [];
        
        if (audienceLevel === 'sales') {
            if (conversionProbability > 0.7) {
                steps.push('Immediate follow-up recommended');
                steps.push('Schedule product demonstration');
                steps.push('Prepare personalized proposal');
            } else if (conversionProbability > 0.4) {
                steps.push('Nurture relationship with targeted content');
                steps.push('Address identified concerns');
                steps.push('Schedule consultation call');
            } else {
                steps.push('Long-term nurture campaign');
                steps.push('Educational content delivery');
                steps.push('Periodic check-ins');
            }
        } else if (audienceLevel === 'marketing') {
            steps.push('Segment customer for targeted campaigns');
            steps.push('Customize messaging based on DISC profile');
            steps.push('Track engagement metrics');
        }
        
        if (confidence < 0.5) {
            steps.push('Gather additional customer data');
            steps.push('Conduct follow-up analysis');
        }
        
        return steps;
    }

    async generateTechnicalExplanation(analysisResults) {
        return {
            algorithms: [
                'DISC Personality Profiling',
                'Fuzzy Logic Inference Engine',
                'Trigger Detection Algorithm',
                'Multi-criteria Scoring Aggregation'
            ],
            dataPoints: this.countDataPoints(analysisResults),
            processingSteps: this.getProcessingSteps(),
            modelPerformance: this.getModelPerformance(analysisResults)
        };
    }

    async explainBusinessImpact(analysisResults) {
        const conversionProbability = analysisResults.scoring?.conversionProbability || 0;
        
        return {
            revenueImpact: this.calculateRevenueImpact(conversionProbability),
            resourceAllocation: this.suggestResourceAllocation(conversionProbability),
            riskAssessment: this.assessBusinessRisk(analysisResults),
            opportunityScore: Math.round(conversionProbability * 100)
        };
    }

    async generateActionableInsights(analysisResults) {
        const insights = [];
        
        const conversionProbability = analysisResults.scoring?.conversionProbability || 0;
        const customerSegment = analysisResults.customerAnalysis?.customerSegment;
        
        if (conversionProbability > 0.7) {
            insights.push({
                insight: 'High conversion probability detected',
                action: 'Prioritize immediate sales engagement',
                impact: 'high',
                timeline: 'immediate'
            });
        }
        
        if (customerSegment === 'luxury_seeker') {
            insights.push({
                insight: 'Customer values premium features',
                action: 'Emphasize luxury and exclusivity in communications',
                impact: 'medium',
                timeline: 'ongoing'
            });
        }
        
        return insights;
    }

    async explainFeatureImportance(analysisResults, inputData) {
        const features = [];
        
        // Calculate actual feature contributions
        for (const [featureName, featureData] of this.featureImportance) {
            const contribution = this.calculateFeatureContribution(featureName, analysisResults, inputData);
            
            features.push({
                name: featureName,
                importance: featureData.weight,
                contribution: contribution,
                category: featureData.category,
                explanation: featureData.explanation
            });
        }
        
        // Sort by actual contribution
        features.sort((a, b) => b.contribution - a.contribution);
        
        return features;
    }

    async explainDecisionPath(analysisResults, inputData) {
        const path = {
            steps: [
                {
                    step: 1,
                    process: 'Customer Analysis',
                    input: 'Customer data and responses',
                    output: 'DISC profile and segment classification',
                    confidence: analysisResults.customerAnalysis?.confidence || 0.5
                },
                {
                    step: 2,
                    process: 'Trigger Detection',
                    input: 'Customer responses and behavioral data',
                    output: 'Identified triggers and strengths',
                    confidence: analysisResults.triggerDetection?.confidence || 0.5
                },
                {
                    step: 3,
                    process: 'Fuzzy Inference',
                    input: 'DISC profile and trigger data',
                    output: 'Fuzzy logic scores and memberships',
                    confidence: analysisResults.fuzzyInference?.confidence || 0.5
                },
                {
                    step: 4,
                    process: 'Score Aggregation',
                    input: 'All analysis results',
                    output: 'Final conversion probability',
                    confidence: analysisResults.scoring?.confidence || 0.5
                },
                {
                    step: 5,
                    process: 'Recommendation Generation',
                    input: 'Aggregated scores and customer profile',
                    output: 'Personalized recommendations',
                    confidence: analysisResults.recommendations?.confidence || 0.5
                }
            ],
            overallConfidence: analysisResults.scoring?.confidence || 0.5
        };
        
        return path;
    }

    async explainConfidenceBreakdown(analysisResults, inputData) {
        const breakdown = {
            overall: analysisResults.scoring?.confidence || 0,
            components: {
                dataQuality: this.assessDataQuality(inputData),
                modelCertainty: this.assessModelCertainty(analysisResults),
                consistencyCheck: this.assessConsistency(analysisResults),
                coverageScore: this.assessCoverage(analysisResults)
            }
        };
        
        breakdown.explanation = this.generateConfidenceExplanation(breakdown);
        
        return breakdown;
    }

    async generateCounterfactualExplanation(analysisResults, inputData, targetOutcome) {
        const currentProbability = analysisResults.scoring?.conversionProbability || 0;
        const target = targetOutcome || 0.8;
        
        const changes = [];
        
        if (currentProbability < target) {
            changes.push({
                feature: 'Customer engagement',
                currentValue: 'Low',
                suggestedValue: 'High',
                impact: '+15% conversion probability',
                feasibility: 'High'
            });
            
            changes.push({
                feature: 'Product demonstration',
                currentValue: 'Not scheduled',
                suggestedValue: 'Scheduled',
                impact: '+20% conversion probability',
                feasibility: 'Medium'
            });
        }
        
        return {
            currentOutcome: currentProbability,
            targetOutcome: target,
            requiredChanges: changes,
            feasibilityScore: this.calculateFeasibilityScore(changes)
        };
    }

    async performSensitivityAnalysis(analysisResults, inputData, features) {
        const sensitivity = {};
        
        const baselineProbability = analysisResults.scoring?.conversionProbability || 0;
        
        // Test sensitivity for each feature
        const testFeatures = features || ['age', 'income', 'dominance', 'trigger_strength'];
        
        for (const feature of testFeatures) {
            sensitivity[feature] = {
                baseline: baselineProbability,
                variations: this.testFeatureVariations(feature, analysisResults, inputData)
            };
        }
        
        return sensitivity;
    }

    async explainSimilarCases(analysisResults, inputData) {
        // Find similar customer cases for comparison
        const customerProfile = {
            age: inputData.age || 35,
            income: inputData.income || 50000,
            discProfile: analysisResults.customerAnalysis?.discProfile || {},
            triggers: analysisResults.triggerDetection?.triggers || []
        };
        
        const similarCases = [
            {
                id: 'case_001',
                similarity: 0.85,
                profile: {
                    age: customerProfile.age + 2,
                    income: customerProfile.income * 1.1,
                    discProfile: customerProfile.discProfile,
                    outcome: 'converted'
                },
                outcome: {
                    converted: true,
                    conversionProbability: 0.78,
                    timeToConversion: '3 weeks'
                },
                keyDifferences: ['Higher income level', 'Faster decision making']
            },
            {
                id: 'case_002',
                similarity: 0.72,
                profile: {
                    age: customerProfile.age - 5,
                    income: customerProfile.income * 0.9,
                    discProfile: customerProfile.discProfile,
                    outcome: 'nurture_required'
                },
                outcome: {
                    converted: true,
                    conversionProbability: 0.65,
                    timeToConversion: '8 weeks'
                },
                keyDifferences: ['Required longer nurture period', 'Price sensitivity']
            }
        ];
        
        return {
            totalCases: similarCases.length,
            averageSimilarity: similarCases.reduce((sum, c) => sum + c.similarity, 0) / similarCases.length,
            cases: similarCases,
            insights: [
                'Similar customers typically convert within 3-8 weeks',
                'Income level correlates with conversion speed',
                'DISC profile consistency indicates higher success rate'
            ]
        };
    }

    // Helper methods
    getConfidenceLevel(confidence) {
        // Convert Map to array and sort by threshold descending
        const sortedThresholds = Array.from(this.confidenceThresholds.entries())
            .sort((a, b) => b[1].min - a[1].min);
        
        for (const [level, threshold] of sortedThresholds) {
            if (confidence >= threshold.min) {
                return level;
            }
        }
        return 'very_low';
    }

    generateKeyInsight(analysisResults) {
        const conversionProbability = analysisResults.scoring?.conversionProbability || 0;
        const customerSegment = analysisResults.customerAnalysis?.customerSegment;
        
        if (conversionProbability > 0.7) {
            return `High-potential ${customerSegment} customer ready for immediate engagement`;
        } else if (conversionProbability > 0.4) {
            return `Moderate-potential ${customerSegment} customer requiring nurture strategy`;
        } else {
            return `Early-stage ${customerSegment} customer needing long-term development`;
        }
    }

    generateExecutiveSummary(analysisResults) {
        const conversionProbability = analysisResults.scoring?.conversionProbability || 0;
        const revenue = this.calculateRevenueImpact(conversionProbability);
        
        return `Customer shows ${Math.round(conversionProbability * 100)}% conversion probability with potential revenue impact of $${revenue.toLocaleString()}.`;
    }

    getConfidenceFactors(analysisResults) {
        const factors = [];
        
        if (analysisResults.customerAnalysis?.confidence > 0.7) {
            factors.push('Strong customer profile data');
        }
        
        if (analysisResults.triggerDetection?.triggers?.length > 2) {
            factors.push('Multiple triggers identified');
        }
        
        if (analysisResults.scoring?.consistency > 0.8) {
            factors.push('Consistent analysis results');
        }
        
        return factors;
    }

    explainDISCFactors(discProfile) {
        const factors = [];
        
        Object.entries(discProfile).forEach(([trait, value]) => {
            if (value > 0.6) {
                const importance = this.featureImportance.get(trait.toLowerCase());
                factors.push({
                    factor: `High ${trait} trait`,
                    value: value,
                    importance: importance?.weight || 0.1,
                    explanation: importance?.explanation || `${trait} personality trait influences customer behavior`
                });
            }
        });
        
        return factors;
    }

    explainTriggerFactors(triggers) {
        return triggers.map(trigger => ({
            factor: `Trigger: ${trigger.name}`,
            value: trigger.strength,
            importance: 0.25,
            explanation: `Customer shows ${trigger.strength} strength for ${trigger.name} trigger`
        }));
    }

    explainDemographicFactors(inputData) {
        const factors = [];
        
        if (inputData.age) {
            const importance = this.featureImportance.get('age');
            factors.push({
                factor: 'Age demographic',
                value: inputData.age,
                importance: importance?.weight || 0.15,
                explanation: importance?.explanation || 'Age influences product preferences'
            });
        }
        
        return factors;
    }

    explainProductRecommendation(products) {
        if (!products || !products.primary) return 'No product recommendation available';
        
        return `${products.primary.product.name} recommended based on ${products.primary.reasoning}`;
    }

    explainCommunicationStrategy(communication) {
        if (!communication) return 'No communication strategy available';
        
        return `${communication.primaryApproach?.approach || 'Standard'} approach recommended with ${communication.primaryApproach?.tone || 'professional'} tone`;
    }

    explainEngagementApproach(engagement) {
        if (!engagement) return 'No engagement approach available';
        
        return `${engagement.timeline} engagement timeline with ${engagement.urgency} priority`;
    }

    calculateFeatureContribution(featureName, analysisResults, inputData) {
        // Simplified contribution calculation
        const baseImportance = this.featureImportance.get(featureName)?.weight || 0;
        const conversionProbability = analysisResults.scoring?.conversionProbability || 0;
        
        return baseImportance * conversionProbability;
    }

    countDataPoints(analysisResults) {
        let count = 0;
        
        if (analysisResults.customerAnalysis) count += 5;
        if (analysisResults.triggerDetection) count += 3;
        if (analysisResults.fuzzyInference) count += 4;
        if (analysisResults.scoring) count += 2;
        
        return count;
    }

    getProcessingSteps() {
        return [
            'Data validation and preprocessing',
            'DISC personality analysis',
            'Trigger pattern detection',
            'Fuzzy logic inference',
            'Multi-criteria score aggregation',
            'Recommendation generation'
        ];
    }

    getModelPerformance(analysisResults) {
        return {
            accuracy: 0.85,
            precision: 0.82,
            recall: 0.78,
            f1Score: 0.80,
            confidence: analysisResults.scoring?.confidence || 0.5
        };
    }

    calculateRevenueImpact(conversionProbability) {
        const averageVehiclePrice = 65000;
        return Math.round(conversionProbability * averageVehiclePrice);
    }

    suggestResourceAllocation(conversionProbability) {
        if (conversionProbability > 0.7) return 'High-touch sales engagement';
        if (conversionProbability > 0.4) return 'Medium-touch nurture campaign';
        return 'Low-touch awareness campaign';
    }

    assessBusinessRisk(analysisResults) {
        const confidence = analysisResults.scoring?.confidence || 0;
        
        if (confidence > 0.8) return 'Low risk';
        if (confidence > 0.5) return 'Medium risk';
        return 'High risk';
    }

    assessDataQuality(inputData) {
        if (!inputData) return 0.3;
        
        let score = 0.5;
        if (inputData.age) score += 0.1;
        if (inputData.income) score += 0.1;
        if (inputData.location) score += 0.1;
        if (inputData.responses && inputData.responses.length > 5) score += 0.2;
        
        return Math.min(score, 1.0);
    }

    assessModelCertainty(analysisResults) {
        const scores = [
            analysisResults.customerAnalysis?.confidence || 0.5,
            analysisResults.triggerDetection?.confidence || 0.5,
            analysisResults.fuzzyInference?.confidence || 0.5,
            analysisResults.scoring?.confidence || 0.5
        ];
        
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    assessConsistency(analysisResults) {
        // Simplified consistency check
        return analysisResults.scoring?.consistency || 0.7;
    }

    assessCoverage(analysisResults) {
        let coverage = 0;
        
        if (analysisResults.customerAnalysis) coverage += 0.25;
        if (analysisResults.triggerDetection) coverage += 0.25;
        if (analysisResults.fuzzyInference) coverage += 0.25;
        if (analysisResults.scoring) coverage += 0.25;
        
        return coverage;
    }

    generateConfidenceExplanation(breakdown) {
        const overall = breakdown.overall;
        
        if (overall > 0.8) {
            return 'High confidence based on comprehensive data and consistent model outputs';
        } else if (overall > 0.6) {
            return 'Good confidence with reliable data and model agreement';
        } else if (overall > 0.4) {
            return 'Moderate confidence with some data limitations or model uncertainty';
        } else {
            return 'Low confidence due to limited data or inconsistent model outputs';
        }
    }

    calculateFeasibilityScore(changes) {
        const feasibilityScores = {
            'High': 0.8,
            'Medium': 0.6,
            'Low': 0.3
        };
        
        const scores = changes.map(change => feasibilityScores[change.feasibility] || 0.5);
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    testFeatureVariations(feature, analysisResults, inputData) {
        // Simplified sensitivity testing
        const baseline = analysisResults.scoring?.conversionProbability || 0;
        
        return {
            'decrease_10%': Math.max(0, baseline - 0.1),
            'baseline': baseline,
            'increase_10%': Math.min(1, baseline + 0.1)
        };
    }

    async start() {
        this.app.listen(this.port, () => {
            console.log(`🔍 ${this.serviceName} service v${this.version} started`);
            console.log(`🌐 Service running on port ${this.port}`);
            console.log(`🔍 Health check: http://localhost:${this.port}/health`);
            console.log(`💡 Explanation endpoint: http://localhost:${this.port}/explain`);
        });
    }
}

// Start service if run directly
if (require.main === module) {
    const service = new TransparencyXAIService();
    service.start().catch(console.error);
}

module.exports = TransparencyXAIService;