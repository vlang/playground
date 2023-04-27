module main

import vweb
import runners
import models
import net.urllib

struct CreateBugResponse {
	link  string
	error string
}

// create_bug_url endpoint is used to create link to submit a bug on GitHub.
// Returns CreateBugResponse with link or error.
['/create_bug_url'; post]
fn (mut app Server) create_bug_url() vweb.Result {
	snippet := app.get_request_code() or {
		return app.json(CreateBugResponse{
			error: err.msg()
		})
	}

	output := runners.run(snippet) or {
		runners.RunResult{
			output: err.msg()
		}
	}

	version := runners.get_version()
	doctor_output := runners.get_doctor_output() or {
		return app.json(CreateBugResponse{
			error: err.msg()
		})
	}

	hash := hash_code_snippet(snippet)

	app.add_new_code(models.CodeStorage{
		...snippet
		hash: hash
	})

	shared_link := 'https://vosca.dev/p/${hash}'
	code := snippet.code.trim_right('\n')

	mut values := urllib.new_values()
	values.add('template', 'bug-report.yml')

	values.add('description', '
Code: ${shared_link}

```v
${code}
```
'.trim_indent())

	values.add('current', '
Output:

```
${output.output}
```
'.trim_indent())

	values.add('version', version)
	values.add('environment', '
```
${doctor_output}
```
'.trim_indent())

	params := values.encode()
	url := 'https://github.com/vlang/v/issues/new?${params}'

	return app.json(CreateBugResponse{
		link: url
	})
}
