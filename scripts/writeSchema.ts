import { printSchema } from "$graphql";
import { schema } from "../src/schema.ts";

const schemaString = printSchema(schema);

await Deno.writeTextFile("docs/schema.graphql", schemaString);
