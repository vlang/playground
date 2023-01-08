"use strict";
var RunCodeResult = /** @class */ (function () {
    function RunCodeResult(output) {
        this.output = output;
    }
    return RunCodeResult;
}());
var ShareCodeResult = /** @class */ (function () {
    function ShareCodeResult(hash) {
        this.hash = hash;
    }
    return ShareCodeResult;
}());
/**
 * CodeRunner describes how to run, format and share code.
 */
var CodeRunner = /** @class */ (function () {
    function CodeRunner() {
    }
    CodeRunner.runCode = function (code) {
        var data = new FormData();
        data.append("code", code);
        return fetch("/run", {
            method: "post",
            body: data,
        })
            .then(function (resp) {
            if (resp.status != 200) {
                throw new Error("Can't run code");
            }
            return resp.text();
        })
            .then(function (output) { return new RunCodeResult(output); });
    };
    CodeRunner.formatCode = function (code) {
        var data = new FormData();
        data.append("code", code);
        return fetch("/format", {
            method: "post",
            body: data,
        })
            .then(function (resp) { return resp.json(); })
            .then(function (data) { return JSON.parse(data); });
    };
    CodeRunner.shareCode = function (code) {
        var data = new FormData();
        data.append("code", code);
        return fetch("/share", {
            method: "post",
            body: data,
        })
            .then(function (resp) {
            if (resp.status != 200) {
                throw new Error("Can't share code");
            }
            return resp.text();
        })
            .then(function (hash) { return new ShareCodeResult(hash); });
    };
    return CodeRunner;
}());
var Editor = /** @class */ (function () {
    function Editor(wrapper, repository) {
        var _this = this;
        var editorConfig = {
            mode: "v",
            lineNumbers: true,
            matchBrackets: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-/": "toggleComment",
            },
            indentWithTabs: false,
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
        };
        this.wrapperElement = wrapper;
        var place = wrapper.querySelector("textarea");
        this.editor = CodeMirror.fromTextArea(place, editorConfig);
        this.repository = repository;
        this.repository.getCode(function (code) {
            if (code === SharedCodeRepository.CODE_NOT_FOUND) {
                // If the code is not found, use default Hello World example.
                _this.setCode(codeIfSharedLinkBroken);
                _this.terminal.write("Code for shared link not found.");
                return;
            }
            _this.setCode(code);
        });
        var terminalElement = wrapper.querySelector(".js-terminal");
        if (terminalElement === null || terminalElement === undefined) {
            throw new Error("Terminal not found, please check that terminal inside editor element");
        }
        this.terminal = new Terminal(terminalElement);
        this.terminal.registerCloseHandler(function () {
            _this.closeTerminal();
            _this.editor.refresh();
        });
        this.terminal.registerWriteHandler(function (_) {
            _this.openTerminal();
        });
        this.terminal.mount();
        this.initFont();
    }
    Editor.prototype.initFont = function () {
        var fontSize = window.localStorage.getItem(Editor.FONT_LOCAL_STORAGE_KEY);
        if (fontSize !== null) {
            this.setEditorFontSize(fontSize);
        }
    };
    Editor.prototype.changeEditorFontSize = function (delta) {
        var cm = document.getElementsByClassName("CodeMirror")[0];
        var fontSize = window.getComputedStyle(cm, null).getPropertyValue("font-size");
        if (fontSize) {
            var newFontSize = parseInt(fontSize) + delta;
            cm.style.fontSize = newFontSize + "px";
            window.localStorage.setItem(Editor.FONT_LOCAL_STORAGE_KEY, newFontSize.toString());
            this.editor.refresh();
        }
    };
    Editor.prototype.setEditorFontSize = function (size) {
        var cm = document.getElementsByClassName("CodeMirror")[0];
        cm.style.fontSize = size + "px";
        this.refresh();
    };
    Editor.prototype.setCode = function (code, preserveCursor) {
        if (preserveCursor === void 0) { preserveCursor = false; }
        var cursor = this.editor.getCursor();
        this.editor.setValue(code);
        this.repository.saveCode(code);
        if (preserveCursor) {
            this.editor.setCursor(cursor);
        }
    };
    Editor.prototype.getCode = function () {
        return this.editor.getValue();
    };
    Editor.prototype.saveCode = function () {
        var isSharedCodeRepository = this.repository instanceof SharedCodeRepository;
        if (isSharedCodeRepository) {
            this.repository = new LocalCodeRepository();
        }
        this.repository.saveCode(this.getCode());
    };
    Editor.prototype.openTerminal = function () {
        this.wrapperElement.classList.remove("closed-terminal");
    };
    Editor.prototype.closeTerminal = function () {
        this.wrapperElement.classList.add("closed-terminal");
    };
    Editor.prototype.setTheme = function (theme) {
        this.editor.setOption("theme", theme.name());
    };
    Editor.prototype.refresh = function () {
        this.editor.refresh();
    };
    Editor.FONT_LOCAL_STORAGE_KEY = "editor-font-size";
    return Editor;
}());
var ExamplesManager = /** @class */ (function () {
    function ExamplesManager() {
        this.onSelectHandler = null;
        this.selectElement = document.querySelector(".js-examples__select");
    }
    ExamplesManager.prototype.registerOnSelectHandler = function (handler) {
        this.onSelectHandler = handler;
    };
    ExamplesManager.prototype.mount = function () {
        var _this = this;
        if (this.selectElement === null || this.selectElement === undefined) {
            return;
        }
        var examplesSelectList = this.selectElement.querySelector(".dropdown__list");
        var examplesButton = this.selectElement.querySelector(".dropdown__button");
        if (examplesSelectList !== null && examplesButton !== null) {
            examples.forEach(function (example, index) {
                examplesSelectList.innerHTML += ExamplesManager.exampleElementListTemplate(example.name, index);
            });
            examplesButton.innerHTML = examples[0].name;
        }
        var dropdownItems = this.selectElement.querySelectorAll(".dropdown__list-item");
        dropdownItems.forEach(function (option) {
            option.addEventListener("click", function () {
                var exampleName = option.innerText;
                var example = examples.find(function (example) {
                    return example.name === exampleName;
                });
                if (_this.onSelectHandler !== null && example) {
                    _this.onSelectHandler(example);
                }
            });
        });
        var dropdownBtn = this.selectElement.querySelector(".dropdown__button");
        var dropdownList = this.selectElement.querySelector(".dropdown__list");
        var dropdownInput = this.selectElement.querySelector(".dropdown__input_hidden");
        dropdownBtn.addEventListener("click", function () {
            dropdownList.classList.toggle("dropdown__list_visible");
            this.classList.toggle("dropdown__button_active");
        });
        dropdownItems.forEach(function (option) {
            option.addEventListener("click", function (e) {
                var _a;
                dropdownItems.forEach(function (el) {
                    el.classList.remove("dropdown__list-item_active");
                });
                var target = e.target;
                target.classList.add("dropdown__list-item_active");
                dropdownBtn.innerText = this.innerText;
                dropdownInput.value = (_a = this.dataset.value) !== null && _a !== void 0 ? _a : "";
                dropdownList.classList.remove("dropdown__list_visible");
            });
        });
        document.addEventListener("click", function (e) {
            if (e.target !== dropdownBtn) {
                dropdownBtn.classList.remove("dropdown__button_active");
                dropdownList.classList.remove("dropdown__list_visible");
            }
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Tab" || e.key === "Escape") {
                dropdownBtn.classList.remove("dropdown__button_active");
                dropdownList.classList.remove("dropdown__list_visible");
            }
        });
    };
    ExamplesManager.exampleElementListTemplate = function (name, index) {
        var className = "";
        if (index === 0) {
            className = "dropdown__list-item_active";
        }
        return "\n<li class=\"dropdown__list-item ".concat(className, "\" data-value=\"").concat(name, "\">").concat(name, "</li>\n");
    };
    return ExamplesManager;
}());
/**
 * Local code repository using the browser's local storage.
 */
