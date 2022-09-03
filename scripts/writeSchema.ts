import { printSchema } from "../src/deps.ts";
import { schema } from "../src/schema.ts";

const schemaString = printSchema(schema);

await Deno.writeTextFile("docs/schema.graphql", schemaString);