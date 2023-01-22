"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // src/v.ts
  var Context = class {
    constructor(indentation, column, type, align, prev) {
      this.indentation = indentation;
      this.column = column;
      this.type = type;
      this.align = align;
      this.prev = prev;
      /**
       * Whenever current position inside a string.
       */
      this.insideString = false;
      /**
       * Current quotation mark.
       * Valid only when insideString is true.
       */
      this.stringQuote = null;
      /**
       * Whenever next token expected to be an import name.
       * Used for highlighting import names in import statements.
       */
      this.expectedImportName = false;
      /**
       * Set of imports in current context.
       * Used for highlighting import names in code.
       */
      this.knownImports = /* @__PURE__ */ new Set();
    }
  };
  __name(Context, "Context");
  var keywords = /* @__PURE__ */ new Set([
    "as",
    "asm",
    "assert",
    "atomic",
    "break",
    "const",
    "continue",
    "defer",
    "else",
    "enum",
    "fn",
    "for",
    "go",
    "goto",
    "if",
    "import",
    "in",
    "interface",
    "is",
    "isreftype",
    "lock",
    "match",
    "module",
    "mut",
    "none",
    "or",
    "pub",
    "return",
    "rlock",
    "select",
    "shared",
    "sizeof",
    "static",
    "struct",
    "spawn",
    "type",
    "typeof",
    "union",
    "unsafe",
    "volatile",
    "__offsetof"
  ]);
  var pseudoKeywords = /* @__PURE__ */ new Set([
    "sql",
    "chan",
    "thread"
  ]);
  var atoms = /* @__PURE__ */ new Set([
    "true",
    "false",
    "nil",
    "print",
    "println",
    "exit",
    "panic",
    "error",
    "dump"
  ]);
  var builtinTypes = /* @__PURE__ */ new Set([
    "bool",
    "string",
    "i8",
    "i16",
    "int",
    "i64",
    "i128",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "rune",
    "f32",
    "f64",
    "isize",
    "usize",
    "voidptr",
    "any"
  ]);
  CodeMirror.defineMode("v", (config) => {
    var _a;
    const indentUnit = (_a = config.indentUnit) != null ? _a : 0;
    const isOperatorChar = /[+\-*&^%:=<>!|\/]/;
    let curPunc = null;
    function eatIdentifier(stream) {
      stream.eatWhile(/[\w$_\xa1-\uffff]/);
      return stream.current();
    }
    __name(eatIdentifier, "eatIdentifier");
    function tokenBase(stream, state) {
      const ch = stream.next();
      if (ch === null) {
        return null;
      }
      if (state.context.insideString && ch === "}") {
        stream.eat("}");
        state.tokenize = tokenString(state.context.stringQuote);
        return "end-interpolation";
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      if (/[\d.]/.test(ch)) {
        if (ch === ".") {
          if (!stream.match(/^[0-9_]+([eE][\-+]?[0-9_]+)?/)) {
            return "operator";
          }
        } else if (ch === "0") {
          stream.match(/^[xX][0-9a-fA-F_]+/) || stream.match(/^0[0-7_]+/);
        } else {
          stream.match(/^[0-9_]*\.?[0-9_]*([eE][\-+]?[0-9_]+)?/);
        }
        return "number";
      }
      if (/[\[\]{}(),;:.]/.test(ch)) {
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
      if (ch === "@") {
        eatIdentifier(stream);
        return "at-identifier";
      }
      if (ch === "$") {
        const ident = eatIdentifier(stream).slice(1);
        if (keywords.has(ident)) {
          return "keyword";
        }
        return "compile-time-identifier";
      }
      const cur = eatIdentifier(stream);
      if (cur === "import") {
        state.context.expectedImportName = true;
      }
      if (keywords.has(cur))
        return "keyword";
      if (pseudoKeywords.has(cur))
        return "keyword";
      if (atoms.has(cur))
        return "atom";
      if (builtinTypes.has(cur))
        return "builtin";
      if (cur[0].toUpperCase() === cur[0]) {
        return "type";
      }
      const next = stream.peek();
      if (next === "(" || next === "<") {
        return "function";
      }
      if (next === "[") {
        stream.next();
        const after = stream.next();
        stream.backUp(2);
        if (after != null && after.match(/[A-Z]/i)) {
          return "function";
        }
      }
      if (state.context.expectedImportName && stream.peek() != ".") {
        state.context.expectedImportName = false;
        if (state.context.knownImports === void 0) {
          state.context.knownImports = /* @__PURE__ */ new Set();
        }
        state.context.knownImports.add(cur);
        return "import-name";
      }
      if (state.context.knownImports.has(cur) && stream.peek() == ".") {
        return "import-name";
      }
      return "variable";
    }
    __name(tokenBase, "tokenBase");
    function tokenLongInterpolation(stream, state) {
      if (stream.match("}")) {
        state.tokenize = tokenString(state.context.stringQuote);
        return "end-interpolation";
      }
      state.tokenize = tokenBase;
      return state.tokenize(stream, state);
    }
    __name(tokenLongInterpolation, "tokenLongInterpolation");
    function tokenShortInterpolation(stream, state) {
      const ch = stream.next();
      if (ch === " ") {
        state.tokenize = tokenString(state.context.stringQuote);
        return state.tokenize(stream, state);
      }
      if (ch === ".") {
        return "operator";
      }
      const ident = eatIdentifier(stream);
      if (ident[0].toLowerCase() === ident[0].toUpperCase()) {
        state.tokenize = tokenString(state.context.stringQuote);
        return state.tokenize(stream, state);
      }
      const next = stream.next();
      stream.backUp(1);
      if (next === ".") {
        state.tokenize = tokenShortInterpolation;
      } else {
        state.tokenize = tokenString(state.context.stringQuote);
      }
      return "variable";
    }
    __name(tokenShortInterpolation, "tokenShortInterpolation");
    function tokenNextInterpolation(stream, state) {
      let next = stream.next();
      if (next === "$" && stream.eat("{")) {
        state.tokenize = tokenLongInterpolation;
        return "start-interpolation";
      }
      if (next === "$") {
        state.tokenize = tokenShortInterpolation;
        return "start-interpolation";
      }
      return "string";
    }
    __name(tokenNextInterpolation, "tokenNextInterpolation");
    function tokenString(quote) {
      return function(stream, state) {
        state.context.insideString = true;
        state.context.stringQuote = quote;
        let next = "";
        let escaped = false;
        let end = false;
        while ((next = stream.next()) != null) {
          if (next === quote && !escaped) {
            end = true;
            break;
          }
          if (next === "$" && !escaped && stream.eat("{")) {
            state.tokenize = tokenNextInterpolation;
            stream.backUp(2);
            return "string";
          }
          if (next === "$" && !escaped) {
            state.tokenize = tokenNextInterpolation;
            stream.backUp(1);
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
    __name(tokenString, "tokenString");
    function tokenComment(stream, state) {
      let maybeEnd = false;
      let ch;
      while (ch = stream.next()) {
        if (ch === "/" && maybeEnd) {
          state.tokenize = tokenBase;
          break;
        }
        maybeEnd = ch === "*";
      }
      return "comment";
    }
    __name(tokenComment, "tokenComment");
    function pushContext(state, column, type) {
      return state.context = new Context(state.indention, column, type, null, state.context);
    }
    __name(pushContext, "pushContext");
    function popContext(state) {
      if (!state.context.prev)
        return;
      const t = state.context.type;
      if (t === ")" || t === "]" || t === "}")
        state.indention = state.context.indentation;
      state.context = state.context.prev;
      return state.context;
    }
    __name(popContext, "popContext");
    return {
      startState: function() {
        return {
          tokenize: null,
          context: new Context(0, 0, "top", false),
          indention: 0,
          startOfLine: true
        };
      },
      token: function(stream, state) {
        const ctx = state.context;
        if (stream.sol()) {
          if (ctx.align == null) {
            ctx.align = false;
          }
          state.indention = stream.indentation();
          state.startOfLine = true;
        }
        if (stream.eatSpace()) {
          return null;
        }
        curPunc = null;
        const style = (state.tokenize || tokenBase)(stream, state);
        if (style === "comment") {
          return style;
        }
        if (ctx.align == null) {
          ctx.align = true;
        }
        if (curPunc === "{")
          pushContext(state, stream.column(), "}");
        else if (curPunc === "[")
          pushContext(state, stream.column(), "]");
        else if (curPunc === "(")
          pushContext(state, stream.column(), ")");
        else if (curPunc === "}" && ctx.type === "}")
          popContext(state);
        else if (curPunc === ctx.type)
          popContext(state);
        state.startOfLine = false;
        return style;
      },
      indent: function(state, textAfter) {
        if (state.tokenize !== tokenBase && state.tokenize != null) {
          return 0;
        }
        if (state.context.type == "top") {
          return 0;
        }
        const ctx = state.context;
        const firstChar = textAfter.charAt(0);
        const closing = firstChar === ctx.type;
        if (ctx.align) {
          return ctx.column + (closing ? 0 : 1);
        }
        return ctx.indentation + (closing ? 0 : indentUnit);
      },
      // @ts-ignore
      electricChars: "{}):",
      // @ts-ignore
      closeBrackets: "()[]{}''\"\"``",
      fold: "brace",
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      lineComment: "//"
    };
  });
  CodeMirror.defineMIME("text/x-v", "v");

  // src/v-hint.ts
  var Pos = CodeMirror.Pos;
  var baseModules = [
    "arrays",
    "benchmark",
    "bitfield",
    "cli",
    "clipboard",
    "compress",
    "context",
    "crypto",
    "darwin",
    "datatypes",
    "dl",
    "dlmalloc",
    "encoding",
    "eventbus",
    "flag",
    "fontstash",
    "gg",
    "gx",
    "hash",
    "io",
    "js",
    "json",
    "log",
    "math",
    "mssql",
    "mysql",
    "net",
    "orm",
    "os",
    "pg",
    "picoev",
    "picohttpparser",
    "rand",
    "readline",
    "regex",
    "runtime",
    "semver",
    "sokol",
    "sqlite",
    "stbi",
    "strconv",
    "strings",
    "sync",
    "szip",
    "term",
    "time",
    "toml",
    "v",
    "vweb",
    "x"
  ];
  function computeCompletionVariants(editor) {
    var _a;
    let context = [];
    const cur = editor.getCursor();
    let token = editor.getTokenAt(cur);
    const knownImports = /* @__PURE__ */ new Set();
    for (let i = 0; i < Math.min(editor.lineCount(), 10); i++) {
      const lineTokens2 = editor.getLineTokens(i).filter((tkn) => tkn.type != null);
      if (lineTokens2.length > 0 && lineTokens2[0].string === "import") {
        knownImports.add(lineTokens2[lineTokens2.length - 1].string);
      }
    }
    const lineTokens = editor.getLineTokens(cur.line);
    if (lineTokens.length > 0 && lineTokens[0].string === "import") {
      context.push(lineTokens[0]);
    }
    const len = token.string.length;
    const prevToken = editor.getTokenAt(Pos(cur.line, cur.ch - len));
    if (token.string === ".") {
      context.push(token);
    }
    if (prevToken.string === ".") {
      context.push(prevToken);
    }
    if (/\b(?:string|comment)\b/.test((_a = token.type) != null ? _a : ""))
      return null;
    if (!/^[\w$_]*$/.test(token.string)) {
      token = {
        start: cur.ch,
        end: cur.ch,
        string: "",
        state: token.state,
        type: token.string === "." ? "property" : null
      };
    } else if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }
    return {
      list: getCompletions(token, knownImports, context),
      from: Pos(cur.line, token.start),
      to: Pos(cur.line, token.end)
    };
  }
  __name(computeCompletionVariants, "computeCompletionVariants");
  function getCompletions(token, knownImports, context) {
    const variants = [];
    const tokenValue = token.string;
    function addCompletionVariant(variant) {
      const variantText = variant.text;
      if (variantText.indexOf(tokenValue) === -1) {
        return;
      }
      const alreadyContains = variants.find((f) => f.text === variantText);
      if (!alreadyContains) {
        variants.push(variant);
      }
    }
    __name(addCompletionVariant, "addCompletionVariant");
    if (context && context.length) {
      const lastToken = context.pop();
      if (lastToken !== void 0) {
        if (lastToken.type === "keyword" && lastToken.string === "import") {
          baseModules.forEach((text) => {
            addCompletionVariant({
              text,
              displayText: text,
              className: "completion-module"
            });
          });
          return variants;
        }
        if (lastToken.string === ".") {
          return [];
        }
      }
    }
    knownImports.forEach((text) => {
      addCompletionVariant({
        text,
        displayText: text,
        className: "completion-module"
      });
    });
    keywords.forEach((text) => {
      addCompletionVariant({
        text: text + " ",
        displayText: text,
        className: "completion-keyword"
      });
    });
    pseudoKeywords.forEach((text) => {
      addCompletionVariant({
        text: text + " ",
        displayText: text,
        className: "completion-keyword"
      });
    });
    atoms.forEach((text) => {
      addCompletionVariant({
        text,
        displayText: text,
        className: "completion-atom"
      });
    });
    builtinTypes.forEach((text) => {
      addCompletionVariant({
        text,
        displayText: text,
        className: "completion-type"
      });
    });
    return variants;
  }
  __name(getCompletions, "getCompletions");
  var hintHelper = /* @__PURE__ */ __name((editor) => computeCompletionVariants(editor), "hintHelper");
  CodeMirror.registerHelper("hint", "v", hintHelper);

  // src/Repositories/SharedCodeRepository.ts
  var SharedCodeRepository = class {
    constructor(hash) {
      this.hash = hash;
    }
    saveCode(_) {
    }
    getCode(onReady) {
      return this.getSharedCode(onReady);
    }
    getSharedCode(onReady) {
      const data = new FormData();
      data.append("hash", this.hash);
      fetch("/query", {
        method: "post",
        body: data
      }).then((resp) => resp.text()).then((data2) => {
        onReady(data2);
      }).catch((err) => {
        console.log(err);
      });
    }
  };
  __name(SharedCodeRepository, "SharedCodeRepository");
  SharedCodeRepository.QUERY_PARAM_NAME = "query";
  SharedCodeRepository.CODE_NOT_FOUND = "Not found.";

  // src/Repositories/TextCodeRepository.ts
  var TextCodeRepository = class {
    constructor(text) {
      this.text = text;
    }
    saveCode(_) {
    }
    getCode(onReady) {
      onReady(this.text);
    }
  };
  __name(TextCodeRepository, "TextCodeRepository");

  // src/Repositories/LocalCodeRepository.ts
  var _LocalCodeRepository = class {
    saveCode(code) {
      window.localStorage.setItem(_LocalCodeRepository.LOCAL_STORAGE_KEY, code);
    }
    getCode(onReady) {
      const localCode = window.localStorage.getItem(_LocalCodeRepository.LOCAL_STORAGE_KEY);
      if (localCode === null || localCode === void 0) {
        onReady(_LocalCodeRepository.WELCOME_CODE);
        return;
      }
      onReady(localCode);
    }
  };
  var LocalCodeRepository = _LocalCodeRepository;
  __name(LocalCodeRepository, "LocalCodeRepository");
  LocalCodeRepository.LOCAL_STORAGE_KEY = "code";
  // language=V
  LocalCodeRepository.WELCOME_CODE = `
// Welcome to the V Playground!
// Here you can edit, run, and share V code.
// Let's start with a simple "Hello, Playground!" example:
println('Hello, Playground!')

// To run the code, click the "Run" button or just press Ctrl + R.
// To format the code, click the "Format" button or just press Ctrl + L.
// See all shortcuts in the "Help" in the bottom right corner.

// More examples are available in right dropdown list.
// You can find Help for shortcuts in the bottom right corner or just press Ctrl + I.
// See also change theme button in the top right corner. 
// If you want to learn more about V, visit https://vlang.io
// Join us on Discord: https://discord.gg/vlang
// Enjoy!
`.trimStart();

  // src/Repositories/Base64CodeRepository.ts
  var Base64CodeRepository = class {
    constructor(text) {
      this.text = text;
      this.decodedCode = atob(text);
    }
    saveCode(_) {
    }
    getCode(onReady) {
      onReady(this.decodedCode);
    }
  };
  __name(Base64CodeRepository, "Base64CodeRepository");
  Base64CodeRepository.QUERY_PARAM_NAME = "base64";

  // src/Repositories/GithubGistCodeRepository.ts
  var GithubGistCodeRepository = class {
    constructor(id) {
      this.id = id;
    }
    saveCode(_) {
    }
    getCode(onReady) {
      fetch("https://api.github.com/gists/" + this.id, {
        method: "get",
        headers: {
          "Content-Type": "application/json"
        }
      }).then((resp) => resp.json()).then((data) => {
        const files = data.files;
        const firstKey = Object.keys(files)[0];
        const file = files[firstKey];
        const url = file.raw_url;
        fetch(url, {
          method: "get",
          headers: {
            "Content-Type": "text/plain"
          }
        }).then((r) => r.text()).then((r) => {
          onReady(r);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    }
  };
  __name(GithubGistCodeRepository, "GithubGistCodeRepository");
  GithubGistCodeRepository.QUERY_PARAM_NAME = "gist";

  // src/Repositories/CodeRepositoryManager.ts
  var CodeRepositoryManager = class {
    /**
     * Base on `params` tries to select the appropriate repository to get the code.
     *
     * @param params The query parameters.
     * @param config The playground configuration.
     * @returns {CodeRepository}
     */
    static selectRepository(params, config) {
      if (config !== void 0 && config.codeHash !== null && config.codeHash !== void 0) {
        return new SharedCodeRepository(config.codeHash);
      }
      if (config !== void 0 && config.code !== null && config.code !== void 0) {
        return new TextCodeRepository(config.code);
      }
      if (config !== void 0 && config.embed !== null && config.embed !== void 0 && config.embed) {
        return new TextCodeRepository("");
      }
      const repository = new LocalCodeRepository();
      const hash = params.getURLParameter(SharedCodeRepository.QUERY_PARAM_NAME);
      if (hash !== null && hash !== void 0) {
        return new SharedCodeRepository(hash);
      }
      const base64Code = params.getURLParameter(Base64CodeRepository.QUERY_PARAM_NAME);
      if (base64Code !== null && base64Code !== void 0) {
        return new Base64CodeRepository(base64Code);
      }
      const gistId = params.getURLParameter(GithubGistCodeRepository.QUERY_PARAM_NAME);
      if (gistId !== null && gistId !== void 0) {
        return new GithubGistCodeRepository(gistId);
      }
      return repository;
    }
  };
  __name(CodeRepositoryManager, "CodeRepositoryManager");

  // src/QueryParams.ts
  var QueryParams = class {
    /**
     * @param path - The path to parse (usually `window.location.search`).
     */
    constructor(path) {
      this.params = new URLSearchParams(path);
    }
    /**
     * Update the URL with the new param.
     * @param param The param to update.
     * @param value The new value of the param.
     */
    updateURLParameter(param, value) {
      const url = QueryParams.updateURLParameter(window.location.href, param, value);
      window.history.replaceState({}, "", url);
    }
    getURLParameter(param) {
      return this.params.get(param);
    }
    static updateURLParameter(url, param, value) {
      const parsedUrl = new URL(url);
      if (value) {
        parsedUrl.searchParams.set(param, value);
      } else {
        parsedUrl.searchParams.delete(param);
      }
      return parsedUrl.toString();
    }
  };
  __name(QueryParams, "QueryParams");

  // src/HelpManager.ts
  var _HelpManager = class {
    constructor(containingElement) {
      this.containingElement = containingElement;
      this.element = containingElement.getElementsByClassName("js-help-wrapper")[0];
      if (this.element === null || this.element === void 0) {
        return;
      }
      this.helpOverlay = this.element.querySelector(".js-help-overlay");
      this.showHelpButton = this.element.querySelector(".js-show-help");
      this.closeHelpButton = this.element.querySelector(".js-close-help");
      this.mount();
    }
    mount() {
      if (this.showHelpButton !== void 0) {
        this.showHelpButton.addEventListener("click", () => {
          this.toggleHelp();
        });
      }
      if (this.helpOverlay !== void 0) {
        this.helpOverlay.addEventListener("click", () => {
          this.toggleHelp();
        });
      }
      if (this.closeHelpButton !== void 0) {
        this.closeHelpButton.addEventListener("click", () => {
          this.toggleHelp();
        });
      }
      if (!_HelpManager.isMac) {
        const shortcuts = document.querySelectorAll(".js-shortcut kbd.ctrl");
        shortcuts.forEach(function(shortcut) {
          shortcut.innerText = "Ctrl";
        });
      }
    }
    closeHelp() {
      if (!this.helpOverlay.classList.contains("opened")) {
        return;
      }
      this.toggleHelp();
    }
    toggleHelp() {
      const help = this.containingElement.getElementsByClassName("js-help")[0];
      help.classList.toggle("opened");
      this.helpOverlay.classList.toggle("opened");
    }
  };
  var HelpManager = _HelpManager;
  __name(HelpManager, "HelpManager");
  // TODO: don't know other way to detect macOS...
  // noinspection JSDeprecatedSymbols
  HelpManager.isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // src/clipboard_util.ts
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      const msg = successful ? "successful" : "unsuccessful";
      console.log("Fallback: Copying text command was " + msg);
    } catch (err) {
      console.log("Fallback: Oops, unable to copy", err);
    }
    document.body.removeChild(textArea);
  }
  __name(fallbackCopyTextToClipboard, "fallbackCopyTextToClipboard");
  function copyTextToClipboard(text, onCopy) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log("Async: Copying to clipboard was successful!");
      onCopy();
    }, function(err) {
      fallbackCopyTextToClipboard(text);
      console.log("Async: Could not copy text: ", err, "fallback to old method");
    });
  }
  __name(copyTextToClipboard, "copyTextToClipboard");

  // src/Terminal/Terminal.ts
  var Terminal = class {
    constructor(element) {
      this.onClose = null;
      this.onWrite = null;
      this.filters = [];
      this.element = element;
      this.attachResizeHandler(element);
    }
    registerCloseHandler(handler) {
      this.onClose = handler;
    }
    registerWriteHandler(handler) {
      this.onWrite = handler;
    }
    registerFilter(filter) {
      this.filters.push(filter);
    }
    write(text) {
      const lines = text.split("\n");
      const outputElement = this.getTerminalOutputElement();
      const filteredLines = lines.filter((line) => this.filters.every((filter) => filter(line)));
      const newText = filteredLines.join("\n");
      outputElement.innerHTML += newText + "\n";
      if (this.onWrite !== null) {
        this.onWrite(text);
      }
    }
    clear() {
      this.getTerminalOutputElement().innerHTML = "";
    }
    mount() {
      const closeButton = this.element.querySelector(".js-terminal__close-buttom");
      if (closeButton === null || closeButton === void 0 || this.onClose === null) {
        return;
      }
      closeButton.addEventListener("click", this.onClose);
    }
    getTerminalOutputElement() {
      return this.element.querySelector(".js-terminal__output");
    }
    attachResizeHandler(element) {
      const header = element.querySelector(".header");
      if (!header)
        return;
      let mouseDown = false;
      header.addEventListener("mousedown", () => {
        mouseDown = true;
        document.body.classList.add("dragging");
      });
      document.addEventListener("mousemove", (e) => {
        if (!mouseDown)
          return;
        element.style.height = `${document.body.clientHeight - e.clientY + header.clientHeight / 2}px`;
      });
      document.addEventListener("mouseup", () => {
        mouseDown = false;
        document.body.classList.remove("dragging");
      });
    }
  };
  __name(Terminal, "Terminal");

  // src/icons.ts
  var runIcons = `
<svg width="33" height="23" viewBox="0 0 33 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.7299 19.8013L19.7647 3.09237C19.8671 2.80897 19.7058 2.60237 19.4046 2.63127L14.6589 3.08648C14.3578 3.11539 14.0326 3.36967 13.9332 3.65405L8.34737 19.6224C8.24785 19.9067 8.41265 20.1376 8.71506 20.1376H13.3343C13.4856 20.1376 13.6499 20.0226 13.7011 19.8809L13.7299 19.8013Z"
          fill="#536B8A"/>
    <path d="M2.37076 2.63127L7.11662 3.08648C7.41765 3.11539 7.74316 3.36954 7.84309 3.65377L13.5471 19.8801C13.597 20.0223 13.5148 20.1376 13.3635 20.1376H8.71501C8.4126 20.1376 8.08399 19.9075 7.98162 19.6241L2.01074 3.09237C1.90842 2.80897 2.0697 2.60237 2.37076 2.63127Z"
          fill="#5D87BF"/>
    <path d="M28.6948 15.9266L22.5937 19.4338C22.2604 19.6254 21.8446 19.3848 21.8446 19.0003V11.9859C21.8446 11.6014 22.2604 11.3608 22.5937 11.5524L28.6948 15.0596C29.0292 15.2518 29.0292 15.7343 28.6948 15.9266Z"
          fill="#659360" stroke="#659360"/>
</svg>
`;
  var testIcons = `
<svg width="33" height="23" viewBox="0 0 33 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_15_68)">
        <path d="M13.7299 19.8013L19.7647 3.09237C19.8671 2.80897 19.7058 2.60237 19.4046 2.63127L14.6589 3.08648C14.3578 3.11539 14.0326 3.36967 13.9332 3.65405L8.34737 19.6224C8.24785 19.9067 8.41265 20.1376 8.71506 20.1376H13.3343C13.4856 20.1376 13.6499 20.0226 13.7011 19.8809L13.7299 19.8013Z" fill="#536B8A"/>
        <path d="M2.37076 2.63127L7.11662 3.08648C7.41765 3.11539 7.74316 3.36954 7.84309 3.65377L13.5471 19.8801C13.597 20.0223 13.5148 20.1376 13.3635 20.1376H8.71501C8.4126 20.1376 8.08399 19.9075 7.98162 19.6241L2.01074 3.09237C1.90842 2.80897 2.0697 2.60237 2.37076 2.63127Z" fill="#5D87BF"/>
        <path d="M28.8408 19.6848L25.184 21.796C24.8506 21.9885 24.434 21.7479 24.434 21.363V17.1405C24.434 16.7556 24.8506 16.515 25.184 16.7075L28.8408 18.8187C29.1742 19.0112 29.1742 19.4923 28.8408 19.6848Z" fill="#659360" stroke="#659360"/>
        <mask id="mask0_15_68" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="17" y="10" width="14" height="14">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M30.5961 10H17.4721V15.4917H17V23.5298H23.4782V21.4835H24.4442L24.6447 16.4403L30.5961 19.843V10Z" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_15_68)">
            <circle cx="22.9543" cy="15.8554" r="4.91558" fill="#659360" fill-opacity="0.2"/>
            <circle cx="22.9543" cy="15.8554" r="4.41558" stroke="#659360"/>
            <path d="M20.9171 13.7626H24.9312V14.4554H23.2962V18.8948H22.5557V14.4554H20.9171V13.7626Z" fill="#659360"/>
        </g>
    </g>
    <defs>
        <clipPath id="clip0_15_68">
            <rect width="33" height="23" fill="white"/>
        </clipPath>
    </defs>
</svg>
`;

  // src/RunConfigurationManager/RunConfigurationManager.ts
  var RunConfigurationType = /* @__PURE__ */ ((RunConfigurationType2) => {
    RunConfigurationType2["Run"] = "Run";
    RunConfigurationType2["Test"] = "Test";
    return RunConfigurationType2;
  })(RunConfigurationType || {});
  function getRunConfigurationTypeByString(runConfigurationType) {
    switch (runConfigurationType) {
      case "Run":
        return "Run" /* Run */;
      case "Test":
        return "Test" /* Test */;
      default:
        throw new Error(`Unknown run configuration type: ${runConfigurationType}`);
    }
  }
  __name(getRunConfigurationTypeByString, "getRunConfigurationTypeByString");
  var _RunConfigurationManager = class {
    constructor(queryParams) {
      this.currentConfiguration = "Run" /* Run */;
      this.fromQueryParam = false;
      this.runButton = document.querySelector(".js-playground__action-run");
      this.runButtonLabel = document.querySelector(".js-playground__action-run .label");
      this.openRunButton = document.querySelector(".js-open-run-select");
      this.configurationsList = document.querySelector(".js-run-configurations-list");
      this.configurations = document.querySelectorAll(".js-configuration");
      this.onChange = /* @__PURE__ */ __name(() => {
      }, "onChange");
      this.onSelect = /* @__PURE__ */ __name(() => {
      }, "onSelect");
      this.queryParams = queryParams;
      this.mount();
    }
    registerOnChange(callback) {
      this.onChange = callback;
    }
    registerOnSelect(callback) {
      this.onSelect = callback;
    }
    toggleConfigurationsList() {
      this.configurationsList.classList.toggle("hidden");
    }
    setupConfiguration() {
      const configurationFromQuery = this.queryParams.getURLParameter(_RunConfigurationManager.QUERY_PARAM_NAME);
      if (configurationFromQuery !== null && configurationFromQuery !== void 0) {
        this.fromQueryParam = true;
        this.useConfiguration(getRunConfigurationTypeByString(configurationFromQuery));
        return;
      }
      const configurationFromLocalStorage = window.localStorage.getItem(_RunConfigurationManager.LOCAL_STORAGE_KEY);
      if (configurationFromLocalStorage !== null && configurationFromLocalStorage !== void 0) {
        this.useConfiguration(getRunConfigurationTypeByString(configurationFromLocalStorage));
        return;
      }
      this.useConfiguration("Run" /* Run */);
    }
    useConfiguration(runConfigurationType) {
      this.currentConfiguration = runConfigurationType;
      this.onChange(runConfigurationType);
      const runConfigurationAsString = RunConfigurationType[runConfigurationType];
      this.runButton.setAttribute("data-type", runConfigurationAsString);
      this.runButtonLabel.textContent = runConfigurationAsString;
      if (!this.fromQueryParam) {
        window.localStorage.setItem(_RunConfigurationManager.LOCAL_STORAGE_KEY, runConfigurationAsString);
      }
      if (this.fromQueryParam) {
        this.queryParams.updateURLParameter(_RunConfigurationManager.QUERY_PARAM_NAME, runConfigurationAsString);
      }
      this.setIconForV(runConfigurationType);
    }
    setIconForV(runConfigurationType) {
      let icon = runIcons;
      if (runConfigurationType != "Run" /* Run */) {
        icon = testIcons;
      }
      document.querySelector(".title-v-part").innerHTML = icon;
    }
    mount() {
      this.openRunButton.addEventListener("click", () => {
        this.toggleConfigurationsList();
      });
      this.configurations.forEach((configuration) => {
        configuration.addEventListener("click", () => {
          var _a;
          const configurationTypeString = (_a = configuration.getAttribute("data-type")) != null ? _a : "Run";
          const configurationType = getRunConfigurationTypeByString(configurationTypeString);
          this.useConfiguration(configurationType);
          this.onSelect(configurationType);
        });
      });
    }
  };
  var RunConfigurationManager = _RunConfigurationManager;
  __name(RunConfigurationManager, "RunConfigurationManager");
  RunConfigurationManager.QUERY_PARAM_NAME = "runConfiguration";
  RunConfigurationManager.LOCAL_STORAGE_KEY = "run-configuration";

  // src/Examples/examples.ts
  var examples = [
    {
      name: "Hello, Playground!",
      code: LocalCodeRepository.WELCOME_CODE,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "String interpolation",
      // language=V
      code: `
// In V you can define array of string with the following syntax:
areas := ['game', 'web', 'tools', 'science', 'systems', 'embedded', 'drivers', 'GUI', 'mobile']

for area in areas {
    // V uses the \${} notation to interpolate a variable
    // or expression right on the string.
    // Learn more about string interpolation in the documentation:
    // https://github.com/vlang/v/blob/master/doc/docs.md#string-interpolation
    println('Hello, \${area} developers!')
}
        `,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Fibonacci",
      // language=v
      code: `
// As in other languages, you can define functions in V.
// Learn more about functions in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#functions
fn fib(n int) u64 {
    // To define a array of specific type, use the following syntax.
    // Here we define an array of int with the length of n + 2.
    // Learn more about arrays in the documentation:
    // https://github.com/vlang/v/blob/master/doc/docs.md#arrays
    mut f := []u64{len: n + 2}
    f[0] = 0
    f[1] = 1

    for i := 2; i <= n; i++ {
        f[i] = f[i - 1] + f[i - 2]
    }

    return f[n]
}

// main function is the entry point of the program.
// See note about the main function in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#hello-world
fn main() {
    for i in 0 .. 30 {
        println(fib(i))
    }
}
`,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Structs and embedded structs",
      // language=V
      code: `
// Structs are a way to define a new type with a set of fields.
// You can define a struct with the following syntax:
// Learn more about structs in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#structs
struct Size {
// mut keyword is used to define mutable fields
// pub keyword is used to define public fields
// 
// By default, all fields are private and immutable.
pub mut:
    width  int
    height int
}

// Structs can have methods.
fn (s &Size) area() int {
    return s.width * s.height
}

// Structs can be embedded in other structs.
struct Button {
    Size
    title string
}

mut button := Button{
    title: 'Click me'
    height: 2
}

button.width = 3

// With embedding, the struct Button will automatically have get all the 
// fields and methods from the struct Size, which allows you to do:
assert button.area() == 6
// If you need to access embedded structs directly, use an explicit 
// reference like \`button.Size\`:
assert button.Size.area() == 6
// Conceptually, embedded structs are similar to mixins in OOP, not base classes.

print(button)
`,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Sum types",
      // language=V
      code: `
struct Empty {}

struct Node {
    value f64
    left  Tree
    right Tree
}

// Sum types are a way to define a type that can be one of several types.
// In V, sum types are defined with following syntax.
// Learn more about sum types in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#sum-types
type Tree = Empty | Node

// Let's calculate the sum of all values in the tree.
fn main() {
    // Here we just define a tree with some values.
    left := Node{0.2, Empty{}, Empty{}}
    right := Node{0.3, Empty{}, Node{0.4, Empty{}, Empty{}}}
    tree := Node{0.5, left, right}

    // And call the sum function.
    // Since the sum function accepts a Tree, we can pass it any of the
    // possible types of the Tree sum type.
    // In this case, we pass it a Node.
    println(sum(tree)) // 0.2 + 0.3 + 0.4 + 0.5 = 1.4
}

// sum up all node values
fn sum(tree Tree) f64 {
    // In V, you can use \`match\` expression to match a value against a sum type.
    // Learn more about match expression in the documentation:
    // https://github.com/vlang/v/blob/master/doc/docs.md#match
    return match tree {
        // if the value has type Empty, return 0
        Empty { 0 }
        // if the value has type Node, return the sum of the node value and the sum of the left and right subtrees
        Node { tree.value + sum(tree.left) + sum(tree.right) }
    }
}
`,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Generics",
      // language=V
      code: `
// Sometimes there may be situations where you need code that will 
// work in the same way for different types.
//
// For example, in this example, we are creating a \`List\` that will 
// be able to store elements of any type while maintaining type safety.
//
// In V, to define a generic structure, you need to write the generic parameters 
// in square brackets after name. 
// There may be one or more of them, each of them must be named with a 
// single capital letter.
//
// Learn more about generics in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#generics
struct List[T] {
mut:
    data []T
}

// Since the \`List\` structure is generic, we can define methods that accept or 
// return the type with which the structure was created.
//
// That is, for each \`List\` with a specific type, its own copy of this structure 
// will be created when V compile code.
//
// This means that if you call push on a \`List[int]\`, then the \`push()\` function will 
// take an int argument.
fn (mut l List[T]) push(val T) {
    l.data << val
}

// Here everything is the same as with \`push()\`, however, for \`List[int]\` the function 
// will return an int value, and not accept it.
fn (l &List[T]) pop() T {
    return l.data.last()
}

// In V, there can be not only structures, but also functions, so the following function 
// creates a generic structure with the type passed to the function.
fn list_of[T]() List[T] {
    return List[T]{}
}

fn main() {
    // Let's create a new \`List\` that will contain the strings:
    mut string_list := List[string]{}
    //                     ^^^^^^^^ Generic arguments to create a struct
    // Here we have passed a string as the T parameter to the struct.
    // We can say that this code is equivalent to \`List_string{}\`, where 
    // \`List_string\` has a data field with type \`[]string\`.

    // Methods are called as usual, the compiler will understand 
    // that \`push()\` takes a value of type string.
    string_list.push('hello')
    string_list.push('world')

    // When you call \`pop()\`, the compiler will understand that the method returns a string.
    last_string := string_list.pop()
    println(last_string)

    // Now let's create a new \`List\` but which stores bool.
    // We use our \`list_of()\` function for this.
    mut bool_list := list_of[bool]()
    //                      ^^^^^^ Generic arguments to call the function.
    // Here, as for \`List\`, we passed arguments to be used instead of T.
    // The compiler itself will compute and understand that it is necessary 
    // to create a \`List\` with the bool type.

    bool_list.push(true)
    println(bool_list)
}
        `,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Concurrency",
      // language=V
      code: `
// V's model of concurrency is going to be very similar to Go's.
// Learn more about concurrency in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#concurrency
import time

fn task(id int, duration int) {
    println('task \${id} begin')
    time.sleep(duration * time.millisecond)
    println('task \${id} end')
}

fn main() {
    // []thread is a special type that represents an array of threads
    mut threads := []thread{}

    // \`spawn\` starts a new thread and returns a \`thread\` object
    // that can be added in thread array.
    threads << spawn task(1, 500)
    threads << spawn task(2, 900)
    threads << spawn task(3, 100)

    // \`wait\` is special function that waits for all threads to finish.
    threads.wait()

    println('done')
}
        `,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Channel Select",
      // language=V
      code: `
// Channels in V very similar to Go's channels.
// Learn more about channels in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#channels
import time

fn main() {
    // Channels is a special type that represents a communication channel between threads.
    ch := chan f64{}
    //         ^^^ type of data that can be sent or received through the channel
    ch2 := chan f64{}
    ch3 := chan f64{}
    mut b := 0.0
    c := 1.0

    // Setup spawn threads that will send on ch/ch2.
    spawn fn (the_channel chan f64) {
        time.sleep(5 * time.millisecond)
        // You can push value to channel...
        the_channel <- 1.0
    }(ch)

    spawn fn (the_channel chan f64) {
        time.sleep(1 * time.millisecond)
        // ...in different threads.
        the_channel <- 1.0
    }(ch2)

    spawn fn (the_channel chan f64) {
        // And read values from channel in other threads
        // If channel is empty, the thread will wait until a value is pushed to it.
        _ := <-the_channel
    }(ch3)

    // Select is powerful construct that allows you to work for multiple channels.
    // Learn more about select in the documentation:
    // https://github.com/vlang/v/blob/master/doc/docs.md#channel-select
    select {
        a := <-ch {
            // do something with \`a\`
            eprintln('> a: \${a}')
        }
        b = <-ch2 {
            // do something with predeclared variable \`b\`
            eprintln('> b: \${b}')
        }
        ch3 <- c {
            // do something if \`c\` was sent
            time.sleep(5 * time.millisecond)
            eprintln('> c: \${c} was sent on channel ch3')
        }
        500 * time.millisecond {
            // do something if no channel has become ready within 0.5s
            eprintln('> more than 0.5s passed without a channel being ready')
        }
    }
    eprintln('> done')
}
        `,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "JSON Encoding/Decoding",
      // language=v
      code: `
// V very modular and has a lot of built-in modules.
// In this example we will use the json module to encode and decode JSON data.
// If you want to learn more about modules, visit 
// https://github.com/vlang/v/blob/master/doc/docs.md#modules
import json

// Since V is statically typed, we need to define a struct to hold the data.
// Learn more about structs in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#structs
struct User {
    name string
    age  int
mut:
    // We can use the \`mut\` keyword to make the field mutable.
    // Without it, there is no way to change the field value.
    is_registered bool
}

fn main() {
    json_data := '[{"name":"Frodo", "age":25}, {"name":"Bobby", "age":10}]'
    
    // json.decode() is special function that can decode JSON data.
    // It takes a type and a json data as arguments and returns a value of passed type.
    // V tries to decode the data as the passed type. For example, if you pass []User, 
    // it will try to decode the data as an array of User.
    // 
    // In this case it will return an array of User.
    // 
    // Learn more about the json module in the documentation:
    // https://github.com/vlang/v/blob/master/doc/docs.md#json
    mut users := json.decode([]User, json_data) or {
        // But if the json data is invalid, it will return an error.
        // You can handle it with the 'or {}' syntax as in this example.
        // 
        // err is a special variable that contains the error message.
        // 
        // Learn more about error handling in documentation: 
        // https://github.com/vlang/v/blob/master/doc/docs.md#optionresult-types-and-error-handling
        eprintln('Failed to parse json, error: \${err}')
        return
    }

    for user in users {
        // See 'String interpolation' example to learn more about the \${} notation.
        println('\${user.name}: \${user.age}')
    }
    println('')
    
    for i, mut user in users {
        println('\${i}) \${user.name}')
        if !user.can_register() {
            println('Cannot register \${user.name}, they are too young')
            continue
        }

        // \`user\` is declared as \`mut\` in the for loop,
        // modifying it will modify the array
        user.register()
    }

    println('')
    
    // json.encode() is a special function that can encode a value to JSON.
    // It takes a value and returns a JSON string.
    // 
    // It always return a string, so you don't need to handle the error.
    encoded_data := json.encode(users)
    println(encoded_data)
}

fn (u User) can_register() bool {
    return u.age >= 16
}

fn (mut u User) register() {
    u.is_registered = true
}

// Output:
// Frodo: 25
// Bobby: 10
//
// 0) Frodo
// 1) Bobby
// Cannot register Bobby, they are too young
//
// [{"name":"Frodo","age":25,"is_registered":true},{"name":"Bobby","age":10,"is_registered":false}]
`,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Filter Log file",
      // language=v
      code: `
// Print file lines that start with "DEBUG:"
import os

// \`write_file\` returns a result (\`!\`), it must be checked
os.write_file('app.log', '
ERROR: log file not found
DEBUG: create new file
DEBUG: write text to log file
ERROR: file not writeable
') or {
    // \`err\` is a special variable that contains the error
    // in \`or {}\` blocks
    eprintln('failed to write the file: \${err}')
    return
}

// \`read_file\` returns a result (\`!string\`), it must be checked
text := os.read_file('app.log') or {
    eprintln('failed to read the file: \${err}')
    return
}

lines := text.split_into_lines()
for line in lines {
    if line.starts_with('DEBUG:') {
        println(line)
    }
}

// Output:
// DEBUG: create new file
// DEBUG: write text to log file
`,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Compile-time Reflection",
      code: `
// https://github.com/vlang/v/blob/master/doc/docs.md#compile-time-reflection

struct User {
    name string
    age  int
}

fn main() {
    data := 'name=Alice\\nage=18'
    user := decode[User](data)
    println(user)
}

fn decode[T](data string) T {
    mut result := T{}
    // compile-time \`for\` loop
    // T.fields gives an array of a field metadata type
    $for field in T.fields {
        $if field.typ is string {
            // $(string_expr) produces an identifier
            result.$(field.name) = get_string(data, field.name)
        } $else $if field.typ is int {
            result.$(field.name) = get_int(data, field.name)
        }
    }
    return result
}

fn get_string(data string, field_name string) string {
    for line in data.split_into_lines() {
        key_val := line.split('=')
        if key_val[0] == field_name {
            return key_val[1]
        }
    }
    return ''
}

fn get_int(data string, field string) int {
    return get_string(data, field).int()
}

// \`decode[User]\` generates:
// fn decode_User(data string) User {
//     mut result := User{}
//     result.name = get_string(data, 'name')
//     result.age = get_int(data, 'age')
//     return result
// }
`,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Anonymous & higher order functions",
      // language=V
      code: `
// https://github.com/vlang/v/blob/master/doc/docs.md#anonymous--higher-order-functions

fn sqr(n int) int {
    return n * n
}

fn cube(n int) int {
    return n * n * n
}

fn run(value int, op fn (int) int) int {
    return op(value)
}

fn main() {
    // Anonymous functions can be called immediately:
    fn () {
        println('Anonymous function')
    }()

    // Functions can be passed to other functions
    println(run(5, sqr)) // "25"

    // Anonymous functions can be declared inside other functions:
    double_fn := fn (n int) int {
        return n + n
    }
    println(run(5, double_fn)) // "10"

    // Functions can be passed around without assigning them to variables:
    res := run(5, fn (n int) int {
        return n + n
    })
    println(res) // "10"

    // You can even have an array/map of functions:
    fns := [sqr, cube]
    println(fns[0](10)) // "100"
    
    fns_map := {
        'sqr':  sqr
        'cube': cube
    }
    println(fns_map['cube'](2)) // "8"
}
`,
      runConfiguration: "Run" /* Run */
    },
    {
      name: "Testing",
      // language=V
      code: `
// Tests in V is very simple.
// To define a test function, just add \`test_\` prefix to the function name.
// Learn more about testing in the documentation:
// https://github.com/vlang/v/blob/master/doc/docs.md#testing
fn test_hello() {
    // Inside test functions you can use \`assert\` to check if the result is correct.
    assert hello() == 'Hello world'

    // If the assertion fails, the test will fail.
    // You can provide optional message to \`assert\`:
    assert sum(2, 2) == 4, '2 + 2 should be 4'
}

// Other functions can be used in tests too.
fn hello() string {
    return 'Hello world'
}

fn sum(a int, b int) int {
	// oops, this should be \`a + b\`
	return a - b
}
`,
      runConfiguration: "Test" /* Test */
    }
  ].map((example) => {
    example.code = example.code.trim().replace(/^ {4}/gm, "	") + "\n";
    return example;
  });
  var codeIfSharedLinkBroken = `
// Oops, the shared link is broken.
// Please recheck the link and try again.
println('Hello, link 404!')
`.trimStart();

  // src/Editor/Editor.ts
  var _Editor = class {
    constructor(wrapper, repository) {
      const editorConfig = {
        mode: "v",
        lineNumbers: true,
        matchBrackets: true,
        extraKeys: {
          "Ctrl-Space": "autocomplete",
          "Ctrl-/": "toggleComment"
        },
        indentWithTabs: true,
        indentUnit: 4,
        autoCloseBrackets: true,
        showHint: true,
        lint: {
          async: true,
          lintOnChange: true,
          delay: 20
        },
        toggleLineComment: {
          indent: true,
          padding: " "
        },
        theme: "dark"
      };
      this.wrapperElement = wrapper;
      const place = wrapper.querySelector("textarea");
      this.editor = CodeMirror.fromTextArea(place, editorConfig);
      this.repository = repository;
      this.repository.getCode((code) => {
        if (code === SharedCodeRepository.CODE_NOT_FOUND) {
          this.setCode(codeIfSharedLinkBroken);
          this.terminal.write("Code for shared link not found.");
          return;
        }
        this.setCode(code);
      });
      const terminalElement = wrapper.querySelector(".js-terminal");
      if (terminalElement === null || terminalElement === void 0) {
        throw new Error("Terminal not found, please check that terminal inside editor element");
      }
      this.terminal = new Terminal(terminalElement);
      this.terminal.registerCloseHandler(() => {
        this.closeTerminal();
        this.editor.refresh();
      });
      this.terminal.registerWriteHandler((_) => {
        this.openTerminal();
      });
      this.terminal.registerFilter((line) => {
        return !line.trim().startsWith("Failed command");
      });
      this.terminal.mount();
      this.initFont();
    }
    initFont() {
      const fontSize = window.localStorage.getItem(_Editor.FONT_LOCAL_STORAGE_KEY);
      if (fontSize !== null) {
        this.setEditorFontSize(fontSize);
      }
    }
    changeEditorFontSize(delta) {
      const cm = document.getElementsByClassName("CodeMirror")[0];
      const fontSize = window.getComputedStyle(cm, null).getPropertyValue("font-size");
      if (fontSize) {
        const newFontSize = parseInt(fontSize) + delta;
        cm.style.fontSize = newFontSize + "px";
        window.localStorage.setItem(_Editor.FONT_LOCAL_STORAGE_KEY, newFontSize.toString());
        this.editor.refresh();
      }
    }
    setEditorFontSize(size) {
      const cm = document.getElementsByClassName("CodeMirror")[0];
      cm.style.fontSize = size + "px";
      this.refresh();
    }
    setCode(code, preserveCursor = false) {
      const cursor = this.editor.getCursor();
      this.editor.setValue(code);
      this.repository.saveCode(code);
      if (preserveCursor) {
        this.editor.setCursor(cursor);
      }
    }
    getCode() {
      return this.editor.getValue();
    }
    saveCode() {
      const isSharedCodeRepository = this.repository instanceof SharedCodeRepository;
      if (isSharedCodeRepository) {
        this.repository = new LocalCodeRepository();
      }
      this.repository.saveCode(this.getCode());
    }
    openTerminal() {
      this.wrapperElement.classList.remove("closed-terminal");
    }
    closeTerminal() {
      this.wrapperElement.classList.add("closed-terminal");
    }
    setTheme(theme) {
      this.editor.setOption("theme", theme.name());
    }
    showCompletion() {
      this.editor.execCommand("autocomplete");
    }
    refresh() {
      this.editor.refresh();
    }
  };
  var Editor = _Editor;
  __name(Editor, "Editor");
  Editor.FONT_LOCAL_STORAGE_KEY = "editor-font-size";

  // src/themes/Dark.ts
  var Dark = class {
    name() {
      return "dark";
    }
  };
  __name(Dark, "Dark");

  // src/themes/Light.ts
  var Light = class {
    name() {
      return "light";
    }
  };
  __name(Light, "Light");

  // src/ThemeManager/icons.ts
  var moonIcon = `<span class="icon">
<svg class="theme-icon"  width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M27.1371 20.5912C25.7519 21.0833 24.2605 21.3512 22.7065 21.3512C15.3985 21.3512 9.47424 15.4269 9.47424 8.11889C9.47424 6.10409 9.92454 4.19447 10.73 2.48517C5.60094 4.30725 1.92825 9.20347 1.92825 14.9575C1.92825 22.2655 7.85255 28.1898 15.1605 28.1898C20.4537 28.1898 25.021 25.0818 27.1371 20.5912Z" fill="white"/>
</svg>
</span>
`;
  var sunIcon = `<span class="icon">
<svg class="theme-icon" width="30" height="30" viewBox="0 0 30 30" fill="none"xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_4_47)">
    <path d="M14.9854 1.92059C14.7382 1.92445 14.5026 2.02624 14.3304 2.20361C14.1581 2.38099 14.0633 2.61946 14.0667 2.86668V5.66668C14.0649 5.79036 14.0878 5.91315 14.1339 6.02792C14.18 6.14269 14.2485 6.24715 14.3353 6.33523C14.4222 6.42331 14.5256 6.49325 14.6398 6.54098C14.7539 6.58872 14.8763 6.61331 15 6.61331C15.1237 6.61331 15.2462 6.58872 15.3603 6.54098C15.4744 6.49325 15.5778 6.42331 15.6647 6.33523C15.7515 6.24715 15.82 6.14269 15.8661 6.02792C15.9122 5.91315 15.9351 5.79036 15.9333 5.66668V2.86668C15.935 2.74181 15.9117 2.61786 15.8646 2.50219C15.8176 2.38651 15.7478 2.28145 15.6594 2.19323C15.571 2.10501 15.4658 2.03542 15.35 1.98859C15.2343 1.94176 15.1103 1.91863 14.9854 1.92059ZM6.41042 5.47892C6.2249 5.47933 6.04372 5.53501 5.88999 5.63885C5.73626 5.7427 5.61696 5.89 5.54732 6.06195C5.47768 6.2339 5.46086 6.4227 5.499 6.60425C5.53714 6.7858 5.62852 6.95187 5.76146 7.08126L7.74115 9.06095C7.82715 9.15052 7.93016 9.22204 8.04415 9.2713C8.15814 9.32056 8.28081 9.34659 8.40498 9.34785C8.52915 9.34912 8.65232 9.32559 8.76728 9.27865C8.88225 9.23172 8.98669 9.16231 9.0745 9.07451C9.1623 8.9867 9.23171 8.88226 9.27864 8.76729C9.32558 8.65233 9.34911 8.52915 9.34784 8.40498C9.34658 8.28081 9.32056 8.15814 9.27129 8.04416C9.22203 7.93017 9.15051 7.82716 9.06094 7.74116L7.08125 5.76147C6.99406 5.67184 6.88975 5.60065 6.77451 5.55211C6.65928 5.50357 6.53546 5.47868 6.41042 5.47892V5.47892ZM23.5604 5.47892C23.3179 5.48614 23.0878 5.58748 22.9188 5.76147L20.9391 7.74116C20.8495 7.82716 20.778 7.93017 20.7287 8.04416C20.6795 8.15814 20.6534 8.28081 20.6522 8.40498C20.6509 8.52915 20.6744 8.65233 20.7214 8.76729C20.7683 8.88225 20.8377 8.9867 20.9255 9.0745C21.0133 9.16231 21.1178 9.23171 21.2327 9.27865C21.3477 9.32558 21.4709 9.34911 21.595 9.34785C21.7192 9.34659 21.8419 9.32056 21.9559 9.2713C22.0698 9.22203 22.1729 9.15052 22.2589 9.06095L24.2385 7.08126C24.3734 6.95016 24.4655 6.78138 24.5028 6.59703C24.5401 6.41268 24.5209 6.22136 24.4476 6.04814C24.3742 5.87493 24.2503 5.7279 24.092 5.62633C23.9337 5.52475 23.7484 5.47337 23.5604 5.47892ZM15 8.46668C13.2673 8.46668 11.6055 9.15501 10.3802 10.3802C9.155 11.6055 8.46667 13.2673 8.46667 15C8.46667 16.7328 9.155 18.3945 10.3802 19.6198C11.6055 20.845 13.2673 21.5333 15 21.5333C16.7328 21.5333 18.3945 20.845 19.6198 19.6198C20.845 18.3945 21.5333 16.7328 21.5333 15C21.5333 13.2673 20.845 11.6055 19.6198 10.3802C18.3945 9.15501 16.7328 8.46668 15 8.46668V8.46668ZM2.86667 14.0667C2.74299 14.0649 2.6202 14.0878 2.50543 14.1339C2.39066 14.18 2.2862 14.2485 2.19812 14.3353C2.11004 14.4222 2.0401 14.5257 1.99237 14.6398C1.94463 14.7539 1.92004 14.8763 1.92004 15C1.92004 15.1237 1.94463 15.2462 1.99237 15.3603C2.0401 15.4744 2.11004 15.5779 2.19812 15.6647C2.2862 15.7515 2.39066 15.82 2.50543 15.8661C2.6202 15.9122 2.74299 15.9351 2.86667 15.9333H5.66667C5.79035 15.9351 5.91314 15.9122 6.02791 15.8661C6.14268 15.82 6.24714 15.7515 6.33522 15.6647C6.4233 15.5779 6.49324 15.4744 6.54098 15.3603C6.58871 15.2462 6.6133 15.1237 6.6133 15C6.6133 14.8763 6.58871 14.7539 6.54098 14.6398C6.49324 14.5257 6.4233 14.4222 6.33522 14.3353C6.24714 14.2485 6.14268 14.18 6.02791 14.1339C5.91314 14.0878 5.79035 14.0649 5.66667 14.0667H2.86667ZM24.3333 14.0667C24.2097 14.0649 24.0869 14.0878 23.9721 14.1339C23.8573 14.18 23.7529 14.2485 23.6648 14.3353C23.5767 14.4222 23.5068 14.5257 23.459 14.6398C23.4113 14.7539 23.3867 14.8763 23.3867 15C23.3867 15.1237 23.4113 15.2462 23.459 15.3603C23.5068 15.4744 23.5767 15.5779 23.6648 15.6647C23.7529 15.7515 23.8573 15.82 23.9721 15.8661C24.0869 15.9122 24.2097 15.9351 24.3333 15.9333H27.1333C27.257 15.9351 27.3798 15.9122 27.4946 15.8661C27.6093 15.82 27.7138 15.7515 27.8019 15.6647C27.89 15.5779 27.9599 15.4744 28.0076 15.3603C28.0554 15.2462 28.08 15.1237 28.08 15C28.08 14.8763 28.0554 14.7539 28.0076 14.6398C27.9599 14.5257 27.89 14.4222 27.8019 14.3353C27.7138 14.2485 27.6093 14.18 27.4946 14.1339C27.3798 14.0878 27.257 14.0649 27.1333 14.0667H24.3333ZM8.38282 20.6565C8.14034 20.6637 7.9102 20.7651 7.74115 20.9391L5.76146 22.9188C5.67189 23.0048 5.60038 23.1078 5.55111 23.2218C5.50185 23.3357 5.47582 23.4584 5.47456 23.5826C5.4733 23.7068 5.49683 23.8299 5.54376 23.9449C5.5907 24.0599 5.6601 24.1643 5.74791 24.2521C5.83572 24.3399 5.94016 24.4093 6.05512 24.4563C6.17009 24.5032 6.29326 24.5267 6.41743 24.5255C6.5416 24.5242 6.66427 24.4982 6.77825 24.4489C6.89224 24.3996 6.99525 24.3281 7.08125 24.2386L9.06094 22.2589C9.19581 22.1278 9.28793 21.959 9.32522 21.7746C9.36252 21.5903 9.34325 21.399 9.26995 21.2257C9.19664 21.0525 9.07272 20.9055 8.91442 20.8039C8.75612 20.7024 8.57082 20.651 8.38282 20.6565ZM21.5898 20.6565C21.4042 20.6566 21.2227 20.712 21.0687 20.8157C20.9147 20.9194 20.7951 21.0667 20.7253 21.2387C20.6554 21.4107 20.6384 21.5997 20.6765 21.7814C20.7146 21.9631 20.806 22.1294 20.9391 22.2589L22.9188 24.2386C23.0048 24.3281 23.1078 24.3996 23.2218 24.4489C23.3357 24.4982 23.4584 24.5242 23.5826 24.5254C23.7067 24.5267 23.8299 24.5032 23.9449 24.4562C24.0598 24.4093 24.1643 24.3399 24.2521 24.2521C24.3399 24.1643 24.4093 24.0599 24.4562 23.9449C24.5032 23.8299 24.5267 23.7068 24.5254 23.5826C24.5242 23.4584 24.4982 23.3357 24.4489 23.2218C24.3996 23.1078 24.3281 23.0048 24.2385 22.9188L22.2589 20.9391C22.1719 20.8497 22.0679 20.7786 21.953 20.7301C21.8381 20.6815 21.7146 20.6565 21.5898 20.6565V20.6565ZM14.9854 23.3873C14.7382 23.3911 14.5026 23.4929 14.3304 23.6703C14.1581 23.8477 14.0633 24.0861 14.0667 24.3333V27.1333C14.0649 27.257 14.0878 27.3798 14.1339 27.4946C14.18 27.6094 14.2485 27.7138 14.3353 27.8019C14.4222 27.89 14.5256 27.9599 14.6398 28.0077C14.7539 28.0554 14.8763 28.08 15 28.08C15.1237 28.08 15.2462 28.0554 15.3603 28.0077C15.4744 27.9599 15.5778 27.89 15.6647 27.8019C15.7515 27.7138 15.82 27.6094 15.8661 27.4946C15.9122 27.3798 15.9351 27.257 15.9333 27.1333V24.3333C15.935 24.2085 15.9117 24.0845 15.8646 23.9689C15.8176 23.8532 15.7478 23.7481 15.6594 23.6599C15.571 23.5717 15.4658 23.5021 15.35 23.4553C15.2343 23.4084 15.1103 23.3853 14.9854 23.3873V23.3873Z" fill="white"/>
    </g>
    <defs>
    <clipPath id="clip0_4_47">
    <rect width="28" height="28" fill="white" transform="translate(1 1)"/>
    </clipPath>
    </defs>
</svg>
</span>
`;

  // src/ThemeManager/ThemeManager.ts
  var _ThemeManager = class {
    constructor(queryParams, predefinedTheme = null) {
      this.themes = [new Dark(), new Light()];
      this.currentTheme = null;
      this.onChange = [];
      this.changeThemeButton = null;
      this.predefinedTheme = null;
      this.fromQueryParam = false;
      this.queryParams = queryParams;
      this.predefinedTheme = predefinedTheme;
      this.changeThemeButton = document.querySelector(".js-playground__action-change-theme");
    }
    registerOnChange(callback) {
      this.onChange.push(callback);
    }
    loadTheme() {
      const themeFromQuery = this.queryParams.getURLParameter(_ThemeManager.QUERY_PARAM_NAME);
      if (themeFromQuery !== null && themeFromQuery !== void 0) {
        this.fromQueryParam = true;
        const theme = this.findTheme(themeFromQuery);
        this.turnTheme(theme);
        return;
      }
      const themeFromLocalStorage = window.localStorage.getItem(_ThemeManager.LOCAL_STORAGE_KEY);
      if (themeFromLocalStorage !== null && themeFromLocalStorage !== void 0) {
        const theme = this.findTheme(themeFromLocalStorage);
        this.turnTheme(theme);
        return;
      }
      if (this.predefinedTheme !== null && this.predefinedTheme !== void 0) {
        this.turnTheme(this.predefinedTheme);
        return;
      }
      this.turnTheme(new Dark());
    }
    findTheme(themeFromLocalStorage) {
      let foundThemes = this.themes.filter((theme2) => theme2.name() === themeFromLocalStorage);
      let theme = foundThemes[0];
      if (foundThemes.length == 0) {
        theme = new Dark();
      }
      return theme;
    }
    turnTheme(theme) {
      this.currentTheme = theme;
      this.onChange.forEach((callback) => callback(theme));
      let icon = moonIcon;
      if (theme.name() === "dark") {
        icon = sunIcon;
      }
      if (this.changeThemeButton !== null) {
        this.changeThemeButton.innerHTML = icon;
      }
      const html = document.querySelector("html");
      html.setAttribute("data-theme", theme.name());
      if (!this.fromQueryParam) {
        window.localStorage.setItem(_ThemeManager.LOCAL_STORAGE_KEY, theme.name());
      }
      if (this.fromQueryParam) {
        this.queryParams.updateURLParameter(_ThemeManager.QUERY_PARAM_NAME, theme.name());
      }
    }
    turnDarkTheme() {
      this.turnTheme(new Dark());
    }
    turnLightTheme() {
      this.turnTheme(new Light());
    }
    toggleTheme() {
      if (!this.currentTheme) {
        return;
      }
      if (this.currentTheme.name() === "light") {
        this.turnDarkTheme();
      } else {
        this.turnLightTheme();
      }
    }
  };
  var ThemeManager = _ThemeManager;
  __name(ThemeManager, "ThemeManager");
  ThemeManager.QUERY_PARAM_NAME = "theme";
  ThemeManager.LOCAL_STORAGE_KEY = "theme";

  // src/Examples/ExamplesManager.ts
  var _ExamplesManager = class {
    constructor() {
      this.onSelectHandler = null;
      this.selectElement = document.querySelector(".js-examples__select");
    }
    registerOnSelectHandler(handler) {
      this.onSelectHandler = handler;
    }
    mount() {
      if (this.selectElement === null || this.selectElement === void 0) {
        return;
      }
      const examplesSelectList = this.selectElement.querySelector(".dropdown__list");
      const examplesButton = this.selectElement.querySelector(".dropdown__button");
      if (examplesSelectList !== null && examplesButton !== null) {
        examples.forEach(function(example, index) {
          examplesSelectList.innerHTML += _ExamplesManager.exampleElementListTemplate(example.name, index);
        });
        examplesButton.innerHTML = examples[0].name;
      }
      const dropdownItems = this.selectElement.querySelectorAll(".dropdown__list-item");
      dropdownItems.forEach((option) => {
        option.addEventListener("click", () => {
          const exampleName = option.innerText;
          const example = examples.find((example2) => {
            return example2.name === exampleName;
          });
          if (this.onSelectHandler !== null && example) {
            this.onSelectHandler(example);
          }
        });
      });
      const dropdownBtn = this.selectElement.querySelector(".dropdown__button");
      const dropdownList = this.selectElement.querySelector(".dropdown__list");
      const dropdownInput = this.selectElement.querySelector(".dropdown__input_hidden");
      dropdownBtn.addEventListener("click", function() {
        dropdownList.classList.toggle("dropdown__list_visible");
        this.classList.toggle("dropdown__button_active");
      });
      dropdownItems.forEach(function(option) {
        option.addEventListener("click", function(e) {
          var _a;
          dropdownItems.forEach(function(el) {
            el.classList.remove("dropdown__list-item_active");
          });
          const target = e.target;
          target.classList.add("dropdown__list-item_active");
          dropdownBtn.innerText = this.innerText;
          dropdownInput.value = (_a = this.dataset.value) != null ? _a : "";
          dropdownList.classList.remove("dropdown__list_visible");
        });
      });
      document.addEventListener("click", function(e) {
        if (e.target !== dropdownBtn) {
          dropdownBtn.classList.remove("dropdown__button_active");
          dropdownList.classList.remove("dropdown__list_visible");
        }
      });
      document.addEventListener("keydown", function(e) {
        if (e.key === "Tab" || e.key === "Escape") {
          dropdownBtn.classList.remove("dropdown__button_active");
          dropdownList.classList.remove("dropdown__list_visible");
        }
      });
    }
  };
  var ExamplesManager = _ExamplesManager;
  __name(ExamplesManager, "ExamplesManager");
  ExamplesManager.exampleElementListTemplate = /* @__PURE__ */ __name(function(name, index) {
    let className = "";
    if (index === 0) {
      className = "dropdown__list-item_active";
    }
    return `
<li class="dropdown__list-item ${className}" data-value="${name}">${name}</li>
`;
  }, "exampleElementListTemplate");

  // src/CodeRunner/CodeRunner.ts
  var ShareCodeResult = class {
    constructor(hash) {
      this.hash = hash;
    }
  };
  __name(ShareCodeResult, "ShareCodeResult");
  var CodeRunner = class {
    static runCode(code) {
      const data = new FormData();
      data.append("code", code);
      return fetch("/run", {
        method: "post",
        body: data
      }).then((resp) => {
        if (resp.status != 200) {
          throw new Error("Can't run code");
        }
        return resp;
      }).then((resp) => resp.json()).then((data2) => JSON.parse(data2));
    }
    static runTest(code) {
      const data = new FormData();
      data.append("code", code);
      return fetch("/run_test", {
        method: "post",
        body: data
      }).then((resp) => {
        if (resp.status != 200) {
          throw new Error("Can't run test");
        }
        return resp;
      }).then((resp) => resp.json()).then((data2) => JSON.parse(data2));
    }
    static formatCode(code) {
      const data = new FormData();
      data.append("code", code);
      return fetch("/format", {
        method: "post",
        body: data
      }).then((resp) => resp.json()).then((data2) => JSON.parse(data2));
    }
    static shareCode(code) {
      const data = new FormData();
      data.append("code", code);
      return fetch("/share", {
        method: "post",
        body: data
      }).then((resp) => {
        if (resp.status != 200) {
          throw new Error("Can't share code");
        }
        return resp.text();
      }).then((hash) => new ShareCodeResult(hash));
    }
  };
  __name(CodeRunner, "CodeRunner");

  // src/Playground.ts
  var CODE_UNSAVED_KEY = "unsaved";
  var Playground = class {
    /**
     * @param editorElement - The element that will contain the playground.
     */
    constructor(editorElement2) {
      this.runAsTestConsumer = /* @__PURE__ */ __name(() => false, "runAsTestConsumer");
      this.queryParams = new QueryParams(window.location.search);
      this.repository = CodeRepositoryManager.selectRepository(this.queryParams);
      this.editor = new Editor(editorElement2, this.repository);
      this.themeManager = new ThemeManager(this.queryParams);
      this.themeManager.registerOnChange((theme) => {
        this.editor.setTheme(theme);
      });
      this.themeManager.loadTheme();
      this.examplesManager = new ExamplesManager();
      this.examplesManager.registerOnSelectHandler((example) => {
        this.editor.setCode(example.code);
        this.runConfigurationManager.useConfiguration(example.runConfiguration);
      });
      this.examplesManager.mount();
      this.helpManager = new HelpManager(editorElement2);
      this.runConfigurationManager = new RunConfigurationManager(this.queryParams);
      this.runConfigurationManager.registerOnChange(() => {
      });
      this.runConfigurationManager.registerOnSelect(() => {
        this.runConfigurationManager.toggleConfigurationsList();
        this.run();
      });
      this.runConfigurationManager.setupConfiguration();
    }
    registerRunAsTestConsumer(consumer) {
      this.runAsTestConsumer = consumer;
    }
    /**
     * Register a handler for the default or new action.
     * @param name - The name of the action.
     * @param callback - The callback to be called when the action is triggered.
     */
    registerAction(name, callback) {
      const actionButton = document.getElementsByClassName(`js-playground__action-${name}`)[0];
      if (actionButton === void 0) {
        throw new Error(`Can't find action button with class js-playground__action-${name}`);
      }
      actionButton.addEventListener("click", callback);
    }
    run() {
      if (this.runAsTestConsumer()) {
        this.runTest();
        return;
      }
      this.runCode();
    }
    runCode() {
      this.clearTerminal();
      this.writeToTerminal("Running code...");
      const code = this.editor.getCode();
      CodeRunner.runCode(code).then((result) => {
        this.clearTerminal();
        this.writeToTerminal(result.output);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't run code. Please try again.");
      });
    }
    runTest() {
      this.clearTerminal();
      this.writeToTerminal("Running tests...");
      const code = this.editor.getCode();
      CodeRunner.runTest(code).then((result) => {
        this.clearTerminal();
        this.writeToTerminal(result.output);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't run tests. Please try again.");
      });
    }
    formatCode() {
      this.clearTerminal();
      this.writeToTerminal("Formatting code...");
      const code = this.editor.getCode();
      CodeRunner.formatCode(code).then((result) => {
        if (!result.ok) {
          this.clearTerminal();
          this.writeToTerminal(result.output);
          return;
        }
        this.editor.setCode(result.output, true);
        this.writeToTerminal("Code formatted successfully!");
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't format code. Please try again.");
      });
    }
    shareCode() {
      this.clearTerminal();
      const code = this.editor.getCode();
      CodeRunner.shareCode(code).then((result) => {
        this.writeToTerminal("Code shared successfully!");
        this.queryParams.updateURLParameter(SharedCodeRepository.QUERY_PARAM_NAME, result.hash);
        const link = this.buildShareLink(result);
        this.writeToTerminal("Share link: " + link);
        copyTextToClipboard(link, () => {
          this.writeToTerminal("\nLink copied to clipboard.");
        });
        this.writeToTerminal("Note: current page has changed its own URL, it now links to shared code.");
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't share code. Please try again.");
      });
    }
    buildShareLink(result) {
      let url = window.location.href.split("?")[0];
      if (!url.endsWith("/")) {
        url += "/";
      }
      return url + "p/" + result.hash;
    }
    changeTheme() {
      this.themeManager.toggleTheme();
    }
    setupShortcuts() {
      this.editor.editor.on("keypress", (cm, event) => {
        if (!cm.state.completionActive && // Enables keyboard navigation in autocomplete list
        event.key.length === 1 && event.key.match(/[a-z0-9]/i)) {
          this.editor.showCompletion();
        }
      });
      document.addEventListener("keydown", (ev) => {
        const isCodeFromShareURL = this.repository instanceof SharedCodeRepository;
        if (isCodeFromShareURL && !ev.ctrlKey && !ev.metaKey) {
          this.markCodeAsUnsaved();
        }
        const isCtrlEnter = ev.ctrlKey && ev.key === "Enter";
        const isCtrlR = ev.ctrlKey && ev.key === "r";
        const isShiftEnter = ev.shiftKey && ev.key === "Enter";
        if (isCtrlEnter || isCtrlR || isShiftEnter) {
          this.run();
          ev.preventDefault();
        } else if (ev.ctrlKey && ev.key === "l") {
          this.formatCode();
          ev.preventDefault();
        } else if (ev.ctrlKey && ev.key === "=") {
          this.editor.changeEditorFontSize(1);
          ev.preventDefault();
        } else if (ev.ctrlKey && ev.key === "-") {
          this.editor.changeEditorFontSize(-1);
          ev.preventDefault();
        } else if (ev.ctrlKey && ev.key === "i") {
          this.helpManager.toggleHelp();
          ev.preventDefault();
        } else if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
          this.editor.saveCode();
          ev.preventDefault();
        } else if (ev.key === "Escape") {
          this.helpManager.closeHelp();
          ev.preventDefault();
        } else {
          this.editor.saveCode();
        }
      });
    }
    askLoadUnsavedCode() {
      const isCodeFromShareURL = this.repository instanceof SharedCodeRepository;
      const hasUnsavedCode = window.localStorage.getItem(CODE_UNSAVED_KEY) != null;
      window.localStorage.removeItem(CODE_UNSAVED_KEY);
      if (isCodeFromShareURL && hasUnsavedCode) {
        const yes = confirm("You have previously unsaved changes. Do you want to load it?");
        if (yes) {
          this.queryParams.updateURLParameter(SharedCodeRepository.QUERY_PARAM_NAME, null);
          window.location.reload();
        }
      }
    }
    clearTerminal() {
      this.editor.terminal.clear();
    }
    writeToTerminal(text) {
      this.editor.terminal.write(text);
    }
    markCodeAsUnsaved() {
      window.localStorage.setItem(CODE_UNSAVED_KEY, "");
    }
  };
  __name(Playground, "Playground");

  // src/main.ts
  var editorElement = document.querySelector(".js-playground");
  var playground = new Playground(editorElement);
  playground.registerAction("run" /* RUN */, () => {
    playground.run();
  });
  playground.registerAction("format" /* FORMAT */, () => {
    playground.formatCode();
  });
  playground.registerAction("share" /* SHARE */, () => {
    playground.shareCode();
  });
  playground.registerAction("change-theme" /* CHANGE_THEME */, () => {
    playground.changeTheme();
  });
  playground.registerRunAsTestConsumer(() => {
    const runButton = document.querySelector(".js-playground__action-run");
    const configurationType = runButton.getAttribute("data-type");
    return configurationType === "Test";
  });
  playground.setupShortcuts();
  playground.askLoadUnsavedCode();
  window.onload = () => {
    const html = document.querySelector("html");
    html.style.opacity = "1";
  };
})();
//# sourceMappingURL=main.bundle.js.map
