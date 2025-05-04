[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/web-infra-dev/awesome-rspack)

# rsbuild-plugin-css-optimizer

An Rsbuild plugin to customize CSS minification, allowing you to choose between [cssnano](https://github.com/cssnano/cssnano) (JavaScript-based) or [Lightning CSS](https://lightningcss.dev) (Rust-based) for high-performance CSS compression.

`rsbuild-plugin-css-optimizer` internally integrates [css-minimizer-webpack-plugin](https://github.com/webpack-contrib/css-minimizer-webpack-plugin) to optimize CSS assets in production builds.

<p>
  <a href="https://npmjs.com/package/rsbuild-plugin-css-optimizer">
   <img src="https://img.shields.io/npm/v/rsbuild-plugin-css-optimizer?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/rsbuild-plugin-css-optimizer?minimal=true"><img src="https://img.shields.io/npm/dm/rsbuild-plugin-css-optimizer.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## Features

- **Flexible Minifier Choice**: Switch between `cssnano` for extensive optimizations or `Lightning CSS` for 5-10x faster minification.
- **Performance**: Leverage `Lightning CSS`’s Rust-based engine for parallel processing and native performance.
- **Type Safety**: TypeScript types ensure correct configuration for each minifier.
- **Seamless Rsbuild Integration**: Automatically applies minification in production builds when `minify.css` is enabled.
- **Customizable Options**: Fine-tune `cssnano` and `Lightning CSS` settings for browser targeting, CSS features, and more.

## Installation

Install the plugin and its dependency:

```bash
npm add rsbuild-plugin-css-optimizer -D
```

## Usage

Add the `pluginCssMinimizer` to your Rsbuild configuration in `rsbuild.config.ts`. The plugin enables CSS minification in production builds when `output.minify.css` is `true`.

### Basic Example (Lightning CSS)

```ts
// rsbuild.config.ts
import { pluginCssMinimizer } from "rsbuild-plugin-css-optimizer";

export default {
  plugins: [
    pluginCssMinimizer({
      minifier: "lightningcss",
      lightningCssOptions: {
        minimizerOptions: {
          targets: ["> 0.25%", "not dead"],
        },
      },
    }),
  ],
};
```

### Basic Example (cssnano)

```ts
// rsbuild.config.ts
import { pluginCssMinimizer } from "rsbuild-plugin-css-optimizer";

export default {
  plugins: [
    pluginCssMinimizer(), // Uses cssnano by default
  ],
};
```

## Options

The plugin accepts a `PluginCssMinimizerOptions` object with the following properties:

### `minifier`

- **Type**: `'cssnano' | 'lightningcss'`
- **Default**: `'cssnano'`
- **Description**: Specifies the CSS minifier to use.
  - `'cssnano'`: JavaScript-based minifier with a wide range of optimizations.
  - `'lightningcss'`: Rust-based minifier for significantly faster performance.
- **Example**:
  ```ts
  pluginCssMinimizer({
    minifier: "lightningcss",
  });
  ```

### `cssnanoOptions`

- **Type**: `ConfigChain<CssMinimizerPlugin.BasePluginOptions & CssMinimizerPlugin.DefinedDefaultMinimizerAndOptions<CssNanoOptions>> | Function`
- **Default**:
  ```ts
  {
    minify: CssMinimizerWebpackPlugin.cssnanoMinify,
    minimizerOptions: {
      preset: ['default', { mergeLonghand: false }],
    },
  }
  ```
- **Description**: Configuration for `cssnano`, applied when `minifier` is `'cssnano'`. Can be an object merged with defaults or a function to modify options. See [cssnano documentation](https://cssnano.co/docs) for all available options.
- **Sub-options**:
  - `configFile` (string, optional): Path to a cssnano configuration file.
  - `preset` (string | [string, object], optional): Preset name and configuration (e.g., `['default', { mergeLonghand: false }]`).
- **Example (Object)**:
  ```ts
  pluginCssMinimizer({
    minifier: "cssnano",
    cssnanoOptions: {
      minimizerOptions: {
        preset: ["advanced", { discardComments: { removeAll: true } }],
      },
    },
  });
  ```
- **Example (Function)**:
  ```ts
  pluginCssMinimizer({
    minifier: "cssnano",
    cssnanoOptions: (options) => {
      options.minimizerOptions = {
        preset: require.resolve("cssnano-preset-simple"),
      };
      return options;
    },
  });
  ```

### `lightningCssOptions`

- **Type**: `ConfigChain<CssMinimizerPlugin.BasePluginOptions & CssMinimizerPlugin.DefinedDefaultMinimizerAndOptions<LightningCssOptions>> | Function`
- **Default**:
  ```ts
  {
    minify: CssMinimizerWebpackPlugin.lightningCssMinify,
    minimizerOptions: {
      targets: 'defaults',
    },
  }
  ```
- **Description**: Configuration for `Lightning CSS`, applied when `minifier` is `'lightningcss'`. Can be an object merged with defaults or a function to modify options. See [Lightning CSS documentation](https://lightningcss.dev/options.html) for all available options.
- **Sub-options**:
  - `targets` (string | string[] | { [key: string]: number }, optional): Browser targets using browserslist syntax (e.g., `['> 0.25%', 'not dead']`) or version objects (e.g., `{ chrome: 80 }`).
  - `drafts` (object, optional): Enable draft CSS features, such as `{ nesting: true }`.
- **Example (Object)**:
  ```ts
  pluginCssMinimizer({
    minifier: "lightningcss",
    lightningCssOptions: {
      minimizerOptions: {
        targets: ["chrome >= 80", "firefox >= 78"],
        drafts: { nesting: true },
      },
    },
  });
  ```
- **Example (Function)**:
  ```ts
  pluginCssMinimizer({
    minifier: "lightningcss",
    lightningCssOptions: (options) => {
      options.minimizerOptions.targets = ["> 0.5%"];
      return options;
    },
  });
  ```

## Full Example

```ts
// rsbuild.config.ts
import { pluginCssMinimizer } from "rsbuild-plugin-css-optimizer";

export default {
  output: {
    minify: {
      css: true, // Enable CSS minification
    },
  },
  plugins: [
    pluginCssMinimizer({
      minifier: "lightningcss",
      lightningCssOptions: {
        minimizerOptions: {
          targets: ["> 0.25%", "not dead"],
          drafts: { nesting: true },
        },
      },
    }),
    // Alternatively, use cssnano
    pluginCssMinimizer({
      minifier: "cssnano",
      cssnanoOptions: {
        minimizerOptions: {
          preset: ["default", { discardComments: { removeAll: true } }],
        },
      },
    }),
  ],
};
```

## Performance

- **Lightning CSS**:
  - **Speed**: 5-10x faster than `cssnano` due to Rust’s compiled performance and parallel processing.
  - **Use Case**: Ideal for large projects or frequent builds where build speed is critical.
- **cssnano**:
  - **Speed**: Slower but provides extensive optimization plugins for fine-grained control.
  - **Use Case**: Best for projects prioritizing minimal CSS output size over build performance.

## Notes

- **Source Maps**: Enable source maps in Rsbuild with `devtool: 'source-map'` for both minifiers.
- **Browser Targets**: For `Lightning CSS`, use browserslist syntax (e.g., `['> 0.25%']`) or version objects (e.g., `{ chrome: 80 }`). The default (`'defaults'`) targets modern browsers.
- **cssnano Compatibility**: The `mergeLonghand: false` default prevents issues with properties like `safe-area-inset-top` (see [cssnano issue #803](https://github.com/cssnano/cssnano/issues/803)).
- **Production Only**: Minification applies only in production builds when `isProd` is `true` and `minify.css` is enabled.

## Troubleshooting

- **Minification Not Applied**:
  - Verify `output.minify.css` is `true` or `minify` is `true` in your Rsbuild config.
  - Ensure the build is in production mode (`isProd: true`).
- **Invalid Options**:
  - Check TypeScript errors for incorrect `cssnanoOptions` or `lightningCssOptions`.
  - Refer to [cssnano](https://cssnano.co/docs) or [Lightning CSS](https://lightningcss.dev/options.html) documentation for valid options.

## Contributing

Contributions are welcome! Please submit issues or pull requests to the [plugin repository](https://github.com/aliezzahn/rsbuild-plugin-css-optimizer).

## License

[MIT](./LICENSE)
