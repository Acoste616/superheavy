const subtypes = require('../../data/subtypes.json').subtypes;

const modelVariants = Array.from({length:12}, (_,i)=>i+1);

// generate strategy map
const strategies = {};
subtypes.forEach(st => {
  strategies[st.id] = {};
  ['D','I','S','C'].forEach(disc => {
    strategies[st.id][disc] = {
      tone: `${disc}-tone for ${st.name} ❓ TODO: refine with domain expert`,
      phrasing: `${disc}-phrasing for ${st.name} ❓ TODO: refine with domain expert`,
      highlights: Array.from({length:5}, (_,i)=>`highlight ${i+1} for ${disc} ${st.name} ❓ TODO`),
      model: modelVariants[(st.id + disc.charCodeAt(0)) % modelVariants.length]
    };
  });
});

function getStrategy(subtypeId, disc){
  if(!strategies[subtypeId]) return null;
  return strategies[subtypeId][disc] || null;
}

module.exports = { strategies, getStrategy };
