module main

import vweb
import runners

type RunTestResponse = RunResponse

// run_test endpoint is used to run code as tests in sandbox.
// Returns RunResponse with result output or error.
['/run_test'; post]
fn (mut app Server) run_test() vweb.Result {
	snippet := app.get_request_code() or { return app.json(RunTestResponse{
		error: err.msg()
	}) }

	res := runners.test(snippet) or { return app.json(RunTestResponse{
		error: err.msg()
	}) }

	return app.json(RunTestResponse{
		output: res
	})
}
