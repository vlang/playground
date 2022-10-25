interface IExample {
    name: string
    code: string
}

const examples: IExample[] = [
    {
        name: "Hello, World!",
        code: `
println('Hello, world!')
`,
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
    println('Hello, $area developers!')
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
        println('$user.name: $user.age')
    }
    println('')
    for i, mut user in users {
        println('$i) $user.name')
        if !user.can_register() {
            println('Cannot register $user.name, they are too young')
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
    eprintln('failed to write the file: $err')
    return
}

// \`read_file\` returns a result (\`!string\`), it must be checked
text := os.read_file('app.log') or {
    eprintln('failed to read the file: $err')
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
    user := decode&lt;User>(data)
    println(user)
}

fn decode&lt;T>(data string) T {
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

// \`decode&lt;User>\` generates:
// fn decode_User(data string) User {
//     mut result := User{}
//     result.name = get_string(data, 'name')
//     result.age = get_int(data, 'age')
//     return result
// }
`,
    },
].map((example: IExample) => {
    example.code = example.code
        .replaceAll("    ", "    ")
        .replaceAll("&lt;", "<")
        .trim()
    return example
})

const codeIfSharedLinkBroken = `
// Oops, the shared link is broken.
// Please recheck the link and try again.
println('Hello, link 404!')
`.trim()