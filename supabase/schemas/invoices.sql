-- Schema: invoices table
-- Columns: id, invoice_number, period_start, period_end, total_hours, total_amount, status, created_at

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text,
  period_start date not null,
  period_end date not null,
  total_hours numeric(10, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid')),
  created_at timestamptz not null default now()
);

create index idx_invoices_period_start on public.invoices (period_start);
create index idx_invoices_status on public.invoices (status);
create index idx_invoices_created_at on public.invoices (created_at desc);

comment on table public.invoices is 'Saved invoices with period, totals, and status.';

alter table public.invoices enable row level security;

create policy "Authenticated users can manage invoices"
  on public.invoices
  for all
  to authenticated
  using (true)
  with check (true);
