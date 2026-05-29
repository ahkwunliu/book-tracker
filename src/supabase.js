import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yygbkadptrnkbdkotryq.supabase.co'       // 替换这里
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Z2JrYWRwdHJua2Jka290cnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNDExMjcsImV4cCI6MjA5NTYxNzEyN30.AyRCZ7CafVRdJdy9FMvKQwUO1mDUNkb6uOIML8i9Pig'   // 替换这里

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
