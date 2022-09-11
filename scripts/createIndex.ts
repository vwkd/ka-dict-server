import entries from "../data/vz.json" assert { type: "json" };
import { Fuse } from "../src/deps.ts";

const keys = [
  "source.value",
  "target.value.source.value",
  "target.value.value",
];

const index = Fuse.createIndex(keys, entries);

await Deno.writeTextFile("data/index.json", JSON.stringify(index, null, 2));
