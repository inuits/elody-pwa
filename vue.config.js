const { GraphQLCodegenWebpackPlugin } = require('graphql-codegen-webpack-plugin');

module.exports = {
  devServer: {
    allowedHosts: 'all',
    // proxy: 'http://otel-collector.dams.localhost:8100/v1/traces', 
    // proxy: 'http://localhost:4318/v1/traces', 
  },
  configureWebpack: {
    plugins: [new GraphQLCodegenWebpackPlugin({ configPath: './codegen.yml' })],
    experiments: {
      topLevelAwait: true,
    },
  },
};
