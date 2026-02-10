# Product Images Fix - Summary & Next Steps

## Problem
Products added by vendors are disappearing because the database schema is missing the `images` column. The app is trying to save an array of image URLs to a column that doesn't exist, causing the insert to fail.

## Root Cause
- **App Code**: Expects `images` (JSONB array) column in the `products` table
- **Database Schema**: Only has `image_url` (text) column
- **Result**: Product inserts fail silently in the background, products disappear from UI

## Solution Overview
1. Add `images` JSONB column to the products table
2. Create `product-images` storage bucket
3. Set up storage policies for image uploads
4. Reload schema cache

## Files Created

### 1. `APPLY_THIS_MIGRATION.sql` ⭐ **APPLY THIS FIRST**
Complete migration SQL that you need to run in Supabase SQL Editor.
- Adds `images` column
- Creates storage bucket
- Sets up all necessary policies
- Includes verification queries

### 2. `supabase_schema.sql` (Updated)
Updated base schema with `images` column for future reference.

### 3. `migrations/add_product_images_support.sql`
Standalone migration file (same as APPLY_THIS_MIGRATION.sql).

## How to Apply the Fix

### Step 1: Run the Migration in Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `ftnkpsaxxdbdnrkxtvkt`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `APPLY_THIS_MIGRATION.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify the Migration

After running the migration, run these verification queries in the SQL Editor:

```sql
-- Check if images column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'images';

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check storage policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%Product Images%';
```

Expected results:
- ✅ `images` column should show as `jsonb` type with default `'[]'::jsonb`
- ✅ `product-images` bucket should exist with `public = true`
- ✅ 4 policies should be listed (SELECT, INSERT, UPDATE, DELETE)

### Step 3: Test the Fix

1. Open your vendor app
2. Try adding a new product with images
3. The product should now save successfully and remain visible
4. Check the Supabase Storage to see uploaded images

## What the Code Already Does (No Changes Needed)

The app code in `VendorContext.tsx` already:
- ✅ Uploads images to `product-images` bucket
- ✅ Saves image URLs to the `images` array
- ✅ Handles multiple images (up to 3)
- ✅ Provides optimistic UI updates
- ✅ Shows error messages if save fails

## Troubleshooting

### If products still disappear:
1. Check browser console for errors
2. Look for the error alert that shows the specific database error
3. Verify the migration ran successfully using the verification queries

### If images don't upload:
1. Check that the `product-images` bucket exists in Storage
2. Verify storage policies are set correctly
3. Check that the app has internet connection

### If you see "column does not exist" error:
1. The migration didn't run successfully
2. Try running just the ALTER TABLE command:
   ```sql
   ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
   NOTIFY pgrst, 'reload config';
   ```

## Current Status

- ✅ Migration SQL created
- ✅ Schema updated
- ✅ App code already handles images correctly
- ⏳ **WAITING**: You need to run the migration in Supabase Dashboard

## Next Action Required

**Run `APPLY_THIS_MIGRATION.sql` in your Supabase SQL Editor NOW!**

After that, test adding a product and let me know if it works!
