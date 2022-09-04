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
  { id: 1,
    source: {
      value: "ახლ",
      meaning: 3,
    },
    reference: {
      id: 99,
      source: {
        value: "ხლ",
        meaning: 3,
      },
      kind: "DIRECT",
      tags: [],
    },
  },
];

function entry(id) {
  return entriesArray.find(entry => entry.id == id);
}

function findEntries(term) {
  return entriesArray.filter(entry => entry.source.value.includes(term) || entry.target?.some(e => e.value.some(w => w.includes(term))) || entry.reference?.source.value.includes(term));
}

const database = {
  entry,
  findEntries,
}

export { database };
