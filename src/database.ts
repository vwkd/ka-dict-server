import { entries, Fuse, fuse_options, fuse_index, deepMerge, deepFilter } from "./deps.ts";

const fuse = new Fuse(entries, fuse_options, Fuse.parseIndex(fuse_index));

function filterResults(results) {

  const resultsNew = [];

  for (const result of results) {
    
    const { item, matches } = result;
    
    let resultNew = {};
    
    // note: group multiple matches per key, otherwise would become separate entries in highest ancestor array if processes separately
    for (const key of fuse_options.keys) {
      const matchesForKey = matches.filter(({ key: k }) => k == key);
      
      if (matchesForKey.length) {
        const valuesForKey = matchesForKey.map(({ value }) => value);
     
        const resultForKey = deepFilter(item, key.split("."), obj => valuesForKey.some(value => obj === value));
         
        resultNew = deepMerge(resultNew, resultForKey);
      }
    }
    
    resultsNew.push(resultNew);
  }
  
  return resultsNew;
}

function entry(id) {
  return entries.find(entry => entry.id == id);
}

function findEntries(term) {
  const resultsFuse = fuse.search(term);
  
  return filterResults(resultsFuse);
}

const database = {
  entry,
  findEntries,
}

export { database };
