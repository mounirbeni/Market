# 06 — Production Specifications

هذا الملف يجمع مواصفات التسليم التي يحتاجها فريق Graphic / Motion / 3D / Video حتى تبقى الأصول متناسقة وقابلة لإعادة الاستخدام.

القيم المرتبطة بالشعار والألوان والخطوط والحركة مأخوذة من المنتج. المقاسات الإعلامية العامة أدناه هي **production profiles** وليست قيوداً موجودة داخل تطبيق Tarique.

---

# 1. Master Brand Data

| Field | Value |
|---|---|
| Brand Arabic | `طريق` |
| Brand Latin | `Tarique` |
| Logo wordmark Latin | `TARIQUE` |
| Domain | `tarique.ma` |
| Primary blue | `#1F5FE0` |
| Deep navy | `#0A1E3D` |
| Light background | `#FFFFFF` / `#F4F8FE` |
| Dark background | `#071426` / `#050F1D` |
| Body font | IBM Plex Sans Arabic |
| Display font | Noto Kufi Arabic |
| Number/Latin data font | Space Grotesk |
| Main languages | Arabic/Darija (RTL), French (LTR) |

---

# 2. Logo Sources

## Existing production sources in repository

- Vector mark: `src/app/icon.svg`
- Runtime full logo: `src/components/Logo.tsx`
- PWA icons:
  - `public/icons/icon-192.png`
  - `public/icons/icon-512.png`
  - `public/icons/icon-maskable-512.png`
- Apple icon: `src/app/apple-icon.png`

A designer-facing vector copy is also stored under:

- `docs/brand/assets/tarique-mark.svg`

The icon is the authoritative geometric source for the eight-point star + road symbol.

---

# 3. Logo Background Compatibility

## Preferred

- White / very light blue.
- Deep navy.
- Dark blue.
- Simple photographic area with enough contrast.

## Avoid

- Busy grille/headlight detail directly behind the mark.
- Similar medium-blue area that removes edge contrast.
- Highly saturated multicolor gradients behind the gradient logo.

Where image complexity is unavoidable, the logo can sit inside a clean brand surface/card rather than receiving arbitrary drop shadows.

---

# 4. Digital Color Space

The product values are defined as sRGB hex values and should be treated as the digital source of truth.

There are currently **no official Pantone, CMYK, RAL or print spot-color definitions** in the product repository. Any print conversion must therefore be considered a print-production conversion, not a separate official palette, until such standards are approved.

---

# 5. Raster / Vector Asset Policy

## Vector-preferred

- Brand mark.
- Zellige pattern.
- Icons.
- Data diagrams.
- Trust meter geometry.
- Price/reference graphics.
- Motion shape layers.

## Raster/footage

- Vehicle photography.
- Human photography.
- Real locations.
- CGI renders after final render/compositing.
- UI screenshots.

The brand mark itself should not originate from an AI-generated raster image when the official SVG exists.

---

# 6. Common Static Profiles

These are reusable production canvases, not platform-policy claims.

| Use | Ratio | Reference raster |
|---|---:|---:|
| Square social | `1:1` | `1080 × 1080` |
| Portrait feed | `4:5` | `1080 × 1350` |
| Story / Reel cover | `9:16` | `1080 × 1920` |
| Landscape social/video thumbnail | `16:9` | `1920 × 1080` |
| Wide display / web banner | flexible wide | build from vector/layout system |
| OOH | vendor-specific | master artwork should remain vector where possible |

The composition must adapt; cropping one finished 16:9 key visual into 9:16 without hierarchy adjustment often destroys the vehicle/data relationship.

---

# 7. Video Profiles

## Master formats

- `16:9` — website, YouTube-style, presentations, horizontal displays.
- `9:16` — short-form vertical.
- `1:1` or `4:5` — feed-specific cutdowns.

## Resolution references

- Horizontal: `1920 × 1080` minimum delivery reference.
- Vertical: `1080 × 1920` minimum delivery reference.
- Higher-resolution 3D masters are useful for recrops, but resolution is a production decision, not a brand rule.

## Frame rate

The brand has no official fixed FPS in the repository. Frame rate should follow footage and delivery context while preserving the motion character: smooth, controlled, readable.

---

# 8. End Card Information

The minimum end-card identity is:

- Tarique mark / lockup.
- `tarique.ma`.

Depending on campaign, add only one primary message or CTA such as:

- تصفح المركبات
- بيع مركبتك
- قيّم مركبتك
- حسب التكلفة
- قارن

For French, use the equivalent product copy.

The end card should not reintroduce old domains or names.

---

# 9. UI Capture Specification

When real product UI is used as an asset:

