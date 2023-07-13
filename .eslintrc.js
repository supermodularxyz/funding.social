module.exports = {
  root: true,
  extends: ['@lens-protocol/eslint-config', 'next/core-web-vitals'],
  overrides: [
    {
      files: ['./**/*.{js,ts,tsx}'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
}
