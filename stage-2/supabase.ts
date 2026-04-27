import { createClient } from '@supabase/supabase-js'

// These come from your Supabase Project Settings > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAdminKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAdminKey, {
  auth: { persistSession: false }
});