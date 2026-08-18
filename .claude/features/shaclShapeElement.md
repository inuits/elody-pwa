## SHACL Shape Element (EntityElementShaclShape.vue)

A read-only entity-view element that renders a field set derived from a SHACL
shape, so a detail view can be generated from a shape instead of enumerating its
properties in a GraphQL fragment.

### What it does

Given an entity carrying a JSON field set (produced server-side from a SHACL
shape, with the entity's values already merged in), it renders one panel of
labelled values. Adding a property to the shape makes it appear in the UI with
no query and no component change.

First consumer: the dishacled demonstrator's `oslc:Error` alerts, rendered from
`lblodsh:ErrorShape`. The element itself is generic and knows nothing about
alerts.

### GraphQL Schema (baseGraphql)

```graphql
type ShaclShapeElement {
  label(input: String): String
  fieldsKey(input: String!): String!   # names the entity field holding the field set
  isCollapsed(input: Boolean): Boolean
}

type EntityViewElements {
  shaclShapeElement: ShaclShapeElement
  ...
}
```

Used in a fragment as a column element — note it declares the panel, not the
fields:

```graphql
entityView {
  column {
    elements {
      shaclShapeElement {
        label(input: "panel-labels.alert-shape")
        fieldsKey(input: "shapeFields")
      }
    }
  }
}
```

The field set itself rides on a `JSON` field of the entity (`Alert.shapeFields`),
resolved client-side by the BFF — the same untyped-JSON path
`processorConfig` / `ProcessorConfigForm` already use.

### Component → Data Flow

```
EntityColumn.vue           passes :entity down (added for this element)
  └─ EntityElement.vue     dispatches on __typename === 'ShaclShapeElement'
       └─ EntityElementShaclShape.vue
            entity[element.fieldsKey]        -> the field set
            getMetadataFields(...)           -> @/helpers, unchanged
            MetadataWrapper per leaf         -> the ordinary metadata renderer
```

### Business Rules & Gotchas

- **`getMetadataFields` accepts a `PanelMetaData[]`**, not only a
  `WindowElementPanel` (`helpers.ts:319`). That is what lets this element reuse
  the standard rendering path.
- **Values come from the field set, not the form store.** `getMetadataFields`
  prefers a `value` already on the field over `getValueForPanelMetadata`
  (`helpers.ts:350`). Because the server merges values in, the fragment does not
  need an `intialValues` entry per key.
- **`EntitySingle` still requires `intialValues` to exist** on the entity
  (`EntitySingle.vue:222` returns early without it) — an entity rendered purely
  through this element must still select some `intialValues`, or the page hangs
  on its spinner showing nothing. This is easy to hit and gives no error.
- **Read-only.** It renders with `is-edit="false"` and has no save path. Pair it
  with `entityPageConfig` (`hasEditMetadataButton: false`, `deleteButton: false`)
  when the source has no write path, or the page offers buttons that cannot work.
- **Ordering is the server's.** The element renders the field set in the order
  given; it does not sort.
- Nested `shui:DetailsEditor` fields fall through to `MetadataWrapper`'s own
  dispatch, so this component carries no shape semantics.

### Dependencies

- `@/helpers` — `getMetadataFields`
- `@/components/metadata/MetadataWrapper.vue`
- `@/generated-types/queries` — `PanelType`
- `@/types` — `Unicons`

### Related

- Producing the field set from a shape (collection-api, dishacled):
  `client-collection-module/docs/alert-rendering.md`
- The SHACL → form pipeline it reuses: `client-collection-module/docs/shacl-ui-bridge.md`
- [Dynamic Forms](./dynamicForm.md) — the editable counterpart, same JSON contract
