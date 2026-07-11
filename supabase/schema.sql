-- Trainly Supabase schema for the current vanilla HTML/CSS/JS prototype.
-- This uses public anon CRUD policies for a portfolio demo.
-- Do not use these policies for production client health or fitness data.

create table if not exists public.clients (
  id text primary key,
  initials text not null default 'CL',
  name text not null,
  level text not null default 'Beginner',
  goal text not null default 'No goal set yet.',
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  attendance text not null default 'New',
  status text not null default 'Active',
  note text not null default 'No coaching note yet.',
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id text primary key,
  name text not null,
  focus text not null default 'No plan focus yet.',
  client_ids text[] not null default '{}',
  exercises jsonb not null default '[]'::jsonb,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id text primary key,
  client_id text,
  starts_at text not null,
  type text not null default 'Training session',
  notes text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_entries (
  id text primary key,
  client_id text,
  entry_date date not null,
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  weight text not null default '',
  measurement text not null default '',
  note text not null default '',
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id text primary key,
  client_id text,
  created_at text not null,
  message text not null,
  reply text not null default '',
  status text not null default 'open' check (status in ('open', 'resolved')),
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_workouts_updated_at on public.workouts;
create trigger set_workouts_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

drop trigger if exists set_sessions_updated_at on public.sessions;
create trigger set_sessions_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_progress_entries_updated_at on public.progress_entries;
create trigger set_progress_entries_updated_at
before update on public.progress_entries
for each row execute function public.set_updated_at();

drop trigger if exists set_checkins_updated_at on public.checkins;
create trigger set_checkins_updated_at
before update on public.checkins
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.workouts enable row level security;
alter table public.sessions enable row level security;
alter table public.progress_entries enable row level security;
alter table public.checkins enable row level security;

drop policy if exists "Demo anon read clients" on public.clients;
create policy "Demo anon read clients" on public.clients for select to anon using (true);
drop policy if exists "Demo anon insert clients" on public.clients;
create policy "Demo anon insert clients" on public.clients for insert to anon with check (true);
drop policy if exists "Demo anon update clients" on public.clients;
create policy "Demo anon update clients" on public.clients for update to anon using (true) with check (true);
drop policy if exists "Demo anon delete clients" on public.clients;
create policy "Demo anon delete clients" on public.clients for delete to anon using (true);

drop policy if exists "Demo anon read workouts" on public.workouts;
create policy "Demo anon read workouts" on public.workouts for select to anon using (true);
drop policy if exists "Demo anon insert workouts" on public.workouts;
create policy "Demo anon insert workouts" on public.workouts for insert to anon with check (true);
drop policy if exists "Demo anon update workouts" on public.workouts;
create policy "Demo anon update workouts" on public.workouts for update to anon using (true) with check (true);
drop policy if exists "Demo anon delete workouts" on public.workouts;
create policy "Demo anon delete workouts" on public.workouts for delete to anon using (true);

drop policy if exists "Demo anon read sessions" on public.sessions;
create policy "Demo anon read sessions" on public.sessions for select to anon using (true);
drop policy if exists "Demo anon insert sessions" on public.sessions;
create policy "Demo anon insert sessions" on public.sessions for insert to anon with check (true);
drop policy if exists "Demo anon update sessions" on public.sessions;
create policy "Demo anon update sessions" on public.sessions for update to anon using (true) with check (true);
drop policy if exists "Demo anon delete sessions" on public.sessions;
create policy "Demo anon delete sessions" on public.sessions for delete to anon using (true);

drop policy if exists "Demo anon read progress entries" on public.progress_entries;
create policy "Demo anon read progress entries" on public.progress_entries for select to anon using (true);
drop policy if exists "Demo anon insert progress entries" on public.progress_entries;
create policy "Demo anon insert progress entries" on public.progress_entries for insert to anon with check (true);
drop policy if exists "Demo anon update progress entries" on public.progress_entries;
create policy "Demo anon update progress entries" on public.progress_entries for update to anon using (true) with check (true);
drop policy if exists "Demo anon delete progress entries" on public.progress_entries;
create policy "Demo anon delete progress entries" on public.progress_entries for delete to anon using (true);

drop policy if exists "Demo anon read checkins" on public.checkins;
create policy "Demo anon read checkins" on public.checkins for select to anon using (true);
drop policy if exists "Demo anon insert checkins" on public.checkins;
create policy "Demo anon insert checkins" on public.checkins for insert to anon with check (true);
drop policy if exists "Demo anon update checkins" on public.checkins;
create policy "Demo anon update checkins" on public.checkins for update to anon using (true) with check (true);
drop policy if exists "Demo anon delete checkins" on public.checkins;
create policy "Demo anon delete checkins" on public.checkins for delete to anon using (true);
