/**
 * Conversation Tracker JavaScript
 * Handles post-conversation data collection and analysis
 */

class ConversationTracker {
    constructor() {
        this.newTriggers = [];
        this.apiBase = 'http://localhost:3000/api';
        this.currentCustomerId = null;
        this.currentSessionId = this.generateSessionId();
        
        this.init();
    }

    init() {
        // Initialize session ID
        document.getElementById('sessionId').value = this.currentSessionId;
        
        // Load customer ID from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const customerId = urlParams.get('customerId');
        if (customerId) {
            document.getElementById('customerId').value = customerId;
            this.currentCustomerId = customerId;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add new trigger
        document.getElementById('addNewTrigger').addEventListener('click', () => {
            this.addNewTrigger();
        });

        // Enter key on trigger input
        document.getElementById('newTriggerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewTrigger();
            }
        });

        // Outcome selection
        document.querySelectorAll('input[name="outcome"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                // Update visual selection
                document.querySelectorAll('.outcome-card').forEach(card => {
                    card.classList.remove('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
                });
                
                const selectedCard = e.target.closest('label').querySelector('.outcome-card');
                selectedCard.classList.add('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
            });
        });

        // Reactions selection
        document.querySelectorAll('input[name="reactions"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const card = e.target.closest('label').querySelector('.reaction-card');
                if (e.target.checked) {
                    card.classList.add('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
                } else {
                    card.classList.remove('border-tesla-red', 'bg-tesla-red', 'bg-opacity-20');
                }
            });
        });

        // Save conversation
        document.getElementById('saveConversation').addEventListener('click', () => {
            this.saveConversation();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('bookTestDrive').addEventListener('click', () => {
            this.bookTestDrive();
        });

        document.getElementById('viewJourney').addEventListener('click', () => {
            this.viewCustomerJourney();
        });
    }

    addNewTrigger() {
        const input = document.getElementById('newTriggerInput');
        const triggerText = input.value.trim();
        
        if (triggerText && !this.newTriggers.includes(triggerText)) {
            this.newTriggers.push(triggerText);
            input.value = '';
            this.updateNewTriggersList();
        }
    }

    updateNewTriggersList() {
        const container = document.getElementById('newTriggersList');
        container.innerHTML = this.newTriggers.map(trigger => `
            <div class="flex items-center justify-between bg-tesla-gray-900 p-3 rounded-lg">
                <span class="text-white">${trigger}</span>
                <button onclick="conversationTracker.removeNewTrigger('${trigger}')" 
                        class="text-red-500 hover:text-red-400">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    removeNewTrigger(trigger) {
        this.newTriggers = this.newTriggers.filter(t => t !== trigger);
        this.updateNewTriggersList();
    }

    getSelectedReactions() {
        return Array.from(document.querySelectorAll('input[name="reactions"]:checked'))
            .map(input => ({
                type: input.value,
                timestamp: new Date().toISOString()
            }));
    }

    getSelectedNextSteps() {
        return Array.from(document.querySelectorAll('input[name="nextSteps"]:checked'))
            .map(input => input.value);
    }

    async saveConversation() {
        try {
            const customerId = document.getElementById('customerId').value.trim();
            if (!customerId) {
                alert('Proszę podać ID klienta');
                return;
            }

            const outcome = document.querySelector('input[name="outcome"]:checked')?.value;
            if (!outcome) {
                alert('Proszę wybrać wynik rozmowy');
                return;
            }

            const conversationData = {
                customerId: customerId,
                sessionId: this.currentSessionId,
                conversationOutcome: outcome,
                newTriggers: this.newTriggers,
                clientReactions: this.getSelectedReactions(),
                nextSteps: this.getSelectedNextSteps(),
                additionalNotes: document.getElementById('additionalNotes').value,
                timestamp: new Date().toISOString()
            };

            this.showLoading();

            const response = await fetch(`${this.apiBase}/conversation/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(conversationData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.displayResults(result);
                this.showModal();
            } else {
                throw new Error(result.error || 'Nieznany błąd');
            }

        } catch (error) {
            console.error('Save conversation error:', error);
            alert(`Błąd zapisywania rozmowy: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    displayResults(result) {
        const { updatedProbability, followUpActions } = result;
        
        const content = document.getElementById('resultsContent');
        content.innerHTML = `
            <div class="space-y-6">
                <!-- Updated Probability -->
                <div class="bg-tesla-gray-900 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-tesla-red mb-3">
                        <i class="fas fa-percentage mr-2"></i>Zaktualizowane Prawdopodobieństwo Konwersji
                    </h3>
                    <div class="flex items-center space-x-4">
                        <div class="flex-1">
                            <div class="bg-tesla-gray-800 rounded-full h-4">
                                <div class="bg-gradient-to-r from-tesla-red to-red-600 h-4 rounded-full transition-all duration-1000" 
                                     style="width: ${Math.round(updatedProbability.probability * 100)}%"></div>
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-tesla-red">
                            ${Math.round(updatedProbability.probability * 100)}%
                        </div>
                    </div>
                    <p class="text-tesla-gray-400 text-sm mt-2">
                        Etap: ${this.translateStage(updatedProbability.stage)}
                    </p>
                </div>

                <!-- Influencing Factors -->
                ${updatedProbability.factors && updatedProbability.factors.length > 0 ? `
                <div class="bg-tesla-gray-900 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-tesla-red mb-3">
                        <i class="fas fa-chart-line mr-2"></i>Czynniki Wpływające
                    </h3>
                    <div class="space-y-2">
                        ${updatedProbability.factors.map(factor => `
                            <div class="flex justify-between items-center">
                                <span class="text-tesla-gray-300">${factor.factor}</span>
                                <span class="text-green-400 font-semibold">${factor.impact}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Follow-up Actions -->
                <div class="bg-tesla-gray-900 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-tesla-red mb-3">
                        <i class="fas fa-tasks mr-2"></i>Rekomendowane Działania
                    </h3>
                    <div class="space-y-3">
                        ${followUpActions.map(action => `
                            <div class="flex items-start space-x-3 p-3 bg-tesla-gray-800 rounded">
                                <div class="w-6 h-6 bg-tesla-red rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    ${action.priority}
                                </div>
                                <div class="flex-1">
                                    <div class="text-white font-medium">${action.action}</div>
                                    <div class="text-tesla-gray-400 text-sm">${action.timeframe}</div>
                                    <div class="text-tesla-gray-500 text-xs mt-1">${action.reason}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Recommendations -->
                ${updatedProbability.recommendations && updatedProbability.recommendations.length > 0 ? `
                <div class="bg-tesla-gray-900 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-tesla-red mb-3">
                        <i class="fas fa-lightbulb mr-2"></i>Dodatkowe Rekomendacje
                    </h3>
                    <div class="space-y-2">
                        ${updatedProbability.recommendations.map(rec => `
                            <div class="p-2 bg-tesla-gray-800 rounded flex justify-between">
                                <span class="text-tesla-gray-300">${rec.action}</span>
                                <span class="text-xs text-tesla-gray-500">${rec.timing}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    async bookTestDrive() {
        const customerId = document.getElementById('customerId').value;
        if (customerId) {
            window.location.href = `testdrive-booking.html?customerId=${customerId}`;
        }
    }

    async viewCustomerJourney() {
        const customerId = document.getElementById('customerId').value;
        if (customerId) {
            window.location.href = `customer-journey.html?customerId=${customerId}`;
        }
    }

    showModal() {
        document.getElementById('resultsModal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('resultsModal').classList.add('hidden');
    }

    showLoading() {
        const button = document.getElementById('saveConversation');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analizowanie...';
    }

    hideLoading() {
        const button = document.getElementById('saveConversation');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-save mr-2"></i>Zapisz Rozmowę i Wygeneruj Rekomendacje';
    }

    translateStage(stage) {
        const translations = {
            'initial_analysis': 'Pierwsza analiza',
            'post_conversation': 'Po rozmowie',
            'test_drive_booked': 'Umówiona jazda testowa',
            'post_test_drive': 'Po jeździe testowej',
            'purchase': 'Zakup'
        };
        return translations[stage] || stage;
    }

    generateSessionId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.conversationTracker = new ConversationTracker();
});