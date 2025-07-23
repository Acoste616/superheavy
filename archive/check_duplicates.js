const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/triggers.json'));
const texts = data.triggers.map(t => t.text);
const textCounts = {};
texts.forEach(text => {
    textCounts[text] = (textCounts[text] || 0) + 1;
});
const duplicates = Object.keys(textCounts).filter(text => textCounts[text] > 1);
console.log('Duplikaty:', duplicates);
duplicates.forEach(dup => {
    console.log(`"${dup}" występuje ${textCounts[dup]} razy`);
});