import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'), // 库的入口文件
      name: 'ReactTabLibrary', // 库的全局变量名（如果使用 UMD 格式）
      fileName: (format) => `react-tab-library.${format}.js`, // 输出文件名
    },
    rollupOptions: {
      // 确保将 React 和 ReactDOM 作为外部依赖，不打包到库中
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
