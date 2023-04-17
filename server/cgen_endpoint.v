module main

import vweb
import runners

struct CgenResponse {
	cgen_code string [json: 'cgenCode']
	error     string
}

// cgen endpoint is used to retrieve cgen code for a given V code.
// Returns CgenResponse with generated C code or error.
['/cgen'; post]
fn (mut app Server) cgen() vweb.Result {
	snippet := app.get_request_code() or { return app.json(CgenResponse{
		error: err.msg()
	}) }
	res := runners.retrieve_cgen_code(snippet) or {
		return app.json(CgenResponse{
			error: err.msg()
		})
	}
	return app.json(CgenResponse{
		cgen_code: res
	})
}
