# Design sources

Original, unprocessed assets. **Nothing here is served by the site** — these are
kept for reference and for regenerating derived assets.

| File | What it is |
| --- | --- |
| `mascot-character-sheet.png` | Five-angle turnaround (front, 3/4, side, back ×2). Source for any future multi-angle mascot work. |
| `mascot-pose-pointing.png` | Raw render of the hero pose, on its original background. |

## Deriving the hero asset

`public/mascot-hero.png` is produced from `mascot-pose-pointing.png` by:

1. Flood-filling the background to transparent from the image borders inward, so
   the mascot's own white helmet and cream sneakers are preserved.
2. Repainting the face screen as blank glass — the eyes and mouth are drawn in
   code (`src/components/mascot/MascotFace.tsx`) so they can track the cursor
   and blink.
3. Eroding the alpha edge by ~1px to remove the halo left by anti-aliased
   background pixels.

If the artwork is ever replaced, the face overlay position in
`src/components/mascot/Mascot.tsx` (`facePosition`) must be re-measured — it is
expressed as percentages of the image box and will silently misalign otherwise.
