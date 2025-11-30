-- ============================================================================
-- Migration: Resort Impressions Table
-- Epic 24, Story 12: Engagement Tracking Foundation
-- ============================================================================
--
-- Creates infrastructure for tracking user engagement with resorts.
-- Privacy-conscious: no user ID, aggregate data only.
-- Foundation for future multi-armed bandit ranking optimization.
--
-- Event types:
--   - impression: Resort card appeared in viewport
--   - click: User clicked on resort card
--   - dwell: User spent time on resort detail page (future)
-- ============================================================================

-- Create the resort_impressions table
CREATE TABLE IF NOT EXISTS resort_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Resort reference (soft reference, not FK to allow flexibility)
    resort_id UUID NOT NULL,
    resort_slug TEXT NOT NULL,

    -- Event metadata
    event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'dwell')),

    -- Context (where the event occurred)
    context TEXT DEFAULT 'landing' CHECK (context IN ('landing', 'directory', 'search', 'themed_section', 'map')),
    section_id TEXT, -- e.g., 'topDestinations', 'hiddenGems' for themed sections

    -- Position tracking (for analyzing position bias)
    position_index INTEGER, -- 0-based position in list
    page_number INTEGER DEFAULT 1,

    -- Session info (anonymous)
    session_id TEXT, -- Anonymous session identifier (no PII)

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Dwell time (only for 'dwell' events)
    dwell_seconds INTEGER
);

-- Create indexes for efficient querying
CREATE INDEX idx_impressions_resort_id ON resort_impressions(resort_id);
CREATE INDEX idx_impressions_resort_slug ON resort_impressions(resort_slug);
CREATE INDEX idx_impressions_event_type ON resort_impressions(event_type);
CREATE INDEX idx_impressions_created_at ON resort_impressions(created_at);
CREATE INDEX idx_impressions_context ON resort_impressions(context);

-- Composite index for common query patterns
CREATE INDEX idx_impressions_resort_event ON resort_impressions(resort_id, event_type);
CREATE INDEX idx_impressions_resort_date ON resort_impressions(resort_id, created_at DESC);

-- ============================================================================
-- Aggregation Views
-- ============================================================================

-- Daily aggregates per resort (for dashboard and analysis)
CREATE OR REPLACE VIEW resort_engagement_daily AS
SELECT
    resort_id,
    resort_slug,
    DATE(created_at) as event_date,
    COUNT(*) FILTER (WHERE event_type = 'impression') as impressions,
    COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE event_type = 'dwell') as dwells,
    AVG(dwell_seconds) FILTER (WHERE event_type = 'dwell') as avg_dwell_seconds,
    -- Click-through rate (CTR)
    CASE
        WHEN COUNT(*) FILTER (WHERE event_type = 'impression') > 0
        THEN ROUND(
            COUNT(*) FILTER (WHERE event_type = 'click')::NUMERIC /
            COUNT(*) FILTER (WHERE event_type = 'impression')::NUMERIC * 100,
            2
        )
        ELSE 0
    END as ctr_percent
FROM resort_impressions
GROUP BY resort_id, resort_slug, DATE(created_at);

-- Overall engagement summary per resort (last 30 days)
CREATE OR REPLACE VIEW resort_engagement_summary AS
SELECT
    resort_id,
    resort_slug,
    COUNT(*) FILTER (WHERE event_type = 'impression') as total_impressions,
    COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
    COUNT(*) FILTER (WHERE event_type = 'dwell') as total_dwells,
    AVG(dwell_seconds) FILTER (WHERE event_type = 'dwell') as avg_dwell_seconds,
    -- Click-through rate (CTR)
    CASE
        WHEN COUNT(*) FILTER (WHERE event_type = 'impression') > 0
        THEN ROUND(
            COUNT(*) FILTER (WHERE event_type = 'click')::NUMERIC /
            COUNT(*) FILTER (WHERE event_type = 'impression')::NUMERIC * 100,
            2
        )
        ELSE 0
    END as ctr_percent,
    -- Position analysis
    AVG(position_index) FILTER (WHERE event_type = 'click') as avg_click_position,
    MIN(created_at) as first_event,
    MAX(created_at) as last_event
FROM resort_impressions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY resort_id, resort_slug;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE resort_impressions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous inserts" ON resort_impressions
    FOR INSERT
    WITH CHECK (true);

-- Allow reads only for authenticated users (admin/analytics)
-- For now, allow public read for development; restrict in production
CREATE POLICY "Allow public reads" ON resort_impressions
    FOR SELECT
    USING (true);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE resort_impressions IS 'Tracks user engagement with resorts for ranking optimization. Privacy-conscious: no PII stored.';
COMMENT ON COLUMN resort_impressions.event_type IS 'Type of engagement: impression (viewed), click (clicked), dwell (time on page)';
COMMENT ON COLUMN resort_impressions.context IS 'Where the event occurred: landing page, directory, search results, etc.';
COMMENT ON COLUMN resort_impressions.section_id IS 'For themed sections, which section the resort appeared in';
COMMENT ON COLUMN resort_impressions.position_index IS '0-based position in the list, for analyzing position bias';
COMMENT ON COLUMN resort_impressions.session_id IS 'Anonymous session identifier for session-level analysis';
