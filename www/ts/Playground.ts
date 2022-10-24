/**
 * PlaygroundDefaultAction describes the default action of a playground.
 */
enum PlaygroundDefaultAction {
    RUN = "run",
    FORMAT = "format",
    SHARE = "share",
    CHANGE_THEME = "change-theme",
}

/**
 * Playground is responsible for managing the all playground.
 */
class Playground {
    private readonly queryParams: QueryParams
    private readonly repository: CodeRepository
    private readonly editor: Editor
    private readonly themeManager: ThemeManager
    private readonly examplesManager: ExamplesManager
    private readonly helpManager: HelpManager

    /**
     * @param editorElement - The element that will contain the playground.
     */
    constructor(editorElement: HTMLElement) {
        this.queryParams = new QueryParams(window.location.search)
        this.repository = CodeRepositoryManager.selectRepository(this.queryParams)
        this.editor = new Editor(editorElement, this.repository)

        this.themeManager = new ThemeManager(this.queryParams)
        this.themeManager.registerOnChange((theme: ITheme): void => {
            this.editor.setTheme(theme)
        })
        this.themeManager.loadTheme()

        this.examplesManager = new ExamplesManager()
        this.examplesManager.registerOnSelectHandler((example: IExample): void => {
            this.editor.setCode(example.code)
        })
        this.examplesManager.mount()

        this.helpManager = new HelpManager(editorElement)
    }

    /**
     * Register a handler for the default or new action.
     * @param name - The name of the action.
     * @param callback - The callback to be called when the action is triggered.
     */
    public registerAction(name: PlaygroundDefaultAction | string, callback: () => void): void {
        const actionButton = document.getElementsByClassName(`js-playground__action-${name}`)[0]
        if (actionButton === undefined) {
            throw new Error(`Can't find action button with class js-playground__action-${name}`)
        }

        actionButton.addEventListener("click", callback)
    }

    public runCode(): void {
        this.clearTerminal()
        this.writeToTerminal("Running code...")

        const code = this.editor.getCode()
        CodeRunner.runCode(code)
            .then(result => {
                this.clearTerminal()
                this.writeToTerminal(result.output)
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't run code. Please try again.")
            })
    }

    public formatCode(): void {
        this.clearTerminal()
        this.writeToTerminal("Formatting code...")

        const code = this.editor.getCode()
        CodeRunner.formatCode(code)
            .then(result => {
                if (!result.ok) {
                    this.clearTerminal()
                    this.writeToTerminal(result.output)
                    return
                }

                this.editor.setCode(result.output, true)
                this.writeToTerminal("Code formatted successfully!")
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't format code. Please try again.")
            })
    }

    public shareCode(): void {
        this.clearTerminal()

        const code = this.editor.getCode()
        CodeRunner.shareCode(code)
            .then(result => {
                this.writeToTerminal("Code shared successfully!")

                this.queryParams.updateURLParameter(SharedCodeRepository.QUERY_PARAM_NAME, result.hash)

                const link = window.location.href

                this.writeToTerminal("Share link: " + link)
                copyTextToClipboard(link, () => {
                    this.writeToTerminal("\nLink copied to clipboard.")
                })

                this.writeToTerminal("Note: current page has changed its own URL, it now equals the share link shown above.")
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't share code. Please try again.")
            })
    }

    public changeTheme(): void {
        this.themeManager.toggleTheme()
    }

    public setupShortcuts(): void {
        document.addEventListener("keydown", ev => {
            this.editor.saveCode()

            if (ev.ctrlKey && (ev.key === "Enter" || ev.key === "r")) {
                this.runCode()
                ev.preventDefault()
            }
            if (ev.ctrlKey && ev.key === "l") {
                this.formatCode()
                ev.preventDefault()
            }
            if (ev.ctrlKey && ev.key === "=") {
                this.editor.changeEditorFontSize(1)
                ev.preventDefault()
            }
            if (ev.ctrlKey && ev.key === "-") {
                this.editor.changeEditorFontSize(-1)
                ev.preventDefault()
            }
            if (ev.ctrlKey && ev.key === "h") {
                this.helpManager.toggleHelp()
                ev.preventDefault()
            }
            if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
                this.repository.saveCode(this.editor.getCode())
                ev.preventDefault()
            }

            if (ev.key === "Escape") {
                this.helpManager.closeHelp()
                ev.preventDefault()
            }
        })
    }

    public clearTerminal(): void {
        this.editor.terminal.clear()
    }

    public writeToTerminal(text: string): void {
        this.editor.terminal.write(text)
    }
}
