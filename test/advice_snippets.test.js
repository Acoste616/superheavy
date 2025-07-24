const assert = require('assert');
const {getSnippets, adviceCategories} = require('../shared/strategies/advice_snippets');
const {subtypes} = require('../data/subtypes.json');

subtypes.forEach(st => {
  ['D','I','S','C'].forEach(disc => {
    adviceCategories.forEach(cat => {
      const arr = getSnippets(st.id, disc, cat);
      assert.ok(Array.isArray(arr));
      assert.ok(arr.length >= 5);
    });
  });
});
console.log('advice snippet tests passed');
