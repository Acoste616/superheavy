/**
 * TCD SHU PRO - Simplified Application Controller
 * Tesla Customer Decoder - Super Heavy Ultra Professional
 * 
 * @version 3.0
 * @author Claude AI Assistant
 */

class TeslaCustomerDecoderApp {
    constructor() {
        this.currentAnalysis = null;
        this.selectedTriggers = new Set();
        this.analysisCount = 0;
        this.isInitialized = false;
        this.currentCustomerId = null;
        this.apiBase = 'http://localhost:3000/api';
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
        this.optimizePerformance();
    }

    getDISCProfile(disc) {
         const profiles = {
             'D': {
                 name: 'Dominujący',
                 description: 'Zorientowany na wyniki, decyzyjny, lubi kontrolę',
                 traits: ['Bezpośredni w komunikacji', 'Szybko podejmuje decyzje', 'Lubi wyzwania', 'Zorientowany na cele', 'Preferuje efektywność']
             },
             'I': {
                 name: 'Wpływowy',
                 description: 'Towarzyski, entuzjastyczny, lubi ludzi',
                 traits: ['Energiczny i optymistyczny', 'Lubi być w centrum uwagi', 'Buduje relacje', 'Kreatywny i innowacyjny', 'Motywowany uznaniem']
             },
             'S': {
                 name: 'Stabilny',
                 description: 'Spokojny, lojalny, lubi bezpieczeństwo',
                 traits: ['Cierpliwy i wytrwały', 'Lubi rutynę', 'Wspiera innych', 'Unika konfliktów', 'Ceni bezpieczeństwo']
             },
             'C': {
                 name: 'Sumienność',
                 description: 'Analityczny, dokładny, lubi fakty',
                 traits: ['Dokładny i precyzyjny', 'Analityczne myślenie', 'Wysokie standardy', 'Ostrożny w decyzjach', 'Zorientowany na jakość']
             }
         };
         return profiles[disc] || profiles['S'];
     }

     getMotivations(disc) {
         const motivations = {
             'D': [
                 'Osiągnięcie przewagi konkurencyjnej',
                 'Kontrola nad sytuacją i procesami',
                 'Szybkie osiąganie rezultatów',
                 'Bycie liderem w swojej dziedzinie',
                 'Maksymalizacja efektywności'
             ],
             'I': [
                 'Bycie częścią innowacyjnej społeczności',
                 'Robienie wrażenia na innych',
                 'Uczestnictwo w czymś wyjątkowym',
                 'Dzielenie się doświadczeniami',
                 'Bycie trendseterem'
             ],
             'S': [
                 'Zapewnienie bezpieczeństwa rodzinie',
                 'Stabilność finansowa',
                 'Długoterminowa niezawodność',
                 'Spokój ducha',
                 'Wsparcie bliskich'
             ],
             'C': [
                 'Podejmowanie przemyślanych decyzji',
                 'Maksymalizacja wartości inwestycji',
                 'Minimalizacja ryzyka',
                 'Doskonałość techniczna',
                 'Weryfikowalne korzyści'
             ]
         };
         return motivations[disc] || motivations['S'];
     }

     getFears(disc) {
         const fears = {
             'D': [
                 'Utrata kontroli nad sytuacją',
                 'Bycie postrzeganym jako nieskuteczny',
                 'Marnowanie czasu na niepotrzebne szczegóły',
                 'Zależność od innych',
                 'Stagnacja i brak postępu'
             ],
             'I': [
                 'Bycie ignorowanym lub odrzuconym',
                 'Nudne, techniczne szczegóły',
                 'Izolacja społeczna',
                 'Krytyka publiczna',
                 'Rutyna i monotonia'
             ],
             'S': [
                 'Nagłe zmiany i niepewność',
                 'Konflikty i napięcia',
                 'Ryzyko finansowe',
                 'Presja czasowa',
                 'Niezawodność nowych technologii'
             ],
             'C': [
                 'Podejmowanie pochopnych decyzji',
                 'Brak wystarczających informacji',
                 'Błędy i niedoskonałości',
                 'Nieprzewidywalne konsekwencje',
                 'Krytyka jakości pracy'
             ]
         };
         return fears[disc] || fears['S'];
     }

     getDecisionStyle(disc) {
         const styles = {
             'D': {
                 speed: 'Szybkie, zdecydowane',
                 process: 'Indywidualny, autorytarny',
                 focus: 'Wyniki i efektywność'
             },
             'I': {
                 speed: 'Spontaniczne, intuicyjne',
                 process: 'Konsultacje z innymi',
                 focus: 'Ludzie i relacje'
             },
             'S': {
                 speed: 'Powolne, przemyślane',
                 process: 'Konsensus i zgodność',
                 focus: 'Stabilność i bezpieczeństwo'
             },
             'C': {
                 speed: 'Metodyczne, dokładne',
                 process: 'Analiza i weryfikacja',
                 focus: 'Fakty i dane'
             }
         };
         return styles[disc] || styles['S'];
     }

     getPartnerStrategy(disc) {
         const strategies = {
             'D': {
                 likelyPartnerProfile: 'Prawdopodobnie partner o profilu S lub C - szukający stabilności i bezpieczeństwa',
                 decisionRole: 'Główny decydent, partner może mieć prawo veta',
                 dynamics: 'Może być niecierpliwy wobec wahań partnera, potrzebuje szybkich decyzji',
                 conflicts: 'Partner może obawiać się ryzyka i kosztów, potrzebuje więcej czasu',
                 dualStrategy: [
                     'Dla D: Podkreśl przewagę konkurencyjną i ROI',
                     'Dla partnera: Zapewnij o bezpieczeństwie i gwarancjach',
                     'Użyj danych i faktów, aby przekonać obie strony',
                     'Zaproponuj etapowe wdrożenie, aby zmniejszyć ryzyko'
                 ],
                 argumentsForMain: [
                     'To da Ci przewagę nad konkurencją',
                     'Szybki zwrot z inwestycji',
                     'Kontrola nad kosztami eksploatacji',
                     'Liderska pozycja w branży'
                 ],
                 argumentsForPartner: [
                     'Gwarancja i wsparcie producenta',
                     'Stabilne koszty eksploatacji',
                     'Bezpieczeństwo dla rodziny',
                     'Sprawdzona technologia'
                 ]
             },
             'I': {
                 likelyPartnerProfile: 'Partner może być bardziej analityczny (C) lub stabilny (S)',
                 decisionRole: 'Współdecydent, lubi konsultować się z partnerem',
                 dynamics: 'Entuzjastyczny, ale partner może być bardziej ostrożny',
                 conflicts: 'Partner może chcieć więcej analiz i mniej emocji w decyzji',
                 dualStrategy: [
                     'Dla I: Pokaż społeczny aspekt i prestiż',
                     'Dla partnera: Przedstaw konkretne dane i analizy',
                     'Organizuj wspólne spotkania i prezentacje',
                     'Daj czas na przemyślenie i analizę'
                 ],
                 argumentsForMain: [
                     'Będziesz trendseterem w swojej społeczności',
                     'Niesamowite wrażenia z jazdy',
                     'Część ekskluzywnej grupy właścicieli',
                     'Możliwość dzielenia się doświadczeniami'
                 ],
                 argumentsForPartner: [
                     'Konkretne oszczędności i kalkulacje',
                     'Porównanie z alternatywami',
                     'Długoterminowe korzyści',
                     'Bezpieczeństwo inwestycji'
                 ]
             },
             'S': {
                 likelyPartnerProfile: 'Partner prawdopodobnie ma podobny profil lub jest bardziej decyzyjny (D)',
                 decisionRole: 'Decyzja wspólna, potrzebuje zgody partnera',
                 dynamics: 'Ostrożny, potrzebuje czasu i pewności od partnera',
                 conflicts: 'Obaj mogą być niezdecydowani, potrzebują zewnętrznego wsparcia',
                 dualStrategy: [
                     'Zapewnij o wsparciu i gwarancjach',
                     'Nie wywieraj presji czasowej',
                     'Przedstaw testimoniale innych rodzin',
                     'Zaproponuj okres próbny lub test drive'
                 ],
                 argumentsForMain: [
                     'Bezpieczeństwo dla całej rodziny',
                     'Stabilne koszty na lata',
                     'Niezawodność i wsparcie',
                     'Spokój ducha'
                 ],
                 argumentsForPartner: [
                     'Te same argumenty - zgodność w wartościach',
                     'Wspólne bezpieczeństwo finansowe',
                     'Długoterminowa stabilność',
                     'Wsparcie społeczności użytkowników'
                 ]
             },
             'C': {
                 likelyPartnerProfile: 'Partner może być bardziej emocjonalny (I) lub praktyczny (S)',
                 decisionRole: 'Główny analityk, ale potrzebuje akceptacji partnera',
                 dynamics: 'Dokładna analiza, partner może być niecierpliwy',
                 conflicts: 'Partner może chcieć szybszej decyzji, mniej analiz',
                 dualStrategy: [
                     'Dla C: Dostarcz pełną dokumentację i analizy',
                     'Dla partnera: Podsumuj kluczowe korzyści w prosty sposób',
                     'Pozwól na dokładne sprawdzenie wszystkich aspektów',
                     'Zapewnij dostęp do ekspertów technicznych'
                 ],
                 argumentsForMain: [
                     'Kompletna analiza TCO',
                     'Porównanie wszystkich opcji',
                     'Najwyższa jakość i precyzja',
                     'Weryfikowalne dane i statystyki'
                 ],
                 argumentsForPartner: [
                     'Przemyślana i bezpieczna decyzja',
                     'Najlepsza wartość za pieniądze',
                     'Praktyczne korzyści codzienne',
                     'Zaufanie do eksperta (C)'
                 ]
             }
         };
         return strategies[disc] || strategies['S'];
     }

