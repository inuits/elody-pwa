type Environment = {
  auth: string | true;
  index: string | true;
  otlp: {
    host: string;
    port: string;
  };
};

export const environment: Environment = {
  auth: process.env.VUE_APP_AUTH || true,
  index: process.env.VUE_APP_INDEX || true,
  otlp: {
    host: process.env.OTLP_DAMS_FRONTEND_HOST || 'otel-collector.dams.localhost',
    port: process.env.OTLP_DAMS_FRONTEND_PORT || '8100',
  },
};
