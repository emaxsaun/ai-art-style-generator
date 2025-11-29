const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');
const CleanCSS = require('clean-css');

async function bundleServer() {
  try {
    await esbuild.build({
      entryPoints: ['server.js'],
      bundle: true,
      platform: 'node',
      target: 'node22',
      outfile: 'dist/server.js',
      minify: true,
      sourcemap: false,
      external: [],
	  logLevel: 'info'
    });
    console.log('✅ Bundled server.js');
  } catch (err) {
    console.error('❌ Failed to bundle server.js:', err);
    process.exit(1);
  }
}

async function minifyHTMLFile() {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  const distDir = path.join(__dirname, 'public', 'dist');
  const distHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(htmlPath)) {
    console.warn(`⚠️ Could not find ${htmlPath}`);
    return;
  }

  try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const minifiedHTML = await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
    });

    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(distHtmlPath, minifiedHTML);

    console.log('✅ Minified index.html written to public/dist/index.html');
  } catch (err) {
    console.error('❌ Failed to minify HTML:', err);
    process.exit(1);
  }
}

async function minifyCSSFile() {
    const cssPath = path.join(__dirname, 'public', 'style.css');
    const distDir = path.join(__dirname, 'public', 'dist');
    const distCssPath = path.join(distDir, 'style.css');

    if (!fs.existsSync(cssPath)) {
      console.warn(`⚠️ Could not find ${cssPath}`);
      return;
    }

    try {
      const css = fs.readFileSync(cssPath, 'utf8');
      const minifiedCSS = new CleanCSS().minify(css).styles;

      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(distCssPath, minifiedCSS);

      console.log('✅ Minified style.css written to public/dist/style.css');
    } catch (err) {
      console.error('❌ Failed to minify CSS:', err);
      process.exit(1);
    }
  }

  async function minifyJSFile() {
      const jsPath = path.join(__dirname, 'public', 'main.js');
      const distDir = path.join(__dirname, 'public', 'dist');
      const distJsPath = path.join(distDir, 'main.js');

      if (!fs.existsSync(jsPath)) {
          console.warn(`⚠️ Could not find ${jsPath}`);
          return;
      }

      try {
          await esbuild.build({
              entryPoints: [jsPath],
              bundle: true,
              minify: true,
              sourcemap: false,
              outfile: distJsPath,
          });
          console.log('✅ Minified main.js written to public/dist/main.js');
      } catch (err) {
          console.error('❌ Failed to minify JS:', err);
          process.exit(1);
      }
  }

async function build() {
  await bundleServer();
  await minifyHTMLFile();
  await minifyCSSFile();
  await minifyJSFile();
}

build();
