module main

import vweb
import runners

struct FormatResponse {
	output string
	error  string
}

// format endpoint is used to format code in sandbox.
// Returns FormatResponse with result output or error.
@['/format'; post]
fn (mut app Server) format() vweb.Result {
	code := app.form['code'] or {
		return app.json(FormatResponse{
			error: 'No code was provided.'
		})
	}

	res := runners.format_code(code) or {
		return app.json(FormatResponse{
			error: 'Failed to format code:\n${err}'
		})
	}

	return app.json(FormatResponse{
		output: res
	})
}
