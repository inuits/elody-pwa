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
  }
];
