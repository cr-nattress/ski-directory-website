-- Migration: 002_colorado_locations
-- Description: Add location data to Colorado resorts
-- Created: 2025-11-29
-- Issue: Colorado resorts were migrated without location coordinates

-- Update Colorado resort locations
-- Using ST_SetSRID and ST_MakePoint for proper PostGIS geography

UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.3550, 39.6061), 4326)::geography WHERE slug = 'vail' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.0384, 39.4817), 4326)::geography WHERE slug = 'breckenridge' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.9461, 39.2091), 4326)::geography WHERE slug = 'snowmass' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.8181, 39.1869), 4326)::geography WHERE slug = 'aspen-highlands' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.8578, 39.1811), 4326)::geography WHERE slug = 'aspen-mountain' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.8628, 39.2069), 4326)::geography WHERE slug = 'buttermilk' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.8317, 40.4850), 4326)::geography WHERE slug = 'steamboat' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.8719, 39.6425), 4326)::geography WHERE slug = 'keystone' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.8978, 39.6804), 4326)::geography WHERE slug = 'arapahoe-basin' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.1503, 39.5019), 4326)::geography WHERE slug = 'copper-mountain' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.7625, 39.8868), 4326)::geography WHERE slug = 'winter-park' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.8978, 39.6800), 4326)::geography WHERE slug = 'loveland' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.5828, 39.9372), 4326)::geography WHERE slug = 'eldora' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-107.8123, 37.9375), 4326)::geography WHERE slug = 'telluride' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.9653, 38.8986), 4326)::geography WHERE slug = 'crested-butte' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.3322, 38.5122), 4326)::geography WHERE slug = 'monarch' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-107.8139, 37.6303), 4326)::geography WHERE slug = 'purgatory' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.7936, 37.4736), 4326)::geography WHERE slug = 'wolf-creek' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-107.6644, 37.8853), 4326)::geography WHERE slug = 'silverton' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.3047, 39.3614), 4326)::geography WHERE slug = 'ski-cooper' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-108.1508, 39.0694), 4326)::geography WHERE slug = 'powderhorn' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-107.3392, 39.3992), 4326)::geography WHERE slug = 'sunlight' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.8342, 40.4847), 4326)::geography WHERE slug = 'howelsen-hill' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.5281, 39.6847), 4326)::geography WHERE slug = 'echo-mountain' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-107.6642, 37.8119), 4326)::geography WHERE slug = 'kendall-mountain' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-108.0550, 37.3017), 4326)::geography WHERE slug = 'hesperus' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.9117, 40.0408), 4326)::geography WHERE slug = 'granby-ranch' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.5164, 39.6042), 4326)::geography WHERE slug = 'beaver-creek' AND state_slug = 'colorado';

-- Lost/closed resorts
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.7778, 39.7986), 4326)::geography WHERE slug = 'berthoud-pass' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.7500, 39.5833), 4326)::geography WHERE slug = 'geneva-basin' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.6514, 40.3939), 4326)::geography WHERE slug = 'hidden-valley' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.1833, 38.9500), 4326)::geography WHERE slug = 'conquistador' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.1000, 37.3500), 4326)::geography WHERE slug = 'cuchara' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-104.8500, 38.7833), 4326)::geography WHERE slug = 'ski-broadmoor' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.5250, 39.6250), 4326)::geography WHERE slug = 'arrowhead' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-105.0422, 38.8403), 4326)::geography WHERE slug = 'pike-peak' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-107.8750, 37.2750), 4326)::geography WHERE slug = 'chapman-hill-ski-area' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-107.5833, 37.9667), 4326)::geography WHERE slug = 'sharktooth' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-108.4500, 37.6167), 4326)::geography WHERE slug = 'stoner' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.3500, 38.5333), 4326)::geography WHERE slug = 'williams-pass' AND state_slug = 'colorado';
UPDATE resorts SET location = ST_SetSRID(ST_MakePoint(-106.1833, 39.3833), 4326)::geography WHERE slug = 'climax' AND state_slug = 'colorado';

-- Verify the updates
SELECT slug, name,
       ST_Y(location::geometry) as lat,
       ST_X(location::geometry) as lng
FROM resorts
WHERE state_slug = 'colorado' AND location IS NOT NULL
ORDER BY name;
