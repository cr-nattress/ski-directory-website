# Epic 12: National & International Ski Resort Data Population

## Overview
Populate complete data models for all ski resorts and areas across North America (excluding Colorado, which is covered in Epic 11). This includes 470+ currently operating resorts and 250+ former/lost ski areas across 37 US states and 11 Canadian provinces/territories.

## Business Value
- Expand the ski resort directory to comprehensive North American coverage
- Enable users to research and compare resorts across the entire continent
- Support SEO with complete coverage of all ski destinations
- Include historical "lost" ski areas for educational and nostalgic value
- Position the directory as the definitive ski resort resource

## Data Model Fields to Populate
Each resort entry requires:
- Basic info: id, slug, name, tagline, description
- Status flags: isActive, isLost
- Location: lat/lng coordinates, nearestCity, distanceFromDenver (or regional hub)
- Stats: skiableAcres, liftsCount, runsCount, verticalDrop, baseElevation, summitElevation, avgAnnualSnowfall
- Terrain: beginner/intermediate/advanced/expert percentages
- Conditions: snowfall24h, snowfall72h, baseDepth, terrainOpen, liftsOpen, status
- Pass affiliations: epic, ikon, indy, local
- Rating and reviewCount
- Images: heroImage, images array, trailMapUrl
- Website and social media links
- Features: hasPark, hasHalfpipe, hasNightSkiing, hasBackcountryAccess, hasSpaVillage
- Tags for filtering

**Note:** For lost/former ski areas, many fields will have historical or placeholder values, and conditions will show status: 'closed'.

---

## File Structure

Resort data is organized by country and state/province:

```
regions/
├── us/
│   ├── {state-name}/
│   │   ├── region-us-{state-name}.json    # Region data with all resorts
│   │   └── {resort-slug}.ts               # Individual resort TypeScript files
│   └── ...
├── ca/
│   ├── {province-name}/
│   │   ├── region-ca-{province-name}.json # Region data with all resorts
│   │   └── {resort-slug}.ts               # Individual resort TypeScript files
│   └── ...
```

---

## Completed States/Provinces

The following have been fully populated with detailed resort data:

### United States (14 states completed)
- [x] **Arizona** - `regions/us/arizona/` - 3 active, 2 defunct
- [x] **California** - `regions/us/california/` - 28 active, 24 defunct
- [x] **Idaho** - `regions/us/idaho/` - 16 active, 7 defunct
- [x] **Maine** - `regions/us/maine/` - 17 active, 11 defunct
- [x] **Michigan** - `regions/us/michigan/` - 24 active, 9 defunct
- [x] **Montana** - `regions/us/montana/` - 15 active, 9 defunct
- [x] **New Hampshire** - `regions/us/new-hampshire/` - 19 active, 13 defunct
- [x] **New Mexico** - `regions/us/new-mexico/` - 9 active, 6 defunct
- [x] **New York** - `regions/us/new-york/` - 33 active, 15 defunct
- [x] **Oregon** - `regions/us/oregon/` - 13 active, 6 defunct
- [x] **Utah** - `regions/us/utah/` - 15 active, 19 defunct
- [x] **Vermont** - `regions/us/vermont/` - 21 active, 21 defunct
- [x] **Washington** - `regions/us/washington/` - 18 active, 8 defunct
- [x] **Wyoming** - `regions/us/wyoming/` - 9 active, 5 defunct

### Canada (4 provinces completed)
- [x] **Alberta** - `regions/ca/alberta/` - 19 active, 4 defunct
- [x] **British Columbia** - `regions/ca/british-columbia/` - 35 active, 7 defunct
- [x] **Ontario** - `regions/ca/ontario/` - 42 active, 6 defunct
- [x] **Quebec** - `regions/ca/quebec/` - 57 active, 8 defunct

---

## Remaining Summary Statistics

### United States (Remaining)
- **23 States** with ski areas still need population
- **Estimated: ~170 Active Resorts remaining**
- **Estimated: ~95 Defunct/Lost Areas remaining**

### Canada (Remaining)
- **7 Provinces/Territories** with ski areas still need population
- **Estimated: ~30 Active Resorts remaining**
- **Estimated: ~10 Defunct/Lost Areas remaining**

---

# Remaining US States User Stories

## Western United States

### Story 12.1: Alaska Resort Data Population
**As a** skier planning a trip to Alaska
**I want** complete data for all Alaska ski resorts
**So that** I can explore this remote skiing destination

