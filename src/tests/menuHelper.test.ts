import { expect, test } from "vitest";
import useMenuHelper from "@/composables/useMenuHelper";
const {toggleDropDown, showdropdown} = useMenuHelper();
test('toggleDropDown toggles showdropdown value', () => {
  // Arrange
  // Act
  toggleDropDown();
  // Assert
  expect(showdropdown.value).toBe(true);

  // Act
  toggleDropDown();
  // Assert 
  expect(showdropdown.value).toBe(false);
});