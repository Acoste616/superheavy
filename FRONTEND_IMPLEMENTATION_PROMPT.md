# 🎯 FRONTEND IMPLEMENTATION PROMPT
## Tesla Customer Decoder - Natychmiastowe Ulepszenia UI

### 📋 PROBLEM DO ROZWIĄZANIA
**Obecny stan:** Odpowiedzi przy triggerach są ucięte w `span` elementach, użytkownik nie widzi pełnej treści
**Cel:** Pełne, rozwijalne odpowiedzi z dodatkowymi strategiami i następnymi krokami

---

## 🔧 IMPLEMENTACJA FRONTENDU

### 1. MODYFIKACJA app-simple.js

#### A) Dodaj nowe funkcje rozwijania odpowiedzi:

```javascript
// Dodaj na początku pliku, po istniejących funkcjach

/**
 * Tworzy rozwijalną sekcję odpowiedzi dla triggera
 */
function createExpandableResponse(trigger, discType) {
    const responseData = trigger.disc_responses[discType] || trigger.disc_responses.D;
    const hasCompetitorInfo = trigger.category === 'konkurencyjne' || trigger.tags?.includes('competitor');
    
    return `
        <div class="trigger-response-container" data-trigger-id="${trigger.id}">
            <!-- PREVIEW (domyślnie widoczny) -->
            <div class="response-preview" id="preview-${trigger.id}">
                <div class="response-header">
                    <strong class="response-label">💬 Szybka odpowiedź:</strong>
                    <span class="disc-badge disc-${discType.toLowerCase()}">${discType}</span>
                </div>
                <div class="response-content">
                    <p class="response-text">${responseData.immediate_reply}</p>
                    <div class="response-actions">
                        <button class="expand-btn" onclick="expandResponse('${trigger.id}')">
                            <i class="fas fa-chevron-down"></i> Pokaż pełną strategię
                        </button>
                        ${hasCompetitorInfo ? `
                        <button class="competitor-btn" onclick="showCompetitorAnalysis('${trigger.id}')">
                            <i class="fas fa-chart-line"></i> Analiza konkurencji
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- FULL RESPONSE (domyślnie ukryty) -->
            <div class="response-full hidden" id="full-${trigger.id}">
                <div class="response-sections">
                    
                    <!-- Sekcja 1: Pełna odpowiedź -->
                    <div class="response-section immediate-section">
                        <h4><i class="fas fa-comments"></i> Pełna odpowiedź</h4>
                        <div class="response-box">
                            <p><strong>Natychmiastowa reakcja:</strong></p>
                            <p class="immediate-text">${responseData.immediate_reply}</p>
                            
                            <p><strong>Rozwinięcie:</strong></p>
                            <p class="detailed-text">${responseData.detailed_response || 'Szczegółowa odpowiedź w przygotowaniu...'}</p>
                        </div>
                    </div>
                    
                    <!-- Sekcja 2: Kluczowe punkty -->
                    <div class="response-section key-points-section">
                        <h4><i class="fas fa-bullseye"></i> Kluczowe punkty do podkreślenia</h4>
                        <ul class="key-points-list">
                            ${responseData.key_points ? responseData.key_points.map(point => `<li>${point}</li>`).join('') : '<li>Brak danych - uzupełnij w bazie</li>'}
                        </ul>
                    </div>
                    
                    <!-- Sekcja 3: Strategia komunikacji -->
                    <div class="response-section strategy-section">
                        <h4><i class="fas fa-chess"></i> Strategia dla typu ${discType}</h4>
                        <div class="strategy-box">
                            <p><strong>Styl komunikacji:</strong> ${responseData.communication_style || 'Dostosuj do typu DISC'}</p>
                            <p><strong>Fokus:</strong> ${responseData.focus_areas ? responseData.focus_areas.join(', ') : 'Dane, korzyści, bezpieczeństwo'}</p>
                            <p><strong>Tempo:</strong> ${responseData.pace || 'Dostosuj do klienta'}</p>
                        </div>
                    </div>
                    
                    <!-- Sekcja 4: Następne kroki -->
                    <div class="response-section next-steps-section">
                        <h4><i class="fas fa-arrow-right"></i> Następne kroki</h4>
                        <ol class="next-steps-list">
                            ${responseData.next_steps ? responseData.next_steps.map(step => `<li>${step}</li>`).join('') : `
                            <li>Zadaj pytanie uzupełniające</li>
                            <li>Przedstaw konkretne korzyści</li>
                            <li>Zaproponuj następne spotkanie/jazdę próbną</li>
                            `}
                        </ol>
                    </div>
                    
                    <!-- Sekcja 5: Czego unikać -->
                    <div class="response-section avoid-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> Unikaj</h4>
                        <ul class="avoid-list">
                            ${responseData.avoid ? responseData.avoid.map(item => `<li>${item}</li>`).join('') : `
                            <li>Zbyt agresywnej sprzedaży</li>
                            <li>Ignorowania obaw klienta</li>
                            <li>Zbyt technicznych szczegółów na początku</li>
                            `}
                        </ul>
                    </div>
                    
                    <!-- Sekcja 6: Dodatkowe wskazówki -->
                    <div class="response-section tips-section">
                        <h4><i class="fas fa-lightbulb"></i> Dodatkowe wskazówki</h4>
                        <div class="tips-grid">
                            <div class="tip-card">
                                <strong>🎯 Personalizacja:</strong>
                                <p>Dostosuj argumenty do sytuacji klienta (rodzina, biznes, hobby)</p>
                            </div>
                            <div class="tip-card">
                                <strong>📊 Dane:</strong>
                                <p>Przygotuj konkretne liczby i porównania</p>
                            </div>
                            <div class="tip-card">
                                <strong>🤝 Budowanie relacji:</strong>
                                <p>Słuchaj aktywnie i zadawaj pytania otwarte</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                <!-- Przyciski akcji -->
                <div class="response-actions-full">
                    <button class="collapse-btn" onclick="collapseResponse('${trigger.id}')">
                        <i class="fas fa-chevron-up"></i> Zwiń odpowiedź
                    </button>
                    <button class="copy-btn" onclick="copyResponseToClipboard('${trigger.id}')">
                        <i class="fas fa-copy"></i> Skopiuj odpowiedź
                    </button>
                    ${hasCompetitorInfo ? `
                    <button class="competitor-btn" onclick="showCompetitorAnalysis('${trigger.id}')">
                        <i class="fas fa-chart-line"></i> Pokaż konkurencję
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <!-- COMPETITOR ANALYSIS (domyślnie ukryty) -->
            <div class="competitor-analysis hidden" id="competitor-${trigger.id}">
                <div class="competitor-header">
                    <h4><i class="fas fa-chart-line"></i> Analiza konkurencji</h4>
                    <button class="close-competitor" onclick="hideCompetitorAnalysis('${trigger.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="competitor-content" id="competitor-content-${trigger.id}">
                    <!-- Dynamicznie wypełniane przez showCompetitorAnalysis() -->
                </div>
            </div>
        </div>
    `;
}

/**
 * Rozwija pełną odpowiedź
 */
function expandResponse(triggerId) {
    const preview = document.getElementById(`preview-${triggerId}`);
    const full = document.getElementById(`full-${triggerId}`);
    
    if (preview && full) {
        preview.classList.add('hidden');
        full.classList.remove('hidden');
        
        // Animacja
        full.style.opacity = '0';
        full.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            full.style.transition = 'all 0.3s ease';
            full.style.opacity = '1';
            full.style.transform = 'translateY(0)';
        }, 10);
        
        // Scroll do sekcji
        full.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Zwija odpowiedź do preview
 */
function collapseResponse(triggerId) {
    const preview = document.getElementById(`preview-${triggerId}`);
    const full = document.getElementById(`full-${triggerId}`);
    
    if (preview && full) {
        full.classList.add('hidden');
        preview.classList.remove('hidden');
        
        // Scroll do preview
        preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Kopiuje odpowiedź do schowka
 */
function copyResponseToClipboard(triggerId) {
    const fullSection = document.getElementById(`full-${triggerId}`);
    if (!fullSection) return;
    
    // Zbierz tekst z wszystkich sekcji
    const sections = fullSection.querySelectorAll('.response-section');
    let textToCopy = '';
    
    sections.forEach(section => {
        const title = section.querySelector('h4')?.textContent || '';
        const content = section.querySelector('.response-box, .key-points-list, .strategy-box, .next-steps-list, .avoid-list');
        
        if (content) {
            textToCopy += `${title}\n`;
            textToCopy += content.textContent.trim() + '\n\n';
        }
    });
    
    // Kopiuj do schowka
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Pokaż powiadomienie
        showNotification('Odpowiedź skopiowana do schowka!', 'success');
    }).catch(err => {
        console.error('Błąd kopiowania:', err);
        showNotification('Błąd kopiowania do schowka', 'error');
    });
}

/**
 * Pokazuje analizę konkurencji
 */
function showCompetitorAnalysis(triggerId) {
    const competitorSection = document.getElementById(`competitor-${triggerId}`);
    const competitorContent = document.getElementById(`competitor-content-${triggerId}`);
    
    if (!competitorSection || !competitorContent) return;
    
    // Załaduj dane o konkurencji (z globalnej zmiennej lub API)
    const competitorData = getCompetitorDataForTrigger(triggerId);
    
    if (competitorData) {
        competitorContent.innerHTML = createCompetitorAnalysisHTML(competitorData);
        competitorSection.classList.remove('hidden');
        
        // Scroll do sekcji
        competitorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Ukrywa analizę konkurencji
 */
function hideCompetitorAnalysis(triggerId) {
    const competitorSection = document.getElementById(`competitor-${triggerId}`);
    if (competitorSection) {
        competitorSection.classList.add('hidden');
    }
}

/**
 * Tworzy HTML dla analizy konkurencji
 */
function createCompetitorAnalysisHTML(competitorData) {
    return `
        <div class="competitor-grid">
            ${competitorData.competitors.map(competitor => `
                <div class="competitor-card">
                    <div class="competitor-header">
                        <h5>${competitor.name}</h5>
                        <span class="competitor-price">${competitor.price}</span>
                    </div>
                    <div class="competitor-details">
                        <div class="competitor-weaknesses">
                            <strong>❌ Słabe strony:</strong>
                            <ul>
                                ${competitor.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="tesla-advantages">
                            <strong>✅ Przewagi Tesla:</strong>
                            <ul>
                                ${competitor.tesla_advantages.map(advantage => `<li>${advantage}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="competitor-summary">
            <h5>🎯 Kluczowe argumenty vs konkurencja:</h5>
            <div class="key-arguments">
                ${competitorData.key_arguments.map(arg => `
                    <div class="argument-card">
                        <strong>${arg.title}</strong>
                        <p>${arg.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Pobiera dane o konkurencji dla danego triggera
 */
function getCompetitorDataForTrigger(triggerId) {
    // Tutaj powinna być logika pobierania danych z bazy
    // Na razie zwracamy przykładowe dane
    
    const mockCompetitorData = {
        competitors: [
            {
                name: "BMW iX3",
                price: "297,000 PLN",
                weaknesses: ["Tylko napęd tylny", "Mniejsza bateria (74 kWh)", "Krótszy zasięg (460 km)"],
                tesla_advantages: ["Dłuższy zasięg (602 km)", "Szybsze przyspieszenie", "Aktualizacje OTA"]
            },
            {
                name: "Hyundai Ioniq 5",
                price: "214,900-289,900 PLN",
                weaknesses: ["Niższa jakość wnętrza", "Mniejszy prestiż marki", "Ograniczona sieć serwisowa"],
                tesla_advantages: ["Sieć Supercharger", "Lepszy software", "Wyższa wartość odsprzedaży"]
            }
        ],
        key_arguments: [
            {
                title: "Zasięg i efektywność",
                description: "Tesla oferuje najdłuższy zasięg w klasie i najlepszą efektywność energetyczną"
            },
            {
                title: "Infrastruktura ładowania",
                description: "Największa i najszybsza sieć Supercharger w Europie"
            },
            {
                title: "Technologia i aktualizacje",
                description: "Regularne aktualizacje OTA dodają nowe funkcje bez wizyty w serwisie"
            }
        ]
    };
    
    return mockCompetitorData;
}

/**
 * Pokazuje powiadomienie
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animacja pojawienia
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Usunięcie po 3 sekundach
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
```

#### B) Modyfikuj funkcję renderTriggers():

```javascript
// Znajdź funkcję renderTriggers() i zastąp sekcję tworzenia HTML dla triggerów

function renderTriggers(triggers, selectedPersonality) {
    const triggerGrid = document.getElementById('triggerGrid');
    if (!triggerGrid) return;
    
    triggerGrid.innerHTML = '';
    
    triggers.forEach(trigger => {
        const triggerCard = document.createElement('div');
        triggerCard.className = `trigger-card ${trigger.category}`;
        triggerCard.dataset.triggerId = trigger.id;
        
        // Określ typ DISC dla odpowiedzi
        const discType = selectedPersonality || 'D';
        
        triggerCard.innerHTML = `
            <div class="trigger-header">
                <h3>${trigger.name}</h3>
                <div class="trigger-meta">
                    <span class="trigger-category">${trigger.category}</span>
                    <span class="trigger-weight">Waga: ${trigger.weight}</span>
                </div>
            </div>
            
            <div class="trigger-description">
                <p>${trigger.description}</p>
            </div>
            
            <!-- NOWA SEKCJA: Rozwijalna odpowiedź -->
            ${createExpandableResponse(trigger, discType)}
            
            <div class="trigger-actions">
                <button class="select-trigger-btn" onclick="selectTrigger('${trigger.id}')">
                    <i class="fas fa-plus"></i> Wybierz trigger
                </button>
            </div>
        `;
        
        triggerGrid.appendChild(triggerCard);
    });
}
```

### 2. DODAJ NOWE STYLE CSS

#### Dodaj do main.html w sekcji `<style>`:

```css
/* === ROZWIJALNE ODPOWIEDZI === */
.trigger-response-container {
    margin: 15px 0;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.response-preview {
    padding: 15px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.response-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.response-label {
    color: #2c3e50;
    font-size: 14px;
}

.disc-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    color: white;
}

.disc-d { background: #e74c3c; }
.disc-i { background: #f39c12; }
.disc-s { background: #27ae60; }
.disc-c { background: #3498db; }

.response-text {
    color: #34495e;
    line-height: 1.5;
    margin: 0;
}

.response-actions {
    margin-top: 12px;
    display: flex;
    gap: 10px;
}

.expand-btn, .competitor-btn, .collapse-btn, .copy-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 5px;
}

.expand-btn {
    background: #3498db;
    color: white;
}

.expand-btn:hover {
    background: #2980b9;
}

.competitor-btn {
    background: #e67e22;
    color: white;
}

.competitor-btn:hover {
    background: #d35400;
}

.collapse-btn {
    background: #95a5a6;
    color: white;
}

.copy-btn {
    background: #27ae60;
    color: white;
}

/* === PEŁNA ODPOWIEDŹ === */
.response-full {
    background: white;
    padding: 20px;
}

.response-sections {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.response-section {
    border: 1px solid #ecf0f1;
    border-radius: 8px;
    padding: 15px;
    background: #fdfdfd;
}

.response-section h4 {
    margin: 0 0 12px 0;
    color: #2c3e50;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.response-section h4 i {
    color: #3498db;
}

.response-box {
    background: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    border-left: 4px solid #3498db;
}

.immediate-text {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 10px;
}

.detailed-text {
    color: #34495e;
    line-height: 1.6;
}

.key-points-list, .next-steps-list, .avoid-list {
    margin: 0;
    padding-left: 20px;
}

.key-points-list li, .next-steps-list li, .avoid-list li {
    margin-bottom: 8px;
    line-height: 1.5;
    color: #34495e;
}

.strategy-box {
    background: #e8f5e8;
    padding: 12px;
    border-radius: 6px;
    border-left: 4px solid #27ae60;
}

.strategy-box p {
    margin: 5px 0;
    color: #2c3e50;
}

.tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.tip-card {
    background: #fff3cd;
    padding: 12px;
    border-radius: 6px;
    border-left: 4px solid #ffc107;
}

.tip-card strong {
    color: #856404;
    display: block;
    margin-bottom: 5px;
}

.tip-card p {
    margin: 0;
    color: #664d03;
    font-size: 13px;
    line-height: 1.4;
}

.response-actions-full {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #ecf0f1;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* === ANALIZA KONKURENCJI === */
.competitor-analysis {
    background: #f1f2f6;
    border-top: 1px solid #ddd;
    padding: 20px;
}

.competitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.competitor-header h4 {
    margin: 0;
    color: #2c3e50;
}

.close-competitor {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.competitor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.competitor-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.competitor-card h5 {
    margin: 0 0 10px 0;
    color: #2c3e50;
}

.competitor-price {
    background: #e74c3c;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
}

.competitor-weaknesses, .tesla-advantages {
    margin: 10px 0;
}

.competitor-weaknesses ul, .tesla-advantages ul {
    margin: 5px 0;
    padding-left: 20px;
}

.competitor-weaknesses li {
    color: #e74c3c;
}

.tesla-advantages li {
    color: #27ae60;
}

.competitor-summary {
    background: white;
    border-radius: 8px;
    padding: 15px;
}

.key-arguments {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    margin-top: 10px;
}

.argument-card {
    background: #e8f5e8;
    padding: 12px;
    border-radius: 6px;
    border-left: 4px solid #27ae60;
}

.argument-card strong {
    color: #2c3e50;
    display: block;
    margin-bottom: 5px;
}

.argument-card p {
    margin: 0;
    color: #34495e;
    font-size: 13px;
    line-height: 1.4;
}

/* === POWIADOMIENIA === */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background: #27ae60;
}

.notification-error {
    background: #e74c3c;
}

.notification-info {
    background: #3498db;
}

/* === RESPONSYWNOŚĆ === */
@media (max-width: 768px) {
    .response-actions, .response-actions-full {
        flex-direction: column;
    }
    
    .tips-grid {
        grid-template-columns: 1fr;
    }
    
    .competitor-grid {
        grid-template-columns: 1fr;
    }
    
    .key-arguments {
        grid-template-columns: 1fr;
    }
}

/* === UKRYWANIE === */
.hidden {
    display: none !important;
}
```

### 3. TESTOWANIE

#### Kroki testowania:
1. Otwórz aplikację
2. Wybierz typ osobowości
3. Sprawdź czy triggery mają przyciski "Pokaż więcej"
4. Kliknij "Pokaż więcej" - powinna rozwinąć się pełna odpowiedź
5. Sprawdź wszystkie sekcje (kluczowe punkty, strategia, następne kroki)
6. Przetestuj kopiowanie do schowka
7. Sprawdź analizę konkurencji (jeśli dostępna)
8. Przetestuj zwijanie odpowiedzi

---

## 🚀 NASTĘPNE KROKI

Po zaimplementowaniu frontendu:
1. **Backend Enhancement** - rozszerz dane w triggers.json
2. **Competitor Integration** - dodaj pełne dane o konkurencji
3. **Cultural Adaptation** - zaimplementuj polskie specyfiki
4. **Performance Optimization** - zoptymalizuj ładowanie danych

**Czy chcesz, żebym przygotował szczegółowy prompt dla backendu?**