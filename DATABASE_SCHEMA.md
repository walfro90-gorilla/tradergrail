-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_analysis (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  price_at_analysis numeric NOT NULL,
  sentiment text NOT NULL CHECK (sentiment = ANY (ARRAY['bullish'::text, 'bearish'::text, 'neutral'::text])),
  confidence numeric CHECK (confidence >= 0::numeric AND confidence <= 100::numeric),
  summary text NOT NULL,
  reasoning ARRAY,
  sources ARRAY,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ai_analysis_pkey PRIMARY KEY (id),
  CONSTRAINT ai_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.market_snapshots (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  symbol text NOT NULL,
  price numeric NOT NULL,
  volume numeric,
  sentiment_score numeric,
  raw_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT market_snapshots_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info'::text,
  read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.trades (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side = ANY (ARRAY['buy'::text, 'sell'::text])),
  quantity numeric NOT NULL,
  price numeric NOT NULL,
  status text DEFAULT 'filled'::text,
  strategy_id text,
  ai_confidence numeric,
  metadata jsonb,
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT trades_pkey PRIMARY KEY (id),
  CONSTRAINT trades_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  billing_status text DEFAULT 'free'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);