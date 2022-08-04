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
  Upload: any;
};

export enum AdvancedInputType {
  MinMaxInput = 'MinMaxInput',
  TextInput = 'TextInput',
  MultiSelectInput = 'MultiSelectInput'
}

export type AdvancedSearchInput = {
  value?: Maybe<Array<Maybe<AdvancedInputType>>>;
};

export type Asset = Entity & {
  __typename?: 'Asset';
  id: Scalars['String'];
  uuid: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
  teaserMetadata?: Maybe<Array<Maybe<MetadataAndRelation>>>;
  title?: Maybe<Array<Maybe<MetadataAndRelation>>>;
  form?: Maybe<Form>;
};


export type AssetMetadataArgs = {
  keys: Array<Maybe<Scalars['String']>>;
  excludeOrInclude: ExcludeOrInclude;
};

export type BaseEntity = Entity & {
  __typename?: 'BaseEntity';
  id: Scalars['String'];
  uuid: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
  form?: Maybe<Form>;
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
  uuid: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
  form?: Maybe<Form>;
};


export type EntityMetadataArgs = {
  keys: Array<Maybe<Scalars['String']>>;
  excludeOrInclude: ExcludeOrInclude;
};

export type EntityInput = {
  title?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  type?: Maybe<Entitytyping>;
  metadata?: Maybe<Array<Maybe<MetadataFieldInput>>>;
  identifiers?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum Entitytyping {
  Story = 'story',
  Frame = 'frame',
  Box = 'box'
}

export enum ExcludeOrInclude {
  Exclude = 'exclude',
  Include = 'include'
}

export type File = {
  __typename?: 'File';
  filename: Scalars['String'];
  mimetype: Scalars['String'];
  encoding: Scalars['String'];
};

export type FilterInput = {
  key: Scalars['String'];
  type: AdvancedInputType;
  minMaxInput?: Maybe<MinMaxInput>;
  textInput?: Maybe<TextInput>;
  multiSelectInput?: Maybe<MultiSelectInput>;
};

export type Filters = {
  query?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type Form = {
  __typename?: 'Form';
  fields: Array<Maybe<MetadataOrRelationField>>;
};

export type Frame = Entity & {
  __typename?: 'Frame';
  id: Scalars['String'];
  uuid: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
  form?: Maybe<Form>;
};


export type FrameMetadataArgs = {
  keys: Array<Maybe<Scalars['String']>>;
  excludeOrInclude: ExcludeOrInclude;
};

export type ImportReturn = {
  __typename?: 'ImportReturn';
  message_id?: Maybe<Scalars['String']>;
};

export enum InputFieldTypes {
  Text = 'text',
  Number = 'number',
  Boolean = 'boolean',
  Dropdown = 'dropdown'
}

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
  mimetype?: Maybe<Scalars['String']>;
};

export type MediaFileInput = {
  filename?: Maybe<Scalars['String']>;
  metadata?: Maybe<Array<Maybe<MediaFileMetadataInput>>>;
};

export type MediaFileMetadata = {
  __typename?: 'MediaFileMetadata';
  key?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type MediaFileMetadataInput = {
  key?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type MediaFilePostReturn = {
  __typename?: 'MediaFilePostReturn';
  url?: Maybe<Scalars['String']>;
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

export type MetadataField = {
  __typename?: 'MetadataField';
  label?: Maybe<Scalars['String']>;
  key: Scalars['String'];
  type: InputFieldTypes;
  order?: Maybe<Scalars['Int']>;
  active?: Maybe<Scalars['Boolean']>;
  validation?: Maybe<Validation>;
  options?: Maybe<Array<Maybe<MetadataFieldOption>>>;
};

export type MetadataFieldInput = {
  key: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type MetadataFieldOption = {
  __typename?: 'MetadataFieldOption';
  label?: Maybe<Scalars['String']>;
  value: Scalars['String'];
};

export type MetadataFormInput = {
  Metadata?: Maybe<Array<Maybe<MetadataFieldInput>>>;
  relations?: Maybe<Array<Maybe<RelationInput>>>;
};

export type MetadataInput = {
  key: Scalars['String'];
  value?: Maybe<Scalars['String']>;
  lang?: Maybe<Scalars['String']>;
};

export type MetadataOrRelationField = MetadataField | RelationField;

export type MetadataRelation = {
  __typename?: 'MetadataRelation';
  key: Scalars['String'];
  value: Scalars['String'];
  label: Scalars['String'];
  type?: Maybe<Scalars['String']>;
  metadataOnRelation?: Maybe<Array<Maybe<RelationMetaData>>>;
  linkedEntity?: Maybe<Entity>;
};

export type MinMaxInput = {
  min?: Maybe<Scalars['Int']>;
  max?: Maybe<Scalars['Int']>;
};

export type MultiSelectInput = {
  value?: Maybe<Array<Maybe<Scalars['String']>>>;
  AndOrValue?: Maybe<Scalars['Boolean']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  replaceMetadata: Array<Metadata>;
  StartImport?: Maybe<ImportReturn>;
  replaceRelationsAndMetaData?: Maybe<Entity>;
  deleteData?: Maybe<Scalars['String']>;
  createEntity?: Maybe<Entity>;
  postMediaFile?: Maybe<MediaFile>;
  patchMediaFileMetadata?: Maybe<MediaFile>;
  uploadFile?: Maybe<Scalars['String']>;
};


export type MutationReplaceMetadataArgs = {
  id: Scalars['String'];
  metadata: Array<MetadataInput>;
};


export type MutationStartImportArgs = {
  folder: Scalars['String'];
};


export type MutationReplaceRelationsAndMetaDataArgs = {
  id: Scalars['String'];
  form?: Maybe<MetadataFormInput>;
};


export type MutationDeleteDataArgs = {
  id: Scalars['String'];
  path: DeletePaths;
};


export type MutationCreateEntityArgs = {
  entity: EntityInput;
};


export type MutationPostMediaFileArgs = {
  mediaFileInput: MediaFileInput;
  file: Scalars['Upload'];
};


export type MutationPatchMediaFileMetadataArgs = {
  MediafileId: Scalars['String'];
  MediaFileMetadata: Array<Maybe<MediaFileMetadataInput>>;
};


export type MutationUploadFileArgs = {
  id: Scalars['String'];
  file: Scalars['Upload'];
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
  Form?: Maybe<Form>;
};


export type QueryEntityArgs = {
  id: Scalars['String'];
};


export type QueryEntitiesArgs = {
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  searchInputType?: Maybe<SearchInputType>;
  searchValue?: Maybe<SearchFilter>;
  advancedSearchValue?: Maybe<Array<Maybe<FilterInput>>>;
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


export type QueryFormArgs = {
  type: Scalars['String'];
};

export type RelationField = {
  __typename?: 'RelationField';
  label?: Maybe<Scalars['String']>;
  relationType: Scalars['String'];
  metadata?: Maybe<Array<Maybe<MetadataField>>>;
  acceptedEntityTypes: Array<Maybe<Scalars['String']>>;
};

export type RelationMetaData = {
  __typename?: 'RelationMetaData';
  key: Scalars['String'];
  value: Scalars['String'];
};

export enum RelationType {
  Frames = 'frames',
  Stories = 'stories'
}

export type SearchFilter = {
  value?: Maybe<Scalars['String']>;
  isAsc?: Maybe<Scalars['Boolean']>;
  key?: Maybe<Scalars['String']>;
};

export enum SearchInputType {
  AdvancedInputType = 'AdvancedInputType',
  SimpleInputtype = 'SimpleInputtype'
}

export type Story = Entity & {
  __typename?: 'Story';
  id: Scalars['String'];
  uuid: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
  teaserMetadata?: Maybe<Array<Maybe<MetadataAndRelation>>>;
  title?: Maybe<Array<Maybe<MetadataAndRelation>>>;
  form?: Maybe<Form>;
};


export type StoryMetadataArgs = {
  keys: Array<Maybe<Scalars['String']>>;
  excludeOrInclude: ExcludeOrInclude;
};

export type TextInput = {
  value?: Maybe<Scalars['String']>;
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

export type BoxEntity = Entity & {
  __typename?: 'boxEntity';
  id: Scalars['String'];
  uuid: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<MetadataAndRelation>>;
  media?: Maybe<Media>;
  form?: Maybe<Form>;
};


export type BoxEntityMetadataArgs = {
  keys: Array<Maybe<Scalars['String']>>;
  excludeOrInclude: ExcludeOrInclude;
};

export enum DeletePaths {
  Entities = 'entities',
  Mediafiles = 'mediafiles'
}

export type FilterOption = {
  __typename?: 'filterOption';
  value?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
};

export type RelationInput = {
  relationType: Scalars['String'];
  metadata?: Maybe<Array<Maybe<MetadataFieldInput>>>;
  linkedEntityId?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
};

export enum Validation {
  Required = 'required',
  Optional = 'optional'
}

export type MetadataFragment = { __typename?: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> };

export type MetadataRelationFragment = { __typename?: 'MetadataRelation', key: string, value: string, label: string, type?: Maybe<string>, metadataOnRelation?: Maybe<Array<Maybe<{ __typename?: 'RelationMetaData', key: string, value: string }>>> };

type MinimalBaseEntity_Asset_Fragment = { __typename?: 'Asset', id: string, uuid: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> };

type MinimalBaseEntity_BaseEntity_Fragment = { __typename?: 'BaseEntity', id: string, uuid: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> };

type MinimalBaseEntity_Frame_Fragment = { __typename?: 'Frame', id: string, uuid: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> };

type MinimalBaseEntity_Story_Fragment = { __typename?: 'Story', id: string, uuid: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> };

type MinimalBaseEntity_BoxEntity_Fragment = { __typename?: 'boxEntity', id: string, uuid: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> };

export type MinimalBaseEntityFragment = MinimalBaseEntity_Asset_Fragment | MinimalBaseEntity_BaseEntity_Fragment | MinimalBaseEntity_Frame_Fragment | MinimalBaseEntity_Story_Fragment | MinimalBaseEntity_BoxEntity_Fragment;

export type EditFormFragment = { __typename?: 'Form', fields: Array<Maybe<{ __typename: 'MetadataField', label?: Maybe<string>, key: string, type: InputFieldTypes } | { __typename: 'RelationField', label?: Maybe<string>, relationType: string, acceptedEntityTypes: Array<Maybe<string>>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MetadataField', key: string, type: InputFieldTypes, label?: Maybe<string> }>>> }>> };

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

type FullEntity_Asset_Fragment = { __typename?: 'Asset', id: string, type: string, form?: Maybe<(
    { __typename?: 'Form' }
    & EditFormFragment
  )>, title: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation' }>>, media?: Maybe<{ __typename?: 'Media', mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string>, original_file_location?: Maybe<string>, thumbnail_file_location?: Maybe<string>, mimetype?: Maybe<string>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MediaFileMetadata', key?: Maybe<string>, value?: Maybe<string> }>>> }>>> }> };

type FullEntity_BaseEntity_Fragment = { __typename?: 'BaseEntity', id: string, type: string, form?: Maybe<(
    { __typename?: 'Form' }
    & EditFormFragment
  )>, title: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation' }>>, media?: Maybe<{ __typename?: 'Media', mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string>, original_file_location?: Maybe<string>, thumbnail_file_location?: Maybe<string>, mimetype?: Maybe<string>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MediaFileMetadata', key?: Maybe<string>, value?: Maybe<string> }>>> }>>> }> };

type FullEntity_Frame_Fragment = { __typename?: 'Frame', id: string, type: string, form?: Maybe<(
    { __typename?: 'Form' }
    & EditFormFragment
  )>, title: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation' }>>, media?: Maybe<{ __typename?: 'Media', mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string>, original_file_location?: Maybe<string>, thumbnail_file_location?: Maybe<string>, mimetype?: Maybe<string>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MediaFileMetadata', key?: Maybe<string>, value?: Maybe<string> }>>> }>>> }> };

