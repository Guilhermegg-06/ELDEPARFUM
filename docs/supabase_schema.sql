-- Supabase schema ELDEPARFUM
-- Schema only. RLS policies live in docs/rls_policies.sql

create extension if not exists pgcrypto;

-- Tabela de produtos
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null,
  price numeric(10,2) not null,
  ml int not null,
  gender text,
  family text,
  description text,
  notes_top text[] default '{}',
  notes_heart text[] default '{}',
  notes_base text[] default '{}',
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  in_stock_label text default 'Em estoque',
  featured boolean default false,
  best_seller boolean default false,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Funcao para manter updated_at sincronizado
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_products_updated_at on public.products;

create trigger trigger_update_products_updated_at
before update on public.products
for each row
execute procedure update_updated_at_column();

-- Tabela de imagens dos produtos
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

create index if not exists idx_products_active on public.products(active);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_images_product_sort on public.product_images(product_id, sort_order);
