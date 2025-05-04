import { defineConfig } from '@rsbuild/core';
import { pluginCssMinimizer } from '../src';

export default defineConfig({
  plugins: [
    pluginCssMinimizer({
      minifier: 'lightningcss',
      lightningCssOptions: {
        minimizerOptions: {
          targets: ['> 0.25%', 'not dead'],
          drafts: { nesting: true },
        },
      },
    }),
  ],
});
