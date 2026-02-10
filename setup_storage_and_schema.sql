-- 1. Create product-images Bucket (if not exists)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Allow Public Read Access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- 3. Allow Authenticated Uploads
create policy "Authenticated Upload"
on storage.objects for insert
with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- 4. Allow Users to Update/Delete Own Images
create policy "Users can update own images"
on storage.objects for update
using ( auth.uid() = owner )
with check ( bucket_id = 'product-images' );

create policy "Users can delete own images"
on storage.objects for delete
using ( auth.uid() = owner and bucket_id = 'product-images' );

-- 5. Fix Missing Columns in Products Table (Just in case)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;

-- 6. Reload Schema Cache (Critical for API)
NOTIFY pgrst, 'reload config';
