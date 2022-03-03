import {
  Entity,
  Form,
  InputFieldTypes,
  Maybe,
  Metadata,
  MetadataAndRelation,
  MetadataField,
  MetadataOrRelationField,
  MetadataRelation,
  RelationField,
  RelationMetaData,
} from '@/queries';

export const LINKED_ENTITY: string = 'linkedEntity';

export type relationValues = {
  linkedEntity: Maybe<Entity> | undefined;
  metadata: IntialValues;
};

export type IntialValues = Record<string, string | relationValues[]>;

const useFormHelper = (form: Form, entityTitle: string) => {
  const formStructure: MetadataOrRelationField[] =
    form.fields as MetadataOrRelationField[];
  const title: string = entityTitle;

  const buildInitialValues = (
    metadata: MetadataAndRelation[],
    structure: MetadataOrRelationField[] = formStructure,
  ) => {
    const intialValues: IntialValues = {};
    structure.forEach((field: Maybe<MetadataOrRelationField>) => {
      if (field && field?.__typename === 'MetadataField') {
        findFields(field.key, metadata).forEach((metadata: { value: string }) => {
          intialValues[field.key] = metadata.value;
        });
      }

      if (field && field?.__typename === 'RelationField') {
        const relationArray: relationValues[] = [];
        findRelations(field.relationType, metadata).forEach(
          (relationMetaData: MetadataRelation) => {
            relationArray.push({
              linkedEntity: relationMetaData.linkedEntity,
              metadata: buildInitialValues(
                relationMetaData.metadataOnRelation as MetadataAndRelation[],
                field.metadata as MetadataOrRelationField[],
              ),
            });
          },
        );
        intialValues[field.relationType] = relationArray;
      }
    });
    return intialValues;
  };

  //Todo typename `RelationMetaData` not checked properly
  const findFields = (
    key: string,
    metadata: MetadataAndRelation[],
  ): { value: string }[] => {
    // Special case
    if (key === 'title') {
      return [{ value: title }];
    }
    //Search in metadata
    return metadata?.filter((element: RelationMetaData | Metadata | MetadataRelation) => {
      return (
        element &&
        (element.__typename === 'Metadata' ||
          element.__typename === 'RelationMetaData') &&
        element.key === key
      );
    });
  };

  const findRelations = (type: string, metadata: MetadataAndRelation[]) => {
    return metadata?.filter((element) => {
      return (
        element && element.__typename === 'MetadataRelation' && element.type === type
      );
    }) as MetadataRelation[];
  };

  return { buildInitialValues };
};

export const getEmptyMetadatRelationObject = (fields: RelationField) => {
  const intialValue: relationValues = {
    linkedEntity: undefined,
    metadata: {},
  };
  if (fields.metadata) {
    fields.metadata?.forEach((field: Maybe<MetadataField>) => {
      if (field) intialValue.metadata[field.key] = '';
    });
  }
  console.log(intialValue);
  return intialValue;
};

export default useFormHelper;
