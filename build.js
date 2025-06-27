require('esbuild').build({
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