// Unique per account and deterministic across sessions, devices and browsers.
// These are decorative generated illustrations, not the Google profile photo.
export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
}
