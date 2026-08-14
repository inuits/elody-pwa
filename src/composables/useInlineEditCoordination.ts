import { ref } from "vue";

// Design rule: only one scope edits at a time. Every inline field editor
// (and block editor) claims this ref when it opens; watchers close any
// other open editor.
export const activeInlineScope = ref<symbol | null>(null);
