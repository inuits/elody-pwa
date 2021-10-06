type Environment = {
  auth: true | false;
};

export const environment: Environment = {
  auth: process.env.VUE_APP_AUTH || true,
};
