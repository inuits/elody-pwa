const { GraphQLCodegenWebpackPlugin } = require('graphql-codegen-webpack-plugin');

module.exports = {
  devServer: {
    allowedHosts: 'all',
  },
  configureWebpack: {
    plugins: [new GraphQLCodegenWebpackPlugin({ configPath: './codegen.yml' })],
    experiments: {
      topLevelAwait: true,
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'nl',
      fallbackLocale: 'nl',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true,
    },}
};
