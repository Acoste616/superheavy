/**
 * APIManager.js - Zarządzanie darmowymi API dla Tesla Customer Decoder
 * Obsługuje OpenChargeMap, GUS, NBP i inne darmowe źródła danych
 */

class APIManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 3600000; // 1 godzina
        this.rateLimits = {
            openChargeMap: { requests: 0, resetTime: 0, limit: 1000 },
            geonames: { requests: 0, resetTime: 0, limit: 1000 },
            nbp: { requests: 0, resetTime: 0, limit: 100 }
        };
    }

    /**
     * Sprawdza rate limit dla danego API
     */
    checkRateLimit(apiName) {
        const limit = this.rateLimits[apiName];
        if (!limit) return true;

        const now = Date.now();
        if (now > limit.resetTime) {
            limit.requests = 0;
            limit.resetTime = now + 86400000; // 24 godziny
        }

        return limit.requests < limit.limit;
    }

    /**
     * Pobiera dane z cache lub wykonuje request
     */
    async getCachedData(key, fetchFunction, ttl = this.cacheTimeout) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }

        try {
            const data = await fetchFunction();
            this.cache.set(key, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            console.error(`API Error for ${key}:`, error);
            return cached ? cached.data : null;
        }
    }

    /**
     * OpenChargeMap API - lokalizacje ładowarek w Polsce
     */
    async getChargingStations(city = 'Warsaw', radius = 50) {
        if (!this.checkRateLimit('openChargeMap')) {
            console.warn('OpenChargeMap rate limit exceeded');
            return this.getFallbackChargingData(city);
        }

        const cacheKey = `charging_${city}_${radius}`;
        return this.getCachedData(cacheKey, async () => {
            const response = await fetch(
                `https://api.openchargemap.io/v3/poi/?output=json&countrycode=PL&maxresults=50&distance=${radius}&latitude=52.2297&longitude=21.0122&key=8e53f8b4-801a-4333-a16c-d319dbc0d9bb`
            );
            
            if (!response.ok) throw new Error('OpenChargeMap API failed');
            
            this.rateLimits.openChargeMap.requests++;
            const data = await response.json();
            
            return {
                total_stations: data.length,
                fast_chargers: data.filter(station => 
                    station.Connections?.some(conn => conn.PowerKW >= 50)
                ).length,
                tesla_superchargers: data.filter(station => 
                    station.OperatorInfo?.Title?.toLowerCase().includes('tesla')
                ).length,
                city: city,
                last_updated: new Date().toISOString()
            };
        });
    }

    /**
     * NBP API - kursy walut
     */
    async getExchangeRates() {
        if (!this.checkRateLimit('nbp')) {
            return this.getFallbackExchangeRates();
        }

        const cacheKey = 'exchange_rates';
        return this.getCachedData(cacheKey, async () => {
            const response = await fetch('https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json');
            
            if (!response.ok) throw new Error('NBP API failed');
            
            this.rateLimits.nbp.requests++;
            const data = await response.json();
            
            return {
                eur_to_pln: data.rates[0].mid,
                usd_to_pln: 4.2, // Fallback - można dodać osobny call
                last_updated: data.rates[0].effectiveDate
            };
        });
    }

    /**
     * Geonames API - dane demograficzne miast
     */
    async getCityDemographics(city) {
        if (!this.checkRateLimit('geonames')) {
            return this.getFallbackCityData(city);
        }

        const cacheKey = `demographics_${city}`;
        return this.getCachedData(cacheKey, async () => {
            const response = await fetch(
                `http://api.geonames.org/searchJSON?q=${city}&country=PL&maxRows=1&username=Acoste616`
            );
            
            if (!response.ok) throw new Error('Geonames API failed');
            
            this.rateLimits.geonames.requests++;
            const data = await response.json();
            
            if (data.geonames && data.geonames.length > 0) {
                const cityData = data.geonames[0];
                return {
                    population: cityData.population || 100000,
                    latitude: cityData.lat,
                    longitude: cityData.lng,
                    admin_name: cityData.adminName1,
                    ev_adoption_estimate: this.calculateEVAdoption(cityData.population)
                };
            }
            
            return this.getFallbackCityData(city);
        });
    }

    /**
     * Szacuje adopcję EV na podstawie wielkości miasta
     */
    calculateEVAdoption(population) {
        if (population > 500000) return 0.08; // 8% w dużych miastach
        if (population > 100000) return 0.05; // 5% w średnich miastach
        return 0.02; // 2% w małych miastach
    }

    /**
     * Fallback data gdy API nie działa
     */
    getFallbackChargingData(city) {
        const fallbackData = {
            'Warsaw': { total_stations: 45, fast_chargers: 12, tesla_superchargers: 3 },
            'Krakow': { total_stations: 28, fast_chargers: 8, tesla_superchargers: 2 },
            'Gdansk': { total_stations: 22, fast_chargers: 6, tesla_superchargers: 1 },
            'Wroclaw': { total_stations: 25, fast_chargers: 7, tesla_superchargers: 1 },
            'Poznan': { total_stations: 20, fast_chargers: 5, tesla_superchargers: 1 }
        };
        
        return fallbackData[city] || { total_stations: 15, fast_chargers: 4, tesla_superchargers: 0 };
    }

    getFallbackExchangeRates() {
        return {
            eur_to_pln: 4.35,
            usd_to_pln: 4.20,
            last_updated: new Date().toISOString().split('T')[0]
        };
    }

    getFallbackCityData(city) {
        const fallbackData = {
            'Warsaw': { population: 1800000, ev_adoption_estimate: 0.08 },
            'Krakow': { population: 780000, ev_adoption_estimate: 0.06 },
            'Gdansk': { population: 470000, ev_adoption_estimate: 0.05 },
            'Wroclaw': { population: 640000, ev_adoption_estimate: 0.05 },
            'Poznan': { population: 540000, ev_adoption_estimate: 0.04 }
        };
        
        return fallbackData[city] || { population: 100000, ev_adoption_estimate: 0.02 };
    }

    /**
     * Pobiera wszystkie dane potrzebne do analizy
     */
    async getMarketData(customerCity = 'Warsaw') {
        try {
            const [chargingData, exchangeRates, demographics] = await Promise.all([
                this.getChargingStations(customerCity),
                this.getExchangeRates(),
                this.getCityDemographics(customerCity)
            ]);

            return {
                charging_infrastructure: chargingData,
                exchange_rates: exchangeRates,
                demographics: demographics,
                market_readiness_score: this.calculateMarketReadiness(chargingData, demographics),
                last_updated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching market data:', error);
            return this.getFallbackMarketData(customerCity);
        }
    }

    /**
     * Oblicza gotowość rynku na EV
     */
    calculateMarketReadiness(chargingData, demographics) {
        const chargingScore = Math.min(chargingData.total_stations / 50, 1) * 40;
        const adoptionScore = demographics.ev_adoption_estimate * 1000;
        const infrastructureScore = Math.min(chargingData.fast_chargers / 20, 1) * 20;
        
        return Math.round(chargingScore + adoptionScore + infrastructureScore);
    }

    getFallbackMarketData(city) {
        return {
            charging_infrastructure: this.getFallbackChargingData(city),
            exchange_rates: this.getFallbackExchangeRates(),
            demographics: this.getFallbackCityData(city),
            market_readiness_score: 65,
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Czyści cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Zwraca statystyki API
     */
    getAPIStats() {
        return {
            cache_size: this.cache.size,
            rate_limits: this.rateLimits,
            last_cache_clear: new Date().toISOString()
        };
    }
}

module.exports = APIManager;