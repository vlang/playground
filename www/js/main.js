const editorElement = document.querySelector('.js-playground')
const playground = new Playground(editorElement)

playground.registerAction(PlaygroundDefaultAction.RUN, () => {
    playground.runCode()
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

playground.setupShortcuts()
playground.askLoadUnsavedCode()

window.onload = () => {
    const html = document.querySelector("html");
    html.style.opacity = '1'
}
