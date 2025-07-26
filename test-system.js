/**
 * System Test for Tesla Customer Decoder
 * Quick functionality verification script
 */

const http = require('http');

const API_BASE = 'http://localhost:3001';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({ status: res.statusCode, data: result });
                } catch (error) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Tesla Customer Decoder - System Tests');
    console.log('=====================================\n');

    try {
        // Test 1: Trigger Test API
        console.log('1. Testing trigger data loading...');
        const triggerTest = await makeRequest('/api/test-triggers');
        
        if (triggerTest.status === 200 && triggerTest.data.success) {
            console.log(`✅ Triggers loaded: ${triggerTest.data.triggerCount} triggers`);
            console.log(`   Categories: ${triggerTest.data.categories.length} categories`);
        } else {
            console.log('❌ Trigger test failed:', triggerTest.data);
        }

        // Test 2: Analysis API
        console.log('\n2. Testing analysis functionality...');
        const testAnalysis = {
            inputData: {
                selectedTriggers: [
                    'Martwi mnie cena',
                    'A ten zasięg zimą?'
                ],
                tone: 'neutralny',
                contextModifiers: {
                    has_garage: true
                },
                demographics: {
                    age: '35-45'
                }
            }
        };

        const analysisResult = await makeRequest('/api/analyze', 'POST', testAnalysis);
        
        if (analysisResult.status === 200 && analysisResult.data.success) {
            const analysis = analysisResult.data.analysis;
            console.log(`✅ Analysis successful`);
            console.log(`   Engine: ${analysisResult.data.engine}`);
            console.log(`   Personality: ${analysis.personality.detected.DISC} (${analysis.personality.detected.confidence}%)`);
            console.log(`   Conversion: ${analysis.conversion_probability}%`);
            console.log(`   Quick responses: ${analysis.quick_responses?.length || 0} items`);
            
            // Test specific quick response structure
            if (analysis.quick_responses && analysis.quick_responses.length > 0) {
                const firstResponse = analysis.quick_responses[0];
                console.log(`   Sample response: "${firstResponse.immediate_reply?.substring(0, 50)}..."`);
            }
        } else {
            console.log('❌ Analysis test failed:', analysisResult.data);
        }

        console.log('\n🎉 System tests completed!');
        console.log('\n📊 System Status Summary:');
        console.log(`   - Trigger loading: ${triggerTest.data.success ? '✅ Working' : '❌ Failed'}`);
        console.log(`   - Analysis engine: ${analysisResult.data.success ? '✅ Working' : '❌ Failed'}`);
        console.log(`   - Quick responses: ${analysisResult.data.analysis?.quick_responses?.length > 0 ? '✅ Working' : '❌ Failed'}`);

    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        console.log('\n💡 Make sure the server is running: node simple-server.js');
    }
}

// Run tests
runTests();