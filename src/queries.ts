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

export type Asset = Entity & {
  __typename?: 'Asset';
  id: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
  teaserMetadata?: Maybe<Array<Maybe<MetadataAndRelation>>>;
  title?: Maybe<Array<Maybe<MetadataAndRelation>>>;
};


export type AssetMetadataArgs = {
  keys: Array<Maybe<Scalars['String']>>;
  excludeOrInclude: ExcludeOrInclude;
};

export type BaseEntity = Entity & {
  __typename?: 'BaseEntity';
  id: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
};


export type BaseEntityMetadataArgs = {
  keys: Array<Maybe<Scalars['String']>>;
  excludeOrInclude: ExcludeOrInclude;
};

export type Directory = {
  __typename?: 'Directory';
  id?: Maybe<Scalars['String']>;
  dir?: Maybe<Scalars['String']>;
  has_subdirs?: Maybe<Scalars['Boolean']>;
  parent: Scalars['String'];
};

export type EntitiesResults = {
  __typename?: 'EntitiesResults';
  results?: Maybe<Array<Maybe<Entity>>>;
  count?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export type Entity = {
  id: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
};


export type EntityMetadataArgs = {
  keys: Array<Maybe<Scalars['String']>>;
  excludeOrInclude: ExcludeOrInclude;
};

export enum ExcludeOrInclude {
  Exclude = 'exclude',
  Include = 'include'
}

export type Filters = {
  query?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type ImportReturn = {
  __typename?: 'ImportReturn';
  message_id?: Maybe<Scalars['String']>;
};

export type Job = {
  __typename?: 'Job';
  job_type?: Maybe<Scalars['String']>;
  job_info?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['String']>;
  asset_id?: Maybe<Scalars['String']>;
  mediafile_id?: Maybe<Scalars['String']>;
  parent_job_id?: Maybe<Scalars['String']>;
  end_time?: Maybe<Scalars['String']>;
  start_time?: Maybe<Scalars['String']>;
  amount_of_jobs?: Maybe<Scalars['Int']>;
  completed_jobs?: Maybe<Scalars['Int']>;
  _id?: Maybe<Scalars['String']>;
  _key?: Maybe<Scalars['String']>;
  _rev?: Maybe<Scalars['String']>;
  sub_jobs?: Maybe<Array<Maybe<Job>>>;
};

export enum JobType {
  All = 'All',
  MediaFile = 'MediaFile',
  CsvImport = 'CSVImport',
  FileUpload = 'FileUpload'
}

export type JobsResults = {
  __typename?: 'JobsResults';
  results?: Maybe<Array<Maybe<Job>>>;
  count?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  next?: Maybe<Scalars['String']>;
};

export type Media = {
  __typename?: 'Media';
  primaryMediafile?: Maybe<Scalars['String']>;
  primaryMediafileLocation?: Maybe<Scalars['String']>;
  primaryThumbnailLocation?: Maybe<Scalars['String']>;
  mediafiles?: Maybe<Array<Maybe<MediaFile>>>;
};

export type MediaFile = {
  __typename?: 'MediaFile';
  _id: Scalars['String'];
  original_file_location?: Maybe<Scalars['String']>;
  thumbnail_file_location?: Maybe<Scalars['String']>;
  filename?: Maybe<Scalars['String']>;
  entities?: Maybe<Array<Maybe<Scalars['String']>>>;
  metadata?: Maybe<Array<Maybe<MediaFileMetadata>>>;
};

export type MediaFileMetadata = {
  __typename?: 'MediaFileMetadata';
  key?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type Metadata = {
  __typename?: 'Metadata';
  key: Scalars['String'];
  value: Scalars['String'];
  lang?: Maybe<Scalars['String']>;
  label: Scalars['String'];
  immutable?: Maybe<Scalars['Boolean']>;
};

export type MetadataAndRelation = Metadata | MetadataRelation;

export type MetadataInput = {
  key: Scalars['String'];
  value?: Maybe<Scalars['String']>;
  lang?: Maybe<Scalars['String']>;
};

export type MetadataRelation = {
  __typename?: 'MetadataRelation';
  key: Scalars['String'];
  value: Scalars['String'];
  label: Scalars['String'];
  type?: Maybe<Scalars['String']>;
  linkedEntity?: Maybe<Entity>;
};

export type Mutation = {
  __typename?: 'Mutation';
  replaceMetadata: Array<Metadata>;
  StartImport?: Maybe<ImportReturn>;
};


export type MutationReplaceMetadataArgs = {
  id: Scalars['String'];
  metadata: Array<MetadataInput>;
};


export type MutationStartImportArgs = {
  folder: Scalars['String'];
};

export type PaginationInfo = {
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  Entity?: Maybe<Entity>;
  Entities?: Maybe<EntitiesResults>;
  User?: Maybe<User>;
  Directories?: Maybe<Array<Maybe<Directory>>>;
  Jobs?: Maybe<JobsResults>;
  Job?: Maybe<Job>;
  advancedFilters?: Maybe<Array<Maybe<AdvancedFilter>>>;
  FilterOptions?: Maybe<Array<Maybe<FilterOption>>>;
};


export type QueryEntityArgs = {
  id: Scalars['String'];
};


export type QueryEntitiesArgs = {
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  searchValue: SearchFilter;
  fetchPolicy?: Maybe<Scalars['String']>;
};


export type QueryDirectoriesArgs = {
  dir?: Maybe<Scalars['String']>;
};


export type QueryJobsArgs = {
  paginationInfo?: Maybe<PaginationInfo>;
  filters?: Maybe<Filters>;
};


export type QueryJobArgs = {
  id: Scalars['String'];
};


export type QueryFilterOptionsArgs = {
  key: Scalars['String'];
};

export type SearchFilter = {
  value?: Maybe<Scalars['String']>;
  isAsc?: Maybe<Scalars['Boolean']>;
  key?: Maybe<Scalars['String']>;
  raw?: Maybe<Scalars['Boolean']>;
  relation_filter?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['String'];
  email: Scalars['String'];
  family_name: Scalars['String'];
  given_name: Scalars['String'];
  name: Scalars['String'];
  preferred_username: Scalars['String'];
};


export type AdvancedFilter = {
  __typename?: 'advancedFilter';
  key: Scalars['String'];
  label?: Maybe<Scalars['String']>;
  type: AdvancedFilterTypes;
};

export enum AdvancedFilterTypes {
  Tekst = 'tekst',
  Multiselect = 'multiselect',
  Checklist = 'checklist',
  Minmax = 'minmax'
}

export type FilterOption = {
  __typename?: 'filterOption';
  value?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
};

export type MetadataFragment = { __typename?: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> };

export type MetadataRelationFragment = { __typename?: 'MetadataRelation', key: string, value: string, label: string, type?: Maybe<string> };

type MinimalBaseEntity_Asset_Fragment = { __typename?: 'Asset', id: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> };

type MinimalBaseEntity_BaseEntity_Fragment = { __typename?: 'BaseEntity', id: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> };

export type MinimalBaseEntityFragment = MinimalBaseEntity_Asset_Fragment | MinimalBaseEntity_BaseEntity_Fragment;

type MinimalEntity_Asset_Fragment = (
  { __typename: 'Asset' }
  & MinimalAssetFragment
  & MinimalBaseEntity_Asset_Fragment
);

type MinimalEntity_BaseEntity_Fragment = (
  { __typename: 'BaseEntity' }
  & MinimalBaseEntity_BaseEntity_Fragment
);

export type MinimalEntityFragment = MinimalEntity_Asset_Fragment | MinimalEntity_BaseEntity_Fragment;

export type MinimalAssetFragment = (
  { __typename?: 'Asset', teaserMetadata: Array<Maybe<(
    { __typename: 'Metadata' }
    & MetadataFragment
  ) | (
    { __typename: 'MetadataRelation' }
    & MetadataRelationFragment
  )>>, title: Array<Maybe<(
    { __typename: 'Metadata' }
    & MetadataFragment
  ) | (
    { __typename: 'MetadataRelation' }
    & MetadataRelationFragment
  )>> }
  & MinimalBaseEntity_Asset_Fragment
);

type FullEntity_Asset_Fragment = { __typename?: 'Asset', id: string, type: string, title: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation' }>>, media?: Maybe<{ __typename?: 'Media', mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string>, thumbnail_file_location?: Maybe<string>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MediaFileMetadata', key?: Maybe<string>, value?: Maybe<string> }>>> }>>> }> };

