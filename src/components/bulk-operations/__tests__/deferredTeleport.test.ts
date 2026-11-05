import { mount } from "@vue/test-utils";
import { it, expect } from "vitest";
import { defineComponent, h, nextTick, ref, Teleport, watch } from "vue";

it("deferred teleport survives two re-renders before its deferred mount", async () => {
  const target = document.createElement("div");
  target.id = "t";
  document.body.appendChild(target);
  const show = ref(false);
  const n = ref(0);
  const Child = defineComponent({
    props: { n: Number },
    setup: (p) => () => h("div", [h(Teleport, { to: "#t", defer: true }, [h("span", String(p.n))])]),
  });
  const Bumper = defineComponent({
    setup() {
      watch(n, (v) => { if (v < 2) n.value++; }, { flush: "pre" });
      n.value++;
      return () => null;
    },
  });
  const Parent = defineComponent({
    setup: () => () => (show.value ? h("div", [h(Child, { n: n.value }), h(Bumper)]) : null),
  });
  mount(Parent, { attachTo: document.body });
  show.value = true;
  await nextTick();
  await nextTick();
  expect(target.textContent).toBe("2");
});