**File Location:** `regions/us/alaska/region-us-alaska.json`

**Scope:** 7 active resorts, 4 defunct areas (11 total)

**Active Resorts Include:**
- Alyeska Resort
- Eaglecrest Ski Area
- Arctic Valley Ski Area
- Hilltop Ski Area
- Moose Mountain
- Ski Land
- Mt. Eyak

**Acceptance Criteria:**
- [ ] All 7 active resorts fully populated
- [ ] All 4 defunct areas documented with historical data
- [ ] GPS coordinates verified for all locations
- [ ] Pass affiliations current (Ikon for Alyeska)

---

### Story 12.6: Nevada Resort Data Population
**As a** skier near Las Vegas or Reno
**I want** complete data for all Nevada ski resorts
**So that** I can find skiing options in the Silver State

**File Location:** `regions/us/nevada/region-us-nevada.json`

**Scope:** 2 active resorts, 3 defunct areas (5 total)

**Active Resorts Include:**
- Mt. Rose Ski Tahoe
- Lee Canyon

**Acceptance Criteria:**
- [ ] All 2 active resorts fully populated
- [ ] All 3 defunct areas documented
- [ ] Proximity to Las Vegas/Reno noted
- [ ] Ikon affiliation for Mt. Rose captured

---

## Midwest & Great Lakes

### Story 12.12: Illinois Resort Data Population
**As a** skier in Illinois
**I want** complete data for all Illinois ski areas
**So that** I can find local skiing options

**File Location:** `regions/us/illinois/region-us-illinois.json`

**Scope:** 4 active resorts, 3 defunct areas (7 total)

**Active Resorts Include:**
- Chestnut Mountain Resort
- Four Lakes
- Villa Olivia
- Raging Buffalo

**Acceptance Criteria:**
- [ ] All 4 active resorts fully populated
- [ ] All 3 defunct areas documented
- [ ] Proximity to Chicago noted

---

### Story 12.13: Indiana Resort Data Population
**As a** skier in Indiana
**I want** complete data for all Indiana ski areas
**So that** I can find Midwest skiing options

**File Location:** `regions/us/indiana/region-us-indiana.json`

**Scope:** 2 active resorts, 3 defunct areas (5 total)

**Active Resorts Include:**
- Perfect North Slopes
- Paoli Peaks

**Acceptance Criteria:**
- [ ] All 2 active resorts fully populated
- [ ] All 3 defunct areas documented

---

### Story 12.14: Iowa Resort Data Population
**As a** skier in Iowa
**I want** complete data for all Iowa ski areas
**So that** I can find Midwest skiing options

**File Location:** `regions/us/iowa/region-us-iowa.json`

**Scope:** 5 active resorts, 2 defunct areas (7 total)

**Active Resorts Include:**
- Sundown Mountain
- Mt. Crescent
- Seven Oaks Recreation
- Sleepy Hollow Sports Park
- Fun Valley

**Acceptance Criteria:**
- [ ] All 5 active resorts fully populated
- [ ] All 2 defunct areas documented

---

### Story 12.16: Minnesota Resort Data Population
**As a** skier in Minnesota
**I want** complete data for all Minnesota ski resorts
**So that** I can explore North Star state skiing

**File Location:** `regions/us/minnesota/region-us-minnesota.json`

**Scope:** 18 active resorts, 6 defunct areas (24 total)

**Active Resorts Include:**
- Lutsen Mountains
- Spirit Mountain
- Giants Ridge
- Afton Alps
- Welch Village
- Wild Mountain
- Buck Hill
- Hyland Ski & Snowboard Area
- Powder Ridge
- Andes Tower Hills
- Buena Vista
- Coffee Mill
- Detroit Mountain
- Mt. Kato
- Quadna Mountain
- Trollhaugen
- Mount Ski Gull
- Granite Peak (shared with WI)

**Acceptance Criteria:**
- [ ] All 18 active resorts fully populated
- [ ] All 6 defunct areas documented
- [ ] Lutsen's regional significance noted
- [ ] Epic affiliation for Afton Alps noted

---

### Story 12.17: Missouri Resort Data Population
**As a** skier in Missouri
**I want** complete data for all Missouri ski areas
**So that** I can find Midwest skiing options

**File Location:** `regions/us/missouri/region-us-missouri.json`

**Scope:** 2 active resorts, 1 defunct area (3 total)

**Active Resorts Include:**
- Hidden Valley
- Snow Creek

