type Environment = {
  auth: string | true;
  index: string | true;
  otel: {
    host: string;
    port: string;
  };
};

export const environment: Environment = {
  auth: process.env.VUE_APP_AUTH || true,
  index: process.env.VUE_APP_INDEX || true,
  otel: {
    host: process.env.OTEL_HOST || 'otel-collector.dams.localhost',
    port: process.env.OTEL_PORT || '8100',
  },
};
