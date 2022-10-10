import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLList, GraphQLEnumType, GraphQLUnionType, GraphQLBoolean } from "./deps.ts";
import { database } from "./database.ts"

// --------- RESOLVER ---------

async function entryResolver(_, { id }) {

  // TODO: assert ID is provided, is ID type
  // TODO: error handling entry with id does not exist
  
  return database.entry(id);
}

// defaults to start of list, assumes sorted list
async function findEntriesResolver(_, { value, first, after, last, before }) {

  const arr = database.findEntries(value);
  
  return makeConnection(arr, first, after, last, before);
}

function makeConnection(arr, first, after, last, before) {
  // TODO: assert arguments are provided, value is string, first / last are positive integers, after / before are string
  // TODO: assert only one pair is given
  // TODO: limit first / last to max value
  // TODO: decode and encode cursors with base64 instead of just string number
  const allEdges = arr.map(node => ({ node, cursor: node.id }));
  
  const edges = edgesToReturn(allEdges, first, after, last, before);
  
  const totalCount = allEdges.length;
  
  // todo: what if undefined?
  const startCursor = edges.at(0)?.cursor;
  const endCursor = edges.at(-1)?.cursor;
  
  const hasPreviousPage = hasPreviousPageFn(allEdges, first, after, last, before);
  const hasNextPage = hasNextPageFn(allEdges, first, after, last, before);
  
  const pageInfo = {
    startCursor,
    endCursor,
    hasPreviousPage,
    hasNextPage,
  };
  
  return {
    edges,
    totalCount,
    pageInfo,
  };
}

function edgesToReturn(allEdges, first, after, last, before) {
  let edges = applyCursorToEdges(allEdges, after, before);
  
  if (first) {
    if (edges.length > first) {
      edges = edges.slice(0, first);
    }
  }
  
  if (last) {
    if (edges.length > last) {
      edges = edges.slice(-last);
    }
  }
  
  return edges;
}


function applyCursorToEdges(allEdges, after, before) {

  let edges = allEdges;
  
  if (after) {
    const afterIndex = edgesSlice.findIndex(({ cursor }) => cursor == after);
    
    if (afterIndex > -1) {
      edgesSlice = edgesSlice.slice(afterIndex + 1);
    }
  }
  
  if (before) {
    const beforeIndex = allEdges.findIndex(({ cursor }) => cursor == before);
    
    if (beforeIndex > -1) {
      edgesSlice = edgesSlice.slice(0, beforeIndex);
    }
  }

  return edges;
}

function hasPreviousPageFn(allEdges, first, after, last, before) {
  if (last) {
    const edges = applyCursorToEdges(allEdges, after, before);
    
    if (edges.length > last) {
      return true;
    } else {
      return false;
    }
  }
  
  if (after) {
    // todo: correct?
    if (allEdges.at(0)?.cursor != after) {
      return true;
    }
  }
  
  return false;
}

function hasNextPageFn(allEdges, first, after, last, before) {
  if (first) {
    const edges = applyCursorToEdges(allEdges, after, before);
    
    if (edges.length > first) {
      return true;
    } else {
      return false;
    }
  }
  
  if (before) {
    // todo: correct?
    if (allEdges.at(-1)?.cursor != before) {
      return true;
    }
  }
  
  return false;
}

// --------- SCHEMA ---------

// BEWARE: definitions must be in order from leaf types all the way up to root type

const pageInfoType = new GraphQLObjectType({
  name: "PageInfo",
  fields: {
    startCursor: {
      type: new GraphQLNonNull(GraphQLID),
    },
    endCursor: {
      type: new GraphQLNonNull(GraphQLID),
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  }
});

const kindType = new GraphQLEnumType({
  name: "Kind",
  values: {
    DIRECT: {},
    MEANING: {},
    IDENTICAL: {},
  },
});

const tagType = new GraphQLEnumType({
  name: "Tag",
  values: {
    "BIOL": {},
    "BOT": {},
    "CHEM": {},
    "CHEW": {},
    "DESP": {},
    "ELEKTR": {},
    "ETHN": {},
    "FIG": {},
    "GR": {},
    "GUR": {},
    "HIST": {},
    "HV": {},
    "IMER": {},
    "ING": {},
    "IRO": {},
    "JUR": {},
    "KACH": {},
    "KHAR": {},
    "KHIS": {},
    "LANDW": {},
    "LETSCH": {},
    "MATH": {},
    "MED": {},
    "MIL": {},
    "MOCH": {},
    "MORAL": {},
    "MTHIUL": {},
    "MUS": {},
    "NEG": {},
    "NZ": {},
    "O_IMER": {},
    "PHOTOGR": {},
    "PHYS": {},
    "POET": {},
    "POL": {},
    "PSCH": {},
    "RATSCH": {},
    "RL": {},
    "SPO": {},
    "TECH": {},
    "THUSCH": {},
    "TYP": {},
    "U_IMER": {},
    "U_RATSCH": {},
    "UMG": {},
    "UNK": {},
    "VA": {},
    "VULG": {},
  },
});

const sourceType = new GraphQLObjectType({
  name: "Source",
  fields: {
    value: {
      type: new GraphQLNonNull(GraphQLString),
    },
    meaning: {
      type: GraphQLInt,
    },
  }
});

const elementType = new GraphQLObjectType({
  name: "Element",
  fields: {
    value: {
      type: new GraphQLNonNull(GraphQLString),
    },
    category: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
    },
  },
});

const fieldType = new GraphQLObjectType({
  name: "Field",
  fields: {
    value: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(elementType))),
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(tagType)),
    },
  },
});

const referenceType = new GraphQLObjectType({
  name: "Reference",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    source: {
      type: new GraphQLNonNull(sourceType),
    },
    meaning: {
      type: GraphQLInt,
    },
    kind: {
      type: new GraphQLNonNull(kindType),
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(tagType)),
    },
  }
});

// beware: can't have union of non-object types
const definitionType = new GraphQLUnionType({
  name: "Definition",
  types: [
    referenceType,
    fieldType,
  ],
  resolveType(value) {
    if (value.id) {
      return "Reference";
    }
    if (value.value) {
      return "Field";
    }
  },
});

const targetType = new GraphQLObjectType({
  name: "Target",
  fields: {
    value: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(definitionType))),
    },
    meaning: {
      type: GraphQLInt,
    },
  }
});

const entryType = new GraphQLObjectType({
  name: "Entry",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    source: {
      type: new GraphQLNonNull(sourceType),
    },
    target: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(targetType))),
    },
  }
});

const entryEdgeType = new GraphQLObjectType({
  name: "EntryEdge",
  fields: {
    node: {
      type: new GraphQLNonNull(entryType),
    },
    cursor: {
      type: new GraphQLNonNull(GraphQLID),
    },
  }
});

const entryConnectionType = new GraphQLObjectType({
  name: "EntryConnection",
  fields: {
    edges: {
      type: new GraphQLNonNull(new GraphQLList(entryEdgeType)),
    },
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    pageInfo: {
      type: new GraphQLNonNull(pageInfoType),
    },
  }
});

const queryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    entry: {
      type: entryType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: entryResolver,
    },
    findEntries: {
      type: new GraphQLNonNull(entryConnectionType),
      args: {
        value: {
          type: new GraphQLNonNull(GraphQLString),
        },
        first: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        after: {
          type: new GraphQLNonNull(GraphQLID),
        },
        last: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        before: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: findEntriesResolver,
    },
  },
});

export const schema = new GraphQLSchema({
  query: queryType,
});
