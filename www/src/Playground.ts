import {CodeRepository, CodeRepositoryManager, SharedCodeRepository, TextCodeRepository} from "./Repositories"
import {QueryParams} from "./QueryParams"
import {HelpManager} from "./HelpManager"
import {ITheme} from "./themes"
import {ExamplesManager, IExample} from "./Examples"
import {copyTextToClipboard} from "./clipboard_util"

import {Editor} from "./Editor/Editor"
import {ThemeManager} from "./ThemeManager/ThemeManager"
import {RunConfigurationManager, RunConfigurationType} from "./RunConfigurationManager/RunConfigurationManager"
import {CodeRunner, ShareCodeResult} from "./CodeRunner/CodeRunner"
import {Terminal} from "./Terminal/Terminal"
import {TipsManager} from "./TipsManager"

/**
 * PlaygroundDefaultAction describes the default action of a playground.
 */
export enum PlaygroundDefaultAction {
    RUN = "run",
    FORMAT = "format",
    SHARE = "share",
    CHANGE_THEME = "change-theme",
}

const CODE_UNSAVED_KEY = "unsaved"

/**
 * Playground is responsible for managing the all playground.
 */
export class Playground {
    private runAsTestConsumer: () => boolean = () => false
    private readonly wrapperElement: HTMLElement
    private readonly queryParams: QueryParams
    private readonly repository: CodeRepository
    private readonly editor: Editor
    private readonly cgenEditor: Editor
    private readonly themeManager: ThemeManager
    private readonly examplesManager: ExamplesManager
    private readonly helpManager: HelpManager
    private readonly runConfigurationManager: RunConfigurationManager
    private readonly tipsManager: TipsManager
    private readonly terminal: Terminal
    private cgenMode: boolean = false

    /**
     * @param editorElement - The element that will contain the playground.
     */
    constructor(editorElement: HTMLElement) {
        this.wrapperElement = editorElement
        this.queryParams = new QueryParams(window.location.search)
        this.repository = CodeRepositoryManager.selectRepository(this.queryParams)

        const terminalElement = editorElement.querySelector(".js-terminal") as HTMLElement
        if (terminalElement === null || terminalElement === undefined) {
            throw new Error("Terminal not found, please check that terminal inside editor element")
        }

        this.terminal = new Terminal(terminalElement)
        this.editor = new Editor("main", editorElement, this.repository, this.terminal, false, "v")
        this.cgenEditor = new Editor("cgen", editorElement, new TextCodeRepository(""), this.terminal, true, "text/x-csrc")
        this.cgenEditor.hide()

        this.themeManager = new ThemeManager(this.queryParams)
        this.themeManager.registerOnChange((theme: ITheme): void => {
            this.editor.setTheme(theme)
        })
        this.themeManager.loadTheme()

        this.examplesManager = new ExamplesManager()
        this.examplesManager.registerOnSelectHandler((example: IExample): void => {
            this.editor.setCode(example.code)

            // if current configuration is Cgen, don't switch to the example's configuration
            if (this.runConfigurationManager.configuration === RunConfigurationType.Cgen) {
                // since example changed, C code no longer matches V code
                this.cgenEditor.clear()
                this.cgenEditor.setCode("Rerun Cgen to see C code")
                return
            }

            this.runConfigurationManager.useConfiguration(example.runConfiguration)
        })
        this.examplesManager.mount()

        this.helpManager = new HelpManager(editorElement)

        this.runConfigurationManager = new RunConfigurationManager(this.queryParams)
        this.runConfigurationManager.registerOnChange((): void => {
        })
        this.runConfigurationManager.registerOnSelect((type): void => {
            this.runConfigurationManager.toggleConfigurationsList()

            if (type === RunConfigurationType.Cgen) {
                this.cgenEditor.show()
            }

            this.run()
        })
        this.runConfigurationManager.setupConfiguration()
        this.tipsManager = new TipsManager()

        this.registerAction("close-cgen", () => {
            this.cgenEditor.hide()
            this.disableCgenMode()
        })

        this.terminal.registerCloseHandler(() => {
            this.closeTerminal()
        })
        this.terminal.registerWriteHandler((_) => {
            this.openTerminal()
        })
        this.terminal.registerFilter((line) => {
            return !line.trim().startsWith("Failed command")
        })
        this.terminal.mount()
        this.closeTerminal()
    }

    public enableCgenMode() {
        this.tipsManager.show()

        this.wrapperElement.querySelectorAll(".playground__editor").forEach((editor) => {
            editor.classList.add("with-tabs")
        })

        this.cgenMode = true
    }

    public disableCgenMode() {
        this.wrapperElement.querySelectorAll(".playground__editor").forEach((editor) => {
            editor.classList.remove("with-tabs")
        })

        this.removeEditorLinesHighlighting()
        this.cgenMode = false
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
        const actionButtons = document.querySelectorAll(`.js-${name}__action`)
        if (actionButtons.length == 0) {
            throw new Error(`Can't find any action button with class js-${name}__action`)
        }

        actionButtons.forEach((actionButton) => {
            actionButton.addEventListener("click", callback)
        })
    }

