type dataSet = {
  form: any
  dataInput: any
  expectedResult: any
}

export const dataSetBuildInitialValues: dataSet[] = [
  {
    form: { "fields": [{ "__typename": "MetadataField", "label": "Titel", "key": "title", "type": "text", "options": null }, { "__typename": "RelationField", "label": "subtitle", "relationType": "components", "disabled": null, "metadata": null, "acceptedEntityTypes": ["MediaFile"] }, { "__typename": "RelationField", "label": "audio", "relationType": "components", "disabled": null, "metadata": null, "acceptedEntityTypes": ["MediaFile"] }, { "__typename": "RelationField", "label": "Assets", "relationType": "components", "disabled": false, "metadata": [{ "key": "timestamp_start", "type": "number", "label": "Start asset", "__typename": "MetadataField" }, { "key": "timestamp_end", "type": "number", "label": "Stop asset", "__typename": "MetadataField" }, { "key": "timestamp_zoom", "type": "number", "label": "Zoom asset", "__typename": "MetadataField" }, { "key": "x", "type": "number", "label": "Positie X", "__typename": "MetadataField" }, { "key": "y", "type": "number", "label": "Positie Y", "__typename": "MetadataField" }, { "key": "z", "type": "number", "label": "Positie Z", "__typename": "MetadataField" }, { "key": "scale", "type": "number", "label": "Schaal", "__typename": "MetadataField" }, { "key": "setMediafile", "type": "number", "label": "Mediafile Index", "__typename": "MetadataField" }], "acceptedEntityTypes": ["asset"] }], "__typename": "Form" },
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
            "primaryMediafile": null,
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
            "primaryMediafile": null,
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
        "key": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
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
          "id": "fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
          "uuid": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
          "type": "asset",
          "__typename": "Asset",
          "media": {
            "primaryMediafile": null,
            "__typename": "Media"
          },
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "title",
              "value": "ricardo-asset-1",
              "label": "ricardo-asset-1",
              "immutable": null
            }
          ]
        }
      }
    ],
    expectedResult: {
      "title": "ricardo-frame-500",
      "subtitle": [
        {
          "linkedEntity": {
            "id": "29d6bac2-36d8-4a48-8701-f2fc88e172c4",
            "uuid": "mediafiles/29d6bac2-36d8-4a48-8701-f2fc88e172c4",
            "type": "MediaFile",
            "__typename": "MediaFileEntity",
            "media": {
              "primaryMediafile": null,
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
              "primaryMediafile": null,
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
            "id": "fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
            "uuid": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
            "type": "asset",
            "__typename": "Asset",
            "media": {
              "primaryMediafile": null,
              "__typename": "Media"
            },
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "title",
                "value": "ricardo-asset-1",
                "label": "ricardo-asset-1",
                "immutable": null
              }
            ]
          },
          "key": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
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
    form: { "fields": [{ "__typename": "MetadataField", "label": "Titel", "key": "title", "type": "text", "options": null }, { "__typename": "RelationField", "label": "subtitle", "relationType": "components", "disabled": null, "metadata": null, "acceptedEntityTypes": ["MediaFile"] }, { "__typename": "RelationField", "label": "audio", "relationType": "components", "disabled": null, "metadata": null, "acceptedEntityTypes": ["MediaFile"] }, { "__typename": "RelationField", "label": "Assets", "relationType": "components", "disabled": false, "metadata": [{ "key": "timestamp_start", "type": "number", "label": "Start asset", "__typename": "MetadataField" }, { "key": "timestamp_end", "type": "number", "label": "Stop asset", "__typename": "MetadataField" }, { "key": "timestamp_zoom", "type": "number", "label": "Zoom asset", "__typename": "MetadataField" }, { "key": "x", "type": "number", "label": "Positie X", "__typename": "MetadataField" }, { "key": "y", "type": "number", "label": "Positie Y", "__typename": "MetadataField" }, { "key": "z", "type": "number", "label": "Positie Z", "__typename": "MetadataField" }, { "key": "scale", "type": "number", "label": "Schaal", "__typename": "MetadataField" }, { "key": "setMediafile", "type": "number", "label": "Mediafile Index", "__typename": "MetadataField" }], "acceptedEntityTypes": ["asset"] }, { "__typename": "RelationField", "label": "movie", "relationType": "components", "disabled": null, "metadata": null, "acceptedEntityTypes": ["MediaFile"] }], "__typename": "Form" },
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
            "primaryMediafile": null,
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
            "primaryMediafile": null,
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
        "key": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
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
          "id": "fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
          "uuid": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
          "type": "asset",
          "__typename": "Asset",
          "media": {
            "primaryMediafile": null,
            "__typename": "Media"
          },
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "title",
              "value": "ricardo-asset-1",
              "label": "ricardo-asset-1",
              "immutable": null
            }
          ]
        }
      },
      {
        "__typename": "MetadataRelation",
        "key": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c03",
        "value": "",
        "label": "movie",
        "type": "components",
        "metadataOnRelation": [],
        "linkedEntity": {
          "id": "3dd088e1-e39a-4460-913f-5e8671572c03",
          "uuid": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c03",
          "type": "MediaFile",
          "__typename": "MediaFileEntity",
          "media": {
            "primaryMediafile": null,
            "__typename": "Media"
          },
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "filename",
              "value": "2b4ec9e3a6e259d58b7eae24eda56edd-some random movie.mp4",
              "label": "filename",
              "immutable": null
            }
          ]
        }
      },
    ],
    expectedResult: {
      "title": "ricardo-frame-500",
      "subtitle": [
        {
          "linkedEntity": {
            "id": "29d6bac2-36d8-4a48-8701-f2fc88e172c4",
            "uuid": "mediafiles/29d6bac2-36d8-4a48-8701-f2fc88e172c4",
            "type": "MediaFile",
            "__typename": "MediaFileEntity",
            "media": {
              "primaryMediafile": null,
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
              "primaryMediafile": null,
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
            "id": "fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
            "uuid": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
            "type": "asset",
            "__typename": "Asset",
            "media": {
              "primaryMediafile": null,
              "__typename": "Media"
            },
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "title",
                "value": "ricardo-asset-1",
                "label": "ricardo-asset-1",
                "immutable": null
              }
            ]
          },
          "key": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
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
      ],
      "movie": [
        {
          "linkedEntity": {
            "id": "3dd088e1-e39a-4460-913f-5e8671572c03",
            "uuid": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c03",
            "type": "MediaFile",
            "__typename": "MediaFileEntity",
            "media": {
              "primaryMediafile": null,
              "__typename": "Media"
            },
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "filename",
                "value": "2b4ec9e3a6e259d58b7eae24eda56edd-some random movie.mp4",
                "label": "filename",
                "immutable": null
              }
            ]
          },
          "key": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c03",
          "label": "movie",
          "metadata": {},
          "relationType": "components"
        }
      ],
    }
  },
  {
    form: { "fields": [{ "__typename": "MetadataField", "label": "Titel", "key": "title", "type": "text", "options": null }, { "__typename": "RelationField", "label": "subtitle", "relationType": "components", "disabled": null, "metadata": null, "acceptedEntityTypes": ["MediaFile"] }, { "__typename": "RelationField", "label": "audio", "relationType": "components", "disabled": null, "metadata": null, "acceptedEntityTypes": ["MediaFile"] }, { "__typename": "RelationField", "label": "Assets", "relationType": "components", "disabled": false, "metadata": [{ "key": "timestamp_start", "type": "number", "label": "Start asset", "__typename": "MetadataField" }, { "key": "timestamp_end", "type": "number", "label": "Stop asset", "__typename": "MetadataField" }, { "key": "timestamp_zoom", "type": "number", "label": "Zoom asset", "__typename": "MetadataField" }, { "key": "x", "type": "number", "label": "Positie X", "__typename": "MetadataField" }, { "key": "y", "type": "number", "label": "Positie Y", "__typename": "MetadataField" }, { "key": "z", "type": "number", "label": "Positie Z", "__typename": "MetadataField" }, { "key": "scale", "type": "number", "label": "Schaal", "__typename": "MetadataField" }, { "key": "setMediafile", "type": "number", "label": "Mediafile Index", "__typename": "MetadataField" }], "acceptedEntityTypes": ["asset"] }], "__typename": "Form" },
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
            "primaryMediafile": null,
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
            "primaryMediafile": null,
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
        "key": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
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
          "id": "fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
          "uuid": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
          "type": "asset",
          "__typename": "Asset",
          "media": {
            "primaryMediafile": null,
            "__typename": "Media"
          },
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "title",
              "value": "ricardo-asset-1",
              "label": "ricardo-asset-1",
              "immutable": null
            }
          ]
        }
      },
      {
        "__typename": "MetadataRelation",
        "key": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c03",
        "value": "",
        "label": "movie",
        "type": "components",
        "metadataOnRelation": [],
        "linkedEntity": {
          "id": "3dd088e1-e39a-4460-913f-5e8671572c03",
          "uuid": "mediafiles/3dd088e1-e39a-4460-913f-5e8671572c03",
          "type": "MediaFile",
          "__typename": "MediaFileEntity",
          "media": {
            "primaryMediafile": null,
            "__typename": "Media"
          },
          "teaserMetadata": [
            {
              "__typename": "Metadata",
              "key": "filename",
              "value": "2b4ec9e3a6e259d58b7eae24eda56edd-some random movie.mp4",
              "label": "filename",
              "immutable": null
            }
          ]
        }
      },
    ],
    expectedResult: {
      "title": "ricardo-frame-500",
      "subtitle": [
        {
          "linkedEntity": {
            "id": "29d6bac2-36d8-4a48-8701-f2fc88e172c4",
            "uuid": "mediafiles/29d6bac2-36d8-4a48-8701-f2fc88e172c4",
            "type": "MediaFile",
            "__typename": "MediaFileEntity",
            "media": {
              "primaryMediafile": null,
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
              "primaryMediafile": null,
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
            "id": "fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
            "uuid": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
            "type": "asset",
            "__typename": "Asset",
            "media": {
              "primaryMediafile": null,
              "__typename": "Media"
            },
            "teaserMetadata": [
              {
                "__typename": "Metadata",
                "key": "title",
                "value": "ricardo-asset-1",
                "label": "ricardo-asset-1",
                "immutable": null
              }
            ]
          },
          "key": "entities/fb8b3c39-a138-4aaa-a1a9-aeed5da1f2ca",
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
      ],
    }
  }
];