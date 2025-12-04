-- Migration: Rename Squaw Valley to Palisades Tahoe
-- The resort was officially renamed in 2021

-- Update the resort name in the resorts table
UPDATE resorts
SET
  name = 'Palisades Tahoe',
  slug = 'palisades-tahoe',
  updated_at = NOW()
WHERE slug = 'squaw-valley' OR name ILIKE '%squaw valley%';

-- Note: If there's a separate "lost" entry for the old name, keep it as historical record
-- but update its notes to reference the new name
UPDATE resorts
SET
  notes = 'Historic name, now known as Palisades Tahoe (renamed 2021)',
  updated_at = NOW()
WHERE is_lost = true AND (slug = 'squaw-valley' OR name ILIKE '%squaw valley%');
