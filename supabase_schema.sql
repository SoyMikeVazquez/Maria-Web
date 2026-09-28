-- Supabase SQL Schema for María Bonita Appointments
-- Paste this script into the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  ref_code text not null unique,
  date_str text not null,                          -- Human readable date, e.g. "Friday, June 19, 2026"
  time_str text not null,                          -- Human readable time, e.g. "11:30 AM"
  datetime_timestamp timestamp with time zone not null, -- Clean ISO timestamp for querying and sorting
  staff_name text not null,
  services jsonb not null,                         -- Array of selected services
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  total_duration integer not null,                 -- Total minutes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  morning_reminder_sent boolean default false not null,
  hour_reminder_sent boolean default false not null
);

-- Index for searching upcoming appointments efficiently
create index if not exists bookings_datetime_timestamp_idx on bookings (datetime_timestamp);
create index if not exists bookings_reminder_sent_idx on bookings (morning_reminder_sent, hour_reminder_sent);

-- Disable Row Level Security (RLS) for testing or enable it with public write permissions
alter table bookings enable row level security;

create policy "Enable insert for everyone" on bookings
  for insert with check (true);

create policy "Enable select for everyone" on bookings
  for select using (true);

create policy "Enable update for everyone" on bookings
  for update using (true);

create policy "Enable delete for everyone" on bookings
  for delete using (true);

-- Table for tracking staff reviews
create table if not exists staff_reviews (
  id uuid default gen_random_uuid() primary key,
  staff_name text not null,
  author_name text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable Row Level Security (RLS) for testing or enable it with public write permissions
alter table staff_reviews enable row level security;

create policy "Enable insert for everyone" on staff_reviews
  for insert with check (true);

create policy "Enable select for everyone" on staff_reviews
  for select using (true);

create policy "Enable update for everyone" on staff_reviews
  for update using (true);

create policy "Enable delete for everyone" on staff_reviews
  for delete using (true);

-- Table for tracking staff schedules
create table if not exists staff_schedules (
  id uuid default gen_random_uuid() primary key,
  staff_id text not null,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  time_slots text[] not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (staff_id, day_of_week)
);

alter table staff_schedules enable row level security;

create policy "Enable insert for everyone" on staff_schedules
  for insert with check (true);

create policy "Enable select for everyone" on staff_schedules
  for select using (true);

create policy "Enable update for everyone" on staff_schedules
  for update using (true);

create policy "Enable delete for everyone" on staff_schedules
  for delete using (true);

-- Table for tracking dynamic salon staff
create table if not exists salon_staff (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  mail text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial staff if they don't exist
insert into salon_staff (name, mail) 
values 
  ('Brenda', ''),
  ('Edith', ''),
  ('María', '')
on conflict (name) do nothing;

alter table salon_staff enable row level security;

create policy "Enable insert for everyone" on salon_staff
  for insert with check (true);

create policy "Enable select for everyone" on salon_staff
  for select using (true);

create policy "Enable update for everyone" on salon_staff
  for update using (true);

create policy "Enable delete for everyone" on salon_staff
  for delete using (true);
