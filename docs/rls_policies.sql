-- RLS policies for ELDEPARFUM public tables and storage
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

alter table storage.objects enable row level security;

drop policy if exists "Public can read product-images bucket" on storage.objects;
create policy "Public can read product-images bucket"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Public cannot insert product-images bucket" on storage.objects;
create policy "Public cannot insert product-images bucket"
on storage.objects
for insert
to public
with check (bucket_id = 'product-images' and false);

drop policy if exists "Public cannot update product-images bucket" on storage.objects;
create policy "Public cannot update product-images bucket"
on storage.objects
for update
to public
using (bucket_id = 'product-images' and false)
with check (bucket_id = 'product-images' and false);

drop policy if exists "Public cannot delete product-images bucket" on storage.objects;
create policy "Public cannot delete product-images bucket"
on storage.objects
for delete
to public
using (bucket_id = 'product-images' and false);