type FullEntity_BaseEntity_Fragment = { __typename?: 'BaseEntity', id: string, type: string, title: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation' }>>, media?: Maybe<{ __typename?: 'Media', mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string>, thumbnail_file_location?: Maybe<string>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MediaFileMetadata', key?: Maybe<string>, value?: Maybe<string> }>>> }>>> }> };

export type FullEntityFragment = FullEntity_Asset_Fragment | FullEntity_BaseEntity_Fragment;

type FullEntityRecursive_Asset_Fragment = (
  { __typename?: 'Asset', metadata: Array<Maybe<(
    { __typename: 'Metadata' }
    & MetadataFragment
  ) | (
    { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
      { __typename?: 'Asset', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
          { __typename?: 'Asset', metadata: Array<Maybe<(
            { __typename: 'Metadata' }
            & MetadataFragment
          ) | (
            { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
              { __typename?: 'Asset', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_Asset_Fragment
            ) | (
              { __typename?: 'BaseEntity', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_BaseEntity_Fragment
            )> }
            & MetadataRelationFragment
          )>> }
          & FullEntity_Asset_Fragment
        ) | (
          { __typename?: 'BaseEntity', metadata: Array<Maybe<(
            { __typename: 'Metadata' }
            & MetadataFragment
          ) | (
            { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
              { __typename?: 'Asset', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_Asset_Fragment
            ) | (
              { __typename?: 'BaseEntity', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_BaseEntity_Fragment
            )> }
            & MetadataRelationFragment
          )>> }
          & FullEntity_BaseEntity_Fragment
        )> }
        & MetadataRelationFragment
      )>> }
      & FullEntity_Asset_Fragment
    ) | (
      { __typename?: 'BaseEntity', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
          { __typename?: 'Asset', metadata: Array<Maybe<(
            { __typename: 'Metadata' }
            & MetadataFragment
          ) | (
            { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
              { __typename?: 'Asset', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_Asset_Fragment
            ) | (
              { __typename?: 'BaseEntity', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_BaseEntity_Fragment
            )> }
            & MetadataRelationFragment
          )>> }
          & FullEntity_Asset_Fragment
        ) | (
          { __typename?: 'BaseEntity', metadata: Array<Maybe<(
            { __typename: 'Metadata' }
            & MetadataFragment
          ) | (
            { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
              { __typename?: 'Asset', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_Asset_Fragment
            ) | (
              { __typename?: 'BaseEntity', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_BaseEntity_Fragment
            )> }
            & MetadataRelationFragment
          )>> }
          & FullEntity_BaseEntity_Fragment
        )> }
        & MetadataRelationFragment
      )>> }
      & FullEntity_BaseEntity_Fragment
    )> }
    & MetadataRelationFragment
  )>> }
  & FullEntity_Asset_Fragment
);

