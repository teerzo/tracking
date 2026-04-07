-- RPC: insert or add hours to existing row for (project_id, date).
-- Requires unique on (project_id, date) - already in initial_schema as time_project_id_date_key.

CREATE OR REPLACE FUNCTION public.add_time_entry(
  p_project_id uuid,
  p_date date,
  p_hours numeric
)
RETURNS SETOF public.time
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.time (project_id, date, hours)
  VALUES (p_project_id, p_date, p_hours)
  ON CONFLICT (project_id, date)
  DO UPDATE SET hours = public.time.hours + EXCLUDED.hours
  RETURNING *;
$$;

GRANT EXECUTE ON FUNCTION public.add_time_entry(uuid, date, numeric) TO anon;
GRANT EXECUTE ON FUNCTION public.add_time_entry(uuid, date, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_time_entry(uuid, date, numeric) TO service_role;