var LocalCodeRepository = /** @class */ (function () {
    function LocalCodeRepository() {
    }
    LocalCodeRepository.prototype.saveCode = function (code) {
        window.localStorage.setItem(LocalCodeRepository.LOCAL_STORAGE_KEY, code);
    };
    LocalCodeRepository.prototype.getCode = function (onReady) {
        var localCode = window.localStorage.getItem(LocalCodeRepository.LOCAL_STORAGE_KEY);
        if (localCode === null || localCode === undefined) {
            onReady(LocalCodeRepository.WELCOME_CODE);
            return;
        }
        onReady(localCode);
    };
    LocalCodeRepository.LOCAL_STORAGE_KEY = "code";
    LocalCodeRepository.WELCOME_CODE = "\n// Welcome to the V Playground!\n// Here you can edit, run, and share V code.\n// Let's start with a simple \"Hello, World!\" example:\nprintln('Hello, World!')\n\n// More examples are available in right dropdown list.\n// You can find Help for shortcuts in the bottom right corner or just press \u2303 + H (Ctrl + H).\n// See also change theme button in the top right corner. \n// If you want to learn more about V, visit https://vlang.io\n// Enjoy!\n".trimStart();
    return LocalCodeRepository;
}());
///<reference path="../Repositories/LocalCodeRepository.ts"/>
var examples = [
    {
        name: "Hello, World!",
        code: LocalCodeRepository.WELCOME_CODE
    },
    {
        name: "Fibonacci",
        code: "\nfn fib(n int) int {\n\tmut f := []int{len: n + 2}\n\tf[0] = 0\n\tf[1] = 1\n\n\tfor i := 2; i <= n; i++ {\n\t\tf[i] = f[i - 1] + f[i - 2]\n\t}\n\n\treturn f[n]\n}\n\nfn main() {\n\tfor i in 0 .. 30 {\n\t\tprintln(fib(i))\n\t}\n}\n",
    },
    {
        name: "String interpolation",
        code: "\nareas := ['game', 'web', 'tools', 'science', 'systems', 'embedded', 'drivers', 'GUI', 'mobile']\n\nfor area in areas {\n\tprintln('Hello, ${area} developers!')\n}\n",
    },
    {
        name: "JSON Encoding/Decoding",
        code: "\nimport json\n\nstruct User {\n\tname string\n\tage  int\nmut:\n\tis_registered bool\n}\n\nfn main() {\n\ts := '[{\"name\":\"Frodo\", \"age\":25}, {\"name\":\"Bobby\", \"age\":10}]'\n\tmut users := json.decode([]User, s) or {\n\t\teprintln('Failed to parse json')\n\t\treturn\n\t}\n\tfor user in users {\n\t\tprintln('${user.name}: ${user.age}')\n\t}\n\tprintln('')\n\tfor i, mut user in users {\n\t\tprintln('${i}) ${user.name}')\n\t\tif !user.can_register() {\n\t\t\tprintln('Cannot register ${user.name}, they are too young')\n\t\t\tcontinue\n\t\t}\n\n\t\t// `user` is declared as `mut` in the for loop,\n\t\t// modifying it will modify the array\n\t\tuser.register()\n\t}\n\n\t// Let's encode users again just for fun\n\tprintln('')\n\tprintln(json.encode(users))\n}\n\nfn (u User) can_register() bool {\n\treturn u.age >= 16\n}\n\nfn (mut u User) register() {\n\tu.is_registered = true\n}\n",
    },
    {
        name: "Filter Log file",
        code: "\n// Print file lines that start with \"DEBUG:\"\nimport os\n\n// `write_file` returns a result (`!`), it must be checked\nos.write_file('app.log', '\nERROR: log file not found\nDEBUG: create new file\nDEBUG: write text to log file\nERROR: file not writeable\n') or {\n\t// `err` is a special variable that contains the error\n\t// in `or {}` blocks\n\teprintln('failed to write the file: ${err}')\n\treturn\n}\n\n// `read_file` returns a result (`!string`), it must be checked\ntext := os.read_file('app.log') or {\n\teprintln('failed to read the file: ${err}')\n\treturn\n}\n\nlines := text.split_into_lines()\nfor line in lines {\n\tif line.starts_with('DEBUG:') {\n\t\tprintln(line)\n\t}\n}\n\n// DEBUG: create new file\n// DEBUG: write text to log file\n",
    },
    {
        name: "Compile-time Reflection",
        code: "\nstruct User {\n\tname string\n\tage  int\n}\n\nfn main() {\n\tdata := 'name=Alice\\nage=18'\n\tuser := decode[User](data)\n\tprintln(user)\n}\n\nfn decode[T](data string) T {\n\tmut result := T{}\n\t// compile-time `for` loop\n\t// T.fields gives an array of a field metadata type\n\t$for field in T.fields {\n\t\t$if field.typ is string {\n\t\t\t// $(string_expr) produces an identifier\n\t\t\tresult.$(field.name) = get_string(data, field.name)\n\t\t} $else $if field.typ is int {\n\t\t\tresult.$(field.name) = get_int(data, field.name)\n\t\t}\n\t}\n\treturn result\n}\n\nfn get_string(data string, field_name string) string {\n\tfor line in data.split_into_lines() {\n\t\tkey_val := line.split('=')\n\t\tif key_val[0] == field_name {\n\t\t\treturn key_val[1]\n\t\t}\n\t}\n\treturn ''\n}\n\nfn get_int(data string, field string) int {\n\treturn get_string(data, field).int()\n}\n\n// `decode[User]` generates:\n// fn decode_User(data string) User {\n//     mut result := User{}\n//     result.name = get_string(data, 'name')\n//     result.age = get_int(data, 'age')\n//     return result\n// }\n",
    },
    {
        name: "Embedded structs",
        code: "\nstruct Size {\nmut:\n\twidth  int\n\theight int\n}\n\nfn (s &Size) area() int {\n\treturn s.width * s.height\n}\n\nstruct Button {\n\tSize\n\ttitle string\n}\n\nmut button := Button{\n\ttitle: 'Click me'\n\theight: 2\n}\n\nbutton.width = 3\n\nassert button.area() == 6\nassert button.Size.area() == 6\n\nprint(button)\n"
    },
    {
        name: "Anonymous & higher order functions",
        code: "\nfn sqr(n int) int {\n\treturn n * n\n}\n\nfn cube(n int) int {\n\treturn n * n * n\n}\n\nfn run(value int, op fn (int) int) int {\n\treturn op(value)\n}\n\nfn main() {\n\t// Anonymous functions can be called immediately:\n\tfn () {\n\t\tprintln('Anonymous function')\n\t}()\n\n\t// Functions can be passed to other functions\n\tprintln(run(5, sqr)) // \"25\"\n\n\t// Anonymous functions can be declared inside other functions:\n\tdouble_fn := fn (n int) int {\n\t\treturn n + n\n\t}\n\tprintln(run(5, double_fn)) // \"10\"\n\n\t// Functions can be passed around without assigning them to variables:\n\tres := run(5, fn (n int) int {\n\t\treturn n + n\n\t})\n\tprintln(res) // \"10\"\n\n\t// You can even have an array/map of functions:\n\tfns := [sqr, cube]\n\tprintln(fns[0](10)) // \"100\"\n\tfns_map := {\n\t\t'sqr':  sqr\n\t\t'cube': cube\n\t}\n\tprintln(fns_map['cube'](2)) // \"8\"\n}\n"
    },
    {
        name: "Sum types",
        code: "\nstruct Empty {}\n\nstruct Node {\n\tvalue f64\n\tleft  Tree\n\tright Tree\n}\n\ntype Tree = Empty | Node\n\n// sum up all node values\nfn sum(tree Tree) f64 {\n\treturn match tree {\n\t\tEmpty { 0 }\n\t\tNode { tree.value + sum(tree.left) + sum(tree.right) }\n\t}\n}\n\nfn main() {\n\tleft := Node{0.2, Empty{}, Empty{}}\n\tright := Node{0.3, Empty{}, Node{0.4, Empty{}, Empty{}}}\n\ttree := Node{0.5, left, right}\n\n\tprintln(sum(tree)) // 0.2 + 0.3 + 0.4 + 0.5 = 1.4\n}\n"
    },
    {
        name: "Concurrency",
        code: "\nimport time\n\nfn task(id int, duration int) {\n\tprintln('task ${id} begin')\n\ttime.sleep(duration * time.millisecond)\n\tprintln('task ${id} end')\n}\n\nfn main() {\n\tmut threads := []thread{}\n\n\tthreads << spawn task(1, 500)\n\tthreads << spawn task(2, 900)\n\tthreads << spawn task(3, 100)\n\tthreads.wait()\n\n\tprintln('done')\n}\n"
    },
    {
        name: "Channel Select",
        code: "\nimport time\n\nfn main() {\n\tch := chan f64{}\n\tch2 := chan f64{}\n\tch3 := chan f64{}\n\tmut b := 0.0\n\tc := 1.0\n\n\t// ... setup spawn threads that will send on ch/ch2\n\tspawn fn (the_channel chan f64) {\n\t\ttime.sleep(5 * time.millisecond)\n\t\tthe_channel <- 1.0\n\t}(ch)\n\n\tspawn fn (the_channel chan f64) {\n\t\ttime.sleep(1 * time.millisecond)\n\t\tthe_channel <- 1.0\n\t}(ch2)\n\n\tspawn fn (the_channel chan f64) {\n\t\t_ := <-the_channel\n\t}(ch3)\n\n\tselect {\n\t\ta := <-ch {\n\t\t\t// do something with `a`\n\t\t\teprintln('> a: ${a}')\n\t\t}\n\t\tb = <-ch2 {\n\t\t\t// do something with predeclared variable `b`\n\t\t\teprintln('> b: ${b}')\n\t\t}\n\t\tch3 <- c {\n\t\t\t// do something if `c` was sent\n\t\t\ttime.sleep(5 * time.millisecond)\n\t\t\teprintln('> c: ${c} was send on channel ch3')\n\t\t}\n\t\t500 * time.millisecond {\n\t\t\t// do something if no channel has become ready within 0.5s\n\t\t\teprintln('> more than 0.5s passed without a channel being ready')\n\t\t}\n\t}\n\teprintln('> done')\n}\n"
    },
    {
        name: "Testing",
        code: "\nfn hello() string {\n\treturn 'Hello world'\n}\n\nfn sum(a int, b int) int {\n\treturn a - b\n}\n\nfn test_hello() {\n\tassert hello() == 'Hello world'\n\n\tassert sum(2, 2) == 4\n}\n"
    }
].map(function (example) {
    example.code = example.code.trimStart();
    return example;
});
var codeIfSharedLinkBroken = "\n// Oops, the shared link is broken.\n// Please recheck the link and try again.\nprintln('Hello, link 404!')\n".trim();
/**
 * CodeRepositoryManager is responsible for managing the code repositories.
 */
