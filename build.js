const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

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

async function build() {
  await bundleServer();
  await minifyHTMLFile();
}

build();