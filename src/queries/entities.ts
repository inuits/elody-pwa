import gql from 'graphql-tag'

export type metadata = {
  key: string
  value: string
}

export type mediafiles = {
  location: string
}

export type damsEntityList = {
  id: string
  type: string
  metadata: metadata[]
}

export type damsEntity = {
  id: string
  type: string
  title: {
    value: string
  }[]
  metadata: metadata[]
  mediafiles: mediafiles[]
}

//Get entitys for list view
export type getEntitiesQueryType = {
  Entities: {
    count: number
    limit: number
    results: damsEntityList[]
  }
}

export type getEntitiesQueryVariableType = {
  limit: number
  skip: number
}

export const getEnteties = gql`
  query getEntities($limit: Int, $skip: Int) {
    Entities(limit: $limit, skip: $skip) {
      count
      limit
      results {
        id
        type
        metadata(key: [title, type]) {
          key
          value
        }
      }
    }
  }
`

//Get single Entity
export type getEntityQueryType = {
  Entity: damsEntity
}

export type getEntityQueryVariableType = {
  id: string
}

export const getEntity = gql`
  query getEntityById($id: String) {
    Entity(id: $id) {
      id
      type
      title: metadata(key: [title]) {
        value
      }
      metadata(key: [description, material, type]) {
        key
        value
      }
      mediafiles {
        location
      }
    }
  }
`
