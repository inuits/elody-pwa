import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  colourGroups,
  radiusTokens,
  readToken,
  shadowTokens,
  spacingTokens,
  typeTokens,
} from "../../.storybook/tokens";

// Resolved values are read off <body>, so switching tenant in the toolbar
// updates the printed values as well as the swatches.
const useResolvedTokens = () => {
  const revision = ref(0);
  let observer: MutationObserver;

  onMounted(() => {
    observer = new MutationObserver(() => (revision.value += 1));
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-elody-client"],
    });
  });
  onBeforeUnmount(() => observer?.disconnect());

  return { revision, readToken };
};

const meta: Meta = {
  title: "Foundations/Tokens",
  parameters: {
    docs: {
      description: {
        component:
          "Every value the design system defines, read live from the CSS " +
          "custom properties on <body>. Switch tenant in the toolbar to see " +
          "which tokens are client-swappable and which are platform-fixed.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Colour: Story = {
  name: "Colour",
  render: () => ({
    setup() {
      return { groups: colourGroups, ...useResolvedTokens() };
    },
    template: `
      <div :key="revision" style="display:flex;flex-direction:column;gap:26px">
        <section v-for="group in groups" :key="group.title">
          <h3 style="font-size:var(--text-heading);font-weight:700;margin-bottom:4px">{{ group.title }}</h3>
          <p v-if="group.note" style="font-size:var(--text-hint);color:var(--color-text-muted);margin-bottom:10px;max-width:60ch">{{ group.note }}</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px">
            <div v-for="token in group.tokens" :key="token.name"
                 style="display:flex;gap:8px;align-items:center;background:var(--color-surface);border:1px solid var(--color-border-subtle);border-radius:var(--radius-card);padding:6px">
              <span :style="{
                      width: '34px', height: '34px', flex: '0 0 34px',
                      borderRadius: 'var(--radius-input)',
                      border: '1px solid var(--color-border-default)',
                      background: 'var(' + token.name + ')',
                    }" />
              <span style="min-width:0">
                <code style="font-size:var(--text-label);display:block;overflow-wrap:anywhere">{{ token.name }}</code>
                <span style="font-size:var(--text-hint);color:var(--color-text-muted);display:block">{{ token.use }}</span>
                <span style="font-size:var(--text-hint);color:var(--color-text-subtle);display:block">{{ readToken(token.name) }}</span>
              </span>
            </div>
          </div>
        </section>
      </div>`,
  }),
};

export const Type: Story = {
  render: () => ({
    setup() {
      return { tokens: typeTokens, ...useResolvedTokens() };
    },
    template: `
      <table :key="revision" style="border-collapse:collapse;width:100%;max-width:760px">
        <caption style="text-align:left;font-size:var(--text-hint);color:var(--color-text-muted);padding-bottom:8px">
          Lato 400/700/900. Chrome runs 10.5–15px; --text-value is the reading size for field values and inputs.
        </caption>
        <tbody>
          <tr v-for="token in tokens" :key="token.name" style="border-bottom:1px solid var(--color-border-faint)">
            <td style="padding:8px 10px 8px 0;width:170px"><code style="font-size:var(--text-label)">{{ token.name }}</code></td>
            <td style="padding:8px 10px 8px 0;width:64px;font-size:var(--text-hint);color:var(--color-text-subtle)">{{ readToken(token.name) }}</td>
            <td :style="{ padding: '8px 0', fontSize: 'var(' + token.name + ')' }">{{ token.use }}</td>
          </tr>
        </tbody>
      </table>`,
  }),
};

export const ShapeAndElevation: Story = {
  name: "Shape & elevation",
  render: () => ({
    setup() {
      return { radii: radiusTokens, shadows: shadowTokens, ...useResolvedTokens() };
    },
    template: `
      <div :key="revision" style="display:flex;flex-direction:column;gap:26px">
        <section>
          <h3 style="font-size:var(--text-heading);font-weight:700;margin-bottom:4px">Radii</h3>
          <p style="font-size:var(--text-hint);color:var(--color-text-muted);margin-bottom:10px;max-width:60ch">
            Shape encodes role. Pill (14px) starts something safe and reversible; rectangle (5–6px) executes immediately. Never a pill on a mutating action.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:12px">
            <div v-for="token in radii" :key="token.name" style="text-align:center">
              <div :style="{
                     width: '104px', height: '52px',
                     background: 'var(--color-surface)',
                     border: '1px solid var(--color-border-panel)',
                     borderRadius: 'var(' + token.name + ')',
                   }" />
              <code style="font-size:var(--text-label);display:block;margin-top:4px">{{ token.name }}</code>
              <span style="font-size:var(--text-hint);color:var(--color-text-muted);display:block;max-width:110px">{{ token.use }}</span>
              <span style="font-size:var(--text-hint);color:var(--color-text-subtle)">{{ readToken(token.name) }}</span>
            </div>
          </div>
        </section>
        <section>
          <h3 style="font-size:var(--text-heading);font-weight:700;margin-bottom:4px">Elevation</h3>
          <p style="font-size:var(--text-hint);color:var(--color-text-muted);margin-bottom:14px;max-width:60ch">
            Exactly two levels: cards carry a 1px border and no shadow, only overlays float. There is no third.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:20px">
            <div style="text-align:center">
              <div style="width:140px;height:64px;background:var(--color-surface);border:1px solid var(--color-border-subtle);border-radius:var(--radius-card)" />
              <code style="font-size:var(--text-label);display:block;margin-top:6px">card — 1px border</code>
            </div>
            <div v-for="token in shadows" :key="token.name" style="text-align:center">
              <div :style="{
                     width: '140px', height: '64px',
                     background: 'var(--color-surface)',
                     borderRadius: 'var(--radius-overlay)',
                     boxShadow: 'var(' + token.name + ')',
                   }" />
              <code style="font-size:var(--text-label);display:block;margin-top:6px">{{ token.name }}</code>
              <span style="font-size:var(--text-hint);color:var(--color-text-muted);display:block">{{ token.use }}</span>
            </div>
          </div>
        </section>
      </div>`,
  }),
};

export const SpacingAndMotion: Story = {
  name: "Spacing & motion",
  render: () => ({
    setup() {
      return { tokens: spacingTokens, ...useResolvedTokens() };
    },
    template: `
      <div :key="revision" style="display:flex;flex-direction:column;gap:26px">
        <section>
          <h3 style="font-size:var(--text-heading);font-weight:700;margin-bottom:4px">Spacing</h3>
          <p style="font-size:var(--text-hint);color:var(--color-text-muted);margin-bottom:10px;max-width:60ch">
            A dense scale in 2px steps below 12px — row paddings are tuned in 1–2px on purpose. Namespaced as ds-* so it adds p-ds-4 rather than remapping Tailwind's p-4.
          </p>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div v-for="token in tokens" :key="token" style="display:flex;align-items:center;gap:10px">
              <code style="font-size:var(--text-label);width:140px">{{ token }}</code>
              <span style="font-size:var(--text-hint);color:var(--color-text-subtle);width:44px">{{ readToken(token) }}</span>
              <span :style="{ height: '12px', width: 'var(' + token + ')', background: 'var(--color-accent)' }" />
            </div>
          </div>
        </section>
        <section>
          <h3 style="font-size:var(--text-heading);font-weight:700;margin-bottom:4px">Motion</h3>
          <p style="font-size:var(--text-hint);color:var(--color-text-muted);margin-bottom:10px;max-width:60ch">
            One duration, one easing, one press. Hover the tile to see the transition; press it for the active scale.
          </p>
          <style>
            .ds-motion-demo {
              background: var(--color-accent);
              color: var(--color-text-on-accent);
              border-radius: var(--radius-button);
              padding: 8px 14px;
              font-size: var(--text-ui);
              transition: background var(--transition-duration-ui) var(--ease-ui),
                          transform var(--transition-duration-ui) var(--ease-ui);
            }
            .ds-motion-demo:hover { background: var(--color-accent-hover); }
            .ds-motion-demo:active { transform: scale(var(--scale-press)); }
            .ds-motion-demo:focus-visible {
              outline: 2px solid var(--color-focus-ring);
              outline-offset: 1px;
            }
          </style>
          <button type="button" class="ds-motion-demo">{{ readToken('--transition-duration-ui') }} · {{ readToken('--ease-ui') }} · scale({{ readToken('--scale-press') }})</button>
        </section>
      </div>`,
  }),
};
