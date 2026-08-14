import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TextViewer from "./TextViewer.vue";

const transcript =
  "Beste Theo,\n\n" +
  "Vandaag heb ik het zelfportret met de strohoed voltooid. " +
  "Het licht in de tuin was uitstekend deze ochtend.\n\n" +
  "Je broer,\nVincent";

// The component fetches its text from /api/mediafile/<id> on mount; stub
// fetch for that path so the story is self-contained without a backend.
const withMediafileFetchStub = (storyFn: any) => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: any, init?: any) => {
    const url = typeof input === "string" ? input : input?.url;
    if (url?.startsWith("/api/mediafile/")) {
      return Promise.resolve(
        new Response(transcript, {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        }),
      );
    }
    return originalFetch(input, init);
  }) as typeof window.fetch;
  return storyFn();
};

const meta: Meta<typeof TextViewer> = {
  title: "Base/TextViewer",
  component: TextViewer,
  tags: ["autodocs"],
  decorators: [
    withMediafileFetchStub,
    () => ({ template: '<div class="w-[32rem] h-80 p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof TextViewer>;

export const Default: Story = {
  args: {
    source: {
      id: "mediafile-text-001",
      original_filename: "transcriptie-brief-1889.txt",
      intialValues: {
        original_file_location: "/download/transcriptie-brief-1889.txt",
      },
    },
  },
};
