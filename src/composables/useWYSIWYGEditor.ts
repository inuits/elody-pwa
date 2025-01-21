import { WysiwygExtensions } from "@/generated-types/queries";

type ExtensionInfo = {
  importName: string;
  from: string;
  isNamedExport?: boolean;
  configuration?: WysiwygExtensions[];
};

export const useWYSIWYGEditor = (): {
  importEditorExtensions: (extensions: WysiwygExtensions[]) => Promise<any>;
  getExtensionConfiguration: (extensions: WysiwygExtensions[]) => any[];
} => {
  const editorExtensionImportMapping: Record<WysiwygExtensions, ExtensionInfo> =
    {
      [WysiwygExtensions.color]: {
        importName: "Color",
        from: "/node_modules/@tiptap/extension-color",
        isNamedExport: true,
        configuration: [
          WysiwygExtensions.TextStyle,
          WysiwygExtensions.ListItem,
        ],
      },
      [WysiwygExtensions.ListItem]: {
        importName: "ListItem",
        from: "/node_modules/@tiptap/extension-list-item",
      },
      [WysiwygExtensions.StarterKit]: {
        importName: "StarterKit",
        from: "/node_modules/@tiptap/starter-kit",
      },
      [WysiwygExtensions.TextStyle]: {
        importName: "TextStyle",
        from: "/node_modules/@tiptap/extension-text-style",
        configuration: [WysiwygExtensions.ListItem],
      },
    };

  const importEditorExtensions = async (
    extensions: WysiwygExtensions[],
  ): Promise<any> => {
    return await Promise.all(
      extensions.map(async (extension) => {
        const { from, isNamedExport, importName } =
          editorExtensionImportMapping[extension];
        const module = await import(from);
        return isNamedExport ? module[importName] : module.default;
      }),
    );
  };

  const getExtensionConfiguration = (
    extensions: WysiwygExtensions[],
    importedExtensions: any,
  ): any[] => {
    return extensions
      .map((extension: WysiwygExtensions) => {
        const extensionConfig: extensionInfo =
          editorExtensionImportMapping[extension];
        const capitalizedExtensionName =
          extension.charAt(0).toUpperCase() + extension.slice(1);

        const importedExtension = importedExtensions.find(
          (ext) => ext.name === extension,
        );

        if (importedExtension) {
          if (extensionConfig.configuration) {
            return importedExtension.configure({
              types: extensionConfig.configuration,
            });
          }

          return importedExtension;
        }
        return null;
      })
      .filter(Boolean);
  };

  return { importEditorExtensions, getExtensionConfiguration };
};
