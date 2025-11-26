# Epic 11: Colorado Ski Resort Data Population

## Overview
Populate complete data models for all Colorado ski resorts and areas listed in the official Wikipedia directory. This includes 33 currently operating resorts and 43 former/lost ski areas.

## Business Value
- Provide the most comprehensive Colorado ski resort directory available
- Include historical "lost" ski areas for educational and nostalgic value
- Enable filtering between active resorts and closed/historical areas
- Support SEO with complete coverage of all Colorado ski destinations

## Data Model Fields to Populate
Each resort entry requires:
- Basic info: id, slug, name, tagline, description
- Status flags: isActive, isLost
- Location: lat/lng coordinates, nearestCity, distanceFromDenver, driveTimeFromDenver
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

## Currently Operating Ski Resorts (33)

### Story 11.1: Arapahoe Basin
**As a** skier planning a trip to A-Basin
**I want** complete resort data including stats, location, and conditions
**So that** I can make informed decisions about visiting this high-altitude resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Accurate GPS coordinates
- [ ] Current pass affiliations (Ikon)
- [ ] Correct stats from official sources
- [ ] isLost: false

---

### Story 11.2: Aspen Highlands
**As a** skier researching Aspen-area resorts
**I want** complete data for Aspen Highlands
**So that** I can compare it with other Aspen mountains

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Part of Aspen Snowmass grouping noted in tags
- [ ] Ikon Pass affiliation
- [ ] isLost: false

---

### Story 11.3: Aspen Mountain (Ajax)
**As a** skier researching Aspen's flagship mountain
**I want** complete data for Aspen Mountain
**So that** I can plan my expert-level skiing trip

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Historical "Ajax" name noted in description
- [ ] Expert terrain emphasis captured
- [ ] isLost: false

---

### Story 11.4: Beaver Creek Resort
**As a** skier looking for luxury ski experiences
**I want** complete Beaver Creek data
**So that** I can explore this upscale Vail Resorts property

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Epic Pass affiliation
- [ ] Luxury amenities noted in features/tags
- [ ] isLost: false

---

### Story 11.5: Breckenridge Ski Resort
**As a** skier planning a trip to one of Colorado's most popular resorts
**I want** complete Breckenridge data
**So that** I can plan my visit to this iconic Summit County destination

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Epic Pass affiliation
- [ ] All 5 peaks documented
- [ ] isLost: false

---

### Story 11.6: Buttermilk Ski Area
**As a** beginner skier or X Games fan
**I want** complete Buttermilk data
**So that** I can explore this beginner-friendly Aspen resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] X Games venue noted in description/tags
- [ ] Beginner-friendly terrain stats
- [ ] isLost: false

---

### Story 11.7: Chapman Hill Ski Area
**As a** skier interested in small local ski areas
**I want** complete Chapman Hill data
**So that** I can discover this Durango community hill

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Municipal/community ski area noted
- [ ] Durango location accurate
- [ ] isLost: false

---

### Story 11.8: Copper Mountain
**As a** skier looking for terrain variety
**I want** complete Copper Mountain data
**So that** I can plan my trip to this naturally divided terrain resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Ikon Pass affiliation
- [ ] Natural terrain separation noted
- [ ] isLost: false

---

### Story 11.9: Cranor Ski Hill
**As a** skier interested in community ski areas
**I want** complete Cranor Ski Hill data
**So that** I can discover this Gunnison community hill

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Municipal operation noted
- [ ] Small hill stats accurate
- [ ] isLost: false

---

### Story 11.10: Crested Butte Mountain Resort
**As a** skier seeking extreme terrain
**I want** complete Crested Butte data
**So that** I can explore this legendary steep skiing destination

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Epic Pass affiliation
- [ ] Extreme terrain reputation captured
- [ ] isLost: false

---

### Story 11.11: Echo Mountain
**As a** skier looking for close-to-Denver options
**I want** complete Echo Mountain data
**So that** I can find this Front Range ski area

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Former "Squaw Pass" name noted
- [ ] Night skiing features if applicable
- [ ] isLost: false

---

### Story 11.12: Eldora Mountain Resort
**As a** Boulder-area skier
**I want** complete Eldora data
**So that** I can plan trips to this closest resort to Boulder

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Ikon Pass affiliation
- [ ] Proximity to Boulder emphasized
- [ ] isLost: false

---

