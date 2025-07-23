const express = require('express');
const app = express();
const PORT = 3001;

// Load the Customer Decoder Engine
const CustomerDecoderEngine = require('./backend/CustomerDecoderEngine');
const engine = new CustomerDecoderEngine();

// Static files
app.use(express.static(__dirname));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware
app.use(express.json());

// Load data once at startup
let appData = {};
function loadData() {
    try {
        const fs = require('fs');
        appData.triggers = JSON.parse(fs.readFileSync('./data/triggers.json', 'utf8'));
        
        // Try to load other files, but don't fail if missing
        try {
            appData.personas = JSON.parse(fs.readFileSync('./data/personas.json', 'utf8'));
        } catch (e) { 
            console.log('⚠️  personas.json not found, skipping');
            appData.personas = {};
        }
        
        try {
            appData.rules = JSON.parse(fs.readFileSync('./rules.json', 'utf8'));
        } catch (e) { 
            console.log('⚠️  rules.json not found, skipping');
            appData.rules = {};
        }
        
        try {
            appData.cheatsheet = JSON.parse(fs.readFileSync('./cheatsheet_phrases.json', 'utf8'));
        } catch (e) { 
            console.log('⚠️  cheatsheet_phrases.json not found, skipping');
            appData.cheatsheet = {};
        }
        
        try {
            appData.objections = JSON.parse(fs.readFileSync('./objections_and_rebuttals.json', 'utf8'));
        } catch (e) { 
            console.log('⚠️  objections_and_rebuttals.json not found, skipping');
            appData.objections = {};
        }
        
        console.log('✅ All data files loaded successfully');
    } catch (error) {
        console.error('❌ Failed to load data:', error);
    }
}

