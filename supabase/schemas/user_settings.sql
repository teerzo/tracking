-- Schema: user_settings table (one row per user, app preferences)
-- Columns: user_id, charge_gst, gst_amount

create table public.user_settings (
  user_id uuid primary key references public.users (id) on delete cascade,
  charge_gst boolean not null default true,
  gst_amount numeric(5, 2) not null default 10 check (gst_amount >= 0 and gst_amount <= 100)
);

comment on table public.user_settings is 'Per-user app settings (e.g. invoice preferences).';

alter table public.user_settings enable row level security;

create policy "Users can manage their own settings"
  on public.user_settings
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
