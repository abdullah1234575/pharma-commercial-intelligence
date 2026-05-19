create extension if not exists pgcrypto;

create type public.user_role as enum ('owner', 'admin', 'analyst', 'viewer');
create type public.upload_status as enum ('processed', 'failed');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company text,
  phone text,
  source text,
  verified boolean not null default false,
  last_active timestamptz,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.user_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  email text not null,
  full_name text,
  company text,
  phone text,
  source text,
  verified boolean not null default false,
  export_count int not null default 0,
  last_active timestamptz,
  created_at timestamptz not null default now()
);

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  sheet_count int not null default 0,
  row_count int not null default 0,
  status public.upload_status not null default 'processed',
  mapping_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.processed_data (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  upload_id uuid not null references public.uploads(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  period_date date not null,
  year int not null,
  quarter text not null,
  month text not null,
  region text not null,
  territory text not null,
  product_line text not null,
  brand text not null,
  medical_rep text not null,
  manager text not null,
  customer_type text not null,
  channel text not null,
  sales numeric(14,2) not null default 0,
  target numeric(14,2) not null default 0,
  forecast numeric(14,2) not null default 0,
  units numeric(14,2) not null default 0,
  customers numeric(14,2) not null default 0,
  active_customers numeric(14,2) not null default 0,
  calls numeric(14,2) not null default 0,
  planned_calls numeric(14,2) not null default 0,
  prescriptions numeric(14,2) not null default 0,
  ims_sales numeric(14,2) not null default 0,
  market_size numeric(14,2) not null default 0,
  contribution_margin numeric(14,2) not null default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  insight_type text not null,
  title text not null,
  narrative text not null,
  severity text not null default 'info',
  source_period text,
  created_at timestamptz not null default now()
);

create table public.dashboard_configs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index processed_data_workspace_period_idx on public.processed_data(workspace_id, period_date);
create index processed_data_workspace_brand_idx on public.processed_data(workspace_id, brand);
create index processed_data_workspace_territory_idx on public.processed_data(workspace_id, territory);
create index uploads_workspace_created_idx on public.uploads(workspace_id, created_at desc);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles public.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.role = any(allowed_roles)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  insert into public.users (id, email, full_name, company, phone, source, verified, last_active)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'source',
    coalesce((new.raw_user_meta_data->>'verified')::boolean, false),
    now()
  )
  on conflict (id) do nothing;

  insert into public.workspaces (name, owner_id)
  values (coalesce(new.raw_user_meta_data->>'workspace_name', 'Commercial Intelligence Workspace'), new.id)
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.uploads enable row level security;
alter table public.processed_data enable row level security;
alter table public.ai_insights enable row level security;
alter table public.dashboard_configs enable row level security;

create policy "Users can read themselves" on public.users
for select using (id = auth.uid());

create policy "Users can update themselves" on public.users
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Members can read workspaces" on public.workspaces
for select using (public.is_workspace_member(id));

create policy "Owners can update workspaces" on public.workspaces
for update using (public.has_workspace_role(id, array['owner','admin']::public.user_role[]))
with check (public.has_workspace_role(id, array['owner','admin']::public.user_role[]));

create policy "Members can read workspace membership" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));

create policy "Admins manage workspace membership" on public.workspace_members
for all using (public.has_workspace_role(workspace_id, array['owner','admin']::public.user_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin']::public.user_role[]));

create policy "Members can read uploads" on public.uploads
for select using (public.is_workspace_member(workspace_id));

create policy "Analysts can insert uploads" on public.uploads
for insert with check (
  user_id = auth.uid()
  and public.has_workspace_role(workspace_id, array['owner','admin','analyst']::public.user_role[])
);

create policy "Admins can delete uploads" on public.uploads
for delete using (public.has_workspace_role(workspace_id, array['owner','admin']::public.user_role[]));

create policy "Members can read processed data" on public.processed_data
for select using (public.is_workspace_member(workspace_id));

create policy "Analysts can insert processed data" on public.processed_data
for insert with check (
  user_id = auth.uid()
  and public.has_workspace_role(workspace_id, array['owner','admin','analyst']::public.user_role[])
);

create policy "Admins can manage processed data" on public.processed_data
for delete using (public.has_workspace_role(workspace_id, array['owner','admin']::public.user_role[]));

create policy "Members can read insights" on public.ai_insights
for select using (public.is_workspace_member(workspace_id));

create policy "Analysts can manage insights" on public.ai_insights
for all using (public.has_workspace_role(workspace_id, array['owner','admin','analyst']::public.user_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin','analyst']::public.user_role[]));

create policy "Members can read dashboard configs" on public.dashboard_configs
for select using (public.is_workspace_member(workspace_id));

create policy "Members can save dashboard configs" on public.dashboard_configs
for insert with check (
  user_id = auth.uid()
  and public.is_workspace_member(workspace_id)
);

create policy "Config owners and admins can update configs" on public.dashboard_configs
for update using (
  user_id = auth.uid()
  or public.has_workspace_role(workspace_id, array['owner','admin']::public.user_role[])
)
with check (
  user_id = auth.uid()
  or public.has_workspace_role(workspace_id, array['owner','admin']::public.user_role[])
);
