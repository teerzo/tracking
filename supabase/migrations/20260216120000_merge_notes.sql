-- Merge notes when adding time to existing row (concatenate both instead of overwriting)
CREATE OR REPLACE FUNCTION public.add_time_entry(
  p_project_id uuid,
  p_date date,
  p_hours numeric,
  p_notes text DEFAULT NULL
)
RETURNS SETOF public.time
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.time (project_id, date, hours, notes)
  VALUES (p_project_id, p_date, p_hours, p_notes)
  ON CONFLICT (project_id, date)
  DO UPDATE SET
    hours = public.time.hours + EXCLUDED.hours,
    notes = NULLIF(TRIM(CONCAT_WS(E'\n',
      NULLIF(TRIM(COALESCE(public.time.notes, '')), ''),
      NULLIF(TRIM(COALESCE(EXCLUDED.notes, '')), '')
    )), '')
  RETURNING *;
$$;
