-- Seed data for projects table
-- This file is referenced by db.seed.sql_paths in supabase/config.toml

insert into public.companies (id, name, address, abn, phone, email)
values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Health Agent', '123 Main St, Anytown, USA', '1234567890', '1234567890', 'info@apellis.com');

insert into public.projects (id, project_name, start_date, end_date, hourly_rate, company_id)
values
  ('e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 'Apellis', '2025-01-15', '2025-03-31', 60.00, '00000000-0000-0000-0000-000000000001'::uuid),
  ('a0964ccc-02f5-46cd-9651-d35320fdc1ae'::uuid, 'Apellis - Dashboard', '2025-02-01', '2025-05-15', 60.00, '00000000-0000-0000-0000-000000000001'::uuid),
  ('835214b5-24d5-463a-89a2-6719320e7324'::uuid, 'Health Agent - iConnect', '2025-02-01', '2025-05-15', 60.00, '00000000-0000-0000-0000-000000000001'::uuid);

-- Seed user (via public.create_user): a@a.com / abc123
select public.create_user(
  'a@a.com',
  'abc123',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Kyle',
  'Mcarthur'
);

-- Seed time entries based on current tracked data
insert into public."time" (id, project_id, hours, date, date_created, notes, time_zone, client_offset_minutes)
values
  ('d92723ff-343b-494d-adfb-5e8bd5a663c9'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 7.00, '2026-02-16', '2026-02-24 20:58:38.356756+00', null, 'Australia/Sydney', 660),
  ('68ece884-7762-4264-ac3c-cd6ba198224f'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 7.00, '2026-02-17', '2026-02-24 21:01:21.820438+00', null, 'Australia/Sydney', 660),
  ('360cf897-5a52-4750-a95d-76ea925cbb92'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 7.00, '2026-02-18', '2026-02-24 21:01:26.669663+00', null, 'Australia/Sydney', 660),
  ('1cd410f1-09ad-4d42-8dcd-ccf5978f3e78'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 7.00, '2026-02-19', '2026-02-24 21:01:32.049779+00', null, 'Australia/Sydney', 660),
  ('5814eaa6-79da-4818-bc95-13eedb6d6848'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 5.00, '2026-02-20', '2026-02-24 21:01:37.685513+00', null, 'Australia/Sydney', 660),
  ('797ddf23-7db2-49e0-ac39-e50bfa90e80f'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 8.00, '2026-02-23', '2026-03-03 00:39:23.058919+00', null, 'Australia/Sydney', 660),
  ('4bee7a2a-ac44-486f-847a-ed9f0a7c0d66'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 4.00, '2026-02-24', '2026-03-03 00:39:33.983769+00', null, 'Australia/Sydney', 660),
  ('e751703d-d751-40d8-bd24-6ca0fee40187'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 8.00, '2026-02-25', '2026-03-03 00:39:40.512287+00', null, 'Australia/Sydney', 660),
  ('3c8843f4-0873-4326-bf65-abce961e38b3'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 8.00, '2026-02-26', '2026-03-03 00:39:46.707964+00', null, 'Australia/Sydney', 660),
  ('efc2a4d4-d1d2-49d9-8f28-815dc8acbb86'::uuid, '835214b5-24d5-463a-89a2-6719320e7324'::uuid, 2.00, '2026-02-27', '2026-03-15 22:07:38.808118+00', null, 'Australia/Sydney', 660),
  ('04a97eff-e76c-4caf-a4c0-a1be070bff1e'::uuid, 'e3bbaec5-b1b2-4833-8315-14345f67c0b7'::uuid, 2.00, '2026-02-27', '2026-03-03 00:40:03.523673+00', null, 'Australia/Sydney', 660),
  ('24c8ac69-78f7-4143-9a10-59818bbb9a75'::uuid, 'a0964ccc-02f5-46cd-9651-d35320fdc1ae'::uuid, 8.00, '2026-03-02', '2026-03-15 22:08:34.549084+00', null, 'Australia/Sydney', 660),
  ('ca6a863b-b646-4432-9f6c-bdf0dc488be8'::uuid, 'a0964ccc-02f5-46cd-9651-d35320fdc1ae'::uuid, 8.00, '2026-03-03', '2026-03-15 22:08:44.951714+00', null, 'Australia/Sydney', 660),
  ('1513e1ff-d501-4a6d-9292-e6a624b440e2'::uuid, '835214b5-24d5-463a-89a2-6719320e7324'::uuid, 3.00, '2026-03-04', '2026-03-15 22:08:56.511146+00', null, 'Australia/Sydney', 660),
  ('7423b040-15a9-41d5-9555-552788498cc7'::uuid, '835214b5-24d5-463a-89a2-6719320e7324'::uuid, 5.00, '2026-03-05', '2026-03-15 22:09:07.419506+00', null, 'Australia/Sydney', 660),
  ('fd3d5faa-962c-4f6b-8be1-cb4fb4272321'::uuid, '835214b5-24d5-463a-89a2-6719320e7324'::uuid, 8.00, '2026-03-06', '2026-03-15 22:09:13.692285+00', null, 'Australia/Sydney', 660),
  ('782ca6a8-0406-441d-b9de-e6a3c82dbbf3'::uuid, '835214b5-24d5-463a-89a2-6719320e7324'::uuid, 7.00, '2026-03-09', '2026-03-15 22:09:21.848395+00', null, 'Australia/Sydney', 660),
  ('aeb5aadd-ef6c-46e8-877f-5ea18f6bfd4d'::uuid, '835214b5-24d5-463a-89a2-6719320e7324'::uuid, 3.00, '2026-03-11', '2026-03-15 22:09:32.258944+00', null, 'Australia/Sydney', 660),
  ('7da656bb-f0c8-4c20-b31a-1286e1a5e2f9'::uuid, '835214b5-24d5-463a-89a2-6719320e7324'::uuid, 3.00, '2026-03-12', '2026-03-15 22:09:39.720539+00', null, 'Australia/Sydney', 660),
  ('161bc7b1-73c6-4707-a921-46401bec2dbb'::uuid, '835214b5-24d5-463a-89a2-6719320e7324'::uuid, 4.00, '2026-03-13', '2026-03-15 22:09:47.25399+00', null, 'Australia/Sydney', 660);

