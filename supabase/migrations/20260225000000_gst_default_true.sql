-- Enable GST by default for invoice generation
-- Users can still disable it in Manage > Settings

alter table public.user_settings
  alter column charge_gst set default true;

update public.user_settings
  set charge_gst = true
  where charge_gst = false;
