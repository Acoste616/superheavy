/**
 * TCD SHU PRO - Main Application Controller
 * Tesla Customer Decoder - Super Heavy Ultra Professional
 * 
 * @version 2.0
 * @author Claude AI Assistant
 */

class TeslaCusomerDecoderApp {
    constructor() {
        this.engine = new CustomerDecoderEngine();
        this.currentAnalysis = null;
        this.selectedTriggers = new Set();
        this.analysisCount = 0;
        this.isInitialized = false;
        this.currentCustomerId = null;
        this.apiBase = 'http://localhost:3000/api';
        
        // UI Elements
        this.ui = {
            welcomeScreen: document.getElementById('welcomeScreen'),
            analysisInterface: document.getElementById('analysisInterface'),
            resultsSection: document.getElementById('resultsSection'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            
            // Input elements
            toneSelect: document.getElementById('toneSelect'), 
            triggerGrid: document.getElementById('triggerGrid'),
            selectedTriggerCount: document.getElementById('selectedTriggerCount'),
            selectedTriggersList: document.getElementById('selectedTriggersList'),
            
            // Buttons
            startAnalysis: document.getElementById('startAnalysis'),
            runAnalysis: document.getElementById('runAnalysis'),
            newAnalysis: document.getElementById('newAnalysis'),
            exportReport: document.getElementById('exportReport'),
            
            // Results elements
            conversionScore: document.getElementById('conversionScore'),
            progressBar: document.getElementById('progressBar'),
            personalityMatch: document.getElementById('personalityMatch'),
            triggerIntensity: document.getElementById('triggerIntensity'),
            toneCompatibility: document.getElementById('toneCompatibility'),
            confidenceLevel: document.getElementById('confidenceLevel')
        };

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Starting TCD SHU PRO Application...');
            
            // Show loading
            this.showLoading(true, 'Inicjalizacja systemu...');
            
            // Initialize the logic engine
            const dataFiles = {
                triggers: 'data/triggers.json',
                personas: 'data/personas.json', 
                rules: 'rules.json',
                weights: 'weights_and_scoring.json',
                cheatsheet: 'cheatsheet_phrases.json',
                objections: 'objections_and_rebuttals.json'
            };
            
            await this.engine.initialize(dataFiles);
            
            // Setup UI
            this.setupEventListeners();
            this.populateUI();
            
            // Hide loading
            this.showLoading(false);
            
            this.isInitialized = true;
            console.log('✅ TCD SHU PRO Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showError('Błąd inicjalizacji aplikacji. Sprawdź połączenie i pliki danych.');
        }
    }

    setupEventListeners() {
        // Start analysis
        this.ui.startAnalysis.addEventListener('click', () => {
            this.showAnalysisInterface();
        });

        // Run analysis
        this.ui.runAnalysis.addEventListener('click', () => {
            this.performAnalysis();
        });

        // New analysis
        this.ui.newAnalysis.addEventListener('click', () => {
            this.resetToStart();
        });

        // Export report
        this.ui.exportReport.addEventListener('click', () => {
            this.exportAnalysisReport();
        });

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Trigger selection
        this.ui.triggerGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('trigger-btn')) {
                this.toggleTrigger(e.target);
            }
        });

        // Real-time trigger count updates
        this.ui.triggerGrid.addEventListener('change', () => {
            this.updateTriggerDisplay();
        });
    }

    populateUI() {
        this.populateTriggers();
    }

    populateTriggers() {
        const triggers = this.engine.data.triggers?.triggers || [];
        
        this.ui.triggerGrid.innerHTML = triggers.map(trigger => {
            // Znajdź szybką odpowiedź z rules.json
            const rule = this.engine.data.rules?.find(r => 
                r.Triggers?.some(t => t.toLowerCase().includes(trigger.text.toLowerCase()))
            );
            const quickResponse = rule?.Skrypt || "Brak szybkiej odpowiedzi";
            
            // Dodaj kontekst dla pojedynczych słów
            const contextualText = this.addContextToTrigger(trigger.text);
            
            return `
            <div class="trigger-btn bg-tesla-gray-800 border border-tesla-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-tesla-red hover:bg-tesla-gray-700 hover:shadow-lg select-none"
                 data-trigger-id="${trigger.id}"
                 style="min-height: 130px;">
                <div class="flex items-start justify-between mb-2">
                    <span class="text-white text-sm font-medium flex-1 pr-2 leading-relaxed">${contextualText}</span>
                    <div class="flex items-center space-x-2 flex-shrink-0">
                        <span class="text-xs bg-tesla-gray-700 px-2 py-1 rounded text-tesla-gray-300">
                            ${trigger.base_conversion_rate}%
                        </span>
                        <i class="fas fa-plus text-tesla-gray-400 transition-transform duration-200"></i>
                    </div>
                </div>
                <div class="text-xs text-tesla-gray-400 mb-2">
                    ${this.getCategoryLabel(trigger.category)}
                </div>
                <div class="text-xs text-tesla-gray-500 border-t border-tesla-gray-700 pt-2 leading-relaxed">
                    💡 <strong>Odpowiedź:</strong> "${quickResponse.substring(0, 120)}..."
                </div>
            </div>
        `}).join('');
    }

    toggleTrigger(element) {
        const triggerId = element.dataset.triggerId;
        const trigger = this.engine.data.triggers?.triggers?.find(t => t.id === triggerId);
        
        if (!trigger) return;

        const icon = element.querySelector('i');
        
        if (this.selectedTriggers.has(trigger.text)) {
            // Remove trigger
            this.selectedTriggers.delete(trigger.text);
            element.classList.remove('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
            element.classList.add('border-tesla-gray-700', 'bg-tesla-gray-800');
            icon.className = 'fas fa-plus text-tesla-gray-400 transition-transform duration-200';
        } else {
            // Add trigger
            this.selectedTriggers.add(trigger.text);
            element.classList.remove('border-tesla-gray-700', 'bg-tesla-gray-800');
            element.classList.add('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
            icon.className = 'fas fa-check text-tesla-red transition-transform duration-200';
        }

        this.updateTriggerDisplay();
    }

    updateTriggerDisplay() {
        const count = this.selectedTriggers.size;
        this.ui.selectedTriggerCount.textContent = count;
        
        if (count === 0) {
            this.ui.selectedTriggersList.textContent = 'Brak wybranych triggerów';
        } else {
            const triggerList = Array.from(this.selectedTriggers).join(', ');
            this.ui.selectedTriggersList.textContent = triggerList;
        }

        // Enable/disable analysis button
        this.ui.runAnalysis.disabled = count === 0;
    }

    showAnalysisInterface() {
        this.ui.welcomeScreen.style.display = 'none';
        this.ui.analysisInterface.style.display = 'block';
        this.ui.analysisInterface.classList.remove('hidden');
    }

    async performAnalysis() {
        if (this.selectedTriggers.size === 0) {
            this.showError('Proszę wybrać przynajmniej jeden trigger.');
            return;
        }

        try {
            this.showLoading(true, 'Analizowanie profilu klienta...');
            
            // Prepare input data - zawsze automatyczne wykrywanie
            const inputData = {
                personaId: '', // Pusty = automatyczne wykrywanie
                tone: this.ui.toneSelect.value,
                selectedTriggers: Array.from(this.selectedTriggers),
                demographics: {
                    age: document.getElementById('ageRange').value,
                    hasPV: document.getElementById('hasPV').value,
                    region: document.getElementById('region').value
                }
            };

            // Call backend API for analysis
            const response = await fetch(`${this.apiBase}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerId: this.currentCustomerId,
                    inputData: inputData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.currentAnalysis = result.analysis;
                this.currentCustomerId = result.customerId;
                
                // Update analysis count
                this.analysisCount++;
                document.querySelector('#analysisCount span').textContent = this.analysisCount;
                
                // Display results
                this.displayResults(this.currentAnalysis);
                
                // Add conversation tracking button
                this.addConversationTrackingButton();
            } else {
                throw new Error(result.error || 'Nieznany błąd');
            }
            
            this.showLoading(false);

        } catch (error) {
            console.error('Analysis failed:', error);
            this.showError('Błąd podczas analizy. Spróbuj ponownie.');
            this.showLoading(false);
        }
    }

    displayResults(analysis) {
        // Show results section
        this.ui.analysisInterface.style.display = 'none';
        this.ui.resultsSection.style.display = 'block';
        this.ui.resultsSection.classList.remove('hidden');
        
        // Scroll to results
        this.ui.resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Update main score
        const score = analysis.scores.total;
        this.ui.conversionScore.textContent = `${score}%`;
        
        // Animate progress bar
        setTimeout(() => {
            this.ui.progressBar.style.width = `${score}%`;
            
            // Color based on score
            if (score >= 70) {
                this.ui.progressBar.className = 'bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-1000';
            } else if (score >= 50) {
                this.ui.progressBar.className = 'bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-1000';
            } else {
                this.ui.progressBar.className = 'bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full transition-all duration-1000';
            }
        }, 100);

        // Update quick stats
        this.ui.personalityMatch.textContent = `${Math.round(analysis.personality.confidence * 100)}%`;
        this.ui.triggerIntensity.textContent = this.getIntensityLabel(analysis.triggers.intensityScore);
        this.ui.toneCompatibility.textContent = this.getCompatibilityLabel(analysis.tone.compatibility);
        this.ui.confidenceLevel.textContent = `${Math.round(analysis.confidence * 100)}%`;

        // Populate tab content
        this.populateStrategyTab(analysis);
        this.populateLanguageTab(analysis);
        this.populateObjectionsTab(analysis);
        this.populateActionsTab(analysis);

        // Show first tab
        this.switchTab('strategy');
    }

    populateStrategyTab(analysis) {
        // Customer Profile - ROZBUDOWANY
        const profile = analysis.personality.detected;
        const autoDetected = analysis.personality.autoDetected ? 
            '<span class="text-green-400 text-xs">🤖 Automatycznie wykryto</span>' : 
            '<span class="text-blue-400 text-xs">✋ Wybrano ręcznie</span>';
        
        document.getElementById('customerProfile').innerHTML = `
            <div class="bg-tesla-gray-800 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h5 class="font-semibold text-white">${profile.name}</h5>
                    ${autoDetected}
                </div>
                <p class="text-tesla-gray-300 text-sm mb-3">${profile.description || 'Opis profilu klienta'}</p>
                <div class="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <span class="text-tesla-gray-400">Typ DISC:</span>
                        <span class="text-tesla-red font-semibold ml-2">${profile.DISC}</span>
                    </div>
                    <div>
                        <span class="text-tesla-gray-400">Wiek:</span>
                        <span class="text-white ml-2">${profile.demographics?.age_range || 'Nie określono'}</span>
                    </div>
                    <div>
                        <span class="text-tesla-gray-400">Dochód:</span>
                        <span class="text-white ml-2">${profile.demographics?.income_pln || 'Nie określono'}</span>
                    </div>
                    <div>
                        <span class="text-tesla-gray-400">Status:</span>
                        <span class="text-white ml-2">${profile.demographics?.family_status || 'Nie określono'}</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-tesla-gray-800 rounded-lg p-4 mb-4">
                <h6 class="text-tesla-red text-sm font-semibold mb-3">🎯 Główne Motywacje</h6>
                <ul class="text-tesla-gray-300 text-sm space-y-2">
                    ${(profile.psychological_profile?.motivations || []).map(m => `<li class="flex items-start"><span class="text-tesla-red mr-2">•</span>${m}</li>`).join('')}
                </ul>
            </div>
            
            <div class="bg-tesla-gray-800 rounded-lg p-4 mb-4">
                <h6 class="text-tesla-red text-sm font-semibold mb-3">⚠️ Obawy i Wyzwania</h6>
                <ul class="text-tesla-gray-300 text-sm space-y-2">
                    ${(profile.psychological_profile?.fears_and_concerns || []).map(f => `<li class="flex items-start"><span class="text-yellow-500 mr-2">⚠</span>${f}</li>`).join('')}
                </ul>
            </div>
            
            <div class="bg-tesla-gray-800 rounded-lg p-4">
                <h6 class="text-tesla-red text-sm font-semibold mb-3">🗣️ Styl Komunikacji</h6>
                <div class="space-y-2 text-sm">
                    <div><span class="text-tesla-gray-400">Styl decyzyjny:</span> <span class="text-white ml-2">${profile.psychological_profile?.decision_making_style || 'Nie określono'}</span></div>
                    <div><span class="text-tesla-gray-400">Szybkość decyzji:</span> <span class="text-white ml-2">${profile.psychological_profile?.decision_speed || 'Nie określono'}</span></div>
                    <div><span class="text-tesla-gray-400">Preferowany język:</span> 
                        <div class="flex flex-wrap gap-1 mt-1">
                            ${(profile.communication_preferences?.key_language || []).map(word => 
                                `<span class="bg-tesla-red px-2 py-1 rounded text-xs text-white">${word}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Sales Strategy
        const strategy = analysis.strategy.selected;
        document.getElementById('salesStrategy').innerHTML = `
            <div class="bg-tesla-gray-800 rounded-lg p-4 mb-4">
                <h5 class="font-semibold text-tesla-red mb-3">🚀 Główna Strategia Sprzedażowa</h5>
                <div class="bg-tesla-gray-900 p-4 rounded border-l-4 border-tesla-red">
                    <p class="text-tesla-gray-300 text-sm leading-relaxed">${strategy?.Skrypt || 'Brak dostępnej strategii'}</p>
                </div>
            </div>
            
            <div class="bg-tesla-gray-800 rounded-lg p-4 mb-4">
                <h6 class="text-tesla-red text-sm font-semibold mb-3">📊 Fakty dla Polski 2025</h6>
                <div class="bg-tesla-gray-900 p-4 rounded">
                    <p class="text-tesla-gray-300 text-sm leading-relaxed">${strategy?.Fakty_PL || 'Brak danych faktycznych'}</p>
                </div>
            </div>
            
            <div class="bg-tesla-gray-800 rounded-lg p-4 mb-4">
                <h6 class="text-tesla-red text-sm font-semibold mb-3">🎯 Technika Perswazji</h6>
                <div class="flex items-center mb-2">
                    <span class="bg-tesla-red text-white px-3 py-1 rounded-full text-xs font-semibold">${strategy?.Technika || 'Standardowe podejście'}</span>
                </div>
                <div class="text-xs text-tesla-gray-400">
                    ⚠️ ${strategy?.Ostrzeżenie_etyczne || 'Brak szczególnych ostrzeżeń etycznych'}
                </div>
            </div>
            
            <div class="bg-tesla-gray-800 rounded-lg p-4 mb-4">
                <h6 class="text-tesla-red text-sm font-semibold mb-3">🎪 Podejście do Klienta</h6>
                <div class="space-y-3">
                    <div class="bg-tesla-gray-900 p-3 rounded">
                        <h7 class="text-tesla-gray-300 text-xs font-semibold">Główna Strategia:</h7>
                        <p class="text-tesla-gray-400 text-xs mt-1">${profile.sales_approach?.primary_strategy || 'Dopasowane podejście'}</p>
                    </div>
                    <div class="bg-tesla-gray-900 p-3 rounded">
                        <h7 class="text-tesla-gray-300 text-xs font-semibold">Kluczowe Komunikaty:</h7>
                        <ul class="text-tesla-gray-400 text-xs mt-1 space-y-1">
                            ${(profile.sales_approach?.key_messages || []).map(msg => `<li>• ${msg}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            ${analysis.triggers.relationships && Object.keys(analysis.triggers.relationships).length > 0 ? `
            <div class="bg-tesla-gray-800 rounded-lg p-4">
                <h6 class="text-tesla-red text-sm font-semibold mb-3">🔗 Wykryte Wzorce Triggerów</h6>
                <div class="space-y-2">
                    ${Object.entries(analysis.triggers.relationships).map(([pattern, data]) => `
                        <div class="bg-tesla-gray-900 p-2 rounded flex justify-between items-center">
                            <span class="text-tesla-gray-300 text-sm">${this.getPatternLabel(pattern)}</span>
                            <span class="text-green-400 text-xs font-semibold bg-green-400 bg-opacity-20 px-2 py-1 rounded">+${data.synergy} pkt</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    }

    populateLanguageTab(analysis) {
        const recommendations = analysis.recommendations.language;
        
        // Key Words
        document.getElementById('keyWords').innerHTML = `
            <div class="bg-tesla-gray-800 rounded-lg p-4">
                <h6 class="text-tesla-red text-sm font-semibold mb-3">Używaj Tych Słów</h6>
                <div class="flex flex-wrap gap-2">
                    ${(recommendations.keywords || []).map(keyword => `
                        <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm">${keyword}</span>
                    `).join('')}
                </div>
            </div>
            ${recommendations.avoidWords?.length ? `
            <div class="bg-tesla-gray-800 rounded-lg p-4">
                <h6 class="text-red-500 text-sm font-semibold mb-3">Unikaj Tych Słów</h6>
                <div class="flex flex-wrap gap-2">
                    ${recommendations.avoidWords.map(word => `
                        <span class="bg-red-600 text-white px-3 py-1 rounded-full text-sm">${word}</span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;

        // Ready Phrases  
        document.getElementById('readyPhrases').innerHTML = `
            <div class="space-y-3">
                ${(recommendations.phrases || []).map((phrase, index) => `
                    <div class="bg-tesla-gray-800 rounded-lg p-4 cursor-pointer hover:bg-tesla-gray-700 transition-colors"
                         onclick="navigator.clipboard.writeText('${phrase}')">
                        <div class="flex items-start justify-between">
                            <p class="text-tesla-gray-300 text-sm flex-1">${phrase}</p>
                            <i class="fas fa-copy text-tesla-gray-500 hover:text-tesla-red transition-colors ml-2"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    populateObjectionsTab(analysis) {
        const objections = analysis.recommendations.objectionHandling;
        
        if (objections.length === 0) {
            document.getElementById('objectionsList').innerHTML = `
                <div class="text-center py-8 text-tesla-gray-400">
                    <i class="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
                    <p>Brak przewidywanych obiekcji dla wybranych triggerów.</p>
                </div>
            `;
            return;
        }

        document.getElementById('objectionsList').innerHTML = objections.map(obj => `
            <div class="bg-tesla-gray-800 rounded-lg p-6">
                <h5 class="text-tesla-red font-semibold mb-4">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    "${obj.objection}"
                </h5>
                <div class="space-y-3">
                    ${obj.responses?.map(response => `
                        <div class="bg-tesla-gray-900 rounded p-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs bg-tesla-red px-2 py-1 rounded text-white">
                                    ${response.technique}
                                </span>
                                <span class="text-xs text-tesla-gray-400">
                                    Poziom ${response.level}
                                </span>
                            </div>
                            <p class="text-tesla-gray-300 text-sm">${response.script}</p>
                            ${response.ethical_warning && response.ethical_warning.includes('Ryzyko') ? `
                                <div class="mt-2 p-2 bg-yellow-600 bg-opacity-20 rounded">
                                    <p class="text-yellow-400 text-xs">
                                        <i class="fas fa-exclamation-triangle mr-1"></i>
                                        ${response.ethical_warning}
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                    `).join('') || '<p class="text-tesla-gray-400 text-sm">Brak dostępnych odpowiedzi</p>'}
                </div>
            </div>
        `).join('');
    }

    populateActionsTab(analysis) {
        // Next Steps
        const nextSteps = analysis.recommendations.nextSteps;
        document.getElementById('nextSteps').innerHTML = `
            <div class="space-y-4">
                ${nextSteps.map((step, index) => `
                    <div class="bg-tesla-gray-800 rounded-lg p-4 flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-tesla-red rounded-full flex items-center justify-center text-white font-bold">
                                ${step.priority}
                            </div>
                        </div>
                        <div class="flex-1">
                            <h6 class="text-white font-semibold mb-1">${step.action}</h6>
                            <p class="text-tesla-gray-400 text-sm">${step.timeframe}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Ethical Warnings
        const warnings = analysis.warnings;
        document.getElementById('ethicalWarnings').innerHTML = warnings.length > 0 ? `
            <div class="space-y-4">
                ${warnings.map(warning => `
                    <div class="bg-${warning.severity === 'high' ? 'red' : 'yellow'}-600 bg-opacity-20 rounded-lg p-4 border border-${warning.severity === 'high' ? 'red' : 'yellow'}-600">
                        <div class="flex items-start space-x-3">
                            <i class="fas fa-exclamation-triangle text-${warning.severity === 'high' ? 'red' : 'yellow'}-400 mt-1"></i>
                            <div>
                                <h6 class="text-${warning.severity === 'high' ? 'red' : 'yellow'}-400 font-semibold text-sm mb-1">
                                    ${warning.type.replace(/_/g, ' ')}
                                </h6>
                                <p class="text-tesla-gray-300 text-sm">${warning.message}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="bg-green-600 bg-opacity-20 rounded-lg p-4 border border-green-600">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-check-circle text-green-400"></i>
                    <p class="text-green-400 font-semibold">Brak ostrzeżeń etycznych</p>
                </div>
                <p class="text-tesla-gray-300 text-sm mt-2">
                    Wybrana strategia jest etyczna i buduje długoterminowe relacje z klientem.
                </p>
            </div>
        `;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active', 'text-tesla-red', 'border-b-2', 'border-tesla-red');
        });
        
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        activeButton.classList.add('active', 'text-tesla-red', 'border-b-2', 'border-tesla-red');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    }

    resetToStart() {
        // Reset UI
        this.ui.resultsSection.style.display = 'none';
        this.ui.analysisInterface.style.display = 'none';
        this.ui.welcomeScreen.style.display = 'block';

        // Reset selections
        this.selectedTriggers.clear();
        this.currentAnalysis = null;

        // Reset form
        this.ui.toneSelect.value = 'entuzjastyczny';
        document.getElementById('ageRange').value = '';
        document.getElementById('hasPV').value = '';
        document.getElementById('region').value = '';

        // Reset triggers
        document.querySelectorAll('.trigger-btn').forEach(btn => {
            btn.classList.remove('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
            btn.classList.add('border-tesla-gray-700', 'bg-tesla-gray-800');
            btn.querySelector('i').className = 'fas fa-plus text-tesla-gray-400 transition-transform duration-200';
        });

        this.updateTriggerDisplay();
    }

    exportAnalysisReport() {
        if (!this.currentAnalysis) return;

        const report = {
            timestamp: new Date().toISOString(),
            analysis: this.currentAnalysis,
            version: '2.0'
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `TCD_Analysis_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showLoading(show, message = 'Ładowanie...') {
        if (show) {
            this.ui.loadingOverlay.classList.remove('hidden');
            if (message) {
                this.ui.loadingOverlay.querySelector('p').textContent = message;
            }
        } else {
            this.ui.loadingOverlay.classList.add('hidden');
        }
    }

    showError(message) {
        alert(message); // Simple for now, can be improved with custom modal
    }

    // Utility methods
    getPersonaEmoji(discType) {
        const emojis = { 'D': '⚡', 'I': '🌟', 'S': '🏠', 'C': '🔬' };
        return emojis[discType] || '👤';
    }

    getCategoryLabel(category) {
        const labels = {
            financial: '💰 Finansowe',
            technical: '⚙️ Techniczne', 
            social_status: '👑 Status',
            safety_security: '🛡️ Bezpieczeństwo',
            environmental: '🌱 Ekologia',
            behavioral: '🧠 Behawioralne',
            psychological: '💭 Psychologiczne'
        };
        return labels[category] || category;
    }

    getIntensityLabel(score) {
        if (score >= 500) return 'Very High';
        if (score >= 300) return 'High';
        if (score >= 150) return 'Medium';
        return 'Low';
    }

    getCompatibilityLabel(compatibility) {
        if (compatibility >= 0.8) return 'Excellent';
        if (compatibility >= 0.6) return 'Good';
        if (compatibility >= 0.4) return 'Fair';
        return 'Poor';
    }

    getPatternLabel(pattern) {
        const labels = {
            financial_cluster: 'Cluster Finansowy',
            technical_doubt_cluster: 'Wątpliwości Techniczne',
            high_intent_cluster: 'Wysokie Zainteresowanie',
            infrastructure_cluster: 'Obawy Infrastrukturalne'
        };
        return labels[pattern] || pattern;
    }

    addContextToTrigger(triggerText) {
        // Dodaj kontekst dla pojedynczych słów
        const contexts = {
            'cena': '💰 "Cena jest dla mnie ważna"',
            'drogo': '💰 "To jest za drogo"',
            'koszt': '💰 "Jaki będzie koszt?"',
            'naprawa': '🔧 "A co z naprawami?"',
            'serwis': '🔧 "Jak wygląda serwis?"',
            'awaria': '🔧 "Co przy awarii?"',
            'ładowanie': '⚡ "Pytania o ładowanie"',
            'czas': '⏰ "Ile to zajmuje czasu?"',
            'szybkość': '🚄 "Jaka jest szybkość?"',
            'zima': '❄️ "A co zimą?"',
            'zasięg': '🛣️ "Pytania o zasięg"',
            'mróz': '❄️ "Działanie w mrozie?"',
            'poczekać': '⏳ "Może lepiej poczekać?"',
            'później': '⏳ "Zrobię to później"',
            'za rok': '📅 "Może za rok będzie lepiej"',
            'testowałem': '🔍 "Testowałem różne auta"',
            'porównałem': '📊 "Porównałem opcje"',
            'research': '🔬 "Zrobiłem research"',
            'środowisko': '🌱 "Dbam o środowisko"',
            'emisje': '🌍 "Ważne są emisje"',
            'planeta': '🌍 "Myślę o planecie"',
            'firmowy': '🏢 "To samochód firmowy"',
            'firma': '🏢 "Dla mojej firmy"',
            'biznes': '💼 "Kwestie biznesowe"',
            'NaszEauto': '🎯 "Program NaszEauto"',
            'dotacja': '💶 "Pytania o dotację"',
            'dopłata': '💶 "Jakie dopłaty?"',
            'bateria': '🔋 "Kwestie baterii"',
            'wymiana': '🔄 "Co z wymianą?"',
            'koszt wymiany': '💰🔋 "Ile kosztuje wymiana baterii?"'
        };
        
        return contexts[triggerText] || triggerText;
    }

    addConversationTrackingButton() {
        // Add conversation tracking button to results section
        const actionsTab = document.getElementById('actionsTab');
        if (actionsTab && this.currentCustomerId) {
            const existingButton = actionsTab.querySelector('#conversationTrackingBtn');
            if (!existingButton) {
                const buttonHtml = `
                    <div class="bg-tesla-gray-800 rounded-lg p-4 mt-4">
                        <h6 class="text-tesla-red text-sm font-semibold mb-3">
                            <i class="fas fa-comments mr-2"></i>Po Rozmowie z Klientem
                        </h6>
                        <button id="conversationTrackingBtn" 
                                class="bg-tesla-red hover:bg-red-600 px-6 py-3 rounded-lg w-full transition-colors">
                            <i class="fas fa-plus mr-2"></i>Zapisz Wyniki Rozmowy
                        </button>
                    </div>
                `;
                
                const nextStepsDiv = actionsTab.querySelector('#nextSteps').parentNode;
                nextStepsDiv.insertAdjacentHTML('afterend', buttonHtml);
                
                // Add event listener
                document.getElementById('conversationTrackingBtn').addEventListener('click', () => {
                    window.open(`conversation-tracker.html?customerId=${this.currentCustomerId}`, '_blank');
                });
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Starting Tesla Customer Decoder SHU PRO...');
    window.tcdApp = new TeslaCusomerDecoderApp();
});