import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginCssMinimizer } from '../../src';
import { getRandomPort } from '../helper';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should render page as expected', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginCssMinimizer({
      minifier: 'lightningcss',
      lightningCssOptions: {
        minimizerOptions: {
          targets: ['> 0.25%', 'not dead'],
          drafts: { nesting: true },
        },
      },
    }),],
      server: {
        port: getRandomPort(),
      },
    },
  });

  const { server, urls } = await rsbuild.startDevServer();

  await page.goto(urls[0]);
  expect(await page.evaluate('window.test')).toBe(1);

  await server.close();
});

test('should build succeed', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginCssMinimizer({
      minifier: 'lightningcss',
      lightningCssOptions: {
        minimizerOptions: {
          targets: ['> 0.25%', 'not dead'],
          drafts: { nesting: true },
        },
      },
    }),],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);
  expect(await page.evaluate('window.test')).toBe(1);

  await server.close();
});