### Story 11.13: Granby Ranch
**As a** family skier
**I want** complete Granby Ranch data
**So that** I can explore this family-friendly resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Former names (SolVista Basin, Silver Creek) noted
- [ ] Family-friendly features captured
- [ ] isLost: false

---

### Story 11.14: Hesperus Ski Area
**As a** skier exploring Southwest Colorado
**I want** complete Hesperus data
**So that** I can discover this small Durango-area resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Night skiing noted if applicable
- [ ] Local/independent pass status
- [ ] isLost: false

---

### Story 11.15: Hoedown Hill
**As a** skier interested in small family ski areas
**I want** complete Hoedown Hill data
**So that** I can discover this unique small operation

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Small family operation noted
- [ ] Accurate location data
- [ ] isLost: false

---

### Story 11.16: Howelsen Hill Ski Area
**As a** skier interested in ski history
**I want** complete Howelsen Hill data
**So that** I can visit Colorado's oldest ski area in continuous operation

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Historic significance noted
- [ ] Steamboat Springs location
- [ ] isLost: false

---

### Story 11.17: Kendall Mountain
**As a** skier visiting Silverton
**I want** complete Kendall Mountain data
**So that** I can discover this community ski area

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Free community ski area noted
- [ ] Silverton location accurate
- [ ] isLost: false

---

### Story 11.18: Keystone Resort
**As a** skier seeking night skiing and varied terrain
**I want** complete Keystone data
**So that** I can plan my trip to this multi-peak resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Epic Pass affiliation
- [ ] Night skiing featured
- [ ] Three peaks noted
- [ ] isLost: false

---

### Story 11.19: Lake City Ski Hill
**As a** skier exploring remote Colorado
**I want** complete Lake City Ski Hill data
**So that** I can discover this small community hill

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Remote location noted
- [ ] Community operation details
- [ ] isLost: false

---

### Story 11.20: Lee's Ski Hill
**As a** skier visiting Ouray
**I want** complete Lee's Ski Hill data
**So that** I can discover this small city-run ski area

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] City of Ouray operation noted
- [ ] Small scale/beginner focus
- [ ] isLost: false

---

### Story 11.21: Loveland Ski Area
**As a** skier seeking value and proximity to Denver
**I want** complete Loveland data
**So that** I can plan trips to this independent resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Independent (no mega-pass)
- [ ] Two base areas noted
- [ ] isLost: false

---

### Story 11.22: Monarch Mountain
**As a** skier seeking authentic Colorado experience
**I want** complete Monarch data
**So that** I can explore this independent powder destination

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Independent operation emphasized
- [ ] Powder reputation noted
- [ ] isLost: false

---

### Story 11.23: Powderhorn Resort
**As a** skier exploring Western Colorado
**I want** complete Powderhorn data
**So that** I can discover this Grand Mesa resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Grand Mesa location
- [ ] Indy Pass or local affiliation
- [ ] isLost: false

---

### Story 11.24: Purgatory Resort
**As a** skier visiting Durango
**I want** complete Purgatory data
**So that** I can plan my Southwest Colorado ski trip

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Former "Durango Mountain Resort" name noted
- [ ] Durango proximity emphasized
- [ ] isLost: false

---

### Story 11.25: Silverton Mountain
**As an** expert skier seeking extreme terrain
**I want** complete Silverton data
**So that** I can plan my guided backcountry adventure

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Expert-only/guided skiing noted
- [ ] Highest ski area in North America
- [ ] isLost: false

---

### Story 11.26: Ski Cooper
**As a** skier seeking affordable uncrowded skiing
**I want** complete Ski Cooper data
**So that** I can discover this Leadville-area gem

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Historic 10th Mountain Division connection
- [ ] Affordable/uncrowded positioning
- [ ] isLost: false

---

### Story 11.27: Snowmass
**As a** skier seeking the largest Aspen-area mountain
**I want** complete Snowmass data
**So that** I can explore this massive resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Ikon Pass affiliation
- [ ] Largest of Aspen mountains noted
- [ ] isLost: false

---

### Story 11.28: Steamboat Ski Resort
**As a** skier seeking champagne powder
**I want** complete Steamboat data
**So that** I can experience this legendary powder destination

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Ikon Pass affiliation
- [ ] Champagne Powder trademark noted
- [ ] isLost: false

---

