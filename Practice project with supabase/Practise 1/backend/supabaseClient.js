const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Creates a Supabase client scoped to one user's access token, so every
// query automatically respects that user's Row Level Security policies
// (e.g. "only see your own todos") instead of using an admin-level key.
function getSupabaseClient(accessToken) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

module.exports = getSupabaseClient;