var CodeRepositoryManager = /** @class */ (function () {
    function CodeRepositoryManager() {
    }
    /**
     * Base on `params` tries to select the appropriate repository to get the code.
     *
     * @param params The query parameters.
     * @param config The playground configuration.
     * @returns {CodeRepository}
     */
    CodeRepositoryManager.selectRepository = function (params, config) {
        if (config !== undefined && config.codeHash !== null && config.codeHash !== undefined) {
            return new SharedCodeRepository(config.codeHash);
        }
        if (config !== undefined && config.code !== null && config.code !== undefined) {
            return new TextCodeRepository(config.code);
        }
        if (config !== undefined && config.embed !== null && config.embed !== undefined && config.embed) {
            // By default, editor is empty for embed mode.
            return new TextCodeRepository("");
        }
        var repository = new LocalCodeRepository();
        var hash = params.getURLParameter(SharedCodeRepository.QUERY_PARAM_NAME);
        if (hash !== null && hash !== undefined) {
            return new SharedCodeRepository(hash);
        }
        return repository;
    };
    return CodeRepositoryManager;
}());
/**
 * Shared code repository using the server side SQL storage.
 */
var SharedCodeRepository = /** @class */ (function () {
    function SharedCodeRepository(hash) {
        this.hash = hash;
    }
    SharedCodeRepository.prototype.saveCode = function (_) {
        // nothing to do
    };
    SharedCodeRepository.prototype.getCode = function (onReady) {
        return this.getSharedCode(onReady);
    };
    SharedCodeRepository.prototype.getSharedCode = function (onReady) {
        var data = new FormData();
        data.append("hash", this.hash);
        fetch("/query", {
            method: "post",
            body: data,
        })
            .then(function (resp) { return resp.text(); })
            .then(function (data) {
            onReady(data);
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    SharedCodeRepository.QUERY_PARAM_NAME = "query";
    SharedCodeRepository.CODE_NOT_FOUND = "Not found.";
    return SharedCodeRepository;
}());
var TextCodeRepository = /** @class */ (function () {
    function TextCodeRepository(text) {
        this.text = text;
    }
    TextCodeRepository.prototype.saveCode = function (_) {
    };
    TextCodeRepository.prototype.getCode = function (onReady) {
        onReady(this.text);
    };
    return TextCodeRepository;
}());
var Terminal = /** @class */ (function () {
    function Terminal(element) {
        this.onClose = null;
        this.onWrite = null;
        this.element = element;
        this.attachResizeHandler(element);
    }
    Terminal.prototype.registerCloseHandler = function (handler) {
        this.onClose = handler;
    };
    Terminal.prototype.registerWriteHandler = function (handler) {
        this.onWrite = handler;
    };
    Terminal.prototype.write = function (text) {
        this.getTerminalOutputElement().innerHTML += text + "\n";
        if (this.onWrite !== null) {
            this.onWrite(text);
        }
    };
    Terminal.prototype.clear = function () {
        this.getTerminalOutputElement().innerHTML = "";
    };
    Terminal.prototype.mount = function () {
        var closeButton = this.element.querySelector(".js-terminal__close-buttom");
        if (closeButton === null || closeButton === undefined || this.onClose === null) {
            return;
        }
        closeButton.addEventListener("click", this.onClose);
    };
    Terminal.prototype.getTerminalOutputElement = function () {
        return this.element.querySelector(".js-terminal__output");
    };
    Terminal.prototype.attachResizeHandler = function (element) {
        var header = element.querySelector('.header');
        if (!header)
            return;
        var mouseDown = false;
        header.addEventListener('mousedown', function () {
            mouseDown = true;
            document.body.classList.add('dragging');
        });
        document.addEventListener('mousemove', function (e) {
            if (!mouseDown)
                return;
            element.style.height = "".concat(document.body.clientHeight - e.clientY + header.clientHeight / 2, "px");
        });
        document.addEventListener('mouseup', function () {
            mouseDown = false;
            document.body.classList.remove('dragging');
        });
    };
    return Terminal;
}());
var Dark = /** @class */ (function () {
    function Dark() {
    }
    Dark.prototype.name = function () {
        return "dark";
    };
    return Dark;
}());
var Light = /** @class */ (function () {
    function Light() {
    }
    Light.prototype.name = function () {
        return "light";
    };
    return Light;
}());
var HelpManager = /** @class */ (function () {
    function HelpManager(containingElement) {
        this.containingElement = containingElement;
        this.element = containingElement.getElementsByClassName("js-help-wrapper")[0];
        if (this.element === null || this.element === undefined) {
            return;
        }
        this.helpOverlay = this.element.querySelector(".js-help-overlay");
        this.showHelpButton = this.element.querySelector(".js-show-help");
        this.closeHelpButton = this.element.querySelector(".js-close-help");
        this.mount();
    }
    HelpManager.prototype.mount = function () {
        var _this = this;
        if (this.showHelpButton !== undefined) {
            this.showHelpButton.addEventListener("click", function () {
                _this.toggleHelp();
            });
        }
        if (this.helpOverlay !== undefined) {
            this.helpOverlay.addEventListener("click", function () {
                _this.toggleHelp();
            });
        }
        if (this.closeHelpButton !== undefined) {
            this.closeHelpButton.addEventListener("click", function () {
                _this.toggleHelp();
            });
        }
        // Replace shortcut with understandable for OS user:
        //  - macOS: ⌃
        //  - Windows/Linux: Ctrl
        if (!HelpManager.isMac) {
            var shortcuts = document.querySelectorAll(".js-shortcut kbd.ctrl");
            shortcuts.forEach(function (shortcut) {
                shortcut.innerText = "Ctrl";
            });
        }
    };
    HelpManager.prototype.closeHelp = function () {
        if (!this.helpOverlay.classList.contains("opened")) {
            return;
        }
        this.toggleHelp();
    };
    HelpManager.prototype.toggleHelp = function () {
        var help = this.containingElement.getElementsByClassName("js-help")[0];
        help.classList.toggle("opened");
        this.helpOverlay.classList.toggle("opened");
    };
    // TODO: don't know other way to detect macOS...
    // noinspection JSDeprecatedSymbols
    HelpManager.isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    return HelpManager;
}());
/**
 * PlaygroundDefaultAction describes the default action of a playground.
 */
var PlaygroundDefaultAction;
(function (PlaygroundDefaultAction) {
    PlaygroundDefaultAction["RUN"] = "run";
    PlaygroundDefaultAction["FORMAT"] = "format";
    PlaygroundDefaultAction["SHARE"] = "share";
    PlaygroundDefaultAction["CHANGE_THEME"] = "change-theme";
})(PlaygroundDefaultAction || (PlaygroundDefaultAction = {}));
var CODE_UNSAVED_KEY = "unsaved";
/**
 * Playground is responsible for managing the all playground.
 */
var Playground = /** @class */ (function () {
    /**
     * @param editorElement - The element that will contain the playground.
     */
    function Playground(editorElement) {
        var _this = this;
        this.queryParams = new QueryParams(window.location.search);
        this.repository = CodeRepositoryManager.selectRepository(this.queryParams);
        this.editor = new Editor(editorElement, this.repository);
        this.themeManager = new ThemeManager(this.queryParams);
        this.themeManager.registerOnChange(function (theme) {
            _this.editor.setTheme(theme);
        });
        this.themeManager.loadTheme();
        this.examplesManager = new ExamplesManager();
        this.examplesManager.registerOnSelectHandler(function (example) {
            _this.editor.setCode(example.code);
        });
        this.examplesManager.mount();
        this.helpManager = new HelpManager(editorElement);
    }
    /**
     * Register a handler for the default or new action.
     * @param name - The name of the action.
     * @param callback - The callback to be called when the action is triggered.
     */
    Playground.prototype.registerAction = function (name, callback) {
        var actionButton = document.getElementsByClassName("js-playground__action-".concat(name))[0];
        if (actionButton === undefined) {
            throw new Error("Can't find action button with class js-playground__action-".concat(name));
        }
        actionButton.addEventListener("click", callback);
    };
    Playground.prototype.runCode = function () {
        var _this = this;
        this.clearTerminal();
        this.writeToTerminal("Running code...");
        var code = this.editor.getCode();
        CodeRunner.runCode(code)
            .then(function (result) {
            _this.clearTerminal();
            _this.writeToTerminal(result.output);
        })
            .catch(function (err) {
            console.log(err);
            _this.writeToTerminal("Can't run code. Please try again.");
        });
    };
    Playground.prototype.formatCode = function () {
        var _this = this;
        this.clearTerminal();
        this.writeToTerminal("Formatting code...");
        var code = this.editor.getCode();
        CodeRunner.formatCode(code)
            .then(function (result) {
            if (!result.ok) {
                _this.clearTerminal();
                _this.writeToTerminal(result.output);
                return;
            }
            _this.editor.setCode(result.output, true);
            _this.writeToTerminal("Code formatted successfully!");
        })
            .catch(function (err) {
            console.log(err);
            _this.writeToTerminal("Can't format code. Please try again.");
        });
    };
    Playground.prototype.shareCode = function () {
        var _this = this;
        this.clearTerminal();
        var code = this.editor.getCode();
        CodeRunner.shareCode(code)
            .then(function (result) {
            _this.writeToTerminal("Code shared successfully!");
            _this.queryParams.updateURLParameter(SharedCodeRepository.QUERY_PARAM_NAME, result.hash);
            var link = _this.buildShareLink(result);
            _this.writeToTerminal("Share link: " + link);
            copyTextToClipboard(link, function () {
                _this.writeToTerminal("\nLink copied to clipboard.");
            });
            _this.writeToTerminal("Note: current page has changed its own URL, it now links to shared code.");
        })
            .catch(function (err) {
            console.log(err);
            _this.writeToTerminal("Can't share code. Please try again.");
        });
    };
    Playground.prototype.buildShareLink = function (result) {
        var url = window.location.href.split("?")[0];
        if (!url.endsWith("/")) {
            url += "/";
        }
        return url + "p/" + result.hash;
    };
    Playground.prototype.changeTheme = function () {
        this.themeManager.toggleTheme();
    };
    Playground.prototype.setupShortcuts = function () {
        var _this = this;
        document.addEventListener("keydown", function (ev) {
            var isCodeFromShareURL = _this.repository instanceof SharedCodeRepository;
            if (isCodeFromShareURL && !ev.ctrlKey && !ev.metaKey) {
                _this.markCodeAsUnsaved();
            }
            var isCtrlEnter = ev.ctrlKey && ev.key === "Enter";
            var isCtrlR = ev.ctrlKey && ev.key === "r";
            var isShiftEnter = ev.shiftKey && ev.key === "Enter";
            if (isCtrlEnter || isCtrlR || isShiftEnter) {
                _this.runCode();
                ev.preventDefault();
            }
            else if (ev.ctrlKey && ev.key === "l") {
                _this.formatCode();
                ev.preventDefault();
            }
            else if (ev.ctrlKey && ev.key === "=") {
                _this.editor.changeEditorFontSize(1);
                ev.preventDefault();
            }
            else if (ev.ctrlKey && ev.key === "-") {
                _this.editor.changeEditorFontSize(-1);
                ev.preventDefault();
            }
            else if (ev.ctrlKey && ev.key === "i") {
                _this.helpManager.toggleHelp();
                ev.preventDefault();
            }
            else if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
                _this.editor.saveCode();
                ev.preventDefault();
            }
            else if (ev.key === "Escape") {
                _this.helpManager.closeHelp();
                ev.preventDefault();
            }
            else {
                _this.editor.saveCode();
            }
        });
    };
    Playground.prototype.askLoadUnsavedCode = function () {
        var isCodeFromShareURL = this.repository instanceof SharedCodeRepository;
        var hasUnsavedCode = window.localStorage.getItem(CODE_UNSAVED_KEY) != null;
        window.localStorage.removeItem(CODE_UNSAVED_KEY);
        if (isCodeFromShareURL && hasUnsavedCode) {
            var yes = confirm("You have previously unsaved changes. Do you want to load it?");
            if (yes) {
                this.queryParams.updateURLParameter(SharedCodeRepository.QUERY_PARAM_NAME, null);
                window.location.reload();
            }
        }
    };
    Playground.prototype.clearTerminal = function () {
        this.editor.terminal.clear();
    };
    Playground.prototype.writeToTerminal = function (text) {
        this.editor.terminal.write(text);
    };
    Playground.prototype.markCodeAsUnsaved = function () {
        window.localStorage.setItem(CODE_UNSAVED_KEY, "");
    };
    return Playground;
}());
/**
 * QueryParams is responsible for parsing query params from URL
 * and updating the URL when the params change.
 *
 * @example
 * const queryParams = new QueryParams(window.location.search);
 * queryParams.updateURLParameter('theme', 'dark')
 * // The URL will be updated to: http://localhost:8080/?theme=dark
 */
var QueryParams = /** @class */ (function () {
    /**
     * @param path - The path to parse (usually `window.location.search`).
     */
    function QueryParams(path) {
        this.params = new URLSearchParams(path);
    }
    /**
     * Update the URL with the new param.
     * @param param The param to update.
     * @param value The new value of the param.
     */
    QueryParams.prototype.updateURLParameter = function (param, value) {
        var url = QueryParams.updateURLParameter(window.location.href, param, value);
        window.history.replaceState({}, "", url);
    };
    QueryParams.prototype.getURLParameter = function (param) {
        return this.params.get(param);
    };
    QueryParams.updateURLParameter = function (url, param, value) {
        var parsedUrl = new URL(url);
        if (value) {
            parsedUrl.searchParams.set(param, value);
        }
        else {
            parsedUrl.searchParams.delete(param);
        }
        return parsedUrl.toString();
    };
    return QueryParams;
}());
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        // noinspection JSDeprecatedSymbols
        var successful = document.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + msg);
    }
    catch (err) {
        console.log("Fallback: Oops, unable to copy", err);
    }
    document.body.removeChild(textArea);
}
function copyTextToClipboard(text, onCopy) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log("Async: Copying to clipboard was successful!");
        onCopy();
    }, function (err) {
        fallbackCopyTextToClipboard(text);
        console.log("Async: Could not copy text: ", err, "fallback to old method");
    });
}
/**
 * ThemeManager is responsible for managing the theme of the playground.
 * It will register a callback to the change theme button and will update the
 * theme when the user clicks on the button.
 * It will also update the theme when the user changes the theme in the URL.
 *
 * @param queryParams The query params of the URL.
 * @param changeThemeButton The button to change the theme or null.
 *
 * @example
 * const changeThemeButton = document.querySelector('.js-change-theme')
 * const queryParams = new QueryParams(window.location.search);
 * const themeManager = new ThemeManager(queryParams, changeThemeButton)
 *
 * themeManager.registerOnChange((theme) => {
 *   // Do something with the theme
 * })
 */
