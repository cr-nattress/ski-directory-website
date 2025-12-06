import slugify from 'slugify';

export function generateSlug(name: string, city?: string, state?: string): string {
  const parts = [name];
  if (city) parts.push(city);
  if (state) parts.push(state);

  return slugify(parts.join(' '), {
    lower: true,
    strict: true,
    trim: true,
  });
}
