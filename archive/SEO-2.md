Prompt: Next.js/React SEO Audit & Recommendations
You are an expert SEO engineer and senior Next.js/React developer.
Your task is to analyze this Next.js/React codebase and provide concrete, code-level recommendations to maximize SEO, while staying realistic about effort and impact.
1. Context & Goals


Framework: Next.js with React (support both /pages and app/ router when present).


Objective: Improve organic search performance and click-through rate (CTR) without degrading UX.


Assume you have full read access to the repository.


Focus on:


Technical SEO


On-page SEO


Site architecture & internal linking


Performance & Core Web Vitals–related SEO factors



2. What to Analyze in the Codebase
Systematically inspect the codebase for the following:
2.1 Routing & Structure


How routes are defined:


/pages or app/ router (or both).


Dynamic routes ([slug].tsx, [...catchAll].tsx, etc.).




URL patterns:


Are URLs clean, descriptive, and stable?


Any obvious SEO-unfriendly patterns (IDs only, query-heavy URLs, etc.)?




Pagination and filters:


Are paginated pages crawlable and uniquely identifiable (page params in route vs. query only)?




2.2 Meta Tags & Head Management


Next.js metadata patterns:


For /pages: usage of next/head.


For app/: usage of export const metadata or generateMetadata.




Check:


Title tags: unique, descriptive, and keyword-rich?


Meta descriptions: present, unique, compelling?


Canonical tags: consistent, especially for dynamic routes and pagination.


Robots meta: any accidental noindex, nofollow, or noarchive on important pages.


Open Graph / Twitter Card tags: present and correctly populated where relevant (blog posts, marketing pages, product pages).




2.3 Sitemaps & Robots


Look for:


next-sitemap or custom sitemap implementation (/sitemap.xml, /sitemap/*).


robots.txt (static or generated).




Check:


Are important routes included in the sitemap?


Is robots.txt blocking anything it shouldn’t?




2.4 Structured Data (Schema.org)


Look for JSON-LD or microdata:


BlogPosting, Article, BreadcrumbList, Organization, Product, FAQPage, Event, etc.




Assess:


Is structured data present where appropriate?


Is it complete enough to be valid and useful for rich results?




2.5 Content & Semantic HTML


Inspect React components and page templates for:


Proper semantic HTML: <h1>–<h6>, <main>, <nav>, <article>, <section>, <aside>, <footer>.


Heading hierarchy: exactly one <h1> per page; logical descending order.


Text content location: ensure key content isn’t hidden behind client-only rendering where SEO-sensitive.


Overuse of <div>s where semantic tags would help.




2.6 Internal Linking & Navigation


Check:


Use of next/link and standard anchor tags.


Internal linking patterns:


Are important pages deeply buried or easily reachable?


Are there internal contextual links between related pages (e.g., blog posts, product/category pages)?




Breadcrumbs implementation (if any).




2.7 Internationalization (if applicable)


If using next-i18next, app/[locale], or similar:


hreflang tags present and correct?


Locale routes structured in a crawlable, SEO-friendly way?




2.8 Images & Media


Usage of next/image:


Are images optimized with proper sizes, fill, or sizes attributes?


All important images have meaningful alt attributes?




Any large, unoptimized assets that could hurt performance?


2.9 Performance & Core Web Vitals–Related SEO


Check patterns that impact:


LCP: Large hero images, heavy above-the-fold components, blocking scripts/styles.


CLS: Layout shift due to missing dimensions or late-loading components.


FID/INP: Heavy client-side JS, unnecessary hydration, or complex effects.




Evaluate:


SSR vs SSG vs CSR choices:


Are SEO-critical pages server-rendered (SSR/SSG) instead of pure CSR?




Use of dynamic imports for heavy components.




2.10 Indexability & Crawlability


Look for:


Custom _document.tsx and _app.tsx logic that might affect indexing.


Any use of next/dynamic or client-only components hiding content from search engines.


Redirection rules (next.config.js, middleware.ts, or hosting config) that might cause SEO problems:


Redirect loops, excessive 302s instead of 301s, etc.




Custom 404/500 pages and how they are returned.





3. Output Format
Provide your findings and recommendations in this exact structure:
3.1 High-Level SEO Summary


3–6 bullet points:


Overall SEO health.


Biggest strengths.


Top 3–5 weaknesses.




3.2 Prioritized Issues (Impact vs Effort)
Create a table with columns:


ID


Area (Technical, On-page, Architecture, Performance, Other)


Description


Impact on SEO (High / Medium / Low)


Engineering Effort (High / Medium / Low)


Recommended Priority (P0 / P1 / P2)


Key Files / Components


Focus on practical, not theoretical, issues.
3.3 Detailed Recommendations with Code Pointers
For each High or P0/P1 issue:


Problem – What’s wrong and why it matters for SEO.


Where It Appears – File paths, components, or patterns (e.g. app/blog/[slug]/page.tsx, components/Layout/Head.tsx).


Concrete Fix – Show example code changes when possible.


Example format:
##### Issue ID: SEO-001 – Missing unique titles on blog posts (High Impact, P0)

- **Problem**: Blog post pages rely on a generic `<title>` instead of using the post title, hurting CTR and topical relevance.
- **Where**:
  - `app/blog/[slug]/page.tsx`
  - `components/SeoHead.tsx`

**Current (simplified):**
```tsx
export const metadata = {
  title: "My Blog",
  description: "Insights and updates",
};

Recommended:
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: `${post.title} | My Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `https://example.com/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://example.com/blog/${params.slug}`,
    },
  };
}



Why This Helps: Improves keyword relevance and CTR for each post; enables rich previews on social.



Repeat this kind of detailed recommendation for each major issue.

#### 3.4 Quick Wins Checklist

Provide a **short checklist** of 5–15 “quick wins” that can be implemented in under a day each, for example:

- [ ] Ensure every main route has a unique `<title>` and meta description.
- [ ] Add canonical tags to all dynamic routes.
- [ ] Implement or fix XML sitemap generation.
- [ ] Add `Organization` and `WebSite` schema to the root layout.
- [ ] Ensure each page has exactly one `<h1>` and a sensible heading hierarchy.
- [ ] Use `next/image` with descriptive `alt` attributes on all hero images.
- [ ] Add OG/Twitter tags for shareable pages (blog posts, destinations, products, etc.).

#### 3.5 Longer-Term SEO Enhancements

Finally, propose **2–5 longer-term initiatives**, such as:

- Refactoring route structure for better topical clustering.
- Implementing richer structured data (e.g. `BreadcrumbList`, `FAQPage`).
- Building SEO-friendly landing pages for key keywords/topics.
- Introducing content templates with SEO best practices enforced.

For each initiative, include:

- A 2–4 sentence description.
- Expected SEO benefit.
- Rough implementation complexity (Low / Medium / High).

---

### 4. Style & Constraints

- Be **specific** and tie recommendations to **actual files/components/patterns** you see.
- Prioritize **high-impact / low-to-medium effort** changes first.
- Avoid generic SEO advice unless directly connected to something visible in the codebase.
- If something is already done well, call it out briefly so it’s clear it doesn’t need work.

---

Use this prompt to thoroughly audit the Next.js/React codebase and produce an actionable, engineering-friendly SEO improvement plan.
