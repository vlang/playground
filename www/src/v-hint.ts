import {atoms, builtinTypes, keywords, pseudoKeywords} from "./v"
import {Editor, Position, Token} from "codemirror"

// @ts-ignore
const Pos = CodeMirror.Pos

/**
 * Describe a completion variant.
 */
interface CompletionVariant {
    /**
     * The text to be matched and inserted.
     */
    text: string,

    /**
     * The text to be displayed in the completion list.
     */
    displayText: string,

    /**
     * The class name to be applied to the completion list item.
     * Used to style the completion list item.
     */
    className: string
}

/**
 * Describe a completions variants.
 */
interface CompletionVariants {
    from: Position;
    to: Position;
    list: Array<CompletionVariant | string>;
}

/**
 * Some base builtin modules.
 */
const baseModules = [
    "arrays",
    "benchmark", "bitfield",
    "cli", "clipboard", "compress", "context", "crypto",
    "darwin", "datatypes", "dl", "dlmalloc",
    "encoding", "eventbus",
    "flag", "fontstash",
    "gg", "gx",
    "hash",
    "io",
    "js", "json",
    "log",
    "math", "mssql", "mysql",
    "net",
    "orm", "os",
    "pg", "picoev", "picohttpparser",
    "rand", "readline", "regex", "runtime",
    "semver", "sokol", "sqlite", "stbi", "strconv", "strings", "sync", "szip",
    "term", "time", "toml",
    "v", "vweb",
    "x",
]

const baseAttributes = [
    "params", "noinit", "required", "skip", "assert_continues",
    "unsafe", "manualfree", "heap", "nonnull", "primary", "inline",
    "direct_array_access", "live", "flag", "noinline", "noreturn", "typedef", "console",
    "sql", "table", "deprecated", "deprecated_after", "export", "callconv"
]

const word = "[\\w_]+"
// [noinit]
export const simpleAttributesRegexp = new RegExp(`^(${baseAttributes.join("|")})]$`)

// [key: value]
const keyValue = `(${word}: ${word})`
export const singleKeyValueAttributesRegexp = new RegExp(`^${keyValue}]$`)

// [attr1; attr2]
export const severalSingleKeyValueAttributesRegexp = new RegExp(`^(${baseAttributes.join("|")}(; ?)?){2,}]$`)

// [key: value; key: value]
export const keyValueAttributesRegexp = new RegExp(`^((${keyValue})(; )?){2,}]$`)

// [if expr ?]
export const ifAttributesRegexp = new RegExp(`^if ${word} \\??]`)

function computeCompletionVariants(editor: Editor): CompletionVariants | null {
    // some additional information for the current token.
    let context: Token[] = []
    // find the token at the cursor
    const cur = editor.getCursor()
    let token = editor.getTokenAt(cur)

    const knownImports = new Set<string>()
    for (let i = 0; i < Math.min(editor.lineCount(), 10); i++) {
        const lineTokens = editor.getLineTokens(i).filter(tkn => tkn.type != null)
        if (lineTokens.length > 0 && lineTokens[0].string === "import") {
            knownImports.add(lineTokens[lineTokens.length - 1].string)
        }
    }

    const lineTokens = editor.getLineTokens(cur.line)
    if (lineTokens.length > 0 && lineTokens[0].string === "import") {
        // if the first token is "import", then we are in an import statement,
        // so add this information to context.
        context.push(lineTokens[0])
    }

    const len = token.string.length
    const prevToken = editor.getTokenAt(Pos(cur.line, cur.ch - len))
    if (token.string === ".") {
        context.push(token)
    }
    if (prevToken.string === ".") {
        context.push(prevToken)
    }

    if (/\b(?:string|comment)\b/.test(token.type ?? "")) return null

    // if it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
        token = {
            start: cur.ch, end: cur.ch, string: "", state: token.state,
            type: token.string === "." ? "property" : null,
        }
    } else if (token.end > cur.ch) {
        token.end = cur.ch
        token.string = token.string.slice(0, cur.ch - token.start)
    }

    return {
        list: getCompletions(token, knownImports, context),
        from: Pos(cur.line, token.start),
        to: Pos(cur.line, token.end),
    }
}

function getCompletions(token: Token, knownImports: Set<string>, context: Token[]): CompletionVariant[] {
    const variants: CompletionVariant[] = []
    const tokenValue = token.string

    function addCompletionVariant(variant: CompletionVariant) {
        const variantText = variant.text

        // if no matching text, ignore
        if (!variantText.startsWith(tokenValue)) {
            return
        }

        const alreadyContains = variants.find((f) => f.text === variantText)
        if (!alreadyContains) {
            variants.push(variant)
        }
    }

    if (context && context.length) {
        const lastToken = context.pop()
        if (lastToken !== undefined) {
            if (lastToken.type === "keyword" && lastToken.string === "import") {
                baseModules.forEach((text) => {
                    addCompletionVariant({
                        text: text,
                        displayText: text,
                        className: "completion-module",
                    })
                })
                return variants
            }

            // disable completion after dot
            if (lastToken.string === ".") {
                return []
            }
        }
    }

    knownImports.forEach((text) => {
        addCompletionVariant({
            text: text,
            displayText: text,
            className: "completion-module",
        })
    })

    keywords.forEach((text) => {
        addCompletionVariant({
            text: text + " ",
            displayText: text,
            className: "completion-keyword",
        })
    })

    pseudoKeywords.forEach((text) => {
        addCompletionVariant({
            text: text + " ",
            displayText: text,
            className: "completion-keyword",
        })
    })

    atoms.forEach((text) => {
        addCompletionVariant({
            text: text,
            displayText: text,
            className: "completion-atom",
        })
    })

    builtinTypes.forEach((text) => {
        addCompletionVariant({
            text: text,
            displayText: text,
            className: "completion-type",
        })
    })

    return variants
}

const hintHelper = (editor: Editor) => computeCompletionVariants(editor)

// @ts-ignore
CodeMirror.registerHelper("hint", "v", hintHelper)
