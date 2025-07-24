/**
 * Customer Analysis Service - Mikro-usługa do analizy klientów
 * Wydzielona z monolitycznego CustomerDecoderEngine.js
 * 
 * @version 2.0
 * @author TRAE AI Assistant
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class CustomerAnalysisService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.initialized = false;
        this.data = {};
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                service: 'customer-analysis',
                status: 'healthy',
                version: '2.0',
                timestamp: new Date().toISOString()
            });
        });

        // Main analysis endpoint
        this.app.post('/analyze', async (req, res) => {
            try {
                const { customerId, sessionId, inputData } = req.body;
                
                if (!inputData) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing input data'
                    });
                }

                const analysis = await this.performAnalysis(inputData);
                
                res.json({
                    success: true,
                    analysisId: uuidv4(),
                    customerId,
                    sessionId,
                    analysis,
                    timestamp: new Date().toISOString(),
                    service: 'customer-analysis',
                    version: '2.0'
                });
                
            } catch (error) {
                console.error('Customer Analysis Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Analysis failed',
                    details: error.message,
                    service: 'customer-analysis'
                });
            }
        });

        // DISC Profile Analysis endpoint
        this.app.post('/disc-profile', async (req, res) => {
            try {
                const { triggers, demographics, conversationText } = req.body;
                
                const discProfile = await this.analyzeDISCProfile({
                    triggers,
                    demographics,
                    conversationText
                });
                
                res.json({
                    success: true,
                    discProfile,
                    timestamp: new Date().toISOString(),
                    service: 'customer-analysis'
                });
                
            } catch (error) {
                console.error('DISC Analysis Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'DISC analysis failed',
                    details: error.message
                });
            }
        });
    }

    async initialize() {
        try {
            console.log('🔧 Initializing Customer Analysis Service...');
            
            // Load shared data
            await this.loadSharedData();
            
            this.initialized = true;
            console.log('✅ Customer Analysis Service initialized successfully');
            
        } catch (error) {
            console.error('❌ Customer Analysis Service initialization failed:', error);
            throw error;
        }
    }

    async loadSharedData() {
        const dataPath = path.join(__dirname, '../../../shared/data');
        
        try {
            // Load essential data files
            this.data.triggers = JSON.parse(
                await fs.readFile(path.join(dataPath, 'triggers.json'), 'utf8')
            );
            
            this.data.personas = JSON.parse(
                await fs.readFile(path.join(dataPath, 'personas.json'), 'utf8')
            );
            
            this.data.rules = JSON.parse(
                await fs.readFile(path.join(dataPath, 'rules.json'), 'utf8')
            );
            
            console.log('✅ Shared data loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load shared data:', error);
            throw error;
        }
    }

    async performAnalysis(inputData) {
        if (!this.initialized) {
            throw new Error('Service not initialized');
        }

        const {
            selectedTriggers = [],
            demographics = {},
            conversationText = '',
            tone = 'professional'
        } = inputData;

        // Perform core analysis
        const discProfile = await this.analyzeDISCProfile({
            triggers: selectedTriggers,
            demographics,
            conversationText
        });

        const customerSegment = this.identifyCustomerSegment(demographics);
        const triggerAnalysis = this.analyzeTriggers(selectedTriggers);
        const demographicAnalysis = this.analyzeDemographics(demographics);

        return {
            discProfile,
            customerSegment,
            triggerAnalysis,
            demographicAnalysis,
            metadata: {
                triggersCount: selectedTriggers.length,
                analysisComplexity: this.calculateComplexity(inputData),
                processingTime: Date.now()
            }
        };
    }

    async analyzeDISCProfile(data) {
        const { triggers = [], demographics = {}, conversationText = '' } = data;
        
        // Simplified DISC analysis logic (extracted from original engine)
        const discScores = {
            D: 0, // Dominance
            I: 0, // Influence  
            S: 0, // Steadiness
            C: 0  // Conscientiousness
        };

        // Analyze triggers for DISC indicators
        triggers.forEach(trigger => {
            const triggerData = this.data.triggers.triggers.find(t => t.id === trigger);
            if (triggerData && triggerData.personality_resonance) {
                discScores.D += triggerData.personality_resonance.D || 0;
                discScores.I += triggerData.personality_resonance.I || 0;
                discScores.S += triggerData.personality_resonance.S || 0;
                discScores.C += triggerData.personality_resonance.C || 0;

            }
        });

        // Analyze demographics for DISC indicators
        if (demographics.age) {
            const age = typeof demographics.age === 'number' ? demographics.age : parseInt(demographics.age);
            // Younger people tend to be more I and D
            if (age >= 18 && age <= 35) {
                discScores.I += 10;
                discScores.D += 5;
            }
            // Older people tend to be more S and C
            if (age >= 56) {
                discScores.S += 10;
                discScores.C += 5;
            }
        }

        // Normalize scores
        const total = Object.values(discScores).reduce((sum, score) => sum + score, 0);
        if (total > 0) {
            Object.keys(discScores).forEach(key => {
                discScores[key] = Math.round((discScores[key] / total) * 100);
            });
        }

        // Determine primary profile
        const primaryProfile = Object.entries(discScores)
            .sort(([,a], [,b]) => b - a)[0][0];

        return {
            scores: discScores,
            primary: primaryProfile,
            confidence: this.calculateDISCConfidence(discScores),
            description: this.getDISCDescription(primaryProfile)
        };
    }

    identifyCustomerSegment(demographics) {
        // Simplified customer segmentation logic
        const segments = {
            eco_family: 0,
            tech_professional: 0,
            senior_comfort: 0,
            business_roi: 0,
            young_urban: 0
        };

        // Eco Family scoring
        if (demographics.hasChildren && demographics.hasChildren !== 'none') segments.eco_family += 30;
        if (demographics.hasPV === 'true' || demographics.hasPV === 'planned') segments.eco_family += 25;
        if (demographics.housingType === 'dom') segments.eco_family += 20;

        // Tech Professional scoring
        if (demographics.age) {
            const age = typeof demographics.age === 'number' ? demographics.age : parseInt(demographics.age);
            if (age >= 26 && age <= 45) {
                segments.tech_professional += 25;
            }
        }
        if (demographics.teslaExperience === 'researching' || demographics.teslaExperience === 'test_driven') {
            segments.tech_professional += 30;
        }

        // Find best matching segment
        const bestSegment = Object.entries(segments)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            segment: bestSegment[1] > 50 ? bestSegment[0] : 'general',
            confidence: Math.min(bestSegment[1] / 100, 1),
            scores: segments
        };
    }

    analyzeTriggers(selectedTriggers) {
        const categories = {};
        const intensities = [];

        selectedTriggers.forEach(triggerId => {
            const trigger = this.data.triggers.triggers.find(t => t.id === triggerId);
            if (trigger) {
                // Group by category
                const category = trigger.category || 'other';
                if (!categories[category]) categories[category] = [];
                categories[category].push(trigger);

                // Collect intensities
                if (trigger.intensity) {
                    intensities.push(trigger.intensity);
                }
            }
        });

        const avgIntensity = intensities.length > 0 
            ? intensities.reduce((sum, i) => sum + i, 0) / intensities.length 
            : 0;

        return {
            categories,
            totalCount: selectedTriggers.length,
            averageIntensity: Math.round(avgIntensity * 100) / 100,
            dominantCategory: Object.entries(categories)
                .sort(([,a], [,b]) => b.length - a.length)[0]?.[0] || 'none'
        };
    }

    analyzeDemographics(demographics) {
        const analysis = {
            ageGroup: demographics.age || 'unknown',
            housingType: demographics.housingType || 'unknown',
            familyStatus: demographics.hasChildren || 'unknown',
            teslaExperience: demographics.teslaExperience || 'unknown',
            riskFactors: [],
            positiveFactors: []
        };

        // Identify risk factors
        if (demographics.age) {
            const age = typeof demographics.age === 'number' ? demographics.age : parseInt(demographics.age);
            if (age >= 65 || (age >= 18 && age <= 25)) {
                analysis.riskFactors.push('age_extremes');
            }
        }
        
        if (demographics.housingType === 'mieszkanie') {
            analysis.riskFactors.push('charging_limitations');
        }

        // Identify positive factors
        if (demographics.hasPV === 'true') {
            analysis.positiveFactors.push('solar_synergy');
        }
        
        if (demographics.teslaExperience === 'test_driven') {
            analysis.positiveFactors.push('hands_on_experience');
        }

        return analysis;
    }

    calculateComplexity(inputData) {
        let complexity = 'low';
        
        if (inputData.selectedTriggers?.length > 10) complexity = 'medium';
        if (inputData.selectedTriggers?.length > 20) complexity = 'high';
        if (inputData.conversationText?.length > 1000) complexity = 'high';
        
        return complexity;
    }

    calculateDISCConfidence(scores) {
        const values = Object.values(scores);
        const max = Math.max(...values);
        const secondMax = values.sort((a, b) => b - a)[1];
        
        // Higher difference between top scores = higher confidence
        const difference = max - secondMax;
        return Math.min(difference / 50, 1); // Normalize to 0-1
    }

    getDISCDescription(profile) {
        const descriptions = {
            D: 'Dominance - Bezpośredni, zorientowany na wyniki, lubi kontrolę',
            I: 'Influence - Towarzyski, entuzjastyczny, lubi ludzi',
            S: 'Steadiness - Cierpliwy, niezawodny, lubi stabilność',
            C: 'Conscientiousness - Analityczny, precyzyjny, lubi szczegóły'
        };
        
        return descriptions[profile] || 'Nieznany profil';
    }

    async start() {
        await this.initialize();
        
        this.app.listen(this.port, () => {
            console.log(`🚀 Customer Analysis Service running on port ${this.port}`);
            console.log(`🌐 Health check: http://localhost:${this.port}/health`);
            console.log(`🔍 Analysis endpoint: http://localhost:${this.port}/analyze`);
        });
    }
}

// Start service if run directly
if (require.main === module) {
    const service = new CustomerAnalysisService();
    service.start().catch(console.error);
}

module.exports = CustomerAnalysisService;