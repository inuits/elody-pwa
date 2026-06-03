import { ref } from "vue";

export type InfoPanelContent = {
  title: string;
  content: string;
};

const activePanel = ref<InfoPanelContent | null>(null);

export const useInfoPanel = () => {
  const openPanel = (panel: InfoPanelContent) => {
    activePanel.value = panel;
  };

  const closePanel = () => {
    activePanel.value = null;
  };

  return {
    activePanel,
    openPanel,
    closePanel,
  };
};
