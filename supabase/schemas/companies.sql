-- Schema: companies table (invoice "Bill to")
-- Columns: id, name, address, abn, phone, email, contact_name

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  abn text,
  phone text,
  email text,
  contact_name text
);

create index idx_companies_name on public.companies (name);

comment on table public.companies is 'Company/client information.';

alter table public.companies enable row level security;

create policy "Authenticated users can manage companies"
  on public.companies
  for all
  to authenticated
  using (true)
  with check (true);
