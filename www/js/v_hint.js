const Pos = CodeMirror.Pos;

const keywords =
    `as asm assert atomic break const continue defer else enum fn for go goto if import in interface is isreftype lock match module mut none or pub return rlock select shared sizeof static struct spawn type typeof union unsafe volatile __offsetof`.split(' ')

const pseudoKeywords = `sql`.split(' ')

const atoms = `true false nil print println exit panic error`.split(' ')

const builtinTypes = `bool string i8 i16 int i64 i128 u8 u16 u32 u64 u128 rune f32 f64 isize usize voidptr any`.split(' ')

function arrayContains(arr, item) {
    if (!Array.prototype.indexOf) {
        let i = arr.length;
        while (i--) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }
    return arr.indexOf(item) !== -1;
}

function scriptHint(editor, keywords, getToken, options) {
    let context = [];
    // Find the token at the cursor
    const cur = editor.getCursor();
    let token = getToken(editor, cur);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    const innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
    if (innerMode.mode.helperType === "json") return;
    token.state = innerMode.state;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
        token = {
            start: cur.ch, end: cur.ch, string: "", state: token.state,
            type: token.string === "." ? "property" : null
        };
    } else if (token.end > cur.ch) {
        token.end = cur.ch;
        token.string = token.string.slice(0, cur.ch - token.start);
    }

    let tprop = token;
    // If it is a property, find out what it is a property of.
    while (tprop.type === "property") {
        tprop = getToken(editor, Pos(cur.line, tprop.start));
        if (tprop.string !== ".") return;
        tprop = getToken(editor, Pos(cur.line, tprop.start));
        context.push(tprop);
    }
    return {
        list: getCompletions(token, context, keywords, options),
        from: Pos(cur.line, token.start),
        to: Pos(cur.line, token.end)
    };
}

function getHint(editor, options) {
    return scriptHint(editor, keywords,
        (e, cur) => e.getTokenAt(cur),
        options);
}

function getCompletions(token, context, options) {
    const found = [], start = token.string;

    function maybeAdd(obj) {
        const str = obj.text
        if (str.lastIndexOf(start, 0) === 0 && !arrayContains(found, str)) found.push(obj);
    }

    keywords.forEach((text) => {
        maybeAdd({
            text: text,
            displayText: text,
            className: 'completion-keyword',
        })
    })

    pseudoKeywords.forEach((text) => {
        maybeAdd({
            text: text,
            displayText: text,
            className: 'completion-keyword',
        })
    })

    atoms.forEach((text) => {
        maybeAdd({
            text: text,
            displayText: text,
            className: 'completion-atom',
        })
    })

    builtinTypes.forEach((text) => {
        maybeAdd({
            text: text,
            displayText: text,
            className: 'completion-type',
        })
    })

    return found;
}

CodeMirror.registerHelper("hint", "v", getHint);
