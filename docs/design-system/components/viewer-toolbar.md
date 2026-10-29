# Viewer toolbar

The bar over every media viewer. Implemented by
`src/components/ViewerToolbar.vue` (image mode, wired to OpenSeadragon by
`IIIFViewer.vue`). The PDF, text and audio/video modes move into it in DS 5.

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

## Tokens
| Token | Role |
|---|---|
| `--viewer-toolbar-height` | bar height |
| `--viewer-button-width`, `--viewer-button-height` | icon button box (20px icon) |
| `--viewer-button-radius` | hover wash shape |
| `--viewer-text-button-padding-x` | text buttons (Reset, original/cropped) |
| `--color-accent-wash` | hover |
| `--color-text-disabled` | disabled icon |

## Accessibility
- `role="toolbar"` named "Viewer actions" (`media-viewer.toolbar`).
- Every button is a real `<button>` with an `aria-label`; OpenSeadragon's own
  button titles are set to the same translated names.
- Entering fullscreen is announced in a `role="status"` region inside the
  viewer element (OpenSeadragon detaches the rest of the page).
