/**
 * Customer Decoder Engine 2.0 - Enhanced Question System
 * Based on Polish market data (waznedane.csv), predictive factors (dane1.txt), and global insights (dane2.csv)
 * Maximum 50 questions categorized for optimal data collection
 * Version 2.0 - Polish Market Optimized
 * 
 * OPTIMIZED QUESTION SET - LIMITED TO 50 QUESTIONS TOTAL
 * Distribution:
 * - Charging Infrastructure: 8 questions (16%)
 * - Daily Usage & Commute: 7 questions (14%)
 * - Competitive Analysis: 8 questions (16%)
 * - Financial & Purchase Process: 8 questions (16%)
 * - Demographics & Lifestyle: 7 questions (14%)
 * - Technology & Features: 6 questions (12%)
 * - Environmental & Values: 6 questions (12%)
 * TOTAL: 50 questions
 */

class CustomerDecoderQuestions {
    constructor() {
        this.version = "2.0";
        this.maxQuestions = 50;
        this.lastUpdate = new Date().toISOString();
        
        // Question categories with weights based on research data
        this.questionCategories = {
            // Category 1: Charging Infrastructure (Weight: 20% - Top predictive factor)
            charging_infrastructure: {
                weight: 0.20,
                max_questions: 8,
                priority: 1,
                questions: [
                    {
                        id: "charging_home_work",
                        text: "Czy masz możliwość ładowania w domu lub w pracy?",
                        type: "multiple_choice",
                        options: ["Dom - garaż/parking", "Praca - parking firmowy", "Oba miejsca", "Żadne z powyższych"],
                        weight: 10,
                        required: true,
                        predictive_factor: "home_work_charging"
                    },
                    {
                        id: "charging_infrastructure_concern",
                        text: "Jakie są Twoje główne obawy dotyczące ładowania?",
                        type: "multiple_select",
                        options: ["Brak punktów ładowania", "Czas ładowania", "Koszt ładowania", "Niezawodność stacji", "Nie mam obaw"],
                        weight: 8,
                        predictive_factor: "charging_concerns"
                    },
                    {
                        id: "public_charging_usage",
                        text: "Jak często planujesz korzystać z publicznych stacji ładowania?",
                        type: "single_choice",
                        options: ["Codziennie", "Kilka razy w tygodniu", "Okazjonalnie", "Bardzo rzadko", "Wcale"],
                        weight: 7,
                        predictive_factor: "public_charging_frequency"
                    },
                    {
                        id: "charging_speed_importance",
                        text: "Jak ważna jest dla Ciebie szybkość ładowania?",
                        type: "scale",
                        scale: [1, 5],
                        weight: 6,
                        predictive_factor: "charging_speed_priority"
                    },
                    {
                        id: "supercharger_network",
                        text: "Czy znasz sieć Supercharger Tesla?",
                        type: "single_choice",
                        options: ["Tak, korzystałem", "Tak, ale nie korzystałem", "Słyszałem o niej", "Nie znam"],
                        weight: 6,
                        predictive_factor: "supercharger_awareness"
                    },
                    {
                        id: "home_charging_installation",
                        text: "Czy jesteś gotowy na instalację domowej stacji ładowania?",
                        type: "single_choice",
                        options: ["Tak, już mam", "Tak, planuję instalację", "Rozważam", "Nie, nie mogę", "Nie wiem"],
                        weight: 7,
                        predictive_factor: "home_charging_readiness"
                    },
                    {
                        id: "charging_cost_perception",
                        text: "Jak postrzegasz koszty ładowania w porównaniu do paliwa?",
                        type: "single_choice",
                        options: ["Znacznie tańsze", "Nieco tańsze", "Podobne", "Droższe", "Nie wiem"],
                        weight: 5,
                        predictive_factor: "charging_cost_perception"
                    },
                    {
                        id: "charging_convenience",
                        text: "Co jest dla Ciebie najważniejsze w ładowaniu?",
                        type: "single_choice",
                        options: ["Wygoda (ładowanie w domu)", "Szybkość (szybkie ładowanie)", "Koszt (najtańsze opcje)", "Dostępność (dużo stacji)", "Niezawodność"],
                        weight: 6,
                        predictive_factor: "charging_priority"
                    }
                ]
            },
            
            // Category 2: Daily Usage & Commute (Weight: 18% - Second highest predictive factor)
            daily_usage: {
                weight: 0.18,
                max_questions: 7,
                priority: 2,
                questions: [
                    {
                        id: "daily_commute_distance",
                        text: "Ile kilometrów dziennie średnio przejezdzasz?",
                        type: "select",
                        options: ["Poniżej 50 km", "50-100 km", "100-150 km", "150-200 km", "Ponad 200 km"],
                        weight: 9, // Second highest predictive factor
                        required: true
                    },
                    {
                        id: "weekly_long_trips",
                        text: "Jak często jeździsz na trasy dłuższe niż 300 km?",
                        type: "select",
                        options: ["Nigdy", "Raz w miesiącu", "2-3 razy w miesiącu", "Raz w tygodniu", "Kilka razy w tygodniu"],
                        weight: 7
                    },
                    {
                        id: "driving_style",
                        text: "Jak opisałbyś swój styl jazdy?",
                        type: "select",
                        options: ["Spokojny i ekonomiczny", "Umiarkowany", "Dynamiczny", "Sportowy"],
                        weight: 5
                    },
                    {
                        id: "parking_location",
                        text: "Gdzie najczęściej parkujesz swój samochód?",
                        type: "select",
                        options: ["Garaż podziemny", "Garaż naziemny", "Parking strzeżony", "Ulica", "Parking przy domu"],
                        weight: 6
                    },
                    {
                        id: "business_travel",
                        text: "Czy używasz samochodu do podróży służbowych?",
                        type: "boolean",
                        weight: 6,
                        follow_up: {
                            true: "business_travel_frequency"
                        }
                    },
                    {
                        id: "business_travel_frequency",
                        text: "Jak często podróżujesz służbowo?",
                        type: "select",
                        options: ["Kilka razy w tygodniu", "Raz w tygodniu", "Kilka razy w miesiącu", "Rzadko"],
                        weight: 5,
                        conditional: "business_travel === true"
                    },
                    {
                        id: "family_usage",
                        text: "Czy samochód będzie używany przez innych członków rodziny?",
                        type: "boolean",
                        weight: 4
                    }
                ]
            },
            
            // Category 3: Competitive Analysis & Decision Process (Weight: 16%)
            competitive_analysis: {
                weight: 0.16,
                max_questions: 8,
                priority: 3,
                questions: [
                    {
                        id: "competitor_consideration",
                        text: "Które inne marki samochodów elektrycznych rozważasz?",
                        type: "multiselect",
                        options: ["BMW (iX, i4, iX3)", "Mercedes (EQC, EQS, EQA)", "Audi (e-tron, Q4 e-tron)", "Volvo (XC40, C40)", "Polestar", "Genesis", "Porsche Taycan", "Nie rozważam innych"],
                        weight: 9, // Third highest predictive factor
                        required: true
                    },
                    {
                        id: "current_brand",
                        text: "Jaką markę samochodu obecnie posiadasz?",
                        type: "select",
                        options: ["BMW", "Mercedes", "Audi", "Volvo", "Toyota", "Volkswagen", "Skoda", "Ford", "Inne premium", "Inne mainstream", "Nie mam samochodu"],
                        weight: 5
                    },
                    {
                        id: "brand_loyalty",
                        text: "Jak ważna jest dla Ciebie lojalność wobec marki?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 4
                    },
                    {
                        id: "tesla_advantages",
                        text: "Co najbardziej przyciąga Cię w Tesli?",
                        type: "multiselect",
                        options: ["Technologia i innowacje", "Sieć Supercharger", "Zasięg", "Osiągi", "Autopilot", "Design", "Ekologia", "Prestiż marki", "Aktualizacje OTA"],
                        weight: 7
                    },
                    {
                        id: "tesla_concerns",
                        text: "Jakie masz obawy związane z Teslą?",
                        type: "multiselect",
                        options: ["Jakość wykonania", "Serwis i wsparcie", "Cena", "Dostępność części", "Niezawodność", "Brak tradycyjnego dealera", "Nie mam obaw"],
                        weight: 6
                    },
                    {
                        id: "decision_timeline",
                        text: "W jakim czasie planujesz zakup?",
                        type: "select",
                        options: ["W ciągu miesiąca", "W ciągu 3 miesięcy", "W ciągu 6 miesięcy", "W ciągu roku", "Ponad rok"],
                        weight: 8
                    },
                    {
                        id: "test_drive_other_brands",
                        text: "Czy testowałeś już inne samochody elektryczne?",
                        type: "boolean",
                        weight: 5,
                        follow_up: {
                            true: "test_drive_experience"
                        }
                    },
                    {
                        id: "test_drive_experience",
                        text: "Jak oceniasz dotychczasowe doświadczenia z testami innych EV?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 4,
                        conditional: "test_drive_other_brands === true"
                    }
                ]
            },
            
            // Category 4: Financial & Purchase Process (Weight: 15%)
            financial_process: {
                weight: 0.15,
                max_questions: 8,
                priority: 4,
                questions: [
                    {
                        id: "financing_preference",
                        text: "Jaka forma finansowania Cię interesuje?",
                        type: "select",
                        options: ["Zakup gotówkowy", "Kredyt samochodowy", "Leasing operacyjny", "Leasing finansowy", "Wynajem długoterminowy", "Jeszcze nie wiem"],
                        weight: 8, // Fourth highest predictive factor
                        required: true
                    },
                    {
                        id: "budget_range",
                        text: "Jaki jest Twój budżet na samochód?",
                        type: "select",
                        options: ["Do 200 tys. zł", "200-300 tys. zł", "300-400 tys. zł", "400-500 tys. zł", "Ponad 500 tys. zł"],
                        weight: 7
                    },
                    {
                        id: "trade_in_interest",
                        text: "Czy chcesz rozliczyć obecny samochód?",
                        type: "boolean",
                        weight: 5,
                        follow_up: {
                            true: "current_car_value"
                        }
                    },
                    {
                        id: "current_car_value",
                        text: "Jaka jest szacunkowa wartość Twojego obecnego samochodu?",
                        type: "select",
                        options: ["Do 50 tys. zł", "50-100 tys. zł", "100-150 tys. zł", "150-200 tys. zł", "Ponad 200 tys. zł"],
                        weight: 4,
                        conditional: "trade_in_interest === true"
                    },
                    {
                        id: "business_purchase",
                        text: "Czy zakup będzie na firmę?",
                        type: "boolean",
                        weight: 6,
                        follow_up: {
                            true: "business_benefits_interest"
                        }
                    },
                    {
                        id: "business_benefits_interest",
                        text: "Które korzyści biznesowe są dla Ciebie najważniejsze?",
                        type: "multiselect",
                        options: ["Odliczenie VAT", "Amortyzacja", "Niskie koszty eksploatacji", "Wizerunek firmy", "Brak opłaty emisyjnej"],
                        weight: 5,
                        conditional: "business_purchase === true"
                    },
                    {
                        id: "total_cost_importance",
                        text: "Jak ważny jest dla Ciebie całkowity koszt posiadania (TCO)?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 6
                    },
                    {
                        id: "financial_readiness",
                        text: "Czy masz już przygotowane finansowanie?",
                        type: "select",
                        options: ["Tak, mam gotówkę", "Tak, mam wstępną zgodę na kredyt", "Tak, mam ofertę leasingu", "Nie, potrzebuję pomocy", "Jeszcze nie sprawdzałem"],
                        weight: 5
                    }
                ]
            },
            
            // Category 5: Demographics & Lifestyle (Weight: 12%)
            demographics_lifestyle: {
                weight: 0.12,
                max_questions: 7,
                priority: 5,
                questions: [
                    {
                        id: "age_group",
                        text: "W jakiej grupie wiekowej się znajdujesz?",
                        type: "select",
                        options: ["25-34", "35-44", "45-54", "55-64", "65+"],
                        weight: 4
                    },
                    {
                        id: "household_income",
                        text: "Jaki jest miesięczny dochód Twojego gospodarstwa domowego?",
                        type: "select",
                        options: ["Do 10 tys. zł", "10-15 tys. zł", "15-25 tys. zł", "25-35 tys. zł", "Ponad 35 tys. zł"],
                        weight: 6
                    },
                    {
                        id: "family_status",
                        text: "Jaka jest Twoja sytuacja rodzinna?",
                        type: "select",
                        options: ["Single", "Para bez dzieci", "Para z dziećmi", "Rodzic samotnie wychowujący", "Inne"],
                        weight: 4
                    },
                    {
                        id: "residence_type",
                        text: "Gdzie mieszkasz?",
                        type: "select",
                        options: ["Dom jednorodzinny", "Mieszkanie w bloku", "Mieszkanie w kamienicy", "Dom w zabudowie szeregowej"],
                        weight: 4
                    },
                    {
                        id: "city_size",
                        text: "W jakiej wielkości miejscowości mieszkasz?",
                        type: "select",
                        options: ["Warszawa", "Kraków/Wrocław/Gdańsk", "Inne miasto powyżej 200k", "Miasto 50-200k", "Miasto poniżej 50k", "Wieś"],
                        weight: 5
                    },
                    {
                        id: "education_level",
                        text: "Jaki jest Twój poziom wykształcenia?",
                        type: "select",
                        options: ["Podstawowe", "Średnie", "Wyższe licencjackie", "Wyższe magisterskie", "Doktorat"],
                        weight: 3
                    },
                    {
                        id: "profession_type",
                        text: "W jakiej branży pracujesz?",
                        type: "select",
                        options: ["IT/Tech", "Finanse/Banking", "Medycyna", "Prawo", "Inżynieria", "Marketing/Sprzedaż", "Własna firma", "Inne"],
                        weight: 4
                    }
                ]
            },
            
            // Category 6: Technology & Features (Weight: 10%)
            technology_features: {
                weight: 0.10,
                max_questions: 6,
                priority: 6,
                questions: [
                    {
                        id: "tech_comfort_level",
                        text: "Jak oceniasz swój poziom komfortu z nowymi technologiami?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 5
                    },
                    {
                        id: "autopilot_interest",
                        text: "Jak bardzo interesuje Cię funkcja Autopilot?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 6
                    },
                    {
                        id: "ota_updates_importance",
                        text: "Jak ważne są dla Ciebie aktualizacje oprogramowania przez internet?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 4
                    },
                    {
                        id: "mobile_app_usage",
                        text: "Czy często korzystasz z aplikacji mobilnych do zarządzania urządzeniami?",
                        type: "boolean",
                        weight: 3
                    },
                    {
                        id: "performance_importance",
                        text: "Jak ważne są dla Ciebie osiągi samochodu (przyspieszenie, prędkość maksymalna)?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 5
                    },
                    {
                        id: "infotainment_expectations",
                        text: "Jakie funkcje rozrywki/informacji są dla Ciebie najważniejsze?",
                        type: "multiselect",
                        options: ["Netflix/YouTube", "Spotify/muzyka", "Gry", "Nawigacja", "Połączenia telefoniczne", "Nie są ważne"],
                        weight: 3
                    }
                ]
            },
            
            // Category 7: Environmental & Values (Weight: 9%)
            environmental_values: {
                weight: 0.09,
                max_questions: 6,
                priority: 7,
                questions: [
                    {
                        id: "environmental_motivation",
                        text: "Jak ważna jest dla Ciebie ochrona środowiska przy wyborze samochodu?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 5
                    },
                    {
                        id: "sustainability_actions",
                        text: "Które działania pro-ekologiczne już podejmujesz?",
                        type: "multiselect",
                        options: ["Segregacja śmieci", "Oszczędzanie energii", "Panele fotowoltaiczne", "Eko produkty", "Transport publiczny", "Żadne"],
                        weight: 4
                    },
                    {
                        id: "carbon_footprint_awareness",
                        text: "Czy ślad węglowy ma wpływ na Twoje decyzje zakupowe?",
                        type: "boolean",
                        weight: 3
                    },
                    {
                        id: "future_generations_concern",
                        text: "Jak ważne jest dla Ciebie pozostawienie lepszego świata przyszłym pokoleniom?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 4
                    },
                    {
                        id: "green_energy_interest",
                        text: "Czy interesuje Cię korzystanie z zielonej energii do ładowania?",
                        type: "boolean",
                        weight: 4
                    },
                    {
                        id: "environmental_image",
                        text: "Czy ważny jest dla Ciebie wizerunek osoby dbającej o środowisko?",
                        type: "scale",
                        scale: [1, 10],
                        weight: 3
                    }
                ]
            }
        };
        
        // Decision maker tracking questions (integrated across categories)
        this.decisionMakerQuestions = [
            {
                id: "decision_maker_present",
                text: "Czy osoba podejmująca ostateczną decyzję o zakupie jest obecna?",
                type: "boolean",
                weight: 7, // High predictive factor
                category: "competitive_analysis"
            },
            {
                id: "decision_process",
                text: "Kto będzie podejmował ostateczną decyzję o zakupie?",
                type: "select",
                options: ["Ja sam/sama", "Ja i partner/ka wspólnie", "Partner/ka", "Rodzice", "Firma/pracodawca"],
                weight: 5,
                category: "financial_process"
            },
            {
                id: "influencers",
                text: "Kto jeszcze ma wpływ na Twoją decyzję?",
                type: "multiselect",
                options: ["Partner/ka", "Dzieci", "Rodzice", "Przyjaciele", "Współpracownicy", "Eksperci online", "Nikt"],
                weight: 4,
                category: "competitive_analysis"
            }
        ];
    }
    
