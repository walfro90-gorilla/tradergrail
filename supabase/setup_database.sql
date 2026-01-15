-- 1. SETUP EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pg_net";
create extension if not exists "vector";

-- 2. USERS TABLE (Linked to Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  billing_status text default 'free', -- 'free', 'pro', 'enterprise'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;

create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- 3. TRADES TABLE (Record of all executions)
create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  quantity numeric not null,
  price numeric not null,
  status text default 'filled', -- 'pending', 'filled', 'cancelled'
  strategy_id text,
  ai_confidence numeric,
  metadata jsonb,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trades enable row level security;
create policy "Users can view own trades" on public.trades for select using (auth.uid() = user_id);

-- 4. MARKET SNAPSHOTS (For AI & History)
create table public.market_snapshots (
    id bigint generated always as identity primary key,
    symbol text not null,
    price numeric not null,
    volume numeric,
    sentiment_score numeric,
    raw_data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.market_snapshots enable row level security;
create policy "Auth users can view market data" on public.market_snapshots for select using (auth.role() = 'authenticated');

-- 5. NOTIFICATIONS (Realtime)
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users not null,
    title text not null,
    message text not null,
    type text default 'info',
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);

-- 6. FUNCTIONS & TRIGGERS

-- Trigger: Handle New User Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC: Get User Statistics
create or replace function get_user_stats(target_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'total_trades', count(*),
    'buy_count', count(*) filter (where side = 'buy'),
    'sell_count', count(*) filter (where side = 'sell'),
    'latest_trade_price', (select price from trades where user_id = target_user_id order by timestamp desc limit 1)
  ) into result
  from trades
  where user_id = target_user_id;
  
  return result;
end;
$$;

-- 7. ENABLE REALTIME
-- Note: Run these in the SQL Editor to enable Realtime replication
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.trades;
alter publication supabase_realtime add table public.market_snapshots;
