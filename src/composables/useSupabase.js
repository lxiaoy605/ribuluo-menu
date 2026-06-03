import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ociyiskgwmgcndedhjyv.supabase.co'
const supabaseKey = 'sb_publishable_xU7_B3K38yllhW4KBTE-pg_m8OYwBST'

let client = null

export function useSupabase() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey)
  }
  return { supabase: client }
}
