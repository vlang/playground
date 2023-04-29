module main

import os
import vweb
import analytics

['/'; get]
fn (mut app Server) index() vweb.Result {
	analytics.send_analytics(app.req, 'https://play.vosca.dev/')
	file := os.read_file('./www/public/index.html') or { panic(err) }
	return app.html(file)
}
