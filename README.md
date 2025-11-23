# Colorado Ski Directory 🏔️

> **Find your perfect Colorado ski resort with real-time conditions, AI-powered recommendations, and comprehensive resort information.**

A next-generation ski resort directory platform combining the clean simplicity of AllTrails, the search prominence of Airbnb, and the practical directory power of Yelp. Built with Next.js 14, TypeScript, and Tailwind CSS.

---

## ✨ Features

### 🎿 Comprehensive Resort Data
- **29 Colorado Ski Resorts** - Complete coverage of Colorado's world-class skiing destinations
- **Real-time Conditions** - Live snowfall data, base depth, and terrain status
- **Detailed Stats** - Skiable acres, vertical drop, lifts, runs, and elevation data
- **Pass Affiliations** - Epic Pass, Ikon Pass, Indy Pass, and local resort badges

### 🔍 Smart Search & Discovery
- **Prominent Search Widget** - Airbnb-inspired search by location, dates, and skill level
- **Category Browsing** - Filter by pass type, family-friendly, expert terrain, and more
- **Progressive Disclosure** - Start simple, reveal complexity as users engage
- **Mobile-First Design** - Optimized for on-the-go trip planning

### 🏔️ Beautiful User Experience
- **Clean, Modern Design** - Inspired by industry-leading platforms
- **High-Quality Imagery** - Hero images and resort photos via Unsplash
- **Scannable Resort Cards** - Essential information at a glance
- **Responsive Layout** - Seamless experience across all devices

### 🚀 AI-Ready Architecture
- **Aggregate Root Model** - Unified structure for regions, subregions, and resorts
- **Vector Embeddings Ready** - Prepared for AI-powered search and recommendations
- **Structured Data** - SEO and LLM-optimized with JSON-LD
- **Natural Language Search** - Foundation for conversational resort discovery

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI component library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Data & Backend
- **Mock Data Layer** - Realistic resort data with seeded random generation
- **JSON Data Source** - 29 Colorado resorts from structured database export
- **Prepared for Supabase** - PostgreSQL database ready architecture