var ThemeManager = /** @class */ (function () {
    function ThemeManager(queryParams, predefinedTheme) {
        if (predefinedTheme === void 0) { predefinedTheme = null; }
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
    ThemeManager.prototype.registerOnChange = function (callback) {
        this.onChange.push(callback);
    };
    ThemeManager.prototype.loadTheme = function () {
        var themeFromQuery = this.queryParams.getURLParameter(ThemeManager.QUERY_PARAM_NAME);
        if (themeFromQuery !== null && themeFromQuery !== undefined) {
            this.fromQueryParam = true;
            var theme = this.findTheme(themeFromQuery);
            this.turnTheme(theme);
            return;
        }
        var themeFromLocalStorage = window.localStorage.getItem(ThemeManager.LOCAL_STORAGE_KEY);
        if (themeFromLocalStorage !== null && themeFromLocalStorage !== undefined) {
            var theme = this.findTheme(themeFromLocalStorage);
            this.turnTheme(theme);
            return;
        }
        if (this.predefinedTheme !== null && this.predefinedTheme !== undefined) {
            this.turnTheme(this.predefinedTheme);
            return;
        }
        // By default, we turn the dark theme.
        this.turnTheme(new Dark());
    };
    ThemeManager.prototype.findTheme = function (themeFromLocalStorage) {
        var foundThemes = this.themes.filter(function (theme) { return theme.name() === themeFromLocalStorage; });
        var theme = foundThemes[0];
        if (foundThemes.length == 0) {
            theme = new Dark();
        }
        return theme;
    };
    ThemeManager.prototype.turnTheme = function (theme) {
        this.currentTheme = theme;
        this.onChange.forEach(function (callback) { return callback(theme); });
        var icon = moonIcon;
        if (theme.name() === "dark") {
            icon = sunIcon;
        }
        if (this.changeThemeButton !== null) {
            this.changeThemeButton.innerHTML = icon;
        }
        var html = document.querySelector("html");
        html.setAttribute("data-theme", theme.name());
        if (!this.fromQueryParam) {
            // Don't update saved theme state if we're loading from query param.
            window.localStorage.setItem(ThemeManager.LOCAL_STORAGE_KEY, theme.name());
        }
        if (this.fromQueryParam) {
            // We update the query param only if we loaded from it.
            // If we don't change, then the user can change the theme and then reload the page.
            // In this case, the page will load with the theme from the URL, and the user
            // will think that his theme change has not been saved (and will not be saved
            // until he removes the theme from the URL).
            // To avoid this, we update the URL if the user changes theme.
            this.queryParams.updateURLParameter(ThemeManager.QUERY_PARAM_NAME, theme.name());
        }
    };
    ThemeManager.prototype.turnDarkTheme = function () {
        this.turnTheme(new Dark());
    };
    ThemeManager.prototype.turnLightTheme = function () {
        this.turnTheme(new Light());
    };
    ThemeManager.prototype.toggleTheme = function () {
        if (!this.currentTheme) {
            return;
        }
        if (this.currentTheme.name() === "light") {
            this.turnDarkTheme();
        }
        else {
            this.turnLightTheme();
        }
    };
    ThemeManager.QUERY_PARAM_NAME = "theme";
    ThemeManager.LOCAL_STORAGE_KEY = "theme";
    return ThemeManager;
}());
var moonIcon = "<span class=\"icon\">\n<svg class=\"theme-icon\"  width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M27.1371 20.5912C25.7519 21.0833 24.2605 21.3512 22.7065 21.3512C15.3985 21.3512 9.47424 15.4269 9.47424 8.11889C9.47424 6.10409 9.92454 4.19447 10.73 2.48517C5.60094 4.30725 1.92825 9.20347 1.92825 14.9575C1.92825 22.2655 7.85255 28.1898 15.1605 28.1898C20.4537 28.1898 25.021 25.0818 27.1371 20.5912Z\" fill=\"white\"/>\n</svg>\n</span>\n";
var sunIcon = "<span class=\"icon\">\n<svg class=\"theme-icon\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" fill=\"none\"xmlns=\"http://www.w3.org/2000/svg\">\n    <g clip-path=\"url(#clip0_4_47)\">\n    <path d=\"M14.9854 1.92059C14.7382 1.92445 14.5026 2.02624 14.3304 2.20361C14.1581 2.38099 14.0633 2.61946 14.0667 2.86668V5.66668C14.0649 5.79036 14.0878 5.91315 14.1339 6.02792C14.18 6.14269 14.2485 6.24715 14.3353 6.33523C14.4222 6.42331 14.5256 6.49325 14.6398 6.54098C14.7539 6.58872 14.8763 6.61331 15 6.61331C15.1237 6.61331 15.2462 6.58872 15.3603 6.54098C15.4744 6.49325 15.5778 6.42331 15.6647 6.33523C15.7515 6.24715 15.82 6.14269 15.8661 6.02792C15.9122 5.91315 15.9351 5.79036 15.9333 5.66668V2.86668C15.935 2.74181 15.9117 2.61786 15.8646 2.50219C15.8176 2.38651 15.7478 2.28145 15.6594 2.19323C15.571 2.10501 15.4658 2.03542 15.35 1.98859C15.2343 1.94176 15.1103 1.91863 14.9854 1.92059ZM6.41042 5.47892C6.2249 5.47933 6.04372 5.53501 5.88999 5.63885C5.73626 5.7427 5.61696 5.89 5.54732 6.06195C5.47768 6.2339 5.46086 6.4227 5.499 6.60425C5.53714 6.7858 5.62852 6.95187 5.76146 7.08126L7.74115 9.06095C7.82715 9.15052 7.93016 9.22204 8.04415 9.2713C8.15814 9.32056 8.28081 9.34659 8.40498 9.34785C8.52915 9.34912 8.65232 9.32559 8.76728 9.27865C8.88225 9.23172 8.98669 9.16231 9.0745 9.07451C9.1623 8.9867 9.23171 8.88226 9.27864 8.76729C9.32558 8.65233 9.34911 8.52915 9.34784 8.40498C9.34658 8.28081 9.32056 8.15814 9.27129 8.04416C9.22203 7.93017 9.15051 7.82716 9.06094 7.74116L7.08125 5.76147C6.99406 5.67184 6.88975 5.60065 6.77451 5.55211C6.65928 5.50357 6.53546 5.47868 6.41042 5.47892V5.47892ZM23.5604 5.47892C23.3179 5.48614 23.0878 5.58748 22.9188 5.76147L20.9391 7.74116C20.8495 7.82716 20.778 7.93017 20.7287 8.04416C20.6795 8.15814 20.6534 8.28081 20.6522 8.40498C20.6509 8.52915 20.6744 8.65233 20.7214 8.76729C20.7683 8.88225 20.8377 8.9867 20.9255 9.0745C21.0133 9.16231 21.1178 9.23171 21.2327 9.27865C21.3477 9.32558 21.4709 9.34911 21.595 9.34785C21.7192 9.34659 21.8419 9.32056 21.9559 9.2713C22.0698 9.22203 22.1729 9.15052 22.2589 9.06095L24.2385 7.08126C24.3734 6.95016 24.4655 6.78138 24.5028 6.59703C24.5401 6.41268 24.5209 6.22136 24.4476 6.04814C24.3742 5.87493 24.2503 5.7279 24.092 5.62633C23.9337 5.52475 23.7484 5.47337 23.5604 5.47892ZM15 8.46668C13.2673 8.46668 11.6055 9.15501 10.3802 10.3802C9.155 11.6055 8.46667 13.2673 8.46667 15C8.46667 16.7328 9.155 18.3945 10.3802 19.6198C11.6055 20.845 13.2673 21.5333 15 21.5333C16.7328 21.5333 18.3945 20.845 19.6198 19.6198C20.845 18.3945 21.5333 16.7328 21.5333 15C21.5333 13.2673 20.845 11.6055 19.6198 10.3802C18.3945 9.15501 16.7328 8.46668 15 8.46668V8.46668ZM2.86667 14.0667C2.74299 14.0649 2.6202 14.0878 2.50543 14.1339C2.39066 14.18 2.2862 14.2485 2.19812 14.3353C2.11004 14.4222 2.0401 14.5257 1.99237 14.6398C1.94463 14.7539 1.92004 14.8763 1.92004 15C1.92004 15.1237 1.94463 15.2462 1.99237 15.3603C2.0401 15.4744 2.11004 15.5779 2.19812 15.6647C2.2862 15.7515 2.39066 15.82 2.50543 15.8661C2.6202 15.9122 2.74299 15.9351 2.86667 15.9333H5.66667C5.79035 15.9351 5.91314 15.9122 6.02791 15.8661C6.14268 15.82 6.24714 15.7515 6.33522 15.6647C6.4233 15.5779 6.49324 15.4744 6.54098 15.3603C6.58871 15.2462 6.6133 15.1237 6.6133 15C6.6133 14.8763 6.58871 14.7539 6.54098 14.6398C6.49324 14.5257 6.4233 14.4222 6.33522 14.3353C6.24714 14.2485 6.14268 14.18 6.02791 14.1339C5.91314 14.0878 5.79035 14.0649 5.66667 14.0667H2.86667ZM24.3333 14.0667C24.2097 14.0649 24.0869 14.0878 23.9721 14.1339C23.8573 14.18 23.7529 14.2485 23.6648 14.3353C23.5767 14.4222 23.5068 14.5257 23.459 14.6398C23.4113 14.7539 23.3867 14.8763 23.3867 15C23.3867 15.1237 23.4113 15.2462 23.459 15.3603C23.5068 15.4744 23.5767 15.5779 23.6648 15.6647C23.7529 15.7515 23.8573 15.82 23.9721 15.8661C24.0869 15.9122 24.2097 15.9351 24.3333 15.9333H27.1333C27.257 15.9351 27.3798 15.9122 27.4946 15.8661C27.6093 15.82 27.7138 15.7515 27.8019 15.6647C27.89 15.5779 27.9599 15.4744 28.0076 15.3603C28.0554 15.2462 28.08 15.1237 28.08 15C28.08 14.8763 28.0554 14.7539 28.0076 14.6398C27.9599 14.5257 27.89 14.4222 27.8019 14.3353C27.7138 14.2485 27.6093 14.18 27.4946 14.1339C27.3798 14.0878 27.257 14.0649 27.1333 14.0667H24.3333ZM8.38282 20.6565C8.14034 20.6637 7.9102 20.7651 7.74115 20.9391L5.76146 22.9188C5.67189 23.0048 5.60038 23.1078 5.55111 23.2218C5.50185 23.3357 5.47582 23.4584 5.47456 23.5826C5.4733 23.7068 5.49683 23.8299 5.54376 23.9449C5.5907 24.0599 5.6601 24.1643 5.74791 24.2521C5.83572 24.3399 5.94016 24.4093 6.05512 24.4563C6.17009 24.5032 6.29326 24.5267 6.41743 24.5255C6.5416 24.5242 6.66427 24.4982 6.77825 24.4489C6.89224 24.3996 6.99525 24.3281 7.08125 24.2386L9.06094 22.2589C9.19581 22.1278 9.28793 21.959 9.32522 21.7746C9.36252 21.5903 9.34325 21.399 9.26995 21.2257C9.19664 21.0525 9.07272 20.9055 8.91442 20.8039C8.75612 20.7024 8.57082 20.651 8.38282 20.6565ZM21.5898 20.6565C21.4042 20.6566 21.2227 20.712 21.0687 20.8157C20.9147 20.9194 20.7951 21.0667 20.7253 21.2387C20.6554 21.4107 20.6384 21.5997 20.6765 21.7814C20.7146 21.9631 20.806 22.1294 20.9391 22.2589L22.9188 24.2386C23.0048 24.3281 23.1078 24.3996 23.2218 24.4489C23.3357 24.4982 23.4584 24.5242 23.5826 24.5254C23.7067 24.5267 23.8299 24.5032 23.9449 24.4562C24.0598 24.4093 24.1643 24.3399 24.2521 24.2521C24.3399 24.1643 24.4093 24.0599 24.4562 23.9449C24.5032 23.8299 24.5267 23.7068 24.5254 23.5826C24.5242 23.4584 24.4982 23.3357 24.4489 23.2218C24.3996 23.1078 24.3281 23.0048 24.2385 22.9188L22.2589 20.9391C22.1719 20.8497 22.0679 20.7786 21.953 20.7301C21.8381 20.6815 21.7146 20.6565 21.5898 20.6565V20.6565ZM14.9854 23.3873C14.7382 23.3911 14.5026 23.4929 14.3304 23.6703C14.1581 23.8477 14.0633 24.0861 14.0667 24.3333V27.1333C14.0649 27.257 14.0878 27.3798 14.1339 27.4946C14.18 27.6094 14.2485 27.7138 14.3353 27.8019C14.4222 27.89 14.5256 27.9599 14.6398 28.0077C14.7539 28.0554 14.8763 28.08 15 28.08C15.1237 28.08 15.2462 28.0554 15.3603 28.0077C15.4744 27.9599 15.5778 27.89 15.6647 27.8019C15.7515 27.7138 15.82 27.6094 15.8661 27.4946C15.9122 27.3798 15.9351 27.257 15.9333 27.1333V24.3333C15.935 24.2085 15.9117 24.0845 15.8646 23.9689C15.8176 23.8532 15.7478 23.7481 15.6594 23.6599C15.571 23.5717 15.4658 23.5021 15.35 23.4553C15.2343 23.4084 15.1103 23.3853 14.9854 23.3873V23.3873Z\" fill=\"white\"/>\n    </g>\n    <defs>\n    <clipPath id=\"clip0_4_47\">\n    <rect width=\"28\" height=\"28\" fill=\"white\" transform=\"translate(1 1)\"/>\n    </clipPath>\n    </defs>\n</svg>\n</span>\n";