    /**
     * Get questions for specific category
     */
    getQuestionsForCategory(categoryName) {
        return this.questionCategories[categoryName]?.questions || [];
    }
    
    /**
     * Get all questions flattened with category info
     */
    getAllQuestions() {
        let allQuestions = [];
        
        Object.entries(this.questionCategories).forEach(([categoryName, category]) => {
            category.questions.forEach(question => {
                allQuestions.push({
                    ...question,
                    category: categoryName,
                    category_weight: category.weight,
                    category_priority: category.priority
                });
            });
        });
        
        // Add decision maker questions
        this.decisionMakerQuestions.forEach(question => {
            allQuestions.push({
                ...question,
                is_decision_maker_question: true
            });
        });
        
        return allQuestions.sort((a, b) => {
            // Sort by category priority, then by weight within category
            if (a.category_priority !== b.category_priority) {
                return a.category_priority - b.category_priority;
            }
            return b.weight - a.weight;
        });
    }
    
    /**
     * Get adaptive question set based on previous answers
     */
    getAdaptiveQuestions(previousAnswers = {}, maxQuestions = 25) {
        const allQuestions = this.getAllQuestions();
        let selectedQuestions = [];
        let questionsByCategory = {};
        
        // Group questions by category
        Object.keys(this.questionCategories).forEach(category => {
            questionsByCategory[category] = allQuestions.filter(q => q.category === category);
        });
        
        // Select questions based on category weights and previous answers
        Object.entries(this.questionCategories).forEach(([categoryName, category]) => {
            const categoryQuestions = questionsByCategory[categoryName];
            const questionsToTake = Math.ceil(maxQuestions * category.weight);
            
            // Filter based on conditional logic
            const availableQuestions = categoryQuestions.filter(question => {
                if (!question.conditional) return true;
                
                try {
                    // Simple conditional evaluation
                    const condition = question.conditional;
                    return this.evaluateCondition(condition, previousAnswers);
                } catch (e) {
                    return true; // If condition fails, include question
                }
            });
            
            // Take top weighted questions from category
            selectedQuestions.push(...availableQuestions.slice(0, questionsToTake));
        });
        
        // Add required questions
        const requiredQuestions = allQuestions.filter(q => q.required && !selectedQuestions.includes(q));
        selectedQuestions.unshift(...requiredQuestions);
        
        // Add decision maker questions
        selectedQuestions.push(...this.decisionMakerQuestions);
        
        // Limit to maxQuestions
        return selectedQuestions.slice(0, maxQuestions);
    }
    
