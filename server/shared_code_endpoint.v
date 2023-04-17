module main

import vweb
import models

['/p/:hash'; get]
fn (mut app Server) shared_code(hash string) vweb.Result {
	if hash == '' {
		return app.index()
	}
	return app.redirect('/?query=${hash}')
}

struct GetByHashResponse {
	snippet models.CodeStorage
	found   bool
	error   string
}

// get_by_hash endpoint is used to retrieve code snippet by hash.
// Returns GetByHashResponse with snippet, found and error fields.
['/query'; post]
fn (mut app Server) get_by_hash() vweb.Result {
	hash := app.form['hash'] or {
		return app.json(GetByHashResponse{
			error: 'No hash was provided.'
		})
	}
	snippet := app.get_saved_code(hash.trim_space()) or {
		return app.json(GetByHashResponse{
			found: false
		})
	}

	return app.json(GetByHashResponse{
		snippet: snippet
		found: true
	})
}