// Simple API endpoint to test data loading
app.get('/api/test-triggers', async (req, res) => {
    try {
        res.json({
            success: true,
            triggerCount: appData.triggers?.triggers?.length || 0,
            categories: Object.keys(appData.triggers?.trigger_categories || {}),
            firstTrigger: appData.triggers?.triggers?.[0] || null
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Simple analysis endpoint
app.post('/api/analyze', (req, res) => {
    try {
        const { inputData } = req.body;
        
        // Simple personality detection based on triggers
        const selectedTriggers = inputData.selectedTriggers || [];
        let personalityScores = { D: 0, I: 0, S: 0, C: 0 };
        
        // Score personality based on selected triggers
        selectedTriggers.forEach(triggerText => {
            const trigger = appData.triggers?.triggers?.find(t => t.text === triggerText);
            if (trigger && trigger.personality_resonance) {
                Object.keys(trigger.personality_resonance).forEach(disc => {
                    personalityScores[disc] += trigger.personality_resonance[disc] || 0;
                });
            }
        });
        
        // Find dominant personality
        const dominantPersonality = Object.keys(personalityScores).reduce((a, b) => 
            personalityScores[a] > personalityScores[b] ? a : b
        );
        
        // Calculate conversion score
        const avgConversionRate = selectedTriggers.reduce((sum, triggerText) => {
            const trigger = appData.triggers?.triggers?.find(t => t.text === triggerText);
            return sum + (trigger?.base_conversion_rate || 50);
        }, 0) / Math.max(selectedTriggers.length, 1);
        
        // Create simple analysis response
        const analysis = {
            timestamp: new Date().toISOString(),
            personality: {
                detected: {
                    DISC: dominantPersonality,
                    confidence: Math.round(personalityScores[dominantPersonality] * 100 / selectedTriggers.length) || 50,
                    scores: personalityScores
                }
            },
            conversion_probability: Math.round(avgConversionRate),
            selected_triggers: selectedTriggers,
            tone: inputData.tone || 'neutralny',
            quick_responses: selectedTriggers.map(triggerText => {
                const trigger = appData.triggers?.triggers?.find(t => t.text === triggerText);
                return {
                    trigger: triggerText,
                    immediate_reply: trigger?.quick_response?.immediate_reply || 'Przygotowuję odpowiedź...',
                    key_points: trigger?.quick_response?.key_points || [],
                    next_action: trigger?.quick_response?.next_action || 'Kontynuuję rozmowę'
                };
            }),
            recommendations: {
                strategy: `Podejście dla typu ${dominantPersonality}`,
                key_messages: getKeyMessagesForPersonality(dominantPersonality, selectedTriggers),
                next_steps: ['Test drive', 'Konfiguracja', 'Finansowanie']
            }
        };
        
        res.json({
            success: true,
            analysis: analysis,
            customerId: 'demo-' + Date.now()
        });
        
    } catch (error) {
        console.error('Analysis error:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint for recording conversion results
app.post('/api/conversion-result', (req, res) => {
    try {
        const { sessionId, converted, actualPersonality } = req.body;
        
        const result = engine.recordConversionResult(sessionId, converted, actualPersonality);
        
        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error('Conversion recording error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint for collecting feedback
app.post('/api/feedback', (req, res) => {
    try {
        const { sessionId, feedbackData } = req.body;
        
        const result = engine.collectFeedback(sessionId, feedbackData);
        
        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error('Feedback collection error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint for performance reports
app.get('/api/performance-report', (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30d';
        
        const report = engine.getPerformanceReport(timeframe);
        
        res.json({
            success: true,
            report: report
        });
    } catch (error) {
        console.error('Performance report error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint for A/B test setup
app.post('/api/ab-test', (req, res) => {
    try {
        const { testName, variants } = req.body;
        
        const result = engine.setupABTest(testName, variants);
        
        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error('A/B test setup error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint for A/B test results
app.get('/api/ab-test/:testName', (req, res) => {
    try {
        const testName = req.params.testName;
        
        const results = engine.getABTestResults(testName);
        
        res.json({
            success: true,
            results: results
        });
    } catch (error) {
        console.error('A/B test results error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint for advanced trigger analysis
app.post('/api/analyze-advanced-triggers', (req, res) => {
    try {
        const inputData = req.body;
        
        const analysis = engine.analyzeAdvancedTriggers(inputData);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error('Advanced trigger analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint for temporal context analysis
app.post('/api/analyze-temporal', (req, res) => {
    try {
        const inputData = req.body;
        
        const analysis = engine.analyzeTemporalContext(inputData);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error('Temporal analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function for personality-based messages
function getKeyMessagesForPersonality(personality, triggers) {
    const messages = {
        'D': ['Przewaga konkurencyjna', 'Efektywność i wydajność', 'Statusowe rozwiązanie'],
        'I': ['Społeczność Tesla', 'Innowacyjny wizerunek', 'Ekologiczna misja'],
        'S': ['Bezpieczeństwo rodziny', 'Sprawdzona technologia', 'Długoterminowe oszczędności'],
        'C': ['Szczegółowe analizy TCO', 'Dane techniczne', 'Porównania konkurencyjne']
    };
    return messages[personality] || messages['S'];
}

// Analysis History Management API endpoints

// Get analysis by number
app.get('/api/analysis/:number', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const analysis = await engine.getAnalysisByNumber(analysisNumber);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error('Get analysis error:', error);
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Search analyses
app.post('/api/analyses/search', async (req, res) => {
    try {
        const criteria = req.body;
        const results = await engine.searchAnalyses(criteria);
        
        res.json({
            success: true,
            ...results
        });
    } catch (error) {
        console.error('Search analyses error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get recent analyses
app.get('/api/analyses/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const results = await engine.getRecentAnalyses(limit);
        
        res.json({
            success: true,
            ...results
        });
    } catch (error) {
        console.error('Get recent analyses error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add tag to analysis
app.post('/api/analysis/:number/tags', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const { tag } = req.body;
        
        const tags = await engine.addTagToAnalysis(analysisNumber, tag);
        
        res.json({
            success: true,
            tags: tags
        });
    } catch (error) {
        console.error('Add tag error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Remove tag from analysis
app.delete('/api/analysis/:number/tags/:tag', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const tag = req.params.tag;
        
        const tags = await engine.removeTagFromAnalysis(analysisNumber, tag);
        
        res.json({
            success: true,
            tags: tags
        });
    } catch (error) {
        console.error('Remove tag error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add note to analysis
app.post('/api/analysis/:number/notes', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const { note, author } = req.body;
        
        const noteRecord = await engine.addNoteToAnalysis(analysisNumber, note, author || 'user');
        
        res.json({
            success: true,
            note: noteRecord
        });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update conversion result
app.put('/api/analysis/:number/conversion', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const { converted, actualPersonality } = req.body;
        
        const analysis = await engine.updateAnalysisConversionResult(analysisNumber, converted, actualPersonality);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error('Update conversion error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Mark analysis as reviewed
app.put('/api/analysis/:number/review', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const { effectivenessScore } = req.body;
        
        const analysis = await engine.markAnalysisAsReviewed(analysisNumber, effectivenessScore);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error('Mark as reviewed error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Star/unstar analysis
app.put('/api/analysis/:number/star', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        
        const analysis = await engine.starAnalysis(analysisNumber);
        
        res.json({
            success: true,
            starred: analysis.starred
        });
    } catch (error) {
        console.error('Star analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get optimization report
app.get('/api/optimization-report', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30d';
        const report = await engine.getOptimizationReport(timeframe);
        
        res.json({
            success: true,
            report: report
        });
    } catch (error) {
        console.error('Optimization report error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get analysis statistics
app.get('/api/analysis-stats', async (req, res) => {
    try {
        const stats = await engine.getAnalysisStats();
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Analysis stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Post-sales tracking API endpoints

// Update purchase result
app.put('/api/analysis/:number/purchase', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const { purchased, purchaseDetails } = req.body;
        
        const analysis = await engine.updatePurchaseResult(analysisNumber, purchased, purchaseDetails);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error('Update purchase result error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add test drive feedback
app.post('/api/analysis/:number/test-drive', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const feedback = req.body;
        
        const analysis = await engine.addTestDriveFeedback(analysisNumber, feedback);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error('Add test drive feedback error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Calculate client readiness score
app.post('/api/analysis/:number/readiness', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        const { discussedTopics } = req.body;
        
        const readinessData = await engine.calculateClientReadiness(analysisNumber, discussedTopics);
        
        res.json({
            success: true,
            readiness: readinessData
        });
    } catch (error) {
        console.error('Calculate readiness error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate follow-up recommendation
app.get('/api/analysis/:number/follow-up', async (req, res) => {
    try {
        const analysisNumber = parseInt(req.params.number);
        
        const recommendation = await engine.generateFollowUpRecommendation(analysisNumber);
        
        res.json({
            success: true,
            recommendation: recommendation
        });
    } catch (error) {
        console.error('Generate follow-up recommendation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get analyses with test drive feedback
app.get('/api/analyses/test-drive-feedback', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const analyses = await engine.getAnalysesWithTestDriveFeedback(limit);
        
        res.json({
            success: true,
            analyses: analyses
        });
    } catch (error) {
        console.error('Get test drive feedback analyses error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get sales effectiveness report
app.get('/api/sales-effectiveness-report', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30d';
        const report = await engine.getSalesEffectivenessReport(timeframe);
        
        res.json({
            success: true,
            report: report
        });
    } catch (error) {
        console.error('Sales effectiveness report error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Analyze readiness vs conversion
app.get('/api/readiness-vs-conversion', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30d';
        const analysis = await engine.analyzeReadinessVsConversion(timeframe);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error('Readiness vs conversion analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Initialize engine and start server
async function startServer() {
    try {
        // Initialize the engine with data files
        await engine.initialize({
            triggers: 'data/triggers.json',
            personas: 'data/personas.json',
            rules: 'rules.json',
            cheatsheet: 'cheatsheet_phrases.json',
            objections: 'objections_and_rebuttals.json'
        });
        
        loadData();
        
        app.listen(PORT, () => {
            console.log(`🚀 Tesla Customer Decoder Server running on http://localhost:${PORT}`);
            console.log(`📊 Frontend: http://localhost:${PORT}/main.html`);
            console.log(`🧪 Test API: http://localhost:${PORT}/api/test-triggers`);
            console.log(`🔍 Analysis API: http://localhost:${PORT}/api/analyze`);
            console.log(`📈 Advanced Dashboard: http://localhost:${PORT}/dashboard-advanced.html`);
            console.log(`📋 Analysis History: Available via API endpoints`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();