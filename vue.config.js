const { GraphQLCodegenWebpackPlugin } = require('graphql-codegen-webpack-plugin');

module.exports = {
  devServer: {
      disableHostCheck: true,
      progress: false,
  },
  pluginOptions: {
  },
  configureWebpack: {
    plugins: [
      new GraphQLCodegenWebpackPlugin({ configPath: './codegen.yml' }),
    ],
    experiments: {
      topLevelAwait: true,
    },
  },
}