type FullEntityRecursive_BaseEntity_Fragment = (
  { __typename?: 'BaseEntity', metadata: Array<Maybe<(
    { __typename: 'Metadata' }
    & MetadataFragment
  ) | (
    { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
      { __typename?: 'Asset', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
          { __typename?: 'Asset', metadata: Array<Maybe<(
            { __typename: 'Metadata' }
            & MetadataFragment
          ) | (
            { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
              { __typename?: 'Asset', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_Asset_Fragment
            ) | (
              { __typename?: 'BaseEntity', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_BaseEntity_Fragment
            )> }
            & MetadataRelationFragment
          )>> }
          & FullEntity_Asset_Fragment
        ) | (
          { __typename?: 'BaseEntity', metadata: Array<Maybe<(
            { __typename: 'Metadata' }
            & MetadataFragment
          ) | (
            { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
              { __typename?: 'Asset', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_Asset_Fragment
            ) | (
              { __typename?: 'BaseEntity', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_BaseEntity_Fragment
            )> }
            & MetadataRelationFragment
          )>> }
          & FullEntity_BaseEntity_Fragment
        )> }
        & MetadataRelationFragment
      )>> }
      & FullEntity_Asset_Fragment
    ) | (
      { __typename?: 'BaseEntity', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
          { __typename?: 'Asset', metadata: Array<Maybe<(
            { __typename: 'Metadata' }
            & MetadataFragment
          ) | (
            { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
              { __typename?: 'Asset', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_Asset_Fragment
            ) | (
              { __typename?: 'BaseEntity', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_BaseEntity_Fragment
            )> }
            & MetadataRelationFragment
          )>> }
          & FullEntity_Asset_Fragment
        ) | (
          { __typename?: 'BaseEntity', metadata: Array<Maybe<(
            { __typename: 'Metadata' }
            & MetadataFragment
          ) | (
            { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
              { __typename?: 'Asset', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_Asset_Fragment
            ) | (
              { __typename?: 'BaseEntity', metadata: Array<Maybe<(
                { __typename?: 'Metadata' }
                & MetadataFragment
              ) | (
                { __typename?: 'MetadataRelation' }
                & MetadataRelationFragment
              )>> }
              & FullEntity_BaseEntity_Fragment
            )> }
            & MetadataRelationFragment
          )>> }
          & FullEntity_BaseEntity_Fragment
        )> }
        & MetadataRelationFragment
      )>> }
      & FullEntity_BaseEntity_Fragment
    )> }
    & MetadataRelationFragment
  )>> }
  & FullEntity_BaseEntity_Fragment
);

