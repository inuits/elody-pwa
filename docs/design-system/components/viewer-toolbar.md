# Viewer toolbar

The bar over every media viewer. Implemented by
`src/components/ViewerToolbar.vue` (image mode, wired to OpenSeadragon by
`IIIFViewer.vue`; `mode="pdf"` in `PDFViewer.vue`; `mode="text"` in `TextViewer.vue`; `mode="av"` in
`AudioAndVideoPlayer.vue`). `PdfToolbar` is gone.

## When to use
- Over any viewer surface: one toolbar everywhere, never a per-viewer bar.
- Not for actions on the mediafile record itself (those live in the panel or
  list row).

## Anatomy
A white bar across the top of the viewer, soft shadow. Viewer operations on
the left, the file arrows (when the selection has several mediafiles) in the
middle, context actions on the right.

| Mode | Left | Right |
|---|---|---|
| image | fullscreen, zoom in, zoom out, rotate, crop / cancel crop (when selecting), download, recrop, original/cropped | IIIF operations, Reset |
| av | download (transport, scrubber, volume and video fullscreen are the browser's native controls) | — |
| text | zoom in, zoom out (text size 50–300% in 25% steps), download | — |
| pdf | fullscreen, zoom in, zoom out, download | ‹ page-number input / count › (arrows disabled at the ends; a typed page is clamped) |

## Tokens
| Token | Role |
|---|---|
| `--viewer-toolbar-height` | bar height |
| `--viewer-button-width`, `--viewer-button-height` | icon button box (20px icon) |
| `--viewer-button-radius` | hover wash shape |
| `--viewer-text-button-padding-x` | text buttons (Reset, original/cropped) |
| `--viewer-page-input-width` | PDF page-number input (on `--color-surface-muted`) |
| `--viewer-banner-accent-width` | warn banner under the bar: `--color-warning-bg` with a `--color-warning` left bar, body ink, `role="status"` |
| `--color-accent-wash` | hover |
| `--color-text-disabled` | disabled icon |

## Accessibility
- `role="toolbar"` named "Viewer actions" (`media-viewer.toolbar`).
- Every button is a real `<button>` with an `aria-label`; OpenSeadragon's own
  button titles are set to the same translated names.
- Entering fullscreen is announced in a `role="status"` region inside the
  viewer element (OpenSeadragon detaches the rest of the page). PDF uses the
  browser's fullscreen on the viewer element, announced the same way.
- The page input is named "Page number"; the arrows "Previous page" / "Next page".

## Maps
`maps/MapChrome.vue` sits inside every OpenLayers map (`WktMap`, `PointMap`,
`HeatMap`, which pass `:controls="[]"`): a white capsule top-left with the
same `.viewer-button` zoom in / zoom out (and fullscreen where the map had
it), and an attribution that never collapses (`map-viewer.md`). Each map is a
`role="region"` named "Map". The feature popup is `maps/MapFeaturePopUp.vue`:
`role="dialog"` named by the feature's first value, a named close button,
Escape closes, overlay radius and shadow.

Geometry and site dots use the client accent (stroke, 25% fill), read with
`readCssToken()`. Set an OpenLayers style function on the layer instance, not
as `:style` on the vue3-openlayers component: Vue normalises `style` on any
component and drops functions.

