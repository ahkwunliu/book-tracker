import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = '你的Project URL'       // 替换这里
const SUPABASE_KEY = '你的anon public key'   // 替换这里

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
