export const AVATAR_COLORS = [
  "#22C55E",
  "#0EA5E9",
  "#A855F7",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#3B82F6",
];

/**
 * Returns a deterministic accent color from a predefined palette based on string hash.
 */
export function getDeterministicColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
