import OpenSeadragon from "openseadragon";

// Make OpenSeadragon available globally
(window as any).OpenSeadragon = OpenSeadragon;

// Helper function to safely load the plugin
export const loadSelectionPlugin = async () => {
  try {
    const plugin = await import("openseadragon-select-plugin");
    return plugin;
  } catch (error) {
    console.error("Failed to load openseadragon-select-plugin:", error);
    throw error;
  }
};