### Story 11.29: Sunlight Ski Area
**As a** skier visiting Glenwood Springs
**I want** complete Sunlight data
**So that** I can discover this affordable local resort

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Glenwood Springs proximity
- [ ] Affordable positioning
- [ ] isLost: false

---

### Story 11.30: Telluride Ski Resort
**As a** skier seeking world-class terrain and scenery
**I want** complete Telluride data
**So that** I can plan my trip to this iconic destination

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Epic Pass affiliation
- [ ] Historic town and free gondola noted
- [ ] isLost: false

---

### Story 11.31: Vail Ski Resort
**As a** skier seeking legendary Back Bowls
**I want** complete Vail data
**So that** I can explore one of North America's largest resorts

**Acceptance Criteria:**
- [ ] All required Resort fields populated (already exists, verify completeness)
- [ ] Epic Pass affiliation
- [ ] Back Bowls featured
- [ ] isLost: false

---

### Story 11.32: Winter Park Resort
**As a** skier seeking Denver's closest major resort
**I want** complete Winter Park data
**So that** I can plan my trip on the Ski Train

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Ikon Pass affiliation
- [ ] Mary Jane terrain noted
- [ ] Ski Train access noted
- [ ] isLost: false

---

### Story 11.33: Wolf Creek Ski Area
**As a** skier seeking Colorado's most snow
**I want** complete Wolf Creek data
**So that** I can experience the snowiest resort in Colorado

**Acceptance Criteria:**
- [ ] All required Resort fields populated
- [ ] Independent (no mega-pass)
- [ ] Highest average snowfall emphasized
- [ ] isLost: false

---

## Former/Lost Colorado Ski Areas (43)

### Story 11.34: Adam's Rib
**As a** ski history enthusiast
**I want** data for Adam's Rib ski area
**So that** I can learn about Colorado's lost ski history

**Acceptance Criteria:**
- [ ] Basic Resort fields populated with historical data
- [ ] isLost: true, isActive: true (visible but marked as lost)
- [ ] Historical context in description
- [ ] status: 'closed'

---

### Story 11.35: Arapahoe East Ski Area
**As a** ski history enthusiast
**I want** data for Arapahoe East
**So that** I can learn about this former Front Range ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Years of operation noted

---

### Story 11.36: Arrowhead
**As a** ski historian
**I want** data for Arrowhead
**So that** I can understand its incorporation into Beaver Creek

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Merger with Beaver Creek noted

---

### Story 11.37: Baker Mountain
**As a** ski history enthusiast
**I want** data for Baker Mountain
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.38: Berthoud Pass Ski Area
**As a** ski historian
**I want** data for Berthoud Pass Ski Area
**So that** I can learn about this historic pass skiing

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Current backcountry status noted

---

### Story 11.39: Bluebird Backcountry
**As a** ski enthusiast
**I want** data for Bluebird Backcountry
**So that** I can learn about this recently closed operation

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Innovative human-powered concept noted

---

### Story 11.40: Climax
**As a** ski historian
**I want** data for Climax ski area
**So that** I can learn about this mining-town ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Climax Mine connection noted

---

### Story 11.41: Coal Bank Pass
**As a** ski historian
**I want** data for Coal Bank Pass
**So that** I can learn about this lost San Juan ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.42: Conquistador
**As a** ski historian
**I want** data for Conquistador
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.43: Cuchara Valley
**As a** ski historian
**I want** data for Cuchara Valley
**So that** I can learn about this closed Southern Colorado resort

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Recent closure history noted

---

### Story 11.44: Emerald Mountain
**As a** ski historian
**I want** data for Emerald Mountain
**So that** I can learn about this Steamboat-area lost area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.45: Fern Lake
**As a** ski historian
**I want** data for Fern Lake
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.46: Geneva Basin Ski Area
**As a** ski historian
**I want** data for Geneva Basin
**So that** I can learn about this closed Front Range resort

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Guanella Pass location noted

---

### Story 11.47: Hidden Valley
**As a** ski historian
**I want** data for Hidden Valley
**So that** I can learn about this RMNP ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Rocky Mountain National Park location noted

---

