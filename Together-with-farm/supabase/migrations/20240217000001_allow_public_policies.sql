-- Update policies to allow anonymous (public) access for the Admin Panel
-- Since the Admin Panel currently doesn't have authentication, we need to allow 'anon' role to update these policies.

-- Drop the authenticated-only policy if it exists (to avoid confusion, though multiple policies are OR'ed)
drop policy if exists "Allow authenticated insert/update" on public.app_policies;

-- Create a new policy allowing ALL access to public (anon + authenticated)
create policy "Allow public full access"
on public.app_policies for all
to public
using (true)
with check (true);
