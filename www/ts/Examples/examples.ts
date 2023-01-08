///<reference path="../Repositories/LocalCodeRepository.ts"/>
interface IExample {
    name: string
    code: string
}

const examples: IExample[] = [
    {
        name: "Hello, World!",
        code: LocalCodeRepository.WELCOME_CODE
    },
    {
        name: "Fibonacci",
        code: `
fn fib(n int) int {
	mut f := []int{len: n + 2}
	f[0] = 0
	f[1] = 1

	for i := 2; i <= n; i++ {
		f[i] = f[i - 1] + f[i - 2]
	}

	return f[n]
}

for i in 0 .. 30 {
	println(fib(i))
}
`,
    },
    {
        name: "String interpolation",
        code: `
areas := ['game', 'web', 'tools', 'science', 'systems', 'embedded', 'drivers', 'GUI', 'mobile']

for area in areas {
	println('Hello, \${area} developers!')
}
`,
    },
    {
        name: "JSON Encoding/Decoding",
        code: `
import json

struct User {
	name string
	age  int
mut:
	is_registered bool
}

fn main() {
	s := '[{"name":"Frodo", "age":25}, {"name":"Bobby", "age":10}]'
	mut users := json.decode([]User, s) or {
		eprintln('Failed to parse json')
		return
	}
	for user in users {
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

	// Let's encode users again just for fun
	println('')
	println(json.encode(users))
}

fn (u User) can_register() bool {
	return u.age >= 16
}

fn (mut u User) register() {
	u.is_registered = true
}
`,
    },
    {
        name: "Filter Log file",
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

// DEBUG: create new file
// DEBUG: write text to log file
`,
    },
    {
        name: "Compile-time Reflection",
        code: `
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
        name: "Embedded structs",
        code: `
struct Size {
mut:
	width  int
	height int
}

fn (s &Size) area() int {
	return s.width * s.height
}

struct Button {
	Size
	title string
}

mut button := Button{
	title: 'Click me'
	height: 2
}

button.width = 3

assert button.area() == 6
assert button.Size.area() == 6

print(button)
`
    },
    {
        name: "Anonymous & higher order functions",
        code: `
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
        name: "Sum types",
        code: `
struct Empty {}

struct Node {
	value f64
	left  Tree
	right Tree
}

type Tree = Empty | Node

// sum up all node values
fn sum(tree Tree) f64 {
	return match tree {
		Empty { 0 }
		Node { tree.value + sum(tree.left) + sum(tree.right) }
	}
}

fn main() {
	left := Node{0.2, Empty{}, Empty{}}
	right := Node{0.3, Empty{}, Node{0.4, Empty{}, Empty{}}}
	tree := Node{0.5, left, right}

	println(sum(tree)) // 0.2 + 0.3 + 0.4 + 0.5 = 1.4
}
`
    },
    {
        name: "Concurrency",
        code: `
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

const codeIfSharedLinkBroken = `
// Oops, the shared link is broken.
// Please recheck the link and try again.
println('Hello, link 404!')
`.trim()
