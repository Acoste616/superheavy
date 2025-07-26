const express = require('express');
const UnifiedCustomerEngine = require('./backend/UnifiedCustomerEngine');
const app = express();
const PORT = 3001;

// Static files
app.use(express.static(__dirname));

// Middleware
app.use(express.json());

// Initialize the unified engine
const engine = new UnifiedCustomerEngine();

// Load data once at startup
let appData = {};
function loadData() {
    try {
        const fs = require('fs');
        
        // Load triggers.json - this is critical
        try {
            appData.triggers = JSON.parse(fs.readFileSync('./data/triggers.json', 'utf8'));
            console.log(`✅ Loaded triggers: ${appData.triggers?.triggers?.length || 0} items`);
            
            // Validate triggers structure
            if (!appData.triggers?.triggers || !Array.isArray(appData.triggers.triggers)) {
                console.error('❌ Invalid triggers.json structure - missing triggers array');
                appData.triggers = { triggers: [] };
            }
            
        } catch (e) {
            console.error('❌ Critical: triggers.json not found or invalid:', e.message);
            appData.triggers = { triggers: [] };
        }
        
        // Try to load other files, but don't fail if missing
        try {
            appData.personas = JSON.parse(fs.readFileSync('./data/personas.json', 'utf8'));
            console.log('✅ Loaded personas.json');
        } catch (e) { 
            console.log('⚠️  personas.json not found, skipping');
            appData.personas = {};
        }
        
        try {
            appData.rules = JSON.parse(fs.readFileSync('./rules.json', 'utf8'));
            console.log('✅ Loaded rules.json');
        } catch (e) { 
            console.log('⚠️  rules.json not found, skipping');
            appData.rules = {};
        }
        
        try {
            appData.cheatsheet = JSON.parse(fs.readFileSync('./cheatsheet_phrases.json', 'utf8'));
            console.log('✅ Loaded cheatsheet_phrases.json');
        } catch (e) { 
            console.log('⚠️  cheatsheet_phrases.json not found, skipping');
            appData.cheatsheet = {};
        }
        
        try {
            appData.objections = JSON.parse(fs.readFileSync('./objections_and_rebuttals.json', 'utf8'));
            console.log('✅ Loaded objections_and_rebuttals.json');
        } catch (e) { 
            console.log('⚠️  objections_and_rebuttals.json not found, skipping');
            appData.objections = {};
        }
        
        console.log('✅ Data loading completed');
        console.log(`📊 Summary: ${appData.triggers?.triggers?.length || 0} triggers loaded`);
        
    } catch (error) {
        console.error('❌ Failed to load data:', error);
        // Ensure appData has basic structure even on failure
        appData = {
            triggers: { triggers: [] },
            personas: {},
            rules: {},
            cheatsheet: {},
            objections: {}
        };
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

// Enhanced analysis endpoint with unified engine
app.post('/api/analyze', async (req, res) => {
    try {
        const { inputData } = req.body;
        
        // Try to use the unified engine first
        if (engine.initialized) {
            try {
                const analysis = await engine.analyzeCustomer(inputData);
                
                res.json({
                    success: true,
                    analysis: analysis,
                    customerId: 'unified-' + Date.now(),
                    engine: 'unified-v4.0'
                });
                return;
            } catch (engineError) {
                console.warn('⚠️ Unified engine failed, falling back to simple analysis:', engineError.message);
            }
        }
        
        // Fallback to simple analysis if unified engine fails
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
                
                // Enhanced validation and fallback logic
                if (!trigger) {
                    console.warn(`⚠️ Trigger not found: ${triggerText}`);
                    return {
                        trigger: triggerText,
                        immediate_reply: 'Przygotowuję odpowiedź na ten trigger...',
                        key_points: ['Analizuję sytuację klienta', 'Dostosuję podejście do profilu'],
                        next_action: 'Kontynuuję rozmowę i zadaję pytania uzupełniające'
                    };
                }
                
                // Use quick_response data if available, otherwise create fallback
                const quickResponse = trigger.quick_response || {};
                return {
                    trigger: triggerText,
                    immediate_reply: quickResponse.immediate_reply || `Rozumiem Pana/Pani obawy dotyczące ${triggerText.toLowerCase()}. Pozwolę sobie to wyjaśnić...`,
                    key_points: quickResponse.key_points || ['Przedstawię konkretne dane', 'Pokażę korzyści dla klienta', 'Zaproponuję rozwiązanie'],
                    next_action: quickResponse.next_action || 'Kontynuuję wyjaśnienia i prezentuję rozwiązanie'
                };
            }).filter(response => response !== null),
            recommendations: {
                strategy: `Podejście dla typu ${dominantPersonality}`,
                key_messages: getKeyMessagesForPersonality(dominantPersonality, selectedTriggers),
                next_steps: ['Test drive', 'Konfiguracja', 'Finansowanie']
            }
        };
        
        res.json({
            success: true,
            analysis: analysis,
            customerId: 'simple-' + Date.now(),
            engine: 'simple-fallback'
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

// Initialize both data loading systems
async function initializeServer() {
    try {
        // Load basic data first
        loadData();
        
        // Initialize unified engine in parallel
        console.log('🔧 Initializing unified engine...');
        const engineResult = await engine.initialize();
        
        if (engineResult.success) {
            console.log(`✅ Unified engine ready: ${engineResult.loadedFiles}/${engineResult.totalFiles} files`);
        } else {
            console.warn('⚠️ Unified engine initialization failed, using fallback mode');
        }
        
    } catch (error) {
        console.warn('⚠️ Engine initialization failed, continuing with simple mode:', error.message);
    }
}

// Start server
initializeServer().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Enhanced TCD Server running on port ${PORT}`);
        console.log(`🌐 Frontend: http://localhost:${PORT}/main.html`);
        console.log(`🔧 Test API: http://localhost:${PORT}/api/test-triggers`);
        console.log(`🔬 Analysis API: http://localhost:${PORT}/api/analyze`);
        console.log(`⚙️ Engine Mode: ${engine.initialized ? 'Unified v4.0' : 'Simple Fallback'}`);
    });
}).catch(error => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
});