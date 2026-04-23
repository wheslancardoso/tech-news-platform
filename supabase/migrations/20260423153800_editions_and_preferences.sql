-- Migration: Add categories and subscriber preferences
-- Date: 2026-04-23

-- Add category column to newsletters
ALTER TABLE newsletters 
ADD COLUMN IF NOT EXISTS category text;

-- Add preferences column to subscribers
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '[]'::jsonb;
