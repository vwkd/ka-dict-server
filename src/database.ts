import entries from "./vz.json" assert { type: "json" };

function entry(id) {
  return entries.find(entry => entry.id == id);
}

function findEntries(term) {
  return entries.filter(({ source, target }) => source.value.includes(term) || target.some(({ value }) => value?.source.value.includes(term) || value.includes(term)));
}

const database = {
  entry,
  findEntries,
}

export { database };
