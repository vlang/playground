module main

import vweb
import models
import crypto.md5

struct ShareResponse {
	hash  string
	error string
}

// share endpoint is used to share code snippets.
// Returns ShareResponse with the hash of the code snippet.
['/share'; post]
fn (mut app Server) share() vweb.Result {
	snippet := app.get_request_code() or {
		return app.json(ShareResponse{
			hash: ''
			error: err.msg()
		})
	}

	hash := hash_code_snippet(snippet)

	app.add_new_code(models.CodeStorage{
		...snippet
		hash: hash
	})

	return app.json(ShareResponse{
		hash: hash
	})
}

fn hash_code_snippet(snippet models.CodeStorage) string {
	// snippets with the same code but different arguments should be treated as different
	to_hash := snippet.code + snippet.build_arguments + snippet.run_arguments +
		snippet.run_configuration.str()
	// using 10 chars is enough for now
	return md5.hexhash(to_hash)[0..10]
}
