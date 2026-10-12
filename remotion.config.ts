import {Config} from '@remotion/cli/config';

Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [...(config.module?.rules ?? []), {test: /\.geojson$/i, type: 'json'}],
  },
}));
