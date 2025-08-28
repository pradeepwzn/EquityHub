const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      flexbox: 'no-2009',
      grid: 'autoplace',
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not ie 11',
        'Safari >= 3',
        'Chrome >= 4',
        'Firefox >= 3.5',
        'Edge >= 12',
      ],
    },
  },
};

export default config;
