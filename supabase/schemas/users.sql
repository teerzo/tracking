-- Schema: public.users table
-- Profile + invoice "Bill from" fields: id, email, billing_email, given_name, family_name, address, mobile, abn, account_number, bsb

create table public.users (
  id uuid primary key,
  email text not null unique,
  billing_email text,
  given_name text,
  family_name text,
  address text,
  mobile text,
  abn text,
  account_number text,
  bsb text
);

comment on table public.users is 'Public profile data for users linked to auth.users.';

alter table public.users enable row level security;

create policy "Users can manage their own profile"
  on public.users
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

