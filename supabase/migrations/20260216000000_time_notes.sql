-- Add notes column to time table
ALTER TABLE public.time ADD COLUMN IF NOT EXISTS notes text;

-- Drop old 3-param version before creating new 4-param version
DROP FUNCTION IF EXISTS public.add_time_entry(uuid, date, numeric);

-- Update add_time_entry to accept and store notes
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
    notes = COALESCE(NULLIF(TRIM(EXCLUDED.notes), ''), public.time.notes)
  RETURNING *;
$$;

GRANT EXECUTE ON FUNCTION public.add_time_entry(uuid, date, numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.add_time_entry(uuid, date, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_time_entry(uuid, date, numeric, text) TO service_role;
