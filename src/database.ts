import entries from "../data/vz.json" assert { type: "json" };

function entry(id) {
  return entries.find(entry => entry.id == id);
}

function findEntries(term) {
  return entries.filter(({ source, target }) => source.value.includes(term) || target.some(({ value }) => value.source?.value.includes(term) || value.value?.some(val => val.includes(term))));
}

const database = {
  entry,
  findEntries,
}

export { database };
