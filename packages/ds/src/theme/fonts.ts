// Pure, không require asset → import được trong vitest/createTheme.
// Figma fontName {family, style} → fontFamily RN (= tên file .ttf, xem fontAssets.ts).
// Family khác MiSans (IBM Plex cho Body/Code) → undefined = font hệ thống.
export function fontFamilyFor(family: string, style: string): string | undefined {
  if (family !== 'MiSans Latin') return undefined;
  return `MiSansLatin-${style.replace(/\s+/g, '')}`;
}
