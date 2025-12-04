
# Intelligent Ski Resort Listing Order
### SDA Directory – Ranking, Discovery, and User Engagement Strategy

This README packages the complete strategy for transforming the landing page of the Ski Directory into a **high-engagement, user-captivating discovery engine**—even when we know almost nothing about the user.

The goal:  
**Move from alphabetical infinite scroll → to a dynamic, intelligent, addictive browsing experience.**

---

# 1. Problem Summary

Currently:
- The landing page lists **all active and defunct ski resorts**.
- Uses **infinite scroll**.
- Sorted **alphabetically**.

This is functional but not engaging. New users bounce early, and nothing about it draws them deeper into the site.

Goal:
- Create an intelligent ranking system that:
  - Works with *zero* user personalization.
  - Captivates the user immediately.
  - Encourages exploration («what's this?»)
  - Showcases the richness of the dataset.
  - Balances “big iconic mountains” with “small indie gems.”
  - Uses your existing GCS data: `resort.json`, `assets.json`.

---

# 2. New Architecture Overview

## Supabase
Stores:
- URL registry
- Scrape status
- Metadata for job scheduling

Does **not** store:
- Scraped text
- Images
- Trail maps
- JSON manifests

## Google Cloud Storage (Authoritative)
Stores:
- `resorts/{country}/{state}/{slug}/resort.json`
- `resorts/{country}/{state}/{slug}/assets.json`
- All media under:
  - `images/`
  - `trailmaps/`
  - `logos/`
  - `docs/`
  - `data/`
  - `originals/`

Your ranking algorithm will use **structured data** in `resort.json` and **visual asset richness** from `assets.json`.

---

# 3. The Intelligent Listing Algorithm

This algorithm produces a **global ranking score** per resort, used as the default sort for new users.

## 3.1 The Core Idea
Compute a **multi-factor engagement score** using:
- Resort stats
- Visual asset richness
- Content completeness
- Pass affiliations
- Global engagement metrics
- Seasonality
- A touch of randomness
- Geo-distance bias (OPTIONAL)

```
final_score = base_score + seasonal_boost + geo_boost + randomness
```

---

# 4. Base Score Components

Each factor is normalized between 0–1.

### 4.1 Popularity & Engagement (if available)
- CTR (click-through rate)
- Dwell time
- Saves/favorites
- Shares

### 4.2 Resort Size & Stature
- skiable acres  
- vertical drop  
- lifts count  
- terrain diversity  

### 4.3 Visual Richness (from assets.json)
- Number of images posted
- Existence of hero/card/landscape images
- Trailmap presence

### 4.4 Content Completeness
- description present?
- stats filled?
- terrain data?
- features?
- tags?

### 4.5 Pass Affiliation Boost
Major passes like:
- Epic
- Ikon
- Indy
- Mountain Collective

### 4.6 Defunct Handling
Defunct resorts should not dominate active listings.

---

# 5. Seasonal Boosts

- Early season → boost snowmaking-heavy mountains  
- Deep winter → boost snow quantity & terrain  
- Spring → park & party mountains  
- Uses `avgAnnualSnowfall`, `terrain`, tags, optional open-status APIs  

---

# 6. Diversity Constraints

Prevent the list from being dominated by:
- Only Colorado or BC megamountains
- Only Epic/Ikon resorts  
- Only large ski areas

Enforce variety:
- State diversity  
- Size diversity  
- Pass diversity  

---

# 7. Light Randomness

A static homepage becomes stale. Add small random noise:
```
randomness = Uniform(-0.03, 0.03)
```

This helps prevent ranking monotony and keeps discovery fresh.

---

# 8. Optional: Location Bias (Non-Creepy)

If IP-level region detection is available:
- Slightly increase ranking for ski areas within ~300–500 miles.
- Keep *iconic mountains* visible regardless.

---

# 9. Engagement-Driven Optimization (Multi-Armed Bandits)

Use CTR, dwell time, impressions, and saves to gradually adjust rankings:

- Thompson Sampling
- UCB1

The system:
- Explores under-seen resorts  
- Exploits high-engagement resorts  

No user profile needed.

---

# 10. Homepage Layout Strategy

Avoid a giant list. Use a **Netflix-style layout**:

### **Section 1 – “Top Destinations Right Now”**
Sorted by final_score.

### **Section 2 – “Indie & Hidden Gems”**
High vibe, small/medium mountains.

### **Section 3 – “Night Laps & Park Sessions”**
Resorts with parks or night skiing.

### **Section 4 – “Powder & Steeps”**
High expert terrain + good snowfall.

### **Section 5 – “Lost Ski Areas”**
Defunct resorts as a historical curiosity.

### **Section 6 – Infinite Scroll**
All *active* resorts keyed by final_score.

This hits the user with choices that spark curiosity—not a dictionary.

---

# 11. Summary

This strategy transforms the Ski Directory from a simple encyclopedia into a **dynamic discovery engine** that instantly hooks new users.

Key benefits:
- Maximum engagement for anonymous traffic
- Uses your existing GCS dataset effectively
- Encourages deep browsing & exploration
- Learns from behavior without requiring accounts
- Fully compatible with current schema & design

---

# 12. Next Steps

If desired, I can also package:
- Ready-to-run ranking functions (SQL or TypeScript)
- Thematically grouped API endpoints
- Model schema for engagement tracking
- A/B testing strategy for discovering the optimal mix
