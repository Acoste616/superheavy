const fs = require('fs');
const path = require('path');

const triggersPath = path.join(__dirname, 'shared/data/triggers.json');
const data = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));

console.log('Total triggers in file:', data.triggers.length);
console.log('\nLast 10 triggers:');
data.triggers.slice(-10).forEach((trigger, index) => {
    const actualIndex = data.triggers.length - 10 + index;
    console.log(`${actualIndex}: ${trigger.id}`);
});

console.log('\nTriggers 40-44:');
for (let i = 40; i < Math.min(45, data.triggers.length); i++) {
    console.log(`${i}: ${data.triggers[i].id}`);
}

console.log('\nChecking price_sensitivity and feature_interest:');
data.triggers.forEach((trigger, index) => {
    if (trigger.id === 'price_sensitivity' || trigger.id === 'feature_interest') {
        console.log(`Found ${trigger.id} at index ${index}`);
    }
});