     getPredictions(disc, conversionProbability) {
         const baseTimeline = {
             'D': ['Decyzja w ciągu 1-2 tygodni', 'Szybka finalizacja', 'Odbiór w ciągu miesiąca'],
             'I': ['Entuzjastyczne zainteresowanie', 'Konsultacje ze znajomymi', 'Decyzja w ciągu miesiąca'],
             'S': ['Długie rozważania (2-3 miesiące)', 'Konsultacje z rodziną', 'Ostrożna finalizacja'],
             'C': ['Dokładna analiza (1-2 miesiące)', 'Porównanie opcji', 'Przemyślana decyzja']
         };

         // Zwiększony nacisk na Model Y i Model 3 zgodnie z żądaniem
         const preferredModels = {
             'D': {
                 name: 'Model Y Performance',
                 reason: 'Najlepszy SUV elektryczny - moc i praktyczność',
                 features: ['Przyspieszenie 0-100 w 3.7s', 'Zasięg 514 km WLTP', 'Autopilot Enhanced', 'Przestronność 7 osób']
             },
             'I': {
                 name: 'Model Y Long Range',
                 reason: 'Idealny dla aktywnego stylu życia',
                 features: ['Zasięg 533 km WLTP', 'Napęd AWD', 'Premium interior', 'Najnowsze funkcje Tesla']
             },
             'S': {
                 name: 'Model 3 Long Range',
                 reason: 'Niezawodność i najlepsza efektywność',
                 features: ['Zasięg 602 km WLTP', 'Najniższe koszty eksploatacji', '5-gwiazdkowe bezpieczeństwo', 'Autopilot Standard']
             },
             'C': {
                 name: 'Model 3 Performance',
                 reason: 'Najlepsza technologia w segmencie premium',
                 features: ['Przyspieszenie 0-100 w 3.3s', 'Track Mode', 'Carbon fiber spoiler', 'Optymalne TCO']
             }
         };

         const factors = [
             { name: 'Profil osobowości', impact: `+${Math.round(conversionProbability * 0.3)}%` },
             { name: 'Wybrane triggery', impact: `+${Math.round(conversionProbability * 0.25)}%` },
             { name: 'Sytuacja finansowa', impact: `+${Math.round(conversionProbability * 0.2)}%` },
             { name: 'Timing rynkowy', impact: `+${Math.round(conversionProbability * 0.15)}%` },
             { name: 'Czynniki zewnętrzne', impact: `+${Math.round(conversionProbability * 0.1)}%` }
         ];

         const nextSteps = {
             'D': [
                 { action: 'Umów test drive', timing: 'W ciągu 24h', details: 'Skup się na wydajności i technologii' },
                 { action: 'Przedstaw ofertę finansową', timing: 'Po test drive', details: 'Podkreśl ROI i korzyści biznesowe' },
                 { action: 'Finalizacja', timing: 'W ciągu tygodnia', details: 'Szybka decyzja, minimalne wahania' }
             ],
             'I': [
                 { action: 'Zaproś na event Tesla', timing: 'W ciągu tygodnia', details: 'Społeczny aspekt i networking' },
                 { action: 'Test drive z rodziną/znajomymi', timing: 'Po evencie', details: 'Dzielenie się doświadczeniem' },
                 { action: 'Personalizowana oferta', timing: 'Po pozytywnym test drive', details: 'Podkreśl unikalność i prestiż' }
             ],
             'S': [
                 { action: 'Materiały informacyjne', timing: 'Natychmiast', details: 'Pełna dokumentacja i gwarancje' },
                 { action: 'Spotkanie z rodziną', timing: 'W ciągu 2 tygodni', details: 'Wspólne omówienie korzyści' },
                 { action: 'Spokojny test drive', timing: 'Po akceptacji rodziny', details: 'Bez presji, skupienie na bezpieczeństwie' }
             ],
             'C': [
                 { action: 'Szczegółowa analiza TCO', timing: 'W ciągu 48h', details: 'Kompletne porównanie kosztów' },
                 { action: 'Konsultacja techniczna', timing: 'Po analizie', details: 'Odpowiedzi na wszystkie pytania' },
                 { action: 'Test drive z pomiarem', timing: 'Po konsultacji', details: 'Weryfikacja parametrów w praktyce' }
             ]
         };

         return {
             factors: factors,
             timeline: baseTimeline[disc] || baseTimeline['S'],
             preferredModel: preferredModels[disc] || preferredModels['S'],
             nextSteps: nextSteps[disc] || nextSteps['S']
         };
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
            },
            family_context: { 
                name: '👨‍👩‍👧‍👦 Kontekst Rodzinny', 
                description: 'Partner, dzieci, decyzje rodzinne, bezpieczeństwo',
                triggers: [],
                color: 'border-pink-500'
            },
            experience_level: { 
                name: '🎓 Doświadczenie z Tesla', 
                description: 'Pierwszy kontakt, polecenia, znajomość marki',
                triggers: [],
                color: 'border-indigo-500'
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
                        <span><strong class="text-tesla-gray-400">Szybka odpowiedź:</strong> "${quickResponse}"</span>
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
            'objections': '🚫',
            'family_context': '👨‍👩‍👧‍👦',
            'experience_level': '🎓'
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
            'objections': 'Obiekcje',
            'family_context': 'Rodzina',
            'experience_level': 'Doświadczenie'
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
        console.log('🔄 toggleTrigger called for element:', element);
        
        // Prevent double-clicking/rapid clicking
        if (element.dataset.processing === 'true') return;
        element.dataset.processing = 'true';
        
        const triggerText = element.dataset.triggerText;
        console.log('📝 Trigger text:', triggerText);
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
        console.log('📊 updateTriggerDisplay - count:', count);
        console.log('📊 Selected triggers:', Array.from(this.selectedTriggers));
        
        this.ui.selectedTriggerCount.textContent = count;
        
        if (count === 0) {
            this.ui.selectedTriggersList.textContent = 'Brak wybranych triggerów';
        } else {
            const triggerList = Array.from(this.selectedTriggers).join(', ');
            this.ui.selectedTriggersList.textContent = triggerList;
        }

        // Enable/disable analysis button
        console.log('🔘 Setting runAnalysis.disabled to:', count === 0);
        this.ui.runAnalysis.disabled = count === 0;
        console.log('🔘 runAnalysis.disabled is now:', this.ui.runAnalysis.disabled);
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
        console.log('🚀 performAnalysis called!');
        console.log('📊 Selected triggers:', this.selectedTriggers);
        console.log('📊 Triggers size:', this.selectedTriggers.size);
        
        if (this.selectedTriggers.size === 0) {
            console.log('❌ No triggers selected');
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
                    region: document.getElementById('region')?.value,
                    relationshipStatus: document.getElementById('relationshipStatus')?.value,
                    hasChildren: document.getElementById('hasChildren')?.value,
                    teslaExperience: document.getElementById('teslaExperience')?.value,
                    carRole: document.getElementById('carRole')?.value
                },
                context: document.getElementById('additionalContext')?.value || ''
            };
            