**Acceptance Criteria:**
- [ ] All 2 active resorts fully populated
- [ ] 1 defunct area documented
- [ ] Proximity to St. Louis/Kansas City noted

---

### Story 12.18: North Dakota Resort Data Population
**As a** skier in North Dakota
**I want** complete data for all North Dakota ski areas
**So that** I can find local skiing options

**File Location:** `regions/us/north-dakota/region-us-north-dakota.json`

**Scope:** 5 active resorts, 1 defunct area (6 total)

**Active Resorts Include:**
- Bottineau Winter Park
- Frost Fire
- Huff Hills
- Villa Vista
- Terry Peak (shared with SD)

**Acceptance Criteria:**
- [ ] All 5 active resorts fully populated
- [ ] 1 defunct area documented

---

### Story 12.19: Ohio Resort Data Population
**As a** skier in Ohio
**I want** complete data for all Ohio ski areas
**So that** I can find Midwest skiing options

**File Location:** `regions/us/ohio/region-us-ohio.json`

**Scope:** 5 active resorts, 5 defunct areas (10 total)

**Active Resorts Include:**
- Mad River Mountain
- Boston Mills/Brandywine
- Alpine Valley (OH)
- Snow Trails
- Clear Fork

**Acceptance Criteria:**
- [ ] All 5 active resorts fully populated
- [ ] All 5 defunct areas documented
- [ ] Vail/Epic affiliations noted (Boston Mills/Brandywine)

---

### Story 12.20: South Dakota Resort Data Population
**As a** skier in South Dakota
**I want** complete data for all South Dakota ski areas
**So that** I can explore Black Hills skiing

**File Location:** `regions/us/south-dakota/region-us-south-dakota.json`

**Scope:** 3 active resorts, 2 defunct areas (5 total)

**Active Resorts Include:**
- Terry Peak
- Deer Mountain
- Great Bear Ski Valley

**Acceptance Criteria:**
- [ ] All 3 active resorts fully populated
- [ ] All 2 defunct areas documented
- [ ] Black Hills location emphasized

---

### Story 12.21: Wisconsin Resort Data Population
**As a** skier in Wisconsin
**I want** complete data for all Wisconsin ski resorts
**So that** I can explore Badger state skiing

**File Location:** `regions/us/wisconsin/region-us-wisconsin.json`

**Scope:** 20 active resorts, 8 defunct areas (28 total)

**Active Resorts Include:**
- Granite Peak
- Devil's Head Resort
- Cascade Mountain
- Whitecap Mountains
- Mt. La Crosse
- Tyrol Basin
- Christmas Mountain Village
- Little Switzerland
- Sunburst
- Nordic Mountain
- Trollhaugen
- Mt. Ashwabay
- Camp 10
- The Rock
- Sylvan Hill
- Hardscrabble
- Keyes Peak
- Bruce Mound
- Christie Mountain
- Ausblick

**Acceptance Criteria:**
- [ ] All 20 active resorts fully populated
- [ ] All 8 defunct areas documented
- [ ] Granite Peak's regional significance noted

---

## Eastern United States

### Story 12.22: Connecticut Resort Data Population
**As a** skier in Connecticut
**I want** complete data for all Connecticut ski areas
**So that** I can find New England skiing options

**File Location:** `regions/us/connecticut/region-us-connecticut.json`

**Scope:** 4 active resorts, 6 defunct areas (10 total)

**Active Resorts Include:**
- Mohawk Mountain
- Mount Southington
- Powder Ridge
- Ski Sundown

**Acceptance Criteria:**
- [ ] All 4 active resorts fully populated
- [ ] All 6 defunct areas documented

---

### Story 12.24: Maryland Resort Data Population
**As a** skier in the Mid-Atlantic
**I want** complete data for all Maryland ski areas
**So that** I can find local skiing options

**File Location:** `regions/us/maryland/region-us-maryland.json`

**Scope:** 1 active resort, 1 defunct area (2 total)

**Active Resorts Include:**
- Wisp Resort

**Acceptance Criteria:**
- [ ] Wisp Resort fully populated
- [ ] 1 defunct area documented
- [ ] Deep Creek Lake area location noted

---

### Story 12.25: Massachusetts Resort Data Population
**As a** skier in Massachusetts
**I want** complete data for all Massachusetts ski resorts
**So that** I can explore Bay State skiing

**File Location:** `regions/us/massachusetts/region-us-massachusetts.json`

**Scope:** 10 active resorts, 13 defunct areas (23 total)

