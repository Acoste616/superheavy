/**
 * DataValidator.js - Walidacja i czyszczenie danych dla Tesla Customer Decoder
 * Zapewnia jakość danych z API i lokalnych źródeł
 */

class DataValidator {
    constructor() {
        this.validationRules = {
            age: { min: 18, max: 80 },
            income: { min: 30000, max: 1000000 },
            city_population: { min: 10000, max: 10000000 },
            charging_stations: { min: 0, max: 1000 },
            exchange_rate: { min: 3.0, max: 6.0 }
        };
        
        this.polishCities = [
            'Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan', 'Lodz', 
            'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice', 'Bialystok',
            'Gdynia', 'Czestochowa', 'Radom', 'Sosnowiec', 'Torun'
        ];
        
        this.discTypes = ['D', 'I', 'S', 'C'];
    }

    /**
     * Waliduje dane klienta z formularza
     */
    validateCustomerData(customerData) {
        const errors = [];
        const warnings = [];
        const cleanData = { ...customerData };

        // Walidacja wieku
        if (customerData.age) {
            const age = parseInt(customerData.age);
            if (isNaN(age) || age < this.validationRules.age.min || age > this.validationRules.age.max) {
                errors.push(`Wiek musi być między ${this.validationRules.age.min} a ${this.validationRules.age.max}`);
            } else {
                cleanData.age = age;
            }
        }

        // Walidacja dochodu
        if (customerData.income) {
            const income = this.parseIncome(customerData.income);
            if (income < this.validationRules.income.min || income > this.validationRules.income.max) {
                warnings.push(`Dochód ${income} PLN może być poza typowym zakresem`);
            }
            cleanData.income = income;
        }

        // Walidacja miasta
        if (customerData.city) {
            const normalizedCity = this.normalizeCity(customerData.city);
            if (!this.isValidPolishCity(normalizedCity)) {
                warnings.push(`Miasto '${customerData.city}' może nie być rozpoznane`);
            }
            cleanData.city = normalizedCity;
        }

        // Walidacja triggerów - pozwól na pusty array dla fallback
        if (customerData.selectedTriggers !== undefined) {
            const validTriggers = this.validateTriggers(customerData.selectedTriggers);
            // Nie wymagaj triggerów - fallback może działać bez nich
            if (validTriggers.length === 0 && customerData.selectedTriggers.length > 0) {
                warnings.push('Żaden z wybranych triggerów nie jest prawidłowy');
            }
            cleanData.selectedTriggers = validTriggers;
        }

        // Walidacja typu DISC (jeśli podany)
        if (customerData.discType && !this.discTypes.includes(customerData.discType.toUpperCase())) {
            warnings.push(`Nieznany typ DISC: ${customerData.discType}`);
            cleanData.discType = 'S'; // Domyślny
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            cleanData,
            completeness: this.calculateCompleteness(cleanData),
            quality_score: this.calculateQualityScore(cleanData, errors, warnings)
        };
    }

