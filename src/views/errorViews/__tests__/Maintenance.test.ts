import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Maintenance from "../Maintenance.vue";

describe("Maintenance", () => {
  it("shows the client's logo and the maintenance message", () => {
    const wrapper = mount(Maintenance, {
      props: { applicationTitle: "Podiumnet" },
    });

    expect(wrapper.find("h1").text()).toBe("maintenance.title");
    expect(wrapper.find("p").text()).toBe("maintenance.description");
    expect(wrapper.find("img").attributes("alt")).toBe("Podiumnet");
  });
});
