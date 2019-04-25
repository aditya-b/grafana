module.exports = {
  presets: ['@babel/typescript', '@babel/react', ['@babel/env', { loose: true }]],
  plugins: [['module:@rtsao/plugin-proposal-class-properties', { loose: true }]],
};
