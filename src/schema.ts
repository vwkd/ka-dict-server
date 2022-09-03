import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLList, GraphQLEnumType, GraphQLUnionType } from "./deps.ts";
import { database } from "./database.ts"

// --------- RESOLVER ---------

async function entryResolver(_, { id }) {

  // TODO: assert ID is provided, is ID type
  // TODO: error handling entry with id does not exist
  
  return database.entry(id);
}

// defaults to start of list, assumes sorted list
async function findEntryResolver(_, { value }) {

  // TODO: assert term provided, amount is string

  return database.findEntry(value);
}

// --------- SCHEMA ---------

// BEWARE: definitions must be in order from leaf types all the way up to root type

const kindType = new GraphQLEnumType({
  name: 'Kind',
  values: {
    DIRECT: {},
    MEANING: {},
    IDENTICAL: {},
  },
});

const tagType = new GraphQLEnumType({
  name: 'Tag',
  values: {
    "KACH": {},
    // todo: add more
  },
});

const sourceType = new GraphQLObjectType({
  name: "Source",
  fields: {
    value: {
      type: new GraphQLNonNull(GraphQLString),
    },
    meaning: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  }
});

const targetType = new GraphQLObjectType({
  name: "Target",
  fields: {
    value: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
    },
    meaning: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(tagType)),
    },
  }
});

const referenceType = new GraphQLObjectType({
  name: "Reference",
  fields: {
    source: {
      type: new GraphQLNonNull(sourceType),
    },
    kind: {
      type: new GraphQLNonNull(kindType),
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(tagType)),
    },
  }
});

const targetEntryType = new GraphQLObjectType({
  name: "TargetEntry",
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

const referenceEntryType = new GraphQLObjectType({
  name: "ReferenceEntry",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    source: {
      type: new GraphQLNonNull(sourceType),
    },
    reference: {
      type: new GraphQLNonNull(referenceType),
    },
  }
});

const entryType = new GraphQLUnionType({
  name: 'Entry',
  types: [
    targetEntryType,
    referenceEntryType,
  ],
  resolveType(value) {
    if (value.target) {
      return "TargetEntry";
    }
    if (value.reference) {
      return "ReferenceEntry";
    }
  },
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
    findEntry: {
      type: new GraphQLNonNull(new GraphQLList(entryType)),
      args: {
        value: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: findEntryResolver,
    },
  },
});

export const schema = new GraphQLSchema({
  query: queryType,
});
