export class HelpManager {
    // TODO: don't know other way to detect macOS...
    // noinspection JSDeprecatedSymbols
    static isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0

    private containingElement: HTMLElement
    private readonly element: HTMLElement
    private readonly helpOverlay!: HTMLElement
    private readonly showHelpButton!: HTMLElement
    private readonly closeHelpButton!: HTMLElement

    constructor(containingElement: HTMLElement) {
        this.containingElement = containingElement
        this.element = containingElement.getElementsByClassName("js-help-wrapper")[0] as HTMLElement

        if (this.element === null || this.element === undefined) {
            return
        }

        this.helpOverlay = this.element.querySelector(".js-help-overlay")!
        this.showHelpButton = this.element.querySelector(".js-show-help")!
        this.closeHelpButton = this.element.querySelector(".js-close-help")!

        this.mount()
    }

    private mount() {
        if (this.showHelpButton !== undefined) {
            this.showHelpButton.addEventListener("click", () => {
                this.toggleHelp()
            })
        }

        if (this.helpOverlay !== undefined) {
            this.helpOverlay.addEventListener("click", () => {
                this.toggleHelp()
            })
        }

        if (this.closeHelpButton !== undefined) {
            this.closeHelpButton.addEventListener("click", () => {
                this.toggleHelp()
            })
        }

        // Replace shortcut with understandable for OS user:
        //  - macOS: ⌃
        //  - Windows/Linux: Ctrl
        if (!HelpManager.isMac) {
            const shortcuts = document.querySelectorAll<HTMLElement>(".js-shortcut kbd.ctrl")
            shortcuts.forEach(function (shortcut: HTMLElement) {
                shortcut.innerText = "Ctrl"
            })
        }
    }

    public closeHelp() {
        if (!this.helpOverlay.classList.contains("opened")) {
            return
        }
        this.toggleHelp()
    }

    public toggleHelp() {
        const help = this.containingElement.getElementsByClassName("js-help")[0]
        help.classList.toggle("opened")
        this.helpOverlay.classList.toggle("opened")
    }
}
