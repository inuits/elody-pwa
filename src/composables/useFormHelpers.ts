import { ref } from "vue";
import type {
  Entity,
  Form,
  Maybe,
  MediaFileEntity,
  MediaFileMetadata,
  Metadata,
  MetadataAndRelation,
  MetadataField,
  MetadataFormInput,
  MetadataOrRelationField,
  MetadataRelation,
  RelationField,
} from "@/queries";
import type { RelationMetaData } from "@/queries";
import useMetaDataHelper from '@/composables/useMetaDataHelper';

export const LINKED_ENTITY: string = "linkedEntity";
export const selectedRelationField = ref<RelationField>();
const noKey = 'no-key';

export type relationValues = {
  linkedEntity: Maybe<MediaFileEntity> | undefined;
  key: string;
  label?: string;
  metadata: IntialValues;
  relationType: string;
  value: string;
};

export type IntialValues = Record<string, string | relationValues[]>;

const setLabel = (field:  Maybe<MetadataOrRelationField>) => {
  if (field.key !== noKey) {
    return field.key
  } else {
    return undefined
  }
}

const useFormHelper = (form: Form, entityTitle: string) => {
  const formStructure: MetadataOrRelationField[] =
  form.fields as MetadataOrRelationField[];
  const title: string = entityTitle;

  const getValue = (rmd: MetadataRelation): string => {
    //@ts-ignore
    return rmd.linkedEntity.teaserMetadata.length > 0 ? rmd.linkedEntity.teaserMetadata[0].value : undefined
  }

  const buildInitialValues = (
    metadata: MetadataAndRelation[],
    structure: MetadataOrRelationField[] = formStructure
  ) => {
    const intialValues: IntialValues = {};
    let additionalIndex: number = 0;
    if (structure) {
      structure.forEach((field: Maybe<MetadataOrRelationField>) => {
        if (field && field?.__typename === "MetadataField") {
          findFields(field.key, metadata).forEach(
            (metadata: { value: string }) => {
              intialValues[field.key] = metadata.value;
            }
          );
          additionalIndex = additionalIndex + 1;
        }

        if (field && field?.__typename === "RelationField") {
          const relationArray: relationValues[] = [];

          const pushIntoRelationArray = (relationMetaData: MetadataRelation) => {

            relationArray.push({
              linkedEntity: relationMetaData.linkedEntity,
              key: relationMetaData.key,
              label: relationMetaData.label ? relationMetaData.label : undefined,
              metadata: buildInitialValues(
                relationMetaData.metadataOnRelation as MetadataAndRelation[],
                field.metadata as MetadataOrRelationField[]
              ),
              relationType: field.relationType ? field.relationType : "",
              value: getValue(relationMetaData)
            });
          }
          
          findRelations(field.relationType, metadata).forEach(
            (relationMetaData: MetadataRelation) => {
              // console.log('field', field);
              // console.log('relationMetaData', relationMetaData);
              if ((field.key) && (relationMetaData.label === field.key) || (relationMetaData.label === field.label)) {
                pushIntoRelationArray(relationMetaData);
              }
              else if (field.key === noKey) {
                pushIntoRelationArray(relationMetaData);
              }
              // CHECK IF RELATION TYPE ONLY OCCURS ONCE --> AVOID TO SET MULTIPLE TIMES AS FOR EXAMPLE IN A FRAME.
              // else if (structure.filter((f: Maybe<MetadataOrRelationField>) => { return (f?.__typename === "RelationField" && (f.relationType === field.relationType)) }).length === 1)
              // {
              //   pushIntoRelationArray(relationMetaData);
              // }
            }
          );
          intialValues[field.label ? field.label : field.relationType] =
            relationArray;
        }
      });
    }
    return intialValues;
  };

  //Todo typename `RelationMetaData` not checked properly
  const findFields = (
    key: string,
    metadata: MetadataAndRelation[]
  ): { value: string }[] => {
    // Special case
    if (key === "title") {
      return [{ value: title }];
    }
    //Search in metadata
    return metadata?.filter(
      (
        element:
          | RelationMetaData
          | Metadata
          | MetadataRelation
          | MediaFileMetadata
      ) => {
        return (
          element &&
          (element.__typename === "Metadata" ||
            element.__typename === "MediaFileMetadata" ||
            element.__typename === "RelationMetaData") &&
          element.key === key
        );
      }
    );
  };

  const findRelations = (type: string, metadata: MetadataAndRelation[]) => {
    return metadata?.filter((element) => {
      return (
        element &&
        element.__typename === "MetadataRelation" &&
        element.type === type
      );
    }) as MetadataRelation[];
  };

  const { metadataToBePatched } = useMetaDataHelper();

  const serialzeFormToInput = (values: IntialValues, originalStructure: MetadataAndRelation[]): MetadataFormInput => {
    const input: MetadataFormInput = {
      Metadata: [],
      relations: [],
    };
    Object.entries(values).forEach(
      (value: [string, string | relationValues[]]) => {
        if (typeof value[1] === "string") {
          input.Metadata?.push({ key: value[0], value: value[1] });
        }
        if (typeof value[1] === "object") {
          console.log(value[1]);
          value[1].forEach((relationValue) => {
            input.relations?.push({
              relationType: relationValue.relationType,
              linkedEntityId: relationValue.key,
              label: relationValue.label,
              metadata: Object.entries(relationValue.metadata).map((value) => {
                if (typeof value[1] === "string") {
                  return { key: value[0], value: value[1] };
                }
                return { key: "", value: "" };
              }),
              //@ts-ignore
              value: relationValue.value ? relationValue.value : getValue(relationValue)
            });
          });
        }
      }
    );

    input.relations.filter((r: any) => { return (metadataToBePatched.value.metadata.some((s: any) => s === r.linkedEntityId))})
    return input;
  };

  return { buildInitialValues, serialzeFormToInput };
};

export const getEmptyMetadatRelationObject = (
  fields: RelationField,
  id: string,
  linkedEntity: Entity | undefined = undefined
) => {
  const intialValue: relationValues = {
    linkedEntity: linkedEntity,
    key: id,
    label: setLabel(fields),
    metadata: {},
    relationType: fields.relationType ? fields.relationType : "",
    value: undefined
  };
  if (fields.metadata) {
    fields.metadata?.forEach((field: Maybe<MetadataField>) => {
      if (field?.type === "boolean") intialValue.metadata[field.key] = "false";
      if (field?.type === "text") intialValue.metadata[field.key] = "";
    });
  }
  return intialValue;
};

export default useFormHelper;
