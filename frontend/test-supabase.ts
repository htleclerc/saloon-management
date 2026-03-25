import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing Supabase connection...");
    const { data: revData, error: revErr } = await supabase.from('revenue_by_month').select('*').limit(5);
    console.log('revenue_by_month:', { data: revData, error: revErr });

    const { data: expData, error: expErr } = await supabase.from('expenses').select('amount, category_id').limit(5);
    console.log('expenses:', { data: expData, error: expErr });
}
test();
