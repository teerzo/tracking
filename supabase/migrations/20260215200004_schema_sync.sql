alter table "public"."companies" add column "contact_name" text;

alter table "public"."users" add column "abn" text;

alter table "public"."users" add column "account_number" text;

alter table "public"."users" add column "address" text;

alter table "public"."users" add column "bsb" text;

alter table "public"."users" add column "mobile" text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_time_entry(p_project_id uuid, p_date date, p_hours numeric, p_notes text DEFAULT NULL::text)
 RETURNS SETOF public."time"
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  INSERT INTO public."time" (project_id, date, hours, notes)
  VALUES (p_project_id, p_date, p_hours, p_notes)
  ON CONFLICT (project_id, date)
  DO UPDATE SET
    hours = public."time".hours + EXCLUDED.hours,
    notes = NULLIF(TRIM(CONCAT_WS(E'\n',
      NULLIF(TRIM(COALESCE(public."time".notes, '')), ''),
      NULLIF(TRIM(COALESCE(EXCLUDED.notes, '')), '')
    )), '')
  RETURNING *;
$function$
;


