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
  __typename?: 'Entity';
  id: Scalars['String'];
  type: Scalars['String'];
  metadata: Array<Maybe<Metadata>>;
  relations?: Maybe<Array<Maybe<Relation>>>;
  mediafiles?: Maybe<Array<Maybe<MediaFile>>>;
  metadataCollection?: Maybe<Array<Maybe<MetadataCollection>>>;
  components?: Maybe<Array<Maybe<Entity>>>;
  parents?: Maybe<Array<Maybe<Entity>>>;
  primary_mediafile?: Maybe<Scalars['String']>;
};


export type EntityMetadataArgs = {
  key?: Maybe<Array<Maybe<MetaKey>>>;
};


export type EntityRelationsArgs = {
  key?: Maybe<Array<RelationType>>;
};

export type Filters = {
  query?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type ImportReturn = {
  __typename?: 'ImportReturn';
  message_id?: Maybe<Scalars['String']>;
};

export type JsPatch = {
  op: JsPatchOp;
  path: Array<Scalars['String']>;
  value: Scalars['String'];
};

export enum JsPatchOp {
  Add = 'add',
  Replace = 'replace',
  Remove = 'remove'
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

export type MediaFile = {
  __typename?: 'MediaFile';
  _id: Scalars['String'];
  original_file_location?: Maybe<Scalars['String']>;
  thumbnail_file_location?: Maybe<Scalars['String']>;
  filename?: Maybe<Scalars['String']>;
  entities?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum MetaKey {
  Title = 'title',
  Type = 'type',
  Collection = 'collection',
  Description = 'description',
  Material = 'material',
  ObjectNumber = 'object_number'
}

export type Metadata = {
  __typename?: 'Metadata';
  key: MetaKey;
  value?: Maybe<Scalars['String']>;
  nestedMetaData?: Maybe<Entity>;
  lang?: Maybe<Scalars['String']>;
  unMappedKey?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  type?: Maybe<RelationType>;
  immutable?: Maybe<Scalars['Boolean']>;
};

export type MetadataCollection = {
  __typename?: 'MetadataCollection';
  label: Scalars['String'];
  data?: Maybe<Array<Maybe<Metadata>>>;
  nested?: Maybe<Scalars['Boolean']>;
  key: Scalars['String'];
};

export type MetadataInput = {
  key: MetaKey;
  value?: Maybe<Scalars['String']>;
  lang?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  replaceMetadata: Array<Metadata>;
  StartImport?: Maybe<ImportReturn>;
  addRelations: Array<Maybe<Relation>>;
};


export type MutationReplaceMetadataArgs = {
  id: Scalars['String'];
  metadata: Array<MetadataInput>;
};


export type MutationStartImportArgs = {
  folder: Scalars['String'];
};


export type MutationAddRelationsArgs = {
  id: Scalars['String'];
  relations: Array<RelationInput>;
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

export type Relation = {
  __typename?: 'Relation';
  key: Scalars['String'];
  type: RelationType;
  label?: Maybe<Scalars['String']>;
};

export type RelationInput = {
  key?: Maybe<Scalars['String']>;
  type?: Maybe<RelationType>;
  label?: Maybe<Scalars['String']>;
};

export enum RelationType {
  AuthoredBy = 'authoredBy',
  IsIn = 'isIn',
  Contains = 'contains',
  IsTypeOf = 'isTypeOf',
  IsUsedIn = 'isUsedIn',
  Components = 'components',
  Parent = 'parent',
  CarriedOutBy = 'carriedOutBy'
}

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


/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByUrl`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __Type = {
  __typename?: '__Type';
  kind: __TypeKind;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  specifiedByUrl?: Maybe<Scalars['String']>;
  fields?: Maybe<Array<__Field>>;
  interfaces?: Maybe<Array<__Type>>;
  possibleTypes?: Maybe<Array<__Type>>;
  enumValues?: Maybe<Array<__EnumValue>>;
  inputFields?: Maybe<Array<__InputValue>>;
  ofType?: Maybe<__Type>;
};


/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByUrl`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeFieldsArgs = {
  includeDeprecated?: Maybe<Scalars['Boolean']>;
};


/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByUrl`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeEnumValuesArgs = {
  includeDeprecated?: Maybe<Scalars['Boolean']>;
};


/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByUrl`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeInputFieldsArgs = {
  includeDeprecated?: Maybe<Scalars['Boolean']>;
};

/** An enum describing what kind of type a given `__Type` is. */
export enum __TypeKind {
  /** Indicates this type is a scalar. */
  Scalar = 'SCALAR',
  /** Indicates this type is an object. `fields` and `interfaces` are valid fields. */
  Object = 'OBJECT',
  /** Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields. */
  Interface = 'INTERFACE',
  /** Indicates this type is a union. `possibleTypes` is a valid field. */
  Union = 'UNION',
  /** Indicates this type is an enum. `enumValues` is a valid field. */
  Enum = 'ENUM',
  /** Indicates this type is an input object. `inputFields` is a valid field. */
  InputObject = 'INPUT_OBJECT',
  /** Indicates this type is a list. `ofType` is a valid field. */
  List = 'LIST',
  /** Indicates this type is a non-null. `ofType` is a valid field. */
  NonNull = 'NON_NULL'
}

/** Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type. */
export type __Field = {
  __typename?: '__Field';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  args: Array<__InputValue>;
  type: __Type;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};


/** Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type. */
export type __FieldArgsArgs = {
  includeDeprecated?: Maybe<Scalars['Boolean']>;
};

/** Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value. */
export type __InputValue = {
  __typename?: '__InputValue';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  type: __Type;
  /** A GraphQL-formatted string representing the default value for this input value. */
  defaultValue?: Maybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};

/** One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string. */
export type __EnumValue = {
  __typename?: '__EnumValue';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};

export type MinimalEntityFragment = { __typename?: 'Entity', id: string, type: string, primary_mediafile?: Maybe<string>, metadata: Array<Maybe<{ __typename?: 'Metadata', key: MetaKey, value?: Maybe<string>, lang?: Maybe<string>, immutable?: Maybe<boolean> }>> };

export type NestedEntityFragment = { __typename?: 'Entity', id: string, type: string, metadataCollection?: Maybe<Array<Maybe<{ __typename?: 'MetadataCollection', label: string, nested?: Maybe<boolean>, key: string, data?: Maybe<Array<Maybe<{ __typename?: 'Metadata', value?: Maybe<string>, unMappedKey?: Maybe<string>, label?: Maybe<string> }>>> }>>> };

export type FullEntityFragment = { __typename?: 'Entity', id: string, type: string, title: Array<Maybe<{ __typename?: 'Metadata', key: MetaKey, value?: Maybe<string>, lang?: Maybe<string>, immutable?: Maybe<boolean> }>>, mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, original_file_location?: Maybe<string>, filename?: Maybe<string>, thumbnail_file_location?: Maybe<string> }>>>, metadataCollection?: Maybe<Array<Maybe<{ __typename?: 'MetadataCollection', label: string, nested?: Maybe<boolean>, key: string, data?: Maybe<Array<Maybe<{ __typename?: 'Metadata', value?: Maybe<string>, unMappedKey?: Maybe<string>, label?: Maybe<string>, nestedMetaData?: Maybe<(
        { __typename?: 'Entity' }
        & NestedEntityFragment
      )> }>>> }>>>, parents?: Maybe<Array<Maybe<(
    { __typename?: 'Entity' }
    & MinimalEntityFragment
  )>>>, components?: Maybe<Array<Maybe<(
    { __typename?: 'Entity' }
    & MinimalEntityFragment
  )>>> };

export type FullRelationFragment = { __typename?: 'Relation', key: string, type: RelationType, label?: Maybe<string> };

export type JobFragment = { __typename?: 'Job', job_type?: Maybe<string>, job_info?: Maybe<string>, status?: Maybe<string>, user?: Maybe<string>, asset_id?: Maybe<string>, mediafile_id?: Maybe<string>, parent_job_id?: Maybe<string>, end_time?: Maybe<string>, start_time?: Maybe<string>, amount_of_jobs?: Maybe<number>, completed_jobs?: Maybe<number>, _id?: Maybe<string>, _key?: Maybe<string>, _rev?: Maybe<string> };

export type JobWithSubJobsFragment = (
  { __typename?: 'Job', sub_jobs?: Maybe<Array<Maybe<(
    { __typename?: 'Job' }
    & JobFragment
  )>>> }
  & JobFragment
);

export type GetEntitiesQueryVariables = Exact<{
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  searchValue: SearchFilter;
}>;


export type GetEntitiesQuery = { __typename?: 'Query', Entities?: Maybe<{ __typename?: 'EntitiesResults', count?: Maybe<number>, limit?: Maybe<number>, results?: Maybe<Array<Maybe<(
      { __typename?: 'Entity' }
      & MinimalEntityFragment
    )>>> }> };

export type GetFullEntitiesQueryVariables = Exact<{
  limit?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  searchValue: SearchFilter;
  fetchPolicy?: Maybe<Scalars['String']>;
}>;


export type GetFullEntitiesQuery = { __typename?: 'Query', Entities?: Maybe<{ __typename?: 'EntitiesResults', count?: Maybe<number>, limit?: Maybe<number>, results?: Maybe<Array<Maybe<(
      { __typename?: 'Entity' }
      & FullEntityFragment
    )>>> }> };

export type GetEntityByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetEntityByIdQuery = { __typename?: 'Query', Entity?: Maybe<(
    { __typename?: 'Entity' }
    & FullEntityFragment
  )> };

export type GetDirectoriesQueryVariables = Exact<{
  dir?: Maybe<Scalars['String']>;
}>;


export type GetDirectoriesQuery = { __typename?: 'Query', Directories?: Maybe<Array<Maybe<{ __typename?: 'Directory', id?: Maybe<string>, dir?: Maybe<string>, has_subdirs?: Maybe<boolean>, parent: string }>>> };

export type GetEnumsByNameQueryVariables = Exact<{
  enumName: Scalars['String'];
}>;


export type GetEnumsByNameQuery = { __typename?: 'Query', __type?: Maybe<{ __typename?: '__Type', name?: Maybe<string>, enumValues?: Maybe<Array<{ __typename?: '__EnumValue', name: string }>> }> };

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

export type PostStartImportMutationVariables = Exact<{
  folder: Scalars['String'];
}>;


export type PostStartImportMutation = { __typename?: 'Mutation', StartImport?: Maybe<{ __typename?: 'ImportReturn', message_id?: Maybe<string> }> };

export type EditMetadataMutationVariables = Exact<{
  id: Scalars['String'];
  metadata: Array<MetadataInput> | MetadataInput;
}>;


export type EditMetadataMutation = { __typename?: 'Mutation', replaceMetadata: Array<{ __typename?: 'Metadata', key: MetaKey, value?: Maybe<string>, lang?: Maybe<string> }> };

export type AddComponentMutationVariables = Exact<{
  id: Scalars['String'];
  relations: Array<RelationInput> | RelationInput;
}>;


export type AddComponentMutation = { __typename?: 'Mutation', addRelations: Array<Maybe<{ __typename?: 'Relation', key: string, type: RelationType }>> };

export const NestedEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"nestedEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"metadataCollection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"nested"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unMappedKey"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}}]} as unknown as DocumentNode<NestedEntityFragment, unknown>;
export const MinimalEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"minimalEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"title"},{"kind":"EnumValue","value":"object_number"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primary_mediafile"}}]}}]} as unknown as DocumentNode<MinimalEntityFragment, unknown>;
export const FullEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"title"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"immutable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mediafiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"original_file_location"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail_file_location"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadataCollection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"nested"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unMappedKey"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"nestedMetaData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"nestedEntity"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"parents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalEntity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"components"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalEntity"}}]}}]}},...NestedEntityFragmentDoc.definitions,...MinimalEntityFragmentDoc.definitions]} as unknown as DocumentNode<FullEntityFragment, unknown>;
export const FullRelationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullRelation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Relation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<FullRelationFragment, unknown>;
export const JobFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"job"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Job"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"job_type"}},{"kind":"Field","name":{"kind":"Name","value":"job_type"}},{"kind":"Field","name":{"kind":"Name","value":"job_info"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"user"}},{"kind":"Field","name":{"kind":"Name","value":"asset_id"}},{"kind":"Field","name":{"kind":"Name","value":"mediafile_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent_job_id"}},{"kind":"Field","name":{"kind":"Name","value":"end_time"}},{"kind":"Field","name":{"kind":"Name","value":"start_time"}},{"kind":"Field","name":{"kind":"Name","value":"amount_of_jobs"}},{"kind":"Field","name":{"kind":"Name","value":"completed_jobs"}},{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"_key"}},{"kind":"Field","name":{"kind":"Name","value":"_rev"}}]}}]} as unknown as DocumentNode<JobFragment, unknown>;
export const JobWithSubJobsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"jobWithSubJobs"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Job"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}},{"kind":"Field","name":{"kind":"Name","value":"sub_jobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}}]}}]}},...JobFragmentDoc.definitions]} as unknown as DocumentNode<JobWithSubJobsFragment, unknown>;
export const GetEntitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalEntity"}}]}}]}}]}},...MinimalEntityFragmentDoc.definitions]} as unknown as DocumentNode<GetEntitiesQuery, GetEntitiesQueryVariables>;
export const GetFullEntitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getFullEntities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchFilter"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fetchPolicy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}}},{"kind":"Argument","name":{"kind":"Name","value":"fetchPolicy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fetchPolicy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}}]}}]}}]}},...FullEntityFragmentDoc.definitions]} as unknown as DocumentNode<GetFullEntitiesQuery, GetFullEntitiesQueryVariables>;
export const GetEntityByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntityById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}}]}}]}},...FullEntityFragmentDoc.definitions]} as unknown as DocumentNode<GetEntityByIdQuery, GetEntityByIdQueryVariables>;
export const GetDirectoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getDirectories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dir"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Directories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dir"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dir"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dir"}},{"kind":"Field","name":{"kind":"Name","value":"has_subdirs"}},{"kind":"Field","name":{"kind":"Name","value":"parent"}}]}}]}}]} as unknown as DocumentNode<GetDirectoriesQuery, GetDirectoriesQueryVariables>;
export const GetEnumsByNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEnumsByName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enumName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__type"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enumName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enumValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetEnumsByNameQuery, GetEnumsByNameQueryVariables>;
export const GetJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getJobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paginationInfo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInfo"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Jobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paginationInfo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paginationInfo"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"job"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"next"}}]}}]}},...JobFragmentDoc.definitions]} as unknown as DocumentNode<GetJobsQuery, GetJobsQueryVariables>;
export const GetJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Job"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"jobWithSubJobs"}}]}}]}},...JobWithSubJobsFragmentDoc.definitions]} as unknown as DocumentNode<GetJobQuery, GetJobQueryVariables>;
export const PostStartImportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"postStartImport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folder"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"StartImport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"folder"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folder"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message_id"}}]}}]}}]} as unknown as DocumentNode<PostStartImportMutation, PostStartImportMutationVariables>;
export const EditMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"editMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replaceMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"metadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}}]}}]}}]} as unknown as DocumentNode<EditMetadataMutation, EditMetadataMutationVariables>;
export const AddComponentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addComponent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"relations"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RelationInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addRelations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"relations"},"value":{"kind":"Variable","name":{"kind":"Name","value":"relations"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<AddComponentMutation, AddComponentMutationVariables>;