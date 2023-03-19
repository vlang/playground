import {CodeRepository, LocalCodeRepository, SharedCodeRepository} from "../Repositories"
import {ITheme} from "../themes"
import {codeIfSharedLinkBroken} from "../Examples"
import {Terminal} from "../Terminal/Terminal"
import {RunnableCodeSnippet} from "../CodeRunner/CodeRunner";
import {
    RunConfigurationManager,
    toSharedRunConfiguration
} from "../RunConfigurationManager/RunConfigurationManager";

export class Editor {
    private static readonly FONT_LOCAL_STORAGE_KEY = "editor-font-size"

    private wrapperElement: HTMLElement
    private readonly textAreaElement: HTMLTextAreaElement
    private repository: CodeRepository
    public editor: CodeMirror.Editor

    constructor(id: string, wrapper: HTMLElement, repository: CodeRepository, public terminal: Terminal, readOnly: boolean, mode: string) {
        const editorConfig = {
            mode: mode,
            lineNumbers: true,
            matchBrackets: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-/": "toggleComment",
            },
            readOnly: readOnly,
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

        this.textAreaElement = wrapper.querySelector(`textarea.${id}`)! as HTMLTextAreaElement
        // @ts-ignore
        this.editor = CodeMirror.fromTextArea(this.textAreaElement, editorConfig)
        this.repository = repository

        this.initFont()
    }

    private initFont() {
        const fontSize = window.localStorage.getItem(Editor.FONT_LOCAL_STORAGE_KEY)
        if (fontSize !== null) {
            this.setEditorFontSize(fontSize)
        }
    }

    public changeEditorFontSize(delta: number) {
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

    public getRunnableCodeSnippet(runConfiguration: RunConfigurationManager): RunnableCodeSnippet {
        return new RunnableCodeSnippet(this.getCode(), runConfiguration.buildArguments,  runConfiguration.runArguments, toSharedRunConfiguration(runConfiguration.configuration))
    }

    public clear() {
        this.setCode("")
    }

    public setTheme(theme: ITheme) {
        this.editor.setOption("theme", theme.name())
    }

    public showCompletion() {
        this.editor.execCommand("autocomplete")
    }

    public refresh() {
        this.editor.refresh()
    }

    public hide() {
        const realEditorElement = this.textAreaElement.parentElement as HTMLElement
        console.log(realEditorElement)
        if (realEditorElement !== undefined) {
            realEditorElement.style.display = "none"
        }

        const editorsElement = realEditorElement.parentElement
        editorsElement?.classList?.remove("two-editors")
    }

    public show() {
        const realEditorElement = this.textAreaElement.parentElement as HTMLElement
        console.log(realEditorElement)
        if (realEditorElement !== undefined) {
            realEditorElement.style.display = "grid"
        }

        const editorsElement = realEditorElement.parentElement
        editorsElement?.classList?.add("two-editors")
    }
}
