const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Path to your env file (adjust if needed)
const envPath = 'twf-admin/.env.local';

// Read env variables
let supabaseUrl, supabaseKey;
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=');
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
  }, {});
  supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
  supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
} else {
    console.error("No .env file found");
}

if(!supabaseUrl || !supabaseKey) {
    console.error("Missing keys");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('payout_requests')
    .select(`
      *,
      profiles:vendor_id (id, full_name, business_name, phone, bank_details)
    `);
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
