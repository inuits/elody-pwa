/* eslint-disable */
// THIS FILE IS GENERATED, DO NOT EDIT!

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Void: void;
};

export type EntitiesResults = {
  __typename?: 'EntitiesResults';
  results?: Maybe<Array<Maybe<Entity>>>;
  count?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export type Entity = {
  __typename?: 'Entity';
  id: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<Metadata>>;
  mediafiles?: Maybe<Array<Maybe<MediaFile>>>;
};


export type EntityMetadataArgs = {
  key?: Maybe<Array<Maybe<MetaKey>>>;
};

export type MediaFile = {
  __typename?: 'MediaFile';
  _id: Scalars['String'];
  original_file_location?: Maybe<Scalars['String']>;
  entities?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum MetaKey {
  Title = 'title',
  Type = 'type',
  Collection = 'collection',
  Description = 'description',
  Material = 'material'
}

export type Metadata = {
  __typename?: 'Metadata';
  key: MetaKey;
  value: Scalars['String'];
  lang?: Maybe<Scalars['String']>;
};

export type MetadataInput = {
  key: MetaKey;
  value: Scalars['String'];
  lang?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  replaceMetadata?: Maybe<Entity>;
};


export type MutationReplaceMetadataArgs = {
  id: Scalars['String'];
  metadata: Array<MetadataInput>;
};

export type Query = {
  __typename?: 'Query';
  Entity?: Maybe<Entity>;
  Entities?: Maybe<EntitiesResults>;
};


export type QueryEntityArgs = {
  id: Scalars['String'];
};


export type QueryEntitiesArgs = {
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  searchValue?: Maybe<SearchFilter>;
};

export type SearchFilter = {
  value?: Maybe<Scalars['String']>;
  isAsc?: Maybe<Scalars['Boolean']>;
  key?: Maybe<Scalars['String']>;
};


export type MinimalEntityFragment = { __typename?: 'Entity', id: string, type: string, metadata: Array<Maybe<{ __typename?: 'Metadata', key: MetaKey, value: string }>> };

export type FullEntityFragment = { __typename?: 'Entity', id: string, type: string, title: Array<Maybe<{ __typename?: 'Metadata', value: string }>>, metadata: Array<Maybe<{ __typename?: 'Metadata', key: MetaKey, value: string, lang?: Maybe<string> }>>, mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', original_file_location?: Maybe<string> }>>> };

export type GetEntitiesQueryVariables = Exact<{
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  searchValue?: Maybe<SearchFilter>;
}>;


export type GetEntitiesQuery = { __typename?: 'Query', Entities?: Maybe<{ __typename?: 'EntitiesResults', count?: Maybe<number>, limit?: Maybe<number>, results?: Maybe<Array<Maybe<(
      { __typename?: 'Entity' }
      & MinimalEntityFragment
    )>>> }> };

export type GetEntityByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetEntityByIdQuery = { __typename?: 'Query', Entity?: Maybe<(
    { __typename?: 'Entity' }
    & FullEntityFragment
  )> };

export type EditMetadataMutationVariables = Exact<{
  id: Scalars['String'];
  metadata: Array<MetadataInput> | MetadataInput;
}>;


export type EditMetadataMutation = { __typename?: 'Mutation', replaceMetadata?: Maybe<(
    { __typename?: 'Entity' }
    & FullEntityFragment
  )> };

export const MinimalEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"minimalEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"title"},{"kind":"EnumValue","value":"type"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<MinimalEntityFragment, unknown>;
export const FullEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"title"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mediafiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"original_file_location"}}]}}]}}]} as unknown as DocumentNode<FullEntityFragment, unknown>;
export const GetEntitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalEntity"}}]}}]}}]}},...MinimalEntityFragmentDoc.definitions]} as unknown as DocumentNode<GetEntitiesQuery, GetEntitiesQueryVariables>;
export const GetEntityByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntityById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}}]}}]}},...FullEntityFragmentDoc.definitions]} as unknown as DocumentNode<GetEntityByIdQuery, GetEntityByIdQueryVariables>;
export const EditMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"editMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replaceMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"metadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}}]}}]}},...FullEntityFragmentDoc.definitions]} as unknown as DocumentNode<EditMetadataMutation, EditMetadataMutationVariables>;