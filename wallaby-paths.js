// ./wallaby-paths.js
const tsConfigPaths = require('tsconfig-paths');
const tsconfig = require('./tsconfig.json');
tsConfigPaths.register({
  baseUrl: tsconfig.compilerOptions.baseUrl,
  paths: tsconfig.compilerOptions.paths
});