export type FullEntityRecursiveFragment = FullEntityRecursive_Asset_Fragment | FullEntityRecursive_BaseEntity_Fragment;

export type GetEntitiesQueryVariables = Exact<{
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  searchValue: SearchFilter;
}>;


export type GetEntitiesQuery = { __typename?: 'Query', Entities?: Maybe<{ __typename?: 'EntitiesResults', count?: Maybe<number>, limit?: Maybe<number>, results?: Maybe<Array<Maybe<(
      { __typename?: 'Asset' }
      & MinimalEntity_Asset_Fragment
    ) | (
      { __typename?: 'BaseEntity' }
      & MinimalEntity_BaseEntity_Fragment
    )>>> }> };

export type GetEntityByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetEntityByIdQuery = { __typename?: 'Query', Entity?: Maybe<(
    { __typename?: 'Asset' }
    & FullEntityRecursive_Asset_Fragment
  ) | (
    { __typename?: 'BaseEntity' }
    & FullEntityRecursive_BaseEntity_Fragment
  )> };

export type JobFragment = { __typename?: 'Job', job_type?: Maybe<string>, job_info?: Maybe<string>, status?: Maybe<string>, user?: Maybe<string>, asset_id?: Maybe<string>, mediafile_id?: Maybe<string>, parent_job_id?: Maybe<string>, end_time?: Maybe<string>, start_time?: Maybe<string>, amount_of_jobs?: Maybe<number>, completed_jobs?: Maybe<number>, _id?: Maybe<string>, _key?: Maybe<string>, _rev?: Maybe<string> };

export type JobWithSubJobsFragment = (
  { __typename?: 'Job', sub_jobs?: Maybe<Array<Maybe<(
    { __typename?: 'Job' }
    & JobFragment
  )>>> }
  & JobFragment
);

export type GetDirectoriesQueryVariables = Exact<{
  dir?: Maybe<Scalars['String']>;
}>;


export type GetDirectoriesQuery = { __typename?: 'Query', Directories?: Maybe<Array<Maybe<{ __typename?: 'Directory', id?: Maybe<string>, dir?: Maybe<string>, has_subdirs?: Maybe<boolean>, parent: string }>>> };

export type GetJobsQueryVariables = Exact<{
  paginationInfo?: Maybe<PaginationInfo>;
  filters?: Maybe<Filters>;
}>;


export type GetJobsQuery = { __typename?: 'Query', Jobs?: Maybe<{ __typename?: 'JobsResults', count?: Maybe<number>, limit?: Maybe<number>, next?: Maybe<string>, results?: Maybe<Array<Maybe<(
      { __typename?: 'Job' }
      & JobFragment
    )>>> }> };

export type GetJobQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetJobQuery = { __typename?: 'Query', Job?: Maybe<(
    { __typename?: 'Job' }
    & JobWithSubJobsFragment
  )> };

export type GetAdvancedFiltersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdvancedFiltersQuery = { __typename?: 'Query', advancedFilters?: Maybe<Array<Maybe<{ __typename?: 'advancedFilter', label?: Maybe<string>, type: AdvancedFilterTypes, key: string }>>> };

export type GetFilterOptionsQueryVariables = Exact<{
  key: Scalars['String'];
}>;


export type GetFilterOptionsQuery = { __typename?: 'Query', FilterOptions?: Maybe<Array<Maybe<{ __typename?: 'filterOption', value?: Maybe<string>, label?: Maybe<string> }>>> };

export type PostStartImportMutationVariables = Exact<{
  folder: Scalars['String'];
}>;


export type PostStartImportMutation = { __typename?: 'Mutation', StartImport?: Maybe<{ __typename?: 'ImportReturn', message_id?: Maybe<string> }> };

export type EditMetadataMutationVariables = Exact<{
  id: Scalars['String'];
  metadata: Array<MetadataInput> | MetadataInput;
}>;


export type EditMetadataMutation = { __typename?: 'Mutation', replaceMetadata: Array<{ __typename?: 'Metadata', key: string, value: string, lang?: Maybe<string> }> };

