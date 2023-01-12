import "./v"
import "./v_hint"

import { Playground, PlaygroundDefaultAction } from "./Playground"

const editorElement = document.querySelector('.js-playground') as HTMLElement
const playground = new Playground(editorElement)

playground.registerAction(PlaygroundDefaultAction.RUN, () => {
    playground.run()
})

playground.registerAction(PlaygroundDefaultAction.FORMAT, () => {
    playground.formatCode()
})

playground.registerAction(PlaygroundDefaultAction.SHARE, () => {
    playground.shareCode()
})

playground.registerAction(PlaygroundDefaultAction.CHANGE_THEME, () => {
    playground.changeTheme()
})

playground.registerRunAsTestConsumer(() => {
    const runButton = document.querySelector('.js-playground__action-run') as HTMLButtonElement;
    const configurationType = runButton.getAttribute("data-type");
    return configurationType === "Test"
})

playground.setupShortcuts()
playground.askLoadUnsavedCode()

window.onload = () => {
    const html = document.querySelector("html") as HTMLElement;
    html.style.opacity = '1'
}
