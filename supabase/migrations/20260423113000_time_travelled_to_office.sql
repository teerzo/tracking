-- Add travelled_to_office flag and extend add_time_entry RPC

alter table public."time"
  add column if not exists travelled_to_office boolean not null default false;

create or replace function public.add_time_entry(
  p_project_id uuid,
  p_date date,
  p_hours numeric,
  p_notes text DEFAULT NULL,
  p_time_zone text DEFAULT NULL,
  p_client_offset_minutes integer DEFAULT NULL,
  p_travelled_to_office boolean DEFAULT false
)
returns setof public."time"
language sql
security definer
set search_path = public
as $$
  insert into public."time" (
    project_id,
    date,
    hours,
    notes,
    time_zone,
    client_offset_minutes,
    travelled_to_office
  )
  values (
    p_project_id,
    p_date,
    p_hours,
    p_notes,
    p_time_zone,
    p_client_offset_minutes,
    coalesce(p_travelled_to_office, false)
  )
  on conflict (project_id, date)
  do update set
    hours = public."time".hours + excluded.hours,
    notes = nullif(trim(concat_ws(E'\n',
      nullif(trim(coalesce(public."time".notes, '')), ''),
      nullif(trim(coalesce(excluded.notes, '')), '')
    )), ''),
    time_zone = coalesce(excluded.time_zone, public."time".time_zone),
    client_offset_minutes = coalesce(excluded.client_offset_minutes, public."time".client_offset_minutes),
    travelled_to_office = public."time".travelled_to_office or excluded.travelled_to_office
  returning *;
$$;

grant execute on function public.add_time_entry(uuid, date, numeric, text, text, integer, boolean)
  to anon, authenticated, service_role;
