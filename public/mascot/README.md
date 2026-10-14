# Hero mascot layers

`HeroMascot` (`src/components/HeroMascot.tsx`) expects two transparent WebP
files here:

- `head.webp` — the mascot's head only. This layer turns toward the cursor.
- `body.webp` — the torso/body. Static.

Both should be **full-frame exports on the same canvas** (identical
dimensions, transparent padding around the figure). Exporting each layer over
the same Blender camera framing makes them stack and align automatically — the
head sits over the neck with no manual offset.

If the source canvas is not square, update `FRAME_ASPECT` in
`HeroMascot.tsx`; `CROP` controls how much of the top of the figure stays
visible (legs are cropped away for the half-body look).
