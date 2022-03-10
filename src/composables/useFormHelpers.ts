import {
  Entity,
  Form,
  Maybe,
  Metadata,
  MetadataAndRelation,
  MetadataField,
  MetadataFormInput,
  MetadataOrRelationField,
  MetadataRelation,
  RelationField,
  RelationMetaData,
} from '@/queries';

export const LINKED_ENTITY: string = 'linkedEntity';

export type relationValues = {
  linkedEntity: Maybe<Entity> | undefined;
  key: string;
  label: string;
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
              key: relationMetaData.key,
              label: field.label ? field.label : relationMetaData.key,
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

  const serialzeFormToInput = (values: IntialValues): MetadataFormInput => {
    const input: MetadataFormInput = {
      Metadata: [],
      relations: [],
    };
    console.log(values);
    Object.entries(values).forEach((value: [string, string | relationValues[]]) => {
      if (typeof value[1] === 'string') {
        input.Metadata?.push({ key: value[0], value: value[1] });
      }
      if (typeof value[1] === 'object') {
        value[1].forEach((relationValue) => {
          input.relations?.push({
            relationType: value[0],
            linkedEntityId: relationValue.key,
            label: relationValue.label,
            metadata: Object.entries(relationValue.metadata).map((value) => {
              if (typeof value[1] === 'string') {
                return { key: value[0], value: value[1] };
              }
              return { key: '', value: '' };
            }),
          });
        });
      }
    });
    return input;
  };

  return { buildInitialValues, serialzeFormToInput };
};

export const getEmptyMetadatRelationObject = (
  fields: RelationField,
  id: string,
  linkedEntity: Entity | undefined = undefined,
) => {
  const intialValue: relationValues = {
    linkedEntity: linkedEntity,
    key: id,
    label: fields.label ? fields.label : '',
    metadata: {},
  };
  if (fields.metadata) {
    fields.metadata?.forEach((field: Maybe<MetadataField>) => {
      if (field) intialValue.metadata[field.key] = '';
    });
  }
  return intialValue;
};

export default useFormHelper;