export const MinimalBaseEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"minimalBaseEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"primaryMediafile"}}]}}]}}]} as unknown as DocumentNode<MinimalBaseEntityFragment, unknown>;
export const MetadataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"metadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}}]} as unknown as DocumentNode<MetadataFragment, unknown>;
export const MetadataRelationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"metadataRelation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]} as unknown as DocumentNode<MetadataRelationFragment, unknown>;
export const MinimalAssetFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"minimalAsset"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Asset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalBaseEntity"}},{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false},{"kind":"StringValue","value":"object_number","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}}]}}]} as unknown as DocumentNode<MinimalAssetFragment, unknown>;
export const MinimalEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"minimalEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalBaseEntity"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Asset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalAsset"}}]}}]}}]} as unknown as DocumentNode<MinimalEntityFragment, unknown>;
export const FullEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mediafiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail_file_location"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FullEntityFragment, unknown>;
export const FullEntityRecursiveFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullEntityRecursive"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"exclude"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}},{"kind":"Field","name":{"kind":"Name","value":"linkedEntity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"exclude"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}},{"kind":"Field","name":{"kind":"Name","value":"linkedEntity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"exclude"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}},{"kind":"Field","name":{"kind":"Name","value":"linkedEntity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"exclude"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<FullEntityRecursiveFragment, unknown>;
export const JobFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"job"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Job"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"job_type"}},{"kind":"Field","name":{"kind":"Name","value":"job_type"}},{"kind":"Field","name":{"kind":"Name","value":"job_info"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"user"}},{"kind":"Field","name":{"kind":"Name","value":"asset_id"}},{"kind":"Field","name":{"kind":"Name","value":"mediafile_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent_job_id"}},{"kind":"Field","name":{"kind":"Name","value":"end_time"}},{"kind":"Field","name":{"kind":"Name","value":"start_time"}},{"kind":"Field","name":{"kind":"Name","value":"amount_of_jobs"}},{"kind":"Field","name":{"kind":"Name","value":"completed_jobs"}},{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"_key"}},{"kind":"Field","name":{"kind":"Name","value":"_rev"}}]}}]} as unknown as DocumentNode<JobFragment, unknown>;
export const JobWithSubJobsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"jobWithSubJobs"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Job"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}},{"kind":"Field","name":{"kind":"Name","value":"sub_jobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}}]}}]}}]} as unknown as DocumentNode<JobWithSubJobsFragment, unknown>;
export const GetEntitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalEntity"}}]}}]}}]}},...MinimalEntityFragmentDoc.definitions,...MinimalBaseEntityFragmentDoc.definitions,...MinimalAssetFragmentDoc.definitions,...MetadataFragmentDoc.definitions,...MetadataRelationFragmentDoc.definitions]} as unknown as DocumentNode<GetEntitiesQuery, GetEntitiesQueryVariables>;
export const GetEntityByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntityById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntityRecursive"}}]}}]}},...FullEntityRecursiveFragmentDoc.definitions,...FullEntityFragmentDoc.definitions,...MetadataFragmentDoc.definitions,...MetadataRelationFragmentDoc.definitions]} as unknown as DocumentNode<GetEntityByIdQuery, GetEntityByIdQueryVariables>;
export const GetDirectoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getDirectories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dir"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Directories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dir"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dir"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dir"}},{"kind":"Field","name":{"kind":"Name","value":"has_subdirs"}},{"kind":"Field","name":{"kind":"Name","value":"parent"}}]}}]}}]} as unknown as DocumentNode<GetDirectoriesQuery, GetDirectoriesQueryVariables>;
export const GetJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getJobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paginationInfo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInfo"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Jobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paginationInfo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paginationInfo"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"next"}}]}}]}},...JobFragmentDoc.definitions]} as unknown as DocumentNode<GetJobsQuery, GetJobsQueryVariables>;
export const GetJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Job"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"jobWithSubJobs"}}]}}]}},...JobWithSubJobsFragmentDoc.definitions,...JobFragmentDoc.definitions]} as unknown as DocumentNode<GetJobQuery, GetJobQueryVariables>;
export const GetAdvancedFiltersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAdvancedFilters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"advancedFilters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]}}]} as unknown as DocumentNode<GetAdvancedFiltersQuery, GetAdvancedFiltersQueryVariables>;
export const GetFilterOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getFilterOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"FilterOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<GetFilterOptionsQuery, GetFilterOptionsQueryVariables>;
export const PostStartImportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"postStartImport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folder"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"StartImport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"folder"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folder"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message_id"}}]}}]}}]} as unknown as DocumentNode<PostStartImportMutation, PostStartImportMutationVariables>;
export const EditMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"editMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replaceMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"metadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}}]}}]}}]} as unknown as DocumentNode<EditMetadataMutation, EditMetadataMutationVariables>;