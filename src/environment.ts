type Environment = {
  auth: true | false;
  index: true | false;
};

export const environment: Environment = {
  auth: process.env.VUE_APP_AUTH || true,
  index: process.env.VUE_APP_INDEX || true,
};
