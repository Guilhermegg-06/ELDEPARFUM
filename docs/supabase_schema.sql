-- Supabase schema  ELDEPARFUM

-- ptabela de produtos
create table if not exists products (
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

-- função de gatilho para atualizar updated_at em caso de alteração
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- gatilho
create trigger trigger_update_products_updated_at
before update on products
for each row
execute procedure update_updated_at_column();

-- tabela de produtos img
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);