**Active Resorts Include:**
- Wachusett Mountain
- Jiminy Peak
- Berkshire East
- Bousquet Mountain
- Ski Butternut
- Blue Hills Ski Area
- Nashoba Valley
- Bradford Ski Area
- Ski Ward
- Prospect Mountain

**Acceptance Criteria:**
- [ ] All 10 active resorts fully populated
- [ ] All 13 defunct areas documented
- [ ] Berkshire region resorts grouped

---

### Story 12.27: New Jersey Resort Data Population
**As a** skier in New Jersey
**I want** complete data for all New Jersey ski areas
**So that** I can find local skiing options

**File Location:** `regions/us/new-jersey/region-us-new-jersey.json`

**Scope:** 2 active resorts, 5 defunct areas (7 total)

**Active Resorts Include:**
- Mountain Creek
- Campgaw Mountain

**Acceptance Criteria:**
- [ ] All 2 active resorts fully populated
- [ ] All 5 defunct areas documented
- [ ] NYC proximity noted for Mountain Creek

---

### Story 12.29: North Carolina Resort Data Population
**As a** skier in the Southeast
**I want** complete data for all North Carolina ski resorts
**So that** I can explore Southern Appalachian skiing

**File Location:** `regions/us/north-carolina/region-us-north-carolina.json`

**Scope:** 6 active resorts, 4 defunct areas (10 total)

**Active Resorts Include:**
- Sugar Mountain
- Beech Mountain Resort
- Appalachian Ski Mountain
- Cataloochee Ski Area
- Sapphire Valley
- Wolf Ridge Ski Resort

**Acceptance Criteria:**
- [ ] All 6 active resorts fully populated
- [ ] All 4 defunct areas documented
- [ ] Banner Elk region grouped

---

### Story 12.30: Pennsylvania Resort Data Population
**As a** skier in Pennsylvania
**I want** complete data for all Pennsylvania ski resorts
**So that** I can explore Keystone State skiing

**File Location:** `regions/us/pennsylvania/region-us-pennsylvania.json`

**Scope:** 19 active resorts, 13 defunct areas (32 total)

**Active Resorts Include:**
- Blue Mountain Resort
- Camelback Mountain Resort
- Seven Springs Mountain Resort
- Jack Frost/Big Boulder
- Elk Mountain
- Montage Mountain
- Bear Creek Mountain Resort
- Shawnee Mountain
- Blue Knob
- Hidden Valley (PA)
- Laurel Mountain
- Ski Roundtop
- Liberty Mountain Resort
- Whitetail Resort
- Tussey Mountain
- Spring Mountain
- Ski Sawmill
- Eagle Rock Resort
- Alpine Mountain

**Acceptance Criteria:**
- [ ] All 19 active resorts fully populated
- [ ] All 13 defunct areas documented
- [ ] Epic affiliations (Jack Frost, Big Boulder, Liberty, Roundtop, Whitetail)
- [ ] Poconos region grouped

---

### Story 12.31: Rhode Island Resort Data Population
**As a** skier in Rhode Island
**I want** complete data for all Rhode Island ski areas
**So that** I can find local skiing options

**File Location:** `regions/us/rhode-island/region-us-rhode-island.json`

**Scope:** 1 active resort, 2 defunct areas (3 total)

**Active Resorts Include:**
- Yawgoo Valley

**Acceptance Criteria:**
- [ ] Yawgoo Valley fully populated
- [ ] All 2 defunct areas documented

---

### Story 12.33: Virginia Resort Data Population
**As a** skier in Virginia
**I want** complete data for all Virginia ski resorts
**So that** I can explore mid-Atlantic skiing

**File Location:** `regions/us/virginia/region-us-virginia.json`

**Scope:** 4 active resorts, 2 defunct areas (6 total)

**Active Resorts Include:**
- Wintergreen Resort
- Massanutten Resort
- The Homestead (Omni)
- Bryce Resort

**Acceptance Criteria:**
- [ ] All 4 active resorts fully populated
- [ ] All 2 defunct areas documented
- [ ] Shenandoah Valley region noted

---

### Story 12.34: West Virginia Resort Data Population
**As a** skier in the Mid-Atlantic
**I want** complete data for all West Virginia ski resorts
**So that** I can explore Mountain State skiing

**File Location:** `regions/us/west-virginia/region-us-west-virginia.json`

**Scope:** 5 active resorts, 4 defunct areas (9 total)

