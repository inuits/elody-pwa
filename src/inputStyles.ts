type PseudoStyle = {
  textColor: string;
  bgColor: string;
  borderColor: string;
};
type Input = {
  textColor: string;
  bgColor: string;
  borderColor: string;
  disabledStyle: PseudoStyle;
};
export const defaultInput: Input = {
  textColor: "text-text-body",
  bgColor: "bg-neutral-white",
  borderColor: "border-none",
  disabledStyle: {
    textColor: "disabled:text-text-disabled",
    bgColor: "disabled:bg-background-normal",
    borderColor: "disabled:border-none",
  },
};
export const defaultWithBorderInput: Input = {
  textColor: defaultInput.textColor,
  bgColor: defaultInput.bgColor,
  borderColor: "border-[rgba(0,58,82,0.6)] focus:border-[rgba(0,58,82,0.6)]",
  disabledStyle: {
    textColor: defaultInput.disabledStyle.textColor,
    bgColor: defaultInput.disabledStyle.bgColor,
    borderColor: "disabled:border-text-disabled",
  },
};
