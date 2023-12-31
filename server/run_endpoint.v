module main

import vweb
import runners

struct RunResponse {
	output       string
	build_output string @[json: 'buildOutput']
	error        string
}

// run endpoint is used to run code in sandbox.
// Returns RunResponse with result output or error.
@['/run'; post]
fn (mut app Server) run() vweb.Result {
	snippet := app.get_request_code() or { return app.json(RunResponse{
		error: err.msg()
	}) }

	res := runners.run(snippet) or { return app.json(RunResponse{
		error: err.msg()
	}) }

	return app.json(RunResponse{
		output: res.output
		build_output: res.build_output
	})
}
