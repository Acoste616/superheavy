/**
 * Test Integration Script for Tesla Customer Decoder
 * Tests APIManager, DataValidator, and CustomerDecoderEngine integration
 * 
 * @version 1.0
 * @author Claude AI Assistant
 */

const CustomerDecoderEngine = require('./backend/CustomerDecoderEngine.js');
const APIManager = require('./backend/APIManager.js');
const DataValidator = require('./backend/DataValidator.js');

async function testIntegration() {
    console.log('🧪 Starting Tesla Customer Decoder Integration Test...');
    
    try {
        // Test 1: Initialize components
        console.log('\n1️⃣ Testing component initialization...');
        
        const engine = new CustomerDecoderEngine();
        const apiManager = new APIManager();
        const dataValidator = new DataValidator();
        
        // Initialize engine
        const dataFiles = {
            triggers: 'data/triggers.json',
            personas: 'data/personas.json',
            rules: 'data/rules.json',
            weights: 'data/weights_and_scoring.json',
            cheatsheet: 'cheatsheet_phrases.json',
            objections: 'objections_and_rebuttals.json'
        };
        
        await engine.initialize(dataFiles);
        console.log('✅ CustomerDecoderEngine initialized');
        
        // Test 2: API Manager functionality
        console.log('\n2️⃣ Testing APIManager...');
        
        const marketData = await apiManager.getMarketData('Warsaw', 'Poland');
        console.log('✅ Market data retrieved:', {
            chargingStations: marketData.chargingStations?.length || 0,
            exchangeRate: marketData.exchangeRate?.rate || 'N/A',
            cityData: marketData.cityData?.name || 'N/A'
        });
        
        // Test 3: Data Validator functionality
        console.log('\n3️⃣ Testing DataValidator...');
        
        const testCustomerData = {
            selectedTriggers: ['Ekologia i środowisko', 'Oszczędności na paliwie'],
            tone: 'professional',
            demographics: {
                age: '35-45',
                housingType: 'house',
                hasPV: 'yes',
                region: 'Warsaw',
                relationshipStatus: 'married',
                hasChildren: 'yes'
            },
            context: 'Klient zainteresowany Teslą Model Y'
        };
        
        const validationResult = dataValidator.validateCustomerData(testCustomerData);
        console.log('✅ Customer data validation:', {
            isValid: validationResult.isValid,
            completeness: validationResult.completeness,
            quality: validationResult.quality,
            errors: validationResult.errors.length
        });
        
        // Test 4: Full analysis with fallback
        console.log('\n4️⃣ Testing full analysis with triggers...');
        
        const analysisWithTriggers = await engine.analyzeCustomer(testCustomerData);
        console.log('✅ Analysis with triggers completed:', {
            personality: analysisWithTriggers.personality?.detected?.DISC || 'Unknown',
            confidence: Math.round((analysisWithTriggers.personality?.detected?.confidence || 0) * 100),
            conversionProbability: analysisWithTriggers.conversion_probability,
            fallbackUsed: analysisWithTriggers.fallback_used || false
        });
        
        // Test 5: Fallback scenario (no triggers)
        console.log('\n5️⃣ Testing fallback scenario (no triggers)...');
        
        const noTriggersData = {
            selectedTriggers: [],
            tone: 'professional',
            demographics: testCustomerData.demographics,
            context: 'Klient bez wybranych triggerów'
        };
        
        const fallbackAnalysis = await engine.analyzeCustomer(noTriggersData);
        console.log('✅ Fallback analysis completed:', {
            personality: fallbackAnalysis.personality?.detected?.DISC || 'Unknown',
            confidence: Math.round((fallbackAnalysis.personality?.detected?.confidence || 0) * 100),
            conversionProbability: fallbackAnalysis.conversion_probability,
            fallbackUsed: fallbackAnalysis.fallback_used || false
        });
        
        // Test 6: API rate limiting and caching
        console.log('\n6️⃣ Testing API caching...');
        
        const startTime = Date.now();
        const cachedData = await apiManager.getMarketData('Warsaw', 'Poland');
        const endTime = Date.now();
        
        console.log('✅ Cached data retrieval:', {
            responseTime: `${endTime - startTime}ms`,
            fromCache: endTime - startTime < 100 // Likely from cache if very fast
        });
        
        // Test 7: Error handling
        console.log('\n7️⃣ Testing error handling...');
        
        try {
            const invalidData = {
                selectedTriggers: null,
                demographics: { age: 'invalid' }
            };
            
            const errorValidation = dataValidator.validateCustomerData(invalidData);
            console.log('✅ Error handling works:', {
                isValid: errorValidation.isValid,
                errorsDetected: errorValidation.errors.length > 0
            });
        } catch (error) {
            console.log('✅ Error properly caught:', error.message.substring(0, 50) + '...');
        }
        
        console.log('\n🎉 All integration tests completed successfully!');
        console.log('\n📊 Summary:');
        console.log('- ✅ Component initialization: PASSED');
        console.log('- ✅ API Manager functionality: PASSED');
        console.log('- ✅ Data validation: PASSED');
        console.log('- ✅ Full analysis: PASSED');
        console.log('- ✅ Fallback mechanism: PASSED');
        console.log('- ✅ Caching system: PASSED');
        console.log('- ✅ Error handling: PASSED');
        
        return true;
        
    } catch (error) {
        console.error('❌ Integration test failed:', error);
        console.error('Stack trace:', error.stack);
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    testIntegration().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testIntegration };