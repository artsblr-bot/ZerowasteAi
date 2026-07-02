# ZeroWaste AI — logo files

## Brand colors
- Forest green (primary): #1b4332
- Copper (accent): #b5651d
- Cream (light bg): #f7f5f0
- Dark green bg variant: #14201a
- Light mode dark-bg text: #a8d5ba (leaf), #d98c4a (copper, dark mode)

## Master files (vector, edit these — everything else is exported from them)
- `logo-full-color-light.svg` — full lockup (mark + wordmark), for light backgrounds
- `logo-full-color-dark.svg` — full lockup, for dark backgrounds
- `icon-mark-color.svg` — mark only, on cream rounded-square card (app icon style)
- `icon-mark-transparent.svg` — mark only, no background (drop on any color)
- `icon-mark-monochrome.svg` — single-color forest green (stamps, watermarks, single-color print)

## Website use
- `favicon.ico` — drop in site root, browsers auto-detect
- `favicon-16.png`, `favicon-32.png`, `favicon-48.png` — for explicit `<link rel="icon">` tags
- `apple-touch-icon.png` (180x180) — for `<link rel="apple-touch-icon">`, iOS home screen bookmark
- `logo-light-360w.png` / `720w` / `1080w` — header logo, use on light nav bars
- `logo-dark-360w.png` / `720w` / `1080w` — header logo, use on dark nav bars or footers

## App icons (iOS/Android/desktop app)
- `app-icon-{16,32,48,64,128,192,256,512,1024}.png` — full size range for app store submission,
  PWA manifest, and platform-specific icon generators (feed the 1024 into any icon generator
  tool for iOS/Android adaptive icon sets)
- `icon-transparent-{64,128,256,512,1024}.png` — mark only, transparent, for anywhere you need
  it to sit on a non-white surface (dark mode app UI, colored splash screens)

## Quick embed reference
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## Notes
- SVGs are hand-authored paths — safe to open/edit in Illustrator, Figma, or Inkscape.
- Wordmark uses Arial/Helvetica as a system-safe stand-in. Swap for your final brand
  typeface by editing the `font-family` in the two `logo-full-color-*.svg` files.
