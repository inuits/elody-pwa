type dataSet = {
  entityTitle: string
  form: any
  dataInput: any
  expectedResult: any
}

export const dataSetBuildInitialValues: dataSet[] = [
  {
    entityTitle: 'ricardo-frame-10',
    form: {
      "fields": [
        {
          "__typename": "MetadataField",
          "label": "Titel",
          "key": "title",
          "type": "text",
          "options": null
        },
        {
          "__typename": "RelationField",
          "key": "subtitle",
          "label": "subtitle",
          "relationType": "components",
          "disabled": null,
          "metadata": null,
          "acceptedEntityTypes": [
            "MediaFile"
          ]
        },
        {
          "__typename": "RelationField",
          "key": "audio",
          "label": "audio",
          "relationType": "components",
          "disabled": null,
          "metadata": null,
          "acceptedEntityTypes": [
            "MediaFile"
          ]
        },
        {
          "__typename": "RelationField",
          "key": "asset",
          "label": "Assets",
          "relationType": "components",
          "disabled": false,
          "metadata": [
            {
              "key": "timestamp_start",
              "type": "number",
              "label": "Start asset",
              "__typename": "MetadataField"
            },
            {
              "key": "timestamp_end",
              "type": "number",
              "label": "Stop asset",
              "__typename": "MetadataField"
            },
            {
              "key": "timestamp_zoom",
              "type": "number",
              "label": "Zoom asset",
              "__typename": "MetadataField"
            },
            {
              "key": "x",
              "type": "number",
              "label": "Positie X",
              "__typename": "MetadataField"
            },
            {
              "key": "y",
              "type": "number",
              "label": "Positie Y",
              "__typename": "MetadataField"
            },
            {
              "key": "z",
              "type": "number",
              "label": "Positie Z",
              "__typename": "MetadataField"
            },
            {
              "key": "scale",
              "type": "number",
              "label": "Schaal",
              "__typename": "MetadataField"
            },
            {
              "key": "setMediafile",
              "type": "number",
              "label": "Mediafile Index",
              "__typename": "MetadataField"
            }
          ],
          "acceptedEntityTypes": [
            "asset"
          ]
        }
      ],
      "__typename": "Form"
    },
    dataInput: [
      {
        "__typename": "MetadataRelation",
        "key": "mediafiles/29d6bac2-36d8-4a48-8701-f2fc88e172c4",
        "value": "",
        "label": "subtitle",
        "type": "components",
        "metadataOnRelation": [],
        "linkedEntity": {
          "id": "29d6bac2-36d8-4a48-8701-f2fc88e172c4",
          "uuid": "mediafiles/29d6bac2-36d8-4a48-8701-f2fc88e172c4",
          "type": "MediaFile",
          "__typename": "MediaFileEntity",
          "media": {
            "primary_transcode": null,
            "__typename": "Media"
          },
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "filename",
              "value": "4677bc924449cef1ea793621774330e6-30273.srt",
              "label": "filename",
              "immutable": null
            }
          ]
        }
      },
      {
        "__typename": "MetadataRelation",
        "key": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c02",
        "value": "",
        "label": "audio",
        "type": "components",
        "metadataOnRelation": [],
        "linkedEntity": {
          "id": "3dd088e1-e39a-4460-913f-5e8671572c02",
          "uuid": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c02",
          "type": "MediaFile",
          "__typename": "MediaFileEntity",
          "media": {
            "primary_transcode": null,
            "__typename": "Media"
          },
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "filename",
              "value": "2b4ec9e3a6e259d58b7eae24eda56edd-Rick Astley - Never Gonna Give You Up (Official Music Video).mp3",
              "label": "filename",
              "immutable": null
            }
          ]
        }
      },
      {
        "__typename": "MetadataRelation",
        "key": "entities/b722236e-7c9f-446d-8deb-d3259cf49507",
        "value": "",
        "label": "Assets",
        "type": "components",
        "metadataOnRelation": [
          {
            "key": "timestamp_start",
            "value": "1",
            "__typename": "RelationMetaData"
          },
          {
            "key": "timestamp_end",
            "value": "1",
            "__typename": "RelationMetaData"
          },
          {
            "key": "timestamp_zoom",
            "value": "1",
            "__typename": "RelationMetaData"
          },
          {
            "key": "x",
            "value": "1",
            "__typename": "RelationMetaData"
          },
          {
            "key": "y",
            "value": "1",
            "__typename": "RelationMetaData"
          },
          {
            "key": "z",
            "value": "1",
            "__typename": "RelationMetaData"
          },
          {
            "key": "scale",
            "value": "1",
            "__typename": "RelationMetaData"
          },
          {
            "key": "setMediafile",
            "value": "1",
            "__typename": "RelationMetaData"
          }
        ],
        "linkedEntity": {
          "id": "b722236e-7c9f-446d-8deb-d3259cf49507",
          "uuid": "entities/b722236e-7c9f-446d-8deb-d3259cf49507",
          "type": "asset",
          "__typename": "Asset",
          "media": {
            "primary_transcode": null,
            "__typename": "Media"
          },
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "title",
              "value": "ricardo-asset-3",
              "label": "ricardo-asset-3",
              "immutable": null
            }
          ]
        }
      }
    ],
    expectedResult: {
      "title": "ricardo-frame-10",
      "subtitle": [
        {
          "linkedEntity": {
            "id": "29d6bac2-36d8-4a48-8701-f2fc88e172c4",
            "uuid": "mediafiles/29d6bac2-36d8-4a48-8701-f2fc88e172c4",
            "type": "MediaFile",
            "__typename": "MediaFileEntity",
            "media": {
              "primary_transcode": null,
              "__typename": "Media"
            },
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "filename",
                "value": "4677bc924449cef1ea793621774330e6-30273.srt",
                "label": "filename",
                "immutable": null
              }
            ]
          },
          "key": "mediafiles/29d6bac2-36d8-4a48-8701-f2fc88e172c4",
          "label": "subtitle",
          "metadata": {},
          "relationType": "components"
        }
      ],
      "audio": [
        {
          "linkedEntity": {
            "id": "3dd088e1-e39a-4460-913f-5e8671572c02",
            "uuid": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c02",
            "type": "MediaFile",
            "__typename": "MediaFileEntity",
            "media": {
              "primary_transcode": null,
              "__typename": "Media"
            },
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "filename",
                "value": "2b4ec9e3a6e259d58b7eae24eda56edd-Rick Astley - Never Gonna Give You Up (Official Music Video).mp3",
                "label": "filename",
                "immutable": null
              }
            ]
          },
          "key": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c02",
          "label": "audio",
          "metadata": {},
          "relationType": "components"
        }
      ],
      "Assets": [
        {
          "linkedEntity": {
            "id": "b722236e-7c9f-446d-8deb-d3259cf49507",
            "uuid": "entities/b722236e-7c9f-446d-8deb-d3259cf49507",
            "type": "asset",
            "__typename": "Asset",
            "media": {
              "primary_transcode": null,
              "__typename": "Media"
            },
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "title",
                "value": "ricardo-asset-3",
                "label": "ricardo-asset-3",
                "immutable": null
              }
            ]
          },
          "key": "entities/b722236e-7c9f-446d-8deb-d3259cf49507",
          "label": "Assets",
          "metadata": {
            "timestamp_start": "1",
            "timestamp_end": "1",
            "timestamp_zoom": "1",
            "x": "1",
            "y": "1",
            "z": "1",
            "scale": "1",
            "setMediafile": "1"
          },
          "relationType": "components"
        }
      ]
    }
  },
  {
    entityTitle: 'ricardo-asset-20',
    form: {
      "fields": [
        {
          "__typename": "MetadataField",
          "label": "Status",
          "key": "publication_status",
          "type": "dropdown",
          "options": [
            {
              "value": "niets-geselecteerd",
              "label": "Niets-Geselecteerd",
              "__typename": "MetadataFieldOption"
            },
            {
              "value": "publiek",
              "label": "Gepubliceerd",
              "__typename": "MetadataFieldOption"
            },
            {
              "value": "te valideren",
              "label": "In behandeling",
              "__typename": "MetadataFieldOption"
            },
            {
              "value": "afgekeurd",
              "label": "Afgekeurd",
              "__typename": "MetadataFieldOption"
            }
          ]
        },
        {
          "__typename": "MetadataField",
          "label": "Titel",
          "key": "title",
          "type": "text",
          "options": null
        },
        {
          "__typename": "MetadataField",
          "label": "Beschrijving",
          "key": "description",
          "type": "text",
          "options": null
        },
        {
          "__typename": "MetadataField",
          "label": "periode",
          "key": "periode",
          "type": "text",
          "options": null
        },
        {
          "__typename": "MetadataField",
          "label": "maker",
          "key": "maker",
          "type": "text",
          "options": null
        },
        {
          "__typename": "RelationField",
          "key": "no-key",
          "label": "component",
          "relationType": "components",
          "disabled": false,
          "metadata": [],
          "acceptedEntityTypes": [
            "person",
            "thesaurus"
          ]
        },
        {
          "__typename": "RelationField",
          "key": "no-key",
          "label": "Museum",
          "relationType": "isIn",
          "disabled": true,
          "metadata": [],
          "acceptedEntityTypes": [
            "museum"
          ]
        },
        {
          "__typename": "RelationField",
          "key": "no-key",
          "label": "Testimony",
          "relationType": "hasTestimony",
          "disabled": true,
          "metadata": [],
          "acceptedEntityTypes": [
            "testimony"
          ]
        }
      ],
      "__typename": "Form"
    },
    dataInput: [
      {
        "__typename": "MetadataRelation",
        "key": "entities/84df5f81-6072-4ee7-b02f-9b705f69f292",
        "value": "",
        "label": "Museum",
        "type": "isIn",
        "metadataOnRelation": [],
        "linkedEntity": {
          "id": "84df5f81-6072-4ee7-b02f-9b705f69f292",
          "uuid": "entities/84df5f81-6072-4ee7-b02f-9b705f69f292",
          "type": "museum",
          "__typename": "SimpleEntity",
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "title",
              "value": "De Zesde Collectie",
              "label": "title",
              "immutable": null
            }
          ]
        }
      },
      {
        "__typename": "MetadataRelation",
        "key": "entities/6ea56c6b-e048-4d9f-8081-d7b6aac8db28",
        "value": "",
        "label": "component",
        "type": "components",
        "metadataOnRelation": [],
        "linkedEntity": {
          "id": "aHR0cHM6Ly9zdGFkLmdlbnQvaWQvYWdlbnQvNTUwMDI4MDkx",
          "uuid": "entities/6ea56c6b-e048-4d9f-8081-d7b6aac8db28",
          "type": "person",
          "__typename": "person",
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "fullname",
              "value": "Wiener, Jacques",
              "label": "volledigeNaam",
              "immutable": null
            }
          ]
        }
      },
      {
        "__typename": "MetadataRelation",
        "key": "entities/a7f94289-6328-4d80-af01-4bc633276fb0",
        "value": "",
        "label": "component",
        "type": "components",
        "metadataOnRelation": [],
        "linkedEntity": {
          "id": "aHR0cHM6Ly9zdGFkLmdlbnQvaWQvYWdlbnQvNTMwMDAxMTk4",
          "uuid": "entities/a7f94289-6328-4d80-af01-4bc633276fb0",
          "type": "person",
          "__typename": "person",
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "fullname",
              "value": "Nova",
              "label": "volledigeNaam",
              "immutable": null
            }
          ]
        }
      }
    ],
    expectedResult: {
      "title": "ricardo-asset-20",
      "component": [
        {
          "linkedEntity": {
            "id": "aHR0cHM6Ly9zdGFkLmdlbnQvaWQvYWdlbnQvNTUwMDI4MDkx",
            "uuid": "entities/6ea56c6b-e048-4d9f-8081-d7b6aac8db28",
            "type": "person",
            "__typename": "person",
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "fullname",
                "value": "Wiener, Jacques",
                "label": "volledigeNaam",
                "immutable": null
              }
            ]
          },
          "key": "entities/6ea56c6b-e048-4d9f-8081-d7b6aac8db28",
          "label": "component",
          "metadata": {},
          "relationType": "components"
        },
        {
          "linkedEntity": {
            "id": "aHR0cHM6Ly9zdGFkLmdlbnQvaWQvYWdlbnQvNTMwMDAxMTk4",
            "uuid": "entities/a7f94289-6328-4d80-af01-4bc633276fb0",
            "type": "person",
            "__typename": "person",
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "fullname",
                "value": "Nova",
                "label": "volledigeNaam",
                "immutable": null
              }
            ]
          },
          "key": "entities/a7f94289-6328-4d80-af01-4bc633276fb0",
          "label": "component",
          "metadata": {},
          "relationType": "components"
        }
      ],
      "Museum": [
        {
          "linkedEntity": {
            "id": "84df5f81-6072-4ee7-b02f-9b705f69f292",
            "uuid": "entities/84df5f81-6072-4ee7-b02f-9b705f69f292",
            "type": "museum",
            "__typename": "SimpleEntity",
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "title",
                "value": "De Zesde Collectie",
                "label": "title",
                "immutable": null
              }
            ]
          },
          "key": "entities/84df5f81-6072-4ee7-b02f-9b705f69f292",
          "label": "Museum",
          "metadata": {},
          "relationType": "isIn"
        }
      ],
      "Testimony": []
    }
  },
];