/**
 * Test script for Tesla Archetypes Integration
 * This script tests the new Tesla archetype detection and response generation
 */

const CustomerDecoderEngine = require('./backend/CustomerDecoderEngine');
const path = require('path');

async function testTeslaArchetypes() {
    console.log('🧪 Testing Tesla Archetypes Integration...');
    
    try {
        // Initialize the engine
        const engine = new CustomerDecoderEngine();
        
        const dataFiles = {
            personas: path.join(__dirname, 'data', 'personas.json'),
            triggers: path.join(__dirname, 'data', 'triggers.json'),
            weights_and_scoring: path.join(__dirname, 'data', 'weights_and_scoring.json'),
            cheatsheet: path.join(__dirname, 'data', 'cheatsheet_phrases.json'),
            objections: path.join(__dirname, 'data', 'objections.json'),
            market_data_2025: path.join(__dirname, 'data', 'market_data_2025.json')
        };
        
        await engine.initialize(dataFiles);
        console.log('✅ Engine initialized successfully');
        
        // Test case 1: Green Pioneer Family
        console.log('\n🌱 Testing Green Pioneer Family archetype...');
        const greenPioneerInput = {
            selectedTriggers: [
                { text: 'Chcę chronić środowisko', category: 'environmental' },
                { text: 'Myślę o przyszłości moich dzieci', category: 'family' },
                { text: 'Interesują mnie dotacje', category: 'financial' }
            ],
            demographics: {
                age: 38,
                income: 8000,
                family_size: 4,
                city: 'Warsaw'
            },
            sessionId: 'test-green-pioneer'
        };
        
        const greenResult = await engine.analyzeCustomer(greenPioneerInput);
        console.log('Detected archetype:', greenResult.tesla_archetype?.analysis?.archetype);
        console.log('Archetype score:', greenResult.tesla_archetype?.analysis?.score);
        console.log('Opening line:', greenResult.tesla_archetype?.response?.opening_line);
        
        // Test case 2: Tech Executive
        console.log('\n💼 Testing Tech Executive archetype...');
        const techExecutiveInput = {
            selectedTriggers: [
                { text: 'Interesuje mnie najnowsza technologia', category: 'technical' },
                { text: 'Chcę mieć przewagę konkurencyjną', category: 'business' },
                { text: 'Autopilot to przyszłość', category: 'technical' }
            ],
            demographics: {
                age: 42,
                income: 15000,
                occupation: 'executive',
                city: 'Krakow'
            },
            sessionId: 'test-tech-executive'
        };
        
        const techResult = await engine.analyzeCustomer(techExecutiveInput);
        console.log('Detected archetype:', techResult.tesla_archetype?.analysis?.archetype);
        console.log('Archetype score:', techResult.tesla_archetype?.analysis?.score);
        console.log('Opening line:', techResult.tesla_archetype?.response?.opening_line);
        
        // Test case 3: Budget-Conscious Family
        console.log('\n💰 Testing Budget-Conscious Family archetype...');
        const budgetFamilyInput = {
            selectedTriggers: [
                { text: 'Czy to się opłaca finansowo?', category: 'financial' },
                { text: 'Martwię się o koszty eksploatacji', category: 'financial' },
                { text: 'Potrzebuję samochodu dla rodziny', category: 'family' }
            ],
            demographics: {
                age: 35,
                income: 6000,
                family_size: 3,
                city: 'Gdansk'
            },
            sessionId: 'test-budget-family'
        };
        
        const budgetResult = await engine.analyzeCustomer(budgetFamilyInput);
        console.log('Detected archetype:', budgetResult.tesla_archetype?.analysis?.archetype);
        console.log('Archetype score:', budgetResult.tesla_archetype?.analysis?.score);
        console.log('Opening line:', budgetResult.tesla_archetype?.response?.opening_line);
        
        // Test personalized phrases integration
        console.log('\n📝 Testing personalized phrases with archetypes...');
        const phrases = engine.generatePersonalizedPhrases(
            { DISC: 'D' },
            'Tech Executive',
            techExecutiveInput.selectedTriggers
        );
        console.log('Generated phrases count:', phrases.length);
        console.log('Sample phrases:', phrases.slice(0, 3));
        
        console.log('\n✅ Tesla Archetypes Integration Test Completed Successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
if (require.main === module) {
    testTeslaArchetypes();
}

module.exports = { testTeslaArchetypes };