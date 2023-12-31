"use strict";(()=>{var ve=Object.defineProperty;var Ee=(l,e,t)=>e in l?ve(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var p=(l,e,t)=>(Ee(l,typeof e!="symbol"?e+"":e,t),t);var ee=CodeMirror.Pos,Te=["arrays","benchmark","bitfield","cli","clipboard","compress","context","crypto","darwin","datatypes","dl","dlmalloc","encoding","eventbus","flag","fontstash","gg","gx","hash","io","js","json","log","math","mssql","mysql","net","orm","os","pg","picoev","picohttpparser","rand","readline","regex","runtime","semver","sokol","sqlite","stbi","strconv","strings","sync","szip","term","time","toml","v","vweb","x"],ce=["params","noinit","required","skip","assert_continues","unsafe","manualfree","heap","nonnull","primary","inline","direct_array_access","live","flag","noinline","noreturn","typedef","console","sql","table","deprecated","deprecated_after","export","callconv"],te="[\\w_]+",de=new RegExp(`^(${ce.join("|")})]$`),pe=`(${te}: ${te})`,me=new RegExp(`^${pe}]$`),he=new RegExp(`^(${ce.join("|")}(; ?)?){2,}]$`),ge=new RegExp(`^((${pe})(; )?){2,}]$`),fe=new RegExp(`^if ${te} \\??]`);function Se(l){let e=[],t=l.getCursor(),n=l.getTokenAt(t),r=new Set;for(let g=0;g<Math.min(l.lineCount(),10);g++){let y=l.getLineTokens(g).filter(C=>C.type!=null);y.length>0&&y[0].string==="import"&&r.add(y[y.length-1].string)}let u=l.getLineTokens(t.line);u.length>0&&u[0].string==="import"&&e.push(u[0]);let a=n.string.length,c=l.getTokenAt(ee(t.line,t.ch-a));return n.string==="."&&e.push(n),c.string==="."&&e.push(c),/\b(?:string|comment)\b/.test(n.type??"")?null:(/^[\w$_]*$/.test(n.string)?n.end>t.ch&&(n.end=t.ch,n.string=n.string.slice(0,t.ch-n.start)):n={start:t.ch,end:t.ch,string:"",state:n.state,type:n.string==="."?"property":null},{list:Le(n,r,e),from:ee(t.line,n.start),to:ee(t.line,n.end)})}function Le(l,e,t){let n=[],r=l.string;function u(a){let c=a.text;if(!c.startsWith(r))return;n.find(y=>y.text===c)||n.push(a)}if(t&&t.length){let a=t.pop();if(a!==void 0){if(a.type==="keyword"&&a.string==="import")return Te.forEach(c=>{u({text:c,displayText:c,className:"completion-module"})}),n;if(a.string===".")return[]}}return e.forEach(a=>{u({text:a,displayText:a,className:"completion-module"})}),z.forEach(a=>{u({text:a+" ",displayText:a,className:"completion-keyword"})}),ne.forEach(a=>{u({text:a+" ",displayText:a,className:"completion-keyword"})}),ie.forEach(a=>{u({text:a,displayText:a,className:"completion-atom"})}),re.forEach(a=>{u({text:a,displayText:a,className:"completion-type"})}),n}var _e=l=>Se(l);CodeMirror.registerHelper("hint","v",_e);var D=class{constructor(e,t,n,r,u,a=new Set){this.indentation=e;this.column=t;this.type=n;this.align=r;this.prev=u;this.knownImports=a}insideString=!1;stringQuote=null;expectedImportName=!1},z=new Set(["as","asm","assert","atomic","break","const","continue","defer","else","enum","fn","for","go","goto","if","import","in","interface","is","isreftype","lock","match","module","mut","none","or","pub","return","rlock","select","shared","sizeof","static","struct","spawn","type","typeof","union","unsafe","volatile","__global","__offsetof"]),ne=new Set(["sql","chan","thread"]),xe=new Set(["#flag","#include","#pkgconfig"]),ie=new Set(["true","false","nil","print","println","exit","panic","error","dump"]),re=new Set(["bool","string","i8","i16","int","i32","i64","i128","u8","u16","u32","u64","u128","rune","f32","f64","isize","usize","voidptr","any"]);CodeMirror.defineMode("v",l=>{let e=l.indentUnit??0,t=/[+\-*&^%:=<>!?|\/]/,n=null;function r(i){return i.eatWhile(/[\w$_\xa1-\uffff]/),i.current()}function u(i,o){let s=i.next();if(s===null)return null;if(o.context.insideString&&s==="}")return i.eat("}"),o.tokenize=h(o.context.stringQuote),"end-interpolation";if(s==='"'||s==="'"||s==="`")return o.tokenize=h(s),o.tokenize(i,o);if((s==="r"||s==="c")&&(i.peek()=='"'||i.peek()=="'")){let x=i.next();return x===null||(o.tokenize=_(x)),"string"}if(s==="."&&!i.match(/^[0-9]+([eE][\-+]?[0-9]+)?/))return"operator";if(s==="["&&(i.match(de)||i.match(me)||i.match(he)||i.match(ge)||i.match(fe)))return"attribute";if(/[\d.]/.test(s))return s==="0"?i.match(/^[xX][0-9a-fA-F_]+/)||i.match(/^o[0-7_]+/)||i.match(/^b[0-1_]+/):i.match(/^[0-9_]*\.?[0-9_]*([eE][\-+]?[0-9_]+)?/),"number";if(/[\[\]{}(),;:.]/.test(s))return n=s,null;if(s==="/"){if(i.eat("*"))return o.tokenize=T,T(i,o);if(i.eat("/"))return i.skipToEnd(),"comment"}if(t.test(s))return i.eatWhile(t),"operator";if(s==="@")return r(i),"at-identifier";if(s==="$"){let x=r(i).slice(1);return z.has(x)?"keyword":"compile-time-identifier"}i.backUp(2);let m=i.next()===".";i.next();let d=r(i);if(d==="import"&&(o.context.expectedImportName=!0),z.has(d)||ne.has(d))return"keyword";if(ie.has(d))return"atom";if(xe.has(d))return"hash-directive";if(!m&&re.has(d))return"builtin";if(d.length>0&&d[0].toUpperCase()===d[0])return"type";let S=i.peek();if(S==="("||S==="<")return"function";if(S==="["){i.next();let x=i.next();if(i.backUp(2),x!=null&&x.match(/[A-Z]/i))return"function"}return o.context.expectedImportName&&i.peek()!=="."?(o.context.expectedImportName=!1,o.context.knownImports===void 0&&(o.context.knownImports=new Set),o.context.knownImports.add(d),"import-name"):m?"property":o.context.knownImports.has(d)&&i.peek()=="."?"import-name":"variable"}function a(i,o){return i.match("}")?(o.tokenize=h(o.context.stringQuote),"end-interpolation"):(o.tokenize=u,o.tokenize(i,o))}function c(i,o){let s=i.next();if(s===" ")return o.tokenize=h(o.context.stringQuote),o.tokenize(i,o);if(s===".")return"operator";let m=r(i);if(m[0].toLowerCase()===m[0].toUpperCase())return o.tokenize=h(o.context.stringQuote),o.tokenize(i,o);let d=i.next();return i.backUp(1),d==="."?o.tokenize=c:o.tokenize=h(o.context.stringQuote),"variable"}function g(i,o){let s=i.next();return s==="$"&&i.eat("{")?(o.tokenize=a,"start-interpolation"):s==="$"?(o.tokenize=c,"start-interpolation"):"string"}function y(i,o){return i.next()==="\\"?(i.next(),o.tokenize=h(o.context.stringQuote),"valid-escape"):"string"}function C(i){return i==="n"||i==="t"||i==="r"||i==="\\"||i==='"'||i==="'"||i==="0"}function h(i){return function(o,s){s.context.insideString=!0,s.context.stringQuote=i;let m="",d=!1,S=!1;for(;(m=o.next())!=null;){if(m===i&&!d){S=!0;break}if(m==="$"&&!d&&o.eat("{"))return s.tokenize=g,o.backUp(2),"string";if(m==="$"&&!d)return s.tokenize=g,o.backUp(1),"string";if(d&&C(m))return o.backUp(2),s.tokenize=y,"string";d=!d&&m==="\\"}return(S||d)&&(s.tokenize=u),s.context.insideString=!1,s.context.stringQuote=null,"string"}}function _(i){return function(o,s){s.context.insideString=!0,s.context.stringQuote=i;let m="",d=!1,S=!1;for(;(m=o.next())!=null;){if(m===i&&!d){S=!0;break}d=!d&&m==="\\"}return(S||d)&&(s.tokenize=u),s.context.insideString=!1,s.context.stringQuote=null,"string"}}function T(i,o){let s=!1,m;for(;m=i.next();){if(m==="/"&&s){o.tokenize=u;break}s=m==="*"}return"comment"}function A(i,o,s){return i.context=new D(i.indention,o,s,null,i.context,i.context.knownImports)}function F(i){if(!i.context.prev)return;let o=i.context.type;return(o===")"||o==="]"||o==="}")&&(i.indention=i.context.indentation),i.context=i.context.prev,i.context}return{startState:function(){return{tokenize:null,context:new D(0,0,"top",!1),indention:0,startOfLine:!0}},token:function(i,o){let s=o.context;if(i.sol()&&(s.align==null&&(s.align=!1),o.indention=i.indentation(),o.startOfLine=!0),i.eatSpace())return null;n=null;let m=(o.tokenize||u)(i,o);return m==="comment"||(s.align==null&&(s.align=!0),n==="{"?A(o,i.column(),"}"):n==="["?A(o,i.column(),"]"):n==="("?A(o,i.column(),")"):(n==="}"&&s.type==="}"||n===s.type)&&F(o),o.startOfLine=!1),m},indent:function(i,o){if(i.tokenize!==u&&i.tokenize!=null||i.context.type=="top")return 0;let s=i.context,d=o.charAt(0)===s.type;return s.align?s.column+(d?0:1):s.indentation+(d?0:e)},electricChars:"{}):",closeBrackets:"()[]{}''\"\"``",fold:"brace",blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:"//"}});CodeMirror.defineMIME("text/x-v","v");var V=class{hash;constructor(e){this.hash=e}saveCode(e){}getCode(e){return this.getSharedCode(e)}getSharedCode(e){let t=new FormData;t.append("hash",this.hash),fetch("/query",{method:"post",body:t}).then(n=>n.json()).then(n=>n).then(n=>{if(console.log(n),!n.found){e({code:V.CODE_NOT_FOUND});return}if(n.error!=""){console.error(n.error),e({code:V.CODE_NOT_FOUND});return}e(n.snippet)}).catch(n=>{console.log(n)})}},b=V;p(b,"QUERY_PARAM_NAME","query"),p(b,"CODE_NOT_FOUND","Not found.");var R=class{constructor(e){this.text=e}saveCode(e){}getCode(e){e({code:this.text})}};var P=class{saveCode(e){window.localStorage.setItem(P.LOCAL_STORAGE_KEY,e)}getCode(e){let t=window.localStorage.getItem(P.LOCAL_STORAGE_KEY);if(t==null){e({code:P.WELCOME_CODE});return}e({code:t})}},E=P;p(E,"LOCAL_STORAGE_KEY","code"),p(E,"WELCOME_CODE",`
// Welcome to the V Playground!
// Here you can edit, run, and share V code.
// Let's start with a simple "Hello, Playground!" example:
println('Hello, Playground!')

// To run the code, click the "Run" button or just press Ctrl + R.
// To format the code, click the "Format" button or just press Ctrl + L.

// More examples are available in top dropdown list.
// You can find Help for shortcuts in the bottom right corner or just press Ctrl + I.
// See also change theme button in the top right corner.
// If you want to learn more about V, visit https://vlang.io/, https://github.com/vlang/v/blob/master/doc/docs.md, and https://modules.vlang.io/
// Join us on Discord: https://discord.gg/vlang
// Enjoy!
`.trimStart());var M=class{constructor(e){this.text=e;this.decodedCode=atob(e)}decodedCode;saveCode(e){}getCode(e){e({code:this.decodedCode})}};p(M,"QUERY_PARAM_NAME","base64");var O=class{constructor(e){this.id=e}saveCode(e){}getCode(e){fetch("https://api.github.com/gists/"+this.id,{method:"get",headers:{"Content-Type":"application/json"}}).then(t=>t.json()).then(t=>{let n=t.files,r=Object.keys(n)[0],a=n[r].raw_url;fetch(a,{method:"get",headers:{"Content-Type":"text/plain"}}).then(c=>c.text()).then(c=>{e({code:c})}).catch(c=>{console.log(c)})}).catch(t=>{console.log(t)})}};p(O,"QUERY_PARAM_NAME","gist");var G=class{static selectRepository(e,t){if(t!==void 0&&t.codeHash!==null&&t.codeHash!==void 0)return new b(t.codeHash);if(t!==void 0&&t.code!==null&&t.code!==void 0)return new R(t.code);if(t!==void 0&&t.embed!==null&&t.embed!==void 0&&t.embed)return new R("");let n=new E,r=e.getURLParameter(b.QUERY_PARAM_NAME);if(r!=null)return new b(r);let u=e.getURLParameter(M.QUERY_PARAM_NAME);if(u!=null)return new M(u);let a=e.getURLParameter(O.QUERY_PARAM_NAME);return a!=null?new O(a):n}};var I=class{params;constructor(e){this.params=new URLSearchParams(e)}updateURLParameter(e,t){let n=I.updateURLParameter(window.location.href,e,t);window.history.replaceState({},"",n)}getURLParameter(e){return this.params.get(e)}static updateURLParameter(e,t,n){let r=new URL(e);return n?r.searchParams.set(t,n):r.searchParams.delete(t),r.toString()}};var oe=class{containingElement;element;helpOverlay;showHelpButton;closeHelpButton;constructor(e){this.containingElement=e,this.element=e.getElementsByClassName("js-help-wrapper")[0],!(this.element===null||this.element===void 0)&&(this.helpOverlay=this.element.querySelector(".js-help-overlay"),this.showHelpButton=this.element.querySelector(".js-show-help"),this.closeHelpButton=this.element.querySelector(".js-close-help"),this.mount())}mount(){this.showHelpButton!==void 0&&this.showHelpButton.addEventListener("click",()=>{this.toggleHelp()}),this.helpOverlay!==void 0&&this.helpOverlay.addEventListener("click",()=>{this.toggleHelp()}),this.closeHelpButton!==void 0&&this.closeHelpButton.addEventListener("click",()=>{this.toggleHelp()}),oe.isMac||document.querySelectorAll(".js-shortcut kbd.ctrl").forEach(function(t){t.innerText="Ctrl"})}closeHelp(){this.helpOverlay.classList.contains("opened")&&this.toggleHelp()}toggleHelp(){this.containingElement.getElementsByClassName("js-help")[0].classList.toggle("opened"),this.helpOverlay.classList.toggle("opened")}},$=oe;p($,"isMac",navigator.platform.toUpperCase().indexOf("MAC")>=0);var K=(n=>(n.Run="Run",n.Test="Test",n.Cgen="Cgen",n))(K||{});function ye(l){switch(l){case"Run":return 0;case"Test":return 1;case"Cgen":return 2;default:throw new Error(`Unknown run configuration type: ${l}`)}}function be(l){switch(l){case 0:return"Run";case 1:return"Test";case 2:return"Cgen";default:return"Run"}}function se(l){switch(l){case"Run":return"Run";case"Test":return"Test";case"Cgen":return"Cgen";default:throw new Error(`Unknown run configuration type: ${l}`)}}var w=class{queryParams;currentConfiguration="Run";fromQueryParam=!1;runButton=document.querySelector(".js-run__action");runButtonLabel=document.querySelector(".js-run__action .label");openRunButton=document.querySelector(".js-open-run-select");configurationsList=document.querySelector(".js-run-configurations-list");configurationsOverlay=document.querySelector(".js-run-configurations-list-overlay");configurations=document.querySelectorAll(".js-configuration");buildArgumentsInput=document.querySelector(".js-build-arguments-input");runArgumentsInput=document.querySelector(".js-run-arguments-input");onChange=()=>{};onSelect=()=>{};constructor(e){this.queryParams=e,this.mount()}get configuration(){return this.currentConfiguration}registerOnChange(e){this.onChange=e}registerOnSelect(e){this.onSelect=e}toggleConfigurationsList(){this.configurationsList.classList.toggle("hidden"),this.configurationsOverlay.classList.toggle("opened")}closeConfigurationsList(){this.configurationsList.classList.add("hidden"),this.configurationsOverlay.classList.remove("opened")}setupConfiguration(){let e=this.queryParams.getURLParameter(w.QUERY_PARAM_NAME);if(e!=null){this.fromQueryParam=!0,this.useConfiguration(se(e));return}let t=window.localStorage.getItem(w.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY);t!=null&&(this.buildArgumentsInput.value=t);let n=window.localStorage.getItem(w.LOCAL_STORAGE_RUN_ARGUMENTS_KEY);n!=null&&(this.runArgumentsInput.value=n);let r=window.localStorage.getItem(w.LOCAL_STORAGE_KEY);if(r!=null){this.useConfiguration(se(r));return}this.useConfiguration("Run")}useConfiguration(e){this.currentConfiguration=e,this.onChange(e);let t=K[e];this.runButton.setAttribute("data-type",t),this.runButtonLabel.textContent=t,e=="Cgen"&&(this.runButtonLabel.textContent="Show generated C code"),this.fromQueryParam||(window.localStorage.setItem(w.LOCAL_STORAGE_KEY,t),window.localStorage.setItem(w.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY,this.buildArgumentsInput.value),window.localStorage.setItem(w.LOCAL_STORAGE_RUN_ARGUMENTS_KEY,this.runArgumentsInput.value)),this.fromQueryParam&&this.queryParams.updateURLParameter(w.QUERY_PARAM_NAME,t)}get buildArguments(){return this.buildArgumentsInput.value.split(" ").filter(e=>e.length>0)}get runArguments(){return this.runArgumentsInput.value.split(" ").filter(e=>e.length>0)}setBuildArguments(e){this.buildArgumentsInput.value=e}setRunArguments(e){this.runArgumentsInput.value=e}mount(){this.openRunButton.addEventListener("click",()=>{this.toggleConfigurationsList()}),this.buildArgumentsInput.addEventListener("input",()=>{window.localStorage.setItem(w.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY,this.buildArgumentsInput.value)}),this.runArgumentsInput.addEventListener("input",()=>{window.localStorage.setItem(w.LOCAL_STORAGE_RUN_ARGUMENTS_KEY,this.runArgumentsInput.value)}),this.configurationsOverlay.addEventListener("click",()=>{this.toggleConfigurationsList()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&this.closeConfigurationsList()}),this.configurations.forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-type")??"Run",n=se(t);this.useConfiguration(n),this.onSelect(n)})})}},L=w;p(L,"QUERY_PARAM_NAME","runConfiguration"),p(L,"LOCAL_STORAGE_KEY","run-configuration"),p(L,"LOCAL_STORAGE_BUILD_ARGUMENTS_KEY","build-arguments"),p(L,"LOCAL_STORAGE_RUN_ARGUMENTS_KEY","run-arguments");var Q=[{name:"Hello, Playground!",code:E.WELCOME_CODE,runConfiguration:"Run"},{name:"String interpolation",code:`
// In V you can define array of string with the following syntax:
areas := ['game', 'web', 'tools', 'science', 'systems', 'embedded', 'drivers', 'GUI', 'mobile']

for area in areas {
    // V uses the \${} notation to interpolate a variable
    // or expression right on the string.
    // Learn more about string interpolation in the documentation:
    // https://github.com/vlang/v/blob/master/doc/docs.md#string-interpolation
    println('Hello, \${area} developers!')
}
        `,runConfiguration:"Run"},{name:"Fibonacci",code:`
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
`,runConfiguration:"Run"},{name:"Structs and embedded structs",code:`
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
`,runConfiguration:"Run"},{name:"Sum types",code:`
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
    // Learn more about matching sumtype values in the documentation:
    // https://github.com/vlang/v/blob/master/doc/docs.md#matching-sum-types
    return match tree {
        // if the value has type Empty, return 0
        Empty { 0 }
        // if the value has type Node, return the sum of the node value and the sum of the left and right subtrees
        Node { tree.value + sum(tree.left) + sum(tree.right) }
    }
}
`,runConfiguration:"Run"},{name:"Generics",code:`
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
        `,runConfiguration:"Run"},{name:"Concurrency",code:`
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
        `,runConfiguration:"Run"},{name:"Channel Select",code:`
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
        `,runConfiguration:"Run"},{name:"JSON Encoding/Decoding",code:`
// V is very modular and has a lot of built-in modules.
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
`,runConfiguration:"Run"},{name:"Filter Log file",code:`
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
`,runConfiguration:"Run"},{name:"Compile-time Reflection",code:`
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
`,runConfiguration:"Run"},{name:"Anonymous & higher order functions",code:`
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
`,runConfiguration:"Run"},{name:"Testing",code:`
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
`,runConfiguration:"Test"}].map(l=>(l.code=l.code.trim().replace(/^ {4}/gm,"	")+`
`,l)),we=`
// Oops, the shared link is broken.
// Please recheck the link and try again.
println('Hello, link 404!')
`.trimStart();var ae=class{selectElement;onSelectHandler=null;constructor(){this.selectElement=document.querySelector(".js-examples__select")}registerOnSelectHandler(e){this.onSelectHandler=e}mount(){if(this.selectElement===null||this.selectElement===void 0)return;let e=document.querySelector(".dropdown__list"),t=this.selectElement.querySelector(".dropdown__button");if(e!==null&&t!==null){Q.forEach((g,y)=>{e.innerHTML+=ae.exampleElementListTemplate(g.name,y)});let c=t.querySelector("span");c.innerText=Q[0].name}let n=e.querySelectorAll(".dropdown__list-item");n.forEach(c=>{c.addEventListener("click",()=>{let g=c.innerText,y=Q.find(C=>C.name===g);this.onSelectHandler!==null&&y&&this.onSelectHandler(y)})});let r=this.selectElement.querySelector(".dropdown__button"),u=this.selectElement.querySelector(".dropdown__input_hidden"),a=document.querySelector(".dropdown__list");r.addEventListener("click",function(){a.classList.toggle("dropdown__list_visible"),this.classList.toggle("dropdown__button_active")}),n.forEach(function(c){c.addEventListener("click",function(g){n.forEach(function(h){h.classList.remove("dropdown__list-item_active")}),g.target.classList.add("dropdown__list-item_active");let C=r.querySelector("span");C.innerText=this.innerText,u.value=this.dataset.value??"",a.classList.remove("dropdown__list_visible")})}),document.addEventListener("click",function(c){c.target!==r&&!r.contains(c.target)&&(r.classList.remove("dropdown__button_active"),a.classList.remove("dropdown__list_visible"))}),document.addEventListener("keydown",function(c){(c.key==="Tab"||c.key==="Escape")&&(r.classList.remove("dropdown__button_active"),a.classList.remove("dropdown__list_visible"))})}},q=ae;p(q,"exampleElementListTemplate",function(e,t){let n="";return t===0&&(n="dropdown__list-item_active"),`
<li class="dropdown__list-item ${n}" data-value="${e}">${e}</li>
`});function Ce(l){let e=document.createElement("textarea");e.value=l,e.style.top="0",e.style.left="0",e.style.position="fixed",document.body.appendChild(e),e.focus(),e.select();try{let n=document.execCommand("copy")?"successful":"unsuccessful";console.log("Fallback: Copying text command was "+n)}catch(t){console.log("Fallback: Oops, unable to copy",t)}document.body.removeChild(e)}function le(l,e){return navigator.clipboard?navigator.clipboard.writeText(l).then(()=>{console.log("Async: Copying to clipboard was successful!"),e()},t=>{Ce(l),console.log("Async: Could not copy text: ",t,"fallback to old method")}):(Ce(l),Promise.resolve())}var Y=class{constructor(e,t,n,r){this.code=e;this.buildArguments=t;this.runArguments=n;this.runConfiguration=r}toFormData(){let e=new FormData;return e.append("code",this.code),e.append("build-arguments",this.buildArguments.join(" ")),e.append("run-arguments",this.runArguments.join(" ")),e.append("run-configuration",this.runConfiguration.toString()),e}},f=class{static runCode(e){return fetch("/run",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error(f.buildErrorMessage("run",t));return t}).then(t=>t.json()).then(t=>t)}static runTest(e){return fetch("/run_test",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error(f.buildErrorMessage("test",t));return t}).then(t=>t.json()).then(t=>t)}static retrieveCgenCode(e){return fetch("/cgen",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error(f.buildErrorMessage("cgen",t));return t}).then(t=>t.json()).then(t=>t)}static formatCode(e){return fetch("/format",{method:"post",body:e.toFormData()}).then(t=>t.json()).then(t=>t)}static shareCode(e){return fetch("/share",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error(f.buildErrorMessage("share",t));return t}).then(t=>t.json()).then(t=>t)}static createBugUrl(e){return fetch("/create_bug_url",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error(f.buildErrorMessage("create_bug_url",t));return t}).then(t=>t.json()).then(t=>t)}static getVlangVersion(){return fetch("/version",{method:"post"}).then(e=>{if(e.status!=200)throw new Error(f.buildErrorMessage("version",e));return e}).then(e=>e.json()).then(e=>e)}static buildErrorMessage(e,t){let n=`Failed to invoke \`/${e}\` endpoint`,r=t.status.toString()+" "+t.statusText;return`${n}: ${r}`}};var W=class{constructor(e,t,n,r,u,a){this.terminal=r;let c={mode:a,lineNumbers:!0,matchBrackets:!0,extraKeys:{"Ctrl-Space":"autocomplete","Ctrl-/":"toggleComment"},readOnly:u,indentWithTabs:!0,indentUnit:4,autoCloseBrackets:!0,showHint:!0,lint:{async:!0,lintOnChange:!0,delay:20},toggleLineComment:{indent:!0,padding:" "},theme:"dark"};this.wrapperElement=t,this.textAreaElement=t.querySelector(`textarea.${e}`),this.editor=CodeMirror.fromTextArea(this.textAreaElement,c),this.repository=n,this.initFont()}wrapperElement;textAreaElement;repository;editor;initFont(){let e=window.localStorage.getItem(W.FONT_LOCAL_STORAGE_KEY);e!==null&&this.setEditorFontSize(e)}changeEditorFontSize(e){let t=document.getElementsByClassName("CodeMirror")[0],n=window.getComputedStyle(t,null).getPropertyValue("font-size");if(n){let r=parseInt(n)+e;t.style.fontSize=r+"px",window.localStorage.setItem(W.FONT_LOCAL_STORAGE_KEY,r.toString()),this.editor.refresh()}}setEditorFontSize(e){let t=document.getElementsByClassName("CodeMirror")[0];t.style.fontSize=e+"px",this.refresh()}setCode(e,t=!1){let n=this.editor.getCursor();this.editor.setValue(e),this.repository.saveCode(e),t&&this.editor.setCursor(n)}getCode(){return this.editor.getValue()}saveCode(){this.repository instanceof b&&(this.repository=new E),this.repository.saveCode(this.getCode())}getRunnableCodeSnippet(e){return new Y(this.getCode(),e.buildArguments,e.runArguments,ye(e.configuration))}clear(){this.setCode("")}setTheme(e){this.editor.setOption("theme",e.name())}showCompletion(){this.editor.execCommand("autocomplete")}refresh(){this.editor.refresh()}hide(){let e=this.textAreaElement.parentElement;console.log(e),e!==void 0&&(e.style.display="none"),e.parentElement?.classList?.remove("two-editors")}show(){let e=this.textAreaElement.parentElement;console.log(e),e!==void 0&&(e.style.display="grid"),e.parentElement?.classList?.add("two-editors")}},H=W;p(H,"FONT_LOCAL_STORAGE_KEY","editor-font-size");var k=class{name(){return"dark"}};var U=class{name(){return"light"}};var N=class{themes=[new k,new U];currentTheme=null;onChange=[];queryParams;changeThemeButtons=null;predefinedTheme=null;fromQueryParam=!1;constructor(e,t=null){this.queryParams=e,this.predefinedTheme=t,this.changeThemeButtons=document.querySelectorAll(".js-change-theme__action")}registerOnChange(e){this.onChange.push(e)}loadTheme(){let e=this.queryParams.getURLParameter(N.QUERY_PARAM_NAME);if(e!=null){this.fromQueryParam=!0;let u=this.findTheme(e);this.turnTheme(u);return}let t=window.localStorage.getItem(N.LOCAL_STORAGE_KEY);if(t!=null){let u=this.findTheme(t);this.turnTheme(u);return}if(this.predefinedTheme!==null&&this.predefinedTheme!==void 0){this.turnTheme(this.predefinedTheme);return}let r=window.matchMedia("(prefers-color-scheme: dark)").matches?new k:new U;this.turnTheme(r)}findTheme(e){let t=this.themes.filter(r=>r.name()===e),n=t[0];return t.length==0&&(n=new k),n}turnTheme(e){this.currentTheme=e,this.onChange.forEach(n=>n(e)),this.changeThemeButtons!==null&&this.changeThemeButtons.forEach(n=>{let r=n.querySelector(".sun"),u=n.querySelector(".moon");r!==null&&u!==null&&(e.name()==="dark"?(r.style.display="block",u.style.display="none"):(r.style.display="none",u.style.display="block"))}),document.querySelector("html").setAttribute("data-theme",e.name()),this.fromQueryParam||window.localStorage.setItem(N.LOCAL_STORAGE_KEY,e.name()),this.fromQueryParam&&this.queryParams.updateURLParameter(N.QUERY_PARAM_NAME,e.name())}turnDarkTheme(){this.turnTheme(new k)}turnLightTheme(){this.turnTheme(new U)}toggleTheme(){this.currentTheme&&(this.currentTheme.name()==="light"?this.turnDarkTheme():this.turnLightTheme())}},B=N;p(B,"QUERY_PARAM_NAME","theme"),p(B,"LOCAL_STORAGE_KEY","theme");var J=class{element;onClose=null;onWrite=null;filters=[];tabsElement;constructor(e){this.element=e,this.tabsElement=this.element.querySelector(".js-terminal__tabs"),this.attachResizeHandler(e)}registerCloseHandler(e){this.onClose=e}registerWriteHandler(e){this.onWrite=e}registerFilter(e){this.filters.push(e)}getTabElement(e){return this.tabsElement.querySelector(`input[value='${e}']`)}openTab(e){let t=this.getTabElement(e);t!==null&&(t.checked=!0,t.dispatchEvent(new Event("change")))}openOutputTab(){this.openTab("output")}openBuildLogTab(){this.openTab("build-log")}write(e){this.writeImpl(e,!0)}writeOutput(e){this.writeImpl(e,!1)}writeImpl(e,t){let n=e.split(`
`),r=this.getTerminalOutputElement(t),a=n.filter(c=>this.filters.every(g=>g(c))).map(this.highlightLine).join(`
`);r.innerHTML+=a+`
`,this.onWrite!==null&&this.onWrite(e)}highlightLine(e){if(e.startsWith("code.v:")||e.startsWith("code_test.v:")){let t=e.split(":"),n=t[0],r=parseInt(t[1]),u=parseInt(t[2]),a=t[3].trim(),c=t.slice(4).join(":");return`${n}:${r}:${u}: <span class="message-${a}">${a}</span>:<span class="error">${c}</span>`}return e.trim().startsWith("FAIL")&&e.includes("code_test.v")?`<span class="message-error">FAIL</span> ${e.trim().substring(4)}`:e.trim().startsWith("OK")&&e.includes("code_test.v")?`<span class="message-success">OK</span> ${e.trim().substring(2)}`:e}clear(){this.getTerminalOutputElement(!1).innerHTML="",this.getTerminalOutputElement(!0).innerHTML=""}mount(){let e=this.element.querySelector(".js-terminal__close-buttom");if(e==null||this.onClose===null)return;e.addEventListener("click",this.onClose),this.element.querySelector(".js-terminal__tabs").querySelectorAll("input").forEach(r=>{r.addEventListener("change",()=>{r.value==="output"?(this.getTerminalOutputElement(!1).style.display="block",this.getTerminalOutputElement(!0).style.display="none"):(this.getTerminalOutputElement(!1).style.display="none",this.getTerminalOutputElement(!0).style.display="block")})})}getTerminalOutputElement(e){return e?this.element.querySelector(".js-terminal__build-log"):this.element.querySelector(".js-terminal__output")}attachResizeHandler(e){let t=e.querySelector(".header");if(!t)return;let n=!1;t.addEventListener("mousedown",r=>{r.target.tagName.toLowerCase()!=="label"&&(n=!0,document.body.classList.add("dragging"))}),t.addEventListener("touchstart",r=>{r.target.tagName.toLowerCase()!=="label"&&(n=!0,document.body.classList.add("dragging"))}),t.addEventListener("touchmove",r=>{n&&(e.style.height=`${document.body.clientHeight-r.touches[0].clientY+t.clientHeight/2}px`,r.preventDefault())}),document.addEventListener("mousemove",r=>{n&&(e.style.height=`${document.body.clientHeight-r.clientY+t.clientHeight/2}px`)}),document.addEventListener("mouseup",()=>{n=!1,document.body.classList.remove("dragging")}),document.addEventListener("touchend",()=>{n=!1,document.body.classList.remove("dragging")})}};var X=class{layerElement;constructor(){this.layerElement=document.querySelector(".js-tips-layer"),this.mount()}mount(){document.querySelector(".js-tips-layer__close").addEventListener("click",()=>{this.hide()}),document.addEventListener("keydown",t=>{this.isShown()&&t.key==="Escape"&&this.hide()})}isShown(){return this.layerElement.classList.contains("open")}show(){window.localStorage.getItem(X.DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY)!=="true"&&(this.layerElement.classList.add("open"),window.localStorage.setItem(X.DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY,"true"))}hide(){this.layerElement.classList.remove("open")}},j=X;p(j,"DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY","no-more-tips");var ue="unsaved",Z=class{runAsTestConsumer=()=>!1;wrapperElement;queryParams;repository;editor;cgenEditor;themeManager;examplesManager;helpManager;runConfigurationManager;tipsManager;terminal;cgenMode=!1;constructor(e){this.wrapperElement=e,this.queryParams=new I(window.location.search),this.repository=G.selectRepository(this.queryParams);let t=e.querySelector(".js-terminal");if(t==null)throw new Error("Terminal not found, please check that terminal inside editor element");this.terminal=new J(t),this.editor=new H("main",e,this.repository,this.terminal,!1,"v"),this.cgenEditor=new H("cgen",e,new R(""),this.terminal,!0,"text/x-csrc"),this.cgenEditor.hide(),this.repository.getCode(n=>{if(n.code===b.CODE_NOT_FOUND){this.editor.setCode(we),this.writeTerminalBuildLog("Code for shared link not found.");return}if(n.runConfiguration!==void 0){let r=be(n.runConfiguration);this.runConfigurationManager.useConfiguration(r)}n.buildArguments!==void 0&&this.runConfigurationManager.setBuildArguments(n.buildArguments),n.runArguments!==void 0&&this.runConfigurationManager.setRunArguments(n.runArguments),this.editor.setCode(n.code)}),this.themeManager=new B(this.queryParams),this.themeManager.registerOnChange(n=>{this.editor.setTheme(n),this.cgenEditor.setTheme(n)}),this.themeManager.loadTheme(),this.examplesManager=new q,this.examplesManager.registerOnSelectHandler(n=>{if(this.editor.setCode(n.code),this.runConfigurationManager.configuration==="Cgen"){this.cgenEditor.clear(),this.cgenEditor.setCode("Rerun Cgen to see C code");return}this.runConfigurationManager.useConfiguration(n.runConfiguration)}),this.examplesManager.mount(),this.helpManager=new $(e),this.runConfigurationManager=new L(this.queryParams),this.runConfigurationManager.registerOnChange(()=>{}),this.runConfigurationManager.registerOnSelect(n=>{this.runConfigurationManager.toggleConfigurationsList(),n==="Cgen"&&this.cgenEditor.show(),this.run()}),this.runConfigurationManager.setupConfiguration(),this.tipsManager=new j,this.registerAction("close-cgen",()=>{this.cgenEditor.hide(),this.disableCgenMode()}),this.registerAction("create-bug",()=>{this.clearTerminal(),this.openOutputTab(),this.writeTerminalOutput("Creating bug report url..."),f.createBugUrl(this.editor.getRunnableCodeSnippet(this.runConfigurationManager)).then(r=>{if(r.error!=""){this.writeTerminalOutput("Error creating bug report url: "+r.error);return}this.writeTerminalOutput("Bug report url created, opening GitHub in new tab..."),le(r.link,()=>{this.writeTerminalOutput("Bug report url copied to clipboard")}).then(()=>{window.open(r.link,"_blank")})})}),this.terminal.registerCloseHandler(()=>{this.closeTerminal()}),this.terminal.registerWriteHandler(n=>{this.openTerminal()}),this.terminal.registerFilter(n=>!n.trim().startsWith("Failed command")),this.terminal.mount(),this.closeTerminal()}enableCgenMode(){this.tipsManager.show(),this.wrapperElement.querySelectorAll(".playground__editor").forEach(e=>{e.classList.add("with-tabs")}),this.cgenMode=!0}disableCgenMode(){this.wrapperElement.querySelectorAll(".playground__editor").forEach(e=>{e.classList.remove("with-tabs")}),this.removeEditorLinesHighlighting(),this.cgenMode=!1}registerRunAsTestConsumer(e){this.runAsTestConsumer=e}registerAction(e,t){let n=document.querySelectorAll(`.js-${e}__action`);if(n.length==0)throw new Error(`Can't find any action button with class js-${e}__action`);n.forEach(r=>{r.addEventListener("click",t)})}getRunnableCodeSnippet(){return this.editor.getRunnableCodeSnippet(this.runConfigurationManager)}run(){let e=this.runConfigurationManager.configuration;e==="Run"?this.runCode():e==="Test"?this.runTest():e==="Cgen"&&(this.enableCgenMode(),this.retrieveCgenCode())}runCode(){this.clearTerminal(),this.openBuildLogTab(),this.writeTerminalBuildLog("Running code...");let e=this.getRunnableCodeSnippet();f.runCode(e).then(t=>{if(t.error!="")throw new Error(`The server returned an error:
${t.error}`);this.clearTerminal(),this.writeTerminalBuildLog(t.buildOutput),this.writeTerminalOutput(t.output),this.openOutputTab()}).catch(t=>{console.log(t),this.writeTerminalBuildLog(`Can't run code. ${t.message}`),this.writeTerminalBuildLog("Please try again.")})}runTest(){this.clearTerminal(),this.openBuildLogTab(),this.writeTerminalBuildLog("Running tests...");let e=this.getRunnableCodeSnippet();f.runTest(e).then(t=>{if(t.error!="")throw new Error(`The server returned an error:
${t.error}`);this.clearTerminal(),this.writeTerminalBuildLog(t.buildOutput),this.writeTerminalOutput(t.output),this.openOutputTab()}).catch(t=>{console.log(t),this.writeTerminalBuildLog(`Can't run tests. ${t.message}`),this.writeTerminalBuildLog("Please try again.")})}retrieveCgenCode(){this.clearTerminal(),this.openBuildLogTab(),this.writeTerminalBuildLog("Running retrieving of generated C code...");let e=this.getRunnableCodeSnippet();f.retrieveCgenCode(e).then(t=>{if(t.error!="")throw new Error(`The server returned an error:
${t.error}`);let r=t.cgenCode.split(`
`),u=[],a={};for(let h=0;h<r.length-1;h++){let _=r[h],T=r[h+1];if(!T.startsWith("#line")){if(_.startsWith("#line")){if(T.length!=0){let A=_.split(" "),F=parseInt(A[1]);if(!A[2].includes("code.v"))continue;a[F]=T}continue}u.push(_)}}let c=u.join(`
`),g={};for(let h in a){let _=a[h],T=u.indexOf(_);T!=-1&&(g[h]=T)}let y=u.find(h=>h.startsWith("void main__main(void) {"))||"",C=u.indexOf(y);C==-1&&(C=0),window.localStorage.setItem("cgen-mapping",JSON.stringify(g)),this.clearTerminal(),this.cgenEditor.show(),this.cgenEditor.setCode(c),this.cgenEditor.editor.scrollIntoView({line:C,ch:0}),this.writeTerminalBuildLog(t.buildOutput),this.closeTerminal(),t.exitCode!=0&&this.openTerminal()}).catch(t=>{console.log(t),this.writeTerminalBuildLog(`Can't compile and get C code. ${t.message}`),this.writeTerminalBuildLog("Please try again.")})}formatCode(){this.clearTerminal();let e=this.getRunnableCodeSnippet();f.formatCode(e).then(t=>{if(t.error!="")throw new Error(`The server returned an error:
${t.error}`);this.editor.setCode(t.output,!0)}).catch(t=>{console.log(t),this.openOutputTab(),this.writeTerminalOutput(`Can't format code. ${t.message}`),this.writeTerminalOutput("Please try again.")})}shareCode(){this.clearTerminal(),this.openOutputTab();let e=this.getRunnableCodeSnippet();console.log(e),f.shareCode(e).then(t=>{if(t.error!="")throw new Error(`The server returned an error:
${t.error}`);this.writeTerminalOutput("Code shared successfully!");let n=this.buildShareLink(t);this.writeTerminalOutput("Share link: "+n),le(n,()=>{this.writeTerminalOutput(`
Link copied to clipboard.`)})}).catch(t=>{console.log(t),this.writeTerminalOutput(`Can't share code. ${t.message}`),this.writeTerminalOutput("Please try again.")})}buildShareLink(e){return`https://play.vlang.io/p/${e.hash}`}changeTheme(){this.themeManager.toggleTheme()}setupShortcuts(){this.editor.editor.on("keypress",(e,t)=>{!e.state.completionActive&&t.key.length===1&&t.key.match(/[a-z0-9]/i)&&this.editor.showCompletion()}),this.editor.editor.on("mousedown",e=>{this.cgenMode&&setTimeout(()=>{this.removeEditorLinesHighlighting();let t=e.getCursor(),n=t.line+1,r=window.localStorage.getItem("cgen-mapping")??"{}",a=JSON.parse(r)[n];a!==void 0&&(this.cgenEditor.editor.scrollIntoView({line:a,ch:0}),console.log(a),this.cgenEditor.editor.addLineClass(a,"text","cgen-highlight"),window.localStorage.setItem("highlighted-c-line",a.toString()),this.editor.editor.addLineClass(t.line,"text","cgen-highlight"),window.localStorage.setItem("highlighted-v-line",t.line.toString()),this.editor.editor.focus())},100)}),document.addEventListener("keydown",e=>{this.repository instanceof b&&!e.ctrlKey&&!e.metaKey&&this.markCodeAsUnsaved();let n=e.ctrlKey&&e.key==="Enter",r=e.ctrlKey&&e.key==="r",u=e.shiftKey&&e.key==="Enter";n||r||u?(this.run(),e.preventDefault()):e.ctrlKey&&e.key==="l"?(this.formatCode(),e.preventDefault()):e.ctrlKey&&(e.key==="="||e.key==="+")?(this.editor.changeEditorFontSize(1),e.preventDefault()):e.ctrlKey&&e.key==="-"?(this.editor.changeEditorFontSize(-1),e.preventDefault()):e.ctrlKey&&e.key==="i"?(this.helpManager.toggleHelp(),e.preventDefault()):e.ctrlKey&&e.key==="t"?(this.toggleTerminal(),e.preventDefault()):(e.ctrlKey||e.metaKey)&&e.key==="s"?(this.editor.saveCode(),e.preventDefault()):e.key==="Escape"?(this.helpManager.closeHelp(),e.preventDefault()):this.editor.saveCode()})}removeEditorLinesHighlighting(){let e=window.localStorage.getItem("highlighted-c-line");e!=null&&this.cgenEditor.editor.removeLineClass(parseInt(e),"text","cgen-highlight");let t=window.localStorage.getItem("highlighted-v-line");t!=null&&this.editor.editor.removeLineClass(parseInt(t),"text","cgen-highlight")}askLoadUnsavedCode(){let e=this.repository instanceof b,t=window.localStorage.getItem(ue)!=null;window.localStorage.removeItem(ue),e&&t&&confirm("You load the code from the link, but you have previously unsaved changes. Do you want to load it instead of code from link?")&&(this.queryParams.updateURLParameter(b.QUERY_PARAM_NAME,null),window.location.reload())}clearTerminal(){this.terminal.clear()}writeTerminalOutput(e){this.terminal.writeOutput(e)}writeTerminalBuildLog(e){this.terminal.write(e)}openOutputTab(){this.terminal.openOutputTab()}openBuildLogTab(){this.terminal.openBuildLogTab()}toggleTerminal(){this.wrapperElement.classList.contains("closed-terminal")?this.openTerminal():this.closeTerminal()}openTerminal(){this.wrapperElement.classList.remove("closed-terminal")}closeTerminal(){this.wrapperElement.classList.add("closed-terminal"),this.editor.refresh()}markCodeAsUnsaved(){window.localStorage.setItem(ue,"")}};f.getVlangVersion().then(l=>{let e=document.querySelector(".js-version-info");e.innerHTML=l.version});var Re=document.querySelector(".js-playground"),v=new Z(Re);v.registerAction("run",()=>{v.run()});v.registerAction("format",()=>{v.formatCode()});v.registerAction("share",()=>{v.shareCode()});v.registerAction("change-theme",()=>{v.changeTheme()});v.registerRunAsTestConsumer(()=>document.querySelector(".js-run__action").getAttribute("data-type")==="Test");v.setupShortcuts();v.askLoadUnsavedCode();window.onload=()=>{let l=document.querySelector("html");l.style.opacity="1"};})();
//# sourceMappingURL=main.bundle.js.map