**Active Resorts Include:**
- Snowshoe Mountain
- Canaan Valley Resort
- Winterplace Ski Resort
- Timberline Mountain
- Oglebay Resort

**Acceptance Criteria:**
- [ ] All 5 active resorts fully populated
- [ ] All 4 defunct areas documented
- [ ] Ikon affiliation for Snowshoe noted
- [ ] Highest ski area in Mid-Atlantic (Snowshoe) emphasized

---

## Southern United States

### Story 12.35: Alabama Resort Data Population
**As a** skier in the Deep South
**I want** complete data for Alabama ski areas
**So that** I can discover Southeastern skiing options

**File Location:** `regions/us/alabama/region-us-alabama.json`

**Scope:** 1 active resort, 0 defunct areas (1 total)

**Active Resorts Include:**
- Cloudmont Ski Resort

**Acceptance Criteria:**
- [ ] Cloudmont fully populated
- [ ] Southernmost ski area east of Rockies noted

---

### Story 12.36: Georgia Resort Data Population
**As a** ski historian
**I want** documentation of Georgia's former ski area
**So that** I can understand Southern ski history

**File Location:** `regions/us/georgia/region-us-georgia.json`

**Scope:** 0 active resorts, 1 defunct area (1 total)

**Defunct Areas:**
- Sky Valley (closed)

**Acceptance Criteria:**
- [ ] Sky Valley documented with historical data
- [ ] isLost: true
- [ ] Closure circumstances noted

---

### Story 12.37: Tennessee Resort Data Population
**As a** skier in Tennessee
**I want** complete data for Tennessee ski areas
**So that** I can find Southern skiing options

**File Location:** `regions/us/tennessee/region-us-tennessee.json`

**Scope:** 1 active resort, 1 defunct area (2 total)

**Active Resorts Include:**
- Ober Mountain (formerly Ober Gatlinburg)

**Acceptance Criteria:**
- [ ] Ober Mountain fully populated
- [ ] 1 defunct area documented
- [ ] Gatlinburg/Smoky Mountains location noted

---

# Remaining Canadian Provinces User Stories

## Western Canada

### Story 12.40: Saskatchewan Resort Data Population
**As a** skier in the Canadian Prairies
**I want** complete data for all Saskatchewan ski areas
**So that** I can find Prairie skiing options

**File Location:** `regions/ca/saskatchewan/region-ca-saskatchewan.json`

**Scope:** 9 active resorts, 1 defunct area (10 total)

**Active Resorts Include:**
- Mission Ridge Winter Park
- Ski Timber Ridge
- Duck Mountain
- Table Mountain (SK)
- Wapiti Valley
- Eb's Trails
- Little Red River Park
- Assiniboia
- Val Marie Regional Park

**Acceptance Criteria:**
- [ ] All 9 active resorts fully populated
- [ ] 1 defunct area documented

---

### Story 12.41: Manitoba Resort Data Population
**As a** skier in the Canadian Prairies
**I want** complete data for all Manitoba ski areas
**So that** I can find Manitoba skiing options

**File Location:** `regions/ca/manitoba/region-ca-manitoba.json`

**Scope:** 7 active resorts, 2 defunct areas (9 total)

**Active Resorts Include:**
- Asessippi Ski Area
- Falcon Ridge
- Holiday Mountain
- Spring Hill
- Stony Mountain
- Mystery Mountain
- Ski Valley

**Acceptance Criteria:**
- [ ] All 7 active resorts fully populated
- [ ] All 2 defunct areas documented

---

### Story 12.42: Yukon Resort Data Population
**As a** skier seeking northern adventure
**I want** complete data for Yukon ski areas
**So that** I can discover Canada's far north skiing

**File Location:** `regions/ca/yukon/region-ca-yukon.json`

**Scope:** 1 active resort, 1 defunct area (2 total)

**Active Resorts Include:**
- Mount Sima

**Acceptance Criteria:**
- [ ] Mount Sima fully populated
- [ ] 1 defunct area documented
- [ ] Northern location and unique character noted

---

## Eastern Canada

### Story 12.45: New Brunswick Resort Data Population
**As a** skier in Atlantic Canada
**I want** complete data for all New Brunswick ski areas
**So that** I can explore Maritime skiing

**File Location:** `regions/ca/new-brunswick/region-ca-new-brunswick.json`

**Scope:** 4 active resorts, 2 defunct areas (6 total)

**Active Resorts Include:**
- Crabbe Mountain
- Poley Mountain
- Sugarloaf Provincial Park
- Mont Farlagne

