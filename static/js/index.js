function saveCode() {
  localStorage.setItem("code", window.jar.toString())
}

function runCode() {
  let runButton = document.getElementById("run-button")
  let oldRunButtonText = runButton.innerText
  runButton.innerText = "..."
  runButton.setAttribute("disabled", "disabled")

  let code = window.jar.toString()
  let data = new FormData()
  data.append("code", code)

  fetch("/run", {
    method: "post",
    body: data
  }).then(resp => {
    resp.text().then(output => {
      document.getElementById("console-output").innerText = output
      runButton.innerText = oldRunButtonText
      runButton.removeAttribute("disabled")
    })
  })
}

function changeFontSize(amount) {
  let editor = document.getElementById("editor")
  let style = window.getComputedStyle(editor, null).getPropertyValue("font-size")
  let fontSize = `${parseInt(style) + amount}px`
  editor.style.fontSize = fontSize
  localStorage.setItem("fontSize", fontSize)
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

function resetCode() {
  if (confirm("Are you sure you want to reset your code?")) {
    window.jar.updateCode("fn main() {\n\t\n}")
    saveCode()
  }
}

function main() {
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

  // ctrl+enter to run code
  document.addEventListener("keypress", ev => {
    if ((ev.ctrlKey || ev.shiftKey) && ev.key == "Enter") {
      runCode()
      ev.preventDefault();
    }
  })

  // loading saved font size
  let fontSize = localStorage.getItem("fontSize")
  if (fontSize !== null) {
    let editor = document.getElementById("editor")
    editor.style.fontSize = fontSize
  }
}

main()
