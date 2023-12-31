import "./v"
import "./v-hint"

import { Playground, PlaygroundDefaultAction } from "./Playground"
import {CodeRunner} from "./CodeRunner/CodeRunner";

CodeRunner.getVlangVersion().then(resp => {
    const versionElement = document.querySelector('.js-version-info') as HTMLElement
    versionElement.innerHTML = resp.version
})

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
    const runButton = document.querySelector('.js-run__action') as HTMLButtonElement;
    const configurationType = runButton.getAttribute("data-type");
    return configurationType === "Test"
})

playground.setupShortcuts()
playground.askLoadUnsavedCode()

window.onload = () => {
    const html = document.querySelector("html") as HTMLElement;
    html.style.opacity = '1'
}
