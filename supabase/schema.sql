-- Habilita a extensão UUID se ainda não estiver habilitada
create extension if not exists "uuid-ossp";

-- Tabela de Newsletters (Edições)
create type newsletter_status as enum ('draft', 'published');

create table newsletters (
  id uuid primary key default uuid_generate_v4(),
  edition_number serial,
  title text not null,
  summary_intro text,
  content_json jsonb, -- Estrutura da IA
  debate_log jsonb default '[]'::jsonb, -- Debate entre as IAs especialistas
  html_content text, -- Email final renderizado
  status newsletter_status default 'draft',
  created_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- Tabela de Assinantes
create type subscriber_status as enum ('active', 'unsubscribed');

create table subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  status subscriber_status default 'active',
  unsubscribe_token uuid default uuid_generate_v4() not null,
  created_at timestamp with time zone default now()
);

-- Índices para performance
create index idx_newsletters_status on newsletters(status);
create index idx_newsletters_edition on newsletters(edition_number);
create index idx_subscribers_email on subscribers(email);
create index idx_subscribers_token on subscribers(unsubscribe_token);

-- Tabela de Posts (Curadoria de Notícias)
create type post_status as enum ('pending', 'approved', 'rejected', 'published');

create table posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  url text unique not null,
  content text,
  summary text,
  source text,
  score integer default 0,
  status post_status default 'pending',
  theme_config jsonb,
  whatsapp_summary text,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Público pode ver posts aprovados" ON posts FOR SELECT USING (status = 'approved');
CREATE POLICY "Público pode se inscrever" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Público pode ver newsletters publicadas" ON newsletters FOR SELECT USING (status = 'published');

create index idx_posts_status on posts(status);
create index idx_posts_score on posts(score);
