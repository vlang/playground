import { CodeRepository, CodeRepositoryManager, SharedCodeRepository } from "./Repositories";
import { QueryParams } from "./QueryParams";
import { HelpManager } from "./HelpManager";
import { ITheme } from "./themes";
import { IExample } from "./Examples";
import { copyTextToClipboard } from "./clipboard_util";

import { Editor } from "./Editor/Editor";
import { ThemeManager } from "./ThemeManager/ThemeManager"
import { ExamplesManager } from "./Examples/ExamplesManager";
import { RunConfigurationManager } from "./RunConfigurationManager/RunConfigurationManager";
import { CodeRunner, ShareCodeResult } from "./CodeRunner/CodeRunner";

/**
 * PlaygroundDefaultAction describes the default action of a playground.
 */
export enum PlaygroundDefaultAction {
    RUN = "run",
    FORMAT = "format",
    SHARE = "share",
    CHANGE_THEME = "change-theme",
}

const CODE_UNSAVED_KEY = "unsaved";

/**
 * Playground is responsible for managing the all playground.
 */
export class Playground {
    private runAsTestConsumer: () => boolean = () => false
    private readonly queryParams: QueryParams
    private readonly repository: CodeRepository
    private readonly editor: Editor
    private readonly themeManager: ThemeManager
    private readonly examplesManager: ExamplesManager
    private readonly helpManager: HelpManager
    private readonly runConfigurationManager: RunConfigurationManager

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
            this.runConfigurationManager.useConfiguration(example.runConfiguration)
        })
        this.examplesManager.mount()

        this.helpManager = new HelpManager(editorElement)

        this.runConfigurationManager = new RunConfigurationManager(this.queryParams)
        this.runConfigurationManager.registerOnChange((): void => {})
        this.runConfigurationManager.registerOnSelect((): void => {
            this.runConfigurationManager.toggleConfigurationsList()
            this.run()
        })
        this.runConfigurationManager.setupConfiguration()
    }

    public registerRunAsTestConsumer(consumer: () => boolean): void {
        this.runAsTestConsumer = consumer
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

    public run(): void {
        if (this.runAsTestConsumer()) {
            this.runTest()
            return
        }

        this.runCode()
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

    public runTest(): void {
        this.clearTerminal()
        this.writeToTerminal("Running tests...")

        const code = this.editor.getCode()
        CodeRunner.runTest(code)
            .then(result => {
                this.clearTerminal()
                this.writeToTerminal(result.output)
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't run tests. Please try again.")
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

                const link = this.buildShareLink(result)
                this.writeToTerminal("Share link: " + link)

                copyTextToClipboard(link, () => {
                    this.writeToTerminal("\nLink copied to clipboard.")
                })

                this.writeToTerminal("Note: current page has changed its own URL, it now links to shared code.")
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't share code. Please try again.")
            })
    }

    private buildShareLink(result: ShareCodeResult) {
        let url = window.location.href.split("?")[0]
        if (!url.endsWith("/")) {
            url += "/"
        }
        return url + "p/" + result.hash
    }

    public changeTheme(): void {
        this.themeManager.toggleTheme()
    }

    public setupShortcuts(): void {
        this.editor.editor.on("keypress",  (cm, event) => {
            if (!cm.state.completionActive && // Enables keyboard navigation in autocomplete list
                event.key.length === 1 && event.key.match(/[a-z0-9]/i)) { // Only letters and numbers trigger autocomplete
                this.editor.showCompletion()
            }
        });

        document.addEventListener("keydown", ev => {
            const isCodeFromShareURL = this.repository instanceof SharedCodeRepository

            if (isCodeFromShareURL && !ev.ctrlKey && !ev.metaKey) {
                this.markCodeAsUnsaved()
            }

            const isCtrlEnter = ev.ctrlKey && ev.key === "Enter"
            const isCtrlR = ev.ctrlKey && ev.key === "r"
            const isShiftEnter = ev.shiftKey && ev.key === "Enter"

            if (isCtrlEnter || isCtrlR || isShiftEnter) {
                this.run()
                ev.preventDefault()
            } else if (ev.ctrlKey && ev.key === "l") {
                this.formatCode()
                ev.preventDefault()
            } else if (ev.ctrlKey && ev.key === "=") {
                this.editor.changeEditorFontSize(1)
                ev.preventDefault()
            } else if (ev.ctrlKey && ev.key === "-") {
                this.editor.changeEditorFontSize(-1)
                ev.preventDefault()
            } else if (ev.ctrlKey && ev.key === "i") {
                this.helpManager.toggleHelp()
                ev.preventDefault()
            } else if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
                this.editor.saveCode()
                ev.preventDefault()
            } else if (ev.key === "Escape") {
                this.helpManager.closeHelp()
                ev.preventDefault()
            } else {
                this.editor.saveCode()
            }
        })
    }

    public askLoadUnsavedCode() {
        const isCodeFromShareURL = this.repository instanceof SharedCodeRepository
        const hasUnsavedCode = window.localStorage.getItem(CODE_UNSAVED_KEY) != null

        window.localStorage.removeItem(CODE_UNSAVED_KEY)

        if (isCodeFromShareURL && hasUnsavedCode) {
            const yes = confirm("You have previously unsaved changes. Do you want to load it?")

            if (yes) {
                this.queryParams.updateURLParameter(SharedCodeRepository.QUERY_PARAM_NAME, null)
                window.location.reload()
            }
        }
    }

    public clearTerminal(): void {
        this.editor.terminal.clear()
    }

    public writeToTerminal(text: string): void {
        this.editor.terminal.write(text.replace("<", "&lt;").replace(">", "&gt;"))
    }

    private markCodeAsUnsaved() {
        window.localStorage.setItem(CODE_UNSAVED_KEY, "")
    }
}
