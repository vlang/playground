module main

import vweb
import runners
import v.util.diff
import logger

struct CheckOutputResponse {
	output   string
	diff     string
	is_equal bool
	error    string
}

// check_output endpoint is used to check the output of the code.
// Returns CheckOutputResponse with result output or error.
['/check_output'; post]
fn (mut app Server) check_output() vweb.Result {
	snippet := app.get_request_code() or {
		return app.json(CheckOutputResponse{
			error: err.msg()
		})
	}
	expected_output := app.form['expected-output'] or {
		return app.json(CheckOutputResponse{
			error: 'Expected output is required'
		})
	}.replace('\r', '')

	res := runners.get_output(snippet) or {
		return app.json(CheckOutputResponse{
			error: err.msg()
		})
	}

	if expected_output == res {
		return app.json(CheckOutputResponse{
			is_equal: true
			output: res
		})
	}

	diff_cmd := diff.find_working_diff_command() or { '' }
	diff_res := diff.color_compare_strings(diff_cmd, 'output', expected_output, res)

	return app.json(CheckOutputResponse{
		output: res
		diff: diff_res
	})
}
