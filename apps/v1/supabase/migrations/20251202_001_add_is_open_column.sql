-- Add is_open column for seasonal open/closed status
-- This is separate from is_active (which indicates if the resort is operational vs permanently closed/lost)

ALTER TABLE resorts ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN resorts.is_open IS 'Whether the resort is currently open for the season. Different from is_active which indicates permanent operational status.';

-- Update all North American resorts to closed (default state)
UPDATE resorts SET is_open = false WHERE country_code IN ('us', 'ca');
