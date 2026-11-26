window.PERF_RESULTS = [
  {
    "label": "baseline",
    "date": "2026-11-24T11:14:35.297Z",
    "client": "podiumnet",
    "commit": "e8326aa2+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/production/PR-000001",
    "profiles": {
      "local": {
        "reload": {
          "requests": 47,
          "persistedQueryMisses": 0,
          "entityMs": 857,
          "doneMs": 1795,
          "kb": 27
        },
        "listToDetail": {
          "requests": 43,
          "persistedQueryMisses": 0,
          "entityMs": 206,
          "doneMs": 1139,
          "kb": 26
        },
        "session": {
          "requests": 131,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 3572,
          "kb": 82
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 47,
          "persistedQueryMisses": 0,
          "entityMs": 1083,
          "doneMs": 2299,
          "kb": 27
        },
        "listToDetail": {
          "requests": 43,
          "persistedQueryMisses": 0,
          "entityMs": 315,
          "doneMs": 1671,
          "kb": 26
        },
        "session": {
          "requests": 131,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 4664,
          "kb": 82
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "getEntities": 4,
      "getPreviewComponents": 3,
      "GetFilterMatcherMapping": 1,
      "GetRelatedMediafilesWithTypePosterFilters": 1,
      "GetRelatedMediafilesWithTypeSceneImagesFilters": 1,
      "GetRelatedMediafilesWithTypeMusicFragmentsFilters": 1,
      "GetRelatedMediafilesWithTypeTrailerFilters": 1,
      "GetRelatedMediafilesWithTypeRiderFilters": 1,
      "GetRelatedMediafilesWithTypeReviewFilters": 1,
      "GetRelatedMediafilesWithTypeFramingFilters": 1,
      "GetRelatedMediafilesWithTypeSocialMediaFilters": 1,
      "GetVenueInProductionFilters": 1,
      "GetNotificationsInProductionFilters": 1,
      "GetBulkOperationsForPosterInProduction": 1,
      "GetSortOptions": 3,
      "GetBulkOperationsForSceneImagesInProduction": 1,
      "GetBulkOperationsForMusicFragmentsInProduction": 1,
      "GetBulkOperationsForTrailerInProduction": 1,
      "GetBulkOperationsForRiderInProduction": 1,
      "GetBulkOperationsForReviewInProduction": 1,
      "GetBulkOperationsForFramingInProduction": 1,
      "GetBulkOperationsForSocialMediaInProduction": 1,
      "GetBulkOperationsForVenueInProduction": 1,
      "GetBulkOperations": 1,
      "GetMediafilesInCompletenessOverview": 8,
      "GetVenuesInProduction": 1,
      "GetNotifications": 1,
      "GetEditNotificationStatusForm": 1
    }
  },
  {
    "label": "step 1 config cache",
    "date": "2026-11-24T11:30:44.210Z",
    "client": "podiumnet",
    "commit": "42874768+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/production/PR-000001",
    "profiles": {
      "local": {
        "reload": {
          "requests": 47,
          "persistedQueryMisses": 0,
          "entityMs": 611,
          "doneMs": 1607,
          "kb": 27
        },
        "listToDetail": {
          "requests": 42,
          "persistedQueryMisses": 0,
          "entityMs": 175,
          "doneMs": 1150,
          "kb": 25
        },
        "session": {
          "requests": 98,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 3300,
          "kb": 63
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 47,
          "persistedQueryMisses": 0,
          "entityMs": 1093,
          "doneMs": 2207,
          "kb": 27
        },
        "listToDetail": {
          "requests": 42,
          "persistedQueryMisses": 0,
          "entityMs": 294,
          "doneMs": 1581,
          "kb": 25
        },
        "session": {
          "requests": 98,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 4619,
          "kb": 63
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "getEntities": 4,
      "getPreviewComponents": 3,
      "GetRelatedMediafilesWithTypePosterFilters": 1,
      "GetRelatedMediafilesWithTypeSceneImagesFilters": 1,
      "GetRelatedMediafilesWithTypeMusicFragmentsFilters": 1,
      "GetRelatedMediafilesWithTypeTrailerFilters": 1,
      "GetRelatedMediafilesWithTypeRiderFilters": 1,
      "GetRelatedMediafilesWithTypeReviewFilters": 1,
      "GetRelatedMediafilesWithTypeFramingFilters": 1,
      "GetRelatedMediafilesWithTypeSocialMediaFilters": 1,
      "GetVenueInProductionFilters": 1,
      "GetNotificationsInProductionFilters": 1,
      "GetBulkOperationsForPosterInProduction": 1,
      "GetSortOptions": 3,
      "GetBulkOperationsForSceneImagesInProduction": 1,
      "GetBulkOperationsForMusicFragmentsInProduction": 1,
      "GetBulkOperationsForTrailerInProduction": 1,
      "GetBulkOperationsForRiderInProduction": 1,
      "GetBulkOperationsForReviewInProduction": 1,
      "GetBulkOperationsForFramingInProduction": 1,
      "GetBulkOperationsForSocialMediaInProduction": 1,
      "GetBulkOperationsForVenueInProduction": 1,
      "GetBulkOperations": 1,
      "GetMediafilesInCompletenessOverview": 8,
      "GetVenuesInProduction": 1,
      "GetNotifications": 1,
      "GetEditNotificationStatusForm": 1
    }
  },
  {
    "label": "step 2 parallel list setup",
    "date": "2026-11-24T11:43:42.815Z",
    "client": "podiumnet",
    "commit": "0a2d30c0+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/production/PR-000001",
    "profiles": {
      "local": {
        "reload": {
          "requests": 47,
          "persistedQueryMisses": 0,
          "entityMs": 826,
          "doneMs": 2028,
          "kb": 27
        },
        "listToDetail": {
          "requests": 42,
          "persistedQueryMisses": 0,
          "entityMs": 190,
          "doneMs": 1109,
          "kb": 25
        },
        "session": {
          "requests": 98,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 3250,
          "kb": 63
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 47,
          "persistedQueryMisses": 0,
          "entityMs": 1139,
          "doneMs": 2377,
          "kb": 27
        },
        "listToDetail": {
          "requests": 42,
          "persistedQueryMisses": 0,
          "entityMs": 284,
          "doneMs": 1387,
          "kb": 25
        },
        "session": {
          "requests": 98,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 4501,
          "kb": 63
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "getEntities": 4,
      "getPreviewComponents": 3,
      "GetBulkOperations": 1,
      "GetBulkOperationsForPosterInProduction": 1,
      "GetBulkOperationsForSceneImagesInProduction": 1,
      "GetBulkOperationsForMusicFragmentsInProduction": 1,
      "GetBulkOperationsForTrailerInProduction": 1,
      "GetBulkOperationsForRiderInProduction": 1,
      "GetBulkOperationsForReviewInProduction": 1,
      "GetBulkOperationsForFramingInProduction": 1,
      "GetBulkOperationsForSocialMediaInProduction": 1,
      "GetBulkOperationsForVenueInProduction": 1,
      "GetRelatedMediafilesWithTypePosterFilters": 1,
      "GetSortOptions": 3,
      "GetRelatedMediafilesWithTypeSceneImagesFilters": 1,
      "GetRelatedMediafilesWithTypeMusicFragmentsFilters": 1,
      "GetRelatedMediafilesWithTypeTrailerFilters": 1,
      "GetRelatedMediafilesWithTypeRiderFilters": 1,
      "GetRelatedMediafilesWithTypeReviewFilters": 1,
      "GetRelatedMediafilesWithTypeFramingFilters": 1,
      "GetRelatedMediafilesWithTypeSocialMediaFilters": 1,
      "GetVenueInProductionFilters": 1,
      "GetNotificationsInProductionFilters": 1,
      "GetMediafilesInCompletenessOverview": 8,
      "GetVenuesInProduction": 1,
      "GetNotifications": 1,
      "GetEditNotificationStatusForm": 1
    }
  },
  {
    "label": "step 3 lazy collapsed panels",
    "date": "2026-11-24T12:42:13.004Z",
    "client": "podiumnet",
    "commit": "1719f528+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/production/PR-000001",
    "profiles": {
      "local": {
        "reload": {
          "requests": 37,
          "persistedQueryMisses": 0,
          "entityMs": 660,
          "doneMs": 1620,
          "kb": 21
        },
        "listToDetail": {
          "requests": 32,
          "persistedQueryMisses": 0,
          "entityMs": 190,
          "doneMs": 985,
          "kb": 18
        },
        "session": {
          "requests": 72,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 3173,
          "kb": 43
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 37,
          "persistedQueryMisses": 0,
          "entityMs": 1155,
          "doneMs": 2067,
          "kb": 21
        },
        "listToDetail": {
          "requests": 32,
          "persistedQueryMisses": 0,
          "entityMs": 319,
          "doneMs": 1225,
          "kb": 18
        },
        "session": {
          "requests": 72,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 4097,
          "kb": 43
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetRelatedMediafilesWithTypePosterFilters": 1,
      "GetRelatedMediafilesWithTypeSceneImagesFilters": 1,
      "GetRelatedMediafilesWithTypeMusicFragmentsFilters": 1,
      "GetRelatedMediafilesWithTypeTrailerFilters": 1,
      "GetRelatedMediafilesWithTypeRiderFilters": 1,
      "GetRelatedMediafilesWithTypeReviewFilters": 1,
      "GetRelatedMediafilesWithTypeFramingFilters": 1,
      "GetRelatedMediafilesWithTypeSocialMediaFilters": 1,
      "getEntities": 4,
      "getPreviewComponents": 2,
      "GetBulkOperations": 1,
      "GetBulkOperationsForVenueInProduction": 1,
      "GetVenueInProductionFilters": 1,
      "GetSortOptions": 2,
      "GetNotificationsInProductionFilters": 1,
      "GetEntitiesCount": 8,
      "GetVenuesInProduction": 1,
      "GetNotifications": 1,
      "GetEditNotificationStatusForm": 1
    }
  },
  {
    "label": "layout cache",
    "date": "2026-11-24T14:04:28.593Z",
    "client": "podiumnet",
    "commit": "78af2ae8+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/production/PR-000001",
    "profiles": {
      "local": {
        "reload": {
          "requests": 37,
          "persistedQueryMisses": 0,
          "entityMs": 640,
          "doneMs": 1550,
          "kb": 21
        },
        "listToDetail": {
          "requests": 32,
          "persistedQueryMisses": 0,
          "entityMs": 160,
          "doneMs": 958,
          "kb": 18
        },
        "session": {
          "requests": 72,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 3015,
          "kb": 37
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 37,
          "persistedQueryMisses": 0,
          "entityMs": 1161,
          "doneMs": 2242,
          "kb": 21
        },
        "listToDetail": {
          "requests": 32,
          "persistedQueryMisses": 0,
          "entityMs": 281,
          "doneMs": 1309,
          "kb": 18
        },
        "session": {
          "requests": 72,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 3896,
          "kb": 37
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetRelatedMediafilesWithTypePosterFilters": 1,
      "GetRelatedMediafilesWithTypeSceneImagesFilters": 1,
      "GetRelatedMediafilesWithTypeMusicFragmentsFilters": 1,
      "GetRelatedMediafilesWithTypeTrailerFilters": 1,
      "GetRelatedMediafilesWithTypeRiderFilters": 1,
      "GetRelatedMediafilesWithTypeReviewFilters": 1,
      "GetRelatedMediafilesWithTypeFramingFilters": 1,
      "GetRelatedMediafilesWithTypeSocialMediaFilters": 1,
      "getEntities": 4,
      "getPreviewComponents": 2,
      "GetBulkOperations": 1,
      "GetBulkOperationsForVenueInProduction": 1,
      "GetVenueInProductionFilters": 1,
      "GetSortOptions": 2,
      "GetNotificationsInProductionFilters": 1,
      "GetEntitiesCount": 8,
      "GetVenuesInProduction": 1,
      "GetNotifications": 1,
      "GetEditNotificationStatusForm": 1
    }
  },
  {
    "label": "relation labels with entity",
    "date": "2026-11-24T14:36:19.291Z",
    "client": "podiumnet",
    "commit": "fb8f574d+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/production/PR-000001",
    "profiles": {
      "local": {
        "reload": {
          "requests": 33,
          "persistedQueryMisses": 0,
          "entityMs": 809,
          "doneMs": 1646,
          "kb": 18
        },
        "listToDetail": {
          "requests": 28,
          "persistedQueryMisses": 0,
          "entityMs": 271,
          "doneMs": 1054,
          "kb": 16
        },
        "session": {
          "requests": 60,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 3082,
          "kb": 31
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 33,
          "persistedQueryMisses": 0,
          "entityMs": 1247,
          "doneMs": 2191,
          "kb": 18
        },
        "listToDetail": {
          "requests": 28,
          "persistedQueryMisses": 0,
          "entityMs": 402,
          "doneMs": 1439,
          "kb": 16
        },
        "session": {
          "requests": 60,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 4090,
          "kb": 31
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetRelatedMediafilesWithTypePosterFilters": 1,
      "GetRelatedMediafilesWithTypeSceneImagesFilters": 1,
      "GetRelatedMediafilesWithTypeMusicFragmentsFilters": 1,
      "GetRelatedMediafilesWithTypeTrailerFilters": 1,
      "GetRelatedMediafilesWithTypeRiderFilters": 1,
      "GetRelatedMediafilesWithTypeReviewFilters": 1,
      "GetRelatedMediafilesWithTypeFramingFilters": 1,
      "GetRelatedMediafilesWithTypeSocialMediaFilters": 1,
      "getPreviewComponents": 2,
      "GetBulkOperations": 1,
      "GetBulkOperationsForVenueInProduction": 1,
      "GetVenueInProductionFilters": 1,
      "GetSortOptions": 2,
      "GetNotificationsInProductionFilters": 1,
      "GetEntitiesCount": 8,
      "GetVenuesInProduction": 1,
      "GetNotifications": 1,
      "GetEditNotificationStatusForm": 1
    }
  },
  {
    "label": "aicap baseline",
    "date": "2026-11-25T10:39:08.398Z",
    "client": "ugent-aicap",
    "commit": "42874768+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/inscriptions/AICAP0001_001MAr01",
    "profiles": {
      "local": {
        "reload": {
          "requests": 37,
          "persistedQueryMisses": 0,
          "entityMs": 1272,
          "doneMs": 2589,
          "kb": 30
        },
        "listToDetail": {
          "requests": 32,
          "persistedQueryMisses": 0,
          "entityMs": 561,
          "doneMs": 1474,
          "kb": 27
        },
        "session": {
          "requests": 101,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 6080,
          "kb": 100
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 37,
          "persistedQueryMisses": 0,
          "entityMs": 1449,
          "doneMs": 2560,
          "kb": 30
        },
        "listToDetail": {
          "requests": 32,
          "persistedQueryMisses": 0,
          "entityMs": 553,
          "doneMs": 1738,
          "kb": 27
        },
        "session": {
          "requests": 101,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 7892,
          "kb": 100
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetEntities": 11,
      "GetEntityForHierarchy": 4,
      "getPreviewComponents": 3,
      "GetFilterMatcherMapping": 1,
      "GetInscriptionRefMediafilesFilter": 1,
      "GetInscriptionRefMultilingualCounterpartsFilter": 1,
      "GetInscriptionRefWordsFilter": 1,
      "GetInscriptionRefMediafilesBulkOperations": 1,
      "GetSortOptions": 3,
      "GetInscriptionRefMultilingualCounterpartsBulkOperations": 1,
      "GetInscriptionRefWordsBulkOperations": 1,
      "GetInscriptionRefs": 1,
      "GetMediafilesInEntity": 1,
      "GetBulkOperations": 1
    }
  },
  {
    "label": "aicap all steps (option C)",
    "date": "2026-11-25T10:46:25.217Z",
    "client": "ugent-aicap",
    "commit": "0425d34e+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/inscriptions/AICAP0001_001MAr01",
    "profiles": {
      "local": {
        "reload": {
          "requests": 37,
          "persistedQueryMisses": 0,
          "entityMs": 1940,
          "doneMs": 3774,
          "kb": 29
        },
        "listToDetail": {
          "requests": 30,
          "persistedQueryMisses": 0,
          "entityMs": 658,
          "doneMs": 1957,
          "kb": 27
        },
        "session": {
          "requests": 79,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 10943,
          "kb": 94
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 37,
          "persistedQueryMisses": 0,
          "entityMs": 1638,
          "doneMs": 2907,
          "kb": 29
        },
        "listToDetail": {
          "requests": 30,
          "persistedQueryMisses": 0,
          "entityMs": 499,
          "doneMs": 1892,
          "kb": 27
        },
        "session": {
          "requests": 80,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 8093,
          "kb": 95
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetEntities": 11,
      "getPreviewComponents": 3,
      "GetEntityForHierarchy": 4,
      "GetInscriptionRefMediafilesBulkOperations": 1,
      "GetInscriptionRefMultilingualCounterpartsBulkOperations": 1,
      "GetInscriptionRefWordsBulkOperations": 1,
      "GetInscriptionRefMediafilesFilter": 1,
      "GetSortOptions": 2,
      "GetInscriptionRefMultilingualCounterpartsFilter": 1,
      "GetInscriptionRefWordsFilter": 1,
      "GetMediafilesInEntity": 1,
      "GetInscriptionRefs": 1,
      "GetBulkOperations": 1
    }
  },
  {
    "label": "aicap all steps (option C, entityType fix)",
    "date": "2026-11-25T10:55:16.027Z",
    "client": "ugent-aicap",
    "commit": "0425d34e+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/inscriptions/AICAP0001_001MAr01",
    "profiles": {
      "local": {
        "reload": {
          "requests": 29,
          "persistedQueryMisses": 0,
          "entityMs": 1246,
          "doneMs": 2476,
          "kb": 26
        },
        "listToDetail": {
          "requests": 22,
          "persistedQueryMisses": 0,
          "entityMs": 594,
          "doneMs": 1641,
          "kb": 24
        },
        "session": {
          "requests": 52,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 5807,
          "kb": 82
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 29,
          "persistedQueryMisses": 0,
          "entityMs": 1899,
          "doneMs": 3023,
          "kb": 26
        },
        "listToDetail": {
          "requests": 22,
          "persistedQueryMisses": 0,
          "entityMs": 654,
          "doneMs": 1715,
          "kb": 24
        },
        "session": {
          "requests": 52,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 7496,
          "kb": 82
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "getPreviewComponents": 3,
      "GetEntityForHierarchy": 4,
      "GetInscriptionRefMediafilesBulkOperations": 1,
      "GetInscriptionRefMultilingualCounterpartsBulkOperations": 1,
      "GetInscriptionRefWordsBulkOperations": 1,
      "GetInscriptionRefMediafilesFilter": 1,
      "GetSortOptions": 2,
      "GetInscriptionRefMultilingualCounterpartsFilter": 1,
      "GetInscriptionRefWordsFilter": 1,
      "GetEntities": 2,
      "GetMediafilesInEntity": 1,
      "GetInscriptionRefs": 1,
      "GetMetadataPreviewForMediafile": 1,
      "GetBulkOperations": 1
    }
  },
  {
    "label": "aicap branch, more relations",
    "date": "2026-11-25T11:31:05.518Z",
    "client": "ugent-aicap",
    "commit": "0425d34e+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/inscriptions/AICAP0001_001MAr01",
    "profiles": {
      "local": {
        "reload": {
          "requests": 22,
          "persistedQueryMisses": 0,
          "entityMs": 1501,
          "doneMs": 2608,
          "kb": 18
        },
        "listToDetail": {
          "requests": 15,
          "persistedQueryMisses": 0,
          "entityMs": 667,
          "doneMs": 1633,
          "kb": 15
        },
        "session": {
          "requests": 41,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 6716,
          "kb": 66
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 22,
          "persistedQueryMisses": 0,
          "entityMs": 2081,
          "doneMs": 3105,
          "kb": 18
        },
        "listToDetail": {
          "requests": 15,
          "persistedQueryMisses": 0,
          "entityMs": 646,
          "doneMs": 1611,
          "kb": 15
        },
        "session": {
          "requests": 41,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 8529,
          "kb": 66
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "getPreviewComponents": 2,
      "GetInscriptionRefMediafilesBulkOperations": 1,
      "GetInscriptionRefMultilingualCounterpartsBulkOperations": 1,
      "GetInscriptionRefWordsBulkOperations": 1,
      "GetInscriptionRefMediafilesFilter": 1,
      "GetSortOptions": 2,
      "GetInscriptionRefMultilingualCounterpartsFilter": 1,
      "GetInscriptionRefWordsFilter": 1,
      "GetEntities": 2,
      "GetMediafilesInEntity": 1,
      "GetInscriptionRefs": 1
    }
  },
  {
    "label": "baseline",
    "date": "2026-11-24T11:14:35.297Z",
    "client": "podiumnet",
    "commit": "e8326aa2+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/production/PR-000001",
    "profiles": {
      "local": {
        "reload": {
          "requests": 47,
          "persistedQueryMisses": 0,
          "entityMs": 857,
          "doneMs": 1795,
          "kb": 27
        },
        "listToDetail": {
          "requests": 43,
          "persistedQueryMisses": 0,
          "entityMs": 206,
          "doneMs": 1139,
          "kb": 26
        },
        "session": {
          "requests": 131,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 3572,
          "kb": 82
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 47,
          "persistedQueryMisses": 0,
          "entityMs": 1083,
          "doneMs": 2299,
          "kb": 27
        },
        "listToDetail": {
          "requests": 43,
          "persistedQueryMisses": 0,
          "entityMs": 315,
          "doneMs": 1671,
          "kb": 26
        },
        "session": {
          "requests": 131,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 4664,
          "kb": 82
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "getEntities": 4,
      "getPreviewComponents": 3,
      "GetFilterMatcherMapping": 1,
      "GetRelatedMediafilesWithTypePosterFilters": 1,
      "GetRelatedMediafilesWithTypeSceneImagesFilters": 1,
      "GetRelatedMediafilesWithTypeMusicFragmentsFilters": 1,
      "GetRelatedMediafilesWithTypeTrailerFilters": 1,
      "GetRelatedMediafilesWithTypeRiderFilters": 1,
      "GetRelatedMediafilesWithTypeReviewFilters": 1,
      "GetRelatedMediafilesWithTypeFramingFilters": 1,
      "GetRelatedMediafilesWithTypeSocialMediaFilters": 1,
      "GetVenueInProductionFilters": 1,
      "GetNotificationsInProductionFilters": 1,
      "GetBulkOperationsForPosterInProduction": 1,
      "GetSortOptions": 3,
      "GetBulkOperationsForSceneImagesInProduction": 1,
      "GetBulkOperationsForMusicFragmentsInProduction": 1,
      "GetBulkOperationsForTrailerInProduction": 1,
      "GetBulkOperationsForRiderInProduction": 1,
      "GetBulkOperationsForReviewInProduction": 1,
      "GetBulkOperationsForFramingInProduction": 1,
      "GetBulkOperationsForSocialMediaInProduction": 1,
      "GetBulkOperationsForVenueInProduction": 1,
      "GetBulkOperations": 1,
      "GetMediafilesInCompletenessOverview": 8,
      "GetVenuesInProduction": 1,
      "GetNotifications": 1,
      "GetEditNotificationStatusForm": 1
    }
  },
  {
    "label": "aicap baseline, more relations",
    "date": "2026-11-25T11:39:04.839Z",
    "client": "ugent-aicap",
    "commit": "42874768+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/inscriptions/AICAP0001_001MAr01",
    "profiles": {
      "local": {
        "reload": {
          "requests": 31,
          "persistedQueryMisses": 0,
          "entityMs": 1165,
          "doneMs": 2083,
          "kb": 24
        },
        "listToDetail": {
          "requests": 26,
          "persistedQueryMisses": 0,
          "entityMs": 463,
          "doneMs": 1542,
          "kb": 22
        },
        "session": {
          "requests": 91,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 5904,
          "kb": 89
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 31,
          "persistedQueryMisses": 0,
          "entityMs": 1740,
          "doneMs": 3030,
          "kb": 24
        },
        "listToDetail": {
          "requests": 26,
          "persistedQueryMisses": 0,
          "entityMs": 575,
          "doneMs": 1995,
          "kb": 22
        },
        "session": {
          "requests": 91,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 7366,
          "kb": 89
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetEntities": 11,
      "getPreviewComponents": 2,
      "GetFilterMatcherMapping": 1,
      "GetInscriptionRefMediafilesFilter": 1,
      "GetInscriptionRefMultilingualCounterpartsFilter": 1,
      "GetInscriptionRefWordsFilter": 1,
      "GetInscriptionRefMediafilesBulkOperations": 1,
      "GetSortOptions": 3,
      "GetInscriptionRefMultilingualCounterpartsBulkOperations": 1,
      "GetInscriptionRefWordsBulkOperations": 1,
      "GetMediafilesInEntity": 1,
      "GetInscriptionRefs": 1
    }
  },
  {
    "label": "aicap option 3 (labels query alongside entity)",
    "date": "2026-11-25T11:59:24.676Z",
    "client": "ugent-aicap",
    "commit": "0425d34e+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/inscriptions/AICAP0001_001MAr01",
    "profiles": {
      "local": {
        "reload": {
          "requests": 23,
          "persistedQueryMisses": 0,
          "entityMs": 1716,
          "doneMs": 2589,
          "kb": 19
        },
        "listToDetail": {
          "requests": 16,
          "persistedQueryMisses": 0,
          "entityMs": 653,
          "doneMs": 1436,
          "kb": 16
        },
        "session": {
          "requests": 44,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 6115,
          "kb": 69
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 23,
          "persistedQueryMisses": 0,
          "entityMs": 1740,
          "doneMs": 2800,
          "kb": 19
        },
        "listToDetail": {
          "requests": 16,
          "persistedQueryMisses": 0,
          "entityMs": 726,
          "doneMs": 1923,
          "kb": 16
        },
        "session": {
          "requests": 44,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 7971,
          "kb": 69
        }
      }
    },
    "operations": {
      "getEntityByIdSelectedOptions": 1,
      "getEntityById": 1,
      "getPreviewComponents": 2,
      "GetInscriptionRefMediafilesBulkOperations": 1,
      "GetInscriptionRefMultilingualCounterpartsBulkOperations": 1,
      "GetInscriptionRefWordsBulkOperations": 1,
      "GetInscriptionRefMediafilesFilter": 1,
      "GetSortOptions": 2,
      "GetInscriptionRefMultilingualCounterpartsFilter": 1,
      "GetInscriptionRefWordsFilter": 1,
      "GetEntities": 2,
      "GetInscriptionRefs": 1,
      "GetMediafilesInEntity": 1
    }
  },
  {
    "label": "vlacc expressions: branch",
    "date": "2026-11-25T15:08:13.802Z",
    "client": "vlacc-dams",
    "commit": "35c993f1+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/easy_reading/E-O6GURG70AS",
    "profiles": {
      "local": {
        "reload": {
          "requests": 45,
          "persistedQueryMisses": 0,
          "entityMs": 1897,
          "doneMs": 3125,
          "kb": 22
        },
        "listToDetail": {
          "requests": 38,
          "persistedQueryMisses": 0,
          "entityMs": 516,
          "doneMs": 1287,
          "kb": 16
        },
        "session": {
          "requests": 78,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 5432,
          "kb": 35
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 45,
          "persistedQueryMisses": 0,
          "entityMs": 2068,
          "doneMs": 3264,
          "kb": 22
        },
        "listToDetail": {
          "requests": 38,
          "persistedQueryMisses": 0,
          "entityMs": 679,
          "doneMs": 1789,
          "kb": 16
        },
        "session": {
          "requests": 78,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 5720,
          "kb": 35
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetCommentsPage": 2,
      "getEntities": 4,
      "getPreviewComponents": 6,
      "GetEmptyBulkOperations": 1,
      "GetBulkOperationsForAuthorsInExpression": 1,
      "GetBulkOperationsForFormGenresInExpression": 1,
      "GetBulkOperationsForAwardsInEntity": 1,
      "GetEntityHistoryVersionListBulkOperations": 1,
      "GetBulkOperationsForManifestationsInExpression": 1,
      "GetBulkOperationsForOmnibusInExpression": 1,
      "GetWorkAuthorsInDetailFilters": 1,
      "GetAuthorsInDetailFilters": 1,
      "GetFormGenresInExpressionFilters": 1,
      "GetAwardsInEntityFilters": 1,
      "GetEntityHistoryVersionListFilters": 1,
      "GetWorkInExpressionFilters": 1,
      "GetSortOptions": 2,
      "GetManifestationsInExpressionFilters": 1,
      "GetOmnibusInExpressionsFilters": 1,
      "GetAuthorsInExpression": 1,
      "GetParentAuthorsInDetail": 1,
      "GetGenres": 1,
      "GetAwardsInDetail": 1,
      "GetEntityHistoryVersionList": 1,
      "GetWorksInExpression": 1,
      "GetManifestations": 1,
      "GetManifestationsAsOmnibus": 1
    }
  },
  {
    "label": "vlacc manifestations: branch",
    "date": "2026-11-25T15:13:24.083Z",
    "client": "vlacc-dams",
    "commit": "35c993f1+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/manifestation_music/M-84IS671O66",
    "profiles": {
      "local": {
        "reload": {
          "requests": 29,
          "persistedQueryMisses": 0,
          "entityMs": 1575,
          "doneMs": 2172,
          "kb": 17
        },
        "listToDetail": {
          "requests": 22,
          "persistedQueryMisses": 0,
          "entityMs": 598,
          "doneMs": 1247,
          "kb": 11
        },
        "session": {
          "requests": 55,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 5227,
          "kb": 38
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 29,
          "persistedQueryMisses": 0,
          "entityMs": 2132,
          "doneMs": 2955,
          "kb": 17
        },
        "listToDetail": {
          "requests": 22,
          "persistedQueryMisses": 0,
          "entityMs": 733,
          "doneMs": 1561,
          "kb": 11
        },
        "session": {
          "requests": 55,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 5922,
          "kb": 38
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetCommentsPage": 2,
      "getEntities": 7,
      "getPreviewComponents": 3,
      "GetEmptyBulkOperations": 1,
      "GetEntityHistoryVersionListBulkOperations": 1,
      "GetMoveExpressionBulkOperations": 1,
      "GetEntityHistoryVersionListFilters": 1,
      "GetExpressionInManifestationFilters": 1,
      "GetSortOptions": 2,
      "GetEntityHistoryVersionList": 1,
      "GetExpressions": 1
    }
  },
  {
    "label": "vlacc expressions: baseline",
    "date": "2026-11-25T15:22:52.100Z",
    "client": "vlacc-dams",
    "commit": "35c993f1+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/easy_reading/E-O6GURG70AS",
    "profiles": {
      "local": {
        "reload": {
          "requests": 45,
          "persistedQueryMisses": 0,
          "entityMs": 2626,
          "doneMs": 3717,
          "kb": 22
        },
        "listToDetail": {
          "requests": 41,
          "persistedQueryMisses": 0,
          "entityMs": 1191,
          "doneMs": 2227,
          "kb": 19
        },
        "session": {
          "requests": 129,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 7856,
          "kb": 69
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 45,
          "persistedQueryMisses": 0,
          "entityMs": 2566,
          "doneMs": 3487,
          "kb": 22
        },
        "listToDetail": {
          "requests": 41,
          "persistedQueryMisses": 0,
          "entityMs": 1147,
          "doneMs": 2076,
          "kb": 19
        },
        "session": {
          "requests": 129,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 8225,
          "kb": 69
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetAdvancedFiltersForMyCommentsPage": 1,
      "GetAdvancedFiltersForMyTaggedCommentsPage": 1,
      "GetCommentsPage": 2,
      "getEntities": 4,
      "getPreviewComponents": 6,
      "GetFilterMatcherMapping": 1,
      "GetWorkAuthorsInDetailFilters": 1,
      "GetAuthorsInDetailFilters": 1,
      "GetFormGenresInExpressionFilters": 1,
      "GetAwardsInEntityFilters": 1,
      "GetEntityHistoryVersionListFilters": 1,
      "GetWorkInExpressionFilters": 1,
      "GetManifestationsInExpressionFilters": 1,
      "GetOmnibusInExpressionsFilters": 1,
      "GetEmptyBulkOperations": 1,
      "GetBulkOperationsForAuthorsInExpression": 1,
      "GetBulkOperationsForFormGenresInExpression": 1,
      "GetBulkOperationsForAwardsInEntity": 1,
      "GetEntityHistoryVersionListBulkOperations": 1,
      "GetSortOptions": 2,
      "GetBulkOperationsForManifestationsInExpression": 1,
      "GetBulkOperationsForOmnibusInExpression": 1,
      "GetParentAuthorsInDetail": 1,
      "GetGenres": 1,
      "GetAuthorsInExpression": 1,
      "GetWorksInExpression": 1,
      "GetEntityHistoryVersionList": 1,
      "GetAwardsInDetail": 1,
      "GetManifestationsAsOmnibus": 1,
      "GetManifestations": 1
    }
  },
  {
    "label": "vlacc manifestations: baseline",
    "date": "2026-11-25T15:33:39.338Z",
    "client": "vlacc-dams",
    "commit": "35c993f1+changes",
    "frontend": "built",
    "runs": 5,
    "detailPath": "/manifestation_music/M-84IS671O66",
    "profiles": {
      "local": {
        "reload": {
          "requests": 50,
          "persistedQueryMisses": 0,
          "entityMs": 1847,
          "doneMs": 3132,
          "kb": 23
        },
        "listToDetail": {
          "requests": 46,
          "persistedQueryMisses": 0,
          "entityMs": 945,
          "doneMs": 1691,
          "kb": 20
        },
        "session": {
          "requests": 141,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 7260,
          "kb": 76
        }
      },
      "100ms latency": {
        "reload": {
          "requests": 50,
          "persistedQueryMisses": 0,
          "entityMs": 15463,
          "doneMs": 17060,
          "kb": 23
        },
        "listToDetail": {
          "requests": 46,
          "persistedQueryMisses": 0,
          "entityMs": 1041,
          "doneMs": 2402,
          "kb": 20
        },
        "session": {
          "requests": 141,
          "persistedQueryMisses": 0,
          "entityMs": 0,
          "doneMs": 10188,
          "kb": 76
        }
      }
    },
    "operations": {
      "getEntityById": 1,
      "GetAdvancedFiltersForMyCommentsPage": 1,
      "GetAdvancedFiltersForMyTaggedCommentsPage": 1,
      "GetCommentsPage": 2,
      "getEntities": 7,
      "getPreviewComponents": 7,
      "GetFilterMatcherMapping": 1,
      "GetWorkAuthorsInDetailFilters": 1,
      "GetExpressionAuthorsInDetailFilters": 1,
      "GetAuthorsInDetailFilters": 1,
      "GetFlemishMusicClassificationInDetailFilters": 1,
      "GetGenresInManifestationFilters": 1,
      "GetSerieInDetailFilters": 1,
      "GetParentSerieInDetailFilters": 1,
      "GetEntityHistoryVersionListFilters": 1,
      "GetExpressionInManifestationFilters": 1,
      "GetEmptyBulkOperations": 1,
      "GetBulkOperationsForAuthorsInManifestation": 1,
      "GetBulkOperationsForCodeWordingsInWork": 1,
      "GetBulkOperationsForGenresInManifestation": 1,
      "GetBulkOperationsForSerieInDetail": 1,
      "GetEntityHistoryVersionListBulkOperations": 1,
      "GetMoveExpressionBulkOperations": 1,
      "GetSortOptions": 2,
      "GetParentAuthorsInDetail": 1,
      "GetParentSerieInDetail": 1,
      "GetCodeWordings": 1,
      "GetAuthorsInManifestationMusic": 1,
      "GetSerieInManifestationDetail": 1,
      "GetGenres": 1,
      "GetEntityHistoryVersionList": 1,
      "GetExpressions": 1
    }
  }
];
