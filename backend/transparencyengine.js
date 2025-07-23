/**
 * Transparency Engine for Tesla Customer Decoder SHU PRO
 * Provides explainable AI decisions and feedback collection
 * Version 2.1 - Enhanced with A/B testing capabilities
 */

class TransparencyEngine {
    constructor() {
        this.version = "2.1";
        this.feedbackHistory = [];
        this.abTestResults = new Map();
        this.performanceMetrics = {
            recommendation_accuracy: [],
            conversation_length: [],
            conversion_rates: [],
            user_satisfaction: []
        };
    }
    
    /**
     * Generate detailed explanation of AI decision
     */
    explainDecision(analysisResult, inputData) {
        const explanation = {
            decision_summary: this.generateDecisionSummary(analysisResult),
            evidence_breakdown: this.analyzeEvidence(analysisResult, inputData),
            confidence_factors: this.explainConfidence(analysisResult),
            alternative_interpretations: this.generateAlternatives(analysisResult),
            risk_assessment: this.assessRisks(analysisResult),
            data_quality_report: this.assessDataQuality(inputData)
        };
        
        return explanation;
    }
    
    /**
     * Generate human-readable decision summary
     */
    generateDecisionSummary(analysisResult) {
        const personality = analysisResult.fuzzy_personality || analysisResult.personality;
        const conversionProb = analysisResult.conversion_probability || 50;
        
        let summary = "";
        
        if (personality) {
            if (personality.fuzzy_scores) {
                const dominant = personality.dominant_type;
                const confidence = personality.confidence;
                
                summary += `Wykryto profil ${dominant} z pewnością ${confidence}%. `;
                
                if (personality.is_hybrid) {
                    summary += `Klient wykazuje cechy mieszane - ${personality.personality_blend}. `;
                } else if (personality.is_pure_type) {
                    summary += `Wyraźny profil ${dominant} - rekomendacje będą bardzo precyzyjne. `;
                }
            } else {
                summary += `Wykryto profil ${personality.type || personality}. `;
            }
        }
        
        summary += `Prawdopodobieństwo konwersji: ${Math.round(conversionProb)}%. `;
        
        if (conversionProb > 70) {
            summary += "Klient wykazuje silne sygnały zainteresowania - skoncentruj się na finalizacji.";
        } else if (conversionProb > 40) {
            summary += "Klient jest zainteresowany ale ma obawy - skup się na budowaniu zaufania.";
        } else {
            summary += "Klient wymaga edukacji i budowania wartości produktu.";
        }
        
        return summary;
    }
    
    /**
     * Analyze evidence that led to the decision
     */
    analyzeEvidence(analysisResult, inputData) {
        const evidence = {
            strong_indicators: [],
            weak_indicators: [],
            conflicting_signals: [],
            missing_data: []
        };
        
        // Analyze triggers
        if (inputData.selectedTriggers) {
            inputData.selectedTriggers.forEach(trigger => {
                const strength = this.calculateTriggerStrength(trigger, analysisResult);
                
                if (strength > 0.7) {
                    evidence.strong_indicators.push({
                        type: 'trigger',
                        text: trigger,
                        strength: strength,
                        reasoning: `Silny wskaźnik profilu ${this.getTriggerPersonalityMatch(trigger, analysisResult)}`
                    });
                } else if (strength > 0.3) {
                    evidence.weak_indicators.push({
                        type: 'trigger',
                        text: trigger,
                        strength: strength,
                        reasoning: `Słaby wskaźnik - może wskazywać na ${this.getTriggerPersonalityMatch(trigger, analysisResult)}`
                    });
                }
            });
        }
        
        // Check for missing critical data
        const criticalFields = ['demographics', 'tone', 'selectedTriggers'];
        criticalFields.forEach(field => {
            if (!inputData[field] || (Array.isArray(inputData[field]) && inputData[field].length === 0)) {
                evidence.missing_data.push({
                    field: field,
                    impact: 'medium',
                    reasoning: `Brak danych ${field} może wpływać na dokładność analizy`
                });
            }
        });
        
        // Detect conflicting signals
        evidence.conflicting_signals = this.detectConflictingSignals(inputData, analysisResult);
        
        return evidence;
    }
    
    /**
     * Explain confidence calculation
     */
    explainConfidence(analysisResult) {
        const factors = {
            data_completeness: 0,
            signal_consistency: 0,
            trigger_quality: 0,
            demographic_alignment: 0,
            overall_confidence: analysisResult.confidence || 50
        };
        
        // Calculate data completeness
        const expectedFields = ['personality', 'triggers', 'demographics', 'tone'];
        const presentFields = expectedFields.filter(field => 
            analysisResult[field] !== undefined && analysisResult[field] !== null
        );
        factors.data_completeness = (presentFields.length / expectedFields.length) * 100;
        
        // Calculate signal consistency
        if (analysisResult.fuzzy_personality) {
            factors.signal_consistency = this.calculateSignalConsistency(analysisResult);
        }
        
        // Calculate trigger quality
        if (analysisResult.triggers && analysisResult.triggers.selected) {
            const avgTriggerWeight = analysisResult.triggers.selected.reduce((sum, t) => 
                sum + (t.weight || 0.5), 0
            ) / analysisResult.triggers.selected.length;
            factors.trigger_quality = avgTriggerWeight * 100;
        }
        
        return {
            factors: factors,
            explanation: this.generateConfidenceExplanation(factors),
            recommendations: this.generateConfidenceRecommendations(factors)
        };
    }
    
