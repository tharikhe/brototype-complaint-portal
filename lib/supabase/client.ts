// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase credentials not found!\n' +
        'Please create a .env.local file with:\n' +
        'NEXT_PUBLIC_SUPABASE_URL=your_url\n' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key\n' +
        '\nGet these from: https://app.supabase.com/project/_/settings/api'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
