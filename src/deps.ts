export { serve } from "https://deno.land/std@0.154.0/http/server.ts";
export { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLList, GraphQLEnumType, GraphQLUnionType, GraphQLBoolean, printSchema } from "https://cdn.skypack.dev/graphql@16.6.0";
export { encode } from "https://deno.land/std@0.159.0/encoding/base64url.ts";

import Fuse from "https://cdn.skypack.dev/fuse.js@6.6.2";
export { Fuse };
import entries from "https://raw.githubusercontent.com/vwkd/kita-parser/output/vz.json" assert { type: "json" };
export { entries };
export { deepMerge } from "https://raw.githubusercontent.com/vwkd/code-web-utilities/d29b456b80de1f60b349238908b86bd83ebcb3b0/src/deep_merge.ts";
export { deepFilter } from "https://raw.githubusercontent.com/vwkd/code-web-utilities/d29b456b80de1f60b349238908b86bd83ebcb3b0/src/deep_filter.ts";

export const fuse_options = {
  threshold: 0,
  ignoreLocation: true,
  includeMatches: true,
  keys: [
    "source.value",
    "target.value.source.value",
    "target.value.value.value",
  ],
}

export const fuse_index = Fuse.createIndex(fuse_options.keys, entries);
