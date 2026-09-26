-- =====================================================================
-- PEARL ACCESORIOS · SCRIPT 1 de 2 · ESQUEMA DE BASE DE DATOS
-- Copia TODO este archivo y pégalo una sola vez en:
-- Supabase -> tu proyecto -> SQL Editor -> New query -> pegar -> Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. PERFILES (uno por cada usuario que pueda entrar al panel admin)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- Cuando se crea un usuario nuevo en Authentication, se crea su perfil
-- automáticamente (por defecto como "staff"; el administrador principal
-- se marca aparte con el script 2).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. CATEGORÍAS
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. PRODUCTOS
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  category_id uuid references public.categories (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. FOTOGRAFÍAS DE PRODUCTOS (un producto puede tener varias)
-- ---------------------------------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------
-- 5. CLIENTES (se crean solos cuando alguien hace un pedido)
-- ---------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text,
  reference text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. PEDIDOS
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text,
  delivery_reference text,
  status text not null default 'pendiente'
    check (status in ('pendiente','confirmado','preparando','enviado','entregado','cancelado')),
  total numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. PRODUCTOS DENTRO DE CADA PEDIDO
-- ---------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0
);

-- ---------------------------------------------------------------------
-- 8. OFERTAS / DESCUENTOS
-- ---------------------------------------------------------------------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  discount_percent numeric(5,2) not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. REDES SOCIALES
-- ---------------------------------------------------------------------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null, -- instagram | tiktok | facebook | whatsapp
  url text not null,
  active boolean not null default true
);

-- ---------------------------------------------------------------------
-- 10. CONFIGURACIÓN GENERAL DE LA TIENDA (una sola fila)
-- ---------------------------------------------------------------------
create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'Pearl Accesorios',
  whatsapp_number text,
  delivery_info text,
  qr_image_url text,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, store_name)
values (true, 'Pearl Accesorios')
on conflict (id) do nothing;

-- =====================================================================
-- FUNCIÓN AUXILIAR: ¿el usuario que hace la petición es admin o staff?
-- =====================================================================
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
-- SEGURIDAD (RLS): quién puede leer/escribir cada tabla
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.offers enable row level security;
alter table public.social_links enable row level security;
alter table public.store_settings enable row level security;

-- profiles: cada quien ve su propio perfil; el admin ve todos
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- categorías: todos pueden ver; solo staff/admin pueden modificar
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);
drop policy if exists "categories_staff_write" on public.categories;
create policy "categories_staff_write" on public.categories for all
  using (public.is_staff()) with check (public.is_staff());

-- productos: público ve los activos; staff/admin ve y edita todo
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select
  using (active = true or public.is_staff());
drop policy if exists "products_staff_write" on public.products;
create policy "products_staff_write" on public.products for all
  using (public.is_staff()) with check (public.is_staff());

-- fotos de producto: lectura pública, escritura solo staff/admin
drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images for select using (true);
drop policy if exists "product_images_staff_write" on public.product_images;
create policy "product_images_staff_write" on public.product_images for all
  using (public.is_staff()) with check (public.is_staff());

-- clientes: cualquiera puede crear uno (al comprar); solo staff/admin lee y edita
drop policy if exists "customers_public_insert" on public.customers;
create policy "customers_public_insert" on public.customers for insert with check (true);
drop policy if exists "customers_staff_read" on public.customers;
create policy "customers_staff_read" on public.customers for select using (public.is_staff());
drop policy if exists "customers_staff_write" on public.customers;
create policy "customers_staff_write" on public.customers for update using (public.is_staff());

-- pedidos: cualquiera puede crear uno; solo staff/admin lee/edita/borra
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert" on public.orders for insert with check (true);
drop policy if exists "orders_staff_all" on public.orders;
create policy "orders_staff_all" on public.orders for select using (public.is_staff());
drop policy if exists "orders_staff_update" on public.orders;
create policy "orders_staff_update" on public.orders for update using (public.is_staff());
drop policy if exists "orders_staff_delete" on public.orders;
create policy "orders_staff_delete" on public.orders for delete using (public.is_staff());

-- productos del pedido: mismo criterio que pedidos
drop policy if exists "order_items_public_insert" on public.order_items;
create policy "order_items_public_insert" on public.order_items for insert with check (true);
drop policy if exists "order_items_staff_read" on public.order_items;
create policy "order_items_staff_read" on public.order_items for select using (public.is_staff());
drop policy if exists "order_items_staff_write" on public.order_items;
create policy "order_items_staff_write" on public.order_items for all
  using (public.is_staff()) with check (public.is_staff());

-- ofertas: lectura pública de las activas; staff/admin administra
drop policy if exists "offers_public_read" on public.offers;
create policy "offers_public_read" on public.offers for select using (active = true or public.is_staff());
drop policy if exists "offers_staff_write" on public.offers;
create policy "offers_staff_write" on public.offers for all
  using (public.is_staff()) with check (public.is_staff());

-- redes sociales: lectura pública de las activas; staff/admin administra
drop policy if exists "social_links_public_read" on public.social_links;
create policy "social_links_public_read" on public.social_links for select using (active = true or public.is_staff());
drop policy if exists "social_links_staff_write" on public.social_links;
create policy "social_links_staff_write" on public.social_links for all
  using (public.is_staff()) with check (public.is_staff());

-- configuración de tienda: lectura pública; solo staff/admin edita
drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read" on public.store_settings for select using (true);
drop policy if exists "store_settings_staff_write" on public.store_settings;
create policy "store_settings_staff_write" on public.store_settings for update using (public.is_staff());

-- =====================================================================
-- FUNCIÓN: crear un usuario nuevo (empleado/vendedor) DESDE EL PANEL,
-- sin volver a entrar a Supabase. Solo un administrador puede usarla.
-- =====================================================================
create or replace function public.create_staff_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role text default 'staff'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede crear usuarios';
  end if;

  if p_role not in ('admin','staff') then
    raise exception 'Rol inválido';
  end if;

  new_user_id := gen_random_uuid();

  insert into auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) values (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', p_email),
    'email', new_user_id::text, now(), now(), now()
  );

  update public.profiles set role = p_role, full_name = p_full_name
  where id = new_user_id;

  return new_user_id;
end;
$$;

-- =====================================================================
-- FIN DEL SCRIPT 1. Ahora ve al archivo 2_set_admin.sql
-- =====================================================================
