const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: true, // 设置为 true 以在生产环境生成 source-map
})
