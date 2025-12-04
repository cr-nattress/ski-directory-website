# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub repository organization (Epic 30)
  - CI/CD workflows with GitHub Actions
  - Dependabot configuration for automated updates
  - Issue and PR templates
  - Security policy and vulnerability reporting
  - Contributing guidelines
  - Code of Conduct

## [1.0.0] - 2025-12-03

### Added
- **Interactive Map** - Full-screen Leaflet map with resort pins color-coded by pass type (Epic, Ikon, Indy, Mountain Collective, Powder Alliance)
- **A-Z Directory** - Sortable table comparing all resorts with real-time filtering by state, pass, and status
- **Resort Detail Pages** - Comprehensive pages with terrain stats, elevations, trail maps, and nearby amenities
- **Multi-Pass Support** - Epic, Ikon, Indy, Mountain Collective, Powder Alliance, NY SKI3, RCR Rockies, L'EST GO passes
- **Lost Ski Areas** - Historical data on closed resorts for ski history enthusiasts
- **Distance Calculator** - Drive time and distance from major cities (Denver, Salt Lake City, Seattle, etc.)
- **Responsive Design** - Mobile-first approach optimized for on-the-go planning
- **SEO Optimization** - JSON-LD structured data, sitemaps, and meta tags for rich search results
- **Supabase Integration** - PostgreSQL database for resort data and pass affiliations
- **Google Cloud Storage** - Asset storage for resort images, trail maps, and Wikipedia data
- **Wikipedia Enricher** - Automated tool to fetch supplementary resort data

### Technical
- Next.js 14 with App Router
- TypeScript 5.3 with strict mode
- Tailwind CSS 3.4 for styling
- react-leaflet for interactive maps
- Supabase for database
- Google Cloud Storage for assets

### Infrastructure
- Netlify deployment configuration
- GCP service account setup
- Data migration scripts

[Unreleased]: https://github.com/your-username/state-ski-resort-directory/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/state-ski-resort-directory/releases/tag/v1.0.0
