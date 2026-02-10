# 🔍 Product Not Showing - Debugging Guide

## Issue
Product saved in vendor app but not appearing in user app.

## Possible Causes

### 1. Product Not Actually Saved to Database
**Check:** Run `DEBUG_PRODUCTS.sql` in Supabase SQL Editor

**Look for:**
- Does the product exist in the database?
- Does it have the correct `vendor_id`?
- Is the `stock` value > 0? (User app only shows products with stock > 0)

### 2. Stock is 0 or NULL
**Problem:** MarketContext only fetches products with `.gt('stock', 0)` (line 125)

**Solution:** Ensure "Available Quantity" field has a value > 0 when adding product

**Quick Fix SQL:**
```sql
-- Check if your product has stock = 0
SELECT id, name, stock FROM products ORDER BY created_at DESC LIMIT 5;

-- If stock is 0, update it:
UPDATE products 
SET stock = 20 
WHERE id = 'YOUR_PRODUCT_ID_HERE';
```

### 3. Images Column Causing Insert Failure
**Check:** Look for errors in vendor app console

**Expected error:** 
```
Failed to add product in background: column "images" does not exist
```

**Solution:** Ensure migration was applied (check with VERIFY_MIGRATION.sql)

### 4. RLS Policies Blocking Access
**Check:** Run this in Supabase SQL Editor:
```sql
-- Check RLS policies
SELECT policyname, cmd, qual::text 
FROM pg_policies 
WHERE tablename = 'products';
```

**Expected policies:**
- "Products are viewable by everyone" (SELECT) - using: `true`
- "Vendors can insert their own products" (INSERT)
- "Vendors can update their own products" (UPDATE)
- "Vendors can delete their own products" (DELETE)

### 5. Realtime Subscription Not Working
**Problem:** User app might not be receiving realtime updates

**Solution:** Manually refresh the user app or restart it

### 6. Category Mismatch
**Problem:** User app might be filtering by category

**Check:** What category did you select? (I see "Dairy" in your screenshot)

## Step-by-Step Debugging

### Step 1: Check Database
Run this in Supabase SQL Editor:

```sql
-- Get the most recent product
SELECT 
    id,
    name,
    category,
    price,
    stock,
    vendor_id,
    images,
    created_at
FROM products
ORDER BY created_at DESC
LIMIT 1;
```

**Expected result:**
- ✅ Product exists with correct name "hi"
- ✅ `stock` is 20 (not 0)
- ✅ `category` is "Dairy"
- ✅ `images` contains array of URLs
- ✅ `vendor_id` matches your user ID

### Step 2: Check Console Errors

**In Vendor App:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - "Failed to add product in background"
   - "column does not exist"
   - "permission denied"

**In User App:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - "Failed to fetch products for Market"
   - Any Supabase errors

### Step 3: Force Refresh User App

**Option A: Reload the page**
- Press Ctrl+R or Cmd+R

**Option B: Restart Expo**
- In terminal, press `r` to reload

**Option C: Clear cache and reload**
- Press Shift+Ctrl+R (hard reload)

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "products"
3. Look for the Supabase API call
4. Check the response - does it include your product?

## Quick Fixes

### Fix 1: Ensure Stock > 0
```sql
UPDATE products 
SET stock = 20 
WHERE name = 'hi' AND stock = 0;
```

### Fix 2: Reload Schema Cache
```sql
NOTIFY pgrst, 'reload config';
```
Wait 10 seconds, then try again.

### Fix 3: Check if Images Column Exists
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'images';
```

If empty, run the migration again.

### Fix 4: Manually Trigger Realtime Refresh

In user app, navigate away from Market page and back, or:
```javascript
// In browser console
window.location.reload();
```

## Expected Behavior

### ✅ Correct Flow:
1. Vendor adds product → Product appears in vendor list immediately (optimistic UI)
2. Background upload starts → Images upload to Storage
3. Database insert happens → Product saved with image URLs
4. Realtime subscription triggers → User app fetches updated products
5. Product appears in user app Market

### ❌ Current Issue:
Product appears in vendor app but NOT in user app

## What to Report

Please run these and share results:

1. **Database check:**
   ```sql
   SELECT id, name, category, stock, images FROM products 
   ORDER BY created_at DESC LIMIT 1;
   ```

2. **Console errors:** Any errors in browser console?

3. **Stock value:** What did you enter in "Available Quantity"?

4. **User app behavior:** 
   - Did you try refreshing?
   - Did you check the correct category tab?
   - Any console errors in user app?

---

**Next Steps:**
1. Run `DEBUG_PRODUCTS.sql` in Supabase
2. Share the results
3. Check console for errors
4. Try refreshing user app
