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
  label?: Maybe<Scalars['String']>;
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
};


export type EntityMetadataArgs = {
  key?: Maybe<Array<Maybe<MetaKey>>>;
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

export type MediaFile = {
  __typename?: 'MediaFile';
  _id: Scalars['String'];
  original_file_location?: Maybe<Scalars['String']>;
  thumbnail_file_location?: Maybe<Scalars['String']>;
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

export type Query = {
  __typename?: 'Query';
  Entity?: Maybe<Entity>;
  Entities?: Maybe<EntitiesResults>;
  User?: Maybe<User>;
  Directories?: Maybe<Array<Maybe<Directory>>>;
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

export type Relation = {
  __typename?: 'Relation';
  key: Scalars['String'];
  type: RelationType;
};

export enum RelationType {
  AuthoredBy = 'authoredBy',
  IsIn = 'isIn',
  Contains = 'contains'
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

export type MinimalEntityFragment = { __typename?: 'Entity', id: string, type: string, metadata: Array<Maybe<{ __typename?: 'Metadata', key: MetaKey, value: string }>>, mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', thumbnail_file_location?: Maybe<string> }>>> };

export type FullEntityFragment = { __typename?: 'Entity', id: string, type: string, title: Array<Maybe<{ __typename?: 'Metadata', key: MetaKey, value: string }>>, metadata: Array<Maybe<{ __typename?: 'Metadata', key: MetaKey, value: string }>>, mediafiles?: Maybe<Array<Maybe<{ __typename?: 'MediaFile', _id: string, original_file_location?: Maybe<string> }>>>, relations?: Maybe<Array<Maybe<{ __typename?: 'Relation', key: string, type: RelationType }>>> };

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

export type GetDirectoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDirectoriesQuery = { __typename?: 'Query', Directories?: Maybe<Array<Maybe<{ __typename?: 'Directory', id?: Maybe<string>, label?: Maybe<string>, parent: string }>>> };

export type GetEnumsByNameQueryVariables = Exact<{
  enumName: Scalars['String'];
}>;


export type GetEnumsByNameQuery = { __typename?: 'Query', __type?: Maybe<{ __typename?: '__Type', name?: Maybe<string>, enumValues?: Maybe<Array<{ __typename?: '__EnumValue', name: string }>> }> };

export type PostStartImportMutationVariables = Exact<{
  folder: Scalars['String'];
}>;


export type PostStartImportMutation = { __typename?: 'Mutation', StartImport?: Maybe<{ __typename?: 'ImportReturn', message_id?: Maybe<string> }> };

export type EditMetadataMutationVariables = Exact<{
  id: Scalars['String'];
  metadata: Array<MetadataInput> | MetadataInput;
}>;


export type EditMetadataMutation = { __typename?: 'Mutation', replaceMetadata: Array<{ __typename?: 'Metadata', key: MetaKey, value: string, lang?: Maybe<string> }> };

export const MinimalEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"minimalEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"title"},{"kind":"EnumValue","value":"type"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mediafiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"thumbnail_file_location"}}]}}]}}]} as unknown as DocumentNode<MinimalEntityFragment, unknown>;
export const FullEntityFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullEntity"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"title"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"description"},{"kind":"EnumValue","value":"material"},{"kind":"EnumValue","value":"type"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mediafiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"original_file_location"}}]}},{"kind":"Field","name":{"kind":"Name","value":"relations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<FullEntityFragment, unknown>;
export const GetEntitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"minimalEntity"}}]}}]}}]}},...MinimalEntityFragmentDoc.definitions]} as unknown as DocumentNode<GetEntitiesQuery, GetEntitiesQueryVariables>;
export const GetFullEntitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getFullEntities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchFilter"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fetchPolicy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchValue"}}},{"kind":"Argument","name":{"kind":"Name","value":"fetchPolicy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fetchPolicy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}}]}}]}}]}},...FullEntityFragmentDoc.definitions]} as unknown as DocumentNode<GetFullEntitiesQuery, GetFullEntitiesQueryVariables>;
export const GetEntityByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEntityById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Entity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullEntity"}}]}}]}},...FullEntityFragmentDoc.definitions]} as unknown as DocumentNode<GetEntityByIdQuery, GetEntityByIdQueryVariables>;
export const GetDirectoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getDirectories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Directories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"parent"}}]}}]}}]} as unknown as DocumentNode<GetDirectoriesQuery, GetDirectoriesQueryVariables>;
export const GetEnumsByNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEnumsByName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enumName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__type"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enumName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enumValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetEnumsByNameQuery, GetEnumsByNameQueryVariables>;
export const PostStartImportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"postStartImport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folder"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"StartImport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"folder"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folder"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message_id"}}]}}]}}]} as unknown as DocumentNode<PostStartImportMutation, PostStartImportMutationVariables>;
export const EditMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"editMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replaceMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"metadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}}]}}]}}]} as unknown as DocumentNode<EditMetadataMutation, EditMetadataMutationVariables>;