/**
 * Analysis History Manager - System numeracji i zarządzania historią analiz
 * Umożliwia zapisywanie, wyszukiwanie, tagowanie i optymalizację analiz
 */

const fs = require('fs').promises;
const path = require('path');

class AnalysisHistoryManager {
    constructor() {
        this.historyFile = path.join(__dirname, '..', 'data', 'analysis_history.json');
        this.counterFile = path.join(__dirname, '..', 'data', 'analysis_counter.json');
        this.tagsFile = path.join(__dirname, '..', 'data', 'analysis_tags.json');
        this.notesFile = path.join(__dirname, '..', 'data', 'analysis_notes.json');
        
        this.history = [];
        this.counter = 0;
        this.tags = {};
        this.notes = {};
        
        this.initialized = false;
    }

    async initialize() {
        try {
            // Wczytaj licznik analiz
            try {
                const counterData = await fs.readFile(this.counterFile, 'utf8');
                this.counter = JSON.parse(counterData).counter || 0;
            } catch (error) {
                this.counter = 0;
                await this.saveCounter();
            }

            // Wczytaj historię analiz
            try {
                const historyData = await fs.readFile(this.historyFile, 'utf8');
                this.history = JSON.parse(historyData) || [];
            } catch (error) {
                this.history = [];
                await this.saveHistory();
            }

            // Wczytaj tagi
            try {
                const tagsData = await fs.readFile(this.tagsFile, 'utf8');
                this.tags = JSON.parse(tagsData) || {};
            } catch (error) {
                this.tags = {};
                await this.saveTags();
            }

            // Wczytaj notatki
            try {
                const notesData = await fs.readFile(this.notesFile, 'utf8');
                this.notes = JSON.parse(notesData) || {};
            } catch (error) {
                this.notes = {};
                await this.saveNotes();
            }

            this.initialized = true;
            console.log(`✅ Analysis History Manager initialized. Current counter: ${this.counter}`);
            
        } catch (error) {
            console.error('❌ Failed to initialize Analysis History Manager:', error);
            throw error;
        }
    }

    /**
     * Zapisuje nową analizę z unikalnym numerem
     */
    async saveAnalysis(analysisData, metadata = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        // Zwiększ licznik i przypisz numer
        this.counter++;
        const analysisNumber = this.counter;

        // Przygotuj rekord analizy
        const analysisRecord = {
            number: analysisNumber,
            timestamp: new Date().toISOString(),
            session_id: analysisData.session_id || this.generateSessionId(),
            
            // Podstawowe dane wejściowe
            input_data: {
                selected_triggers: analysisData.input?.selectedTriggers || [],
                tone: analysisData.input?.tone || 'neutralny',
                demographics: analysisData.input?.demographics || {},
                conversation_stage: analysisData.input?.conversationStage || 'unknown'
            },
            
            // Wyniki analizy
            results: {
                personality: analysisData.personality,
                fuzzy_personality: analysisData.fuzzy_personality,
                conversion_probability: analysisData.scores?.enhanced_total || analysisData.scores?.total || 0,
                confidence: analysisData.confidence || 0,
                dominant_triggers: this.extractDominantTriggers(analysisData),
                recommendations: analysisData.recommendations,
                strategy: analysisData.strategy
            },
            
            // Metadane
            metadata: {
                user_agent: metadata.userAgent || 'unknown',
                ip_hash: metadata.ipHash || 'unknown',
                source: metadata.source || 'web_interface',
                version: analysisData.version || '2.1',
                processing_time_ms: metadata.processingTime || 0
            },
            
            // Pola do późniejszego uzupełnienia
            conversion_result: null, // true/false/null
            actual_personality: null, // rzeczywista osobowość klienta
            effectiveness_score: null, // ocena skuteczności 1-10
            
            // Statusy
            status: 'active', // active, archived, flagged
            reviewed: false,
            starred: false
        };

        // Dodaj do historii
        this.history.push(analysisRecord);
        
        // Zapisz dane
        await this.saveCounter();
        await this.saveHistory();
        
        console.log(`📊 Analysis #${analysisNumber} saved successfully`);
        
        return {
            analysisNumber: analysisNumber,
            record: analysisRecord
        };
    }

    /**
     * Pobiera analizę po numerze
     */
    async getAnalysis(analysisNumber) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysis = this.history.find(a => a.number === parseInt(analysisNumber));
        
