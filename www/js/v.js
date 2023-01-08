CodeMirror.defineMode("v", function (config) {
    const indentUnit = config.indentUnit;

    const keywords = {
        "as": true,
        "asm": true,
        "assert": true,
        "atomic": true,
        "break": true,
        "const": true,
        "continue": true,
        "defer": true,
        "else": true,
        "enum": true,
        "fn": true,
        "for": true,
        "go": true,
        "goto": true,
        "if": true,
        "import": true,
        "in": true,
        "interface": true,
        "is": true,
        "isreftype": true,
        "lock": true,
        "match": true,
        "module": true,
        "mut": true,
        "none": true,
        "or": true,
        "pub": true,
        "return": true,
        "rlock": true,
        "select": true,
        "shared": true,
        "sizeof": true,
        "static": true,
        "struct": true,
        "spawn": true,
        "type": true,
        "typeof": true,
        "union": true,
        "unsafe": true,
        "volatile": true,
        "__offsetof": true,
    };

    const pseudo_keywords = {
        "sql": true,
    };

    const atoms = {
        "true": true, "false": true, "nil": true, "print": true,
        "println": true, "exit": true, "panic": true, "error": true,
    };

    const builtinTypes = {
        "bool": true,
        "string": true,
        "i8": true,
        "i16": true,
        "int": true,
        "i64": true,
        "i128": true,
        "u8": true,
        "u16": true,
        "u32": true,
        "u64": true,
        "u128": true,
        "rune": true,
        "f32": true,
        "f64": true,
        "isize": true,
        "usize": true,
        "voidptr": true,
        "any": true,
    };

    const isOperatorChar = /[+\-*&^%:=<>!|\/]/;

    let curPunc;

    /**
     * @param stream
     * @returns {string}
     */
    function eatIdentifier(stream) {
        stream.eatWhile(/[\w\$_\xa1-\uffff]/);
        return stream.current();
    }

    function tokenBase(stream, state) {
        const ch = stream.next();

        if (state.context.insideString && ch === '}') {
            stream.eat('}');
            state.tokenize = tokenString(state.context.stringQuote);
            return 'end-interpolation';
        }

        if (ch === '"' || ch === "'" || ch === "`") {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        }
        if (/[\d.]/.test(ch)) {
            if (ch === ".") {
                if (!stream.match(/^[0-9]+([eE][\-+]?[0-9]+)?/)) {
                    return "operator";
                }
            } else if (ch === "0") {
                stream.match(/^[xX][0-9a-fA-F]+/) || stream.match(/^0[0-7]+/);
            } else {
                stream.match(/^[0-9]*\.?[0-9]*([eE][\-+]?[0-9]+)?/);
            }
            return "number";
        }
        if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
            curPunc = ch;
            return null;
        }
        if (ch === "/") {
            if (stream.eat("*")) {
                state.tokenize = tokenComment;
                return tokenComment(stream, state);
            }
            if (stream.eat("/")) {
                stream.skipToEnd();
                return "comment";
            }
        }
        if (isOperatorChar.test(ch)) {
            stream.eatWhile(isOperatorChar);
            return "operator";
        }

        if (ch === '@') {
            eatIdentifier(stream);
            return "at-identifier";
        }

        if (ch === '$') {
            const ident = eatIdentifier(stream).slice(1);
            if (keywords.propertyIsEnumerable(ident)) {
                return "keyword";
            }

            return "compile-time-identifier";
        }

        const cur = eatIdentifier(stream);
        if (cur === "import") {
            state.expectedImportName = true;
        }

        if (keywords.propertyIsEnumerable(cur)) return "keyword";
        if (pseudo_keywords.propertyIsEnumerable(cur)) return "keyword";
        if (atoms.propertyIsEnumerable(cur)) return "atom";
        if (builtinTypes.propertyIsEnumerable(cur)) return "builtin";

        if (cur[0].toUpperCase() === cur[0]) {
            return "type";
        }

        const next = stream.peek()
        if (next === '(' || next === '<') {
            return "function";
        }

        if (next === '[') {
            stream.next()
            const after = stream.next()
            stream.backUp(2)
            if (after.match(/[A-Z]/i)) {
                return "function";
            }
        }

        // highlight only last part
        // example:
        //   import foo.boo
        //              ^^^ - only this part will be highlighted
        if (state.expectedImportName && !stream.peek(".")) {
            state.expectedImportName = false;
            if (state.knownImports === undefined) {
                state.knownImports = {};
            }
            state.knownImports[cur] = true;
            return "import-name";
        }

        // highlight only identifier with dot after it
        // example:
        //   import foo
        //   import bar
        //
        //   foo.bar
        //   ^^^ - only this part will be highlighted
        if (state.knownImports !== undefined && state.knownImports[cur] && stream.peek(".")) {
            return "import-name";
        }

        return "variable";
    }

    function tokenLongInterpolation(stream, state) {
        if (stream.match("}")) {
            state.tokenize = tokenString(state.context.stringQuote);
            return 'end-interpolation';
        }
        state.tokenize = tokenBase;
        return state.tokenize(stream, state);
    }

    function tokenShortInterpolation(stream, state) {
        const ch = stream.next();
        if (ch === ' ') {
            state.context.afterDotInsideInterpolation = false;
            state.tokenize = tokenString(state.context.stringQuote);
            return state.tokenize(stream, state);
        }
        if (ch === '.') {
            return "operator";
        }

        const ident = eatIdentifier(stream);
        if (ident[0].toLowerCase() === ident[0].toUpperCase()) {
            state.tokenize = tokenString(state.context.stringQuote);
            return state.tokenize(stream, state);
        }

        const next = stream.next();
        stream.backUp(1)
        if (next === '.') {
            state.tokenize = tokenShortInterpolation;
            state.context.afterDotInsideInterpolation = true
        } else {
            state.tokenize = tokenString(state.context.stringQuote);
        }

        if (state.context.afterDotInsideInterpolation) {
            return "property";
        }

        return "variable"
    }

    function tokenNextInterpolation(stream, state) {
        let next = stream.next()
        if (next === '$' && stream.eat('{')) {
            state.tokenize = tokenLongInterpolation;
            return "start-interpolation";
        }
        if (next === '$') {
            state.tokenize = tokenShortInterpolation;
            return "start-interpolation";
        }

        return "string";
    }

    function tokenString(quote) {
        return function (stream, state) {
            state.context.insideString = true;
            state.context.stringQuote = quote;

            let escaped = false;
            let next = '';
            let end = false;

            while ((next = stream.next()) != null) {
                if (next === quote && !escaped) {
                    end = true;
                    break;
                }
                if (next === '$' && !escaped && stream.eat('{')) {
                    state.tokenize = tokenNextInterpolation;
                    stream.backUp(2)
                    return "string";
                }
                if (next === '$' && !escaped) {
                    state.tokenize = tokenNextInterpolation;
                    stream.backUp(1)
                    return "string";
                }
                escaped = !escaped && next === "\\";
            }

            if (end || escaped) {
                state.tokenize = tokenBase;
            }

            state.context.insideString = false;
            state.context.stringQuote = null;
            return "string";
        };
    }

    function tokenComment(stream, state) {
        let maybeEnd = false, ch;
        while (ch = stream.next()) {
            if (ch === "/" && maybeEnd) {
                state.tokenize = tokenBase;
                break;
            }
            maybeEnd = (ch === "*");
        }
        return "comment";
    }

    function Context(indented, column, type, align, prev) {
        this.indented = indented;
        this.column = column;
        this.type = type;
        this.align = align;
        this.prev = prev;
        this.insideString = false;
        this.stringQuote = null;
        this.afterDotInsideInterpolation = true;
        this.expectedImportName = true;
        this.knownImports = {"": true};
    }

    function pushContext(state, col, type) {
        return state.context = new Context(state.indented, col, type, null, state.context);
    }

    function popContext(state) {
        if (!state.context.prev) return;
        const t = state.context.type;
        if (t === ")" || t === "]" || t === "}")
            state.indented = state.context.indented;
        return state.context = state.context.prev;
    }

    return {
        startState: function (basecolumn) {
            return {
                tokenize: null,
                context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
                indented: 0,
                startOfLine: true
            };
        },

        token: function (stream, state) {
            const ctx = state.context;
            if (stream.sol()) {
                if (ctx.align == null) ctx.align = false;
                state.indented = stream.indentation();
                state.startOfLine = true;
                if (ctx.type === "case") ctx.type = "}";
            }
            if (stream.eatSpace()) return null;
            curPunc = null;
            const style = (state.tokenize || tokenBase)(stream, state);
            if (style === "comment") return style;
            if (ctx.align == null) ctx.align = true;

            if (curPunc === "{") pushContext(state, stream.column(), "}");
            else if (curPunc === "[") pushContext(state, stream.column(), "]");
            else if (curPunc === "(") pushContext(state, stream.column(), ")");
            else if (curPunc === "case") ctx.type = "case";
            else if (curPunc === "}" && ctx.type === "}") popContext(state);
            else if (curPunc === ctx.type) popContext(state);
            state.startOfLine = false;
            return style;
        },

        indent: function (state, textAfter) {
            if (state.tokenize !== tokenBase && state.tokenize != null) return CodeMirror.Pass;
            const ctx = state.context, firstChar = textAfter && textAfter.charAt(0);
            if (ctx.type === "case" && /^(?:case|default)\b/.test(textAfter)) {
                state.context.type = "}";
                return ctx.indented;
            }
            const closing = firstChar === ctx.type;
            if (ctx.align) return ctx.column + (closing ? 0 : 1);
            else return ctx.indented + (closing ? 0 : indentUnit);
        },

        electricChars: "{}):",
        closeBrackets: "()[]{}''\"\"``",
        fold: "brace",
        blockCommentStart: "/*",
        blockCommentEnd: "*/",
        lineComment: "//",
    };
});

CodeMirror.defineMIME("text/x-v", "v");
