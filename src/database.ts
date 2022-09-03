const entriesArray = [
  { id: 0,
    source: {
      value: "ბუ",
      meaning: 2,
    },
    target: [
      {
        value: ["aufschütteln"],
        meaning: 1,
        tags: ["KACH"],
      },
      {
        value: ["anschwellen"],
        meaning: 2,
        tags: ["KACH"],
      }
    ],
  },
  { id: 0,
    source: {
      value: "ახლ",
      meaning: 3,
    },
    reference: {
      source: {
        value: "ხლ",
        meaning: 3,
      },
      type: "DIRECT",
      tags: [],
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
