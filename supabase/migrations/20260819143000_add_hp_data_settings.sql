create table if not exists public.hp_data_settings (
  id integer primary key default 1 check (id = 1),
  period_label text not null default 'Q1-Q2 2026',
  description text not null default 'city-level residential apartment data. Values are market averages for comparison only.',
  file_name text not null default 'hp_data.xlsx',
  file_url text,
  file_updated_at timestamptz,
  updated_at timestamptz default now()
);

insert into public.hp_data_settings (
  id,
  period_label,
  description,
  file_name,
  file_url,
  file_updated_at
)
values (
  1,
  'Q1-Q2 2026',
  'city-level residential apartment data. Values are market averages for comparison only.',
  'hp_data.xlsx',
  'https://diuorqykbykouqnlxcxe.supabase.co/storage/v1/object/public/house_price/hp_data.xlsx',
  null
)
on conflict (id) do nothing;
