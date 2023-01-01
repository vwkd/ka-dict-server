import { createClient } from "supabase";

// TODO: handle undefined if missing
const SUPABASE_URL = "https://anudqitloenwqgdrwnau.supabase.co"; // Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudWRxaXRsb2Vud3FnZHJ3bmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI0OTMwMjksImV4cCI6MTk4ODA2OTAyOX0.k085OVINDKFA0c4ApteHEn2Ndehe0Py-c5KNGaNQGsU"; // Deno.env.get("SUPABASE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function entry(id: string) {
  const { data, error } = await supabase
    .from("sources")
    .select(`
      id,
      value,
      meaning,
      targets (
        references (
          sources (
            value,
            meaning
            ),
          kind,
          tags (
            value
          )
        ),
        fields (
          elements (
            value,
            categories (
              value
            )
          ),
          tags (
            value
          )
        )
      )
    `)
    .eq("id", id)
    .order("meaning", { foreignTable: "targets" })
    .order("index", { foreignTable: "targets.fields" })
    .order("index", { foreignTable: "targets.fields.elements" });

  if (error) {
    throw error;
  }

  return data;
}

async function findEntries(value: string, amount: string, after: string | null, before: string | null) {
  const limit = amount ? +amount : 10;
  const from = before ? before * limit : 0;



  const { data, error } = await supabase
  // TODO: fixup supabase commit
  // todo: limit, pagination using arguments, return pagination data
  // todo: filter, return only elements that match
  .from("sources")
  .select(`
    id,
    value,
    meaning,
    targets (
      references (
        sources (
          value,
          meaning
          ),
        kind
      ),
      fields (
        elements (
          value
        )
      )
    )
  `)
  .or(`value.imatch.${value}`)
  .or(`targets.references.sources.value.imatch.${value}`, { foreignTable: "targets.references.sources" })
  .or(`targets.fields.elements.value.imatch.${value}`, { foreignTable: "targets.fields.elements" })
  .order("meaning", { foreignTable: "targets" })
  .order("index", { foreignTable: "targets.fields" })
  .order("index", { foreignTable: "targets.fields.elements" })
  .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data,
    count,
    cursor,
  };
}

const database = {
  entry,
  findEntries,
};

export { database };
