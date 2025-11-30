/**
 * Article Types
 * Data models for editorial content
 */

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: number; // minutes
  image: string;
  publishedAt: string;
}
