module main

import os
import vweb

['/'; get]
fn (mut app Server) index() vweb.Result {
	app.send_analytics('/')
	file := os.read_file('./www/public/index.html') or { panic(err) }
	return app.html(file)
}
