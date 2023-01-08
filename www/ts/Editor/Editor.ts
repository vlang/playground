class Editor {
    private static readonly FONT_LOCAL_STORAGE_KEY = "editor-font-size"

    private wrapperElement: HTMLElement
    private repository: CodeRepository
    private editor: CodeMirror.Editor
    public terminal: Terminal

    constructor(wrapper: HTMLElement, repository: CodeRepository) {
        const editorConfig = {
            mode: "v",
            lineNumbers: true,
            matchBrackets: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-/": "toggleComment",
            },
            indentWithTabs: true,
            indentUnit: 4,
            autoCloseBrackets: true,
            showHint: true,
            lint: {
                async: true,
                lintOnChange: true,
                delay: 20,
            },
            toggleLineComment: {
                indent: true,
                padding: " ",
            },
            theme: "dark",
        }

        this.wrapperElement = wrapper

        const place = wrapper.querySelector("textarea")!
        this.editor = CodeMirror.fromTextArea(place, editorConfig)
        this.repository = repository
        this.repository.getCode((code) => {
            if (code === SharedCodeRepository.CODE_NOT_FOUND) {
                // If the code is not found, use default Hello World example.
                this.setCode(codeIfSharedLinkBroken)
                this.terminal.write("Code for shared link not found.")
                return
            }

            this.setCode(code)
        })

        const terminalElement = wrapper.querySelector(".js-terminal") as HTMLElement
        if (terminalElement === null || terminalElement === undefined) {
            throw new Error("Terminal not found, please check that terminal inside editor element")
        }
        this.terminal = new Terminal(terminalElement)
        this.terminal.registerCloseHandler(() => {
            this.closeTerminal()
            this.editor.refresh()
        })
        this.terminal.registerWriteHandler((_) => {
            this.openTerminal()
        })
        this.terminal.mount()

        this.initFont()
    }

    private initFont() {
        const fontSize = window.localStorage.getItem(Editor.FONT_LOCAL_STORAGE_KEY)
        if (fontSize !== null) {
            this.setEditorFontSize(fontSize)
        }
    }

    changeEditorFontSize(delta: number) {
        const cm = document.getElementsByClassName("CodeMirror")[0] as HTMLElement
        const fontSize = window.getComputedStyle(cm, null).getPropertyValue("font-size")
        if (fontSize) {
            const newFontSize = parseInt(fontSize) + delta
            cm.style.fontSize = newFontSize + "px"
            window.localStorage.setItem(Editor.FONT_LOCAL_STORAGE_KEY, newFontSize.toString())
            this.editor.refresh()
        }
    }

    private setEditorFontSize(size: string) {
        const cm = document.getElementsByClassName("CodeMirror")[0] as HTMLElement
        cm.style.fontSize = size + "px"
        this.refresh()
    }

    public setCode(code: string, preserveCursor: boolean = false) {
        const cursor = this.editor.getCursor()
        this.editor.setValue(code)
        this.repository.saveCode(code)

        if (preserveCursor) {
            this.editor.setCursor(cursor)
        }
    }

    public getCode() {
        return this.editor.getValue()
    }

    public saveCode() {
        const isSharedCodeRepository = this.repository instanceof SharedCodeRepository

        if (isSharedCodeRepository) {
            this.repository = new LocalCodeRepository()
        }

        this.repository.saveCode(this.getCode())
    }

    public openTerminal() {
        this.wrapperElement.classList.remove("closed-terminal")
    }

    public closeTerminal() {
        this.wrapperElement.classList.add("closed-terminal")
    }

    public setTheme(theme: ITheme) {
        this.editor.setOption("theme", theme.name())
    }

    public refresh() {
        this.editor.refresh()
    }
}
