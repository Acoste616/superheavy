const {subtypes} = require('../../data/subtypes.json');

const adviceCategories = [
  'company','pv','children','eco','performance','tech',
  'status','maintenance','warranty','other'
];

const snippets = {};
subtypes.forEach(st => {
  snippets[st.id] = {};
  ['D','I','S','C'].forEach(disc => {
    snippets[st.id][disc] = {};
    adviceCategories.forEach(cat => {
      const base = `${cat} advice for ${disc} ${st.name}`;
      snippets[st.id][disc][cat] = Array.from({length:5},(_,i)=>`${base} ${i+1} ❓ TODO: refine with domain expert`);
    });
  });
});

function getSnippets(subtypeId, disc, category){
  return snippets[subtypeId]?.[disc]?.[category] || [];
}

module.exports = {snippets, adviceCategories, getSnippets};
