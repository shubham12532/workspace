module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/mocks/cssModule.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/mocks/image.js'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '!**/*stories.js',
    '**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ]
}
