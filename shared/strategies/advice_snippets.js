const {subtypes} = require('../../data/subtypes.json');

const adviceCategories = ['company','pv','children','eco','performance','tech','status','maintenance','warranty','other'];

const snippets = {};
subtypes.forEach(st => {
  snippets[st.id] = {};
  ['D','I','S','C'].forEach(disc => {
    snippets[st.id][disc] = {};
    adviceCategories.forEach(cat => {
      snippets[st.id][disc][cat] = Array.from({length:3},(_,i)=>`${cat} advice ${i+1} for ${disc} ${st.name}`);
    });
  });
});

function getSnippets(subtypeId, disc, category){
  return snippets[subtypeId]?.[disc]?.[category] || [];
}

module.exports = {snippets, adviceCategories, getSnippets};
