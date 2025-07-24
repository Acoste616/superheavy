const fs = require('fs');
const path = require('path');
const {snippets, adviceCategories} = require('../shared/strategies/advice_snippets');
const {strategies} = require('../shared/strategies/disc_subtype_strategies');

function listJSFiles(dir){
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir,file);
    const stat = fs.statSync(full);
    if(stat.isDirectory()){
      results = results.concat(listJSFiles(full));
    } else if(file.endsWith('.js')){
      results.push(full);
    }
  });
  return results;
}

function findUnusedFiles(dirs){
  const files = dirs.flatMap(d => listJSFiles(d));
  const usage = new Map();
  files.forEach(f => usage.set(f,false));
  files.forEach(f => {
    const content = fs.readFileSync(f,'utf8');
    files.forEach(other => {
      if(other===f) return;
      const name = path.basename(other);
      if(content.includes(name)){
        usage.set(other,true);
      }
    });
  });
  return Array.from(usage.entries()).filter(([k,v])=>!v).map(([k])=>k);
}

function checkAdviceCoverage(){
  const report=[];
  for(const stId of Object.keys(snippets)){
    for(const disc of Object.keys(snippets[stId])){
      for(const cat of adviceCategories){
        const arr = snippets[stId][disc][cat]||[];
        if(arr.length<5){
          report.push(`Subtype ${stId} ${disc} ${cat} only ${arr.length} snippets`);
        }
      }
    }
  }
  return report;
}

if(require.main===module){
  const unused = findUnusedFiles(['services','backend','shared']);
  console.log('Unused JS files:', unused);
  const gaps = checkAdviceCoverage();
  console.log('Advice coverage gaps:', gaps);
}

module.exports = {listJSFiles, findUnusedFiles, checkAdviceCoverage};
