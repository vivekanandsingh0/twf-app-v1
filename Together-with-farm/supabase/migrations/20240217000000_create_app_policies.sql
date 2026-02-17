-- Create a table for app policies/legal pages
create table if not exists public.app_policies (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  content text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.app_policies enable row level security;

-- Create policies for public read visibility
create policy "Allow public read access"
on public.app_policies for select
to public
using (true);

-- Create policies for admin write access (authenticated users or specific role if you have roles)
-- For now, allowing all authenticated users to update/insert for simplicity, assuming only admins login to admin panel.
create policy "Allow authenticated insert/update"
on public.app_policies for all
to authenticated
using (true)
with check (true);

-- Insert initial rows
insert into public.app_policies (slug, title, content)
values
  ('terms-conditions', 'Terms & Conditions', '<h1>Terms and Conditions</h1><p>Welcome to Together with Farm. These are our terms...</p>'),
  ('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>'),
  ('privacy-security', 'Privacy & Security', '<h1>Privacy & Security</h1><p>We secure your data...</p>')
on conflict (slug) do nothing;
