type Environment = {
  auth: string | true;
  index: string | true;
};

export const environment: Environment = {
  auth: process.env.VUE_APP_AUTH || true,
  index: process.env.VUE_APP_INDEX || true,
};
