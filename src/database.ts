const entriesArray = [
  { id: 0,
    source: {
      value: "xxx",
      meaning: 1,
    },
    target: [
      {
        value: ["yyy"],
        meaning: 1,
        tags: ["zzz"],
      }
    ],
  },
  { id: 0,
    source: {
      value: "xxx",
      meaning: 1,
    },
    reference: {
      source: {
        value: "yyy",
        meaning: 1,
      },
      type: "DIRECT",
      tags: ["zzz"],
    },
  },
];

function entry(id) {
  return entriesArray.find(entry => entry.id == id);
}

function findEntry(term) {
  return entriesArray.filter(entry => entry.source.value.contains(term) || entry?.target.some(e => e.value.contains(term)) || entry?.reference.source.value.contains(term));
}

const database = {
  entry,
  findEntry,
}

export { database };
