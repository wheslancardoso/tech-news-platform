-- Habilita a extensão UUID se ainda não estiver habilitada
create extension if not exists "uuid-ossp";

-- Enums
create type post_status as enum ('pending', 'approved', 'rejected', 'published');

-- Tabela de Newsletters (Edições)
create table newsletters (
  id uuid primary key default uuid_generate_v4(),
  edition_number serial,
  title text not null,
  summary_intro text,
  content_json jsonb, -- Estrutura da IA
  debate_log jsonb default '[]'::jsonb, -- Debate entre as IAs especialistas
  html_content text, -- Email final renderizado
  status text default 'draft' check (status = any (array['draft'::text, 'published'::text])),
  image_url text, -- URL da imagem gerada
  image_prompt text, -- Prompt sugerido para a geração da imagem
  category text, -- Categoria geral da newsletter
  world text not null default 'TECH', -- Mundo/Universo (ex: TECH, MUSIC)
  created_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- Tabela de Assinantes
create table subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  phone text,
  preferences jsonb default '[]'::jsonb,
  status text default 'active' check (status = any (array['active'::text, 'unsubscribed'::text])),
  unsubscribe_token uuid default uuid_generate_v4() not null,
  active_worlds text[] not null default '{TECH}'::text[],
  created_at timestamp with time zone default now()
);

-- Tabela de Fontes RSS (Sources)
create table sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  rss_url text unique not null,
  category_hint text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Tabela de Posts (Curadoria de Notícias)
create table posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  url text unique not null,
  content text,
  summary text,
  source text,
  score integer default 0,
  status post_status default 'pending',
  category text not null default 'TECH_HACKER',
  sub_category text not null default 'GERAL',
  theme_config jsonb default '{}'::jsonb,
  whatsapp_summary text,
  world text not null default 'TECH',
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Tabela de Cliques de Usuário (Analytics para ML Reativo)
create table user_clicks (
  id uuid primary key default uuid_generate_v4(),
  subscriber_id uuid references subscribers(id) on delete cascade,
  newsletter_id uuid references newsletters(id) on delete cascade,
  category text not null,
  clicked_at timestamp with time zone default now()
);

-- Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clicks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Público pode ver posts aprovados" ON posts FOR SELECT USING (status = 'approved');
CREATE POLICY "Público pode se inscrever" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Público pode ver newsletters publicadas" ON newsletters FOR SELECT USING (status = 'published');
-- Obs: A tabela sources e user_clicks não têm políticas públicas (somente acessadas via service_role/admin)

-- Índices para performance
create index idx_newsletters_status on newsletters(status);
create index idx_newsletters_edition on newsletters(edition_number);
create index idx_subscribers_email on subscribers(email);
create index idx_subscribers_token on subscribers(unsubscribe_token);
create index idx_subscribers_phone on subscribers(phone);
create index idx_posts_status on posts(status);
create index idx_posts_score on posts(score);

-- Índices Compostos Avançados
create index idx_posts_category_sub on posts(category, sub_category);
create index idx_posts_world_score_status on posts(world, score desc) where (status = 'approved'::post_status);
create index idx_newsletters_world_edition on newsletters(world, edition_number desc) where (status = 'published');
create index idx_user_clicks_subscriber on user_clicks(subscriber_id);
