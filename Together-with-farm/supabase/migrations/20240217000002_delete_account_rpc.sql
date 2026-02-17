-- Create a function to allow users to delete their own account
-- This function runs with 'security definer' privileges to allow deleting from auth.users

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Check for Active Orders
  -- Active statuses: Pending, Confirmed, Processing, Shipped, Out for Delivery
  -- Inactive: Delivered, Cancelled, Returned
  if exists (
    select 1 from public.orders
    where user_id = current_user_id
    and status not in ('Delivered', 'Cancelled', 'Returned')
  ) then
    raise exception 'Action Failed: You have active orders. Please cancel or complete them before deleting your account.';
  end if;

  -- 2. Delete Profile and User Data
  -- We delete from profiles first. If foreign keys are set to CASCADE, this might auto-delete orders.
  -- If not, we manually delete to be clean.
  delete from public.notifications where user_id = current_user_id;
  delete from public.addresses where user_id = current_user_id;
  
  -- Delete orders and items if not cascading
  -- (Assuming cascade might handle it, but explicit is safer for a clean wipe)
  delete from public.order_items where order_id in (select id from public.orders where user_id = current_user_id);
  delete from public.orders where user_id = current_user_id;
  
  delete from public.profiles where id = current_user_id;

  -- 3. Delete from Auth Users (The actual account)
  delete from auth.users where id = current_user_id;
end;
$$;
