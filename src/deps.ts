export { serve } from "https://deno.land/std@0.154.0/http/server.ts";
export { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLList, GraphQLEnumType, GraphQLUnionType, printSchema } from 'https://cdn.skypack.dev/graphql';

import Fuse from "https://cdn.skypack.dev/fuse.js@6.6.2";
export { Fuse };
import entries from "https://raw.githubusercontent.com/vwkd/ka-dict-parser/output/vz.json" assert { type: "json" };
export { entries };
export { deepMerge } from "https://raw.githubusercontent.com/vwkd/code-web-utilities/d29b456b80de1f60b349238908b86bd83ebcb3b0/src/deep_merge.ts";
export { deepFilter } from "https://raw.githubusercontent.com/vwkd/code-web-utilities/d29b456b80de1f60b349238908b86bd83ebcb3b0/src/deep_filter.ts";

export const fuse_options = {
  threshold: 0,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeMatches: true,
  keys: [
    "source.value",
    "target.value.source.value",
    "target.value.value.value",
  ],
}

export const fuse_index = Fuse.createIndex(fuse_options.keys, entries);
