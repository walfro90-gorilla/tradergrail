
-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_net";
create extension if not exists "vector"; -- For future AI embeddings

-- Users Table (Sync with Auth)
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

create policy "Users can view own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Handle User Creation Trigger
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Trades Table (Record of all executions)
create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  quantity numeric not null,
  price numeric not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'filled', -- 'pending', 'filled', 'cancelled'
  strategy_id text, -- ID of the strategy that triggered this
  ai_confidence numeric, -- Score 0-1 from the AI
  metadata jsonb -- Extra details
);

alter table public.trades enable row level security;

create policy "Users can view own trades"
  on public.trades for select
  using ( auth.uid() = user_id );

create policy "Service Role can insert trades"
  on public.trades for insert
  with check ( true ); -- Typically strictly controlled by service role/backend


-- Market Data Snapshots (For AI Training/Replay)
create table public.market_snapshots (
    id bigint generated always as identity primary key,
    symbol text not null,
    price numeric not null,
    volume numeric,
    sentiment_score numeric, -- From AI analysis
    raw_data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.market_snapshots enable row level security;
create policy "Read only for auth users"
    on public.market_snapshots for select
    using ( auth.role() = 'authenticated' );

-- Realtime Notifications
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users not null,
    title text not null,
    message text not null,
    type text default 'info', -- 'info', 'warning', 'trade_alert'
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
    on public.notifications for select
    using ( auth.uid() = user_id );

-- Enable Realtime for Notifications and Trades
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.trades;

-- AI Analysis Queue (RPC/Function Trigger)
create table public.ai_analysis_queue (
    id bigint generated always as identity primary key,
    payload jsonb not null,
    status text default 'pending', -- 'pending', 'processing', 'completed', 'failed'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
