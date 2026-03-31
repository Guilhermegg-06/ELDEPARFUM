-- RLS policies for ELDEPARFUM public tables
-- Schema objects stay in docs/supabase_schema.sql

alter table public.products enable row level security;
alter table public.products force row level security;

alter table public.product_images enable row level security;
alter table public.product_images force row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to public
using (active = true);

drop policy if exists "Public can read images from active products" on public.product_images;
create policy "Public can read images from active products"
on public.product_images
for select
to public
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.active = true
  )
);