    public run(): void {
        const configuration = this.runConfigurationManager.configuration
        if (configuration === RunConfigurationType.Run) {
            this.runCode()
        } else if (configuration === RunConfigurationType.Test) {
            this.runTest()
        } else if (configuration === RunConfigurationType.Cgen) {
            this.enableCgenMode()
            this.retrieveCgenCode()
        }
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

    public retrieveCgenCode(): void {
        this.clearTerminal()
        this.writeToTerminal("Running retrieving of generated C code...")

        const code = this.editor.getCode()
        CodeRunner.retrieveCgenCode(code)
            .then(result => {
                const code = result.output
                const lines = code.split("\n")

                const filteredLines = []
                const mapping = {}

                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i]
                    const next = lines[i + 1]
                    if (next.startsWith("#line")) {
                        continue
                    }

                    if (line.startsWith("#line")) {
                        if (next.length != 0) {
                            const parts = line.split(" ")
                            const lineNo = parseInt(parts[1])
                            // @ts-ignore
                            mapping[lineNo] = next
                        }

                        continue
                    }

                    filteredLines.push(line)
                }

                const resultCode = filteredLines.join("\n")

                const v2c = {}
                for (let mappingKey in mapping) {
                    // @ts-ignore
                    const line = mapping[mappingKey]
                    const chenIndex = filteredLines.indexOf(line)
                    if (chenIndex != -1) {
                        // @ts-ignore
                        v2c[mappingKey] = chenIndex
                    }
                }

                let mainIndex = filteredLines.indexOf("void main__main(")
                if (mainIndex == -1) {
                    mainIndex = 0
                }

                console.log(v2c)

                window.localStorage.setItem("cgen-mapping", JSON.stringify(v2c))

                this.clearTerminal()
                this.cgenEditor.show()
                this.cgenEditor.setCode(resultCode)
                this.cgenEditor.editor.scrollIntoView({line: mainIndex, ch: 0})
                this.closeTerminal()
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't compile and get C code. Please try again.")
            })
    }

    public formatCode(): void {
        this.clearTerminal()

        const code = this.editor.getCode()
        CodeRunner.formatCode(code)
            .then(result => {
                if (!result.ok) {
                    this.clearTerminal()
                    this.writeToTerminal(result.output)
                    return
                }

                this.editor.setCode(result.output, true)
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
        this.editor.editor.on("keypress", (cm, event) => {
            if (!cm.state.completionActive && // Enables keyboard navigation in autocomplete list
                event.key.length === 1 && event.key.match(/[a-z0-9]/i)) { // Only letters and numbers trigger autocomplete
                this.editor.showCompletion()
            }
        })

        this.editor.editor.on("mousedown", (instance, e) => {
            if (!this.cgenMode) {
                return
            }

            setTimeout(() => {
                this.removeEditorLinesHighlighting()

                const cursor = instance.getCursor()
                const line = cursor.line + 1
                const mappingString = window.localStorage.getItem("cgen-mapping") ?? "{}"
                const mapping = JSON.parse(mappingString)

                const cgenLine = mapping[line]
                if (cgenLine === undefined) {
                    return
                }

                this.cgenEditor.editor.scrollIntoView({line: cgenLine, ch: 0})
                console.log(cgenLine)

                this.cgenEditor.editor.addLineClass(cgenLine, "text", "cgen-highlight")
                window.localStorage.setItem("highlighted-c-line", cgenLine.toString())

                this.editor.editor.addLineClass(cursor.line, "text", "cgen-highlight")
                window.localStorage.setItem("highlighted-v-line", cursor.line.toString())

                this.editor.editor.focus()
            }, 100)
        })

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

    private removeEditorLinesHighlighting() {
        const prevHighlightedLine = window.localStorage.getItem("highlighted-c-line")
        if (prevHighlightedLine != undefined) {
            this.cgenEditor.editor.removeLineClass(parseInt(prevHighlightedLine), "text", "cgen-highlight")
        }

        const prevVlangHighlightedLine = window.localStorage.getItem("highlighted-v-line")
        if (prevVlangHighlightedLine != undefined) {
            this.editor.editor.removeLineClass(parseInt(prevVlangHighlightedLine), "text", "cgen-highlight")
        }
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
        this.terminal.clear()
    }

    public writeToTerminal(text: string): void {
        this.terminal.write(text)
    }

    public openTerminal() {
        this.wrapperElement.classList.remove("closed-terminal")
    }

    public closeTerminal() {
        this.wrapperElement.classList.add("closed-terminal")
        this.editor.refresh()
    }

    private markCodeAsUnsaved() {
        window.localStorage.setItem(CODE_UNSAVED_KEY, "")
    }
}
