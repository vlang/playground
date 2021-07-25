function runCode() {
  let runButton = document.getElementById("run-button")
  runButton.innerText = "..."
  runButton.setAttribute("disabled", "disabled")

  let code = window.jar.toString()
  let acceptLogging = localStorage.getItem("acceptLogging")
  let data = new FormData()
  data.append("code", code)
  data.append("accept_logging", acceptLogging)

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

function toggleDarkMode(storePreference) {
  let darkModeButton = document.getElementById("dark-mode-toggle")
  let prismCSS = document.getElementById("prism-css");

  if (prismCSS.href.endsWith("/css/prism-light.css")) {
    prismCSS.href = "/css/prism-dark.css";
    darkModeButton.innerHTML = '<i class="fas fa-sun"></i>';
    if (storePreference) {
      localStorage.setItem("darkMode", "true")
    }
  } else {
    prismCSS.href = "/css/prism-light.css";
    darkModeButton.innerHTML = '<i class="fas fa-moon"></i>';
    if (storePreference) {
      localStorage.setItem("darkMode", "false")
    }
  }
}

document.getElementById("modal-no").onclick = () => {
  localStorage.setItem("acceptLogging", "false")
  halfmoon.toggleModal("accept-logging-modal")
}
document.getElementById("modal-yes").onclick = () => {
  localStorage.setItem("acceptLogging", "true")
  halfmoon.toggleModal("accept-logging-modal")
}

// logging prompt
let acceptLogging = localStorage.getItem("acceptLogging")
if (acceptLogging === null) {
  halfmoon.toggleModal("accept-logging-modal")
}

// dark mode logic
let darkMode = localStorage.getItem("darkMode")
switch (darkMode) {
  case "true":
    toggleDarkMode(false)
    break;
  case "false":
    break;
  default:
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      toggleDarkMode(false) 
    } 
}
