-- Migration: Create user_clicks table for predictive recommendation (ML/IA)
-- Date: 2026-05-20

CREATE TABLE IF NOT EXISTS public.user_clicks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id uuid REFERENCES public.subscribers(id) ON DELETE CASCADE,
    newsletter_id uuid REFERENCES public.newsletters(id) ON DELETE CASCADE,
    category text NOT NULL,
    clicked_at timestamptz DEFAULT now()
);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.user_clicks ENABLE ROW LEVEL SECURITY;

-- Índice para busca rápida de performance por assinante e categoria
CREATE INDEX IF NOT EXISTS idx_clicks_subscriber_cat ON public.user_clicks(subscriber_id, category);

-- Políticas de RLS
-- O admin/service_role tem acesso total
CREATE POLICY "Admin full access" ON public.user_clicks 
    FOR ALL TO service_role USING (true);

-- O público (anon) pode inserir cliques (fluxo de redirect)
CREATE POLICY "Public insert clicks" ON public.user_clicks 
    FOR INSERT TO anon WITH CHECK (true);
