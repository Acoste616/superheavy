const express = require('express');
const app = express();
const PORT = 3001;

// Static files
app.use(express.static(__dirname));

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

// Load data at startup
loadData();

app.listen(PORT, () => {
    console.log(`🚀 Simple TCD Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}/main.html`);
    console.log(`🔧 Test API: http://localhost:${PORT}/api/test-triggers`);
    console.log(`🔬 Analysis API: http://localhost:${PORT}/api/analyze`);
});