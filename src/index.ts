import type {
  ChainIdentifier,
  RsbuildPlugin,
  Rspack,
  RspackChain,
} from '@rsbuild/core';
import CssMinimizerWebpackPlugin from 'css-minimizer-webpack-plugin';
import type CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { type ConfigChain, reduceConfigs } from 'reduce-configs';

/**
 * Options for cssnano minifier.
 * @see https://cssnano.co/docs/optimisations
 */
export type CssNanoOptions = {
  /** Path to a cssnano configuration file. */
  configFile?: string | undefined;
  /** Preset name and optional configuration object for cssnano. */
  preset?: [string, object] | string | undefined;
};

/**
 * Options for Lightning CSS minifier.
 * @see https://lightningcss.dev/options.html
 */
export type LightningCssOptions = {
  /** Browser targets for minification, using browserslist syntax or specific versions. */
  targets?: string | string[] | { [key: string]: number };
  /** Enable CSS nesting (draft specification). */
  drafts?: { nesting?: boolean };
  /** Additional Lightning CSS-specific options. */
  [key: string]: unknown;
};

/**
 * Options for the CSS minimizer plugin.
 */
export type PluginCssMinimizerOptions = {
  /**
   * Specifies the CSS minifier to use.
   * - 'cssnano': Uses cssnano (JavaScript-based) for minification with extensive optimizations.
   * - 'lightningcss': Uses Lightning CSS (Rust-based) for faster minification.
   * @default 'cssnano'
   */
  minifier?: 'cssnano' | 'lightningcss';
  /**
   * Configuration options for cssnano minifier.
   * Only applied if minifier is set to 'cssnano'.
   * @example
   * {
   *   preset: ['default', { mergeLonghand: false }]
   * }
   */
  cssnanoOptions?: ConfigChain<
    CssMinimizerPlugin.BasePluginOptions &
      CssMinimizerPlugin.DefinedDefaultMinimizerAndOptions<CssNanoOptions>
  >;
  /**
   * Configuration options for Lightning CSS minifier.
   * Only applied if minifier is set to 'lightningcss'.
   * @example
   * {
   *   targets: ['> 0.25%', 'not dead'],
   *   drafts: { nesting: true }
   * }
   */
  lightningCssOptions?: ConfigChain<
    CssMinimizerPlugin.BasePluginOptions &
      CssMinimizerPlugin.DefinedDefaultMinimizerAndOptions<LightningCssOptions>
  >;
};

/**
 * Default options for cssnano minifier.
 * @returns Default cssnano configuration.
 */
const getCssnanoDefaultOptions = (): CssNanoOptions => ({
  preset: [
    'default',
    {
      // Disable mergeLonghand to avoid breaking safe-area-inset-top
      // https://github.com/cssnano/cssnano/issues/803
      mergeLonghand: false,
    },
  ],
});

/**
 * Default options for Lightning CSS minifier.
 * @returns Default Lightning CSS configuration.
 */
const getLightningCssDefaultOptions = (): LightningCssOptions => ({
  targets: 'defaults', // Default browserslist query for modern browsers
});

/**
 * Applies the CSS minimizer to the Rspack chain based on the selected minifier.
 * @param chain - The Rspack configuration chain.
 * @param CHAIN_ID - Rsbuild chain identifier for minimizers.
 * @param options - Plugin options including minifier type and specific configurations.
 */
export function applyCSSMinimizer(
  chain: RspackChain,
  CHAIN_ID: ChainIdentifier,
  options: PluginCssMinimizerOptions = {},
): void {
  const { minifier = 'cssnano', cssnanoOptions, lightningCssOptions } = options;

  if (minifier === 'cssnano') {
    const mergedOptions: CssMinimizerPlugin.BasePluginOptions &
      CssMinimizerPlugin.DefinedDefaultMinimizerAndOptions<CssNanoOptions> =
      reduceConfigs({
        initial: {
          minify: CssMinimizerWebpackPlugin.cssnanoMinify,
          minimizerOptions: getCssnanoDefaultOptions(),
        },
        config: cssnanoOptions,
      });

    chain.optimization
      .minimizer(CHAIN_ID.MINIMIZER.CSS)
      .use(CssMinimizerWebpackPlugin as Rspack.RspackPluginInstance, [
        mergedOptions,
      ])
      .end();
  } else {
    const mergedOptions: CssMinimizerPlugin.BasePluginOptions &
      CssMinimizerPlugin.DefinedDefaultMinimizerAndOptions<LightningCssOptions> =
      reduceConfigs({
        initial: {
          minify: CssMinimizerWebpackPlugin.lightningCssMinify,
          minimizerOptions: getLightningCssDefaultOptions(),
        },
        config: lightningCssOptions,
      });

    chain.optimization
      .minimizer(CHAIN_ID.MINIMIZER.CSS)
      .use(CssMinimizerWebpackPlugin as Rspack.RspackPluginInstance, [
        mergedOptions,
      ])
      .end();
  }
}

/**
 * Name of the CSS minimizer plugin.
 */
export const PLUGIN_CSS_MINIMIZER_NAME = 'rsbuild:css-minimizer';

/**
 * Rsbuild plugin to enable CSS minification with a choice of minifier.
 * @param options - Configuration for the CSS minifier.
 * @returns Rsbuild plugin instance.
 * @example
 * pluginCssMinimizer({
 *   minifier: 'lightningcss',
 *   lightningCssOptions: {
 *     minimizerOptions: {
 *       targets: ['> 0.25%', 'not dead'],
 *       drafts: { nesting: true }
 *     }
 *   }
 * })
 * @example
 * pluginCssMinimizer({
 *   minifier: 'cssnano',
 *   cssnanoOptions: {
 *     minimizerOptions: {
 *       preset: ['default', { mergeLonghand: false }]
 *     }
 *   }
 * })
 */
export const pluginCssMinimizer = (
  options?: PluginCssMinimizerOptions,
): RsbuildPlugin => ({
  name: PLUGIN_CSS_MINIMIZER_NAME,

  setup(api) {
    api.modifyBundlerChain(async (chain, { CHAIN_ID, environment, isProd }) => {
      const { config } = environment;
      const { minify } = config.output;

      if (
        isProd &&
        (minify === true || (typeof minify === 'object' && minify.css))
      ) {
        applyCSSMinimizer(chain, CHAIN_ID, options);
      }
    });
  },
});

export { CssMinimizerWebpackPlugin };
