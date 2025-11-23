# Colorado Ski Directory - Landing Page v1

A beautiful, mobile-first landing page for discovering Colorado ski resorts, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🏔️ **Clean, minimal hero section** with prominent search widget (Airbnb-style)
- 🎿 **Category browsing** with horizontal scrolling chips (AllTrails-style)
- 📊 **Resort cards** with ratings, conditions, and pass badges (Yelp-style)
- 📱 **Mobile-first responsive design**
- ⚡ **Fast performance** with optimized images and minimal JavaScript
- 🎨 **Beautiful UI** with custom color palette and typography

## Design Philosophy

This landing page combines the best UI/UX patterns from:
- **AllTrails**: Clean, emotional simplicity
- **Airbnb**: Prominent search and minimal navigation
- **Yelp**: Practical directory functionality

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Navigate to the app directory:
```bash
cd apps/v1
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
apps/v1/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx             # Main landing page
│   └── globals.css          # Global styles
├── components/
│   ├── Header.tsx           # Top navigation
│   ├── Hero.tsx             # Hero section with search
│   ├── CategoryChips.tsx    # Category filters
│   ├── ResortCard.tsx       # Individual resort card
│   ├── ResortGrid.tsx       # Resort cards grid
│   ├── ContentSection.tsx   # Articles section
│   └── Footer.tsx           # Footer navigation
├── lib/
│   ├── mock-data/
│   │   ├── types.ts         # TypeScript types
│   │   ├── resorts.ts       # Mock resort data
│   │   ├── categories.ts    # Category definitions
│   │   ├── articles.ts      # Mock articles
│   │   └── index.ts         # Exports & helpers
│   └── utils.ts             # Utility functions
└── public/
    └── images/              # Static images
```

## Mock Data

The app currently uses comprehensive mock data for:
- **10 Colorado ski resorts** with realistic stats and conditions
- **9 category filters** (Epic Pass, Ikon Pass, Family, Budget, etc.)
- **4 featured articles** with images and read times

All mock data is type-safe and follows the data model designed in the planning phase.

## Components

### Header
- Minimal navigation with logo, login, and "List Your Property" CTA
- Responsive mobile menu

### Hero
- Full-width background image
- Prominent 3-field search widget (Where/When/Who)
- Regional stats display
- Fully responsive

### Category Chips
- Horizontal scrolling categories
- Active state styling
- Filter resorts by category

### Resort Cards
- Hero image with hover zoom effect
- Rating with review count
- Key stats (distance, new snow, terrain open)
- Pass affiliation badges
- Terrain open progress bar

### Resort Grid
- Responsive grid (1/2/3 columns)
- Filtered by selected category
- Resort count display

### Content Section
- Featured articles grid
- Read time indicators
- Hover effects

### Footer
- Comprehensive link structure
- Social media icons
- Mobile-responsive

## Styling

### Color Palette
- **Primary**: Blue (#1E40AF) - trust, ski-sky
- **Accents**: Powder Blue, Epic Red, Ikon Orange
- **Backgrounds**: White, Light Gray, Dark Gray

### Typography
- **Headings**: Poppins (display font)
- **Body**: Inter (clean, readable)

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

## Next Steps

To connect this UI to real data:

1. Set up Supabase database
2. Create API routes in `app/api/`
3. Replace mock data imports with API calls
4. Add search functionality
5. Implement filtering and sorting
6. Add detail pages for resorts
7. Build AI-powered features

## License

MIT

## Author

Built with ❤️ for Colorado skiers
