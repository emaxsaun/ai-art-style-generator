const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { minify: minifyHTML } = require('html-minifier-terser');
const CleanCSS = require('clean-css');

// Bundle server.js
esbuild.build({
  entryPoints: ['server.js'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'dist/server.js',
  minify: true,
  sourcemap: false,
  external: [],
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

// Minify index.html
(async () => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const minifiedHTML = await minifyHTML(html, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
    });
    fs.writeFileSync(htmlPath, minifiedHTML);
    console.log('✅ Minified index.html');
  }
})();

// Minify CSS files in public folder (if any)
const publicDir = path.join(__dirname, 'public');
fs.readdirSync(publicDir).forEach(file => {
  if (file.endsWith('.css')) {
    const cssPath = path.join(publicDir, file);
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const output = new CleanCSS({}).minify(cssContent);
    if (output.styles) {
      fs.writeFileSync(cssPath, output.styles);
      console.log(`✅ Minified ${file}`);
    }
  }
});