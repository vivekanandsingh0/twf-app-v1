// Run this migration script to add product images support
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ftnkpsaxxdbdnrkxtvkt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Starting migration: Add Product Images Support\n');

    try {
        // Read the migration SQL file
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_product_images_support.sql'),
            'utf8'
        );

        console.log('📝 Executing migration SQL...\n');

        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: migrationSQL
        });

        if (error) {
            console.error('❌ Migration failed:', error);
            process.exit(1);
        }

        console.log('✅ Migration completed successfully!\n');
        console.log('Changes applied:');
        console.log('  ✓ Added "images" column to products table');
        console.log('  ✓ Created "product-images" storage bucket');
        console.log('  ✓ Set up storage policies (public read, authenticated upload)');
        console.log('  ✓ Reloaded schema cache\n');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

runMigration();
