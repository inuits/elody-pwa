import { WysiwygExtensions } from "@/generated-types/queries";
import type { HTMLContent } from "@tiptap/core";

type ExtensionInfo = {
  importName: string;
  from: () => any;
  isNamedExport?: boolean;
  configuration?: { [key: string]: any };
  extend?: { [key: string]: any };
};

export const useWYSIWYGEditor = (): {
  editorExtensionImportMapping: Record<WysiwygExtensions, ExtensionInfo>;
  importEditorExtensions: (extensions: WysiwygExtensions[]) => Promise<any>;
  getExtensionConfiguration: (extensions: WysiwygExtensions[]) => any[];
  countLinesOfContent: (content: HTMLContent) => number;
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
        configuration: {
          types: [WysiwygExtensions.TextStyle, WysiwygExtensions.ListItem],
        },
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
        configuration: { types: [WysiwygExtensions.ListItem] },
      },
      [WysiwygExtensions.Italic]: {
        importName: "Italic",
        from: () => import("@tiptap/extension-italic"),
      },
      [WysiwygExtensions.Bold]: {
        importName: "Bold",
        from: () => import("@tiptap/extension-bold"),
      },
      [WysiwygExtensions.HardBreak]: {
        importName: "HardBreak",
        from: () => import("@tiptap/extension-hard-break"),
        extend: {
          addKeyboardShortcuts() {
            return {
              Enter: () => this.editor.commands.setHardBreak(),
            };
          },
        },
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
          console.error(`Error importing ${extension}:`, e);
          throw e;
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
        const extensionConfig: ExtensionInfo =
          editorExtensionImportMapping[extension];

        const importedExtension = importedExtensions.find(
          (ext: any) => ext.name.toLowerCase() === extension.toLowerCase(),
        );

        if (!importedExtension) {
          throw Error(`Tiptap extension with name '${extension}' not found.`);
        }

        let configuredExtension = importedExtension;

        if (extensionConfig.configuration) {
          configuredExtension = configuredExtension.configure(
            extensionConfig.configuration,
          );
        }

        if (extensionConfig.extend) {
          configuredExtension = configuredExtension.extend(
            extensionConfig.extend,
          );
        }

        return configuredExtension;
      })
      .filter(Boolean);
  };

  const countLinesOfContent = (content: HTMLContent): number => {
    return content.split("<br>").length;
  };

  return {
    importEditorExtensions,
    getExtensionConfiguration,
    editorExtensionImportMapping,
    countLinesOfContent,
  };
};
