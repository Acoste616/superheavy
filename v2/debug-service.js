const fs = require('fs');
const path = require('path');

// Symulacja ładowania jak w serwisie
const triggersPath = path.join(__dirname, 'shared/data/triggers.json');
console.log('Loading triggers from:', triggersPath);

const triggersData = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
console.log('Triggers file structure:', {
    isArray: Array.isArray(triggersData),
    hasTriggersProperty: !!triggersData.triggers,
    triggersCount: triggersData.triggers ? triggersData.triggers.length : 0
});

const triggers = new Map();

if (triggersData.triggers) {
    console.log(`Processing ${triggersData.triggers.length} triggers from triggers array`);
    triggersData.triggers.forEach((trigger, index) => {
        if (!trigger.id) {
            console.warn(`Trigger at index ${index} has no ID:`, trigger);
            return;
        }
        console.log(`Processing trigger ${index}: ${trigger.id}`);
        triggers.set(trigger.id || trigger.name, trigger);
        if (trigger.id === 'price_sensitivity' || trigger.id === 'feature_interest') {
            console.log(`✅ Successfully loaded trigger: ${trigger.id}`);
        }
    });
}

console.log(`\nFinal result: Loaded ${triggers.size} triggers`);
console.log('Sample trigger IDs:', Array.from(triggers.keys()).slice(0, 5));
console.log('Last 5 trigger IDs:', Array.from(triggers.keys()).slice(-5));

// Sprawdź czy price_sensitivity i feature_interest są załadowane
const hasPriceSensitivity = triggers.has('price_sensitivity');
const hasFeatureInterest = triggers.has('feature_interest');

console.log('\nTarget triggers check:');
console.log('price_sensitivity loaded:', hasPriceSensitivity);
console.log('feature_interest loaded:', hasFeatureInterest);