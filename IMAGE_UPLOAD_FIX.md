# Image Upload Fix - Add Product Screen

## Problem
When adding new products, images were being stored as temporary `blob:` URLs in the application state. These blob URLs are only valid during the current browser session and become invalid after re-renders or page refreshes, causing `ERR_FILE_NOT_FOUND` errors when the UI tries to display them.

**Error Symptoms:**
```
GET blob:http://localhost:8082/f7d52b4b-f618-4754-8a04-744f4d298876 net::ERR_FILE_NOT_FOUND
GET blob:http://localhost:8082/776a96d5-a6bb-4ac4-93d3-590a3991b981 net::ERR_FILE_NOT_FOUND
```

## Root Cause
In `add-product-vendor.tsx`, the `pickImage` function was storing the local blob URI directly in state:

```typescript
// OLD CODE (PROBLEMATIC)
if (!result.canceled) {
    setImages([...images, result.assets[0].uri]); // ❌ Storing blob: URL
}
```

These blob URLs were then passed to `addVendorProduct`, and while the VendorContext would eventually upload them, the UI was trying to render these invalid blob URLs before the upload completed.

## Solution
Modified the `pickImage` function to **upload images to Supabase Storage immediately** when selected, and store only the Supabase public URLs in state.

### Changes Made

#### 1. Updated `add-product-vendor.tsx`

**Added Supabase import:**
```typescript
import { supabase } from '@/lib/supabase';
```

**Modified `pickImage` function:**
```typescript
const pickImage = async () => {
    if (images.length >= 3) {
        Alert.alert("Limit Reached", "You can only add up to 3 images.");
        return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
    });

    if (!result.canceled) {
        const blobUri = result.assets[0].uri;
        console.log('📸 [AddProduct] Image selected:', blobUri.substring(0, 50) + '...');
        
        // Upload to Supabase immediately
        setLoading(true);
        try {
            if (!user?.id) {
                Alert.alert("Error", "You must be logged in to upload images.");
                setLoading(false);
                return;
            }

            console.log('☁️  [AddProduct] Uploading to Supabase...');
            
            // Fetch the blob
            const response = await fetch(blobUri);
            const blob = await response.blob();
            
            // Determine file extension from MIME type
            const fileExt = blob.type.split('/')[1] || 'jpg';
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, blob, {
                    contentType: blob.type,
                    upsert: false
                });

            if (uploadError) {
                console.error("❌ [AddProduct] Upload error:", uploadError);
                Alert.alert("Upload Failed", "Could not upload image. Please try again.");
                setLoading(false);
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            console.log('✅ [AddProduct] Image uploaded successfully:', publicUrl);
            
            // Store the Supabase URL instead of blob URL ✅
            setImages([...images, publicUrl]);
            setLoading(false);
            
        } catch (error) {
            console.error("❌ [AddProduct] Upload exception:", error);
            Alert.alert("Upload Failed", "An error occurred while uploading the image.");
            setLoading(false);
        }
    }
};
```

## How It Works Now

1. **User selects an image** → `pickImage` is called
2. **Blob URI is obtained** from the image picker
3. **Image is immediately uploaded** to Supabase Storage
4. **Supabase public URL is returned** and stored in state
5. **UI displays the Supabase URL** (valid and permanent)
6. **When product is saved**, images are already uploaded, so VendorContext skips re-upload

## Benefits

✅ **No more blob URL errors** - Only valid Supabase URLs are stored and displayed
✅ **Immediate feedback** - Loading state shows upload progress
✅ **Better UX** - Users see if upload fails before saving the product
✅ **Consistent with VendorContext** - The `uploadImageToSupabase` helper already checks for Supabase URLs and skips re-upload
✅ **Persistent images** - Images remain valid after page refresh

## Testing Steps

1. **Reload the vendor app** (press `r` in the Expo terminal or refresh the browser)
2. **Navigate to "Add Product"**
3. **Click "Add Image"** and select an image
4. **Watch the console logs** for upload progress:
   - `📸 [AddProduct] Image selected: blob:http://...`
   - `☁️  [AddProduct] Uploading to Supabase...`
   - `✅ [AddProduct] Image uploaded successfully: https://...supabase.co/...`
5. **Verify the image displays correctly** in the preview
6. **Fill in product details** and save
7. **Verify the product appears** with the correct image in the vendor home screen
8. **Refresh the page** and verify the image still displays correctly

## Console Logs to Watch For

**Successful upload:**
```
📸 [AddProduct] Image selected: blob:http://localhost:8082/...
☁️  [AddProduct] Uploading to Supabase...
✅ [AddProduct] Image uploaded successfully: https://[project].supabase.co/storage/v1/object/public/product-images/...
```

**If upload fails:**
```
❌ [AddProduct] Upload error: { ... }
```

## Next Steps

After testing, if everything works:
1. The blob URL errors should be completely gone
2. Images should display correctly immediately after selection
3. Products should save with valid Supabase image URLs
4. Images should persist after page refresh

If you still see issues, check:
- Supabase Storage bucket permissions
- Network connectivity
- Console logs for specific error messages