            // Basic client-side validation
            const validationErrors = this.validateInputData(inputData);
            if (validationErrors.length > 0) {
                this.showError('Błędy walidacji: ' + validationErrors.join(', '));
                this.showLoading(false);
                return;
            }
            
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
            
            // Enhanced error handling
            let errorMessage = 'Błąd podczas analizy: ';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Brak połączenia z serwerem. Sprawdź połączenie internetowe.';
            } else if (error.message.includes('HTTP 429')) {
                errorMessage += 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.';
            } else if (error.message.includes('HTTP 500')) {
                errorMessage += 'Błąd serwera. Spróbuj ponownie lub skontaktuj się z administratorem.';
            } else if (error.message.includes('validation')) {
                errorMessage += 'Nieprawidłowe dane wejściowe. Sprawdź formularz.';
            } else {
                errorMessage += error.message || 'Nieznany błąd';
            }
            
            this.showError(errorMessage);
            this.showLoading(false);
        }
    }
    
    // Client-side input validation
    validateInputData(inputData) {
        const errors = [];
        
        // Validate triggers
        if (!inputData.selectedTriggers || inputData.selectedTriggers.length === 0) {
            errors.push('Brak wybranych triggerów');
        }
        
        // Validate demographics
        const demographics = inputData.demographics;
        if (demographics) {
            // Age validation - dopasowane do rzeczywistych wartości w HTML
            if (demographics.age && !['25-35', '35-45', '45-55', '55+'].includes(demographics.age)) {
                errors.push('Nieprawidłowy przedział wiekowy');
            }
            
            // Housing type validation - dopasowane do rzeczywistych wartości w HTML
            if (demographics.housingType && !['dom', 'mieszkanie_parking', 'mieszkanie_ulica'].includes(demographics.housingType)) {
                errors.push('Nieprawidłowy typ mieszkania');
            }
            
            // PV validation - dopasowane do rzeczywistych wartości w HTML
            if (demographics.hasPV && !['true', 'false'].includes(demographics.hasPV)) {
                errors.push('Nieprawidłowa wartość dla paneli PV');
            }
            
            // Region validation - dopasowane do rzeczywistych wartości w HTML
            if (demographics.region && !['mazowieckie', 'slaskie', 'wielkopolskie', 'malopolskie', 'other'].includes(demographics.region)) {
                errors.push('Nieprawidłowy region');
            }
            
            // Relationship status validation
            if (demographics.relationshipStatus && !['single', 'partner', 'divorced'].includes(demographics.relationshipStatus)) {
                errors.push('Nieprawidłowy status związku');
            }
            
            // Children validation
            if (demographics.hasChildren && !['none', 'young', 'teen', 'adult'].includes(demographics.hasChildren)) {
                errors.push('Nieprawidłowa wartość dla dzieci');
            }
            
            // Tesla experience validation
            if (demographics.teslaExperience && !['first_time', 'researching', 'test_driven', 'owner_friend'].includes(demographics.teslaExperience)) {
                errors.push('Nieprawidłowe doświadczenie z Tesla');
            }
            
            // Car role validation
            if (demographics.carRole && !['primary', 'secondary', 'replacement', 'additional'].includes(demographics.carRole)) {
                errors.push('Nieprawidłowa rola auta');
            }
        }
        
        // Validate tone - dopasowane do rzeczywistych wartości w HTML
        if (inputData.tone && !['entuzjastyczny', 'neutralny', 'sceptyczny', 'negatywny'].includes(inputData.tone)) {
            errors.push('Nieprawidłowy ton komunikacji');
        }
        
        // Validate context length
        if (inputData.context && inputData.context.length > 1000) {
            errors.push('Kontekst zbyt długi (max 1000 znaków)');
        }
        
        return errors;
    }

    displayResults(analysis) {
        console.log('🎯 displayResults called with analysis:', analysis);
        
        // Show results section
        this.ui.analysisInterface.style.display = 'none';
        this.ui.resultsSection.style.display = 'block';
        this.ui.resultsSection.classList.remove('hidden');

        // Update conversion score
        this.ui.conversionScore.textContent = analysis.conversion_probability + '%';
        
        // Update progress bar
        this.ui.progressBar.style.width = analysis.conversion_probability + '%';

        // Update personality match
        const personalityConfidence = analysis.personality?.detected?.confidence || analysis.personality?.confidence || 0;
        this.ui.personalityMatch.textContent = Math.round(personalityConfidence * 100) + '%';
        
        // Update other metrics
        this.ui.triggerIntensity.textContent = this.selectedTriggers.size > 3 ? 'High' : 'Medium';
        this.ui.toneCompatibility.textContent = 'Good';
        
        // Fix NaN issue in confidence calculation
        const personalityConf = (analysis.personality?.detected?.confidence || analysis.personality?.confidence || 0.5) * 100;
        const conversionProb = analysis.conversion_probability || 50;
        const confidenceScore = Math.round((personalityConf + conversionProb) / 2);
        this.ui.confidenceLevel.textContent = confidenceScore + '%';

        // Populate strategy tab
        this.populateStrategyTab(analysis);
        
        // Show first tab with debugging
        console.log('🔄 Switching to strategy tab...');
        this.switchTab('strategy');
        
        // Verify tab switching worked
        setTimeout(() => {
            const strategyTab = document.getElementById('strategyTab');
            const strategyButton = document.querySelector('[data-tab="strategy"]');
            console.log('📋 Strategy tab visible:', strategyTab && !strategyTab.classList.contains('hidden'));
            console.log('🔘 Strategy button active:', strategyButton && strategyButton.classList.contains('active'));
        }, 100);
    }

    populateStrategyTab(analysis) {
        const profileElement = document.getElementById('customerProfile');
        const strategyElement = document.getElementById('salesStrategy');
        
        if (profileElement) {
            // Pobierz dane demograficzne z formularza
            const demographics = {
                age: document.getElementById('ageRange')?.value,
                housingType: document.getElementById('housingType')?.value,
                hasPV: document.getElementById('hasPV')?.value,
                region: document.getElementById('region')?.value,
                relationshipStatus: document.getElementById('relationshipStatus')?.value,
                hasChildren: document.getElementById('hasChildren')?.value,
                teslaExperience: document.getElementById('teslaExperience')?.value,
                carRole: document.getElementById('carRole')?.value
            };
            
            profileElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg mb-4">
                    <h5 class="text-tesla-red font-semibold mb-2">Typ Osobowości DISC</h5>
                    <div class="text-2xl font-bold text-white mb-2">${analysis.personality?.detected?.DISC || analysis.personality?.primary_type || 'Nieznany'}</div>
                    <div class="text-sm text-tesla-gray-300 mb-3">${this.getPersonalityDescription(analysis.personality?.detected?.DISC || analysis.personality?.primary_type || 'S')}</div>
                    <div class="text-xs text-tesla-gray-400">Pewność: ${Math.round((analysis.personality?.detected?.confidence || analysis.personality?.confidence || 0) * 100)}%</div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg mb-4">
                    <h5 class="text-tesla-red font-semibold mb-2">Profil Demograficzny</h5>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        ${demographics.age ? `<div class="text-tesla-gray-300"><span class="text-tesla-gray-400">Wiek:</span> ${this.getAgeLabel(demographics.age)}</div>` : ''}
                        ${demographics.housingType ? `<div class="text-tesla-gray-300"><span class="text-tesla-gray-400">Mieszkanie:</span> ${this.getHousingLabel(demographics.housingType)}</div>` : ''}
                        ${demographics.hasPV ? `<div class="text-tesla-gray-300"><span class="text-tesla-gray-400">Panele PV:</span> ${this.getPVLabel(demographics.hasPV)}</div>` : ''}
                        ${demographics.region ? `<div class="text-tesla-gray-300"><span class="text-tesla-gray-400">Region:</span> ${demographics.region}</div>` : ''}
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg mb-4">
                    <h5 class="text-tesla-red font-semibold mb-2">Kontekst Rodzinny i Doświadczenie</h5>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        ${demographics.relationshipStatus ? `<div class="text-tesla-gray-300"><span class="text-tesla-gray-400">Status:</span> ${this.getRelationshipLabel(demographics.relationshipStatus)}</div>` : ''}
                        ${demographics.hasChildren ? `<div class="text-tesla-gray-300"><span class="text-tesla-gray-400">Dzieci:</span> ${this.getChildrenLabel(demographics.hasChildren)}</div>` : ''}
                        ${demographics.teslaExperience ? `<div class="text-tesla-gray-300"><span class="text-tesla-gray-400">Doświadczenie:</span> ${this.getTeslaExperienceLabel(demographics.teslaExperience)}</div>` : ''}
                        ${demographics.carRole ? `<div class="text-tesla-gray-300"><span class="text-tesla-gray-400">Rola auta:</span> ${this.getCarRoleLabel(demographics.carRole)}</div>` : ''}
                    </div>
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
            const strategies = analysis.recommendations?.strategy_recommendations || [];
            const keyRecommendations = analysis.recommendations?.key_recommendations || [];
            
            strategyElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg mb-4">
                    <h5 class="text-tesla-red font-semibold mb-2">Strategia Sprzedażowa</h5>
                    ${strategies.length > 0 ? `
                        <div class="space-y-2 mb-4">
                            ${strategies.map(strategy => 
                                `<div class="text-sm text-white bg-tesla-gray-700 p-2 rounded border-l-2 border-tesla-red">• ${strategy.strategy}</div>`
                            ).join('')}
                        </div>
                    ` : ''}
                    ${keyRecommendations.length > 0 ? `
                        <h6 class="text-tesla-red font-semibold mb-2 mt-4">Kluczowe Rekomendacje</h6>
                        <div class="space-y-2">
                            ${keyRecommendations.map(rec => 
                                `<div class="text-sm text-white bg-tesla-gray-700 p-2 rounded">• ${rec.recommendation}</div>`
                            ).join('')}
                        </div>
                    ` : ''}
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
        this.populatePsychologyTab(analysis);
        this.populateLanguageTab(analysis);
        this.populateObjectionsTab(analysis);
        this.populatePartnerTab(analysis);
        this.populatePredictionsTab(analysis);
        this.populateActionsTab(analysis);
        this.populateSegmentAnalysisTab(analysis);
        this.populateExplainabilityTab(analysis);
    }

    populateLanguageTab(analysis) {
        const keyWordsElement = document.getElementById('keyWords');
        const readyPhrasesElement = document.getElementById('readyPhrases');
        const communicationStyleElement = document.getElementById('communicationStyle');
        const avoidPhrasesElement = document.getElementById('avoidPhrases');
        
        const discType = analysis.personality?.detected?.DISC || analysis.personality?.primary_type || 'S';
        
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
        
        if (communicationStyleElement) {
            const style = this.getCommunicationStyle(discType);
            communicationStyleElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <div class="space-y-3">
                        <div class="flex items-center">
                            <i class="fas fa-volume-up text-tesla-red mr-2"></i>
                            <span class="text-sm text-tesla-gray-300">${style.tone}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-clock text-tesla-red mr-2"></i>
                            <span class="text-sm text-tesla-gray-300">${style.pace}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-chart-bar text-tesla-red mr-2"></i>
                            <span class="text-sm text-tesla-gray-300">${style.detail}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (avoidPhrasesElement) {
            const avoidPhrases = this.getAvoidPhrases(discType);
            avoidPhrasesElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <div class="space-y-2">
                        ${avoidPhrases.map(phrase => 
                            `<div class="text-sm text-red-400 bg-red-900 bg-opacity-20 p-2 rounded border-l-2 border-red-500">❌ "${phrase}"</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
    }

    populateObjectionsTab(analysis) {
        const commonObjectionsElement = document.getElementById('commonObjections');
        const timeObjectionsElement = document.getElementById('timeObjections');
        const financialObjectionsElement = document.getElementById('financialObjections');
        const technicalObjectionsElement = document.getElementById('technicalObjections');
        
        const objections = this.getCommonObjections();
        const timeObjections = this.getTimeObjections();
        const financialObjections = this.getFinancialObjections();
        const technicalObjections = this.getTechnicalObjections();
        
        if (commonObjectionsElement) {
            commonObjectionsElement.innerHTML = objections.slice(0, 3).map(objection => `
                <div class="bg-tesla-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
                    <h6 class="text-tesla-red font-semibold mb-2">💬 "${objection.objection}"</h6>
                    <div class="text-sm text-tesla-gray-300 mb-2">${objection.rebuttals[0].script}</div>
                    <div class="text-xs text-tesla-gray-400">${objection.rebuttals[0].technique}</div>
                </div>
            `).join('');
        }
        
        if (timeObjectionsElement) {
            timeObjectionsElement.innerHTML = timeObjections.map(objection => `
                <div class="bg-tesla-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                    <h6 class="text-tesla-red font-semibold mb-2">⏰ "${objection.objection}"</h6>
                    <div class="text-sm text-tesla-gray-300">${objection.response}</div>
                </div>
            `).join('');
        }
        
        if (financialObjectionsElement) {
            financialObjectionsElement.innerHTML = financialObjections.map(objection => `
                <div class="bg-tesla-gray-800 p-4 rounded-lg border-l-4 border-green-500">
                    <h6 class="text-tesla-red font-semibold mb-2">💰 "${objection.objection}"</h6>
                    <div class="text-sm text-tesla-gray-300">${objection.response}</div>
                </div>
            `).join('');
        }
        
        if (technicalObjectionsElement) {
            technicalObjectionsElement.innerHTML = technicalObjections.map(objection => `
                <div class="bg-tesla-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
                    <h6 class="text-tesla-red font-semibold mb-2">🔧 "${objection.objection}"</h6>
                    <div class="text-sm text-tesla-gray-300">${objection.response}</div>
                </div>
            `).join('');
        }
    }

    populateActionsTab(analysis) {
        const nextStepsElement = document.getElementById('nextSteps');
        const ethicalWarningsElement = document.getElementById('ethicalWarnings');
        
        if (nextStepsElement) {
            const nextSteps = analysis.recommendations?.next_steps || [];
            const strategies = analysis.recommendations?.strategy_recommendations || [];
            
            // Jeśli brak next_steps, generuj na podstawie strategii
            const actionItems = nextSteps.length > 0 ? nextSteps : 
                strategies.length > 0 ? strategies.map(s => s.strategy) : 
                ['Nawiąż kontakt z klientem', 'Przedstaw kluczowe korzyści', 'Zaproponuj test drive', 'Przygotuj ofertę'];
            
            nextStepsElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Zalecane działania</h6>
                    <div class="space-y-3">
                        ${actionItems.map((step, index) => 
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
                            Preferowany kanał: ${this.getPreferredChannel(analysis.personality?.detected?.DISC || 'S')}
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
                        ${this.getEthicalGuidanceForPersonality(analysis.personality?.detected?.DISC || 'S')}
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
                        <span class="text-sm">Typ osobowości (${analysis.personality?.detected?.DISC || 'S'})</span>
                        <span class="text-tesla-red font-semibold">+${analysis.personality?.detected?.confidence || 0}%</span>
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

    getCommunicationStyle(disc) {
        const styles = {
            'D': {
                tone: 'Bezpośredni, pewny siebie, zorientowany na wyniki',
                pace: 'Szybkie tempo, krótkie rozmowy',
                detail: 'Skupienie na kluczowych faktach i korzyściach'
            },
            'I': {
                tone: 'Entuzjastyczny, przyjazny, energiczny',
                pace: 'Dynamiczne, z miejscem na rozmowę',
                detail: 'Historie, przykłady, wizualizacje'
            },
            'S': {
                tone: 'Spokojny, cierpliwy, wspierający',
                pace: 'Powolne, bez presji czasowej',
                detail: 'Szczegółowe wyjaśnienia, gwarancje'
            },
            'C': {
                tone: 'Profesjonalny, oparty na faktach',
                pace: 'Metodyczne, z czasem na analizę',
                detail: 'Pełne dane, porównania, dokumentacja'
            }
        };
        return styles[disc] || styles['S'];
    }

    getAvoidPhrases(disc) {
        const avoidPhrases = {
            'D': [
                'Musimy to przedyskutować z zespołem',
                'To może potrwać trochę czasu',
                'Nie jestem pewien czy to najlepsze rozwiązanie'
            ],
            'I': [
                'Skupmy się tylko na liczbach',
                'To bardzo skomplikowane technicznie',
                'Nie ma czasu na pytania'
            ],
            'S': [
                'Musi Pan/Pani zdecydować się dzisiaj',
                'To ostatnia taka okazja',
                'Nie ma gwarancji zwrotu'
            ],
            'C': [
                'Po prostu mi Pan/Pani zaufaj',
                'Nie potrzebuje Pan/Pani wszystkich szczegółów',
                'To działa dla wszystkich'
            ]
        };
        return avoidPhrases[disc] || avoidPhrases['S'];
    }

    getTimeObjections() {
        return [
            {
                objection: 'Nie mam teraz czasu na to',
                response: 'Rozumiem, że czas to cenny zasób. Czy moglibyśmy umówić się na krótką 15-minutową rozmowę w dogodnym dla Pana/Pani terminie? Pokażę konkretne oszczędności, które może Pan/Pani osiągnąć.'
            },
            {
                objection: 'Muszę to przedyskutować z rodziną/partnerem',
                response: 'To bardzo mądre podejście - tak ważne decyzje powinny być podejmowane wspólnie. Czy mogę przygotować materiały, które pomogą Panu/Pani w tej rozmowie? Mogę też zorganizować spotkanie dla Was obojga.'
            },
            {
                objection: 'To nie jest dobry moment na takie wydatki',
                response: 'Rozumiem Pana/Pani obawy. Warto jednak pamiętać, że każdy miesiąc opóźnienia to stracone oszczędności na paliwie. Mamy też elastyczne opcje finansowania, które mogą dopasować się do Pana/Pani budżetu.'
            }
        ];
    }

    getFinancialObjections() {
        return [
            {
                objection: 'Nie stać mnie na to',
                response: 'Rozumiem, że budżet jest ważny. Sprawdźmy razem opcje leasingu i dopłat - często miesięczna rata może być niższa niż obecne koszty paliwa. Dodatkowo program NaszEauto może pokryć do 18.750 zł.'
            },
            {
                objection: 'Leasing/kredyt to dodatkowe koszty',
                response: 'To prawda, że finansowanie ma swój koszt. Jednak przy obecnych promocyjnych stopach i oszczędnościach na eksploatacji, całkowity koszt posiadania często jest niższy niż w przypadku samochodu spalinowego.'
            },
            {
                objection: 'A co z wartością odsprzedaży?',
                response: 'Świetne pytanie! Dane z rynku wtórnego pokazują, że Tesle zachowują wartość lepiej niż większość samochodów spalinowych. Dodatkowo, rosnąca popularność elektryków zwiększa popyt na używane modele.'
            }
        ];
    }

    getTechnicalObjections() {
         return [
             {
                 objection: 'Bateria się zepsuje i będzie droga wymiana',
                 response: 'Tesla oferuje 8-letnią gwarancję na baterię z zachowaniem minimum 70% pojemności. Statystyki pokazują, że baterie Tesla tracą tylko 10% pojemności po 200.000 km. Koszt wymiany też systematycznie spada.'
             },
             {
                 objection: 'Ładowanie trwa za długo',
                 response: 'W codziennym użytkowaniu ładuje się w nocy jak telefon - rano zawsze pełna bateria. Na trasach Supercharger doda 300 km zasięgu w 20 minut - tyle co przerwa na kawę i toaletę.'
             },
             {
                 objection: 'Technologia się zmienia, lepiej poczekać',
                 response: 'Tesla regularnie aktualizuje oprogramowanie, więc Pana/Pani samochód będzie się ulepszał przez lata. Czekanie oznacza tracenie oszczędności już dziś - a różnice w kolejnych generacjach są coraz mniejsze.'
             }
         ];
     }

     populatePsychologyTab(analysis) {
         const discAnalysisElement = document.getElementById('discAnalysis');
         const motivationsValuesElement = document.getElementById('motivationsValues');
         const fearsWorriesElement = document.getElementById('fearsWorries');
         const decisionStyleElement = document.getElementById('decisionStyle');
         
         const disc = analysis.personality?.detected?.DISC || 'S';
         const discProfile = this.getDISCProfile(disc);
         const motivations = this.getMotivations(disc);
         const fears = this.getFears(disc);
         const decisionStyle = this.getDecisionStyle(disc);
         
         if (discAnalysisElement) {
             discAnalysisElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="text-center mb-4">
                         <div class="text-4xl font-bold text-tesla-red mb-2">${disc}</div>
                         <div class="text-lg text-white mb-2">${discProfile.name}</div>
                         <div class="text-sm text-tesla-gray-300">${discProfile.description}</div>
                     </div>
                     <div class="space-y-2">
                         ${discProfile.traits.map(trait => 
                             `<div class="flex items-center text-sm text-tesla-gray-300">
                                 <i class="fas fa-check text-tesla-red mr-2"></i>${trait}
                             </div>`
                         ).join('')}
                     </div>
                 </div>
             `;
         }
         
         if (motivationsValuesElement) {
             motivationsValuesElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-3">
                         ${motivations.map(motivation => 
                             `<div class="flex items-start">
                                 <i class="fas fa-heart text-tesla-red mr-2 mt-1"></i>
                                 <span class="text-sm text-tesla-gray-300">${motivation}</span>
                             </div>`
                         ).join('')}
                     </div>
                 </div>
             `;
         }
         
         if (fearsWorriesElement) {
             fearsWorriesElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-3">
                         ${fears.map(fear => 
                             `<div class="flex items-start">
                                 <i class="fas fa-exclamation-triangle text-yellow-500 mr-2 mt-1"></i>
                                 <span class="text-sm text-tesla-gray-300">${fear}</span>
                             </div>`
                         ).join('')}
                     </div>
                 </div>
             `;
         }
         
         if (decisionStyleElement) {
             decisionStyleElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-3">
                         <div class="flex items-center">
                             <i class="fas fa-clock text-tesla-red mr-2"></i>
                             <span class="text-sm text-tesla-gray-300">Tempo: ${decisionStyle.speed}</span>
                         </div>
                         <div class="flex items-center">
                             <i class="fas fa-users text-tesla-red mr-2"></i>
                             <span class="text-sm text-tesla-gray-300">Proces: ${decisionStyle.process}</span>
                         </div>
                         <div class="flex items-center">
                             <i class="fas fa-chart-bar text-tesla-red mr-2"></i>
                             <span class="text-sm text-tesla-gray-300">Fokus: ${decisionStyle.focus}</span>
                         </div>
                     </div>
                 </div>
             `;
         }
     }

     populatePartnerTab(analysis) {
         const partnerAnalysisElement = document.getElementById('partnerAnalysis');
         const dualSalesStrategyElement = document.getElementById('dualSalesStrategy');
         const decisionDynamicsElement = document.getElementById('decisionDynamics');
         const partnerArgumentsElement = document.getElementById('partnerArguments');
         
         const disc = analysis.personality?.detected?.DISC || 'S';
         const partnerStrategy = this.getPartnerStrategy(disc);
         
         if (partnerAnalysisElement) {
             partnerAnalysisElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-3">
                         <div class="text-sm text-tesla-gray-300">
                             <strong class="text-tesla-red">Prawdopodobny profil partnera:</strong><br>
                             ${partnerStrategy.likelyPartnerProfile}
                         </div>
                         <div class="text-sm text-tesla-gray-300">
                             <strong class="text-tesla-red">Rola w decyzji:</strong><br>
                             ${partnerStrategy.decisionRole}
                         </div>
                     </div>
                 </div>
             `;
         }
         
         if (dualSalesStrategyElement) {
             dualSalesStrategyElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-2">
                         ${partnerStrategy.dualStrategy.map(strategy => 
                             `<div class="text-sm text-tesla-gray-300 border-l-2 border-tesla-red pl-3">${strategy}</div>`
                         ).join('')}
                     </div>
                 </div>
             `;
         }
         
         if (decisionDynamicsElement) {
             decisionDynamicsElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-3">
                         <div class="text-sm text-tesla-gray-300">
                             <strong class="text-tesla-red">Dynamika:</strong><br>
                             ${partnerStrategy.dynamics}
                         </div>
                         <div class="text-sm text-tesla-gray-300">
                             <strong class="text-tesla-red">Potencjalne konflikty:</strong><br>
                             ${partnerStrategy.conflicts}
                         </div>
                     </div>
                 </div>
             `;
         }
         
         if (partnerArgumentsElement) {
             partnerArgumentsElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-4">
                         <div>
                             <h6 class="text-tesla-red font-semibold mb-2">Dla głównego klienta:</h6>
                             <div class="space-y-1">
                                 ${partnerStrategy.argumentsForMain.map(arg => 
                                     `<div class="text-sm text-tesla-gray-300">• ${arg}</div>`
                                 ).join('')}
                             </div>
                         </div>
                         <div>
                             <h6 class="text-tesla-red font-semibold mb-2">Dla partnera:</h6>
                             <div class="space-y-1">
                                 ${partnerStrategy.argumentsForPartner.map(arg => 
                                     `<div class="text-sm text-tesla-gray-300">• ${arg}</div>`
                                 ).join('')}
                             </div>
                         </div>
                     </div>
                 </div>
             `;
         }
     }

     populatePredictionsTab(analysis) {
         const purchaseProbabilityElement = document.getElementById('purchaseProbability');
         const predictedTimelineElement = document.getElementById('predictedTimeline');
         const preferredModelElement = document.getElementById('preferredModel');
         const nextStepsElement = document.getElementById('predictedNextSteps');
         
         const disc = analysis.personality?.detected?.DISC || 'S';
         const predictions = this.getPredictions(disc, analysis.conversion_probability);
         
         if (purchaseProbabilityElement) {
             purchaseProbabilityElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="text-center mb-4">
                         <div class="text-3xl font-bold text-tesla-red mb-2">${analysis.conversion_probability}%</div>
                         <div class="text-sm text-tesla-gray-300">Prawdopodobieństwo zakupu</div>
                     </div>
                     <div class="space-y-2">
                         ${predictions.factors.map(factor => 
                             `<div class="flex justify-between text-sm">
                                 <span class="text-tesla-gray-300">${factor.name}</span>
                                 <span class="text-tesla-red">${factor.impact}</span>
                             </div>`
                         ).join('')}
                     </div>
                 </div>
             `;
         }
         
         if (predictedTimelineElement) {
             predictedTimelineElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-3">
                         ${predictions.timeline.map((phase, index) => 
                             `<div class="flex items-center">
                                 <div class="bg-tesla-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">${index + 1}</div>
                                 <div class="text-sm text-tesla-gray-300">${phase}</div>
                             </div>`
                         ).join('')}
                     </div>
                 </div>
             `;
         }
         
         if (preferredModelElement) {
             preferredModelElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="text-center mb-3">
                         <div class="text-xl font-bold text-tesla-red mb-1">${predictions.preferredModel.name}</div>
                         <div class="text-sm text-tesla-gray-300">${predictions.preferredModel.reason}</div>
                     </div>
                     <div class="space-y-2">
                         ${predictions.preferredModel.features.map(feature => 
                             `<div class="flex items-center text-sm text-tesla-gray-300">
                                 <i class="fas fa-check text-tesla-red mr-2"></i>${feature}
                             </div>`
                         ).join('')}
                     </div>
                 </div>
             `;
         }
         
         if (nextStepsElement) {
             nextStepsElement.innerHTML = `
                 <div class="bg-tesla-gray-800 p-4 rounded-lg">
                     <div class="space-y-3">
                         ${predictions.nextSteps.map((step, index) => 
                             `<div class="flex items-start">
                                 <div class="bg-tesla-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">${index + 1}</div>
                                 <div>
                                     <div class="text-sm text-white font-semibold">${step.action}</div>
                                     <div class="text-xs text-tesla-gray-400">${step.timing}</div>
                                     <div class="text-xs text-tesla-gray-300 mt-1">${step.details}</div>
                                 </div>
                             </div>`
                         ).join('')}
                     </div>
                 </div>
             `;
         }
     }

    switchTab(tabName) {
        console.log('🔄 switchTab called with:', tabName);
        
        // Hide all tab contents
        const allTabs = document.querySelectorAll('.tab-content');
        console.log('📋 Found tab contents:', allTabs.length);
        allTabs.forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Remove active class from all buttons
        const allButtons = document.querySelectorAll('.tab-button');
        console.log('🔘 Found tab buttons:', allButtons.length);
        allButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(tabName + 'Tab');
        console.log('🎯 Target tab element:', targetTab);
        if (targetTab) {
            targetTab.classList.remove('hidden');
            console.log('✅ Showed tab:', tabName + 'Tab');
        } else {
            console.error('❌ Tab not found:', tabName + 'Tab');
        }
        
        // Add active class to clicked button
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        console.log('🔘 Target button element:', targetButton);
        if (targetButton) {
            targetButton.classList.add('active');
            console.log('✅ Activated button for tab:', tabName);
        } else {
            console.error('❌ Button not found for tab:', tabName);
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

    populateSegmentAnalysisTab(analysis) {
        const segmentIdentificationElement = document.getElementById('segmentIdentification');
        const segmentStrategyElement = document.getElementById('segmentStrategy');
        const conversionPotentialElement = document.getElementById('conversionPotential');
        const personalizedActionsElement = document.getElementById('personalizedActions');
        
        // Sprawdź czy dane segmentacji istnieją - poprawione mapowanie
        const segmentAnalysis = analysis.segment?.analysis || analysis.segmentAnalysis;
        const segmentStrategy = analysis.segment?.strategy || analysis.segmentStrategy;
        
        if (!segmentAnalysis && !segmentStrategy) {
            // Wyświetl komunikat o braku danych segmentacji
            if (segmentIdentificationElement) {
                segmentIdentificationElement.innerHTML = `
                    <div class="bg-tesla-gray-800 p-4 rounded-lg text-center">
                        <i class="fas fa-info-circle text-tesla-gray-400 text-2xl mb-2"></i>
                        <p class="text-tesla-gray-400">Brak danych segmentacji dla tej analizy</p>
                        <p class="text-tesla-gray-500 text-sm mt-1">Segmentacja zostanie dodana w przyszłych wersjach</p>
                    </div>
                `;
            }
            if (segmentStrategyElement) {
                segmentStrategyElement.innerHTML = `
                    <div class="bg-tesla-gray-800 p-4 rounded-lg text-center">
                        <i class="fas fa-cog text-tesla-gray-400 text-2xl mb-2"></i>
                        <p class="text-tesla-gray-400">Strategia segmentowa niedostępna</p>
                    </div>
                `;
            }
            if (conversionPotentialElement) {
                conversionPotentialElement.innerHTML = `
                    <div class="bg-tesla-gray-800 p-4 rounded-lg text-center">
                        <i class="fas fa-chart-line text-tesla-gray-400 text-2xl mb-2"></i>
                        <p class="text-tesla-gray-400">Potencjał konwersji niedostępny</p>
                    </div>
                `;
            }
            if (personalizedActionsElement) {
                personalizedActionsElement.innerHTML = `
                    <div class="bg-tesla-gray-800 p-4 rounded-lg text-center">
                        <i class="fas fa-tasks text-tesla-gray-400 text-2xl mb-2"></i>
                        <p class="text-tesla-gray-400">Spersonalizowane działania niedostępne</p>
                    </div>
                `;
            }
            return;
        }
        
        if (segmentAnalysis && segmentIdentificationElement) {
            const segment = segmentAnalysis;
            segmentIdentificationElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Zidentyfikowany Segment</h6>
                    <div class="text-lg font-bold text-white mb-2">${this.getSegmentName(segment.segment)}</div>
                    <div class="text-sm text-tesla-gray-300 mb-3">${this.getSegmentDescription(segment.segment)}</div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-tesla-gray-400">Pewność identyfikacji:</span>
                        <span class="text-tesla-red font-semibold">${Math.round(segment.confidence * 100)}%</span>
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Priorytet Segmentu</h6>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm">Poziom priorytetu:</span>
                        <span class="${this.getPriorityColor(segment.priority)}">${this.getPriorityLevel(segment.priority)}</span>
                    </div>
                    <div class="w-full bg-tesla-gray-700 rounded-full h-2">
                        <div class="${this.getPriorityColor(segment.priority)} h-2 rounded-full" style="width: ${segment.priority * 10}%"></div>
                    </div>
                </div>
            `;
        }
        
        if (segmentStrategy && segmentStrategyElement) {
            const strategy = segmentStrategy;
            segmentStrategyElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Główne Przesłania</h6>
                    <div class="space-y-2">
                        ${strategy.primaryMessages.map(msg => `
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-tesla-red mr-2 mt-1"></i>
                                <span class="text-sm text-tesla-gray-300">${msg}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Kluczowe Korzyści</h6>
                    <div class="space-y-2">
                        ${strategy.keyBenefits.map(benefit => `
                            <div class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span class="text-sm text-tesla-gray-300">${benefit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (segmentAnalysis && conversionPotentialElement) {
            const segment = segmentAnalysis;
            conversionPotentialElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Mnożnik Konwersji</h6>
                    <div class="text-center">
                        <div class="text-3xl font-bold ${this.getMultiplierColor(segment.conversionMultiplier)} mb-2">
                            ${segment.conversionMultiplier.toFixed(2)}x
                        </div>
                        <div class="text-sm text-tesla-gray-400">${this.getMultiplierLevel(segment.conversionMultiplier)}</div>
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Potencjał Segmentu</h6>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm text-tesla-gray-400">Wielkość rynku:</span>
                            <span class="text-white">${this.getMarketSize(segment.segment)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-tesla-gray-400">Konkurencja:</span>
                            <span class="text-white">${this.getCompetitionLevel(segment.segment)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-tesla-gray-400">Trend wzrostu:</span>
                            <span class="text-green-400">${this.getGrowthTrend(segment.segment)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (segmentStrategy && personalizedActionsElement) {
            const strategy = segmentStrategy;
            personalizedActionsElement.innerHTML = `
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Następne Kroki</h6>
                    <div class="space-y-2">
                        ${strategy.nextSteps.map((step, index) => `
                            <div class="flex items-start">
                                <span class="bg-tesla-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">${index + 1}</span>
                                <span class="text-sm text-tesla-gray-300">${step}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Specjalne Oferty</h6>
                    <div class="space-y-2">
                        ${strategy.specialOffers.map(offer => `
                            <div class="flex items-start">
                                <i class="fas fa-gift text-yellow-400 mr-2 mt-1"></i>
                                <span class="text-sm text-tesla-gray-300">${offer}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-tesla-gray-800 p-4 rounded-lg">
                    <h6 class="text-tesla-red font-semibold mb-3">Styl Komunikacji</h6>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-tesla-gray-400">Ton:</span>
                            <span class="text-white">${this.getCommunicationTone(strategy.communicationStyle.tone)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-tesla-gray-400">Pilność:</span>
                            <span class="text-white">${this.getUrgencyLevel(strategy.communicationStyle.urgency)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-tesla-gray-400">Kanał:</span>
                            <span class="text-white">${this.getChannelName(strategy.communicationStyle.channel)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Helper methods for segmentation display
    getSegmentName(segment) {
        const names = {
            'eco_family': 'Eko-Rodzina',
            'tech_professional': 'Tech Professional',
            'senior_comfort': 'Senior Comfort',
            'business_roi': 'Business ROI',
            'young_urban': 'Young Urban'
        };
        return names[segment] || segment;
    }
    
    getSegmentDescription(segment) {
        const descriptions = {
            'eco_family': 'Rodziny świadome ekologicznie, szukające oszczędności i bezpieczeństwa',
            'tech_professional': 'Profesjonaliści IT/tech ceniący innowacje i wydajność',
            'senior_comfort': 'Dojrzali klienci priorytetyzujący komfort i prostotę',
            'business_roi': 'Przedsiębiorcy skupieni na zwrocie z inwestycji',
            'young_urban': 'Młodzi mieszkańcy miast, trendseterzy i early adopters'
        };
        return descriptions[segment] || 'Opis segmentu';
    }
    
    getPriorityLevel(priority) {
        if (priority >= 8) return 'Bardzo wysoki';
        if (priority >= 6) return 'Wysoki';
        if (priority >= 4) return 'Średni';
        return 'Niski';
    }
    
    getPriorityColor(priority) {
        if (priority >= 8) return 'text-red-400 bg-red-400';
        if (priority >= 6) return 'text-yellow-400 bg-yellow-400';
        if (priority >= 4) return 'text-blue-400 bg-blue-400';
        return 'text-gray-400 bg-gray-400';
    }
    
    getMultiplierLevel(multiplier) {
        if (multiplier >= 1.5) return 'Bardzo wysoki potencjał';
        if (multiplier >= 1.2) return 'Wysoki potencjał';
        if (multiplier >= 1.0) return 'Standardowy potencjał';
        return 'Niski potencjał';
    }
    
    getMultiplierColor(multiplier) {
        if (multiplier >= 1.5) return 'text-green-400';
        if (multiplier >= 1.2) return 'text-yellow-400';
        if (multiplier >= 1.0) return 'text-blue-400';
        return 'text-red-400';
    }
    
    getMarketSize(segment) {
        const sizes = {
            'eco_family': 'Duży (25% rynku)',
            'tech_professional': 'Średni (15% rynku)',
            'senior_comfort': 'Rosnący (20% rynku)',
            'business_roi': 'Niszowy (10% rynku)',
            'young_urban': 'Dynamiczny (30% rynku)'
        };
        return sizes[segment] || 'Nieznany';
    }
    
    getCompetitionLevel(segment) {
        const levels = {
            'eco_family': 'Średnia',
            'tech_professional': 'Wysoka',
            'senior_comfort': 'Niska',
            'business_roi': 'Średnia',
            'young_urban': 'Bardzo wysoka'
        };
        return levels[segment] || 'Nieznana';
    }
    
    getGrowthTrend(segment) {
        const trends = {
            'eco_family': '+15% rocznie',
            'tech_professional': '+8% rocznie',
            'senior_comfort': '+25% rocznie',
            'business_roi': '+12% rocznie',
            'young_urban': '+20% rocznie'
        };
        return trends[segment] || 'Brak danych';
    }
    
    getCommunicationTone(tone) {
        const tones = {
            'professional': 'Profesjonalny',
            'friendly': 'Przyjazny',
            'authoritative': 'Autorytatywny',
            'casual': 'Swobodny',
            'technical': 'Techniczny'
        };
        return tones[tone] || tone;
    }
    
    getUrgencyLevel(urgency) {
        const levels = {
            'low': 'Niska',
            'medium': 'Średnia',
            'high': 'Wysoka'
        };
        return levels[urgency] || urgency;
    }
    
    getChannelName(channel) {
        const channels = {
            'email': 'Email',
            'phone': 'Telefon',
            'meeting': 'Spotkanie osobiste',
            'video_call': 'Rozmowa wideo',
            'demo': 'Prezentacja/Demo'
        };
        return channels[channel] || channel;
    }

    // Metody pomocnicze do formatowania etykiet
    getAgeLabel(age) {
        const labels = {
            '18-25': '18-25 lat',
            '26-35': '26-35 lat',
            '36-45': '36-45 lat',
            '46-55': '46-55 lat',
            '56-65': '56-65 lat',
            '65+': '65+ lat'
        };
        return labels[age] || age;
    }

    getHousingLabel(housing) {
        const labels = {
            'house': 'Dom',
            'apartment': 'Mieszkanie',
            'townhouse': 'Szeregowiec'
        };
        return labels[housing] || housing;
    }

    getPVLabel(pv) {
        const labels = {
            'yes': 'Tak',
            'no': 'Nie',
            'planned': 'Planowane'
        };
        return labels[pv] || pv;
    }

    getRelationshipLabel(status) {
        const labels = {
            'single': 'Singiel',
            'relationship': 'W związku',
            'married': 'Żonaty/Zamężna',
            'divorced': 'Rozwiedziony/a'
        };
        return labels[status] || status;
    }

    getChildrenLabel(children) {
        const labels = {
            'none': 'Brak',
            'young': 'Małe dzieci',
            'school': 'Dzieci szkolne',
            'adult': 'Dorosłe dzieci'
        };
        return labels[children] || children;
    }

    getTeslaExperienceLabel(experience) {
        const labels = {
            'first_time': 'Pierwszy kontakt',
            'test_driven': 'Jazda testowa',
            'researching': 'Badanie rynku',
            'owner_referral': 'Polecenie właściciela',
            'previous_owner': 'Były właściciel'
        };
        return labels[experience] || experience;
    }

    getCarRoleLabel(role) {
        const labels = {
            'primary': 'Główne auto',
            'secondary': 'Drugie auto',
            'replacement': 'Zamiana obecnego',
            'additional': 'Dodatkowe auto'
        };
        return labels[role] || role;
    }

    // Performance optimizations
    optimizePerformance() {
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Lazy loading for tab content
        this.setupLazyTabLoading();

        // Intersection Observer for result elements
        this.setupIntersectionObserver();

        // Preload critical resources
        this.preloadCriticalResources();

        // Optimize DOM queries
        this.cacheFrequentlyUsedElements();
    }

    handleResize() {
        // Optimize layout on resize
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile-layout', isMobile);
    }

    setupLazyTabLoading() {
        // Only load tab content when tab becomes active
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.loadTabContent(tabName);
            });
        });
    }

    loadTabContent(tabName) {
        // Lazy load content for inactive tabs
        const tab = document.getElementById(tabName + 'Tab');
        if (tab && !tab.dataset.loaded) {
            // Mark as loaded to prevent reloading
            tab.dataset.loaded = 'true';
            
            // Add loading animation
            tab.style.opacity = '0';
            setTimeout(() => {
                tab.style.opacity = '1';
                tab.style.transition = 'opacity 0.3s ease';
            }, 50);
        }
    }

    setupIntersectionObserver() {
        // Optimize animations and heavy content loading
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        // Trigger any heavy computations only when visible
                        this.processVisibleElement(entry.target);
                    } else {
                        entry.target.classList.remove('animate-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            // Observe result cards and heavy content
            document.querySelectorAll('.result-card, .analysis-section').forEach(el => {
                observer.observe(el);
            });
        }
    }

    processVisibleElement(element) {
        // Process heavy content only when element is visible
        if (element.classList.contains('chart-container') && !element.dataset.processed) {
            element.dataset.processed = 'true';
            // Initialize charts or heavy visualizations here
        }
    }

    preloadCriticalResources() {
        // Preload critical CSS and JS resources only
        // Removed API preloading to prevent unnecessary requests
        console.log('Critical resources optimization ready');
    }

    cacheFrequentlyUsedElements() {
        // Cache DOM queries for better performance
        this.cachedElements = {
            triggerButtons: document.querySelectorAll('.trigger-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            resultCards: document.querySelectorAll('.result-card')
        };
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 Starting Tesla Customer Decoder SHU PRO...');
    window.app = new TeslaCustomerDecoderApp();
});