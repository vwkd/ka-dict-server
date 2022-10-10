import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLList, GraphQLEnumType, GraphQLUnionType, GraphQLBoolean } from "./deps.ts";
import { database } from "./database.ts"

// --------- RESOLVER ---------

async function entryResolver(_, { id }) {

  // TODO: assert ID is provided, is ID type
  // TODO: error handling entry with id does not exist
  
  return database.entry(id);
}

// defaults to start of list, assumes sorted list
async function findEntriesResolver(_, { value, first, after }) {
  // TODO: assert arguments are provided, value is string, rest are all positive integers
  // TODO: decode and encode cursors, e.g. base64
  // TODO: limit first and last to max value, assert only one pair is given
  const results = database.findEntries(value).map((node, index) => ({ node, cursor: index }));
  
  const totalCount = results.length;
  
  const minIndex = 0;
  const maxIndex = totalCount - 1;
  
  const startIndex = after + 1;
  const endIndex = startIndex + first;
  
  const edges = results.slice(startIndex, endIndex);
  
  const count = edges.length;
  
  // todo: what if edges is empty list?
  const startCursor = edges.at(1).cursor;
  const endCursor = edges.at(-1).cursor;
  
  const hasPreviousPage = minIndex < startIndex;
  const hasNextPage = endIndex < maxIndex;
  
  const pageInfo = {
    startCursor,
    endCursor,
    hasPreviousPage,
    hasNextPage,
    count,
  };
  
  return {
    edges,
    totalCount,
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
      },
      resolve: findEntriesResolver,
    },
  },
});

export const schema = new GraphQLSchema({
  query: queryType,
});
