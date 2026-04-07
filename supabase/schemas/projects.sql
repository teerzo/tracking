-- Schema: projects table (time-tracking projects)
-- Columns: id, project_name, start_date, end_date, hourly_rate, company_id

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  start_date date,
  end_date date,
  hourly_rate numeric(10, 2) not null default 0,
  company_id uuid not null references public.companies (id) on delete restrict
);

create index idx_projects_start_date on public.projects (start_date);
create index idx_projects_company_id on public.projects (company_id);

comment on table public.projects is 'Time-tracking projects with name, dates, rate, and company';

alter table public.projects enable row level security;

create policy "Authenticated users can manage projects"
  on public.projects
  for all
  to authenticated
  using (true)
  with check (true);
