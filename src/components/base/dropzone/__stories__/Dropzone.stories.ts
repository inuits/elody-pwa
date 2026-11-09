import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DropzoneView from "../DropzoneView.vue";
import ProgressBar from "@/components/ProgressBar.vue";

const meta: Meta = {
  // Story id components-dropzone--progress, per MANIFEST.md.
  title: "Components/Dropzone",
  parameters: {
    docs: {
      description: {
        component:
          "The upload surface: a focusable dashed zone (Enter opens the file " +
          "dialog; dropzone.js binds the click), one row per file with a " +
          "commit-teal progress bar, a per-file state glyph and a named " +
          "cancel, and a status banner counting the batch. A failed row " +
          "keeps its place with a retry link — failures never abort the " +
          "batch, and failed rows are never cleared automatically.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const fileRow = (name: string, size: string, progress: number, state: string) => `
  <li style="display:flex;align-items:center;gap:10px;padding:8px 12px;
             border:1px solid var(--color-border-subtle);border-radius:var(--radius-input)">
    <div style="flex:1;min-width:0">
      <p style="font-size:var(--text-table)">
        ${name}
        <span style="color:var(--color-text-subtle)">· ${size}</span>
      </p>
      <div style="height:4px;margin-top:4px">
        <progress-bar :progress="${progress}" progress-bar-type="percentage" style="height:4px;display:block" />
      </div>
    </div>
    ${state}
    <button type="button" aria-label="Verwijder bestand"
            style="flex:none;color:var(--color-text-subtle)">✕</button>
  </li>`;

export const Progress: Story = {
  render: () => ({
    components: { DropzoneView, ProgressBar },
    template: `
      <div style="max-width:520px;display:flex;flex-direction:column;gap:16px">
        <div style="height:120px">
          <dropzone-view :model-value="undefined" dropzone-label="Sleep bestanden hierheen of blader" :is-validation="false" :file-count="0" style="" />
        </div>

        <p role="status" style="padding:6px 12px;background:var(--color-surface-panel-header);
           color:var(--color-text-panel-header);border-radius:var(--radius-input);font-size:var(--text-ui);font-weight:700">
          2 van 4 geüpload
        </p>

        <ul style="display:flex;flex-direction:column;gap:8px">
          ${fileRow("scan-001.tiff", "48 MB", 100, '<span aria-hidden="true" style="color:var(--color-success)">✓</span>')}
          ${fileRow("scan-002.tiff", "51 MB", 100, '<span aria-hidden="true" style="color:var(--color-success)">✓</span>')}
          ${fileRow("scan-003.tiff", "47 MB", 62, '<span style="font-size:var(--text-hint);color:var(--color-text-secondary)">62%</span>')}
          <li role="alert" style="display:flex;align-items:center;gap:10px;padding:8px 12px;
                     border:1px solid var(--color-danger);border-radius:var(--radius-input)">
            <div style="flex:1;min-width:0">
              <p style="font-size:var(--text-table);color:var(--color-danger)">
                scan-004.tiff <span style="opacity:.7">· upload mislukt</span>
              </p>
            </div>
            <button type="button" style="flex:none;font-size:var(--text-table);text-decoration:underline;color:var(--color-text-link)">
              Opnieuw
            </button>
          </li>
        </ul>
      </div>`,
  }),
};
