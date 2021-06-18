function runCode() {
  let runButton = document.getElementById("run-button")
  runButton.innerText = "..."
  runButton.setAttribute("disabled", "disabled")

  let code = window.jar.toString()
  let data = new FormData()
  data.append("code", code)

  fetch("/run", {
    method: "post",
    body: data
  }).then((resp) => {
    resp.text().then((output) => {
      document.getElementById("console-output").innerText = output
      runButton.innerText = "run"
      runButton.removeAttribute("disabled")
    })
  })
}

function changeFontSize(amount) {
  let editor = document.getElementById("editor")
  let style = window.getComputedStyle(editor, null).getPropertyValue("font-size")
  editor.style.fontSize = `${parseInt(style) + amount}px`
}
