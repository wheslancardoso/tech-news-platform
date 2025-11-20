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
  created_at timestamp with time zone default now()
);

-- Índices para performance
create index idx_newsletters_status on newsletters(status);
create index idx_subscribers_email on subscribers(email);

