const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve static files for v1
app.use('/v1', express.static('.'));

// Redirect root to main.html
app.get('/', (req, res) => {
    res.redirect('/main.html');
});

// Serve triggers data from local file
app.get('/api/triggers', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        const triggersPath = path.join(__dirname, 'data', 'triggers.json');
        const triggersData = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
        
        res.json({
            success: true,
            triggers: triggersData.triggers || [],
            categories: triggersData.trigger_categories || {},
            version: triggersData.version || '1.0'
        });
        
    } catch (error) {
        console.error('Error loading triggers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load triggers data',
            details: error.message
        });
    }
});

// Tesla-specific advice generation function
function getTeslaSpecificAdvice(personalityType, selectedTriggers, demographics) {
    const currentYear = new Date().getFullYear();
    const advice = [];
    const strategies = [];
    const marketInsights = [];
    
    // Tesla-specific advice based on personality type
    const teslaPersonalityAdvice = {
        'D': {
            advice: [
                'Podkreśl, że Tesla to lider rynku EV z najwyższą wartością odsprzedaży',
                'Przedstaw konkretne dane o oszczędnościach - średnio 8000 zł rocznie na paliwie',
                'Wskaż przewagę technologiczną - Autopilot, OTA updates, Supercharger network',
                'Zaakcentuj szybkość ładowania - 15 minut dla 200 km zasięgu na Superchargerze'
            ],
            strategies: [
                { strategy: 'Skup się na ROI i TCO - Tesla ma najniższy koszt całkowity w klasie premium' },
                { strategy: 'Podkreśl przewagę konkurencyjną - największa sieć ładowarek w Europie' }
            ]
        },
        'I': {
            advice: [
                'Zaakcentuj, że Tesla to symbol innowacji i przyszłości motoryzacji',
                'Wspomniej o społeczności Tesla - ekskluzywne eventy, spotkania właścicieli',
                'Podkreśl design i prestiż - nagrody za design, uznanie celebrytów',
                'Przedstaw funkcje wow-factor: Dog Mode, Camp Mode, Tesla Theatre'
            ],
            strategies: [
                { strategy: 'Zaproś na ekskluzywny test drive z pełną prezentacją funkcji' },
                { strategy: 'Pokaż aplikację Tesla i możliwości zdalnego sterowania' }
            ]
        },
        'S': {
            advice: [
                'Podkreśl najwyższe oceny bezpieczeństwa - 5 gwiazdek Euro NCAP',
                'Wskaż niezawodność - 8 lat gwarancji na baterię, minimalne koszty serwisu',
                'Zaakcentuj stabilność kosztów - brak wahań cen paliwa',
                'Przedstaw wsparcie 24/7 i mobilny serwis Tesla'
            ],
            strategies: [
                { strategy: 'Zapewnij o pełnym wsparciu i gwarancjach Tesla' },
                { strategy: 'Przedstaw plan serwisowy i koszty eksploatacji' }
            ]
        },
        'C': {
            advice: [
                'Przedstaw szczegółowe dane techniczne - moc, zasięg, przyspieszenie',
                'Pokaż porównania z konkurencją - efektywność energetyczna, zasięg',
                'Wskaż certyfikaty i nagrody - Tesla Model Y najlepiej sprzedającym się EV',
                'Przedstaw analizę TCO z konkretnymi kalkulacjami'
            ],
            strategies: [
                { strategy: 'Przygotuj szczegółową analizę kosztów i porównanie z konkurencją' },
                { strategy: 'Dostarcz dokumentację techniczną i certyfikaty' }
            ]
        }
    };
    
    // Add personality-specific advice
    const personalityAdvice = teslaPersonalityAdvice[personalityType] || teslaPersonalityAdvice['S'];
    advice.push(...personalityAdvice.advice);
    strategies.push(...personalityAdvice.strategies);
    
    // Tesla-specific trigger advice
    selectedTriggers.forEach(trigger => {
        if (trigger.includes('ekologi') || trigger.includes('środowisk')) {
            advice.push('Tesla eliminuje 4,6 tony CO2 rocznie vs samochód spalinowy');
            strategies.push({ strategy: 'Podkreśl wpływ na środowisko i zrównoważony rozwój' });
        }
        if (trigger.includes('technologi') || trigger.includes('innowacyjn')) {
            advice.push('Tesla wprowadza aktualizacje OTA - samochód stale się ulepsza');
            strategies.push({ strategy: 'Pokaż najnowsze funkcje dodane przez aktualizacje' });
        }
        if (trigger.includes('oszczędnośc') || trigger.includes('ekonomi')) {
            advice.push('Średnie oszczędności: 8000 zł/rok na paliwie + 3000 zł/rok na serwisie');
            strategies.push({ strategy: 'Przygotuj kalkulator oszczędności Tesla' });
        }
        if (trigger.includes('prestiż') || trigger.includes('status')) {
            advice.push('Tesla to marka #1 w rankingach satysfakcji klientów premium');
            strategies.push({ strategy: 'Wspomniej o ekskluzywności i społeczności Tesla' });
        }
    });
    
    // Demographics-specific advice
    if (demographics.hasPV === 'true') {
        advice.push('Z panelami PV koszt ładowania spada do 0,20 zł/100km');
        strategies.push({ strategy: 'Pokaż integrację Tesla z instalacją PV i Powerwall' });
        marketInsights.push('Właściciele PV mają 40% wyższą konwersję na Tesla');
    }
    
    if (demographics.housingType === 'dom') {
        advice.push('Wall Connector w domu = pełne ładowanie przez noc za 25 zł');
        strategies.push({ strategy: 'Zaproponuj instalację Wall Connector w pakiecie' });
    }
    
    if (demographics.hasChildren === 'young' || demographics.hasChildren === 'teen') {
        advice.push('Tesla ma najwyższe oceny bezpieczeństwa dla rodzin z dziećmi');
        strategies.push({ strategy: 'Podkreśl funkcje rodzinne: Child Lock, klimatyzacja, przestrzeń' });
    }
    
    // Market insights for 2025
    marketInsights.push(
        'Rynek EV w Polsce rośnie o 45% rocznie',
        'Tesla utrzymuje 23% udziału w segmencie premium EV',
        'Średni czas oczekiwania na dostawę: 6-12 tygodni',
        'Dopłaty NaszEauto 2025: do 18.750 zł dla Tesla Model 3/Y',
        'Nowe Superchargery: +30% lokalizacji w 2025 vs 2024'
    );
    
    return {
        advice: advice.slice(0, 8), // Limit to most relevant
        strategies: strategies.slice(0, 5),
        marketInsights: marketInsights.slice(0, 6)
    };
}


