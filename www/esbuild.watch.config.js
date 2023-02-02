const path = require("path");
const esbuild = require("esbuild");

function printResult(result) {
  Object.keys(result).forEach((fileName) => {
    // convert to kilobyte
    const fileSize = result[fileName].bytes / 1000;
    console.log(`${fileName} => ${fileSize} Kb`);
  });
}

const styleResult = esbuild.build({
  bundle: true,
  minify: false,
  metafile: true,
  outfile: path.resolve(__dirname, "./public/style.css"),
  target: "esnext",
  entryPoints: ["./css/index.css"],
  loader: {
    '.svg': 'base64',
    '.woff2': 'copy',
  },
  watch: {
    onRebuild(error, result) {
      if (error) {
        console.error('watch build failed:', error)
      } else {
        console.log('watch build succeeded:', result)
      }
    },
  },
});

printResult(styleResult?.metafile?.outputs || {});

const codeResult = esbuild.build({
  minify: false,
  bundle: true,
  keepNames: true,
  metafile: true,
  outfile: path.resolve(__dirname, "./public/main.bundle.js"),
  sourcemap: true,
  platform: "browser",
  target: "es6",
  external: ["codemirror"],
  entryPoints: ["./src/main.ts"],
  watch: {
    onRebuild(error, result) {
      if (error) {
        console.error('watch build failed:', error)
      } else {
        console.log('watch build succeeded:', result)
      }
    },
  },
});

printResult(codeResult?.metafile?.outputs || {});
