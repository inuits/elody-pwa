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
      // Base-extensions if you don't want to use the starterkit
      [WysiwygExtensions.Doc]: {
        importName: "Document",
        from: "node_modules/@tiptap/extension-document",
      },
      [WysiwygExtensions.Paragraph]: {
        importName: "Paragraph",
        from: "node_modules/@tiptap/extension-paragraph",
      },
      [WysiwygExtensions.Text]: {
        importName: "Text",
        from: "node_modules/@tiptap/extension-text",
      },
      // End of base-extensions
      [WysiwygExtensions.Color]: {
        importName: "Color",
        from: "node_modules/@tiptap/extension-color",
        isNamedExport: true,
        configuration: [
          WysiwygExtensions.TextStyle,
          WysiwygExtensions.ListItem,
        ],
      },
      [WysiwygExtensions.ListItem]: {
        importName: "ListItem",
        from: "node_modules/@tiptap/extension-list-item",
      },
      [WysiwygExtensions.StarterKit]: {
        importName: "StarterKit",
        from: "node_modules/@tiptap/starter-kit",
      },
      [WysiwygExtensions.TextStyle]: {
        importName: "TextStyle",
        from: "node_modules/@tiptap/extension-text-style",
        configuration: [WysiwygExtensions.ListItem],
      },
      [WysiwygExtensions.Italic]: {
        importName: "Italic",
        from: "node_modules/@tiptap/extension-italic",
      },
      [WysiwygExtensions.Bold]: {
        importName: "Bold",
        from: "node_modules/@tiptap/extension-bold",
      },
      [WysiwygExtensions.ElodyTaggingExtension]: {
        importName: "ElodyTaggingExtension",
        from: "src/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension",
      },
    };

  const importEditorExtensions = async (
    extensions: WysiwygExtensions[],
  ): Promise<any> => {
    return await Promise.all(
      extensions.map(async (extension) => {
        const { from, isNamedExport, importName } =
          editorExtensionImportMapping[extension];
        try {
          const module = await import(`../../${from}`);
          return isNamedExport ? module[importName] : module.default;
        } catch (e) {
          console.error(`Error importing ${extension}:`, error);
          throw error;
        }
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

        const importedExtension = importedExtensions.find(
          (ext) => ext.name.toLowerCase() === extension.toLowerCase(),
        );

        console.log(importedExtension);

        if (!importedExtension) {
          throw Error(`Tiptap extension with name '${extension}' not found.`);
        }

        if (extensionConfig.configuration) {
          return importedExtension.configure({
            types: extensionConfig.configuration,
          });
        }

        return importedExtension;
      })
      .filter(Boolean);
  };

  return { importEditorExtensions, getExtensionConfiguration };
};
