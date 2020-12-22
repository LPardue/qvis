// get rid of absolute paths in the .html output
// https://github.com/vuejs/vue-cli/issues/1623

module.exports = {
    baseUrl: './',
    configureWebpack: {
        devtool: 'source-map'
    },
    pwa: {
        name: "qvis: it really kicks the Mandalorean's ass",
        themeColor: "#42b983",
        msTileColor: "#42b983",
        appleMobileWebAppCache: "yes",
        manifestOptions: {
          background_color: "#42b983"
        }
      }
}
