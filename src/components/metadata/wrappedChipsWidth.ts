type ChipBox = { top: number; right: number };

export const wrappedChipsWidth = (
  left: number,
  chips: ChipBox[],
): number | undefined => {
  if (chips.length < 2 || chips.every((chip) => chip.top === chips[0].top))
    return undefined;
  return Math.ceil(Math.max(...chips.map((chip) => chip.right)) - left);
};
