import entries from "../data/vz.json" assert { type: "json" };
import { Fuse } from "../src/deps.ts";
import { options } from "../src/database.ts";

const index = Fuse.createIndex(options.keys, entries);

await Deno.writeTextFile("data/index.json", JSON.stringify(index, null, 2));
