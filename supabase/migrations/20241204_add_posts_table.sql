-- Migration: Adicionar tabela de posts para curadoria de notícias
-- Data: 2024-12-04
-- Descrição: Implementa pipeline de curadoria separando ingestão de geração

-- Status do post individual
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
  created_at timestamp with time zone default now()
);

create index idx_posts_status on posts(status);
create index idx_posts_score on posts(score);
