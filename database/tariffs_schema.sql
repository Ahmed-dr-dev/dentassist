-- Tariffs table: assistant can update, patients see via public/API list
create table if not exists tariffs (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  price integer not null default 0,
  updated_at timestamptz default now()
);

-- Seed default tariffs (run once)
insert into tariffs (key, price) values
  ('basic_rdv', 70),
  ('cleaning', 50),
  ('scaling', 60),
  ('filling', 80),
  ('extraction', 100),
  ('whitening', 250),
  ('root_canal', 200),
  ('crown', 350)
on conflict (key) do nothing;

-- Authorization for tariffs is enforced in the API (cookie-based auth).
