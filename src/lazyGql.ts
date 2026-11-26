import {
  Kind,
  parse,
  type DefinitionNode,
  type DocumentNode,
} from "graphql";

const nameOf = (definition: DefinitionNode) =>
  "name" in definition ? definition.name?.value : undefined;

const keep = (target: object, value: readonly DefinitionNode[]) => {
  Object.defineProperty(target, "definitions", {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  return value;
};

export const gql = (
  strings: TemplateStringsArray,
  ...fragments: DocumentNode[]
): DocumentNode => {
  let definitions: readonly DefinitionNode[] | undefined;
  const parseOnce = () => {
    if (definitions) return definitions;
    const merged = [...parse(strings.join("\n")).definitions];
    const seen = new Set(merged.map(nameOf));
    fragments
      .flatMap((fragment) => fragment.definitions)
      .forEach((definition) => {
        const name = nameOf(definition);
        if (name && seen.has(name)) return;
        seen.add(name);
        merged.push(definition);
      });
    definitions = merged;
    return definitions;
  };
  return Object.defineProperty(
    { kind: Kind.DOCUMENT } as DocumentNode,
    "definitions",
    {
      enumerable: true,
      configurable: true,
      get(this: object) {
        return keep(this, parseOnce());
      },
      set(this: object, value: readonly DefinitionNode[]) {
        keep(this, value);
      },
    },
  );
};