    /**
     * Simple condition evaluator
     */
    evaluateCondition(condition, answers) {
        // Replace answer references with actual values
        let evaluableCondition = condition;
        
        Object.entries(answers).forEach(([key, value]) => {
            const regex = new RegExp(key, 'g');
            if (typeof value === 'boolean') {
                evaluableCondition = evaluableCondition.replace(regex, value.toString());
            } else if (typeof value === 'string') {
                evaluableCondition = evaluableCondition.replace(regex, `"${value}"`);
            } else {
                evaluableCondition = evaluableCondition.replace(regex, value);
            }
        });
        
        try {
            return eval(evaluableCondition);
        } catch (e) {
            return true; // Default to true if evaluation fails
        }
    }
    
    /**
     * Get question statistics
     */
    getQuestionStats() {
        const allQuestions = this.getAllQuestions();
        const stats = {
            total_questions: allQuestions.length,
            by_category: {},
            by_type: {},
            required_questions: allQuestions.filter(q => q.required).length,
            conditional_questions: allQuestions.filter(q => q.conditional).length
        };
        
        // Count by category
        Object.keys(this.questionCategories).forEach(category => {
            stats.by_category[category] = allQuestions.filter(q => q.category === category).length;
        });
        
        // Count by type
        allQuestions.forEach(question => {
            stats.by_type[question.type] = (stats.by_type[question.type] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * Validate question set against 50 question limit
     */
    validateQuestionLimit() {
        const stats = this.getQuestionStats();
        return {
            is_valid: stats.total_questions <= this.maxQuestions,
            current_count: stats.total_questions,
            max_allowed: this.maxQuestions,
            excess: Math.max(0, stats.total_questions - this.maxQuestions),
            stats
        };
    }
}

module.exports = CustomerDecoderQuestions;