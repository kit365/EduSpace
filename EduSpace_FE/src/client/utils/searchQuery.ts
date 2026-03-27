/** Maps hero numeric capacity input to CAPACITY_OPTIONS buckets (min-max string). */
export function parseHeroCapacityInput(raw: string): string | undefined {
  const n = parseInt(raw.trim(), 10);
  if (!Number.isFinite(n) || n < 1) return undefined;
  if (n <= 10) return '4-10';
  if (n <= 20) return '10-20';
  if (n <= 30) return '20-30';
  return '30-50';
}
