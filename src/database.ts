import { createClient } from "supabase";

// TODO: handle undefined if missing
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");

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

async function findEntries(term: string) {
  const { data, error } = await supabase
    .from("sources")
    .select();

  if (error) {
    throw error;
  }

  return data;
}

const database = {
  entry,
  findEntries,
};

export { database };
