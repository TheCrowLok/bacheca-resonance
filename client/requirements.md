## Packages
(none needed)

## Notes
Integration assumptions:
- The app uses an Unsplash image for the corkboard background. 
- Custom fonts (Caveat for handwriting, Outfit for UI) are imported in index.css.
- Tailwind classes for these fonts are added via standard @layer utilities in index.css to avoid needing tailwind.config.ts changes.
- Uploads are handled via standard FormData POST to /api/upload.
