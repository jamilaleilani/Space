create table if not exists public.app_accounts (
  id text primary key,
  name text not null,
  role text not null check (role in ('user', 'admin')),
  email text not null unique,
  password text not null default '',
  client_since date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id text primary key,
  owner_id text not null references public.app_accounts(id) on delete cascade,
  name text not null,
  category text not null,
  description text not null default '',
  status text not null,
  location text not null default '',
  storage_request_date date,
  storage_request_window text not null default '',
  return_request_date date,
  return_request_window text not null default '',
  return_request_type text not null default '',
  completed_at timestamptz,
  image text not null default '',
  notifications jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_accounts enable row level security;
alter table public.items enable row level security;

drop policy if exists "Public full access to accounts" on public.app_accounts;
create policy "Public full access to accounts"
on public.app_accounts
for all
using (true)
with check (true);

drop policy if exists "Public full access to items" on public.items;
create policy "Public full access to items"
on public.items
for all
using (true)
with check (true);
