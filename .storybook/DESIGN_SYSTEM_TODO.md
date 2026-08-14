# Stories to create (referenced by docs pages, not yet in Storybook)

One line per missing story: expected ID · component · states the story must show.
IDs follow the title convention (lowercase, / → -, --storyname). Where the Vue
component name is a best guess from the repo, verify the title before creating.

- base-basebutton--variants · BaseButton.vue · primary / secondary / ghost / danger / disabled / with-icon, sm+md
- base-basecheckbox--default · BaseCheckbox.vue · unchecked / checked / indeterminate / disabled / focus ring
- metadata-metadatawrapper--default · MetadataWrapper.vue · resting / hover (accent wash + pencil) / focus / empty (45% opacity) / error
- metadata-inlinefieldeditor--editing · InlineFieldEditor.vue · text editing / select open / saving spinner / error with role=alert / saved check
- entityelements-entityelementwindowpanel--group-editing · EntityElementWindowPanel.vue · resting group / one-gesture edit open (tinted card, Bewaar/Annuleer) / validation error
- entityelements-entityelementwindowpanel--repeatable · EntityElementWindowPanel.vue · rows + zebra / row hover actions / add-row pill / drag handle
- library-viewmodes-viewmodeslist--default · ViewModesList.vue · table + list + grid mode / selected rows / preview split open (collapses to first column)
- library-viewmodes-listitem--default · ListItem.vue · entity badges tone1/2/3 + subtype chip / thumbnail / relation chips
- components-previewwrapper--column-list · PreviewWrapper.vue · columnlist with thumbnail / loading / media type / close + open-detail header actions
- contextmenuactions-contextmenuactionsshell--split-button · ContextMenuActionsShell.vue · resting / menu open / disabled reasoned item — label always visible, never a bare ⋮
- contextmenuactions-contextmenuactionsshell--overflow-menu · ContextMenuActionsShell.vue · labelled trigger + menu with icons, destructive item last
- bulkoperations-selectionactionbar--default · BulkOperations action bar · 0 selected (disabled) / n selected / cross-page selection note
- entityelements-entityelementwindow--default · EntityElementWindow.vue · panel header + block heading + section header + quality status chip/popover
- filters-filtersbase--default · FiltersBase.vue · sections collapsed/expanded / text matcher / checkbox list / active count / apply bar
- modals-entitypicker--default · relation picker modal · search pill / result rows / selected state / confirm
- modals-basemodal--default · base modal · scrim, 10px radius, focus trap, Escape
- components-mediaviewer--with-toolbar · MediaViewerNew.vue + IIIFViewer.vue · image with OpenSeadragon toolbar (zoom/home/fullscreen/rotate) / loading / no-media empty state
- components-pointmap--default · PointMap.vue · points + popup; add wktmap/heatmap variants
- components-breadcrumb--default · breadcrumb + record stepper chrome · trail with badges / stepper at start/middle/end
- components-toast--undo · toast · status toast (role=status) with Ongedaan maken / error toast (role=alert) / audit entry row

## Round 2

- components-advanceddropdown--multi-search · AdvancedDropdown.vue · closed / open with search / multi-select checks / clear affordance / inline-label variant / skeleton options
- base-baseinputautocomplete--tags · BaseInputAutocomplete.vue · chips + input / async loading / empty with "Maak nieuw" / chip remove / disabled
- base-basedatepicker--default · BaseDatePicker.vue · calendar grid / time / range / keyboard nav
- base-baseinputtext--states · text/number/textarea · resting / focus ring / error / disabled / with copy affordance / truncation tooltip
- base-basetogglegroup--default · toggle group + slider · options / selected / disabled; slider with value bubble
- repetitiveform-dynamicform--tabs · DynamicForm.vue · tabs / field order / validation summary / submit zone
- repetitiveform-stepmodal--step · StepModal + StepField + Overview · step card / created-so-far list / step errors
- base-basepagination--default · BasePagination.vue · pages / page-size select / edges disabled
- modals-savedsearches--picker · saved searches · rail menu / create modal / picker
- components-historydiffpreview--two-column · HistoryDiffPreview.vue · side-by-side diff, changed rows marked
- components-dropzone--progress · dropzone + BaseProgressStep + ProgressBar · idle / dragover / per-file progress / error / done banner
- components-wysiwyg--toolbar · WYSIWYG + virtual keyboard · toolbar / diacritics keyboard open
- components-comments--thread · comments · thread / reply / resolved
- components-hierarchytree--default · hierarchy + folder tree · expanded / selected node / lazy-load
- components-importbrowser--default · network-drive import · folder list / file select / import action
- components-mediaviewer--pdf · unified ViewerToolbar · pdf mode (pages) / av mode (transport) / text / IIIF manifest
- base-baseinputcheckbox--default · base/BaseInputCheckbox.vue · (renamed from base-basecheckbox--default)
