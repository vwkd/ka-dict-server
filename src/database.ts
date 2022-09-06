import entries from "../data/vz.json" assert { type: "json" };

function entry(id) {
  return entries.find(entry => entry.id == id);
}

function findEntries(term) {
  return entries.filter(entry => entry.source.value.includes(term) || entry.target?.some(e => e.value.some(w => w.includes(term))) || entry.reference?.source.value.includes(term));
}

const database = {
  entry,
  findEntries,
}

export { database };
