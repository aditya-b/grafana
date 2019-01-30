
import { css } from 'docz-plugin-css'
export default {
  typescript: true,
  src: './src',
  port:3001,
  modifyBundlerConfig: (c) => {
    c.entry = {
      ...c.entry,
      styles: '../../public/sass/grafana.common.scss'
    }
    c.module.rules.push({
      test: /\.scss$/,
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2,
            url: false,
            sourceMap: false,
            minimize: false,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: false,
            config: { path: __dirname + '../../../scripts/webpack/postcss.config.js' },
          },
        },
        { loader: 'sass-loader', options: { sourceMap: false } },
      ],
    });

    return c
  }
}