        if (!analysis) {
            throw new Error(`Analysis #${analysisNumber} not found`);
        }

        // Dodaj tagi i notatki
        const enrichedAnalysis = {
            ...analysis,
            tags: this.tags[analysisNumber] || [],
            notes: this.notes[analysisNumber] || []
        };

        return enrichedAnalysis;
    }

    /**
     * Wyszukuje analizy według kryteriów
     */
    async searchAnalyses(criteria = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        let results = [...this.history];

        // Filtrowanie według daty
        if (criteria.dateFrom) {
            const fromDate = new Date(criteria.dateFrom);
            results = results.filter(a => new Date(a.timestamp) >= fromDate);
        }
        
        if (criteria.dateTo) {
            const toDate = new Date(criteria.dateTo);
            results = results.filter(a => new Date(a.timestamp) <= toDate);
        }

        // Filtrowanie według osobowości
        if (criteria.personality) {
            results = results.filter(a => 
                a.results.personality?.detected?.DISC === criteria.personality
            );
        }

        // Filtrowanie według prawdopodobieństwa konwersji
        if (criteria.minConversion) {
            results = results.filter(a => 
                a.results.conversion_probability >= criteria.minConversion
            );
        }

        // Filtrowanie według tagów
        if (criteria.tags && criteria.tags.length > 0) {
            results = results.filter(a => {
                const analysisTags = this.tags[a.number] || [];
                return criteria.tags.some(tag => analysisTags.includes(tag));
            });
        }

        // Filtrowanie według statusu
        if (criteria.status) {
            results = results.filter(a => a.status === criteria.status);
        }

        // Filtrowanie według triggerów
        if (criteria.triggers && criteria.triggers.length > 0) {
            results = results.filter(a => {
                const analysisTriggers = a.input_data.selected_triggers || [];
                return criteria.triggers.some(trigger => 
                    analysisTriggers.includes(trigger)
                );
            });
        }

        // Sortowanie
        const sortBy = criteria.sortBy || 'timestamp';
        const sortOrder = criteria.sortOrder || 'desc';
        
        results.sort((a, b) => {
            let aVal, bVal;
            
            switch (sortBy) {
                case 'number':
                    aVal = a.number;
                    bVal = b.number;
                    break;
                case 'conversion_probability':
                    aVal = a.results.conversion_probability;
                    bVal = b.results.conversion_probability;
                    break;
                case 'confidence':
                    aVal = a.results.confidence;
                    bVal = b.results.confidence;
                    break;
                default:
                    aVal = new Date(a.timestamp);
                    bVal = new Date(b.timestamp);
            }
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        // Paginacja
        const page = criteria.page || 1;
        const limit = criteria.limit || 50;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedResults = results.slice(startIndex, endIndex);
        
        // Wzbogać o tagi i notatki
        const enrichedResults = paginatedResults.map(analysis => ({
            ...analysis,
            tags: this.tags[analysis.number] || [],
            notes: this.notes[analysis.number] || []
        }));

        return {
            results: enrichedResults,
            total: results.length,
            page: page,
            totalPages: Math.ceil(results.length / limit),
            hasNext: endIndex < results.length,
            hasPrev: page > 1
        };
    }

    /**
     * Dodaje tag do analizy
     */
    async addTag(analysisNumber, tag) {
        if (!this.initialized) {
            await this.initialize();
        }

        const num = parseInt(analysisNumber);
        
        if (!this.tags[num]) {
            this.tags[num] = [];
        }
        
        if (!this.tags[num].includes(tag)) {
            this.tags[num].push(tag);
            await this.saveTags();
        }
        
        return this.tags[num];
    }

    /**
     * Usuwa tag z analizy
     */
    async removeTag(analysisNumber, tag) {
        if (!this.initialized) {
            await this.initialize();
        }

        const num = parseInt(analysisNumber);
        
        if (this.tags[num]) {
            this.tags[num] = this.tags[num].filter(t => t !== tag);
            await this.saveTags();
        }
        
        return this.tags[num] || [];
    }

    /**
     * Dodaje notatkę do analizy
     */
    async addNote(analysisNumber, note, author = 'system') {
        if (!this.initialized) {
            await this.initialize();
        }

        const num = parseInt(analysisNumber);
        
        if (!this.notes[num]) {
            this.notes[num] = [];
        }
        
        const noteRecord = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            author: author,
            content: note,
            type: 'user' // user, system, ai_suggestion
        };
        
        this.notes[num].push(noteRecord);
        await this.saveNotes();
        
        return noteRecord;
    }

    /**
     * Aktualizuje wynik konwersji
     */
    async updateConversionResult(analysisNumber, converted, actualPersonality = null) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysis = this.history.find(a => a.number === parseInt(analysisNumber));
        
        if (!analysis) {
            throw new Error(`Analysis #${analysisNumber} not found`);
        }

        analysis.conversion_result = converted;
        analysis.actual_personality = actualPersonality;
        analysis.updated_at = new Date().toISOString();
        
        await this.saveHistory();
        
        return analysis;
    }

    /**
     * Oznacza analizę jako przejrzaną
     */
    async markAsReviewed(analysisNumber, effectivenessScore = null) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysis = this.history.find(a => a.number === parseInt(analysisNumber));
        
        if (!analysis) {
            throw new Error(`Analysis #${analysisNumber} not found`);
        }

        analysis.reviewed = true;
        analysis.effectiveness_score = effectivenessScore;
        analysis.reviewed_at = new Date().toISOString();
        
        await this.saveHistory();
        
        return analysis;
    }

    /**
     * Generuje raport optymalizacji na podstawie historii
     */
    async generateOptimizationReport(timeframe = '30d') {
        if (!this.initialized) {
            await this.initialize();
        }

        const days = parseInt(timeframe.replace('d', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentAnalyses = this.history.filter(a => 
            new Date(a.timestamp) >= cutoffDate && a.conversion_result !== null
        );

        if (recentAnalyses.length === 0) {
            return {
                message: 'Brak danych do analizy optymalizacji',
                timeframe: timeframe,
                total_analyses: 0
            };
        }

        // Analiza skuteczności według osobowości
        const personalityStats = {};
        const triggerStats = {};
        const conversionRates = {
            overall: 0,
            by_personality: {},
            by_confidence_range: {},
            by_trigger_combination: {}
        };

        let totalConversions = 0;
        
        recentAnalyses.forEach(analysis => {
            const personality = analysis.results.personality?.detected?.DISC || 'Unknown';
            const converted = analysis.conversion_result;
            const confidence = analysis.results.confidence || 0;
            const triggers = analysis.input_data.selected_triggers || [];
            
            // Statystyki osobowości
            if (!personalityStats[personality]) {
                personalityStats[personality] = { total: 0, converted: 0 };
            }
            personalityStats[personality].total++;
            if (converted) {
                personalityStats[personality].converted++;
                totalConversions++;
            }
            
            // Statystyki triggerów
            triggers.forEach(trigger => {
                if (!triggerStats[trigger]) {
                    triggerStats[trigger] = { total: 0, converted: 0 };
                }
                triggerStats[trigger].total++;
                if (converted) {
                    triggerStats[trigger].converted++;
                }
            });
            
            // Statystyki według zakresu pewności
            const confidenceRange = this.getConfidenceRange(confidence);
            if (!conversionRates.by_confidence_range[confidenceRange]) {
                conversionRates.by_confidence_range[confidenceRange] = { total: 0, converted: 0 };
            }
            conversionRates.by_confidence_range[confidenceRange].total++;
            if (converted) {
                conversionRates.by_confidence_range[confidenceRange].converted++;
            }
        });

        // Oblicz wskaźniki konwersji
        conversionRates.overall = (totalConversions / recentAnalyses.length * 100).toFixed(2);
        
        Object.keys(personalityStats).forEach(personality => {
            const stats = personalityStats[personality];
            conversionRates.by_personality[personality] = {
                rate: (stats.converted / stats.total * 100).toFixed(2),
                total: stats.total,
                converted: stats.converted
            };
        });
        
        Object.keys(conversionRates.by_confidence_range).forEach(range => {
            const stats = conversionRates.by_confidence_range[range];
            stats.rate = (stats.converted / stats.total * 100).toFixed(2);
        });

        // Najskuteczniejsze triggery
        const topTriggers = Object.entries(triggerStats)
            .map(([trigger, stats]) => ({
                trigger,
                conversion_rate: (stats.converted / stats.total * 100).toFixed(2),
                total_uses: stats.total,
                conversions: stats.converted
            }))
            .filter(t => t.total_uses >= 3) // Minimum 3 użycia
            .sort((a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate))
            .slice(0, 10);

        // Rekomendacje optymalizacji
        const recommendations = this.generateOptimizationRecommendations(
            conversionRates, topTriggers, personalityStats
        );

        return {
            timeframe: timeframe,
            total_analyses: recentAnalyses.length,
            total_conversions: totalConversions,
            conversion_rates: conversionRates,
            top_triggers: topTriggers,
            personality_performance: conversionRates.by_personality,
            confidence_analysis: conversionRates.by_confidence_range,
            recommendations: recommendations,
            generated_at: new Date().toISOString()
        };
    }

    /**
     * Aktualizuje informacje o konwersji (kupił/nie kupił)
     */
    async updatePurchaseResult(analysisNumber, purchased, purchaseDetails = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysis = this.history.find(a => a.number === parseInt(analysisNumber));
        
        if (!analysis) {
            throw new Error(`Analysis #${analysisNumber} not found`);
        }

        analysis.purchase_result = {
            purchased: purchased,
            purchase_date: purchased ? new Date().toISOString() : null,
            model: purchaseDetails.model || null,
            configuration: purchaseDetails.configuration || null,
            final_price: purchaseDetails.finalPrice || null,
            financing_type: purchaseDetails.financingType || null, // cash, lease, loan
            delivery_date: purchaseDetails.deliveryDate || null,
            sales_person: purchaseDetails.salesPerson || null,
            updated_at: new Date().toISOString()
        };
        
        await this.saveHistory();
        
        return analysis;
    }

    /**
     * Dodaje feedback po jeździe testowej
     */
    async addTestDriveFeedback(analysisNumber, feedbackData) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysis = this.history.find(a => a.number === parseInt(analysisNumber));
        
        if (!analysis) {
            throw new Error(`Analysis #${analysisNumber} not found`);
        }

        const testDriveFeedback = {
            test_drive_date: feedbackData.testDriveDate || new Date().toISOString(),
            topics_discussed: feedbackData.topicsDiscussed || [], // ['range', 'charging', 'price', 'features', etc.]
            customer_concerns: feedbackData.customerConcerns || [],
            positive_reactions: feedbackData.positiveReactions || [],
            interest_level: feedbackData.interestLevel || 'medium', // low, medium, high, very_high
            next_steps_agreed: feedbackData.nextStepsAgreed || [],
            follow_up_date: feedbackData.followUpDate || null,
            sales_person_notes: feedbackData.salesPersonNotes || '',
            customer_readiness_score: this.calculateReadinessScore(feedbackData),
            recommendation: this.generateFollowUpRecommendation(feedbackData),
            added_at: new Date().toISOString()
        };

        if (!analysis.test_drive_feedback) {
            analysis.test_drive_feedback = [];
        }
        
        analysis.test_drive_feedback.push(testDriveFeedback);
        analysis.updated_at = new Date().toISOString();
        
        await this.saveHistory();
        
        return testDriveFeedback;
    }

    /**
     * Ocenia sensowność dalszej współpracy na podstawie poruszonych tematów
     */
    calculateReadinessScore(feedbackData) {
        let score = 0;
        const topics = feedbackData.topicsDiscussed || [];
        const concerns = feedbackData.customerConcerns || [];
        const positiveReactions = feedbackData.positiveReactions || [];
        const interestLevel = feedbackData.interestLevel || 'medium';

        // Punkty za poruszane tematy (im więcej konkretnych tematów, tym lepiej)
        const topicScores = {
            'range': 15,           // Zasięg - kluczowy temat
            'charging': 15,        // Ładowanie - kluczowy temat  
            'price': 10,           // Cena - ważny ale może być obiekcją
            'financing': 20,       // Finansowanie - bardzo pozytywny sygnał
            'leasing': 20,         // Leasing - bardzo pozytywny sygnał
            'features': 10,        // Funkcje - zainteresowanie produktem
            'autopilot': 12,       // Autopilot - zaawansowane funkcje
            'maintenance': 8,      // Serwis - praktyczne rozważania
            'insurance': 8,        // Ubezpieczenie - praktyczne rozważania
            'delivery': 25,        // Dostawa - bardzo pozytywny sygnał
            'trade_in': 15,        // Rozliczenie - konkretne działanie
            'warranty': 5,         // Gwarancja - standardowe pytanie
            'comparison': -5       // Porównania z konkurencją - może być negatywne
        };

        topics.forEach(topic => {
            score += topicScores[topic] || 5; // Domyślnie 5 punktów za każdy temat
        });

        // Punkty za poziom zainteresowania
        const interestScores = {
            'very_high': 30,
            'high': 20,
            'medium': 10,
            'low': -10
        };
        score += interestScores[interestLevel] || 0;

        // Punkty za pozytywne reakcje
        score += positiveReactions.length * 8;

        // Odejmij punkty za obawy (ale nie wszystkie są negatywne)
        const concernPenalties = {
            'price_too_high': -15,
            'range_anxiety': -10,
            'charging_infrastructure': -8,
            'technology_complexity': -5,
            'brand_trust': -12,
            'resale_value': -3,
            'delivery_time': -2
        };

        concerns.forEach(concern => {
            score += concernPenalties[concern] || -5;
        });

        // Normalizuj wynik do skali 0-100
        score = Math.max(0, Math.min(100, score));
        
        return Math.round(score);
    }

    /**
     * Generuje rekomendację dalszych działań
     */
    generateFollowUpRecommendation(feedbackData) {
        const score = this.calculateReadinessScore(feedbackData);
        const topics = feedbackData.topicsDiscussed || [];
        const concerns = feedbackData.customerConcerns || [];
        const interestLevel = feedbackData.interestLevel || 'medium';

        let recommendation = {
            action: '',
            priority: '',
            timeline: '',
            specific_actions: [],
            probability_assessment: ''
        };

        if (score >= 80) {
            recommendation.action = 'immediate_follow_up';
            recommendation.priority = 'very_high';
            recommendation.timeline = '24-48 hours';
            recommendation.probability_assessment = 'very_high';
            recommendation.specific_actions = [
                'Przygotuj ofertę finansową',
                'Zaproponuj konkretny termin finalizacji',
                'Przygotuj dokumenty do podpisu',
                'Sprawdź dostępność preferowanego modelu'
            ];
        } else if (score >= 60) {
            recommendation.action = 'active_nurturing';
            recommendation.priority = 'high';
            recommendation.timeline = '3-7 dni';
            recommendation.probability_assessment = 'high';
            recommendation.specific_actions = [
                'Wyślij spersonalizowaną ofertę',
                'Zaadresuj główne obawy klienta',
                'Zaproponuj dodatkową jazdę testową',
                'Przygotuj kalkulację TCO'
            ];
        } else if (score >= 40) {
            recommendation.action = 'educational_follow_up';
            recommendation.priority = 'medium';
            recommendation.timeline = '1-2 tygodnie';
            recommendation.probability_assessment = 'medium';
            recommendation.specific_actions = [
                'Wyślij materiały edukacyjne',
                'Zaproś na event Tesla',
                'Zaproponuj rozmowę z obecnym właścicielem',
                'Przygotuj porównanie z konkurencją'
            ];
        } else if (score >= 20) {
            recommendation.action = 'long_term_nurturing';
            recommendation.priority = 'low';
            recommendation.timeline = '1-3 miesiące';
            recommendation.probability_assessment = 'low';
            recommendation.specific_actions = [
                'Dodaj do newslettera',
                'Wyślij informacje o nowych modelach',
                'Zaproś na przyszłe eventy',
                'Monitoruj zmiany w sytuacji finansowej'
            ];
        } else {
            recommendation.action = 'minimal_contact';
            recommendation.priority = 'very_low';
            recommendation.timeline = '6+ miesięcy';
            recommendation.probability_assessment = 'very_low';
            recommendation.specific_actions = [
                'Okazjonalny kontakt przy nowych modelach',
                'Informacje o znaczących zmianach cenowych',
                'Zaproszenia na duże eventy'
            ];
        }

        // Dodaj specyficzne akcje na podstawie obaw
        if (concerns.includes('price_too_high')) {
            recommendation.specific_actions.push('Przygotuj alternatywne opcje finansowania');
        }
        if (concerns.includes('range_anxiety')) {
            recommendation.specific_actions.push('Przygotuj mapę ładowarek w okolicy klienta');
        }
        if (concerns.includes('charging_infrastructure')) {
            recommendation.specific_actions.push('Zaproponuj instalację domowej ładowarki');
        }

        return recommendation;
    }

    /**
     * Pobiera analizy z feedbackiem po jeździe testowej
     */
    async getAnalysesWithTestDriveFeedback(filters = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        let results = this.history.filter(a => a.test_drive_feedback && a.test_drive_feedback.length > 0);

        // Filtrowanie według poziomu gotowości
        if (filters.minReadinessScore) {
            results = results.filter(a => {
                const latestFeedback = a.test_drive_feedback[a.test_drive_feedback.length - 1];
                return latestFeedback.customer_readiness_score >= filters.minReadinessScore;
            });
        }

        // Filtrowanie według rekomendowanej akcji
        if (filters.recommendedAction) {
            results = results.filter(a => {
                const latestFeedback = a.test_drive_feedback[a.test_drive_feedback.length - 1];
                return latestFeedback.recommendation.action === filters.recommendedAction;
            });
        }

        // Sortowanie według wyniku gotowości
        results.sort((a, b) => {
            const aScore = a.test_drive_feedback[a.test_drive_feedback.length - 1].customer_readiness_score;
            const bScore = b.test_drive_feedback[b.test_drive_feedback.length - 1].customer_readiness_score;
            return bScore - aScore;
        });

        return results.map(analysis => ({
            ...analysis,
            tags: this.tags[analysis.number] || [],
            notes: this.notes[analysis.number] || []
        }));
    }

    /**
     * Generuje raport skuteczności sprzedaży
     */
    async generateSalesEffectivenessReport(timeframe = '30d') {
        if (!this.initialized) {
            await this.initialize();
        }

        const cutoffDate = new Date();
        if (timeframe === '7d') cutoffDate.setDate(cutoffDate.getDate() - 7);
        else if (timeframe === '30d') cutoffDate.setDate(cutoffDate.getDate() - 30);
        else if (timeframe === '90d') cutoffDate.setDate(cutoffDate.getDate() - 90);

        const recentAnalyses = this.history.filter(a => 
            new Date(a.timestamp) >= cutoffDate
        );

        const analysesWithPurchaseData = recentAnalyses.filter(a => 
            a.purchase_result !== undefined && a.purchase_result !== null
        );

        const analysesWithTestDrive = recentAnalyses.filter(a => 
            a.test_drive_feedback && a.test_drive_feedback.length > 0
        );

        const totalPurchases = analysesWithPurchaseData.filter(a => 
            a.purchase_result.purchased === true
        ).length;

        const conversionRate = analysesWithPurchaseData.length > 0 ? 
            (totalPurchases / analysesWithPurchaseData.length * 100).toFixed(2) : '0.00';

        const testDriveConversionRate = analysesWithTestDrive.length > 0 ? 
            (analysesWithTestDrive.filter(a => 
                a.purchase_result && a.purchase_result.purchased === true
            ).length / analysesWithTestDrive.length * 100).toFixed(2) : '0.00';

        // Analiza readiness score vs konwersja
        const readinessAnalysis = this.analyzeReadinessVsConversion(analysesWithTestDrive);

        return {
            timeframe,
            total_analyses: recentAnalyses.length,
            analyses_with_purchase_data: analysesWithPurchaseData.length,
            analyses_with_test_drive: analysesWithTestDrive.length,
            total_purchases: totalPurchases,
            overall_conversion_rate: conversionRate,
            test_drive_conversion_rate: testDriveConversionRate,
            readiness_score_analysis: readinessAnalysis,
            generated_at: new Date().toISOString()
        };
    }

    /**
     * Analizuje korelację między readiness score a konwersją
     */
    analyzeReadinessVsConversion(analysesWithTestDrive) {
        const scoreRanges = {
            'very_high': { min: 80, max: 100, total: 0, converted: 0 },
            'high': { min: 60, max: 79, total: 0, converted: 0 },
            'medium': { min: 40, max: 59, total: 0, converted: 0 },
            'low': { min: 20, max: 39, total: 0, converted: 0 },
            'very_low': { min: 0, max: 19, total: 0, converted: 0 }
        };

        analysesWithTestDrive.forEach(analysis => {
            const latestFeedback = analysis.test_drive_feedback[analysis.test_drive_feedback.length - 1];
            const score = latestFeedback.customer_readiness_score;
            const converted = analysis.purchase_result && analysis.purchase_result.purchased === true;

            Object.keys(scoreRanges).forEach(range => {
                const rangeData = scoreRanges[range];
                if (score >= rangeData.min && score <= rangeData.max) {
                    rangeData.total++;
                    if (converted) rangeData.converted++;
                }
            });
        });

        // Oblicz wskaźniki konwersji dla każdego zakresu
        Object.keys(scoreRanges).forEach(range => {
            const rangeData = scoreRanges[range];
            rangeData.conversion_rate = rangeData.total > 0 ? 
                (rangeData.converted / rangeData.total * 100).toFixed(2) : '0.00';
        });

        return scoreRanges;
    }

    /**
     * Pobiera statystyki ogólne
     */
    async getStats() {
        if (!this.initialized) {
            await this.initialize();
        }

        const totalAnalyses = this.history.length;
        const reviewedAnalyses = this.history.filter(a => a.reviewed).length;
        const convertedAnalyses = this.history.filter(a => a.conversion_result === true).length;
        const starredAnalyses = this.history.filter(a => a.starred).length;
        
        const uniqueTags = new Set();
        Object.values(this.tags).forEach(tagArray => {
            tagArray.forEach(tag => uniqueTags.add(tag));
        });
        
        const totalNotes = Object.values(this.notes).reduce((sum, noteArray) => 
            sum + noteArray.length, 0
        );

        return {
            total_analyses: totalAnalyses,
            current_counter: this.counter,
            reviewed_analyses: reviewedAnalyses,
            converted_analyses: convertedAnalyses,
            starred_analyses: starredAnalyses,
            unique_tags: uniqueTags.size,
            total_notes: totalNotes,
            conversion_rate: totalAnalyses > 0 ? 
                (convertedAnalyses / totalAnalyses * 100).toFixed(2) : '0.00'
        };
    }

    // Metody pomocnicze
    
    extractDominantTriggers(analysisData) {
        const triggers = analysisData.input?.selectedTriggers || [];
        return triggers.slice(0, 5); // Top 5 triggerów
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getConfidenceRange(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.6) return 'medium';
        if (confidence >= 0.4) return 'low';
        return 'very_low';
    }
    
    generateOptimizationRecommendations(conversionRates, topTriggers, personalityStats) {
        const recommendations = [];
        
        // Rekomendacje na podstawie osobowości
        const personalityRates = Object.entries(conversionRates.by_personality)
            .sort((a, b) => parseFloat(b[1].rate) - parseFloat(a[1].rate));
        
        if (personalityRates.length > 1) {
            const best = personalityRates[0];
            const worst = personalityRates[personalityRates.length - 1];
            
            recommendations.push({
                type: 'personality_optimization',
                priority: 'high',
                message: `Typ osobowości ${best[0]} ma najwyższą konwersję (${best[1].rate}%), podczas gdy ${worst[0]} najniższą (${worst[1].rate}%). Rozważ dostosowanie strategii dla typu ${worst[0]}.`
            });
        }
        
        // Rekomendacje na podstawie triggerów
        if (topTriggers.length > 0) {
            const bestTrigger = topTriggers[0];
            recommendations.push({
                type: 'trigger_optimization',
                priority: 'medium',
                message: `Trigger "${bestTrigger.trigger}" ma najwyższą skuteczność (${bestTrigger.conversion_rate}%). Rozważ częstsze jego wykorzystanie.`
            });
        }
        
        // Rekomendacje na podstawie pewności
        const confidenceRates = Object.entries(conversionRates.by_confidence_range);
        const highConfidence = confidenceRates.find(([range]) => range === 'high');
        const lowConfidence = confidenceRates.find(([range]) => range === 'low');
        
        if (highConfidence && lowConfidence) {
            const diff = parseFloat(highConfidence[1].rate) - parseFloat(lowConfidence[1].rate);
            if (diff > 20) {
                recommendations.push({
                    type: 'confidence_optimization',
                    priority: 'high',
                    message: `Analizy o wysokiej pewności mają ${diff.toFixed(1)}% wyższą konwersję. Rozważ poprawę algorytmów wykrywania osobowości.`
                });
            }
        }
        
        return recommendations;
    }

    // Metody zapisu
    
    async saveCounter() {
        await fs.writeFile(this.counterFile, JSON.stringify({ counter: this.counter }, null, 2));
    }
    
    async saveHistory() {
        await fs.writeFile(this.historyFile, JSON.stringify(this.history, null, 2));
    }
    
    async saveTags() {
        await fs.writeFile(this.tagsFile, JSON.stringify(this.tags, null, 2));
    }
    
    async saveNotes() {
        await fs.writeFile(this.notesFile, JSON.stringify(this.notes, null, 2));
    }
}

module.exports = AnalysisHistoryManager;