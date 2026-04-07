-- Schema: time table (time entries per project)
-- Columns: id, project_id, hours, date, notes, date_created, time_zone, client_offset_minutes

create table public.time (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete restrict,
  hours numeric(5, 2) not null check (hours >= 0),
  date date not null,
  notes text,
  date_created timestamptz not null default now(),
  time_zone text,
  client_offset_minutes integer
);

create unique index time_project_id_date_key on public.time (project_id, date);
create index idx_time_project_id on public.time (project_id);
create index idx_time_date on public.time (date);

comment on table public.time is 'Time entries linked to projects; one row per (project_id, date).';

alter table public.time enable row level security;

create policy "Authenticated users can manage time entries"
  on public.time
  for all
  to authenticated
  using (true)
  with check (true);
