const path = require('path')
module.exports = function () {
  return {
    files: [
      'src/**/*.js',
      'src/**/*.thy',
      'src/**/*.ts',
      '!src/**/*.test.ts'
    ],
    tests: [
      'src/**/*.test.ts'
    ],
    env: {
      type: 'node',
      params: {
        runner: '-r ' + path.join(__dirname, './wallaby-paths.js')
      }
    },
    testFramework: 'mocha',
  };
};
