-- Adiciona coluna de token para cancelamento, gerando UUIDs automaticamente para existentes
alter table subscribers 
add column unsubscribe_token uuid default uuid_generate_v4() not null;

-- Índice para busca rápida por token
create index idx_subscribers_token on subscribers(unsubscribe_token);

