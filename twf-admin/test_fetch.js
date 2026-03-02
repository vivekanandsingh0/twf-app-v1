const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = '.env.local';

let supabaseUrl, supabaseKey;
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=');
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
  }, {});
  supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
  supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
}

if(!supabaseUrl || !supabaseKey) { supabaseUrl = 'https://tiny-base-2323twf0api.rksuccessor.workers.dev'; supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bmtwc2F4eGRiZG5ya3h0dmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTE3OTgsImV4cCI6MjA4NDU2Nzc5OH0.mCEbcvs0gucOC2IBoYxS8CLAWfwDVDRdsaiD8G4dWrs'; } 

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('payout_requests')
    .select(`
      *,
      profiles (id, full_name, business_name, phone_number, bank_details)
    `);
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}
test();
