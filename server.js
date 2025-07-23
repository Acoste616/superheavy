/**
 * Tesla Customer Decoder SHU PRO - Node.js Backend
 * Advanced customer journey tracking and probability analysis
 * 
 * @version 2.0
 * @author Claude AI Assistant
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Import our logic engine
const CustomerDecoderEngine = require('./backend/CustomerDecoderEngine.js');
const CustomerJourneyTracker = require('./backend/CustomerJourneyTracker.js');
const ProbabilityAnalyzer = require('./backend/ProbabilityAnalyzer.js');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Initialize systems
let decoderEngine;
let journeyTracker;
let probabilityAnalyzer;

// Initialize backend systems
async function initializeBackend() {
    try {
        console.log('🚀 Initializing Tesla Customer Decoder SHU PRO Backend...');
        
        // Initialize decoder engine
        const dataFiles = {
            triggers: 'data/triggers.json',
            personas: 'data/personas.json',
            rules: 'data/rules.json',
            weights: 'weights_and_scoring.json',
            cheatsheet: 'cheatsheet_phrases.json',
            objections: 'objections_and_rebuttals.json'
        };
        
        decoderEngine = new CustomerDecoderEngine();
        await decoderEngine.initialize(dataFiles);
        
        // Initialize journey tracker
        journeyTracker = new CustomerJourneyTracker();
        await journeyTracker.initialize();
        
        // Initialize probability analyzer
        probabilityAnalyzer = new ProbabilityAnalyzer();
        
        console.log('✅ Backend systems initialized successfully');
        
    } catch (error) {
        console.error('❌ Backend initialization failed:', error);
        process.exit(1);
    }
}

// API Routes

// Analysis endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const { customerId, sessionId, inputData } = req.body;
        
        // Enhanced input validation
        if (!inputData) {
            return res.status(400).json({
                success: false,
                error: 'Missing input data'
            });
        }
        
        if (!inputData.selectedTriggers || inputData.selectedTriggers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No triggers selected'
            });
        }
        
        // Perform customer analysis with enhanced error handling
        const analysis = await decoderEngine.analyzeCustomer(inputData);
        
        // Validate analysis result
        if (!analysis || (typeof analysis.conversion_probability === 'undefined' && typeof analysis.scores?.enhanced_conversion_probability === 'undefined')) {
            throw new Error('Invalid analysis result');
        }
        
        // Ensure conversion_probability exists for backward compatibility
        if (typeof analysis.conversion_probability === 'undefined' && analysis.scores?.enhanced_conversion_probability) {
            analysis.conversion_probability = analysis.scores.enhanced_conversion_probability;
        }
        
        // Create or update customer journey
        const customerData = {
            customerId: customerId || uuidv4(),
            sessionId: sessionId || uuidv4(),
            timestamp: new Date(),
            analysis: analysis,
            triggers: inputData.selectedTriggers,
            stage: 'initial_analysis'
        };
        
        await journeyTracker.recordStage(customerData);
        
        res.json({
            success: true,
            analysis: analysis,
            customerId: customerData.customerId,
            sessionId: customerData.sessionId
        });
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Enhanced error response
        let statusCode = 500;
        let errorMessage = 'Analysis failed';
        
        if (error.message.includes('validation')) {
            statusCode = 400;
            errorMessage = 'Data validation failed: ' + error.message;
        } else if (error.message.includes('API')) {
            statusCode = 503;
            errorMessage = 'External service unavailable: ' + error.message;
        } else if (error.message.includes('Invalid analysis result')) {
            statusCode = 500;
            errorMessage = 'Analysis engine error';
        }
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
});

// Post-conversation trigger tracking
app.post('/api/conversation/complete', async (req, res) => {
    try {
        const { 
            customerId, 
            sessionId, 
            conversationOutcome, 
            newTriggers, 
            clientReactions,
            nextSteps 
        } = req.body;
        
        // Record conversation outcome
        const conversationData = {
            customerId,
            sessionId,
            timestamp: new Date(),
            stage: 'post_conversation',
            outcome: conversationOutcome,
            newTriggers: newTriggers || [],
            reactions: clientReactions || [],
            nextSteps: nextSteps || []
        };
        
        await journeyTracker.recordStage(conversationData);
        
        // Update probability based on new information
        const updatedProbability = probabilityAnalyzer.calculatePostConversationProbability({
            previousAnalysis: await journeyTracker.getCustomerJourney(customerId),
            conversationData
        });
        
        // Get recommended follow-up actions
        const followUpActions = await getFollowUpActions(customerId, conversationData);
        
        res.json({
            success: true,
            updatedProbability,
            followUpActions,
            customerId,
            sessionId
        });
        
    } catch (error) {
        console.error('Conversation tracking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record conversation'
        });
    }
});

// Test drive booking
app.post('/api/testdrive/book', async (req, res) => {
    try {
        const {
            customerId,
            sessionId,
            testDriveDetails,
            customerExpectations,
            specificConcerns
        } = req.body;
        
        const testDriveData = {
            customerId,
            sessionId,
            timestamp: new Date(),
            stage: 'test_drive_booked',
            details: testDriveDetails,
            expectations: customerExpectations || [],
            concerns: specificConcerns || []
        };
        
        await journeyTracker.recordStage(testDriveData);
        
        // Generate pre-drive preparation recommendations
        const preDrivePrep = await generatePreDrivePreparation(customerId);
        
        res.json({
            success: true,
            testDriveId: uuidv4(),
            preDrivePrep,
            customerId,
            sessionId
        });
        
    } catch (error) {
        console.error('Test drive booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to book test drive'
        });
    }
});

// Post test drive analysis
app.post('/api/testdrive/complete', async (req, res) => {
    try {
        const {
            customerId,
            sessionId,
            testDriveId,
            customerFeedback,
            observedBehaviors,
            newConcerns,
            excitement_level,
            buying_signals
        } = req.body;
        
        const postDriveData = {
            customerId,
            sessionId,
            testDriveId,
            timestamp: new Date(),
            stage: 'post_test_drive',
            feedback: customerFeedback,
            behaviors: observedBehaviors || [],
            newConcerns: newConcerns || [],
            excitement: excitement_level,
            buyingSignals: buying_signals || []
        };
        
        await journeyTracker.recordStage(postDriveData);
        
        // Advanced post-drive probability analysis
        const postDriveProbability = probabilityAnalyzer.calculatePostDriveProbability({
            customerJourney: await journeyTracker.getCustomerJourney(customerId),
            testDriveData: postDriveData
        });
        
        // Generate personalized closing strategy
        const closingStrategy = await generateClosingStrategy(customerId, postDriveData);
        
        res.json({
            success: true,
            postDriveProbability,
            closingStrategy,
            recommendedActions: await getPostDriveActions(customerId, postDriveData),
            customerId,
            sessionId
        });
        
    } catch (error) {
        console.error('Post test drive error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process test drive completion'
        });
    }
});

// Customer journey overview
app.get('/api/customer/:customerId/journey', async (req, res) => {
    try {
        const { customerId } = req.params;
        const journey = await journeyTracker.getCustomerJourney(customerId);
        const currentProbability = probabilityAnalyzer.getCurrentProbability(journey);
        
        res.json({
            success: true,
            journey,
            currentProbability,
            customerId
        });
        
    } catch (error) {
        console.error('Journey retrieval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve customer journey'
        });
    }
});

// Dashboard analytics
app.get('/api/analytics/dashboard', async (req, res) => {
    try {
        const analytics = await journeyTracker.getDashboardAnalytics();
        
        res.json({
            success: true,
            analytics
        });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve analytics'
        });
    }
});

// Helper functions
async function getFollowUpActions(customerId, conversationData) {
    const journey = await journeyTracker.getCustomerJourney(customerId);
    const lastAnalysis = journey.stages.find(stage => stage.analysis);
    
    if (!lastAnalysis) return [];
    
    const actions = [];
    
    // Based on conversation outcome
    switch (conversationData.outcome) {
        case 'interested':
            actions.push({
                priority: 1,
                action: 'Zaproponuj jazdę testową w ciągu 48h',
                timeframe: '48 godzin',
                reason: 'Klient wyraził zainteresowanie'
            });
            break;
            
        case 'skeptical':
            actions.push({
                priority: 1,
                action: 'Wyślij dodatkowe materiały techniczne',
                timeframe: '24 godziny',
                reason: 'Rozwiaj wątpliwości techniczne'
            });
            break;
            
        case 'price_concerned':
            actions.push({
                priority: 1,
                action: 'Przygotuj kalkulację TCO',
                timeframe: '24 godziny',
                reason: 'Adresuj obawy finansowe'
            });
            break;
    }
    
    return actions;
}

async function generatePreDrivePreparation(customerId) {
    const journey = await journeyTracker.getCustomerJourney(customerId);
    const analysis = journey.stages.find(stage => stage.analysis)?.analysis;
    
    if (!analysis) return null;
    
    return {
        personalizedRoute: `Trasa dostosowana do ${analysis.personality.detected.DISC}`,
        focusPoints: analysis.personality.detected.trigger_sensitivity?.high_positive || [],
        avoidTopics: analysis.personality.detected.trigger_sensitivity?.high_negative || [],
        preparationTips: [
            'Przygotuj odpowiedzi na główne obawy klienta',
            'Zapewnij ładowarkę telefonu w Tesla',
            'Przygotuj materiały dotyczące finansowania'
        ]
    };
}

async function generateClosingStrategy(customerId, postDriveData) {
    const journey = await journeyTracker.getCustomerJourney(customerId);
    const initialAnalysis = journey.stages.find(stage => stage.analysis)?.analysis;
    
    if (!initialAnalysis) return null;
    
    const strategy = {
        approach: 'Dopasowane do profilu psychologicznego',
        timing: postDriveData.excitement >= 7 ? 'immediate' : 'follow_up',
        keyMessages: [],
        concerns_to_address: postDriveData.newConcerns || []
    };
    
    // Personalize based on DISC type
    const discType = initialAnalysis.personality.detected.DISC;
    
    switch (discType) {
        case 'D':
            strategy.keyMessages = [
                'Tesla da Ci przewagę konkurencyjną',
                'Podejmij decyzję jako lider',
                'Ekskluzywna oferta limitowana czasowo'
            ];
            break;
        case 'I':
            strategy.keyMessages = [
                'Dołącz do społeczności innowatorów',
                'Twoja Tesla będzie wyróżniać się',
                'Podziel się doświadczeniem z przyjaciółmi'
            ];
            break;
        case 'S':
            strategy.keyMessages = [
                'Bezpieczny wybór dla rodziny',
                'Sprawdzona technologia',
                'Długoterminowe oszczędności'
            ];
            break;
        case 'C':
            strategy.keyMessages = [
                'Najlepszy ROI na rynku',
                'Precyzyjna technologia',
                'Dane potwierdzają efektywność'
            ];
            break;
    }
    
    return strategy;
}

async function getPostDriveActions(customerId, postDriveData) {
    const actions = [];
    
    if (postDriveData.excitement >= 8) {
        actions.push({
            priority: 1,
            action: 'Przygotuj ofertę zakupu NATYCHMIAST',
            timeframe: 'Teraz',
            reason: 'Bardzo wysokie zainteresowanie'
        });
    }
    
    if (postDriveData.newConcerns.length > 0) {
        actions.push({
            priority: 1,
            action: 'Adresuj nowe obawy indywidualnie',
            timeframe: '2 godziny',
            reason: 'Rozwiaj wątpliwości przed decyzją'
        });
    }
    
    return actions;
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
initializeBackend().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Tesla Customer Decoder SHU PRO Backend running on port ${PORT}`);
        console.log(`🌐 Frontend available at: http://localhost:${PORT}/main.html`);
        console.log(`🔌 API endpoints available at: http://localhost:${PORT}/api/`);
    });
});

module.exports = app;