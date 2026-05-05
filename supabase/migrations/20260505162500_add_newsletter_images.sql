-- Adiciona suporte a imagens e prompts na tabela de newsletters
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS image_prompt TEXT;

-- Comentários para documentação
COMMENT ON COLUMN newsletters.image_url IS 'URL da imagem gerada e hospedada no Supabase Storage ou externa.';
COMMENT ON COLUMN newsletters.image_prompt IS 'Prompt sugerido pela IA para a geração da imagem desta edição.';
