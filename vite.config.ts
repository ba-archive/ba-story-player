import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import { externals, ExternalsOptions } from 'rollup-plugin-node-externals'
import clearConsole from 'vite-plugin-clear-console'

function nodeExternals(options?: ExternalsOptions): Plugin {
  return {
    ...externals(options),
    name: 'vite-plugin-node-externals',
    enforce: 'pre', // https://cn.vitejs.dev/guide/api-plugin.html#plugin-ordering
  }
}


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './lib')
    },
  },
  plugins: [nodeExternals(), vue(),
  {
    ...clearConsole(),
    apply: 'build' // build environment
  }
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'BaStoryPlayer',
      fileName: 'ba-story-player'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/assets/scss/index.scss";'
      }
    }
  }
})