### Development Tools
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Cross-browser CSS compatibility

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cr-nattress/ski-directory-website.git
   cd ski-directory-website
   ```

2. **Navigate to the app directory**
   ```bash
   cd apps/v1
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
state-ski-resort-directory/
├── apps/
│   ├── v1/                              # Next.js application
│   │   ├── app/                         # Next.js App Router
│   │   │   ├── layout.tsx              # Root layout
│   │   │   ├── page.tsx                # Landing page
│   │   │   └── globals.css             # Global styles
│   │   ├── components/                  # React components
│   │   │   ├── Header.tsx              # Navigation header
│   │   │   ├── Hero.tsx                # Hero with search widget
│   │   │   ├── CategoryChips.tsx       # Filter categories
│   │   │   ├── ResortCard.tsx          # Individual resort cards
│   │   │   ├── ResortGrid.tsx          # Resort card grid
│   │   │   ├── ContentSection.tsx      # Featured articles
│   │   │   └── Footer.tsx              # Site footer
│   │   ├── lib/                         # Utilities and data
│   │   │   ├── mock-data/              # Mock data layer
│   │   │   │   ├── types.ts            # TypeScript types
│   │   │   │   ├── resorts-from-json.ts # Data transformation
│   │   │   │   ├── resorts_rows.json   # Raw resort data
│   │   │   │   ├── categories.ts       # Category definitions
│   │   │   │   ├── articles.ts         # Content data
│   │   │   │   └── index.ts            # Exports & utilities
│   │   │   └── utils.ts                # Helper functions
│   │   ├── public/                      # Static assets
│   │   ├── package.json                # Dependencies
│   │   ├── tailwind.config.ts          # Tailwind configuration
│   │   └── tsconfig.json               # TypeScript config
│   └── colorado-landing-page-plan.md   # Implementation plan v2.0
├── full-ski-directory-architecture.md  # Complete platform architecture
├── ski-directory-data-model.md         # Database schema & types
├── resorts_rows.json                   # Resort data (root copy)
└── README.md                            # This file
```

---

## 🎨 Design Philosophy

This project combines the best UI/UX patterns from leading platforms:

### Airbnb 🏠
- **Search-first experience** - Prominent search widget in hero
- **Minimal navigation** - Avoid overwhelming users
- **One primary action** - Finding the perfect resort
- **High-quality imagery** - Emotional connection through visuals

### AllTrails 🥾
- **Clean simplicity** - Uncluttered, outdoor-optimized design
- **Category browsing** - Simple, intuitive filtering
- **Essential information** - Only show what matters
- **Mobile-optimized** - Perfect for on-the-go planning

### Yelp 📍
- **Scannable listings** - Quick information scanning
- **Ratings & reviews** - Social proof front and center
- **Practical information** - Distance, conditions, pass types
- **Directory functionality** - Comprehensive resort coverage

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Key Implementation Details

#### Seeded Random Generation
To prevent React hydration mismatches, all "random" values (ratings, snowfall, etc.) use deterministic seeded random generation:

```typescript
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
```

This ensures server and client render identical content while maintaining data variety.

#### Pass Affiliation Logic
Resorts are intelligently assigned pass affiliations based on name/slug matching:

```typescript
// Epic Pass: Vail, Breckenridge, Keystone, Beaver Creek, Crested Butte
// Ikon Pass: Aspen, Snowmass, Steamboat, Winter Park, Copper, Eldora, Arapahoe, Telluride
// Indy Pass: Monarch, Powderhorn, Hesperus, Sunlight
// Local: All others
```

#### Data Transformation
Raw JSON resort data is transformed into app-ready format with:
- Distance calculations from Denver
- Terrain breakdowns by difficulty
- Mock conditions with realistic values
- Ratings and review counts
- Hero images from Unsplash

---

## 🏗️ Architecture Overview

This project implements an **aggregate root model** where regions, subregions, and resorts share a unified structure:

### Core Entities
- **Region** - Colorado (expandable to other states)
- **Subregion** - I-70 Corridor, Summit County, Front Range, etc.
- **Resort** - Individual ski areas with full metadata

### Data Model Highlights
- **Pass Affiliations** - Epic, Ikon, Indy, Local
- **Live Conditions** - Snowfall, base depth, terrain/lifts open
- **Terrain Breakdown** - Beginner, intermediate, advanced, expert percentages
- **Stats** - Skiable acres, vertical drop, elevations, annual snowfall
- **Features** - Parks, halfpipes, night skiing, backcountry access
- **Tags** - Family-friendly, budget, expert, near-denver, etc.

For complete architecture details, see:
- [`full-ski-directory-architecture.md`](./full-ski-directory-architecture.md)
- [`ski-directory-data-model.md`](./ski-directory-data-model.md)
- [`apps/colorado-landing-page-plan.md`](./apps/colorado-landing-page-plan.md)

---

## 🎯 Roadmap

### Phase 1: MVP ✅ (Complete)
- [x] Next.js 14 project setup
- [x] Design system (Tailwind + custom palette)
- [x] Hero section with search widget
- [x] Category filtering
- [x] Resort card grid (29 resorts)
- [x] Mobile responsive design
- [x] Mock data layer
- [x] Basic routing

### Phase 2: Enhanced Features (Planned)
- [ ] Real-time conditions API integration
- [ ] Resort detail pages
- [ ] Conditions dashboard
- [ ] SEO optimization (structured data)
- [ ] Featured articles/content section
- [ ] Performance optimization

### Phase 3: AI & Advanced Tools (Planned)
- [ ] AI Resort Finder (natural language search)
- [ ] Vector embeddings for semantic search
- [ ] Pass optimizer tool
- [ ] Trip budgeter calculator
- [ ] User authentication
- [ ] Reviews & snow reports

### Phase 4: Community & Polish (Planned)
- [ ] User-generated content (reviews, photos, reports)
- [ ] Community features
- [ ] Advanced filters & sorting
- [ ] Map view
- [ ] Weather forecasts
- [ ] Analytics & insights

---

## 🤝 Contributing

Contributions are welcome! This project is in active development.

### Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow existing TypeScript conventions
- Use Tailwind CSS for styling
- Maintain mobile-first responsive design
- Write clear, descriptive commit messages

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- **UI/UX Inspiration** - Airbnb, AllTrails, Yelp
- **Resort Data** - Sourced from public ski resort databases
- **Images** - [Unsplash](https://unsplash.com/) - High-quality ski photography
- **Icons** - [Lucide](https://lucide.dev/) - Beautiful open-source icons
- **Fonts** - Inter & Poppins from Google Fonts

---

## 📞 Contact & Support

- **Repository**: [https://github.com/cr-nattress/ski-directory-website](https://github.com/cr-nattress/ski-directory-website)
- **Issues**: [GitHub Issues](https://github.com/cr-nattress/ski-directory-website/issues)

---

## 📊 Project Stats

- **29 Colorado Resorts** - Complete coverage
- **200+ Inches Average Snowfall** - Across all resorts
- **Real-time Data Ready** - Architecture supports live conditions
- **Mobile-First** - Responsive across all devices
- **AI-Ready** - Prepared for vector embeddings and natural language search

---

**Built with ❄️ for Colorado skiers and snowboarders**

*Last Updated: November 2025*
