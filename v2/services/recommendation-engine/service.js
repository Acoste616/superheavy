/**
 * Tesla Customer Decoder - Recommendation Engine Service
 * Mikro-usługa odpowiedzialna za generowanie spersonalizowanych rekomendacji
 * 
 * @version 2.0
 * @author TRAE AI Assistant
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class RecommendationEngineService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3005;
        this.serviceName = 'recommendation-engine';
        this.version = '2.0';
        
        // Recommendation components
        this.recommendationRules = new Map();
        this.productCatalog = new Map();
        this.communicationTemplates = new Map();
        this.strategyTemplates = new Map();
        
        this.setupMiddleware();
        this.loadRecommendationData();
        this.initializeRecommendationStrategies();
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

    loadRecommendationData() {
        try {
            // Load product catalog
            this.loadProductCatalog();
            
            // Load communication templates
            this.loadCommunicationTemplates();
            
            // Load recommendation rules
            this.loadRecommendationRules();
            
        } catch (error) {
            console.error(`[${this.serviceName}] Error loading recommendation data:`, error);
        }
    }

    loadProductCatalog() {
        // Tesla product catalog
        const products = [
            {
                id: 'model_s',
                name: 'Model S',
                category: 'luxury_sedan',
                basePrice: 94990,
                range: 405,
                acceleration: 3.1,
                topSpeed: 200,
                features: ['autopilot', 'premium_interior', 'glass_roof', 'air_suspension'],
                targetSegments: ['luxury_seeker', 'performance_oriented', 'tech_enthusiast'],
                discProfiles: ['high_D', 'high_I']
            },
            {
                id: 'model_3',
                name: 'Model 3',
                category: 'compact_sedan',
                basePrice: 38990,
                range: 358,
                acceleration: 5.3,
                topSpeed: 140,
                features: ['autopilot', 'minimalist_interior', 'mobile_connector'],
                targetSegments: ['practical_buyer', 'eco_conscious', 'tech_enthusiast'],
                discProfiles: ['high_C', 'medium_I']
            },
            {
                id: 'model_x',
                name: 'Model X',
                category: 'luxury_suv',
                basePrice: 109990,
                range: 348,
                acceleration: 3.8,
                topSpeed: 163,
                features: ['falcon_wing_doors', 'autopilot', 'premium_interior', 'towing_capacity'],
                targetSegments: ['luxury_seeker', 'family_oriented', 'tech_enthusiast'],
                discProfiles: ['high_D', 'high_S']
            },
            {
                id: 'model_y',
                name: 'Model Y',
                category: 'compact_suv',
                basePrice: 52990,
                range: 330,
                acceleration: 4.8,
                topSpeed: 135,
                features: ['autopilot', 'panoramic_roof', 'cargo_space', 'all_wheel_drive'],
                targetSegments: ['practical_buyer', 'family_oriented', 'eco_conscious'],
                discProfiles: ['medium_D', 'high_S']
            },
            {
                id: 'cybertruck',
                name: 'Cybertruck',
                category: 'electric_truck',
                basePrice: 60990,
                range: 340,
                acceleration: 4.5,
                topSpeed: 112,
                features: ['bulletproof_exterior', 'towing_capacity', 'air_suspension', 'vault_storage'],
                targetSegments: ['early_adopter', 'performance_oriented', 'practical_buyer'],
                discProfiles: ['high_D', 'medium_C']
            }
        ];
        
        products.forEach(product => {
            this.productCatalog.set(product.id, product);
        });
        
        console.log(`[${this.serviceName}] Loaded ${this.productCatalog.size} products`);
    }

    loadCommunicationTemplates() {
        const templates = {
            high_dominance: {
                tone: 'direct_confident',
                keyPoints: ['performance', 'leadership', 'innovation', 'exclusivity'],
                approach: 'results_focused',
                urgency: 'high',
                decisionStyle: 'quick_decisive'
            },
            high_influence: {
                tone: 'enthusiastic_social',
                keyPoints: ['social_status', 'innovation', 'experience', 'community'],
                approach: 'relationship_focused',
                urgency: 'medium',
                decisionStyle: 'collaborative'
            },
            high_steadiness: {
                tone: 'calm_reassuring',
                keyPoints: ['reliability', 'safety', 'family_benefits', 'long_term_value'],
                approach: 'trust_building',
                urgency: 'low',
                decisionStyle: 'careful_deliberate'
            },
            high_compliance: {
                tone: 'detailed_factual',
                keyPoints: ['specifications', 'data', 'comparisons', 'warranties'],
                approach: 'information_focused',
                urgency: 'low',
                decisionStyle: 'research_based'
            }
        };
        
        Object.entries(templates).forEach(([key, template]) => {
            this.communicationTemplates.set(key, template);
        });
        
        console.log(`[${this.serviceName}] Loaded ${this.communicationTemplates.size} communication templates`);
    }

    loadRecommendationRules() {
        // Load from file if exists, otherwise use defaults
        const rulesPath = path.join(__dirname, '../../../shared/data/recommendation_rules.json');
        
        let rules = {};
        if (fs.existsSync(rulesPath)) {
            rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
        } else {
            // Default rules
            rules = this.getDefaultRecommendationRules();
        }
        
        Object.entries(rules).forEach(([key, rule]) => {
            this.recommendationRules.set(key, rule);
        });
        
        console.log(`[${this.serviceName}] Loaded ${this.recommendationRules.size} recommendation rules`);
    }

    getDefaultRecommendationRules() {
        return {
            high_conversion_probability: {
                threshold: 0.7,
                actions: ['immediate_contact', 'premium_offer', 'test_drive_priority'],
                timeline: 'within_24h'
            },
            medium_conversion_probability: {
                threshold: 0.4,
                actions: ['nurture_campaign', 'educational_content', 'follow_up_sequence'],
                timeline: 'within_week'
            },
            low_conversion_probability: {
                threshold: 0.2,
                actions: ['awareness_campaign', 'long_term_nurture', 'market_research'],
                timeline: 'within_month'
            },
            luxury_seeker: {
                products: ['model_s', 'model_x'],
                emphasis: ['premium_features', 'exclusivity', 'performance'],
                communication: 'high_touch'
            },
            practical_buyer: {
                products: ['model_3', 'model_y'],
                emphasis: ['value', 'efficiency', 'practicality'],
                communication: 'informational'
            },
            early_adopter: {
                products: ['cybertruck', 'model_s'],
                emphasis: ['innovation', 'technology', 'future_vision'],
                communication: 'tech_focused'
            }
        };
    }

    initializeRecommendationStrategies() {
        this.strategyTemplates.set('product_recommendation', this.generateProductRecommendation.bind(this));
        this.strategyTemplates.set('communication_strategy', this.generateCommunicationStrategy.bind(this));
        this.strategyTemplates.set('engagement_timeline', this.generateEngagementTimeline.bind(this));
        this.strategyTemplates.set('pricing_strategy', this.generatePricingStrategy.bind(this));
        this.strategyTemplates.set('feature_emphasis', this.generateFeatureEmphasis.bind(this));
        
        console.log(`[${this.serviceName}] Initialized ${this.strategyTemplates.size} recommendation strategies`);
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
                    products: this.productCatalog.size,
                    communicationTemplates: this.communicationTemplates.size,
                    recommendationRules: this.recommendationRules.size,
                    strategies: this.strategyTemplates.size
                }
            });
        });

        // Main recommendation generation endpoint
        this.app.post('/generate', async (req, res) => {
            try {
                const { scoring, customerAnalysis, inputData } = req.body;
                
                console.log(`[${req.requestId}] Generating recommendations`);
                
                if (!scoring || !customerAnalysis) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required analysis data',
                        requestId: req.requestId
                    });
                }

                const recommendations = await this.generateRecommendations(
                    scoring, 
                    customerAnalysis, 
                    inputData
                );
                
                res.json({
                    success: true,
                    recommendations,
                    requestId: req.requestId,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`[${req.requestId}] Recommendation generation failed:`, error);
                
                res.status(500).json({
                    success: false,
                    error: 'Recommendation generation failed',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        // Get product catalog
        this.app.get('/products', (req, res) => {
            const products = Array.from(this.productCatalog.values());
            
            res.json({
                success: true,
                products,
                count: products.length,
                requestId: req.requestId
            });
        });

        // Get product by ID
        this.app.get('/products/:id', (req, res) => {
            const { id } = req.params;
            const product = this.productCatalog.get(id);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: `Product ${id} not found`,
                    requestId: req.requestId
                });
            }
            
            res.json({
                success: true,
                product,
                requestId: req.requestId
            });
        });

        // Get communication templates
        this.app.get('/communication-templates', (req, res) => {
            const templates = Object.fromEntries(this.communicationTemplates);
            
            res.json({
                success: true,
                templates,
                count: this.communicationTemplates.size,
                requestId: req.requestId
            });
        });

        // Test recommendation strategies
        this.app.post('/test-strategies', async (req, res) => {
            try {
                const { scoring, customerAnalysis, inputData } = req.body;
                
                const strategyResults = {};
                
                for (const [strategyName, strategyFunc] of this.strategyTemplates) {
                    try {
                        strategyResults[strategyName] = await strategyFunc(scoring, customerAnalysis, inputData);
                    } catch (error) {
                        strategyResults[strategyName] = { error: error.message };
                    }
                }
                
                res.json({
                    success: true,
                    strategyResults,
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
    }

    async generateRecommendations(scoring, customerAnalysis, inputData) {
        const recommendations = {
            products: await this.generateProductRecommendation(scoring, customerAnalysis, inputData),
            communication: await this.generateCommunicationStrategy(scoring, customerAnalysis, inputData),
            engagement: await this.generateEngagementTimeline(scoring, customerAnalysis, inputData),
            pricing: await this.generatePricingStrategy(scoring, customerAnalysis, inputData),
            features: await this.generateFeatureEmphasis(scoring, customerAnalysis, inputData),
            nextSteps: this.generateNextSteps(scoring, customerAnalysis),
            priority: this.calculatePriority(scoring),
            confidence: scoring.confidence || 0.5
        };
        
        return recommendations;
    }

    async generateProductRecommendation(scoring, customerAnalysis, inputData) {
        const conversionProbability = scoring.conversionProbability || 0;
        const customerSegment = customerAnalysis.customerSegment;
        const discProfile = customerAnalysis.discProfile || {};
        
        // Score each product for this customer
        const productScores = [];
        
        for (const [productId, product] of this.productCatalog) {
            let score = 0;
            
            // Segment matching
            if (product.targetSegments.includes(customerSegment)) {
                score += 0.4;
            }
            
            // DISC profile matching
            const dominantTrait = this.getDominantDISCTrait(discProfile);
            if (product.discProfiles.includes(dominantTrait)) {
                score += 0.3;
            }
            
            // Budget consideration
            if (inputData && inputData.budget) {
                const budgetFit = Math.max(0, 1 - Math.abs(product.basePrice - inputData.budget) / inputData.budget);
                score += budgetFit * 0.2;
            }
            
            // Conversion probability influence
            score += conversionProbability * 0.1;
            
            productScores.push({
                productId,
                product,
                score,
                reasoning: this.generateProductReasoning(product, customerSegment, dominantTrait)
            });
        }
        
        // Sort by score and return top recommendations
        productScores.sort((a, b) => b.score - a.score);
        
        return {
            primary: productScores[0],
            alternatives: productScores.slice(1, 3),
            allScores: productScores
        };
    }

    async generateCommunicationStrategy(scoring, customerAnalysis, inputData) {
        const discProfile = customerAnalysis.discProfile || {};
        const dominantTrait = this.getDominantDISCTrait(discProfile);
        
        const template = this.communicationTemplates.get(`high_${dominantTrait.toLowerCase()}`) || 
                        this.communicationTemplates.get('high_influence');
        
        return {
            primaryApproach: template,
            channels: this.recommendChannels(dominantTrait, scoring.conversionProbability),
            messaging: this.generateMessaging(template, customerAnalysis),
            frequency: this.recommendContactFrequency(dominantTrait, scoring.conversionProbability)
        };
    }

    async generateEngagementTimeline(scoring, customerAnalysis, inputData) {
        const conversionProbability = scoring.conversionProbability || 0;
        
        let timeline = 'medium_term'; // Default
        let urgency = 'medium';
        
        if (conversionProbability > 0.7) {
            timeline = 'immediate';
            urgency = 'high';
        } else if (conversionProbability > 0.4) {
            timeline = 'short_term';
            urgency = 'medium';
        } else {
            timeline = 'long_term';
            urgency = 'low';
        }
        
        return {
            timeline,
            urgency,
            phases: this.generateEngagementPhases(timeline, customerAnalysis),
            milestones: this.generateMilestones(timeline),
            touchpoints: this.generateTouchpoints(timeline, urgency)
        };
    }

    async generatePricingStrategy(scoring, customerAnalysis, inputData) {
        const customerSegment = customerAnalysis.customerSegment;
        const conversionProbability = scoring.conversionProbability || 0;
        
        let strategy = 'standard';
        let incentives = [];
        
        if (conversionProbability > 0.8) {
            strategy = 'premium';
            incentives = ['priority_delivery', 'exclusive_features'];
        } else if (conversionProbability > 0.6) {
            strategy = 'value_added';
            incentives = ['extended_warranty', 'free_charging'];
        } else if (conversionProbability < 0.3) {
            strategy = 'promotional';
            incentives = ['financing_options', 'trade_in_bonus'];
        }
        
        return {
            strategy,
            incentives,
            financing: this.recommendFinancing(customerSegment, inputData),
            tradeIn: this.recommendTradeIn(inputData)
        };
    }

    async generateFeatureEmphasis(scoring, customerAnalysis, inputData) {
        const customerSegment = customerAnalysis.customerSegment;
        const discProfile = customerAnalysis.discProfile || {};
        
        const featurePriorities = {
            luxury_seeker: ['premium_interior', 'performance', 'exclusivity'],
            tech_enthusiast: ['autopilot', 'software_updates', 'connectivity'],
            eco_conscious: ['efficiency', 'sustainability', 'environmental_impact'],
            performance_oriented: ['acceleration', 'handling', 'top_speed'],
            practical_buyer: ['value', 'reliability', 'practicality'],
            family_oriented: ['safety', 'space', 'convenience']
        };
        
        const primaryFeatures = featurePriorities[customerSegment] || ['value', 'reliability', 'efficiency'];
        
        return {
            primary: primaryFeatures,
            secondary: this.getSecondaryFeatures(discProfile),
            avoid: this.getFeaturestoAvoid(customerSegment),
            emphasis: this.getEmphasisLevel(scoring.conversionProbability)
        };
    }

    generateNextSteps(scoring, customerAnalysis) {
        const conversionProbability = scoring.conversionProbability || 0;
        const steps = [];
        
        if (conversionProbability > 0.7) {
            steps.push(
                { action: 'immediate_contact', priority: 'high', timeline: 'within_2h' },
                { action: 'schedule_test_drive', priority: 'high', timeline: 'within_24h' },
                { action: 'prepare_quote', priority: 'medium', timeline: 'within_4h' }
            );
        } else if (conversionProbability > 0.4) {
            steps.push(
                { action: 'send_information_packet', priority: 'medium', timeline: 'within_24h' },
                { action: 'schedule_consultation', priority: 'medium', timeline: 'within_week' },
                { action: 'follow_up_call', priority: 'low', timeline: 'within_3_days' }
            );
        } else {
            steps.push(
                { action: 'add_to_nurture_campaign', priority: 'low', timeline: 'within_week' },
                { action: 'send_educational_content', priority: 'low', timeline: 'within_month' },
                { action: 'quarterly_check_in', priority: 'low', timeline: 'quarterly' }
            );
        }
        
        return steps;
    }

    calculatePriority(scoring) {
        const conversionProbability = scoring.conversionProbability || 0;
        
        if (conversionProbability > 0.7) return 'high';
        if (conversionProbability > 0.4) return 'medium';
        return 'low';
    }

    getDominantDISCTrait(discProfile) {
        const traits = ['D', 'I', 'S', 'C'];
        let maxTrait = 'I';
        let maxValue = 0;
        
        traits.forEach(trait => {
            if ((discProfile[trait] || 0) > maxValue) {
                maxValue = discProfile[trait];
                maxTrait = trait;
            }
        });
        
        return maxTrait;
    }

    generateProductReasoning(product, customerSegment, dominantTrait) {
        const reasons = [];
        
        if (product.targetSegments.includes(customerSegment)) {
            reasons.push(`Matches ${customerSegment} segment`);
        }
        
        if (product.discProfiles.includes(`high_${dominantTrait}`)) {
            reasons.push(`Aligns with ${dominantTrait} personality trait`);
        }
        
        return reasons.join(', ');
    }

    recommendChannels(dominantTrait, conversionProbability) {
        const baseChannels = ['email', 'phone'];
        
        if (dominantTrait === 'I') {
            baseChannels.push('social_media', 'video_call');
        } else if (dominantTrait === 'D') {
            baseChannels.push('direct_meeting', 'executive_contact');
        } else if (dominantTrait === 'S') {
            baseChannels.push('referral', 'testimonials');
        } else if (dominantTrait === 'C') {
            baseChannels.push('detailed_documentation', 'technical_specs');
        }
        
        if (conversionProbability > 0.7) {
            baseChannels.push('priority_line', 'personal_advisor');
        }
        
        return baseChannels;
    }

    generateMessaging(template, customerAnalysis) {
        return {
            headline: this.generateHeadline(template, customerAnalysis),
            keyPoints: template.keyPoints,
            callToAction: this.generateCTA(template),
            tone: template.tone
        };
    }

    generateHeadline(template, customerAnalysis) {
        const headlines = {
            direct_confident: "Experience Tesla's Revolutionary Performance",
            enthusiastic_social: "Join the Tesla Community - Drive the Future",
            calm_reassuring: "Tesla: Reliable Innovation for Your Family",
            detailed_factual: "Tesla Model Specifications and Performance Data"
        };
        
        return headlines[template.tone] || "Discover Tesla Innovation";
    }

    generateCTA(template) {
        const ctas = {
            direct_confident: "Schedule Your Test Drive Now",
            enthusiastic_social: "Join Tesla Owners Today",
            calm_reassuring: "Learn More About Tesla Safety",
            detailed_factual: "Download Complete Specifications"
        };
        
        return ctas[template.tone] || "Learn More";
    }

    recommendContactFrequency(dominantTrait, conversionProbability) {
        let baseFrequency = 'weekly';
        
        if (dominantTrait === 'D' && conversionProbability > 0.6) {
            baseFrequency = 'daily';
        } else if (dominantTrait === 'S') {
            baseFrequency = 'bi_weekly';
        } else if (conversionProbability > 0.8) {
            baseFrequency = 'every_2_days';
        }
        
        return baseFrequency;
    }

    generateEngagementPhases(timeline, customerAnalysis) {
        const phases = {
            immediate: ['contact', 'demo', 'close'],
            short_term: ['awareness', 'consideration', 'evaluation', 'decision'],
            medium_term: ['education', 'nurture', 'engagement', 'conversion'],
            long_term: ['awareness', 'education', 'nurture', 'periodic_engagement']
        };
        
        return phases[timeline] || phases.medium_term;
    }

    generateMilestones(timeline) {
        const milestones = {
            immediate: ['first_contact', 'test_drive_scheduled', 'purchase_decision'],
            short_term: ['information_sent', 'consultation_completed', 'proposal_delivered'],
            medium_term: ['engagement_established', 'interest_confirmed', 'evaluation_started'],
            long_term: ['awareness_created', 'periodic_touchpoint', 'interest_development']
        };
        
        return milestones[timeline] || milestones.medium_term;
    }

    generateTouchpoints(timeline, urgency) {
        const touchpoints = {
            immediate: ['phone_call', 'email', 'text_message'],
            short_term: ['email', 'phone_call', 'brochure'],
            medium_term: ['email_series', 'newsletter', 'event_invitation'],
            long_term: ['quarterly_newsletter', 'annual_survey', 'product_updates']
        };
        
        return touchpoints[timeline] || touchpoints.medium_term;
    }

    recommendFinancing(customerSegment, inputData) {
        const financing = {
            luxury_seeker: ['lease_premium', 'cash_purchase'],
            practical_buyer: ['standard_financing', 'lease_standard'],
            price_sensitive: ['extended_financing', 'promotional_rates']
        };
        
        return financing[customerSegment] || financing.practical_buyer;
    }

    recommendTradeIn(inputData) {
        if (inputData && inputData.currentVehicle) {
            return {
                recommended: true,
                estimatedValue: 'contact_for_estimate',
                benefits: ['reduced_down_payment', 'simplified_process']
            };
        }
        
        return { recommended: false };
    }

    getSecondaryFeatures(discProfile) {
        const dominantTrait = this.getDominantDISCTrait(discProfile);
        
        const secondaryFeatures = {
            D: ['performance', 'technology', 'status'],
            I: ['connectivity', 'social_features', 'entertainment'],
            S: ['safety', 'comfort', 'reliability'],
            C: ['efficiency', 'data', 'precision']
        };
        
        return secondaryFeatures[dominantTrait] || secondaryFeatures.I;
    }

    getFeaturestoAvoid(customerSegment) {
        const avoidFeatures = {
            price_sensitive: ['premium_options', 'luxury_features'],
            practical_buyer: ['performance_focus', 'luxury_emphasis'],
            eco_conscious: ['performance_over_efficiency']
        };
        
        return avoidFeatures[customerSegment] || [];
    }

    getEmphasisLevel(conversionProbability) {
        if (conversionProbability > 0.7) return 'high';
        if (conversionProbability > 0.4) return 'medium';
        return 'low';
    }

    async start() {
        this.app.listen(this.port, () => {
            console.log(`🎯 ${this.serviceName} service v${this.version} started`);
            console.log(`🌐 Service running on port ${this.port}`);
            console.log(`🔍 Health check: http://localhost:${this.port}/health`);
            console.log(`💡 Recommendations endpoint: http://localhost:${this.port}/generate`);
        });
    }
}

// Start service if run directly
if (require.main === module) {
    const service = new RecommendationEngineService();
    service.start().catch(console.error);
}

module.exports = RecommendationEngineService;