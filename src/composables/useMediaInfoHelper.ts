import { useRoute } from "vue-router";

const useMediaInfoHelper = (): {
  hasPrimaryFunctionality: () => Boolean;
} => {
  const route = useRoute();

  const hasPrimaryFunctionality = () => {
    if (route.name === "SingleEntity") {
      return true;
    } else {
      return false;
    }
  };

  return {
    hasPrimaryFunctionality,
  };
};

export default useMediaInfoHelper;
