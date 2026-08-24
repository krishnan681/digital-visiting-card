// Supabase Client Helper
// Connects to your Supabase project using environment variables
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/**
 * Performs a REST query against Supabase PostgREST endpoint
 */
export async function supabaseRest(endpoint, options = {}) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error("Supabase is not configured yet") }
  }

  const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/${endpoint}`
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...options.headers,
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const errText = await res.text()
      return { data: null, error: new Error(`Supabase error ${res.status}: ${errText}`) }
    }

    // Return null for 204 No Content
    if (res.status === 204) {
      return { data: null, error: null }
    }

    const data = await res.json()
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}
