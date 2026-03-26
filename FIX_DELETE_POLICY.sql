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

  if exists (
    select 1 from public.orders
    where (user_id = current_user_id or vendor_id = current_user_id)
    and status not in ('Delivered', 'Cancelled', 'Returned')
  ) then
    raise exception 'Action Failed: You have active orders. Please cancel or complete them before deleting your account.';
  end if;

  /* Safely delete linked rows (ignoring if tables do not exist) */
  begin
      delete from public.tickets where user_id = current_user_id;
  exception when others then end;

  begin
      delete from public.notifications where user_id = current_user_id;
  exception when others then end;

  begin
      delete from public.order_reviews where order_id in (
          select id from public.orders where vendor_id = current_user_id or user_id = current_user_id
      );
  exception when others then end;

  begin
      delete from public.coupon_usages where user_id = current_user_id;
  exception when others then end;

  begin
      delete from public.orders where vendor_id = current_user_id;
  exception when others then end;

  begin
      delete from public.orders where user_id = current_user_id;
  exception when others then end;

  begin
      delete from public.market_section_products where product_id in (
          select id from public.products where vendor_id = current_user_id
      );
  exception when others then end;

  begin
      delete from public.products where vendor_id = current_user_id;
  exception when others then end;
  
  begin
      delete from public.payout_requests where vendor_id = current_user_id;
  exception when others then end;
  
  begin
      delete from public.delivery_partners where vendor_id = current_user_id;
  exception when others then end;
  
  begin
      delete from public.vendor_spotlights where vendor_id = current_user_id;
  exception when others then end;

  /* Finally delete the core user data */
  delete from public.profiles where id = current_user_id;
  delete from auth.users where id = current_user_id;
end;
$$;
