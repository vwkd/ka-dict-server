import entries from "../data/vz.json" assert { type: "json" };
import index from "../data/index.json" assert { type: "json" };
import { Fuse } from "./deps.ts";

const options = {
  threshold: 0,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    "source.value",
    "target.value.source.value",
    "target.value.value",
  ],
}

const fuse = new Fuse(entries, options, Fuse.parseIndex(index));

function entry(id) {
  return entries.find(entry => entry.id == id);
}

function findEntries(term) {
  return fuse.search(term).map(r => r.item);
}

const database = {
  entry,
  findEntries,
}

export { database };
