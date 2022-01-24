# vite-plugin-micro-app-dev

用来开发子应用，自动引入主应用的相关资源
## usage

```js
import { defineConfig } from 'vite'
import microAppDev from 'vite-plugin-micro-app-dev'

export default defineConfig({
  plugins: [
    microAppDev({ mainAppUrl: 'https://baas.uban360.com/portal' })
  ],
})
```