import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yelkqthguvtcxhrylaxf.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbGtxdGhndXZ0Y3hocnlsYXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxOTI1ODIsImV4cCI6MjA0MDc2ODU4Mn0.XRKnBjrhODQ__mQFzKhE-Zrslu8u7c5tFtALHb1BfeI"

export const supabase = createClient(supabaseUrl, supabaseKey)