let editor = document.querySelector("#editor")
let output = document.querySelector("#console-output")
let voutput = []

function outv(ch) {
  if (ch !== null && ch > 0) voutput.push(ch)
}

err = function (msg) {
  if (!msg.includes("RuntimeError: unreachable")) console.warn(msg)
}

FS.init(() => null, outv, outv)
FS.symlink("/v", "/proc/self/exe")
ENV.TERM = "dumb"

window['formatCode'] = function() {
  voutput = []
  output.textContent = ""
  FS.writeFile("main.v", editor.textContent)
  const t0 = performance.now()
  Module.callMain(["fmt", "-worker", "main.v"])
  const t1 = performance.now()
  console.log(`Formatting took ${(t1 - t0).toFixed(2)}ms.`)
}

quit_ = function (status, _error) {
  const v_output_str = String.fromCodePoint(...voutput)
  let filename = "/home/web_user/.cache/vfmt_main.v"
  if (status === 0) {
    for (const line of v_output_str.split('\n')) {
      const match = line.match(/@@@FORMATTED_FILE: (.+)/)
      if (match) filename = match[1]
    }
    window.jar.updateCode(
      FS.readFile(filename, { encoding: "utf8" })
    )
  } else {
    output.append(v_output_str)
  }
  voutput = []
}
