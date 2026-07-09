// Remotion's bundler excludes node_modules from its JS/JSX loader. When
// motion-diagram is installed as a dependency and rendered (e.g. the MCP server
// run via `npx motion-diagram-mcp`), its .jsx scene files live under
// node_modules and are left untransformed -> "Module parse failed: Unexpected
// token" at <Composition>. This override adds an esbuild-loader rule that
// transpiles this package's own source, whether it sits in node_modules or not.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export function webpackOverride(config) {
  const esbuildLoader = require.resolve("esbuild-loader");
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...(config.module?.rules ?? []),
        {
          test: /\.(jsx?|tsx?)$/,
          include: /[\\/]node_modules[\\/]motion-diagram[\\/]/,
          use: [
            {
              loader: esbuildLoader,
              options: { loader: "jsx", target: "es2020" },
            },
          ],
        },
      ],
    },
  };
}