type FullEntity_Story_Fragment = { __typename?: 'Story', id: string, type: string, form?: Maybe<(
    { __typename?: 'Form' }
    & EditFormFragment
  )>, title: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation' }>>, media?: Maybe<{ __typename?: 'Media', mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string>, original_file_location?: Maybe<string>, thumbnail_file_location?: Maybe<string>, mimetype?: Maybe<string>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MediaFileMetadata', key?: Maybe<string>, value?: Maybe<string> }>>> }>>> }> };

type FullEntity_BoxEntity_Fragment = { __typename?: 'boxEntity', id: string, type: string, form?: Maybe<(
    { __typename?: 'Form' }
    & EditFormFragment
  )>, title: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation' }>>, media?: Maybe<{ __typename?: 'Media', mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string>, original_file_location?: Maybe<string>, thumbnail_file_location?: Maybe<string>, mimetype?: Maybe<string>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MediaFileMetadata', key?: Maybe<string>, value?: Maybe<string> }>>> }>>> }> };

export type FullEntityFragment = FullEntity_Asset_Fragment | FullEntity_BaseEntity_Fragment | FullEntity_Frame_Fragment | FullEntity_Story_Fragment | FullEntity_BoxEntity_Fragment;

type FullEntityRecursive_Asset_Fragment = (
  { __typename?: 'Asset', metadata: Array<Maybe<(
    { __typename: 'Metadata' }
    & MetadataFragment
  ) | (
    { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
      { __typename?: 'Asset', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Asset_Fragment
      & FullEntity_Asset_Fragment
    ) | (
      { __typename?: 'BaseEntity', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & FullEntity_BaseEntity_Fragment
    ) | (
      { __typename?: 'Frame', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Frame_Fragment
      & FullEntity_Frame_Fragment
    ) | (
      { __typename?: 'Story', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Story_Fragment
      & FullEntity_Story_Fragment
    ) | (
      { __typename?: 'boxEntity', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_BoxEntity_Fragment
      & FullEntity_BoxEntity_Fragment
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
      { __typename?: 'Asset', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Asset_Fragment
      & FullEntity_Asset_Fragment
    ) | (
      { __typename?: 'BaseEntity', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & FullEntity_BaseEntity_Fragment
    ) | (
      { __typename?: 'Frame', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Frame_Fragment
      & FullEntity_Frame_Fragment
    ) | (
      { __typename?: 'Story', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Story_Fragment
      & FullEntity_Story_Fragment
    ) | (
      { __typename?: 'boxEntity', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_BoxEntity_Fragment
      & FullEntity_BoxEntity_Fragment
    )> }
    & MetadataRelationFragment
  )>> }
  & FullEntity_BaseEntity_Fragment
);

type FullEntityRecursive_Frame_Fragment = (
  { __typename?: 'Frame', metadata: Array<Maybe<(
    { __typename: 'Metadata' }
    & MetadataFragment
  ) | (
    { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
      { __typename?: 'Asset', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Asset_Fragment
      & FullEntity_Asset_Fragment
    ) | (
      { __typename?: 'BaseEntity', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & FullEntity_BaseEntity_Fragment
    ) | (
      { __typename?: 'Frame', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Frame_Fragment
      & FullEntity_Frame_Fragment
    ) | (
      { __typename?: 'Story', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Story_Fragment
      & FullEntity_Story_Fragment
    ) | (
      { __typename?: 'boxEntity', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_BoxEntity_Fragment
      & FullEntity_BoxEntity_Fragment
    )> }
    & MetadataRelationFragment
  )>> }
  & FullEntity_Frame_Fragment
);

type FullEntityRecursive_Story_Fragment = (
  { __typename?: 'Story', metadata: Array<Maybe<(
    { __typename: 'Metadata' }
    & MetadataFragment
  ) | (
    { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
      { __typename?: 'Asset', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Asset_Fragment
      & FullEntity_Asset_Fragment
    ) | (
      { __typename?: 'BaseEntity', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & FullEntity_BaseEntity_Fragment
    ) | (
      { __typename?: 'Frame', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Frame_Fragment
      & FullEntity_Frame_Fragment
    ) | (
      { __typename?: 'Story', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Story_Fragment
      & FullEntity_Story_Fragment
    ) | (
      { __typename?: 'boxEntity', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_BoxEntity_Fragment
      & FullEntity_BoxEntity_Fragment
    )> }
    & MetadataRelationFragment
  )>> }
  & FullEntity_Story_Fragment
);

type FullEntityRecursive_BoxEntity_Fragment = (
  { __typename?: 'boxEntity', metadata: Array<Maybe<(
    { __typename: 'Metadata' }
    & MetadataFragment
  ) | (
    { __typename: 'MetadataRelation', linkedEntity?: Maybe<(
      { __typename?: 'Asset', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Asset_Fragment
      & FullEntity_Asset_Fragment
    ) | (
      { __typename?: 'BaseEntity', metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & FullEntity_BaseEntity_Fragment
    ) | (
      { __typename?: 'Frame', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Frame_Fragment
      & FullEntity_Frame_Fragment
    ) | (
      { __typename?: 'Story', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_Story_Fragment
      & FullEntity_Story_Fragment
    ) | (
      { __typename?: 'boxEntity', teaserMetadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>>, metadata: Array<Maybe<(
        { __typename: 'Metadata' }
        & MetadataFragment
      ) | (
        { __typename: 'MetadataRelation' }
        & MetadataRelationFragment
      )>> }
      & MinimalBaseEntity_BoxEntity_Fragment
      & FullEntity_BoxEntity_Fragment
    )> }
    & MetadataRelationFragment
  )>> }
  & FullEntity_BoxEntity_Fragment
);

export type FullEntityRecursiveFragment = FullEntityRecursive_Asset_Fragment | FullEntityRecursive_BaseEntity_Fragment | FullEntityRecursive_Frame_Fragment | FullEntityRecursive_Story_Fragment | FullEntityRecursive_BoxEntity_Fragment;

export type GetEntitiesQueryVariables = Exact<{
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  searchValue?: Maybe<SearchFilter>;
  advancedSearchValue?: Maybe<Array<Maybe<FilterInput>> | Maybe<FilterInput>>;
  searchInputType?: Maybe<SearchInputType>;
}>;


export type GetEntitiesQuery = { __typename?: 'Query', Entities?: Maybe<{ __typename?: 'EntitiesResults', count?: Maybe<number>, limit?: Maybe<number>, results?: Maybe<Array<Maybe<(
      { __typename?: 'Asset', id: string, uuid: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> }
      & MinimalAssetFragment
    ) | { __typename?: 'BaseEntity', id: string, uuid: string, type: string, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> } | { __typename?: 'Frame', id: string, uuid: string, type: string, teaserMetadata: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation', key: string, value: string, label: string, type?: Maybe<string>, metadataOnRelation?: Maybe<Array<Maybe<{ __typename?: 'RelationMetaData', key: string, value: string }>>> }>>, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> } | { __typename?: 'Story', id: string, uuid: string, type: string, teaserMetadata: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation', key: string, value: string, label: string, type?: Maybe<string>, metadataOnRelation?: Maybe<Array<Maybe<{ __typename?: 'RelationMetaData', key: string, value: string }>>> }>>, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> } | { __typename?: 'boxEntity', id: string, uuid: string, type: string, teaserMetadata: Array<Maybe<{ __typename: 'Metadata', key: string, value: string, label: string, immutable?: Maybe<boolean> } | { __typename: 'MetadataRelation', key: string, value: string, label: string, type?: Maybe<string>, metadataOnRelation?: Maybe<Array<Maybe<{ __typename?: 'RelationMetaData', key: string, value: string }>>> }>>, media?: Maybe<{ __typename?: 'Media', primaryMediafile?: Maybe<string> }> }>>> }> };

export type GetEntityByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetEntityByIdQuery = { __typename?: 'Query', Entity?: Maybe<(
    { __typename?: 'Asset' }
    & FullEntityRecursive_Asset_Fragment
  ) | (
    { __typename?: 'BaseEntity' }
    & FullEntityRecursive_BaseEntity_Fragment
  ) | (
    { __typename?: 'Frame' }
    & FullEntityRecursive_Frame_Fragment
  ) | (
    { __typename?: 'Story' }
    & FullEntityRecursive_Story_Fragment
  ) | (
    { __typename?: 'boxEntity' }
    & FullEntityRecursive_BoxEntity_Fragment
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

export type PostMediaFileMutationVariables = Exact<{
  mediaFileInput: MediaFileInput;
  file: Scalars['Upload'];
}>;


export type PostMediaFileMutation = { __typename?: 'Mutation', postMediaFile?: Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string> }> };

export type PatchMediaFileMetadataMutationVariables = Exact<{
  mediafileId: Scalars['String'];
  mediaFileInput: Array<Maybe<MediaFileMetadataInput>> | Maybe<MediaFileMetadataInput>;
}>;


export type PatchMediaFileMetadataMutation = { __typename?: 'Mutation', patchMediaFileMetadata?: Maybe<{ __typename?: 'MediaFile', _id: string, filename?: Maybe<string> }> };

export type EditMetadataMutationVariables = Exact<{
  id: Scalars['String'];
  metadata: Array<MetadataInput> | MetadataInput;
}>;


export type EditMetadataMutation = { __typename?: 'Mutation', replaceMetadata: Array<{ __typename?: 'Metadata', key: string, value: string, lang?: Maybe<string> }> };

export type ReplaceRelationsAndMetaDataMutationVariables = Exact<{
  id: Scalars['String'];
  form: MetadataFormInput;
}>;


export type ReplaceRelationsAndMetaDataMutation = { __typename?: 'Mutation', replaceRelationsAndMetaData?: Maybe<(
    { __typename?: 'Asset' }
    & FullEntityRecursive_Asset_Fragment
  ) | (
    { __typename?: 'BaseEntity' }
    & FullEntityRecursive_BaseEntity_Fragment
  ) | (
    { __typename?: 'Frame' }
    & FullEntityRecursive_Frame_Fragment
  ) | (
    { __typename?: 'Story' }
    & FullEntityRecursive_Story_Fragment
  ) | (
    { __typename?: 'boxEntity' }
    & FullEntityRecursive_BoxEntity_Fragment
  )> };

export type DeleteDataMutationVariables = Exact<{
  id: Scalars['String'];
  path: DeletePaths;
}>;


export type DeleteDataMutation = { __typename?: 'Mutation', deleteData?: Maybe<string> };

export type CreateEntityMutationVariables = Exact<{
  data: EntityInput;
}>;


export type CreateEntityMutation = { __typename?: 'Mutation', createEntity?: Maybe<(
    { __typename?: 'Asset' }
    & FullEntity_Asset_Fragment
  ) | (
    { __typename?: 'BaseEntity' }
    & FullEntity_BaseEntity_Fragment
  ) | (
    { __typename?: 'Frame' }
    & FullEntity_Frame_Fragment
  ) | (
    { __typename?: 'Story' }
    & FullEntity_Story_Fragment
  ) | (
    { __typename?: 'boxEntity' }
    & FullEntity_BoxEntity_Fragment
  )> };

export type GetFormsQueryVariables = Exact<{
  type: Scalars['String'];
}>;


export type GetFormsQuery = { __typename?: 'Query', Form?: Maybe<{ __typename?: 'Form', fields: Array<Maybe<{ __typename: 'MetadataField', label?: Maybe<string>, key: string, type: InputFieldTypes, options?: Maybe<Array<Maybe<{ __typename?: 'MetadataFieldOption', value: string, label?: Maybe<string> }>>> } | { __typename: 'RelationField', label?: Maybe<string>, relationType: string, acceptedEntityTypes: Array<Maybe<string>>, metadata?: Maybe<Array<Maybe<{ __typename?: 'MetadataField', key: string, type: InputFieldTypes, label?: Maybe<string> }>>> }>> }> };

export const MinimalBaseEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"minimalBaseEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"primaryMediafile"}}]}}]}}]} as unknown as DocumentNode<MinimalBaseEntityFragment, unknown>;
export const MetadataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"metadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}}]} as unknown as DocumentNode<MetadataFragment, unknown>;
export const MetadataRelationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"metadataRelation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"metadataOnRelation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<MetadataRelationFragment, unknown>;
export const MinimalAssetFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"minimalAsset"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Asset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalBaseEntity"}},{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"type","block":false},{"kind":"StringValue","value":"title","block":false},{"kind":"StringValue","value":"object_number","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}}]}},...MinimalBaseEntityFragmentDoc.definitions,...MetadataFragmentDoc.definitions,...MetadataRelationFragmentDoc.definitions]} as unknown as DocumentNode<MinimalAssetFragment, unknown>;
export const EditFormFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"editForm"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Form"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RelationField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"relationType"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"acceptedEntityTypes"}}]}}]}}]}}]} as unknown as DocumentNode<EditFormFragment, unknown>;
export const FullEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"form"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"editForm"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mediafiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"original_file_location"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail_file_location"}},{"kind":"Field","name":{"kind":"Name","value":"mimetype"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}},...EditFormFragmentDoc.definitions]} as unknown as DocumentNode<FullEntityFragment, unknown>;
export const FullEntityRecursiveFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullEntityRecursive"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"exclude"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}},{"kind":"Field","name":{"kind":"Name","value":"linkedEntity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Asset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalBaseEntity"}},{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false},{"kind":"StringValue","value":"object_number","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Frame"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalBaseEntity"}},{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Story"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalBaseEntity"}},{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"boxEntity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalBaseEntity"}},{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"exclude"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"metadataRelation"}}]}}]}}]}}]}}]}}]}},...FullEntityFragmentDoc.definitions,...MetadataFragmentDoc.definitions,...MetadataRelationFragmentDoc.definitions,...MinimalBaseEntityFragmentDoc.definitions]} as unknown as DocumentNode<FullEntityRecursiveFragment, unknown>;
export const JobFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"job"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Job"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"job_type"}},{"kind":"Field","name":{"kind":"Name","value":"job_type"}},{"kind":"Field","name":{"kind":"Name","value":"job_info"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"user"}},{"kind":"Field","name":{"kind":"Name","value":"asset_id"}},{"kind":"Field","name":{"kind":"Name","value":"mediafile_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent_job_id"}},{"kind":"Field","name":{"kind":"Name","value":"end_time"}},{"kind":"Field","name":{"kind":"Name","value":"start_time"}},{"kind":"Field","name":{"kind":"Name","value":"amount_of_jobs"}},{"kind":"Field","name":{"kind":"Name","value":"completed_jobs"}},{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"_key"}},{"kind":"Field","name":{"kind":"Name","value":"_rev"}}]}}]} as unknown as DocumentNode<JobFragment, unknown>;
export const JobWithSubJobsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"jobWithSubJobs"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Job"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}},{"kind":"Field","name":{"kind":"Name","value":"sub_jobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}}]}}]}},...JobFragmentDoc.definitions]} as unknown as DocumentNode<JobWithSubJobsFragment, unknown>;
export const GetEntitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"advancedSearchValue"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FilterInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchInputType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchInputType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}}},{"kind":"Argument","name":{"kind":"Name","value":"advancedSearchValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"advancedSearchValue"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchInputType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchInputType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"primaryMediafile"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Asset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalAsset"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Frame"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"type","block":false},{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"metadataOnRelation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Story"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"type","block":false},{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"metadataOnRelation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"boxEntity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"teaserMetadata"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"type","block":false},{"kind":"StringValue","value":"title","block":false}]}},{"kind":"Argument","name":{"kind":"Name","value":"excludeOrInclude"},"value":{"kind":"EnumValue","value":"include"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Metadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataRelation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"metadataOnRelation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]}}]}},...MinimalAssetFragmentDoc.definitions]} as unknown as DocumentNode<GetEntitiesQuery, GetEntitiesQueryVariables>;
export const GetEntityByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntityById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntityRecursive"}}]}}]}},...FullEntityRecursiveFragmentDoc.definitions]} as unknown as DocumentNode<GetEntityByIdQuery, GetEntityByIdQueryVariables>;
export const GetDirectoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getDirectories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dir"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Directories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dir"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dir"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dir"}},{"kind":"Field","name":{"kind":"Name","value":"has_subdirs"}},{"kind":"Field","name":{"kind":"Name","value":"parent"}}]}}]}}]} as unknown as DocumentNode<GetDirectoriesQuery, GetDirectoriesQueryVariables>;
export const GetJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getJobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paginationInfo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInfo"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Jobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paginationInfo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paginationInfo"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"next"}}]}}]}},...JobFragmentDoc.definitions]} as unknown as DocumentNode<GetJobsQuery, GetJobsQueryVariables>;
export const GetJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Job"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"jobWithSubJobs"}}]}}]}},...JobWithSubJobsFragmentDoc.definitions]} as unknown as DocumentNode<GetJobQuery, GetJobQueryVariables>;
export const GetAdvancedFiltersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAdvancedFilters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"advancedFilters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]}}]} as unknown as DocumentNode<GetAdvancedFiltersQuery, GetAdvancedFiltersQueryVariables>;
export const GetFilterOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getFilterOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"FilterOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<GetFilterOptionsQuery, GetFilterOptionsQueryVariables>;
export const PostStartImportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"postStartImport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folder"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"StartImport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"folder"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folder"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message_id"}}]}}]}}]} as unknown as DocumentNode<PostStartImportMutation, PostStartImportMutationVariables>;
export const PostMediaFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"postMediaFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mediaFileInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MediaFileInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"postMediaFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"mediaFileInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mediaFileInput"}}},{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}}]}}]}}]} as unknown as DocumentNode<PostMediaFileMutation, PostMediaFileMutationVariables>;
export const PatchMediaFileMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"patchMediaFileMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mediafileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mediaFileInput"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MediaFileMetadataInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"patchMediaFileMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"MediafileId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mediafileId"}}},{"kind":"Argument","name":{"kind":"Name","value":"MediaFileMetadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mediaFileInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}}]}}]}}]} as unknown as DocumentNode<PatchMediaFileMetadataMutation, PatchMediaFileMetadataMutationVariables>;
export const EditMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"editMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replaceMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"metadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}}]}}]}}]} as unknown as DocumentNode<EditMetadataMutation, EditMetadataMutationVariables>;
export const ReplaceRelationsAndMetaDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"replaceRelationsAndMetaData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"form"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataFormInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replaceRelationsAndMetaData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"form"},"value":{"kind":"Variable","name":{"kind":"Name","value":"form"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntityRecursive"}}]}}]}},...FullEntityRecursiveFragmentDoc.definitions]} as unknown as DocumentNode<ReplaceRelationsAndMetaDataMutation, ReplaceRelationsAndMetaDataMutationVariables>;
export const DeleteDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"deletePaths"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}]}]}}]} as unknown as DocumentNode<DeleteDataMutation, DeleteDataMutationVariables>;
export const CreateEntityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createEntity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EntityInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEntity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}}]}}]}},...FullEntityFragmentDoc.definitions]} as unknown as DocumentNode<CreateEntityMutation, CreateEntityMutationVariables>;
export const GetFormsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetForms"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Form"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RelationField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"relationType"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"acceptedEntityTypes"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetFormsQuery, GetFormsQueryVariables>;