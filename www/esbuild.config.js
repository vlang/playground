const path = require("path");
const esbuild = require("esbuild");

function printResult(result) {
  Object.keys(result).forEach((fileName) => {
    // convert to kilobyte
    const fileSize = result[fileName].bytes / 1000;
    console.log(`${fileName} => ${fileSize} Kb`);
  });
}

const styleResult = esbuild.buildSync({
  bundle: true,
  minify: true,
  metafile: true,
  outfile: path.resolve(__dirname, "./public/style.css"),
  target: "esnext",
  entryPoints: ["./styles/index.css"],
  loader: {
    '.svg': 'base64',
  },
});

printResult(styleResult?.metafile?.outputs || {});

const codeResult = esbuild.buildSync({
  minify: true,
  bundle: true,
  keepNames: false,
  metafile: true,
  outfile: path.resolve(__dirname, "./public/main.bundle.js"),
  sourcemap: true,
  platform: "browser",
  target: "esnext",
  external: ["codemirror"],
  entryPoints: ["./src/main.ts"],
});

printResult(codeResult?.metafile?.outputs || {});
