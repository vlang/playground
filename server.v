import vweb
import os

const port = 5000

struct App {
	vweb.Context
}

[get; "/"]
fn (mut app App) index() vweb.Result {
	return $vweb.html()
}

[post; "/run"]
fn (mut app App) run() vweb.Result {
	return app.text("Unimplemented.")
}

fn (mut app App) init_once() {
	app.serve_static("/static/prism.js", "static/prism.js")
	app.serve_static("/static/prism.css", "static/prism.css")
	app.serve_static("/static/index.css", "static/index.css")
	app.handle_static("templates", true)
}

fn main() {
	mut app := &App{}
	app.init_once()
	vweb.run(app, port)
}