**Acceptance Criteria:**
- [ ] All 4 active resorts fully populated
- [ ] All 2 defunct areas documented

---

### Story 12.46: Nova Scotia Resort Data Population
**As a** skier in Atlantic Canada
**I want** complete data for all Nova Scotia ski areas
**So that** I can explore Maritime skiing

**File Location:** `regions/ca/nova-scotia/region-ca-nova-scotia.json`

**Scope:** 4 active resorts, 2 defunct areas (6 total)

**Active Resorts Include:**
- Ski Wentworth
- Ski Martock
- Ski Ben Eoin
- North Highlands Nordic

**Acceptance Criteria:**
- [ ] All 4 active resorts fully populated
- [ ] All 2 defunct areas documented

---

### Story 12.47: Newfoundland and Labrador Resort Data Population
**As a** skier in Eastern Canada
**I want** complete data for all Newfoundland ski areas
**So that** I can discover Canada's easternmost skiing

**File Location:** `regions/ca/newfoundland-and-labrador/region-ca-newfoundland-and-labrador.json`

**Scope:** 3 active resorts, 1 defunct area (4 total)

**Active Resorts Include:**
- Marble Mountain
- White Hills Resort
- Smokey Mountain

**Acceptance Criteria:**
- [ ] All 3 active resorts fully populated
- [ ] 1 defunct area documented
- [ ] Easternmost ski area in North America noted

---

### Story 12.48: Prince Edward Island Resort Data Population
**As a** skier in Atlantic Canada
**I want** complete data for Prince Edward Island ski areas
**So that** I can discover PEI skiing

**File Location:** `regions/ca/prince-edward-island/region-ca-prince-edward-island.json`

**Scope:** 2 active resorts, 1 defunct area (3 total)

**Active Resorts Include:**
- Brookvale Provincial Ski Park
- Mark Chicken Ski Area

**Acceptance Criteria:**
- [ ] All 2 active resorts fully populated
- [ ] 1 defunct area documented

---

## Implementation Notes

### Data Sources
- Official resort websites
- OnTheSnow.com
- Ski resort associations (regional ski associations)
- Wikipedia
- OpenStreetMap for coordinates
- Ski area historical archives

### Priority Order
1. **Tier 1 - Remaining Major Markets:** Pennsylvania, Minnesota, Wisconsin (larger ski markets with many resorts)
2. **Tier 2 - Regional Hubs:** Massachusetts, Connecticut, Ohio (moderate traffic markets)
3. **Tier 3 - Secondary Markets:** Virginia, West Virginia, North Carolina, New Jersey (smaller but active markets)
4. **Tier 4 - Canadian Remaining:** Manitoba, Saskatchewan, Atlantic provinces
5. **Tier 5 - Small Markets:** Nevada, Alaska, Alabama, Georgia, Tennessee, Yukon, and remaining small states

### Technical Approach
- Add entries to `regions/{country}/{state}/region-{country}-{state}.json` files with full data model
- Create individual `.ts` files for resorts in the same directory
- Ensure TypeScript types are satisfied
- Test each entry compiles and renders correctly
- Use placeholder images initially, replace with real images over time
- Maintain consistent data quality across all regions

### Quality Checklist for Each Resort
- [ ] GPS coordinates verified on map
- [ ] Stats match official sources
- [ ] Pass affiliations current for 2024-25 season
- [ ] Description is unique and accurate
- [ ] All required fields populated
- [ ] TypeScript compiles without errors

---

## Summary

### Completed Work
| Category | States/Provinces | Active Resorts | Defunct Areas | Total |
|----------|------------------|----------------|---------------|-------|
| US States | 14 | ~240 | ~150 | ~390 |
| Canadian Provinces | 4 | ~153 | ~25 | ~178 |
| **Completed Total** | **18** | **~393** | **~175** | **~568** |

### Remaining Work
| Category | Stories | Active Resorts | Defunct Areas | Total |
|----------|---------|----------------|---------------|-------|
| Western US | 2 | 9 | 7 | 16 |
| Midwest US | 10 | 64 | 36 | 100 |
| Eastern US | 10 | 52 | 52 | 104 |
| Southern US | 3 | 2 | 2 | 4 |
| Western Canada | 3 | 17 | 4 | 21 |
| Eastern Canada | 4 | 13 | 6 | 19 |
| **Remaining Total** | **32** | **~157** | **~107** | **~264** |