### Story 11.48: Hoosier Pass
**As a** ski historian
**I want** data for Hoosier Pass ski area
**So that** I can learn about this lost Summit County area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.49: Idlewild
**As a** ski historian
**I want** data for Idlewild
**So that** I can learn about this Winter Park-area lost area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.50: Ironton Park
**As a** ski historian
**I want** data for Ironton Park
**So that** I can learn about this Million Dollar Highway ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.51: Jones Pass
**As a** ski historian
**I want** data for Jones Pass ski area
**So that** I can learn about this lost Continental Divide area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.52: Libby Creek
**As a** ski historian
**I want** data for Libby Creek
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.53: Little Annie
**As a** ski historian
**I want** data for Little Annie
**So that** I can learn about this Aspen-area lost area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.54: Lizard Head Pass
**As a** ski historian
**I want** data for Lizard Head Pass
**So that** I can learn about this San Juan lost area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.55: Marble Mountain
**As a** ski historian
**I want** data for Marble Mountain
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.56: Marshall Pass
**As a** ski historian
**I want** data for Marshall Pass
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.57: Meadow Mountain
**As a** ski historian
**I want** data for Meadow Mountain
**So that** I can learn about this Vail-area lost area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.58: Mesa Creek
**As a** ski historian
**I want** data for Mesa Creek
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.59: Montezuma Basin
**As a** ski historian
**I want** data for Montezuma Basin
**So that** I can learn about this Arapahoe Basin neighbor

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.60: Mount Lugo
**As a** ski historian
**I want** data for Mount Lugo
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.61: Peak One
**As a** ski historian
**I want** data for Peak One
**So that** I can learn about this Frisco-area lost area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.62: Pikes Peak
**As a** ski historian
**I want** data for Pikes Peak ski area
**So that** I can learn about skiing on Colorado's famous peak

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.63: Pioneer
**As a** ski historian
**I want** data for Pioneer ski area
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.64: Porcupine Gulch
**As a** ski historian
**I want** data for Porcupine Gulch
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.65: Red Mountain
**As a** ski historian
**I want** data for Red Mountain ski area
**So that** I can learn about this lost San Juan area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.66: Rock Creek
**As a** ski historian
**I want** data for Rock Creek
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.67: Rozman Hill
**As a** ski historian
**I want** data for Rozman Hill
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.68: Saint Mary's Glacier
**As a** ski historian
**I want** data for Saint Mary's Glacier
**So that** I can learn about this summer skiing spot

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Year-round skiing history noted

---

### Story 11.69: Seven Utes Mountain
**As a** ski historian
**I want** data for Seven Utes Mountain
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.70: Sharktooth
**As a** ski historian
**I want** data for Sharktooth
**So that** I can learn about this lost ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.71: Ski Broadmoor
**As a** ski historian
**I want** data for Ski Broadmoor
**So that** I can learn about this Colorado Springs resort ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Broadmoor Hotel connection noted

---

### Story 11.72: Ski Dallas
**As a** ski historian
**I want** data for Ski Dallas
**So that** I can learn about this lost Western Slope area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.73: Steamboat Lake
**As a** ski historian
**I want** data for Steamboat Lake
**So that** I can learn about this lost Steamboat-area ski area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.74: Stoner
**As a** ski historian
**I want** data for Stoner ski area
**So that** I can learn about this lost San Juan area

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.75: White Pine
**As a** ski historian
**I want** data for White Pine
**So that** I can learn about this lost Gunnison-area resort

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true

---

### Story 11.76: Wolf Creek Pass (Old)
**As a** ski historian
**I want** data for the original Wolf Creek Pass ski area
**So that** I can learn about the predecessor to current Wolf Creek

**Acceptance Criteria:**
- [ ] Historical data populated
- [ ] isLost: true
- [ ] Distinction from current Wolf Creek noted

---

## Implementation Notes

### Data Sources
- Official resort websites
- Colorado Ski Country USA (coloradoski.com)
- OnTheSnow.com
- Wikipedia
- Colorado Geological Survey for historical areas
- Colorado Ski History Project

### Priority Order
1. Major resorts first (Vail, Aspen, Breckenridge, etc.) - highest traffic
2. Mid-size independent resorts
3. Small community ski areas
4. Lost/historical ski areas

### Technical Approach
- Add entries to `apps/v1/lib/mock-data/resorts.ts`
- Ensure TypeScript types are satisfied
- Test each entry compiles and renders correctly
- Use placeholder images initially, replace with real images over time

### Quality Checklist for Each Resort
- [ ] GPS coordinates verified on map
- [ ] Stats match official sources
- [ ] Pass affiliations current for 2024-25 season
- [ ] Description is unique and accurate
- [ ] All required fields populated
- [ ] TypeScript compiles without errors
