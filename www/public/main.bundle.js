"use strict";(()=>{var ve=Object.defineProperty;var Te=(l,e,t)=>e in l?ve(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var p=(l,e,t)=>(Te(l,typeof e!="symbol"?e+"":e,t),t);var ee=CodeMirror.Pos,Ee=["arrays","benchmark","bitfield","cli","clipboard","compress","context","crypto","darwin","datatypes","dl","dlmalloc","encoding","eventbus","flag","fontstash","gg","gx","hash","io","js","json","log","math","mssql","mysql","net","orm","os","pg","picoev","picohttpparser","rand","readline","regex","runtime","semver","sokol","sqlite","stbi","strconv","strings","sync","szip","term","time","toml","v","vweb","x"],ue=["params","noinit","required","skip","assert_continues","unsafe","manualfree","heap","nonnull","primary","inline","direct_array_access","live","flag","noinline","noreturn","typedef","console","sql","table","deprecated","deprecated_after","export","callconv"],te="[\\w_]+",ce=new RegExp(`^(${ue.join("|")})]$`),de=`(${te}: ${te})`,pe=new RegExp(`^${de}]$`),he=new RegExp(`^(${ue.join("|")}(; ?)?){2,}]$`),me=new RegExp(`^((${de})(; )?){2,}]$`),ge=new RegExp(`^if ${te} \\??]`);function Se(l){let e=[],t=l.getCursor(),n=l.getTokenAt(t),o=new Set;for(let g=0;g<Math.min(l.lineCount(),10);g++){let f=l.getLineTokens(g).filter(b=>b.type!=null);f.length>0&&f[0].string==="import"&&o.add(f[f.length-1].string)}let u=l.getLineTokens(t.line);u.length>0&&u[0].string==="import"&&e.push(u[0]);let a=n.string.length,c=l.getTokenAt(ee(t.line,t.ch-a));return n.string==="."&&e.push(n),c.string==="."&&e.push(c),/\b(?:string|comment)\b/.test(n.type??"")?null:(/^[\w$_]*$/.test(n.string)?n.end>t.ch&&(n.end=t.ch,n.string=n.string.slice(0,t.ch-n.start)):n={start:t.ch,end:t.ch,string:"",state:n.state,type:n.string==="."?"property":null},{list:Le(n,o,e),from:ee(t.line,n.start),to:ee(t.line,n.end)})}function Le(l,e,t){let n=[],o=l.string;function u(a){let c=a.text;if(!c.startsWith(o))return;n.find(f=>f.text===c)||n.push(a)}if(t&&t.length){let a=t.pop();if(a!==void 0){if(a.type==="keyword"&&a.string==="import")return Ee.forEach(c=>{u({text:c,displayText:c,className:"completion-module"})}),n;if(a.string===".")return[]}}return e.forEach(a=>{u({text:a,displayText:a,className:"completion-module"})}),$.forEach(a=>{u({text:a+" ",displayText:a,className:"completion-keyword"})}),ne.forEach(a=>{u({text:a+" ",displayText:a,className:"completion-keyword"})}),ie.forEach(a=>{u({text:a,displayText:a,className:"completion-atom"})}),re.forEach(a=>{u({text:a,displayText:a,className:"completion-type"})}),n}var xe=l=>Se(l);CodeMirror.registerHelper("hint","v",xe);var D=class{constructor(e,t,n,o,u,a=new Set){this.indentation=e;this.column=t;this.type=n;this.align=o;this.prev=u;this.knownImports=a}insideString=!1;stringQuote=null;expectedImportName=!1},$=new Set(["as","asm","assert","atomic","break","const","continue","defer","else","enum","fn","for","go","goto","if","import","in","interface","is","isreftype","lock","match","module","mut","none","or","pub","return","rlock","select","shared","sizeof","static","struct","spawn","type","typeof","union","unsafe","volatile","__global","__offsetof"]),ne=new Set(["sql","chan","thread"]),_e=new Set(["#flag","#include","#pkgconfig"]),ie=new Set(["true","false","nil","print","println","exit","panic","error","dump"]),re=new Set(["bool","string","i8","i16","int","i32","i64","i128","u8","u16","u32","u64","u128","rune","f32","f64","isize","usize","voidptr","any"]);CodeMirror.defineMode("v",l=>{let e=l.indentUnit??0,t=/[+\-*&^%:=<>!?|\/]/,n=null;function o(i){return i.eatWhile(/[\w$_\xa1-\uffff]/),i.current()}function u(i,r){let s=i.next();if(s===null)return null;if(r.context.insideString&&s==="}")return i.eat("}"),r.tokenize=m(r.context.stringQuote),"end-interpolation";if(s==='"'||s==="'"||s==="`")return r.tokenize=m(s),r.tokenize(i,r);if((s==="r"||s==="c")&&(i.peek()=='"'||i.peek()=="'")){let _=i.next();return _===null||(r.tokenize=x(_)),"string"}if(s==="."&&!i.match(/^[0-9]+([eE][\-+]?[0-9]+)?/))return"operator";if(s==="["&&(i.match(ce)||i.match(pe)||i.match(he)||i.match(me)||i.match(ge)))return"attribute";if(/[\d.]/.test(s))return s==="0"?i.match(/^[xX][0-9a-fA-F_]+/)||i.match(/^o[0-7_]+/)||i.match(/^b[0-1_]+/):i.match(/^[0-9_]*\.?[0-9_]*([eE][\-+]?[0-9_]+)?/),"number";if(/[\[\]{}(),;:.]/.test(s))return n=s,null;if(s==="/"){if(i.eat("*"))return r.tokenize=T,T(i,r);if(i.eat("/"))return i.skipToEnd(),"comment"}if(t.test(s))return i.eatWhile(t),"operator";if(s==="@")return o(i),"at-identifier";if(s==="$"){let _=o(i).slice(1);return $.has(_)?"keyword":"compile-time-identifier"}i.backUp(2);let h=i.next()===".";i.next();let d=o(i);if(d==="import"&&(r.context.expectedImportName=!0),$.has(d)||ne.has(d))return"keyword";if(ie.has(d))return"atom";if(_e.has(d))return"hash-directive";if(!h&&re.has(d))return"builtin";if(d.length>0&&d[0].toUpperCase()===d[0])return"type";let E=i.peek();if(E==="("||E==="<")return"function";if(E==="["){i.next();let _=i.next();if(i.backUp(2),_!=null&&_.match(/[A-Z]/i))return"function"}return r.context.expectedImportName&&i.peek()!=="."?(r.context.expectedImportName=!1,r.context.knownImports===void 0&&(r.context.knownImports=new Set),r.context.knownImports.add(d),"import-name"):h?"property":r.context.knownImports.has(d)&&i.peek()=="."?"import-name":"variable"}function a(i,r){return i.match("}")?(r.tokenize=m(r.context.stringQuote),"end-interpolation"):(r.tokenize=u,r.tokenize(i,r))}function c(i,r){let s=i.next();if(s===" ")return r.tokenize=m(r.context.stringQuote),r.tokenize(i,r);if(s===".")return"operator";let h=o(i);if(h[0].toLowerCase()===h[0].toUpperCase())return r.tokenize=m(r.context.stringQuote),r.tokenize(i,r);let d=i.next();return i.backUp(1),d==="."?r.tokenize=c:r.tokenize=m(r.context.stringQuote),"variable"}function g(i,r){let s=i.next();return s==="$"&&i.eat("{")?(r.tokenize=a,"start-interpolation"):s==="$"?(r.tokenize=c,"start-interpolation"):"string"}function f(i,r){return i.next()==="\\"?(i.next(),r.tokenize=m(r.context.stringQuote),"valid-escape"):"string"}function b(i){return i==="n"||i==="t"||i==="r"||i==="\\"||i==='"'||i==="'"||i==="0"}function m(i){return function(r,s){s.context.insideString=!0,s.context.stringQuote=i;let h="",d=!1,E=!1;for(;(h=r.next())!=null;){if(h===i&&!d){E=!0;break}if(h==="$"&&!d&&r.eat("{"))return s.tokenize=g,r.backUp(2),"string";if(h==="$"&&!d)return s.tokenize=g,r.backUp(1),"string";if(d&&b(h))return r.backUp(2),s.tokenize=f,"string";d=!d&&h==="\\"}return(E||d)&&(s.tokenize=u),s.context.insideString=!1,s.context.stringQuote=null,"string"}}function x(i){return function(r,s){s.context.insideString=!0,s.context.stringQuote=i;let h="",d=!1,E=!1;for(;(h=r.next())!=null;){if(h===i&&!d){E=!0;break}d=!d&&h==="\\"}return(E||d)&&(s.tokenize=u),s.context.insideString=!1,s.context.stringQuote=null,"string"}}function T(i,r){let s=!1,h;for(;h=i.next();){if(h==="/"&&s){r.tokenize=u;break}s=h==="*"}return"comment"}function P(i,r,s){return i.context=new D(i.indention,r,s,null,i.context,i.context.knownImports)}function z(i){if(!i.context.prev)return;let r=i.context.type;return(r===")"||r==="]"||r==="}")&&(i.indention=i.context.indentation),i.context=i.context.prev,i.context}return{startState:function(){return{tokenize:null,context:new D(0,0,"top",!1),indention:0,startOfLine:!0}},token:function(i,r){let s=r.context;if(i.sol()&&(s.align==null&&(s.align=!1),r.indention=i.indentation(),r.startOfLine=!0),i.eatSpace())return null;n=null;let h=(r.tokenize||u)(i,r);return h==="comment"||(s.align==null&&(s.align=!0),n==="{"?P(r,i.column(),"}"):n==="["?P(r,i.column(),"]"):n==="("?P(r,i.column(),")"):(n==="}"&&s.type==="}"||n===s.type)&&z(r),r.startOfLine=!1),h},indent:function(i,r){if(i.tokenize!==u&&i.tokenize!=null||i.context.type=="top")return 0;let s=i.context,d=r.charAt(0)===s.type;return s.align?s.column+(d?0:1):s.indentation+(d?0:e)},electricChars:"{}):",closeBrackets:"()[]{}''\"\"``",fold:"brace",blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:"//"}});CodeMirror.defineMIME("text/x-v","v");var Q=class{hash;constructor(e){this.hash=e}saveCode(e){}getCode(e){return this.getSharedCode(e)}getSharedCode(e){let t=new FormData;t.append("hash",this.hash),fetch("/query",{method:"post",body:t}).then(n=>n.json()).then(n=>n).then(n=>{if(console.log(n),!n.found){e({code:Q.CODE_NOT_FOUND});return}if(n.error!=""){console.error(n.error),e({code:Q.CODE_NOT_FOUND});return}e(n.snippet)}).catch(n=>{console.log(n)})}},y=Q;p(y,"QUERY_PARAM_NAME","query"),p(y,"CODE_NOT_FOUND","Not found.");var R=class{constructor(e){this.text=e}saveCode(e){}getCode(e){e({code:this.text})}};var q=class{saveCode(e){window.localStorage.setItem(q.LOCAL_STORAGE_KEY,e)}getCode(e){let t=window.localStorage.getItem(q.LOCAL_STORAGE_KEY);if(t==null){e({code:q.WELCOME_CODE});return}e({code:t})}},v=q;p(v,"LOCAL_STORAGE_KEY","code"),p(v,"WELCOME_CODE",`
// Welcome to the V Playground!
// Here you can edit, run, and share V code.
// Let's start with a simple "Hello, Playground!" example:
println('Hello, Playground!')

// To run the code, click the "Run" button or just press Ctrl + R.
// To format the code, click the "Format" button or just press Ctrl + L.

// More examples are available in top dropdown list.
// You can find Help for shortcuts in the bottom right corner or just press Ctrl + I.
// See also change theme button in the top right corner.
// If you want to learn more about V, visit https://docs.vlang.foundation/ and https://learn.vlang.foundation/
// Join us on Discord: https://discord.gg/vlang
// Enjoy!
`.trimStart());var A=class{constructor(e){this.text=e;this.decodedCode=atob(e)}decodedCode;saveCode(e){}getCode(e){e({code:this.decodedCode})}};p(A,"QUERY_PARAM_NAME","base64");var M=class{constructor(e){this.id=e}saveCode(e){}getCode(e){fetch("https://api.github.com/gists/"+this.id,{method:"get",headers:{"Content-Type":"application/json"}}).then(t=>t.json()).then(t=>{let n=t.files,o=Object.keys(n)[0],a=n[o].raw_url;fetch(a,{method:"get",headers:{"Content-Type":"text/plain"}}).then(c=>c.text()).then(c=>{e({code:c})}).catch(c=>{console.log(c)})}).catch(t=>{console.log(t)})}};p(M,"QUERY_PARAM_NAME","gist");var G=class{static selectRepository(e,t){if(t!==void 0&&t.codeHash!==null&&t.codeHash!==void 0)return new y(t.codeHash);if(t!==void 0&&t.code!==null&&t.code!==void 0)return new R(t.code);if(t!==void 0&&t.embed!==null&&t.embed!==void 0&&t.embed)return new R("");let n=new v,o=e.getURLParameter(y.QUERY_PARAM_NAME);if(o!=null)return new y(o);let u=e.getURLParameter(A.QUERY_PARAM_NAME);if(u!=null)return new A(u);let a=e.getURLParameter(M.QUERY_PARAM_NAME);return a!=null?new M(a):n}};var O=class{params;constructor(e){this.params=new URLSearchParams(e)}updateURLParameter(e,t){let n=O.updateURLParameter(window.location.href,e,t);window.history.replaceState({},"",n)}getURLParameter(e){return this.params.get(e)}static updateURLParameter(e,t,n){let o=new URL(e);return n?o.searchParams.set(t,n):o.searchParams.delete(t),o.toString()}};var oe=class{containingElement;element;helpOverlay;showHelpButton;closeHelpButton;constructor(e){this.containingElement=e,this.element=e.getElementsByClassName("js-help-wrapper")[0],!(this.element===null||this.element===void 0)&&(this.helpOverlay=this.element.querySelector(".js-help-overlay"),this.showHelpButton=this.element.querySelector(".js-show-help"),this.closeHelpButton=this.element.querySelector(".js-close-help"),this.mount())}mount(){this.showHelpButton!==void 0&&this.showHelpButton.addEventListener("click",()=>{this.toggleHelp()}),this.helpOverlay!==void 0&&this.helpOverlay.addEventListener("click",()=>{this.toggleHelp()}),this.closeHelpButton!==void 0&&this.closeHelpButton.addEventListener("click",()=>{this.toggleHelp()}),oe.isMac||document.querySelectorAll(".js-shortcut kbd.ctrl").forEach(function(t){t.innerText="Ctrl"})}closeHelp(){this.helpOverlay.classList.contains("opened")&&this.toggleHelp()}toggleHelp(){this.containingElement.getElementsByClassName("js-help")[0].classList.toggle("opened"),this.helpOverlay.classList.toggle("opened")}},B=oe;p(B,"isMac",navigator.platform.toUpperCase().indexOf("MAC")>=0);var Y=(n=>(n.Run="Run",n.Test="Test",n.Cgen="Cgen",n))(Y||{});function fe(l){switch(l){case"Run":return 0;case"Test":return 1;case"Cgen":return 2;default:throw new Error(`Unknown run configuration type: ${l}`)}}function ye(l){switch(l){case 0:return"Run";case 1:return"Test";case 2:return"Cgen";default:return"Run"}}function se(l){switch(l){case"Run":return"Run";case"Test":return"Test";case"Cgen":return"Cgen";default:throw new Error(`Unknown run configuration type: ${l}`)}}var C=class{queryParams;currentConfiguration="Run";fromQueryParam=!1;runButton=document.querySelector(".js-run__action");runButtonLabel=document.querySelector(".js-run__action .label");openRunButton=document.querySelector(".js-open-run-select");configurationsList=document.querySelector(".js-run-configurations-list");configurationsOverlay=document.querySelector(".js-run-configurations-list-overlay");configurations=document.querySelectorAll(".js-configuration");buildArgumentsInput=document.querySelector(".js-build-arguments-input");runArgumentsInput=document.querySelector(".js-run-arguments-input");onChange=()=>{};onSelect=()=>{};constructor(e){this.queryParams=e,this.mount()}get configuration(){return this.currentConfiguration}registerOnChange(e){this.onChange=e}registerOnSelect(e){this.onSelect=e}toggleConfigurationsList(){this.configurationsList.classList.toggle("hidden"),this.configurationsOverlay.classList.toggle("opened")}closeConfigurationsList(){this.configurationsList.classList.add("hidden"),this.configurationsOverlay.classList.remove("opened")}setupConfiguration(){let e=this.queryParams.getURLParameter(C.QUERY_PARAM_NAME);if(e!=null){this.fromQueryParam=!0,this.useConfiguration(se(e));return}let t=window.localStorage.getItem(C.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY);t!=null&&(this.buildArgumentsInput.value=t);let n=window.localStorage.getItem(C.LOCAL_STORAGE_RUN_ARGUMENTS_KEY);n!=null&&(this.runArgumentsInput.value=n);let o=window.localStorage.getItem(C.LOCAL_STORAGE_KEY);if(o!=null){this.useConfiguration(se(o));return}this.useConfiguration("Run")}useConfiguration(e){this.currentConfiguration=e,this.onChange(e);let t=Y[e];this.runButton.setAttribute("data-type",t),this.runButtonLabel.textContent=t,e=="Cgen"&&(this.runButtonLabel.textContent="Show generated C code"),this.fromQueryParam||(window.localStorage.setItem(C.LOCAL_STORAGE_KEY,t),window.localStorage.setItem(C.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY,this.buildArgumentsInput.value),window.localStorage.setItem(C.LOCAL_STORAGE_RUN_ARGUMENTS_KEY,this.runArgumentsInput.value)),this.fromQueryParam&&this.queryParams.updateURLParameter(C.QUERY_PARAM_NAME,t)}get buildArguments(){return this.buildArgumentsInput.value.split(" ").filter(e=>e.length>0)}get runArguments(){return this.runArgumentsInput.value.split(" ").filter(e=>e.length>0)}setBuildArguments(e){this.buildArgumentsInput.value=e}setRunArguments(e){this.runArgumentsInput.value=e}mount(){this.openRunButton.addEventListener("click",()=>{this.toggleConfigurationsList()}),this.buildArgumentsInput.addEventListener("input",()=>{window.localStorage.setItem(C.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY,this.buildArgumentsInput.value)}),this.runArgumentsInput.addEventListener("input",()=>{window.localStorage.setItem(C.LOCAL_STORAGE_RUN_ARGUMENTS_KEY,this.runArgumentsInput.value)}),this.configurationsOverlay.addEventListener("click",()=>{this.toggleConfigurationsList()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&this.closeConfigurationsList()}),this.configurations.forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-type")??"Run",n=se(t);this.useConfiguration(n),this.onSelect(n)})})}},S=C;p(S,"QUERY_PARAM_NAME","runConfiguration"),p(S,"LOCAL_STORAGE_KEY","run-configuration"),p(S,"LOCAL_STORAGE_BUILD_ARGUMENTS_KEY","build-arguments"),p(S,"LOCAL_STORAGE_RUN_ARGUMENTS_KEY","run-arguments");var K=[{name:"Hello, Playground!",code:v.WELCOME_CODE,runConfiguration:"Run"},{name:"String interpolation",code:`
// In V you can define array of string with the following syntax:
areas := ['game', 'web', 'tools', 'science', 'systems', 'embedded', 'drivers', 'GUI', 'mobile']

for area in areas {
    // V uses the \${} notation to interpolate a variable
    // or expression right on the string.
    // Learn more about string interpolation in the documentation:
    // https://docs.vlang.foundation/concepts/types/strings.html#string-interpolation
    println('Hello, \${area} developers!')
}
        `,runConfiguration:"Run"},{name:"Fibonacci",code:`
// As in other languages, you can define functions in V.
// Learn more about functions in the documentation:
// https://docs.vlang.foundation/concepts/functions/overview.html
fn fib(n int) u64 {
    // To define a array of specific type, use the following syntax.
    // Here we define an array of int with the length of n + 2.
    // Learn more about arrays in the documentation:
    // https://docs.vlang.foundation/concepts/types/arrays.html
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
// https://docs.vlang.foundation/getting-started/hello-world.html
fn main() {
    for i in 0 .. 30 {
        println(fib(i))
    }
}
`,runConfiguration:"Run"},{name:"Structs and embedded structs",code:`
// Structs are a way to define a new type with a set of fields.
// You can define a struct with the following syntax:
// Learn more about structs in the documentation:
// https://docs.vlang.foundation/concepts/structs/overview.html
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
// https://docs.vlang.foundation/concepts/sum-types.html
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
    // https://docs.vlang.foundation/concepts/control-flow/conditions.html#match-expression
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
// https://docs.vlang.foundation/concepts/generics.html
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
// https://docs.vlang.foundation/concepts/concurrency.html
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
// https://docs.vlang.foundation/concepts/concurrency.html#channels
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
    // https://docs.vlang.foundation/concepts/concurrency.html#channel-select
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
// V very modular and has a lot of built-in modules.
// In this example we will use the json module to encode and decode JSON data.
// If you want to learn more about modules, visit
// https://docs.vlang.foundation/concepts/modules/overview.html
import json

// Since V is statically typed, we need to define a struct to hold the data.
// Learn more about structs in the documentation:
// https://docs.vlang.foundation/concepts/structs/overview.html
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
    // https://docs.vlang.foundation/concepts/working-with-json.html
    mut users := json.decode([]User, json_data) or {
        // But if the json data is invalid, it will return an error.
        // You can handle it with the 'or {}' syntax as in this example.
        //
        // err is a special variable that contains the error message.
        //
        // Learn more about error handling in documentation:
        // https://docs.vlang.foundation/concepts/error-handling.html
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
// https://docs.vlang.foundation/concepts/compile-time/reflection.html

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
// https://docs.vlang.foundation/concepts/functions/anonymous-and-higher-order-functions.html

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
// https://docs.vlang.foundation/concepts/testing.html
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
`,l)),Ce=`
// Oops, the shared link is broken.
// Please recheck the link and try again.
println('Hello, link 404!')
`.trimStart();var ae=class{selectElement;onSelectHandler=null;constructor(){this.selectElement=document.querySelector(".js-examples__select")}registerOnSelectHandler(e){this.onSelectHandler=e}mount(){if(this.selectElement===null||this.selectElement===void 0)return;let e=document.querySelector(".dropdown__list"),t=this.selectElement.querySelector(".dropdown__button");if(e!==null&&t!==null){K.forEach((g,f)=>{e.innerHTML+=ae.exampleElementListTemplate(g.name,f)});let c=t.querySelector("span");c.innerText=K[0].name}let n=e.querySelectorAll(".dropdown__list-item");n.forEach(c=>{c.addEventListener("click",()=>{let g=c.innerText,f=K.find(b=>b.name===g);this.onSelectHandler!==null&&f&&this.onSelectHandler(f)})});let o=this.selectElement.querySelector(".dropdown__button"),u=this.selectElement.querySelector(".dropdown__input_hidden"),a=document.querySelector(".dropdown__list");o.addEventListener("click",function(){a.classList.toggle("dropdown__list_visible"),this.classList.toggle("dropdown__button_active")}),n.forEach(function(c){c.addEventListener("click",function(g){n.forEach(function(m){m.classList.remove("dropdown__list-item_active")}),g.target.classList.add("dropdown__list-item_active");let b=o.querySelector("span");b.innerText=this.innerText,u.value=this.dataset.value??"",a.classList.remove("dropdown__list_visible")})}),document.addEventListener("click",function(c){c.target!==o&&!o.contains(c.target)&&(o.classList.remove("dropdown__button_active"),a.classList.remove("dropdown__list_visible"))}),document.addEventListener("keydown",function(c){(c.key==="Tab"||c.key==="Escape")&&(o.classList.remove("dropdown__button_active"),a.classList.remove("dropdown__list_visible"))})}},j=ae;p(j,"exampleElementListTemplate",function(e,t){let n="";return t===0&&(n="dropdown__list-item_active"),`
<li class="dropdown__list-item ${n}" data-value="${e}">${e}</li>
`});function be(l){let e=document.createElement("textarea");e.value=l,e.style.top="0",e.style.left="0",e.style.position="fixed",document.body.appendChild(e),e.focus(),e.select();try{let n=document.execCommand("copy")?"successful":"unsuccessful";console.log("Fallback: Copying text command was "+n)}catch(t){console.log("Fallback: Oops, unable to copy",t)}document.body.removeChild(e)}function we(l,e){if(!navigator.clipboard){be(l);return}navigator.clipboard.writeText(l).then(()=>{console.log("Async: Copying to clipboard was successful!"),e()},t=>{be(l),console.log("Async: Could not copy text: ",t,"fallback to old method")})}var V=class{constructor(e,t,n,o){this.code=e;this.buildArguments=t;this.runArguments=n;this.runConfiguration=o}toFormData(){let e=new FormData;return e.append("code",this.code),e.append("build-arguments",this.buildArguments.join(" ")),e.append("run-arguments",this.runArguments.join(" ")),e.append("run-configuration",this.runConfiguration.toString()),e}},L=class{static runCode(e){return fetch("/run",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error("Can't run code");return t}).then(t=>t.json()).then(t=>t)}static runTest(e){return fetch("/run_test",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error("Can't run test");return t}).then(t=>t.json()).then(t=>t)}static retrieveCgenCode(e){return fetch("/cgen",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error("Can't compile and get C code");return t}).then(t=>t.json()).then(t=>t)}static formatCode(e){return fetch("/format",{method:"post",body:e.toFormData()}).then(t=>t.json()).then(t=>t)}static shareCode(e){return fetch("/share",{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error("Can't share code");return t}).then(t=>t.json()).then(t=>t)}};var W=class{constructor(e,t,n,o,u,a){this.terminal=o;let c={mode:a,lineNumbers:!0,matchBrackets:!0,extraKeys:{"Ctrl-Space":"autocomplete","Ctrl-/":"toggleComment"},readOnly:u,indentWithTabs:!0,indentUnit:4,autoCloseBrackets:!0,showHint:!0,lint:{async:!0,lintOnChange:!0,delay:20},toggleLineComment:{indent:!0,padding:" "},theme:"dark"};this.wrapperElement=t,this.textAreaElement=t.querySelector(`textarea.${e}`),this.editor=CodeMirror.fromTextArea(this.textAreaElement,c),this.repository=n,this.initFont()}wrapperElement;textAreaElement;repository;editor;initFont(){let e=window.localStorage.getItem(W.FONT_LOCAL_STORAGE_KEY);e!==null&&this.setEditorFontSize(e)}changeEditorFontSize(e){let t=document.getElementsByClassName("CodeMirror")[0],n=window.getComputedStyle(t,null).getPropertyValue("font-size");if(n){let o=parseInt(n)+e;t.style.fontSize=o+"px",window.localStorage.setItem(W.FONT_LOCAL_STORAGE_KEY,o.toString()),this.editor.refresh()}}setEditorFontSize(e){let t=document.getElementsByClassName("CodeMirror")[0];t.style.fontSize=e+"px",this.refresh()}setCode(e,t=!1){let n=this.editor.getCursor();this.editor.setValue(e),this.repository.saveCode(e),t&&this.editor.setCursor(n)}getCode(){return this.editor.getValue()}saveCode(){this.repository instanceof y&&(this.repository=new v),this.repository.saveCode(this.getCode())}getRunnableCodeSnippet(e){return new V(this.getCode(),e.buildArguments,e.runArguments,fe(e.configuration))}clear(){this.setCode("")}setTheme(e){this.editor.setOption("theme",e.name())}showCompletion(){this.editor.execCommand("autocomplete")}refresh(){this.editor.refresh()}hide(){let e=this.textAreaElement.parentElement;console.log(e),e!==void 0&&(e.style.display="none"),e.parentElement?.classList?.remove("two-editors")}show(){let e=this.textAreaElement.parentElement;console.log(e),e!==void 0&&(e.style.display="grid"),e.parentElement?.classList?.add("two-editors")}},I=W;p(I,"FONT_LOCAL_STORAGE_KEY","editor-font-size");var k=class{name(){return"dark"}};var H=class{name(){return"light"}};var N=class{themes=[new k,new H];currentTheme=null;onChange=[];queryParams;changeThemeButtons=null;predefinedTheme=null;fromQueryParam=!1;constructor(e,t=null){this.queryParams=e,this.predefinedTheme=t,this.changeThemeButtons=document.querySelectorAll(".js-change-theme__action")}registerOnChange(e){this.onChange.push(e)}loadTheme(){let e=this.queryParams.getURLParameter(N.QUERY_PARAM_NAME);if(e!=null){this.fromQueryParam=!0;let u=this.findTheme(e);this.turnTheme(u);return}let t=window.localStorage.getItem(N.LOCAL_STORAGE_KEY);if(t!=null){let u=this.findTheme(t);this.turnTheme(u);return}if(this.predefinedTheme!==null&&this.predefinedTheme!==void 0){this.turnTheme(this.predefinedTheme);return}let o=window.matchMedia("(prefers-color-scheme: dark)").matches?new k:new H;this.turnTheme(o)}findTheme(e){let t=this.themes.filter(o=>o.name()===e),n=t[0];return t.length==0&&(n=new k),n}turnTheme(e){this.currentTheme=e,this.onChange.forEach(n=>n(e)),this.changeThemeButtons!==null&&this.changeThemeButtons.forEach(n=>{let o=n.querySelector(".sun"),u=n.querySelector(".moon");o!==null&&u!==null&&(e.name()==="dark"?(o.style.display="block",u.style.display="none"):(o.style.display="none",u.style.display="block"))}),document.querySelector("html").setAttribute("data-theme",e.name()),this.fromQueryParam||window.localStorage.setItem(N.LOCAL_STORAGE_KEY,e.name()),this.fromQueryParam&&this.queryParams.updateURLParameter(N.QUERY_PARAM_NAME,e.name())}turnDarkTheme(){this.turnTheme(new k)}turnLightTheme(){this.turnTheme(new H)}toggleTheme(){this.currentTheme&&(this.currentTheme.name()==="light"?this.turnDarkTheme():this.turnLightTheme())}},U=N;p(U,"QUERY_PARAM_NAME","theme"),p(U,"LOCAL_STORAGE_KEY","theme");var J=class{element;onClose=null;onWrite=null;filters=[];constructor(e){this.element=e,this.attachResizeHandler(e)}registerCloseHandler(e){this.onClose=e}registerWriteHandler(e){this.onWrite=e}registerFilter(e){this.filters.push(e)}write(e){let t=e.split(`
`),n=this.getTerminalOutputElement(),u=t.filter(a=>this.filters.every(c=>c(a))).join(`
`);n.innerHTML+=u+`
`,this.onWrite!==null&&this.onWrite(e)}clear(){this.getTerminalOutputElement().innerHTML=""}mount(){let e=this.element.querySelector(".js-terminal__close-buttom");e==null||this.onClose===null||e.addEventListener("click",this.onClose)}getTerminalOutputElement(){return this.element.querySelector(".js-terminal__output")}attachResizeHandler(e){let t=e.querySelector(".header");if(!t)return;let n=!1;t.addEventListener("mousedown",()=>{n=!0,document.body.classList.add("dragging")}),t.addEventListener("touchstart",()=>{n=!0,document.body.classList.add("dragging")}),t.addEventListener("touchmove",o=>{n&&(e.style.height=`${document.body.clientHeight-o.touches[0].clientY+t.clientHeight/2}px`,o.preventDefault())}),document.addEventListener("mousemove",o=>{n&&(e.style.height=`${document.body.clientHeight-o.clientY+t.clientHeight/2}px`)}),document.addEventListener("mouseup",()=>{n=!1,document.body.classList.remove("dragging")}),document.addEventListener("touchend",()=>{n=!1,document.body.classList.remove("dragging")})}};var X=class{layerElement;constructor(){this.layerElement=document.querySelector(".js-tips-layer"),this.mount()}mount(){document.querySelector(".js-tips-layer__close").addEventListener("click",()=>{this.hide()}),document.addEventListener("keydown",t=>{this.isShown()&&t.key==="Escape"&&this.hide()})}isShown(){return this.layerElement.classList.contains("open")}show(){window.localStorage.getItem(X.DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY)!=="true"&&(this.layerElement.classList.add("open"),window.localStorage.setItem(X.DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY,"true"))}hide(){this.layerElement.classList.remove("open")}},F=X;p(F,"DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY","no-more-tips");var le="unsaved",Z=class{runAsTestConsumer=()=>!1;wrapperElement;queryParams;repository;editor;cgenEditor;themeManager;examplesManager;helpManager;runConfigurationManager;tipsManager;terminal;cgenMode=!1;constructor(e){this.wrapperElement=e,this.queryParams=new O(window.location.search),this.repository=G.selectRepository(this.queryParams);let t=e.querySelector(".js-terminal");if(t==null)throw new Error("Terminal not found, please check that terminal inside editor element");this.terminal=new J(t),this.editor=new I("main",e,this.repository,this.terminal,!1,"v"),this.cgenEditor=new I("cgen",e,new R(""),this.terminal,!0,"text/x-csrc"),this.cgenEditor.hide(),this.repository.getCode(n=>{if(n.code===y.CODE_NOT_FOUND){this.editor.setCode(Ce),this.terminal.write("Code for shared link not found.");return}if(n.runConfiguration!==void 0){let o=ye(n.runConfiguration);this.runConfigurationManager.useConfiguration(o)}n.buildArguments!==void 0&&this.runConfigurationManager.setBuildArguments(n.buildArguments),n.runArguments!==void 0&&this.runConfigurationManager.setRunArguments(n.runArguments),this.editor.setCode(n.code)}),this.themeManager=new U(this.queryParams),this.themeManager.registerOnChange(n=>{this.editor.setTheme(n),this.cgenEditor.setTheme(n)}),this.themeManager.loadTheme(),this.examplesManager=new j,this.examplesManager.registerOnSelectHandler(n=>{if(this.editor.setCode(n.code),this.runConfigurationManager.configuration==="Cgen"){this.cgenEditor.clear(),this.cgenEditor.setCode("Rerun Cgen to see C code");return}this.runConfigurationManager.useConfiguration(n.runConfiguration)}),this.examplesManager.mount(),this.helpManager=new B(e),this.runConfigurationManager=new S(this.queryParams),this.runConfigurationManager.registerOnChange(()=>{}),this.runConfigurationManager.registerOnSelect(n=>{this.runConfigurationManager.toggleConfigurationsList(),n==="Cgen"&&this.cgenEditor.show(),this.run()}),this.runConfigurationManager.setupConfiguration(),this.tipsManager=new F,this.registerAction("close-cgen",()=>{this.cgenEditor.hide(),this.disableCgenMode()}),this.terminal.registerCloseHandler(()=>{this.closeTerminal()}),this.terminal.registerWriteHandler(n=>{this.openTerminal()}),this.terminal.registerFilter(n=>!n.trim().startsWith("Failed command")),this.terminal.mount(),this.closeTerminal()}enableCgenMode(){this.tipsManager.show(),this.wrapperElement.querySelectorAll(".playground__editor").forEach(e=>{e.classList.add("with-tabs")}),this.cgenMode=!0}disableCgenMode(){this.wrapperElement.querySelectorAll(".playground__editor").forEach(e=>{e.classList.remove("with-tabs")}),this.removeEditorLinesHighlighting(),this.cgenMode=!1}registerRunAsTestConsumer(e){this.runAsTestConsumer=e}registerAction(e,t){let n=document.querySelectorAll(`.js-${e}__action`);if(n.length==0)throw new Error(`Can't find any action button with class js-${e}__action`);n.forEach(o=>{o.addEventListener("click",t)})}getRunnableCodeSnippet(){return this.editor.getRunnableCodeSnippet(this.runConfigurationManager)}run(){let e=this.runConfigurationManager.configuration;e==="Run"?this.runCode():e==="Test"?this.runTest():e==="Cgen"&&(this.enableCgenMode(),this.retrieveCgenCode())}runCode(){this.clearTerminal(),this.writeToTerminal("Running code...");let e=this.getRunnableCodeSnippet();L.runCode(e).then(t=>{if(t.error!=""){this.writeToTerminal(t.error),this.writeToTerminal("Can't run code. Please try again.");return}this.clearTerminal(),this.writeToTerminal(t.output)}).catch(t=>{console.log(t),this.writeToTerminal("Can't run code. Please try again.")})}runTest(){this.clearTerminal(),this.writeToTerminal("Running tests...");let e=this.getRunnableCodeSnippet();L.runTest(e).then(t=>{if(t.error!=""){this.writeToTerminal(t.error),this.writeToTerminal("Can't run tests. Please try again.");return}this.clearTerminal(),this.writeToTerminal(t.output)}).catch(t=>{console.log(t),this.writeToTerminal("Can't run tests. Please try again.")})}retrieveCgenCode(){this.clearTerminal(),this.writeToTerminal("Running retrieving of generated C code...");let e=this.getRunnableCodeSnippet();L.retrieveCgenCode(e).then(t=>{if(t.error!=""){this.clearTerminal(),this.writeToTerminal(t.error);return}let o=t.cgenCode.split(`
`),u=[],a={};for(let m=0;m<o.length-1;m++){let x=o[m],T=o[m+1];if(!T.startsWith("#line")){if(x.startsWith("#line")){if(T.length!=0){let P=x.split(" "),z=parseInt(P[1]);a[z]=T}continue}u.push(x)}}let c=u.join(`
`),g={};for(let m in a){let x=a[m],T=u.indexOf(x);T!=-1&&(g[m]=T)}let f=u.find(m=>m.startsWith("void main__main(void) {"))||"",b=u.indexOf(f);b==-1&&(b=0),console.log(g),window.localStorage.setItem("cgen-mapping",JSON.stringify(g)),this.clearTerminal(),this.cgenEditor.show(),this.cgenEditor.setCode(c),this.cgenEditor.editor.scrollIntoView({line:b,ch:0}),this.closeTerminal()}).catch(t=>{console.log(t),this.writeToTerminal("Can't compile and get C code. Please try again.")})}formatCode(){this.clearTerminal();let e=this.getRunnableCodeSnippet();L.formatCode(e).then(t=>{if(t.error!=""){this.clearTerminal(),this.writeToTerminal(t.error);return}this.editor.setCode(t.output,!0)}).catch(t=>{console.log(t),this.writeToTerminal("Can't format code. Please try again.")})}shareCode(){this.clearTerminal();let e=this.getRunnableCodeSnippet();console.log(e),L.shareCode(e).then(t=>{if(t.error!=""){this.writeToTerminal("Can't share code. Please try again."),this.writeToTerminal(t.error);return}this.writeToTerminal("Code shared successfully!");let n=this.buildShareLink(t);this.writeToTerminal("Share link: "+n),we(n,()=>{this.writeToTerminal(`
Link copied to clipboard.`)})}).catch(t=>{console.log(t),this.writeToTerminal("Can't share code. Please try again.")})}buildShareLink(e){return`https://vlngf.co/p/${e.hash}`}changeTheme(){this.themeManager.toggleTheme()}setupShortcuts(){this.editor.editor.on("keypress",(e,t)=>{!e.state.completionActive&&t.key.length===1&&t.key.match(/[a-z0-9]/i)&&this.editor.showCompletion()}),this.editor.editor.on("mousedown",e=>{this.cgenMode&&setTimeout(()=>{this.removeEditorLinesHighlighting();let t=e.getCursor(),n=t.line+1,o=window.localStorage.getItem("cgen-mapping")??"{}",a=JSON.parse(o)[n];a!==void 0&&(this.cgenEditor.editor.scrollIntoView({line:a,ch:0}),console.log(a),this.cgenEditor.editor.addLineClass(a,"text","cgen-highlight"),window.localStorage.setItem("highlighted-c-line",a.toString()),this.editor.editor.addLineClass(t.line,"text","cgen-highlight"),window.localStorage.setItem("highlighted-v-line",t.line.toString()),this.editor.editor.focus())},100)}),document.addEventListener("keydown",e=>{this.repository instanceof y&&!e.ctrlKey&&!e.metaKey&&this.markCodeAsUnsaved();let n=e.ctrlKey&&e.key==="Enter",o=e.ctrlKey&&e.key==="r",u=e.shiftKey&&e.key==="Enter";n||o||u?(this.run(),e.preventDefault()):e.ctrlKey&&e.key==="l"?(this.formatCode(),e.preventDefault()):e.ctrlKey&&e.key==="="?(this.editor.changeEditorFontSize(1),e.preventDefault()):e.ctrlKey&&e.key==="-"?(this.editor.changeEditorFontSize(-1),e.preventDefault()):e.ctrlKey&&e.key==="i"?(this.helpManager.toggleHelp(),e.preventDefault()):(e.ctrlKey||e.metaKey)&&e.key==="s"?(this.editor.saveCode(),e.preventDefault()):e.key==="Escape"?(this.helpManager.closeHelp(),e.preventDefault()):this.editor.saveCode()})}removeEditorLinesHighlighting(){let e=window.localStorage.getItem("highlighted-c-line");e!=null&&this.cgenEditor.editor.removeLineClass(parseInt(e),"text","cgen-highlight");let t=window.localStorage.getItem("highlighted-v-line");t!=null&&this.editor.editor.removeLineClass(parseInt(t),"text","cgen-highlight")}askLoadUnsavedCode(){let e=this.repository instanceof y,t=window.localStorage.getItem(le)!=null;window.localStorage.removeItem(le),e&&t&&confirm("You load the code from the link, but you have previously unsaved changes. Do you want to load it instead of code from link?")&&(this.queryParams.updateURLParameter(y.QUERY_PARAM_NAME,null),window.location.reload())}clearTerminal(){this.terminal.clear()}writeToTerminal(e){this.terminal.write(e)}openTerminal(){this.wrapperElement.classList.remove("closed-terminal")}closeTerminal(){this.wrapperElement.classList.add("closed-terminal"),this.editor.refresh()}markCodeAsUnsaved(){window.localStorage.setItem(le,"")}};var Re=document.querySelector(".js-playground"),w=new Z(Re);w.registerAction("run",()=>{w.run()});w.registerAction("format",()=>{w.formatCode()});w.registerAction("share",()=>{w.shareCode()});w.registerAction("change-theme",()=>{w.changeTheme()});w.registerRunAsTestConsumer(()=>document.querySelector(".js-run__action").getAttribute("data-type")==="Test");w.setupShortcuts();w.askLoadUnsavedCode();window.onload=()=>{let l=document.querySelector("html");l.style.opacity="1"};})();
//# sourceMappingURL=main.bundle.js.map
