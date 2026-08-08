-- Run once if profiles table already exists without seller profile fields.

alter table public.profiles add column if not exists shop_description text;
alter table public.profiles add column if not exists shop_cover_url text;
alter table public.profiles add column if not exists shop_photo_urls jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists certification_url text;
alter table public.profiles add column if not exists registration_doc_url text;
alter table public.profiles add column if not exists aadhaar_doc_url text;
alter table public.profiles add column if not exists aadhaar_status text not null default 'not_submitted';

-- Add check constraint if missing (ignore error if already exists)
do $$ begin
  alter table public.profiles add constraint profiles_aadhaar_status_check
    check (aadhaar_status in ('not_submitted', 'pending', 'verified', 'rejected'));
exception when duplicate_object then null;
end $$;