// Simple analysis endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        console.log('📊 Analysis request received:', req.body);
        console.log('🔄 Starting analysis processing...');
        
        // Handle both direct inputData and nested inputData structure
        const inputData = req.body.inputData || req.body;
        
        if (!inputData || !inputData.selectedTriggers) {
            return res.status(400).json({
                success: false,
                error: 'Invalid input data - missing selectedTriggers'
            });
        }

        // Determine personality type based on triggers and demographics
        const selectedTriggers = inputData.selectedTriggers || [];
        const demographics = inputData.demographics || {};
        
        let personalityType = 'S'; // Default
        let personalityConfidence = 0.7;
        
        // Simple personality detection logic
        if (selectedTriggers.some(t => t.includes('szybk') || t.includes('efektywn') || t.includes('wydajn'))) {
            personalityType = 'D';
            personalityConfidence = 0.8;
        } else if (selectedTriggers.some(t => t.includes('innowacyjn') || t.includes('prestiż') || t.includes('trendsetter'))) {
            personalityType = 'I';
            personalityConfidence = 0.75;
        } else if (selectedTriggers.some(t => t.includes('analiz') || t.includes('dane') || t.includes('porównan'))) {
            personalityType = 'C';
            personalityConfidence = 0.85;
        }
        
        // Generate quick responses based on selected triggers
        const quickResponses = selectedTriggers.slice(0, 3).map((trigger, index) => {
            const responses = {
                'D': {
                    trigger: trigger,
                    immediate_reply: `Rozumiem, że ${trigger.toLowerCase()} to dla Pana/Pani priorytet. Tesla oferuje najlepsze rozwiązanie w tej kategorii.`,
                    key_points: [
                        'Najwyższa efektywność w klasie',
                        'Szybki zwrot z inwestycji',
                        'Przewaga konkurencyjna'
                    ],
                    next_action: 'Przedstaw konkretne dane ROI'
                },
                'I': {
                    trigger: trigger,
                    immediate_reply: `${trigger} to świetny wybór! Tesla to marka, która wyróżnia się na rynku i buduje prestiż.`,
                    key_points: [
                        'Innowacyjna technologia',
                        'Prestiż i status',
                        'Społeczność Tesla'
                    ],
                    next_action: 'Zaproś na test drive'
                },
                'S': {
                    trigger: trigger,
                    immediate_reply: `Cieszę się, że ${trigger.toLowerCase()} jest dla Pana/Pani ważne. Tesla zapewnia bezpieczeństwo i niezawodność.`,
                    key_points: [
                        'Najwyższe oceny bezpieczeństwa',
                        'Gwarancja i wsparcie',
                        'Stabilne koszty eksploatacji'
                    ],
                    next_action: 'Omów gwarancje i wsparcie'
                },
                'C': {
                    trigger: trigger,
                    immediate_reply: `${trigger} to kluczowy aspekt. Oto konkretne dane i fakty o Tesla.`,
                    key_points: [
                        'Weryfikowalne dane techniczne',
                        'Porównania z konkurencją',
                        'Analiza kosztów całkowitych'
                    ],
                    next_action: 'Przedstaw szczegółową analizę'
                }
            };
            return responses[personalityType] || responses['S'];
        });
        
        // Generate enhanced Tesla-specific strategy recommendations
        const teslaAdvice = getTeslaSpecificAdvice(personalityType, selectedTriggers, demographics);
        const strategyRecommendations = [
            {
                strategy: personalityType === 'D' ? 'Podkreśl efektywność i ROI Tesla' :
                         personalityType === 'I' ? 'Skup się na innowacyjności i prestiżu Tesla' :
                         personalityType === 'C' ? 'Przedstaw dane techniczne i analizy Tesla' :
                         'Zapewnij o bezpieczeństwie i niezawodności Tesla'
            },
            {
                strategy: 'Dostosuj komunikację do profilu DISC'
            },
            {
                strategy: `Wykorzystaj wybrane triggery: ${selectedTriggers.slice(0, 2).join(', ')}`
            },
            ...teslaAdvice.strategies
        ];
        
        // Simple analysis logic
        const analysis = {
            conversion_probability: Math.min(95, 45 + (selectedTriggers.length * 8)),
            personality: {
                detected: {
                    DISC: personalityType,
                    type: personalityType,
                    confidence: personalityConfidence
                },
                primary_type: personalityType,
                confidence: personalityConfidence
            },
            quick_responses: quickResponses,
            recommendations: {
                strategy_recommendations: strategyRecommendations,
                key_recommendations: [
                    {
                        recommendation: personalityType === 'D' ? 'Skup się na wynikach biznesowych' :
                                       personalityType === 'I' ? 'Podkreśl aspekty społeczne i prestiżowe' :
                                       personalityType === 'C' ? 'Dostarcz szczegółowe dane i analizy' :
                                       'Zapewnij o bezpieczeństwie i wsparciu'
                    },
                    {
                        recommendation: 'Zaproponuj test drive w odpowiednim momencie'
                    },
                    {
                        recommendation: 'Przygotuj spersonalizowaną ofertę'
                    }
                ],
                next_steps: [
                     'Nawiąż kontakt z klientem',
                     'Przedstaw kluczowe korzyści dopasowane do profilu',
                     'Zaproponuj test drive',
                     'Przygotuj spersonalizowaną ofertę'
                 ],
                 tesla_specific_advice: teslaAdvice.advice,
                 market_insights: teslaAdvice.marketInsights
            }
        };

        const response = {
            success: true,
            analysis: analysis,
            customerId: 'local-' + Date.now()
        };
        
        console.log('📤 Sending analysis response:', JSON.stringify(response, null, 2));
        res.json(response);
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
        console.error('❌ Error stack:', error.stack);
        const errorResponse = {
            success: false,
            error: 'Analysis failed',
            details: error.message
        };
        console.log('📤 Sending error response:', errorResponse);
        res.status(500).json(errorResponse);
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Simple Tesla v1 server running on port ${PORT}`);
    console.log(`Static files served from: ${__dirname}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Triggers proxy: http://localhost:${PORT}/api/triggers`);
});