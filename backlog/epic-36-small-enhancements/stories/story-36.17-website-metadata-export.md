# Story 36.17: Create Website Metadata Export for Research

## Description

Create an export tool that generates a comprehensive metadata export of all resort website URLs and related information for SEO research, link building, and partnership outreach.

## Export Fields

- [ ] Resort name
- [ ] Resort slug
- [ ] Official website URL
- [ ] State/Province
- [ ] Country
- [ ] Pass affiliations
- [ ] Social media URLs (if available)
- [ ] Ski shop websites (from Epic 35 data)

## Output Formats

- [ ] CSV file
- [ ] JSON file
- [ ] Optional: Google Sheets integration

## Use Cases

1. **SEO Research** - Analyze competitor/partner websites
2. **Link Building** - Identify partnership opportunities
3. **Outreach** - Contact resorts for data verification
4. **Analytics** - Track website health (404s, redirects)

## Acceptance Criteria

- [ ] Export script created
- [ ] All active resorts included
- [ ] Website URLs validated (basic format check)
- [ ] Output files generated successfully
- [ ] Documentation for running export

## Technical Notes

- Could be a Node.js script in `apps/updaters/` or CLI tool
- Query Supabase for resort data
- Include GCS ski shop data if applicable

## Effort

Medium (2-4 hours)
