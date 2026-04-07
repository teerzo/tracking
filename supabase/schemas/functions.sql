-- Add time for (project_id, date): insert new row or add hours to existing (one row per project per day).
CREATE OR REPLACE FUNCTION public.add_time_entry(
  p_project_id uuid,
  p_date date,
  p_hours numeric,
  p_notes text DEFAULT NULL,
  p_time_zone text DEFAULT NULL,
  p_client_offset_minutes integer DEFAULT NULL
)
RETURNS SETOF public."time"
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public."time" (project_id, date, hours, notes, time_zone, client_offset_minutes)
  VALUES (p_project_id, p_date, p_hours, p_notes, p_time_zone, p_client_offset_minutes)
  ON CONFLICT (project_id, date)
  DO UPDATE SET
    hours = public."time".hours + EXCLUDED.hours,
    notes = NULLIF(TRIM(CONCAT_WS(E'\n',
      NULLIF(TRIM(COALESCE(public."time".notes, '')), ''),
      NULLIF(TRIM(COALESCE(EXCLUDED.notes, '')), '')
    )), ''),
    time_zone = COALESCE(EXCLUDED.time_zone, public."time".time_zone),
    client_offset_minutes = COALESCE(EXCLUDED.client_offset_minutes, public."time".client_offset_minutes)
  RETURNING *;
$$;

GRANT EXECUTE ON FUNCTION public.add_time_entry(uuid, date, numeric, text, text, integer) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.create_user(email text, password text, clinic_id uuid, given_name text, family_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 security definer
AS $function$
  declare
  user_id uuid;
  encrypted_pw text;
BEGIN
  user_id := gen_random_uuid();
  encrypted_pw := crypt(password, gen_salt('bf', 12));
  
  -- RAISE NOTICE 'Value create: %', clinic_id;

  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, now() at time zone 'utc', now() at time zone 'utc', now() at time zone 'utc', '{"provider":"email","providers":["email"]}', '{}', now() at time zone 'utc', now() at time zone 'utc', '', '', '', '');
  
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', now() at time zone 'utc', now() at time zone 'utc', now() at time zone 'utc');

  insert into public.users (id, email, given_name, family_name) values (user_id, email, given_name, family_name);

  insert into public.user_settings (user_id) values (user_id);

  RETURN user_id;
END;
$function$
;