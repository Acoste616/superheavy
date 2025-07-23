// ROZSZERZENIE app-simple.js - UI dla segmentacji klientów
// Dodać do istniejącego pliku app-simple.js

// Nowa funkcja do wyświetlania analizy segmentacji
function populateSegmentAnalysisTab(analysisResult) {
    const segmentTab = document.getElementById('segment-analysis-tab');
    if (!segmentTab) return;

    const segmentInfo = analysisResult.segment_analysis;
    const segmentStrategy = analysisResult.segment_strategy;

    segmentTab.innerHTML = `
        <div class="segment-overview">
            <h3>🎯 Analiza Segmentu Klienta</h3>
            <div class="segment-identification">
                <div class="segment-badge ${segmentInfo.identified_segment}">
                    <span class="segment-name">${getSegmentDisplayName(segmentInfo.identified_segment)}</span>
                    <span class="confidence-score">${Math.round(segmentInfo.segment_confidence * 100)}% dopasowania</span>
                </div>
                <div class="priority-indicators">
                    <div class="priority-score">
                        <span class="label">Priorytet:</span>
                        <span class="value priority-${getPriorityLevel(segmentInfo.priority_score)}">
                            ${segmentInfo.priority_score}/100
                        </span>
                    </div>
                    <div class="conversion-multiplier">
                        <span class="label">Potencjał konwersji:</span>
                        <span class="value multiplier-${getMultiplierLevel(segmentInfo.conversion_multiplier)}">
                            ${segmentInfo.conversion_multiplier}x
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="segment-strategy">
            <h4>📋 Strategia dla Segmentu</h4>
            <div class="strategy-message">
                <div class="primary-message">
                    <h5>Główne przesłanie:</h5>
                    <p class="message-text">${segmentStrategy.selectedMessage}</p>
                </div>
                
                ${segmentStrategy.combinedMessage ? `
                    <div class="combined-message">
                        <h5>🔥 Wzmocnione przesłanie (kombinacja triggerów):</h5>
                        <p class="combined-text">${segmentStrategy.combinedMessage}</p>
                        <span class="urgency-bonus">+${segmentStrategy.urgencyBonus || 0}% urgencji</span>
                    </div>
                ` : ''}
            </div>

            <div class="key-benefits">
                <h5>✅ Kluczowe korzyści dla tego segmentu:</h5>
                <ul class="benefits-list">
                    ${segmentStrategy.keyBenefits.map(benefit => 
                        `<li class="benefit-item">${benefit}</li>`
                    ).join('')}
                </ul>
            </div>

            <div class="communication-style">
                <h5>💬 Styl komunikacji:</h5>
                <div class="style-indicators">
                    <span class="style-badge">${getStyleDisplayName(segmentStrategy.communicationStyle)}</span>
                    <span class="tone-badge">${getToneDisplayName(segmentStrategy.communicationTone)}</span>
                    <span class="urgency-badge urgency-${segmentStrategy.urgencyLevel}">
                        ${getUrgencyDisplayName(segmentStrategy.urgencyLevel)}
                    </span>
                </div>
            </div>
        </div>

        <div class="personalized-actions">
            <h4>🎯 Spersonalizowane Następne Kroki</h4>
            <div class="action-timeline">
                ${segmentStrategy.personalized_next_steps.map((step, index) => `
                    <div class="action-step step-${step.priority}">
                        <div class="step-header">
                            <span class="step-number">${index + 1}</span>
                            <span class="step-timing">${step.timing}</span>
                            <span class="step-priority priority-${step.priority}">${step.priority}</span>
                        </div>
                        <div class="step-content">
                            <h6>${step.action}</h6>
                            <p class="personalization">${step.personalization}</p>
                            <div class="step-details">
                                <span class="channel">📞 ${getChannelDisplayName(step.channel)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="segment-bonuses">
            <h4>🎁 Specjalne Oferty i Bonusy</h4>
            <div class="bonuses-grid">
                ${generateBonusesDisplay(segmentStrategy)}
            </div>
        </div>

        <div class="success-metrics">
            <h4>📊 Metryki Sukcesu dla Segmentu</h4>
            <div class="metrics-grid">
                ${generateMetricsDisplay(segmentInfo.identified_segment)}
            </div>
        </div>
    `;
}

// Funkcje pomocnicze dla wyświetlania segmentacji
function getSegmentDisplayName(segment) {
    const names = {
        'eco_family': '🌱 Eco-Family (Rodzina Eko)',
        'tech_professional': '💻 Tech Professional',
        'senior_comfort': '🏡 Senior Comfort',
        'business_roi': '💼 Business ROI',
        'young_urban': '🏙️ Young Urban',
        'general': '👤 Ogólny'
    };
    return names[segment] || segment;
}

function getPriorityLevel(score) {
    if (score >= 90) return 'very-high';
    if (score >= 80) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
}

function getMultiplierLevel(multiplier) {
    if (multiplier >= 1.3) return 'very-high';
    if (multiplier >= 1.2) return 'high';
    if (multiplier >= 1.1) return 'medium';
    return 'low';
}

function getStyleDisplayName(style) {
    const styles = {
        'family_focused': '👨‍👩‍👧‍👦 Rodzinny',
        'tech_focused': '🔬 Techniczny',
        'supportive': '🤝 Wspierający',
        'business_focused': '💼 Biznesowy',
        'balanced': '⚖️ Zrównoważony'
    };
    return styles[style] || style;
}

function getToneDisplayName(tone) {
    const tones = {
        'direct_results_focused': '🎯 Bezpośredni, skupiony na wynikach',
        'enthusiastic_social': '🎉 Entuzjastyczny, towarzyski',
        'supportive_patient': '🤗 Wspierający, cierpliwy',
        'analytical_detailed': '📊 Analityczny, szczegółowy'
    };
    return tones[tone] || tone;
}

function getUrgencyDisplayName(urgency) {
    const urgencies = {
        'high': '🔥 Wysoka',
        'medium': '⚡ Średnia',
        'low': '🕐 Niska'
    };
    return urgencies[urgency] || urgency;
}

function getChannelDisplayName(channel) {
    const channels = {
        'phone': 'Telefon',
        'email': 'Email',
        'video_call': 'Video call',
        'email_with_attachments': 'Email z załącznikami',
        'in_person': 'Spotkanie osobiste',
        'social_media': 'Social media'
    };
    return channels[channel] || channel;
}

function generateBonusesDisplay(strategy) {
    let bonusesHtml = '';
    
    if (strategy.pvSynergyBonus) {
        bonusesHtml += `
            <div class="bonus-item pv-bonus">
                <h6>🌞 Bonus PV Synergia</h6>
                <p>+${strategy.pvSynergyBonus}% wartości oferty</p>
            </div>
        `;
    }
    
    if (strategy.safetyPriorityBonus) {
        bonusesHtml += `
            <div class="bonus-item safety-bonus">
                <h6>🛡️ Bonus Bezpieczeństwo Rodziny</h6>
                <p>+${strategy.safetyPriorityBonus}% priorytet</p>
            </div>
        `;
    }
    
    if (strategy.techEarlyAdopterBonus) {
        bonusesHtml += `
            <div class="bonus-item tech-bonus">
                <h6>🚀 Bonus Tech Pioneer</h6>
                <p>+${strategy.techEarlyAdopterBonus}% early access</p>
            </div>
        `;
    }
    
    if (strategy.comfortPriorityBonus) {
        bonusesHtml += `
            <div class="bonus-item comfort-bonus">
                <h6>🏡 Bonus Senior Comfort</h6>
                <p>+${strategy.comfortPriorityBonus}% wsparcie</p>
            </div>
        `;
    }
    
    if (strategy.specialOffer) {
        bonusesHtml += `
            <div class="bonus-item special-offer">
                <h6>🎁 Specjalna Oferta</h6>
                <p>${strategy.specialOffer}</p>
            </div>
        `;
    }
    
    return bonusesHtml || '<p class="no-bonuses">Brak specjalnych bonusów dla tego segmentu</p>';
}

function generateMetricsDisplay(segment) {
    const metrics = {
        'eco_family': [
            { name: 'Conversion Rate Target', value: '25-35%', icon: '🎯' },
            { name: 'Avg. Decision Time', value: '2-4 tygodnie', icon: '⏱️' },
            { name: 'PV Synergy Bonus', value: '+40% value', icon: '🌞' },
            { name: 'Family Safety Score', value: '95/100', icon: '🛡️' }
        ],
        'tech_professional': [
            { name: 'Conversion Rate Target', value: '30-40%', icon: '🎯' },
            { name: 'Avg. Decision Time', value: '1-2 tygodnie', icon: '⏱️' },
            { name: 'Tech Appeal Score', value: '92/100', icon: '💻' },
            { name: 'Performance Priority', value: '88/100', icon: '🚀' }
        ],
        'senior_comfort': [
            { name: 'Conversion Rate Target', value: '35-45%', icon: '🎯' },
            { name: 'Avg. Decision Time', value: '4-8 tygodni', icon: '⏱️' },
            { name: 'Comfort Score', value: '94/100', icon: '🏡' },
            { name: 'Support Satisfaction', value: '96/100', icon: '🤝' }
        ],
        'business_roi': [
            { name: 'Conversion Rate Target', value: '20-30%', icon: '🎯' },
            { name: 'Avg. Decision Time', value: '3-6 tygodni', icon: '⏱️' },
            { name: 'ROI Score', value: '85/100', icon: '💰' },
            { name: 'Business Value', value: '87/100', icon: '💼' }
        ],
        'young_urban': [
            { name: 'Conversion Rate Target', value: '15-25%', icon: '🎯' },
            { name: 'Avg. Decision Time', value: '2-3 tygodnie', icon: '⏱️' },
            { name: 'Lifestyle Appeal', value: '78/100', icon: '🏙️' },
            { name: 'Tech Interest', value: '82/100', icon: '📱' }
        ]
    };
    
    const segmentMetrics = metrics[segment] || metrics['young_urban'];
    
    return segmentMetrics.map(metric => `
        <div class="metric-item">
            <span class="metric-icon">${metric.icon}</span>
            <div class="metric-content">
                <span class="metric-name">${metric.name}</span>
                <span class="metric-value">${metric.value}</span>
            </div>
        </div>
    `).join('');
}

// Rozszerzona funkcja populateStrategyTab z segmentacją
function populateStrategyTabWithSegmentation(analysisResult) {
    // Najpierw wywołaj oryginalną funkcję
    populateStrategyTab(analysisResult);
    
    // Następnie dodaj sekcję segmentacji
    populateSegmentAnalysisTab(analysisResult);
    
    // Dodaj porównanie z innymi segmentami
    addSegmentComparison(analysisResult);
}

// Funkcja do porównania z innymi segmentami
function addSegmentComparison(analysisResult) {
    const comparisonSection = document.createElement('div');
    comparisonSection.className = 'segment-comparison';
    comparisonSection.innerHTML = `
        <h4>📊 Porównanie z Innymi Segmentami</h4>
        <div class="comparison-note">
            <p>Klient najlepiej pasuje do segmentu <strong>${getSegmentDisplayName(analysisResult.segment_analysis.identified_segment)}</strong></p>
            <p>Alternatywne podejścia dla innych segmentów:</p>
        </div>
        <div class="alternative-segments">
            ${generateAlternativeSegments(analysisResult)}
        </div>
    `;
    
    const strategyTab = document.getElementById('strategy-tab');
    if (strategyTab) {
        strategyTab.appendChild(comparisonSection);
    }
}

function generateAlternativeSegments(analysisResult) {
    const currentSegment = analysisResult.segment_analysis.identified_segment;
    const allSegments = ['eco_family', 'tech_professional', 'senior_comfort', 'business_roi', 'young_urban'];
    const alternatives = allSegments.filter(seg => seg !== currentSegment).slice(0, 2);
    
    return alternatives.map(segment => `
        <div class="alternative-segment">
            <h6>${getSegmentDisplayName(segment)}</h6>
            <p class="alternative-approach">${getAlternativeApproach(segment)}</p>
        </div>
    `).join('');
}

function getAlternativeApproach(segment) {
    const approaches = {
        'eco_family': 'Fokus na korzyści środowiskowe i oszczędności dla rodziny',
        'tech_professional': 'Nacisk na najnowszą technologię i performance',
        'senior_comfort': 'Podkreślenie komfortu, niezawodności i wsparcia',
        'business_roi': 'Analiza ROI i korzyści biznesowych',
        'young_urban': 'Lifestyle upgrade i nowoczesny image'
    };
    return approaches[segment] || 'Standardowe podejście';
}

// CSS dla nowych elementów segmentacji
function addSegmentationCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .segment-overview {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .segment-badge {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .segment-name {
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .confidence-score {
            background: rgba(255,255,255,0.3);
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .priority-indicators {
            display: flex;
            gap: 20px;
        }
        
        .priority-score, .conversion-multiplier {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .priority-very-high { color: #ff4757; }
        .priority-high { color: #ff6b7a; }
        .priority-medium { color: #ffa502; }
        .priority-low { color: #747d8c; }
        
        .multiplier-very-high { color: #2ed573; }
        .multiplier-high { color: #7bed9f; }
        .multiplier-medium { color: #ffa502; }
        .multiplier-low { color: #747d8c; }
        
        .strategy-message {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .primary-message {
            margin-bottom: 15px;
        }
        
        .message-text {
            font-size: 1.1em;
            font-weight: 500;
            color: #2c3e50;
            background: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #3498db;
        }
        
        .combined-message {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            padding: 15px;
            border-radius: 6px;
            margin-top: 10px;
        }
        
        .combined-text {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .urgency-bonus {
            background: #e74c3c;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        
        .benefits-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 10px;
            list-style: none;
            padding: 0;
        }
        
        .benefit-item {
            background: #e8f5e8;
            padding: 10px;
            border-radius: 6px;
            border-left: 3px solid #27ae60;
        }
        
        .style-indicators {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .style-badge, .tone-badge, .urgency-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
        }
        
        .style-badge { background: #e3f2fd; color: #1976d2; }
        .tone-badge { background: #f3e5f5; color: #7b1fa2; }
        .urgency-high { background: #ffebee; color: #c62828; }
        .urgency-medium { background: #fff3e0; color: #ef6c00; }
        .urgency-low { background: #e8f5e8; color: #2e7d32; }
        
        .action-timeline {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .action-step {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            transition: all 0.3s ease;
        }
        
        .action-step:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .step-high { border-left: 4px solid #e74c3c; }
        .step-medium { border-left: 4px solid #f39c12; }
        .step-low { border-left: 4px solid #27ae60; }
        
        .step-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .step-number {
            background: #3498db;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .step-timing {
            background: #ecf0f1;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            color: #2c3e50;
        }
        
        .step-priority {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .priority-high { background: #e74c3c; color: white; }
        .priority-medium { background: #f39c12; color: white; }
        .priority-low { background: #27ae60; color: white; }
        
        .personalization {
            font-style: italic;
            color: #7f8c8d;
            margin: 5px 0;
        }
        
        .bonuses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .bonus-item {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .bonus-item h6 {
            margin: 0 0 5px 0;
            font-size: 1em;
        }
        
        .bonus-item p {
            margin: 0;
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .metric-item {
            display: flex;
            align-items: center;
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        
        .metric-icon {
            font-size: 1.5em;
            margin-right: 10px;
        }
        
        .metric-content {
            display: flex;
            flex-direction: column;
        }
        
        .metric-name {
            font-size: 0.9em;
            color: #7f8c8d;
            margin-bottom: 2px;
        }
        
        .metric-value {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .segment-comparison {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .alternative-segments {
            display: flex;
            gap: 20px;
            margin-top: 15px;
        }
        
        .alternative-segment {
            flex: 1;
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
        }
        
        .alternative-segment h6 {
            margin: 0 0 8px 0;
            color: #3498db;
        }
        
        .alternative-approach {
            margin: 0;
            font-size: 0.9em;
            color: #7f8c8d;
        }
    `;
    document.head.appendChild(style);
}

// Inicjalizacja CSS przy ładowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    addSegmentationCSS();
});

// Export funkcji dla użycia w innych plikach
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        populateSegmentAnalysisTab,
        populateStrategyTabWithSegmentation,
        addSegmentComparison
    };
}