- Capture the current `tarique.ma` build.
- Preserve correct language direction.
- Avoid browser chrome unless the concept specifically needs a browser.
- Do not alter product numbers and then present the result as a real listing.
- For concept data, visibly treat the screen as demonstration/mock data.
- Avoid displaying personal data from real users.

Useful capture classes:

- Home desktop Arabic.
- Home mobile Arabic.
- Home desktop French.
- Home mobile French.
- Search/results.
- Vehicle detail with trust/price data.
- Valuation.
- Cost calculator.
- Compare.
- Sell flow.
- Dealer page.

The current documentation environment could not retrieve the public domain for reliable screenshots, so no stale or fabricated captures are included in this commit.

---

# 10. 3D Deliverables

Useful reusable output layers for Tarique CGI campaigns:

- clean beauty render.
- alpha/background-separated vehicle when licensing/source permits.
- shadow pass.
- reflection pass.
- zellige/environment pass.
- brand/data overlay pass.
- logo/mark isolated pass.
- vertical-safe and horizontal-safe cameras.

These are production assets, while the brand constants remain the same: geometry, colors, typography and data language.

---

# 11. Motion Deliverables

Reusable identity components can include:

- Tarique mark reveal.
- full lockup reveal.
- trust-score animation.
- price/reference comparison module.
- cost breakdown module.
- verified badge reveal.
- road-line transition.
- zellige transition/mask.
- lower-third.
- Arabic title system.
- French title system.
- end card.

All reusable templates should keep RTL and LTR as separate layout states rather than flipping a finished composition blindly.

---

# 12. Typography in Video and Static

## Arabic headline

Noto Kufi Arabic, normally 700/800.

## Arabic supporting copy

IBM Plex Sans Arabic, normally 400–700 depending on hierarchy.

## Numbers / scores / price / km

Space Grotesk 500–700.

## French copy

IBM Plex Sans Arabic contains a Latin subset and is the body system loaded by the product; Space Grotesk remains appropriate for data and the small Latin brand lockup.

Do not replace Arabic with a decorative calligraphy font in normal product/brand communication; the current identity is architectural Kufi + modern sans.

---

# 13. Text Safety in Generated Imagery

Generated images/video should not be trusted to render final Arabic, French, domain names, prices or logo lettering accurately.

Final brand-critical text assets are:

- official logo/vector.
- real typeset headline.
- real typeset data.
- real `tarique.ma`.

This is especially important because misspelling `Tarique` or distorting Arabic changes the brand itself.

---

# 14. Vehicle Accuracy

For listing-specific creative, visual truth is part of the brand promise.

The asset should not silently change:

- make/model.
- generation/body shape.
- paint color.
- wheel type when material.
- visible condition.
- number of doors.
- interior spec.
- major damage state.

Aesthetic cleanup is different from inventing a better vehicle.

---

# 15. Data Accuracy

The following visual elements should originate from actual data when the creative refers to a real listing:

- asking price.
- reference price.
- trust score.
- year.
- mileage.
- city.
- verified status.
- inspected status.
- seller/dealer status.
- ownership-cost estimate.

Concept campaigns may use illustrative figures only when they are clearly not presented as a real listing.

---

# 16. Accessibility / Readability

The product itself uses strong text/background separation, focus indication and clean hierarchy. The same character should carry into marketing output:

- avoid tiny light-gray text over photography.
- semantic green/red should not be the only carrier of meaning.
- numeric labels should accompany meters/charts.
- Arabic diacritics are not necessary for normal Darija copy unless meaning requires them.
- important text must remain legible after mobile compression.

---

# 17. Naming Convention for Creative Assets

This is a production convention for consistency:

```text
tarique_<campaign>_<concept>_<lang>_<ratio>_<version>.<ext>
```

Examples:

```text
tarique_trust_score_ar_9x16_v01.mp4
tarique_reference_price_fr_4x5_v03.png
tarique_brandfilm_endcard_bilingual_16x9_v02.mov
```

Names like `TRIQ_final_FINAL2` should disappear with the old brand naming.

---

# 18. Asset Metadata to Preserve

For every approved master asset, useful metadata is:

- campaign.
- language.
- ratio.
- date/version.
- source listing IDs if relevant.
- whether data is real or illustrative.
- whether the vehicle image is owned/licensed/generated.
- logo version.
- approval state.

This protects the trust promise operationally, not just visually.

---

# 19. Current Gaps — Not Yet Officially Defined

The repository currently does **not** define official values for:

- CMYK/Pantone colors.
- minimum printed logo size.
- numeric clear-space rule.
- sonic logo.
- music library.
- voice-over voice profile.
- photography lens package.
- fixed video FPS.
- official 3D material library.
- official social template dimensions.

Where this documentation gives direction for these areas, it is explicitly a creative/production extension of the existing product identity, not a claim that such standards already existed.
