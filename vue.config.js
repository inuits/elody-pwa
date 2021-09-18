const { GraphQLCodegenWebpackPlugin } = require('graphql-codegen-webpack-plugin');

module.exports = {
  devServer: {
    allowedHosts: 'all',
  },
  pluginOptions: {},
  configureWebpack: {
    plugins: [new GraphQLCodegenWebpackPlugin({ configPath: './codegen.yml' })],
    experiments: {
      topLevelAwait: true,
    },
  },
};
