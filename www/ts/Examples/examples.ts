///<reference path="../Repositories/LocalCodeRepository.ts"/>
interface IExample {
    name: string
    code: string
}

const examples: IExample[] = [
    {
        name: "Hello, Playground!",
        code: LocalCodeRepository.WELCOME_CODE
    },
    {
        name: "String interpolation",
        // language=V
        code: `
// In V you can define array of string with the following syntax:
areas := ['game', 'web', 'tools', 'science', 'systems', 'embedded', 'drivers', 'GUI', 'mobile']

for area in areas {
    // V uses the \${} notation to interpolate a variable or expression right on the string.
    // You can find the details in the documentation: https://github.com/vlang/v/blob/master/doc/docs.md#string-interpolation
    println('Hello, \${area} developers!')
}
        `,
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
`
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
`
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
        `
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
`
    },
    {
        name: "Concurrency",
        code: `
// https://github.com/vlang/v/blob/master/doc/docs.md#concurrency

import time

fn task(id int, duration int) {
	println('task \${id} begin')
	time.sleep(duration * time.millisecond)
	println('task \${id} end')
}

fn main() {
	mut threads := []thread{}

	threads << spawn task(1, 500)
	threads << spawn task(2, 900)
	threads << spawn task(3, 100)
	threads.wait()

	println('done')
}
`
    },
    {
        name: "Channel Select",
        code: `
// https://github.com/vlang/v/blob/master/doc/docs.md#channel-select

import time

fn main() {
	ch := chan f64{}
	ch2 := chan f64{}
	ch3 := chan f64{}
	mut b := 0.0
	c := 1.0

	// ... setup spawn threads that will send on ch/ch2
	spawn fn (the_channel chan f64) {
		time.sleep(5 * time.millisecond)
		the_channel <- 1.0
	}(ch)

	spawn fn (the_channel chan f64) {
		time.sleep(1 * time.millisecond)
		the_channel <- 1.0
	}(ch2)

	spawn fn (the_channel chan f64) {
		_ := <-the_channel
	}(ch3)

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
			eprintln('> c: \${c} was send on channel ch3')
		}
		500 * time.millisecond {
			// do something if no channel has become ready within 0.5s
			eprintln('> more than 0.5s passed without a channel being ready')
		}
	}
	eprintln('> done')
}
`
    },
    {
        name: "Testing",
        code: `
// https://github.com/vlang/v/blob/master/doc/docs.md#testing

fn hello() string {
	return 'Hello world'
}

fn sum(a int, b int) int {
	return a - b
}

fn test_hello() {
	assert hello() == 'Hello world'

	assert sum(2, 2) == 4
}
`
    }
].map((example: IExample) => {
    example.code = example.code.trimStart()

    return example
})

// language=V
const codeIfSharedLinkBroken = `
// Oops, the shared link is broken.
// Please recheck the link and try again.
println('Hello, link 404!')
`.trim()