    /**
     * Waliduje dane z API
     */
    validateAPIData(apiData, source) {
        const errors = [];
        const warnings = [];
        const cleanData = { ...apiData };

        switch (source) {
            case 'openChargeMap':
                return this.validateChargingData(apiData);
            case 'nbp':
                return this.validateExchangeRates(apiData);
            case 'geonames':
                return this.validateDemographics(apiData);
            default:
                warnings.push(`Nieznane źródło API: ${source}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            cleanData,
            reliability_score: this.calculateReliabilityScore(cleanData, errors, warnings)
        };
    }

    /**
     * Waliduje dane o ładowarkach
     */
    validateChargingData(data) {
        const errors = [];
        const warnings = [];
        const cleanData = { ...data };

        // Sprawdź liczbę stacji
        if (typeof data.total_stations !== 'number' || data.total_stations < 0) {
            errors.push('Nieprawidłowa liczba stacji ładowania');
        } else if (data.total_stations > this.validationRules.charging_stations.max) {
            warnings.push('Bardzo wysoka liczba stacji - sprawdź dane');
        }

        // Sprawdź fast chargery
        if (data.fast_chargers > data.total_stations) {
            errors.push('Liczba fast chargerów nie może być większa niż wszystkich stacji');
            cleanData.fast_chargers = Math.min(data.fast_chargers, data.total_stations);
        }

        // Sprawdź Tesla Superchargery
        if (data.tesla_superchargers > data.fast_chargers) {
            warnings.push('Liczba Tesla Superchargerów większa niż fast chargerów');
            cleanData.tesla_superchargers = Math.min(data.tesla_superchargers, data.fast_chargers);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            cleanData,
            infrastructure_score: this.calculateInfrastructureScore(cleanData)
        };
    }

    /**
     * Waliduje kursy walut
     */
    validateExchangeRates(data) {
        const errors = [];
        const warnings = [];
        const cleanData = { ...data };

        // Sprawdź kurs EUR/PLN
        if (typeof data.eur_to_pln !== 'number' || 
            data.eur_to_pln < this.validationRules.exchange_rate.min || 
            data.eur_to_pln > this.validationRules.exchange_rate.max) {
            errors.push(`Nieprawidłowy kurs EUR/PLN: ${data.eur_to_pln}`);
        }

        // Sprawdź datę aktualizacji
        if (data.last_updated) {
            const updateDate = new Date(data.last_updated);
            const daysDiff = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysDiff > 7) {
                warnings.push(`Dane kursów starsze niż ${Math.round(daysDiff)} dni`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            cleanData,
            currency_reliability: this.calculateCurrencyReliability(cleanData)
        };
    }

    /**
     * Waliduje dane demograficzne
     */
    validateDemographics(data) {
        const errors = [];
        const warnings = [];
        const cleanData = { ...data };

        // Sprawdź populację
        if (typeof data.population !== 'number' || 
            data.population < this.validationRules.city_population.min || 
            data.population > this.validationRules.city_population.max) {
            warnings.push(`Nietypowa populacja miasta: ${data.population}`);
        }

        // Sprawdź współrzędne
        if (data.latitude && data.longitude) {
            if (data.latitude < 49 || data.latitude > 55 || 
                data.longitude < 14 || data.longitude > 24) {
                warnings.push('Współrzędne poza granicami Polski');
            }
        }

        // Sprawdź szacunek adopcji EV
        if (data.ev_adoption_estimate > 0.15) {
            warnings.push('Bardzo wysoki szacunek adopcji EV');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            cleanData,
            demographic_confidence: this.calculateDemographicConfidence(cleanData)
        };
    }

    /**
     * Parsuje dochód z różnych formatów
     */
    parseIncome(income) {
        if (typeof income === 'number') return income;
        
        const str = income.toString().replace(/[^\d]/g, '');
        const num = parseInt(str);
        
        // Jeśli podano w tysiącach (np. "120" zamiast "120000")
        if (num < 1000) {
            return num * 1000;
        }
        
        return num;
    }

    /**
     * Normalizuje nazwę miasta
     */
    normalizeCity(city) {
        const cityMap = {
            'warszawa': 'Warsaw',
            'kraków': 'Krakow',
            'krakow': 'Krakow',
            'gdańsk': 'Gdansk',
            'gdansk': 'Gdansk',
            'wrocław': 'Wroclaw',
            'wroclaw': 'Wroclaw',
            'poznań': 'Poznan',
            'poznan': 'Poznan'
        };
        
        const normalized = city.toLowerCase().trim();
        return cityMap[normalized] || city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    }

    /**
     * Sprawdza czy miasto jest w Polsce
     */
    isValidPolishCity(city) {
        return this.polishCities.includes(city) || 
               this.polishCities.some(c => c.toLowerCase() === city.toLowerCase());
    }

    /**
     * Waliduje triggery
     */
    validateTriggers(triggers) {
        if (!Array.isArray(triggers)) return [];
        
        return triggers.filter(trigger => 
            trigger && 
            typeof trigger === 'string' && 
            trigger.trim().length > 0
        );
    }

    /**
     * Oblicza kompletność danych
     */
    calculateCompleteness(data) {
        const requiredFields = ['age', 'city', 'selectedTriggers'];
        const optionalFields = ['income', 'discType', 'carModel'];
        
        const requiredComplete = requiredFields.filter(field => 
            data[field] !== undefined && data[field] !== null && data[field] !== ''
        ).length;
        
        const optionalComplete = optionalFields.filter(field => 
            data[field] !== undefined && data[field] !== null && data[field] !== ''
        ).length;
        
        const requiredScore = (requiredComplete / requiredFields.length) * 70;
        const optionalScore = (optionalComplete / optionalFields.length) * 30;
        
        return Math.round(requiredScore + optionalScore);
    }

    /**
     * Oblicza ogólny wynik jakości
     */
    calculateQualityScore(data, errors, warnings) {
        let score = 100;
        
        // Odejmij za błędy
        score -= errors.length * 25;
        
        // Odejmij za ostrzeżenia
        score -= warnings.length * 10;
        
        // Dodaj za kompletność
        const completeness = this.calculateCompleteness(data);
        score = (score * 0.7) + (completeness * 0.3);
        
        return Math.max(0, Math.round(score));
    }

    /**
     * Oblicza wynik niezawodności API
     */
    calculateReliabilityScore(data, errors, warnings) {
        let score = 100;
        score -= errors.length * 30;
        score -= warnings.length * 15;
        
        // Sprawdź świeżość danych
        if (data.last_updated) {
            const age = (Date.now() - new Date(data.last_updated).getTime()) / (1000 * 60 * 60 * 24);
            if (age > 1) score -= age * 2;
        }
        
        return Math.max(0, Math.round(score));
    }

    /**
     * Oblicza wynik infrastruktury
     */
    calculateInfrastructureScore(data) {
        const stationScore = Math.min(data.total_stations / 50, 1) * 40;
        const fastChargerScore = Math.min(data.fast_chargers / 20, 1) * 35;
        const teslaScore = Math.min(data.tesla_superchargers / 5, 1) * 25;
        
        return Math.round(stationScore + fastChargerScore + teslaScore);
    }

    /**
     * Oblicza niezawodność walut
     */
    calculateCurrencyReliability(data) {
        let score = 100;
        
        // Sprawdź czy kurs jest w rozsądnym zakresie
        if (data.eur_to_pln < 4.0 || data.eur_to_pln > 5.0) {
            score -= 20;
        }
        
        // Sprawdź świeżość
        if (data.last_updated) {
            const age = (Date.now() - new Date(data.last_updated).getTime()) / (1000 * 60 * 60 * 24);
            if (age > 3) score -= age * 5;
        }
        
        return Math.max(0, Math.round(score));
    }

    /**
     * Oblicza pewność danych demograficznych
     */
    calculateDemographicConfidence(data) {
        let confidence = 100;
        
        if (!data.population || data.population < 50000) confidence -= 20;
        if (!data.latitude || !data.longitude) confidence -= 15;
        if (data.ev_adoption_estimate > 0.1) confidence -= 10;
        
        return Math.max(0, Math.round(confidence));
    }

    /**
     * Generuje raport jakości danych
     */
    generateQualityReport(customerValidation, apiValidations = []) {
        const report = {
            timestamp: new Date().toISOString(),
            customer_data: {
                completeness: customerValidation.completeness,
                quality_score: customerValidation.quality_score,
                errors: customerValidation.errors.length,
                warnings: customerValidation.warnings.length
            },
            api_data: {},
            overall_score: 0,
            recommendations: []
        };

        // Agreguj dane z API
        let totalApiScore = 0;
        let apiCount = 0;
        
        apiValidations.forEach(validation => {
            const score = validation.reliability_score || validation.infrastructure_score || validation.currency_reliability || validation.demographic_confidence || 0;
            totalApiScore += score;
            apiCount++;
            
            report.api_data[validation.source || 'unknown'] = {
                score: score,
                errors: validation.errors.length,
                warnings: validation.warnings.length
            };
        });

        const avgApiScore = apiCount > 0 ? totalApiScore / apiCount : 0;
        report.overall_score = Math.round((customerValidation.quality_score * 0.6) + (avgApiScore * 0.4));

        // Generuj rekomendacje
        if (customerValidation.completeness < 70) {
            report.recommendations.push('Uzupełnij brakujące dane klienta');
        }
        if (customerValidation.errors.length > 0) {
            report.recommendations.push('Popraw błędy w danych wejściowych');
        }
        if (avgApiScore < 70) {
            report.recommendations.push('Sprawdź połączenie z API lub użyj danych fallback');
        }

        return report;
    }
}

module.exports = DataValidator;