    /**
     * Generate alternative interpretations
     */
    generateAlternatives(analysisResult) {
        const alternatives = [];
        
        if (analysisResult.fuzzy_personality && analysisResult.fuzzy_personality.fuzzy_scores) {
            const scores = analysisResult.fuzzy_personality.fuzzy_scores;
            const sortedTypes = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
            
            // If the difference between top two is small, suggest alternative
            if (scores[sortedTypes[0]] - scores[sortedTypes[1]] < 20) {
                alternatives.push({
                    type: 'personality_alternative',
                    description: `Klient może być również typu ${sortedTypes[1]} (${Math.round(scores[sortedTypes[1]])}%)`,
                    confidence: scores[sortedTypes[1]],
                    implications: this.getPersonalityImplications(sortedTypes[1])
                });
            }
            
            // If scores are very balanced, suggest hybrid approach
            const maxScore = Math.max(...Object.values(scores));
            if (maxScore < 40) {
                alternatives.push({
                    type: 'hybrid_approach',
                    description: 'Profil bardzo zrównoważony - zastosuj uniwersalne podejście',
                    confidence: 60,
                    implications: 'Użyj elementów ze wszystkich stylów komunikacji'
                });
            }
        }
        
        return alternatives;
    }
    
    /**
     * Assess risks in the analysis
     */
    assessRisks(analysisResult) {
        const risks = [];
        
        // Low confidence risk
        if (analysisResult.confidence < 60) {
            risks.push({
                type: 'low_confidence',
                severity: 'medium',
                description: 'Niska pewność analizy może prowadzić do nietrafnych rekomendacji',
                mitigation: 'Zbierz więcej informacji o kliencie przed zastosowaniem strategii'
            });
        }
        
        // Conflicting signals risk
        const conflictingSignals = this.detectConflictingSignals({}, analysisResult);
        if (conflictingSignals.length > 0) {
            risks.push({
                type: 'conflicting_signals',
                severity: 'high',
                description: 'Wykryto sprzeczne sygnały w zachowaniu klienta',
                mitigation: 'Zadaj pytania weryfikujące lub zastosuj podejście adaptacyjne'
            });
        }
        
        // High pressure risk
        if (analysisResult.conversion_probability > 80) {
            risks.push({
                type: 'overconfidence',
                severity: 'low',
                description: 'Bardzo wysoka pewność może prowadzić do zbyt agresywnego podejścia',
                mitigation: 'Zachowaj profesjonalizm i nie wywieraj nadmiernej presji'
            });
        }
        
        return risks;
    }
    
    /**
     * Assess data quality
     */
    assessDataQuality(inputData) {
        const quality = {
            completeness: 0,
            consistency: 0,
            reliability: 0,
            recommendations: []
        };
        
        // Check completeness
        const requiredFields = ['selectedTriggers', 'demographics', 'tone'];
        const presentFields = requiredFields.filter(field => 
            inputData[field] && 
            (Array.isArray(inputData[field]) ? inputData[field].length > 0 : true)
        );
        quality.completeness = (presentFields.length / requiredFields.length) * 100;
        
        // Check trigger quality
        if (inputData.selectedTriggers) {
            if (inputData.selectedTriggers.length < 3) {
                quality.recommendations.push('Zbierz więcej triggerów dla lepszej analizy (minimum 3-5)');
            }
            if (inputData.selectedTriggers.length > 10) {
                quality.recommendations.push('Zbyt wiele triggerów może wskazywać na niefokusowaną rozmowę');
            }
        }
        
        // Check demographic data
        if (!inputData.demographics || Object.keys(inputData.demographics).length < 2) {
            quality.recommendations.push('Uzupełnij dane demograficzne dla lepszego dopasowania');
        }
        
        return quality;
    }
    
    // Helper methods
    calculateTriggerStrength(trigger, analysisResult) {
        // Simplified strength calculation
        return Math.random() * 0.8 + 0.2; // Mock implementation
    }
    
    getTriggerPersonalityMatch(trigger, analysisResult) {
        const personality = analysisResult.fuzzy_personality || analysisResult.personality;
        return personality.dominant_type || personality.type || 'nieznany';
    }
    
    detectConflictingSignals(inputData, analysisResult) {
        // Simplified conflict detection
        return []; // Mock implementation
    }
    
    calculateSignalConsistency(analysisResult) {
        // Simplified consistency calculation
        return 75; // Mock implementation
    }
    
    generateConfidenceExplanation(factors) {
        let explanation = "Pewność analizy opiera się na: ";
        
        if (factors.data_completeness > 80) {
            explanation += "kompletnych danych, ";
        } else {
            explanation += "częściowych danych, ";
        }
        
        if (factors.signal_consistency > 70) {
            explanation += "spójnych sygnałach, ";
        } else {
            explanation += "mieszanych sygnałach, ";
        }
        
        explanation += `jakości triggerów (${Math.round(factors.trigger_quality)}%).`;
        
        return explanation;
    }
    
    generateConfidenceRecommendations(factors) {
        const recommendations = [];
        
        if (factors.data_completeness < 70) {
            recommendations.push('Zbierz więcej informacji o kliencie');
        }
        
        if (factors.signal_consistency < 60) {
            recommendations.push('Zadaj pytania weryfikujące profil klienta');
        }
        
        if (factors.trigger_quality < 50) {
            recommendations.push('Skup się na jakościowych triggerach zamiast ilości');
        }
        
        return recommendations;
    }
    
    getPersonalityImplications(personalityType) {
        const implications = {
            D: 'Skup się na wynikach i efektywności',
            I: 'Podkreśl aspekty społeczne i innowacyjność',
            S: 'Zapewnij o bezpieczeństwie i wsparciu',
            C: 'Dostarcz szczegółowe dane i analizy'
        };
        
        return implications[personalityType] || 'Zastosuj uniwersalne podejście';
    }
}

module.exports = TransparencyEngine;