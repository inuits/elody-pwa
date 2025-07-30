import { ref, onMounted, watch } from "vue";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

interface SimpleKeyboardLayout {
  default: string[];
  shift: string[];
  [key: string]: string[];
}

export interface KeyboardLayouts {
  [langCode: string]: SimpleKeyboardLayout;
}

interface VirtualKeyboardProps {
  input: string;
  layouts?: KeyboardLayouts;
}

export const useVirtualKeyboard = (
  props: VirtualKeyboardProps,
  emit: (event: string, ...args: any[]) => void,
  keyboardClass: string,
) => {
  const keyboard = ref<Keyboard | null>(null);
  const isOpen = ref<boolean>(false);

  const defaultEnglishLayout: SimpleKeyboardLayout = {
    default: [
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} q w e r t y u i o p [ ] \\",
      "{lock} a s d f g h j k l ; ' {enter}",
      "{shift} z x c v b n m , . / {shift}",
      ".com @ {space}",
    ],
    shift: [
      "~ ! @ # $ % ^ &amp; * ( ) _ + {bksp}",
      "{tab} Q W E R T Y U I O P { } |",
      '{lock} A S D F G H J K L : " {enter}',
      "{shift} Z X C V B N M &lt; &gt; ? {shift}",
      ".com @ {space}",
    ],
  };

  const defaultDisplay = {
    "{bksp}": "backspace",
    "{backspace}": "backspace",
    "{enter}": "< enter",
    "{shift}": "shift",
    "{//}": " ",
    "{esc}": "esc",
    "{escape}": "esc",
    "{lock}": "caps",
    "{space}": " ",
    "{tab}": "tab",
    "{close}": "&#x2715;",
  };

  let processedFinalLayouts: KeyboardLayouts = {};
  const currentKeyboardDisplay: Record<string, string> = { ...defaultDisplay };
  let firstRowButtonsPrefix: string = "";
  let showLanguageButtons: boolean = false;

  const applyPrefixToLayout = (
    layout: SimpleKeyboardLayout,
    prefix: string,
  ): SimpleKeyboardLayout => {
    const newLayout = JSON.parse(JSON.stringify(layout));

    if (newLayout.default && newLayout.default.length > 0) {
      if (!newLayout.default[0].includes(prefix)) {
        newLayout.default.unshift(prefix);
      }
    } else {
      newLayout.default = [prefix];
    }

    if (newLayout.shift && newLayout.shift.length > 0) {
      if (!newLayout.shift[0].includes(prefix)) {
        newLayout.shift.unshift(prefix);
      }
    } else if (newLayout.shift) {
      newLayout.shift = [prefix];
    }

    return newLayout;
  };

  const initializeLayoutsAndDisplay = () => {
    processedFinalLayouts = { ...props.layouts };
    if (!processedFinalLayouts["English"]) {
      processedFinalLayouts["English"] = defaultEnglishLayout;
    }

    const availableLangCodes = Object.keys(processedFinalLayouts);
    showLanguageButtons = availableLangCodes.length > 1;

    if (showLanguageButtons) {
      firstRowButtonsPrefix = availableLangCodes
        .map((langCode) => `{${langCode}}`)
        .join(" ");

      availableLangCodes.forEach((langCode) => {
        currentKeyboardDisplay[`{${langCode}}`] = langCode;
      });
    }

    firstRowButtonsPrefix = `${firstRowButtonsPrefix} {close}`.trim();

    for (const langCode in processedFinalLayouts) {
      processedFinalLayouts[langCode] = applyPrefixToLayout(
        processedFinalLayouts[langCode],
        firstRowButtonsPrefix,
      );
    }
  };

  const setupKeyboard = () => {
    const initialLangCode = processedFinalLayouts["English"]
      ? "English"
      : Object.keys(processedFinalLayouts)[0];
    const currentKeyboardLayout: SimpleKeyboardLayout =
      processedFinalLayouts[initialLangCode];

    const buttonThemes = [
      {
        class: "customButton",
        buttons: "{close}",
      },
    ];

    if (showLanguageButtons) {
      buttonThemes.push({
        class: "customButton",
        buttons: Object.keys(processedFinalLayouts)
          .map((langCode) => `{${langCode}}`)
          .join(" "),
      });
    }

    keyboard.value = new Keyboard(`.${keyboardClass}`, {
      onChange: onChange,
      onKeyPress: onKeyPress,
      layout: currentKeyboardLayout,
      display: currentKeyboardDisplay,
      buttonTheme: buttonThemes,
    });

    keyboard.value.setInput(props.input);
  };

  onMounted(() => {
    initializeLayoutsAndDisplay();
    setupKeyboard();
  });

  watch(
    () => props.input,
    (newInput) => {
      keyboard.value?.setInput(newInput);
    },
  );

  const onChange = (input: string) => {
    emit("onChange", input);
  };

  const onKeyPress = (button: string) => {
    if (button === "{close}") {
      toggleKeyboard();
      return;
    }

    const strippedButton = button.substring(1, button.length - 1);
    const isButtonLangCode =
      button.startsWith("{") &&
      button.endsWith("}") &&
      !!processedFinalLayouts[strippedButton];
    if (isButtonLangCode) {
      handleLanguageSwitch(strippedButton);
      return;
    }

    emit("onKeyPress", button);

    if (button === "{shift}" || button === "{lock}") {
      handleShift();
    }
  };

  const handleLanguageSwitch = (langCode: string) => {
    if (processedFinalLayouts[langCode]) {
      keyboard.value?.setOptions({
        layout: processedFinalLayouts[langCode],
        layoutName: "default",
      });
    }
  };

  const toggleKeyboard = () => {
    isOpen.value = !isOpen.value;
  };

  const handleShift = () => {
    const currentLayout = keyboard.value?.options.layoutName;
    const shiftToggle = currentLayout === "default" ? "shift" : "default";

    keyboard.value?.setOptions({
      layoutName: shiftToggle,
    });
  };

  return {
    keyboard,
    isOpen,
    toggleKeyboard,
    onChange,
    onKeyPress,
  };
};
