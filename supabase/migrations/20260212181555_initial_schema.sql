
  create table "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "address" text,
    "abn" text,
    "phone" text,
    "email" text
      );


alter table "public"."companies" enable row level security;


  create table "public"."invoices" (
    "id" uuid not null default gen_random_uuid(),
    "invoice_number" text,
    "period_start" date not null,
    "period_end" date not null,
    "total_hours" numeric(10,2) not null default 0,
    "total_amount" numeric(12,2) not null default 0,
    "status" text not null default 'draft'::text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."invoices" enable row level security;


  create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "project_name" text not null,
    "start_date" date,
    "end_date" date,
    "hourly_rate" numeric(10,2) not null default 0,
    "company_id" uuid not null
      );


alter table "public"."projects" enable row level security;


  create table "public"."time" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "hours" numeric(5,2) not null,
    "date" date not null,
    "date_created" timestamp with time zone not null default now()
      );


alter table "public"."time" enable row level security;


  create table "public"."users" (
    "id" uuid not null,
    "email" text not null,
    "given_name" text,
    "family_name" text
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE INDEX idx_companies_name ON public.companies USING btree (name);

CREATE INDEX idx_invoices_created_at ON public.invoices USING btree (created_at DESC);

CREATE INDEX idx_invoices_period_start ON public.invoices USING btree (period_start);

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);

CREATE INDEX idx_projects_company_id ON public.projects USING btree (company_id);

CREATE INDEX idx_projects_start_date ON public.projects USING btree (start_date);

CREATE INDEX idx_time_date ON public."time" USING btree (date);

CREATE INDEX idx_time_project_id ON public."time" USING btree (project_id);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX time_pkey ON public."time" USING btree (id);

CREATE UNIQUE INDEX time_project_id_date_key ON public."time" USING btree (project_id, date);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."time" add constraint "time_pkey" PRIMARY KEY using index "time_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."invoices" add constraint "invoices_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text]))) not valid;

alter table "public"."invoices" validate constraint "invoices_status_check";

alter table "public"."projects" add constraint "projects_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT not valid;

alter table "public"."projects" validate constraint "projects_company_id_fkey";

alter table "public"."time" add constraint "time_hours_check" CHECK ((hours >= (0)::numeric)) not valid;

alter table "public"."time" validate constraint "time_hours_check";

alter table "public"."time" add constraint "time_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE RESTRICT not valid;

alter table "public"."time" validate constraint "time_project_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_user(email text, password text, clinic_id uuid, given_name text, family_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
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

  RETURN user_id;
END;
$function$
;

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."time" to "anon";

grant insert on table "public"."time" to "anon";

grant references on table "public"."time" to "anon";

grant select on table "public"."time" to "anon";

grant trigger on table "public"."time" to "anon";

grant truncate on table "public"."time" to "anon";

grant update on table "public"."time" to "anon";

grant delete on table "public"."time" to "authenticated";

grant insert on table "public"."time" to "authenticated";

grant references on table "public"."time" to "authenticated";

grant select on table "public"."time" to "authenticated";

grant trigger on table "public"."time" to "authenticated";

grant truncate on table "public"."time" to "authenticated";

grant update on table "public"."time" to "authenticated";

grant delete on table "public"."time" to "service_role";

grant insert on table "public"."time" to "service_role";

grant references on table "public"."time" to "service_role";

grant select on table "public"."time" to "service_role";

grant trigger on table "public"."time" to "service_role";

grant truncate on table "public"."time" to "service_role";

grant update on table "public"."time" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Authenticated users can manage companies"
  on "public"."companies"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Authenticated users can manage invoices"
  on "public"."invoices"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Authenticated users can manage projects"
  on "public"."projects"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Authenticated users can manage time entries"
  on "public"."time"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Users can manage their own profile"
  on "public"."users"
  as permissive
  for all
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



