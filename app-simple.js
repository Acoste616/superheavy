/**
 * TCD SHU PRO - Simplified Application Controller
 * Tesla Customer Decoder - Super Heavy Ultra Professional
 * 
 * @version 3.0
 * @author Claude AI Assistant
 */

class TeslaCusomerDecoderApp {
    constructor() {
        this.currentAnalysis = null;
        this.selectedTriggers = new Set();
        this.analysisCount = 0;
        this.isInitialized = false;
        this.currentCustomerId = null;
        this.apiBase = 'http://localhost:3001/api';
        this.data = {};
        
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
            
            // Load data directly from API
            await this.loadData();
            
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

    async loadData() {
        try {
            // Load triggers data directly
            const response = await fetch('data/triggers.json');
            if (!response.ok) throw new Error('Failed to load triggers');
            this.data.triggers = await response.json();
            console.log('✅ Loaded triggers:', this.data.triggers.triggers?.length || 0);
            
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            throw error;
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
            const triggerBtn = e.target.closest('.trigger-btn');
            if (triggerBtn) {
                this.toggleTrigger(triggerBtn);
            }
        });

        // Category toggle functionality
        this.ui.triggerGrid.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.category-toggle');
            if (toggleBtn) {
                this.toggleCategory(toggleBtn.dataset.category);
            }
        });
    }

    populateUI() {
        this.populateTriggers();
    }

    populateTriggers() {
        console.log('🔍 Loading triggers...', this.data.triggers);
        const triggers = this.data.triggers?.triggers || [];
        console.log('📊 Found triggers:', triggers.length);
        
        if (triggers.length === 0) {
            this.ui.triggerGrid.innerHTML = '<div class="col-span-full text-center text-tesla-gray-400 py-8">Brak triggerów do wyświetlenia</div>';
            return;
        }
        
        // Group triggers by category
        const triggersByCategory = this.groupTriggersByCategory(triggers);
        console.log('📂 Grouped categories:', Object.keys(triggersByCategory));
        
        this.ui.triggerGrid.innerHTML = this.renderTriggerCategories(triggersByCategory);
    }

    groupTriggersByCategory(triggers) {
        const categories = {
            financial: { 
                name: '💰 Finanse i Koszty', 
                description: 'Wszelkie kwestie związane z ceną, kosztami, finansowaniem',
                triggers: [],
                color: 'border-green-500'
            },
            technical: { 
                name: '⚙️ Techniczne i Praktyczne', 
                description: 'Zasięg, ładowanie, wydajność, funkcjonalności',
                triggers: [],
                color: 'border-blue-500'
            },
            competitive: { 
                name: '🏁 Porównania i Konkurencja', 
                description: 'Porównania z innymi markami, modelami, technologiami',
                triggers: [],
                color: 'border-red-500'
            },
            lifestyle: { 
                name: '🚗 Styl Życia i Status', 
                description: 'Prestiż, wizerunek, dopasowanie do stylu życia',
                triggers: [],
                color: 'border-purple-500'
            },
            environmental: { 
                name: '🌱 Ekologia i Wartości', 
                description: 'Wpływ na środowisko, misja, przyszłość',
                triggers: [],
                color: 'border-green-400'
            },
            decision_process: { 
                name: '🎯 Proces Decyzyjny', 
                description: 'Timing, badania, gotowość do zakupu',
                triggers: [],
                color: 'border-orange-500'
            },
            objections: { 
                name: '🚫 Obiekcje i Wątpliwości', 
                description: 'Typowe obiekcje i zastrzeżenia klientów',
                triggers: [],
                color: 'border-red-400'
            }
        };

        // Group triggers by category
        triggers.forEach(trigger => {
            const category = trigger.category || 'other';
            if (categories[category]) {
                categories[category].triggers.push(trigger);
            } else {
                // Handle unknown categories
                if (!categories.other) {
                    categories.other = {
                        name: '🔍 Inne',
                        description: 'Pozostałe triggery',
                        triggers: [],
                        color: 'border-gray-500'
                    };
                }
                categories.other.triggers.push(trigger);
            }
        });

        // Remove empty categories
        Object.keys(categories).forEach(key => {
            if (categories[key].triggers.length === 0) {
                delete categories[key];
            }
        });

        return categories;
    }

    renderTriggerCategories(triggersByCategory) {
        let html = '';
        
        Object.entries(triggersByCategory).forEach(([categoryKey, categoryData]) => {
            html += `
                <div class="category-section mb-8">
                    <div class="category-header mb-4 p-4 bg-tesla-gray-800 rounded-lg border-l-4 ${categoryData.color}">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="text-lg font-semibold text-white mb-1">${categoryData.name}</h4>
                                <p class="text-tesla-gray-400 text-sm">${categoryData.description}</p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs bg-tesla-gray-700 px-2 py-1 rounded text-tesla-gray-300">
                                    ${categoryData.triggers.length} triggerów
                                </span>
                                <button class="category-toggle text-tesla-gray-400 hover:text-white transition-colors" data-category="${categoryKey}">
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="category-triggers grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" data-category="${categoryKey}">
                        ${categoryData.triggers.map(trigger => this.renderTriggerTile(trigger)).join('')}
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    renderTriggerTile(trigger) {
        // Użyj nowej struktury szybkich odpowiedzi
        const quickResponse = trigger.quick_response?.immediate_reply || 'Przygotowuję odpowiedź na ten trigger';
        
        // Ikona dla kategorii
        const categoryIcon = this.getCategoryIcon(trigger.category);
        
        return `
            <div class="trigger-btn bg-tesla-gray-800 border border-tesla-gray-700 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:border-tesla-red hover:bg-tesla-gray-700 hover:shadow-lg select-none group"
                 data-trigger-id="${trigger.id}"
                 data-trigger-text="${trigger.text}"
                 title="Kliknij aby wybrać trigger">
                <div class="flex items-start justify-between mb-2">
                    <span class="text-white text-sm font-medium flex-1 pr-2 leading-snug">${trigger.text}</span>
                    <div class="flex items-center space-x-1 flex-shrink-0">
                        <span class="text-xs bg-tesla-gray-600 px-1.5 py-0.5 rounded text-tesla-gray-200">
                            ${trigger.base_conversion_rate}%
                        </span>
                        <i class="fas fa-plus text-tesla-gray-400 transition-transform duration-200 group-hover:rotate-45 text-sm"></i>
                    </div>
                </div>
                <div class="flex items-center text-xs text-tesla-gray-400 mb-2">
                    <span class="mr-1">${categoryIcon}</span>
                    <span>${this.getCategoryLabel(trigger.category)}</span>
                    ${trigger.intent_level ? `<span class="ml-2 px-1 py-0.5 bg-tesla-gray-700 rounded text-xs">${this.getIntentLabel(trigger.intent_level)}</span>` : ''}
                </div>
                <div class="text-xs text-tesla-gray-500 border-t border-tesla-gray-700 pt-2 leading-tight">
                    <div class="flex items-start">
                        <span class="mr-1 mt-0.5 text-tesla-red">⚡</span>
                        <span class="line-clamp-2"><strong class="text-tesla-gray-400">Szybka odpowiedź:</strong> "${quickResponse.length > 80 ? quickResponse.substring(0, 80) + '...' : quickResponse}"</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    getCategoryIcon(category) {
        const icons = {
            'financial': '💰',
            'technical': '⚙️',
            'competitive': '🏁',
            'lifestyle': '🚗',
            'environmental': '🌱',
            'decision_process': '🎯',
            'objections': '🚫'
        };
        return icons[category] || '📋';
    }
    
    getCategoryLabel(category) {
        const labels = {
            'financial': 'Finanse',
            'technical': 'Techniczne',
            'competitive': 'Konkurencja',
            'lifestyle': 'Lifestyle',
            'environmental': 'Ekologia',
            'decision_process': 'Decyzje',
            'objections': 'Obiekcje'
        };
        return labels[category] || category;
    }
    
    getIntentLabel(intentLevel) {
        const labels = {
            'low': 'Niski',
            'low_medium': 'Niski-Średni',
            'medium': 'Średni',
            'medium_high': 'Średni-Wysoki',
            'high': 'Wysoki',
            'very_high': 'Bardzo Wysoki',
            'maximum': 'Maksymalny'
        };
        return labels[intentLevel] || intentLevel;
    }

    toggleTrigger(element) {
        // Prevent double-clicking/rapid clicking
        if (element.dataset.processing === 'true') return;
        element.dataset.processing = 'true';
        
        const triggerText = element.dataset.triggerText;
        const icon = element.querySelector('i');
        
        if (this.selectedTriggers.has(triggerText)) {
            // Remove trigger
            this.selectedTriggers.delete(triggerText);
            element.classList.remove('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
            element.classList.add('border-tesla-gray-700', 'bg-tesla-gray-800');
            if (icon) {
                icon.className = 'fas fa-plus text-tesla-gray-400 transition-transform duration-200';
            }
        } else {
            // Add trigger
            this.selectedTriggers.add(triggerText);
            element.classList.remove('border-tesla-gray-700', 'bg-tesla-gray-800');
            element.classList.add('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
            if (icon) {
                icon.className = 'fas fa-check text-tesla-red transition-transform duration-200';
            }
        }

        this.updateTriggerDisplay();
        
        // Re-enable after a short delay
        setTimeout(() => {
            element.dataset.processing = 'false';
        }, 200);
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

    toggleCategory(categoryKey) {
        const categorySection = document.querySelector(`.category-triggers[data-category="${categoryKey}"]`);
        const toggleButton = document.querySelector(`.category-toggle[data-category="${categoryKey}"] i`);
        
        if (!categorySection || !toggleButton) return;
        
        const isCollapsed = categorySection.style.display === 'none';
        
        if (isCollapsed) {
            // Expand category
            categorySection.style.display = 'grid';
            toggleButton.className = 'fas fa-chevron-down';
            categorySection.style.animation = 'fadeIn 0.3s ease-out';
        } else {
            // Collapse category
            categorySection.style.display = 'none';
            toggleButton.className = 'fas fa-chevron-right';
        }
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
            
            // Prepare input data
            const inputData = {
                selectedTriggers: Array.from(this.selectedTriggers),
                tone: this.ui.toneSelect.value,
                demographics: {
                    age: document.getElementById('ageRange')?.value,
                    housingType: document.getElementById('housingType')?.value,
                    hasPV: document.getElementById('hasPV')?.value,
                    region: document.getElementById('region')?.value
                }
            };
            
            console.log('🔬 Sending analysis request:', inputData);

            // Call backend API for analysis
            const response = await fetch(`${this.apiBase}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputData: inputData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 Analysis result:', result);
            
            if (result.success) {
                this.currentAnalysis = result.analysis;
                this.currentCustomerId = result.customerId;
                
                console.log('📊 Analysis received:', this.currentAnalysis);
                console.log('🚀 Quick responses:', this.currentAnalysis.quick_responses);
                
                // Update analysis count
                this.analysisCount++;
                document.querySelector('#analysisCount span').textContent = this.analysisCount;
                
                // Display results
                this.displayResults(this.currentAnalysis);
                
            } else {
                throw new Error(result.error || 'Nieznany błąd');
            }
            
            this.showLoading(false);

        } catch (error) {
            console.error('Analysis failed:', error);
            this.showError('Błąd podczas analizy: ' + error.message);
            this.showLoading(false);
        }
    }

    displayResults(analysis) {
        // Show results section
        this.ui.analysisInterface.style.display = 'none';
        this.ui.resultsSection.style.display = 'block';
        this.ui.resultsSection.classList.remove('hidden');

        // Update conversion score
        this.ui.conversionScore.textContent = analysis.conversion_probability + '%';
        
        // Update progress bar
        this.ui.progressBar.style.width = analysis.conversion_probability + '%';

        // Update personality match
        this.ui.personalityMatch.textContent = analysis.personality.detected.confidence + '%';
        
        // Update other metrics
        this.ui.triggerIntensity.textContent = this.selectedTriggers.size > 3 ? 'High' : 'Medium';
        this.ui.toneCompatibility.textContent = 'Good';
        this.ui.confidenceLevel.textContent = Math.round((analysis.personality.detected.confidence + analysis.conversion_probability) / 2) + '%';

        // Populate strategy tab
        this.populateStrategyTab(analysis);
        
        // Show first tab
        this.switchTab('strategy');
    }

    populateStrategyTab(analysis) {
        const profileElement = document.getElementById('customerProfile');
        const strategyElement = document.getElementById('salesStrategy');
        
        if (profileElement) {
            profileElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg mb-4">
                    <h5 class="text-tesla-red font-semibold mb-2">Typ Osobowości DISC</h5>
                    <div class="text-2xl font-bold text-white mb-2">${analysis.personality.detected.DISC}</div>
                    <div class="text-sm text-tesla-gray-300 mb-3">${this.getPersonalityDescription(analysis.personality.detected.DISC)}</div>
                    <div class="text-xs text-tesla-gray-400">Pewność: ${analysis.personality.detected.confidence}%</div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h5 class="text-tesla-red font-semibold mb-2">Wybrane Triggery</h5>
                    <div class="space-y-1">
                        ${Array.from(this.selectedTriggers).map(trigger => 
                            `<div class="text-sm text-tesla-gray-300">• ${trigger}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        if (strategyElement) {
            strategyElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg mb-4">
                    <h5 class="text-tesla-red font-semibold mb-2">Strategia Sprzedażowa</h5>
                    <div class="text-sm text-tesla-gray-300 mb-3">${analysis.recommendations.strategy}</div>
                    <div class="space-y-2">
                        ${analysis.recommendations.key_messages.map(message => 
                            `<div class="text-sm text-white bg-tesla-gray-700 p-2 rounded">• ${message}</div>`
                        ).join('')}
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h5 class="text-tesla-red font-semibold mb-2">Szybkie Odpowiedzi</h5>
                    <div class="space-y-3">
                        ${(analysis.quick_responses || []).map(response => `
                            <div class="border-l-2 border-tesla-red pl-3">
                                <div class="text-xs text-tesla-gray-400 mb-1">${response.trigger}</div>
                                <div class="text-sm text-white">${response.immediate_reply}</div>
                                ${response.key_points ? `
                                    <div class="mt-2 space-y-1">
                                        ${response.key_points.map(point => 
                                            `<div class="text-xs text-tesla-gray-300">• ${point}</div>`
                                        ).join('')}
                                    </div>
                                ` : ''}
                                ${response.next_action ? `
                                    <div class="text-xs text-tesla-red mt-2 font-semibold">Następny krok: ${response.next_action}</div>
                                ` : ''}
                            </div>
                        `).join('')}
                        ${(!analysis.quick_responses || analysis.quick_responses.length === 0) ? 
                            `<div class="text-tesla-gray-400 text-sm">Brak szybkich odpowiedzi dla wybranych triggerów</div>` : ''
                        }
                    </div>
                </div>
            `;
        }

        // Populate other tabs
        this.populateLanguageTab(analysis);
        this.populateObjectionsTab(analysis);
        this.populateActionsTab(analysis);
        this.populateExplainabilityTab(analysis);
    }

    populateLanguageTab(analysis) {
        const keyWordsElement = document.getElementById('keyWords');
        const readyPhrasesElement = document.getElementById('readyPhrases');
        
        const discType = analysis.personality.detected.DISC;
        
        if (keyWordsElement) {
            const keywords = this.getKeywordsForPersonality(discType);
            keyWordsElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Słowa kluczowe dla ${discType}</h6>
                    <div class="flex flex-wrap gap-2">
                        ${keywords.map(keyword => 
                            `<span class="bg-tesla-red bg-opacity-20 text-tesla-red px-2 py-1 rounded text-sm">${keyword}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        if (readyPhrasesElement) {
            const phrases = this.getPhrasesForPersonality(discType);
            readyPhrasesElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Gotowe frazy</h6>
                    <div class="space-y-3">
                        ${phrases.map(phrase => 
                            `<div class="text-sm text-tesla-gray-300 bg-tesla-gray-700 p-3 rounded border-l-2 border-tesla-red">"${phrase}"</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
    }

    populateObjectionsTab(analysis) {
        const objectionsListElement = document.getElementById('objectionsList');
        
        if (objectionsListElement) {
            const objections = this.getCommonObjections();
            objectionsListElement.innerHTML = objections.map(objection => `
                <div class="bg-tesla-gray-800 p-6 rounded-lg border-l-4 border-orange-500">
                    <h6 class="text-tesla-red font-semibold mb-3">💬 "${objection.objection}"</h6>
                    <div class="space-y-3">
                        ${objection.rebuttals.map(rebuttal => `
                            <div class="bg-tesla-gray-700 p-4 rounded">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-xs bg-tesla-gray-600 px-2 py-1 rounded text-tesla-gray-300">${rebuttal.technique}</span>
                                    <span class="text-xs text-tesla-gray-400">Poziom ${rebuttal.level}</span>
                                </div>
                                <div class="text-sm text-white mb-2">${rebuttal.script}</div>
                                ${rebuttal.ethical_warning !== 'Brak.' ? 
                                    `<div class="text-xs text-yellow-400 bg-yellow-900 bg-opacity-20 p-2 rounded">⚠️ ${rebuttal.ethical_warning}</div>` 
                                    : ''
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    populateActionsTab(analysis) {
        const nextStepsElement = document.getElementById('nextSteps');
        const ethicalWarningsElement = document.getElementById('ethicalWarnings');
        
        if (nextStepsElement) {
            nextStepsElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Zalecane działania</h6>
                    <div class="space-y-3">
                        ${analysis.recommendations.next_steps.map((step, index) => 
                            `<div class="flex items-center text-sm text-tesla-gray-300">
                                <span class="bg-tesla-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">${index + 1}</span>
                                ${step}
                            </div>`
                        ).join('')}
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg mt-4">
                    <h6 class="text-tesla-red font-semibold mb-3">Timing</h6>
                    <div class="text-sm text-tesla-gray-300">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-clock text-tesla-red mr-2"></i>
                            Najlepszy moment na kontakt: następne 24-48h
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-phone text-tesla-red mr-2"></i>
                            Preferowany kanał: ${this.getPreferredChannel(analysis.personality.detected.DISC)}
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (ethicalWarningsElement) {
            ethicalWarningsElement.innerHTML = `
                <div class="bg-yellow-900 bg-opacity-20 border border-yellow-600 p-4 rounded-lg">
                    <h6 class="text-yellow-400 font-semibold mb-3">🛡️ Przypomnienia UOKiK</h6>
                    <div class="space-y-2 text-sm text-yellow-200">
                        <div>• Zawsze przedstaw wszystkie koszty z góry</div>
                        <div>• Nie wywieraj presji czasowej, jeśli nie jest uzasadniona</div>
                        <div>• Zapewnij pełną transparentność</div>
                        <div>• Szanuj prawo klienta do zastanowienia</div>
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg mt-4">
                    <h6 class="text-tesla-red font-semibold mb-3">Dostosowane podejście</h6>
                    <div class="text-sm text-tesla-gray-300">
                        ${this.getEthicalGuidanceForPersonality(analysis.personality.detected.DISC)}
                    </div>
                </div>
            `;
        }
    }

    populateExplainabilityTab(analysis) {
        const featureContributionsElement = document.getElementById('featureContributions');
        const marketFactorsElement = document.getElementById('marketFactors');
        const complianceInfoElement = document.getElementById('complianceInfo');
        
        if (featureContributionsElement) {
            featureContributionsElement.innerHTML = `
                <div class="space-y-3">
                    <div class="flex items-center justify-between bg-tesla-gray-800 p-3 rounded">
                        <span class="text-sm">Typ osobowości (${analysis.personality.detected.DISC})</span>
                        <span class="text-tesla-red font-semibold">+${analysis.personality.detected.confidence}%</span>
                    </div>
                    <div class="flex items-center justify-between bg-tesla-gray-800 p-3 rounded">
                        <span class="text-sm">Wybrane triggery (${this.selectedTriggers.size})</span>
                        <span class="text-green-400 font-semibold">+${Math.round(this.selectedTriggers.size * 5)}%</span>
                    </div>
                    <div class="flex items-center justify-between bg-tesla-gray-800 p-3 rounded">
                        <span class="text-sm">Ton rozmowy</span>
                        <span class="text-blue-400 font-semibold">+${this.getToneBonus(analysis.tone)}%</span>
                    </div>
                </div>
            `;
        }
        
        if (marketFactorsElement) {
            marketFactorsElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Czynniki rynkowe 2025</h6>
                    <div class="space-y-2 text-sm text-tesla-gray-300">
                        <div>🔌 Gęstość ładowarek: +15% vs 2024</div>
                        <div>💰 Dopłaty NaszEauto: do 18.750 zł</div>
                        <div>⚡ Ceny energii: stabilne</div>
                        <div>🏭 Konkurencja: wzrost o 23%</div>
                    </div>
                </div>
            `;
        }
        
        if (complianceInfoElement) {
            complianceInfoElement.innerHTML = `
                <div class="text-sm text-tesla-gray-300">
                    <div class="mb-4">
                        <h6 class="text-tesla-red font-semibold mb-2">AI Guard-Rails aktywne:</h6>
                        <div class="space-y-1">
                            <div class="flex items-center"><i class="fas fa-check text-green-400 mr-2"></i> Sprawdzanie zgodności UOKiK</div>
                            <div class="flex items-center"><i class="fas fa-check text-green-400 mr-2"></i> Monitoring etycznych granic</div>
                            <div class="flex items-center"><i class="fas fa-check text-green-400 mr-2"></i> Transparentność rekomendacji</div>
                        </div>
                    </div>
                    <div class="text-xs text-tesla-gray-400 border-t border-tesla-gray-700 pt-3">
                        System automatycznie monitoruje zgodność z regulacjami ochrony konsumentów
                        i zapewnia etyczne podejście do sprzedaży.
                    </div>
                </div>
            `;
        }
    }

    getPersonalityDescription(disc) {
        const descriptions = {
            'D': 'Dominujący - Decyzyjny, zorientowany na rezultaty, lubi kontrolę',
            'I': 'Wpływowy - Towarzyski, entuzjastyczny, lubi ludzi',
            'S': 'Stabilny - Spokojny, lojalny, lubi bezpieczeństwo',
            'C': 'Sumienność - Analityczny, dokładny, lubi fakty'
        };
        return descriptions[disc] || 'Profil mieszany';
    }

    getKeywordsForPersonality(disc) {
        const keywords = {
            'D': ["efektywność", "wynik", "przewaga", "lider", "innowacja", "moc", "kontrola"],
            'I': ["niesamowite", "rewolucja", "społeczność", "razem", "wyjątkowy", "inspiracja", "przyszłość"],
            'S': ["bezpieczeństwo", "gwarancja", "stabilność", "wsparcie", "rodzina", "zaufanie", "spokój"],
            'C': ["dane", "analiza", "dowód", "specyfikacja", "jakość", "precyzja", "weryfikacja"]
        };
        return keywords[disc] || keywords['S'];
    }

    getPhrasesForPersonality(disc) {
        const phrases = {
            'D': [
                "To rozwiązanie zapewni Panu/Pani przewagę konkurencyjną i maksymalny zwrot z inwestycji.",
                "Skupmy się na konkretnych wynikach: ten model gwarantuje najniższy koszt TCO w swojej klasie.",
                "Dzięki temu rozwiązaniu zdominuje Pan/Pani rynek i zostawi konkurencję w tyle.",
                "To jest narzędzie dla liderów, którzy cenią sobie efektywność i kontrolę nad procesem."
            ],
            'I': [
                "Proszę sobie wyobrazić, jakie wrażenie zrobi to na Pana/Pani znajomych i partnerach biznesowych!",
                "Dołączając do nas, staje się Pan/Pani częścią ekskluzywnej społeczności innowatorów.",
                "To nie tylko produkt, to inspiracja i nowy styl życia, który pokocha Pan/Pani od pierwszej chwili.",
                "Razem możemy zrewolucjonizować sposób, w jaki Pan/Pani prowadzi biznes."
            ],
            'S': [
                "Naszym priorytetem jest zapewnienie Panu/Pani pełnego bezpieczeństwa i spokoju na lata.",
                "Gwarantujemy stabilność tego rozwiązania i pełne wsparcie naszego zespołu na każdym etapie.",
                "To sprawdzona i niezawodna technologia, której zaufały już tysiące rodzin w Polsce.",
                "Może Pan/Pani na nas polegać, jesteśmy tu, aby pomóc i zapewnić najlepszą opiekę."
            ],
            'C': [
                "Pozwoli Pan/Pani, że przedstawię szczegółową analizę danych i konkretne dowody potwierdzające nasze tezy.",
                "Wszystkie nasze twierdzenia opieramy na weryfikowalnych danych i niezależnych testach.",
                "Rozumiem, że potrzebuje Pan/Pani precyzyjnych informacji. Oto pełna specyfikacja techniczna.",
                "Gwarantujemy najwyższą jakość i precyzję wykonania, co potwierdzają certyfikaty i audyty."
            ]
        };
        return phrases[disc] || phrases['S'];
    }

    getCommonObjections() {
        return [
            {
                objection: "Cena jest za wysoka / To jest za drogie.",
                rebuttals: [
                    {
                        level: 1,
                        pressure: "Niska",
                        technique: "Framing (TCO)",
                        script: "Rozumiem, że cena początkowa może wydawać się wysoka. Jednak proponuję spojrzeć na to jako na inwestycję w niższe koszty eksploatacji - dzięki oszczędnościom na paliwie i serwisie, ten samochód w perspektywie 5 lat może okazać się tańszy niż jego spalinowy odpowiednik.",
                        ethical_warning: "Brak. Technika oparta na edukacji finansowej."
                    },
                    {
                        level: 2,
                        pressure: "Średnia",
                        technique: "Dowód Społeczny + Pilność (oparta na faktach)",
                        script: "Wielu naszych klientów miało podobne odczucia, ale przekonali się po kalkulacji TCO. Warto też pamiętać, że program dopłat 'NaszEauto' ma ograniczony budżet i może zakończyć się wcześniej, co wpłynie na finalny koszt.",
                        ethical_warning: "Używaj ostrożnie, aby nie tworzyć fałszywej presji. Informuj o realnych terminach."
                    }
                ]
            },
            {
                objection: "Boję się o zasięg, zwłaszcza zimą.",
                rebuttals: [
                    {
                        level: 1,
                        pressure: "Niska", 
                        technique: "Edukacja i Zbijanie Obiekcji Faktami",
                        script: "To bardzo częsta obawa. Warto wiedzieć, że realny zasięg tego modelu zimą to wciąż ponad 350 km, a 95% codziennych podróży Polaków to dystanse poniżej 50 km. Czy Pana/Pani codzienne trasy są dłuższe?",
                        ethical_warning: "Brak. Technika oparta na rzetelnych danych."
                    }
                ]
            },
            {
                objection: "Nie mam gdzie ładować / Ładowanie jest kłopotliwe.",
                rebuttals: [
                    {
                        level: 1,
                        pressure: "Niska",
                        technique: "Edukacja i Segmentacja Rozwiązania", 
                        script: "Rozumiem, to kluczowa kwestia. Jeśli ma Pan/Pani dom, instalacja wallboxa rozwiązuje problem na zawsze, ładując auto jak telefon w nocy. Jeśli mieszka Pan/Pani w bloku, pokażę Panu/Pani mapę publicznych ładowarek w okolicy - jest ich więcej niż się wydaje.",
                        ethical_warning: "Brak."
                    }
                ]
            }
        ];
    }

    getPreferredChannel(disc) {
        const channels = {
            'D': 'Telefon (krótko i konkretnie)',
            'I': 'Spotkanie osobiste (demo)',
            'S': 'Email z szczegółami',
            'C': 'Prezentacja danych (online)'
        };
        return channels[disc] || 'Email z szczegółami';
    }

    getEthicalGuidanceForPersonality(disc) {
        const guidance = {
            'D': 'Typ D ceni bezpośredniość - bądź szczery w komunikacji, nie owijaj w bawełnę. Przedstaw fakty i daj czas na przemyślenie.',
            'I': 'Typ I lubi energię - bądź entuzjastyczny, ale nie naciskaj. Pozwól na naturalne tempo podejmowania decyzji.',
            'S': 'Typ S potrzebuje bezpieczeństwa - zapewnij pełne informacje, gwarancje i nie wywieraj presji czasowej.',
            'C': 'Typ C wymaga danych - przedstaw wszystkie szczegóły, porównania i daj czas na analizę informacji.'
        };
        return guidance[disc] || guidance['S'];
    }

    getToneBonus(tone) {
        const bonuses = {
            'entuzjastyczny': 10,
            'neutralny': 5,
            'sceptyczny': -5,
            'negatywny': -15
        };
        return bonuses[tone] || 0;
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(tabName + 'Tab');
        if (targetTab) {
            targetTab.classList.remove('hidden');
        }
        
        // Add active class to clicked button
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    resetToStart() {
        this.ui.resultsSection.style.display = 'none';
        this.ui.analysisInterface.style.display = 'none';
        this.ui.welcomeScreen.style.display = 'block';
        this.selectedTriggers.clear();
        this.updateTriggerDisplay();
        
        // Reset trigger buttons
        document.querySelectorAll('.trigger-btn').forEach(btn => {
            btn.classList.remove('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
            btn.classList.add('border-tesla-gray-700', 'bg-tesla-gray-800');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-plus text-tesla-gray-400 transition-transform duration-200';
            }
        });
    }

    showLoading(show, message = 'Ładowanie...') {
        if (show) {
            this.ui.loadingOverlay.style.display = 'flex';
            this.ui.loadingOverlay.classList.remove('hidden');
            if (message) {
                const messageEl = this.ui.loadingOverlay.querySelector('p');
                if (messageEl) messageEl.textContent = message;
            }
        } else {
            this.ui.loadingOverlay.style.display = 'none';
            this.ui.loadingOverlay.classList.add('hidden');
        }
    }

    showError(message) {
        alert('Błąd: ' + message);
    }

    exportAnalysisReport() {
        if (!this.currentAnalysis) {
            this.showError('Brak analizy do eksportu');
            return;
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            analysis: this.currentAnalysis,
            selectedTriggers: Array.from(this.selectedTriggers)
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tesla-customer-analysis-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 Starting Tesla Customer Decoder SHU PRO...');
    window.app = new TeslaCusomerDecoderApp();
});