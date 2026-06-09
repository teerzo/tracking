create table public.project_rates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  start_date date not null,
  end_date date,
  hourly_rate numeric(10, 2) not null default 0,
  constraint project_rates_end_after_start check (
    end_date is null or end_date >= start_date
  )
);

create index idx_project_rates_project_id on public.project_rates (project_id);
create index idx_project_rates_project_start on public.project_rates (project_id, start_date);

create unique index idx_project_rates_one_ongoing_per_project
  on public.project_rates (project_id)
  where end_date is null;

comment on table public.project_rates is 'Hourly rate schedule per project; null end_date means ongoing.';
comment on column public.project_rates.end_date is 'Last day this rate applies (inclusive); null = ongoing.';

alter table public.project_rates enable row level security;

create policy "Authenticated users can manage project_rates"
  on public.project_rates
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.project_rates (project_id, start_date, end_date, hourly_rate)
select id, coalesce(start_date, '1970-01-01'::date), null, hourly_rate
from public.projects;
