const assert = require('assert');
const {strategies, getStrategy} = require('../shared/strategies/disc_subtype_strategies');
const {subtypes} = require('../data/subtypes.json');

subtypes.forEach(st => {
  ['D','I','S','C'].forEach(disc => {
    assert.ok(strategies[st.id][disc]);
  });
});
const s = getStrategy(1,'D');
assert.ok(s.tone && s.phrasing && s.model);
assert.ok(Array.isArray(s.highlights) && s.highlights.length>=5);
console.log('subtype mapping tests passed');
