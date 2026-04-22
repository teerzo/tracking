drop function if exists "public"."add_time_entry"(p_project_id uuid, p_date date, p_hours numeric, p_notes text, p_time_zone text, p_client_offset_minutes integer);

alter table "public"."companies" add column "billing_contact" text;

alter table "public"."companies" add column "billing_email" text;

alter table "public"."companies" add column "distance" text;

alter table "public"."companies" add column "remote_only" boolean not null default false;

alter table "public"."invoices" drop column "invoice_name";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_time_entry(p_project_id uuid, p_date date, p_hours numeric, p_notes text DEFAULT NULL::text, p_time_zone text DEFAULT NULL::text, p_client_offset_minutes integer DEFAULT NULL::integer, p_travelled_to_office boolean DEFAULT false)
 RETURNS SETOF public."time"
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  INSERT INTO public."time" (
    project_id,
    date,
    hours,
    notes,
    time_zone,
    client_offset_minutes,
    travelled_to_office
  )
  VALUES (
    p_project_id,
    p_date,
    p_hours,
    p_notes,
    p_time_zone,
    p_client_offset_minutes,
    COALESCE(p_travelled_to_office, false)
  )
  ON CONFLICT (project_id, date)
  DO UPDATE SET
    hours = public."time".hours + EXCLUDED.hours,
    notes = NULLIF(TRIM(CONCAT_WS(E'\n',
      NULLIF(TRIM(COALESCE(public."time".notes, '')), ''),
      NULLIF(TRIM(COALESCE(EXCLUDED.notes, '')), '')
    )), ''),
    time_zone = COALESCE(EXCLUDED.time_zone, public."time".time_zone),
    client_offset_minutes = COALESCE(EXCLUDED.client_offset_minutes, public."time".client_offset_minutes),
    travelled_to_office = public."time".travelled_to_office OR EXCLUDED.travelled_to_office
  RETURNING *;
$function$
;


