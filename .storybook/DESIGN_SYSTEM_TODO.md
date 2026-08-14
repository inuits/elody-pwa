# Design-system stories still to create

Referenced by the design-system pages in elody-docs (`/design-system/`), which
mark them with `<StoryEmbed ... todo />`. One line per missing story: expected
ID · component · states the story must show. When a story lands, point the docs
embed at it and remove the line here.

## Missing entirely

- modals-entitypicker--default · relation picker modal · search pill / result rows / selected state / confirm
- components-toast--undo · toast · status toast (role=status) with "Ongedaan maken" / error toast (role=alert) / audit entry row
- entityelements-entityelementwindow--default · EntityElementWindow.vue · panel header + block heading + section header + quality-status chip/popover
- entityelements-entityelementwindowpanel--repeatable · EntityElementWindowPanel.vue · rows + zebra / row hover actions / add-row pill
- components-previewwrapper--column-list · PreviewWrapper.vue · columnlist with thumbnail / loading / media type / close + open-detail header actions

## Existing story is a placeholder — richer story wanted

- windowpanel-entityelementwindowpanel--group-editing · EntityElementWindowPanel.vue · one-gesture edit open (tinted card, Bewaar/Annuleer) / validation error — docs currently embed `--default`
- library-viewmodes-viewmodeslist--default · ViewModesList.vue · full list element: table + list + grid mode / selected rows / column headers — docs currently embed `tableviewrow--default`
- components-mediaviewer--with-toolbar · MediaViewerNew.vue + IIIFViewer.vue · image with OpenSeadragon toolbar / loading / no-media — docs currently embed `previews-mediaviewerpreview--no-mediafiles`
- components-breadcrumbs--record-stepper · breadcrumb + record stepper chrome · stepper at start/middle/end — docs currently embed `--with-history`
- base-basebutton--variants · BaseButton.vue · primary / secondary / ghost / danger / disabled side by side — docs currently embed `--default`
- base-basecheckbox--default · BaseCheckbox.vue · unchecked / checked / indeterminate / disabled / focus ring
