class TeslaSalesTriggerSystem {
    constructor() {
        this.activeTriggers = new Set();
        this.contextModifiers = {
            has_children: 8,
            has_garage: 5,
            has_home_pv: 15,
            business_owner: 12,
            senior: 5
        };
        
        this.discScores = { D: 0, I: 0, S: 0, C: 0 };
        this.apiBase = 'http://localhost:8080/api';
        
        this.initializeEventListeners();
        this.loadTriggerData();
    }

    initializeEventListeners() {
        // Add click handlers to all trigger buttons
        document.querySelectorAll('.trigger-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTriggerClick(e));
        });
    }

    async loadTriggerData() {
        // Load trigger definitions from CSV data
        this.triggerDefinitions = {
            // Life situation triggers
            family_signals: { weight: 9, disc: ['S'], context: 'has_children' },
            house_garage: { weight: 9, disc: ['S'], context: 'has_garage' },
            pv_panels: { weight: 15, disc: ['C', 'S'], context: 'has_home_pv' },
            business_signals: { weight: 12, disc: ['D', 'C'], context: 'business_owner' },
            senior_signals: { weight: 7, disc: ['S'], context: 'senior' },
            young_professional: { weight: 8, disc: ['D', 'I'] },

            // Motivation triggers
            eco_motivation: { weight: 10, disc: ['S', 'I'] },
            tech_motivation: { weight: 10, disc: ['D', 'I'] },
            savings_motivation: { weight: 9, disc: ['C', 'D'] },
            prestige_motivation: { weight: 8, disc: ['I', 'D'] },
            safety_motivation: { weight: 9, disc: ['S'] },
            performance_motivation: { weight: 7, disc: ['D'] },

            // DISC communication triggers
            dominant_signals: { weight: 9, disc: ['D'] },
            influential_signals: { weight: 8, disc: ['I'] },
            steady_signals: { weight: 8, disc: ['S'] },
            conscientious_signals: { weight: 9, disc: ['C'] },

            // Concerns
            price_concerns: { weight: 10, disc: ['C', 'S'], negative: true },
            range_anxiety: { weight: 10, disc: ['S', 'C'], negative: true },
            charging_concerns: { weight: 9, disc: ['S', 'C'], negative: true },
            reliability_concerns: { weight: 8, disc: ['S', 'C'], negative: true },

            // Buying readiness
            hot_buyer: { weight: 10, disc: ['D'] },
            warm_buyer: { weight: 7, disc: ['I', 'S'] },
            cold_buyer: { weight: 3, disc: ['C'], negative: true }
        };
    }

    handleTriggerClick(event) {
        const btn = event.target;
        const trigger = btn.dataset.trigger;
        
        if (btn.classList.contains('active')) {
            // Deactivate trigger
            btn.classList.remove('active');
            this.activeTriggers.delete(trigger);
        } else {
            // Activate trigger
            btn.classList.add('active');
            this.activeTriggers.add(trigger);
        }

        // Update analysis in real-time
        this.updateAnalysis();
    }

    updateAnalysis() {
        // Reset DISC scores
        this.discScores = { D: 0, I: 0, S: 0, C: 0 };
        let totalWeight = 0;
        let conversionScore = 0;
        let contextModifiers = 0;

        // Calculate DISC scores and conversion probability
        this.activeTriggers.forEach(trigger => {
            const def = this.triggerDefinitions[trigger];
            if (!def) return;

            const weight = def.weight;
            totalWeight += weight;

            // Add to DISC scores
            def.disc.forEach(discType => {
                this.discScores[discType] += weight;
            });

            // Calculate conversion impact
            if (def.negative) {
                conversionScore -= weight * 0.5; // Concerns reduce conversion
            } else {
                conversionScore += weight;
            }

            // Add context modifiers
            if (def.context && this.contextModifiers[def.context]) {
                contextModifiers += this.contextModifiers[def.context];
            }
        });

        // Normalize DISC scores to percentages
        const maxDiscScore = Math.max(...Object.values(this.discScores));
        if (maxDiscScore > 0) {
            Object.keys(this.discScores).forEach(type => {
                this.discScores[type] = Math.round((this.discScores[type] / maxDiscScore) * 100);
            });
        }

        // Calculate final conversion probability
        const baseConversion = Math.min(Math.max((conversionScore + contextModifiers) * 2, 0), 100);
        
        this.updateUI(baseConversion);
    }

    updateUI(conversionProbability) {
        // Update DISC visualization
        const dominantType = Object.keys(this.discScores).reduce((a, b) => 
            this.discScores[a] > this.discScores[b] ? a : b
        );

        // Update DISC bars and percentages
        Object.keys(this.discScores).forEach(type => {
            const score = this.discScores[type];
            document.getElementById(`disc-${type.toLowerCase()}-bar`).style.width = `${score}%`;
            document.getElementById(`disc-${type.toLowerCase()}-percent`).textContent = `${score}%`;
        });

        // Update dominant DISC type
        const discNames = { D: 'Dominujący', I: 'Wpływowy', S: 'Stabilny', C: 'Analityczny' };
        document.getElementById('disc-type').textContent = discNames[dominantType] || 'Nieznany';

        // Determine customer segment
        const segment = this.determineSegment(dominantType);
        document.getElementById('segment-name').textContent = segment.name;
        document.getElementById('segment-description').textContent = segment.description;

        // Update conversion probability
        document.getElementById('conversion-probability').textContent = `${Math.round(conversionProbability)}%`;
        document.getElementById('conversion-bar').style.width = `${conversionProbability}%`;

        // Show/update sales cheatsheet if analysis is available
        if (this.activeTriggers.size > 0) {
            this.updateSalesCheatsheet(dominantType, segment, conversionProbability);
            document.getElementById('sales-cheatsheet').style.display = 'block';
        } else {
            document.getElementById('sales-cheatsheet').style.display = 'none';
        }
    }

    determineSegment(dominantDisc) {
        const hasContext = (context) => Array.from(this.activeTriggers).some(trigger => 
            this.triggerDefinitions[trigger]?.context === context
        );

        // Business owner segment
        if (hasContext('business_owner')) {
            return {
                name: 'Przedsiębiorca (B2B)',
                description: 'Skupiony na ROI, korzyściach podatkowych i wizerunku firmy'
            };
        }

        // Family segment
        if (hasContext('has_children')) {
            return {
                name: 'Rodzina z dziećmi',
                description: 'Priorytet: bezpieczeństwo, praktyczność, komfort podróży'
            };
        }

        // PV owner segment
        if (hasContext('has_home_pv')) {
            return {
                name: 'Pragmatyczny Optymalizator',
                description: 'Racjonalny, analityczny, skupiony na TCO i synergii z OZE'
            };
        }

        // DISC-based segments
        switch (dominantDisc) {
            case 'D':
                return {
                    name: 'Technologiczny Ewangelista',
                    description: 'Wczesny adopter, fascynacja technologią i osiągami'
                };
            case 'I':
                if (this.activeTriggers.has('prestige_motivation')) {
                    return {
                        name: 'Poszukiwacz Eko-Statusu',
                        description: 'Łączenie luksusu z odpowiedzialnością, cichy luksus'
                    };
                }
                return {
                    name: 'Aspirujący Naśladowca',
                    description: 'Symbol sukcesu, przynależność do fajnej społeczności'
                };
            case 'S':
                return {
                    name: 'Stabilny Pragmatyk',
                    description: 'Skupiony na niezawodności, bezpieczeństwie i oszczędnościach'
                };
            case 'C':
                return {
                    name: 'Analityczny Decydent',
                    description: 'Potrzebuje danych, analiz TCO i szczegółowych porównań'
                };
            default:
                return {
                    name: 'Nieznany',
                    description: 'Zaznacz więcej triggerów aby zobaczyć segment'
                };
        }
    }

    updateSalesCheatsheet(dominantDisc, segment, conversionProbability) {
        // Communication guidelines based on DISC
        const communicationGuidelines = {
            D: {
                dos: ['Mów szybko i konkretnie', 'Podkreślaj osiągi i przewagę', 'Oferuj szybkie decyzje', 'Skup się na korzyściach biznesowych'],
                donts: ['Nie wdawaj się w szczegóły techniczne', 'Nie przeciągaj prezentacji', 'Nie mów o problemach bez rozwiązań']
            },
            I: {
                dos: ['Buduj pozytywne emocje', 'Podkreślaj aspekty społeczne', 'Opowiadaj historie klientów', 'Mów o statusie i prestiżu'],
                donts: ['Nie bombarduj danymi', 'Nie ignoruj emocji', 'Nie spieszaj z decyzją']
            },
            S: {
                dos: ['Mów spokojnie i cierpliwie', 'Podkreślaj bezpieczeństwo', 'Oferuj wsparcie posprzedażowe', 'Daj czas na przemyślenie'],
                donts: ['Nie wywieraj presji', 'Nie ignoruj obaw', 'Nie spieszaj procesów']
            },
            C: {
                dos: ['Przedstaw szczegółowe dane', 'Porównaj z konkurencją', 'Podaj konkretne liczby TCO', 'Daj materiały do przeanalizowania'],
                donts: ['Nie używaj emocjonalnych argumentów', 'Nie ukrywaj wad', 'Nie spieszaj z decyzją']
            }
        };

        const guidelines = communicationGuidelines[dominantDisc] || communicationGuidelines.C;

        // Update communication dos and don'ts
        const dosContent = guidelines.dos.map(item => `<div class="text-green-400">✓ ${item}</div>`).join('');
        const dontsContent = guidelines.donts.map(item => `<div class="text-red-400">✗ ${item}</div>`).join('');
        document.getElementById('communication-dos-donts').innerHTML = dosContent + dontsContent;

        // Key arguments based on active triggers and segment
        const keyArguments = this.generateKeyArguments(dominantDisc, segment);
        document.getElementById('key-arguments').innerHTML = keyArguments.map(arg => 
            `<div class="p-2 bg-tesla-gray-700 rounded text-tesla-gray-200">${arg}</div>`
        ).join('');

        // Next steps based on conversion probability and DISC type
        const nextSteps = this.generateNextSteps(dominantDisc, conversionProbability);
        document.getElementById('next-steps').innerHTML = nextSteps.map(step => 
            `<div class="text-tesla-gray-300">• ${step}</div>`
        ).join('');
    }

    generateKeyArguments(dominantDisc, segment) {
        const args = [];
        
        // Context-based argumentsheavy
        if (this.activeTriggers.has('pv_panels')) {
            args.push('💡 Synergia z PV: "Twoje panele będą ładować auto za darmo w dzień, a nocą użyjesz tanią taryfę"');
        }
        
        if (this.activeTriggers.has('business_signals')) {
            args.push('💼 Korzyści B2B: "100% odliczenia VAT + amortyzacja 20% rocznie = realny koszt 200k zamiast 300k"');
        }
        
        if (this.activeTriggers.has('family_signals')) {
            args.push('👨‍👩‍👧‍👦 Bezpieczeństwo: "5 gwiazdek Euro NCAP + najniższe prawdopodobieństwo obrażeń w historii testów"');
        }

        // DISC-specific arguments
        switch (dominantDisc) {
            case 'D':
                args.push('⚡ Performance: "0-100 w 3.2s, wyprzedzisz każde Porsche na światłach"');
                args.push('🎯 Autopilot: "Jedyny system autonomiczny dostępny już dziś - konkurencja obiecuje od lat"');
                break;
            case 'I':
                args.push('🌟 Status: "Dołączysz do ekskluzywnej grupy właścicieli najnowocześniejszych aut świata"');
                args.push('📱 Społeczność: "Aplikacja Tesla, spotkania właścicieli, społeczność która się wspiera"');
                break;
            case 'S':
                args.push('🔒 Niezawodność: "8 lat gwarancji na baterię, najniższe koszty serwisu na rynku"');
                args.push('💰 Oszczędności: "300-500zł miesięcznie mniej niż spalinowe, samo się zwraca"');
                break;
            case 'C':
                args.push('📊 TCO: "Szczegółowa kalkulacja: 1.2zł/100km vs 45zł/100km spalinowe = 43k oszczędności na 5 lat"');
                args.push('🔧 Prostota: "Tylko 20 ruchomych części vs 2000 w spalinowym = 90% mniej awarii"');
                break;
        }

        // Address specific concerns
        if (this.activeTriggers.has('range_anxiety')) {
            args.push('🗺️ Zasięg: "550km WLTP, w praktyce 450km zimą - wystarczy na 95% twoich tras"');
        }
        
        if (this.activeTriggers.has('charging_concerns')) {
            args.push('⚡ Ładowanie: "15min na Supercharger = 300km zasięgu, szybsze niż tankowanie"');
        }

        return args.slice(0, 4); // Limit to top 4 arguments
    }

    generateNextSteps(dominantDisc, conversionProbability) {
        const steps = [];
        
        if (conversionProbability > 70) {
            // Hot prospect
            steps.push('🔥 GORĄCY PROSPECT - przejdź do finalizacji');
            steps.push('Zapytaj: "Co musiałoby się stać, żebyś podjął decyzję dziś?"');
            steps.push('Zaproponuj jazdę próbną w ciągu 2 dni');
        } else if (conversionProbability > 40) {
            // Warm prospect
            steps.push('🌡️ CIEPŁY PROSPECT - buduj zaufanie');
            steps.push('Wyślij kalkulację TCO dopasowaną do jego sytuacji');
            steps.push('Zaproponuj rozmowę z obecnym właścicielem Tesli');
        } else {
            // Cold prospect
            steps.push('❄️ ZIMNY PROSPECT - edukuj i rozwiązuj obawy');
            steps.push('Skup się na największych obawach klienta');
            steps.push('Wyślij materiały edukacyjne dopasowane do profilu');
        }

        // DISC-specific next steps
        switch (dominantDisc) {
            case 'D':
                steps.push('Zaoferuj ekspresową ścieżkę zakupu');
                steps.push('Podkreśl możliwość szybkiej dostawy');
                break;
            case 'I':
                steps.push('Zaproś na event Tesla lub spotkanie społeczności');
                steps.push('Poproś o polecenie znajomych (program referral)');
                break;
            case 'S':
                steps.push('Daj czas na przemyślenie (nie naciskaj)');
                steps.push('Zaoferuj kontakt do doradcy posprzedażowego');
                break;
            case 'C':
                steps.push('Wyślij szczegółowe porównanie z konkurencją');
                steps.push('Umów na dłuższą prezentację techniczną');
                break;
        }

        return steps.slice(0, 5); // Limit to top 5 steps
    }
}

// Initialize the system when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.teslaTriggerSystem = new TeslaSalesTriggerSystem();
});