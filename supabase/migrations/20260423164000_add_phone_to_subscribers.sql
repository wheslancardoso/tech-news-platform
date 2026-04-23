-- Adicionar coluna de telefone para WhatsApp
ALTER TABLE "public"."subscribers" ADD COLUMN IF NOT EXISTS "phone" text;

-- Criar índice para busca rápida por telefone se necessário
CREATE INDEX IF NOT EXISTS "subscribers_phone_idx" ON "public"."subscribers" ("phone");
