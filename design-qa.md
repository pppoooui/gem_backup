# DFCgem About Homepage Design QA

- Source URL: `https://ch.xupingjewelry.com/about-us.html`
- Source captures: `qa-screenshots/home-reference-rebuild/source-*.png`
- Implementation route: `http://127.0.0.1:3001/zh`
- Implementation captures: `qa-screenshots/home-reference-rebuild/{about,history,factory,recognition,brand-footer}.png`
- Combined comparison: `qa-screenshots/home-reference-rebuild/comparison-all.png`
- Viewports: 1280 x 720 desktop and 390 x 844 mobile
- State: Chinese homepage; nine-year history auto-play and year selection

## Full-view comparison evidence

- The page now follows the five supplied reference sections: asymmetric company introduction, image timeline, factory gallery, certification wall, and image banner with a white multi-column footer.
- Section density, centered headings, champagne accent, white/gray bands, image proportions and footer anatomy follow the source.
- DFCgem copy and assets replace all Xuping branding.

## Focused comparison evidence

- Typography: compact sans-serif hierarchy, bold centered section headings and small muted supporting copy match the reference rhythm.
- Layout: the timeline shows three desktop images, a nine-year rail and active-year copy; mobile shows one primary image with the next card visible.
- Colors: white, soft gray, charcoal and muted champagne map to the source palette.
- Imagery: original DFCgem laboratory, gemstone and banner assets are sharp and correctly cropped.
- Interactions: auto-play follows a slow 6.4-second cycle with a 2.4-second continuous rightward slide; the overlay arrows are removed; year selection scrolls both image and year rails; the active mobile year stays visible.

## Findings

- No actionable P0, P1 or P2 mismatch remains.
- [P3] Certification cards are deliberate temporary visual slots because final certificate images have not yet been supplied. Their dimensions and replacement boundary are ready.
- [P3] Timeline imagery is provisional and uses existing DFCgem assets. It can be replaced one-for-one without changing carousel behavior.

## Verification

- ESLint passed.
- Eight unit tests passed, including the exact nine-year sequence and carousel wrapping.
- Next.js production build passed.
- Desktop and mobile have zero horizontal page overflow.
- Browser console has no relevant warnings or errors.
- Nine timeline milestones and eight certificate positions render.

final result: passed
