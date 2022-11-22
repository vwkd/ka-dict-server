import { DB } from "$sqlite/mod.ts";
import { prepareLocalFile, prepareVirtualFile } from "$mock_file/mod.ts";

await prepareLocalFile("./database.db");
prepareVirtualFile("./database.sqlite-journal");

const db = new DB("./database.db", { mode: "read" });

/*
function entry(id) {

  const result = ... //db.query("SELECT * FROM .......")

  return result;
}

function findEntries(term) {
  const results = ... //db.query("SELECT * FROM .......")

  return results;
}
*/

function getSource(sourceId) {
  console.log(`getSource for sourceId ${sourceId}`);
  const rows = db.query(`SELECT value, meaning FROM sources WHERE sources.id = ${sourceId}`);
  const res = rows.map(([value, meaning]) => ({ value, meaning }));
  
  // beware: assume always single row!
  return res[0];
}

function getTargets(sourceId) {
  console.log(`getTarget for sourceId ${sourceId}`);
  const rows = db.query(`SELECT id, meaning FROM targets WHERE targets.source = ${sourceId}`);
  const res = rows.map(([id, meaning]) => ({
    // beware: id not used in schema, just internally for resolvers
    id,
    value: [],
    meaning,
    //tags: [],
  }));

  return res;
}

function getDefinitions(targetId) {
  console.log(`getDefinitions for targetId ${targetId}`);
  const fieldRows = db.query(`SELECT id, "index" FROM fields WHERE fields.target = ${targetId}`);
  const fieldRes = fieldRows.map(([id, index]) => ({
    // beware: id not used in schema, just internally for resolvers
    id,
    value: [],
    index,
    tags: [],
    // neccessary for tags resolver
    _targetId: targetId,
  }));

  const referenceRows = db.query(`SELECT id, source, kind, meaning FROM "references" WHERE "references".target = ${targetId}`);
  const referenceRes = referenceRows.map(([id, sourceId, kind, meaning]) => ({
    // beware: id not used in schema, just internally for resolvers
    id,
    source: getSource(sourceId),
    kind,
    meaning,
    tags: [],
    // neccessary for tags resolver
    _targetId: targetId,
  }));

  console.log("getDefinition", fieldRows, referenceRows);

  // beware: expects exactly one, either fields or references, to be non-null for given targetId
  if (fieldRes[0]) {
    return fieldRes;
  } else if (referenceRes[0]) {
  // beware: assume always single row for reference!
  // still returns array because GraphQL requires it for union
    return referenceRes;
  } else {
    throw new Error(`No field or reference found for target with targetId ${targetId}`);
  }  
}

function getElements(fieldId) {
  console.log(`getElement for fieldId ${fieldId}`);
  const rows = db.query(`SELECT id, "index", value FROM elements WHERE elements.field = ${fieldId}`);
  const res = rows.map(([id, index, value]) => ({
    // beware: id not used in schema, just internally for resolvers
    id,
    index,
    value,
    // todo: rename to categories
    category: []
  }));

  return res;
}

function getTags(targetId) {
  console.log(`getTags for targetId ${targetId}`);
  // todo: add tagization."index"
  const rows = db.query(`SELECT tagization.id, tags.value FROM tagization JOIN tags ON tagization.tag = tags.id WHERE tagization.target = ${targetId}`);
  const res = rows.map(([id, /*index,*/ value]) => ({
    // beware: id not used in schema, just internally for resolvers
    id,
    //index,
    value,
  }));

  return res;
}

function getCategories(elementId) {
  console.log(`getCategories for elementId ${elementId}`);
  // todo: add categorization."index", 
  const rows = db.query(`SELECT categorization.id, categories.value FROM categorization JOIN categories ON categorization.category = categories.id WHERE categorization.element = ${elementId}`);
  const res = rows.map(([id, /*index,*/ value]) => ({
    // beware: id not used in schema, just internally for resolvers
    id,
    //index,
    value,
  }));

  return res;
}

const database = {
  // entry,
  // findEntries,
  getSource,
  getTargets,
  getDefinitions,
  getElements,
  getTags,
  getCategories,
};

export { database };
