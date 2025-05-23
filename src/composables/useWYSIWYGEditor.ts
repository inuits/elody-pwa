import { WysiwygExtensions } from "@/generated-types/queries";

type ExtensionInfo = {
  importName: string;
  from: () => any;
  isNamedExport?: boolean;
  configuration?: WysiwygExtensions[];
};

export const useWYSIWYGEditor = (): {
  editorExtensionImportMapping: Record<WysiwygExtensions, ExtensionInfo>;
  importEditorExtensions: (extensions: WysiwygExtensions[]) => Promise<any>;
  getExtensionConfiguration: (extensions: WysiwygExtensions[]) => any[];
} => {
  const editorExtensionImportMapping: Record<WysiwygExtensions, ExtensionInfo> =
    {
      // Base-extensions if you don't want to use the starterkit
      [WysiwygExtensions.Doc]: {
        importName: "Document",
        from: () => import("@tiptap/extension-document"),
      },
      [WysiwygExtensions.Paragraph]: {
        importName: "Paragraph",
        from: () => import("@tiptap/extension-paragraph"),
      },
      [WysiwygExtensions.Text]: {
        importName: "Text",
        from: () => import("@tiptap/extension-text"),
      },
      // End of base-extensions
      [WysiwygExtensions.Color]: {
        importName: "Color",
        from: () => import("@tiptap/extension-color"),
        isNamedExport: true,
        configuration: [
          WysiwygExtensions.TextStyle,
          WysiwygExtensions.ListItem,
        ],
      },
      [WysiwygExtensions.ListItem]: {
        importName: "ListItem",
        from: () => import("@tiptap/extension-list-item"),
      },
      [WysiwygExtensions.StarterKit]: {
        importName: "StarterKit",
        from: () => import("@tiptap/starter-kit"),
      },
      [WysiwygExtensions.TextStyle]: {
        importName: "TextStyle",
        from: () => import("@tiptap/extension-text-style"),
        configuration: [WysiwygExtensions.ListItem],
      },
      [WysiwygExtensions.Italic]: {
        importName: "Italic",
        from: () => import("@tiptap/extension-italic"),
      },
      [WysiwygExtensions.Bold]: {
        importName: "Bold",
        from: () => import("@tiptap/extension-bold"),
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
          const module = await from();
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

  return {
    importEditorExtensions,
    getExtensionConfiguration,
    editorExtensionImportMapping,
  };
};
