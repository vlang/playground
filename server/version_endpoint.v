module main

import vweb
import os

struct VersionResponse {
	version string
	error   string
}

// version endpoint is used to get the version of the V.
// Returns VersionResponse with version or error.
@['/version'; post]
fn (mut app Server) version() vweb.Result {
	res := os.execute('v -version')
	if res.exit_code != 0 {
		return app.json(VersionResponse{
			error: res.output
		})
	}

	return app.json(VersionResponse{
		version: res.output
	})
}
