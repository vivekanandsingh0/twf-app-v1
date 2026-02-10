# 🚨 QUICK ACTION: Product Not Showing in User App

## Immediate Steps (Do These NOW)

### Step 1: Run Complete Diagnostic
📋 **File:** `COMPLETE_DIAGNOSTIC.sql`

1. Open Supabase SQL Editor
2. Copy entire contents of `COMPLETE_DIAGNOSTIC.sql`
3. Run it
4. Share ALL results with me

This will tell us:
- ✅ If products exist in database
- ✅ If stock is > 0 (CRITICAL - user app only shows stock > 0)
- ✅ If images column exists
- ✅ If RLS policies are correct
- ✅ Category breakdown

### Step 2: Check Browser Console

**In Vendor App:**
1. Press F12 (open DevTools)
2. Go to Console tab
3. Look for errors containing:
   - "Failed to add product"
   - "column does not exist"
   - "permission denied"
4. Screenshot and share

**In User App:**
1. Press F12
2. Go to Console tab
3. Look for:
   - "Failed to fetch products"
   - Any Supabase errors
4. Screenshot and share

### Step 3: Force Refresh User App
- Press `Ctrl+Shift+R` (hard reload)
- Or restart Expo with `r` in terminal

## Most Likely Issues (Based on Code Review)

### Issue #1: Stock is 0 or Empty ⚠️ **MOST LIKELY**
**Problem:** User app only shows products with `stock > 0`

**Check:** In your screenshot, what did you enter for "Available Quantity"?

**Quick Fix:**
```sql
-- Update stock for the most recent product
UPDATE products 
SET stock = 20 
WHERE id = (SELECT id FROM products ORDER BY created_at DESC LIMIT 1);
```

### Issue #2: Images Column Missing
**Check:** Did the migration actually run?

**Quick Fix:**
```sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
NOTIFY pgrst, 'reload config';
```
Wait 10 seconds, then try again.

### Issue #3: Realtime Not Updating
**Quick Fix:** Just refresh the user app page

## What to Report Back

Please provide:

1. **Results from `COMPLETE_DIAGNOSTIC.sql`** (most important!)
   - Specifically: How many products exist?
   - What is the stock value of the most recent product?
   - Does the images column exist?

2. **Console errors** (if any)
   - From vendor app
   - From user app

3. **What you entered:**
   - Product name: "hi"
   - Category: "Dairy" 
   - Available Quantity: **??? (TELL ME THIS)**
   - Price: "20"

4. **User app behavior:**
   - Did you refresh the page?
   - Are you looking at the correct category tab?
   - Any error messages?

## Expected Results

### ✅ If Everything is Working:
- Diagnostic shows product exists with `stock > 0`
- Product appears in user app after refresh
- No console errors

### ❌ If Stock is 0:
- Diagnostic shows product exists but `stock = 0` or `NULL`
- Product won't appear in user app (by design)
- Fix: Update stock to > 0

### ❌ If Images Column Missing:
- Diagnostic shows "column does not exist"
- Product insert failed
- Fix: Run migration again

---

## 🎯 Action Required

**RIGHT NOW:**
1. Run `COMPLETE_DIAGNOSTIC.sql` in Supabase
2. Share the results
3. Tell me what you entered for "Available Quantity"

This will tell us exactly what's wrong! 🚀
