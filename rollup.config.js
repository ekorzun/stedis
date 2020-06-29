import compiler from '@ampproject/rollup-plugin-closure-compiler';

export default [{
  input: 'src/stedis.js',
  output: {
    file: 'dist/stedis.js',
    format: 'cjs' // 'iife',
  },
  plugins: [
    compiler({
      formatting: 'PRETTY_PRINT',
      compilation_level: 'ADVANCED_OPTIMIZATIONS',
      languageIn: 'ECMASCRIPT_2017',
      languageOut: 'ECMASCRIPT_2017',
      externs: `./src/ccexterns.js`
    }),
  ],
}]