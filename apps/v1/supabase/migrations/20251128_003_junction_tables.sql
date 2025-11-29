-- Migration: 003_junction_tables
-- Description: Create junction tables for resort passes and tags
-- Created: 2025-11-28

-- ============================================================================
-- RESORT PASSES (Many-to-Many Junction)
-- ============================================================================
CREATE TABLE IF NOT EXISTS resort_passes (
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  pass_slug TEXT REFERENCES pass_programs(slug) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (resort_id, pass_slug)
);

CREATE INDEX IF NOT EXISTS idx_resort_passes_resort ON resort_passes(resort_id);
CREATE INDEX IF NOT EXISTS idx_resort_passes_pass ON resort_passes(pass_slug);

COMMENT ON TABLE resort_passes IS 'Junction table linking resorts to pass programs';

-- ============================================================================
-- RESORT TAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS resort_tags (
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (resort_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_resort_tags_resort ON resort_tags(resort_id);
CREATE INDEX IF NOT EXISTS idx_resort_tags_tag ON resort_tags(tag);

COMMENT ON TABLE resort_tags IS 'Tags associated with resorts for categorization and search';
COMMENT ON COLUMN resort_tags.tag IS 'Tag value (e.g., family-friendly, expert-terrain, village)';
