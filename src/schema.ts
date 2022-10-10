import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLList, GraphQLEnumType, GraphQLUnionType, GraphQLBoolean, encode } from "./deps.ts";
import { database } from "./database.ts"

// --------- RESOLVER ---------

async function entryResolver(_, { id }) {

  // TODO: assert ID is provided, is ID type
  // TODO: error handling entry with id does not exist
  
  return database.entry(id);
}

// defaults to start of list, assumes sorted list
async function findEntriesResolver(_, { value, amount, after, before }) {
  // TODO: assert arguments are provided, value is string, amount is positive integers, after / before is string
  // TODO: limit amount to max value
  
  const arr = database.findEntries(value);
  
  return makeConnection(arr, "id", amount, after, before);
}

// todo: allow key array for deeper property, use getDeep utility
// beware: expects after, before, or neither, but never both
function makeConnection(arr, key, amount, after, before) {
  // TODO: assert arguments are provided, arr is array, key is string, amount is positive integers, after / before is string
  
  if (after && before) {
    throw new Error("Expected at most one of 'after' and 'before', but got both.");
  }
  const allEdges = arr.map(node => ({ node, cursor: encode(`${node[key]}`) }));
  
  let edges = allEdges;
  
  let countUntilPage = 0;
  
  if (after) {
    const afterIndex = edges.findIndex(({ cursor }) => cursor == after);
    
    if (afterIndex > -1) {
      edges = edges.slice(afterIndex + 1);
      countUntilPage = afterIndex;
    }
  } else if (before) {
    const beforeIndex = edges.findIndex(({ cursor }) => cursor == before);
    
    if (beforeIndex > -1) {
      edges = edges.slice(0, beforeIndex);
      countUntilPage = edges.length - amount;
    }
  } else {
    // if neither, no-op
  }
  
  // if neither default to after from beginning
  if (after || (!after && !before)) {
    if (edges.length > amount) {
      edges = edges.slice(0, amount);
    }
  } else if (before) {
    if (edges.length > amount) {
      edges = edges.slice(-amount);
    }
  } else {
    // unreachable
  }
  
  const totalCount = allEdges.length;
  
  const totalPageCount = Math.ceil(totalCount / amount);
  
  // don't count partial page at beginning if any
  const pageNumber = Math.floor(countUntilPage / amount);
  
  // todo: what if undefined?
  const startCursor = edges.at(0)?.cursor;
  const endCursor = edges.at(-1)?.cursor;
  
  let hasPreviousPage = false;

  if (before) {
    if (edges.length > amount) {
      hasPreviousPage = true;
    }
  } else if (after) {
    // todo: correct?
    if (allEdges.at(0)?.cursor != after) {
      hasPreviousPage = true;
    }
  } else {
    // if neither default to after from beginning, no-op
  }
  
  let hasNextPage = false;

  // if neither default to after from beginning
  if (after || (!after && !before)) {
    if (edges.length > amount) {
      hasNextPage = true;
    }
  } else if (before) {
    // todo: correct?
    if (allEdges.at(-1)?.cursor != before) {
      hasNextPage = true;
    }
  } else {
    // unreachable
  }
  
  const pageInfo = {
    startCursor,
    endCursor,
    hasPreviousPage,
    hasNextPage,
    pageNumber,
  };
  
  return {
    edges,
    totalCount,
    totalPageCount,
    pageInfo,
  };
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
    pageNumber: {
      type: new GraphQLNonNull(GraphQLInt),
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
    totalPageCount: {
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
        amount: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        after: {
          type: GraphQLID,
        },
        before: {
          type: GraphQLID,
        },
      },
      resolve: findEntriesResolver,
    },
  },
});

export const schema = new GraphQLSchema({
  query: queryType,
});
