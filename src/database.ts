import { entries, Fuse, fuse_options, fuse_index } from "./deps.ts";

const fuse = new Fuse(entries, fuse_options, Fuse.parseIndex(fuse_index));

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
