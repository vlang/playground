import vweb
import os

const (
	port = 5000
	vexeroot = @VEXEROOT
	block_size = 4096
	inode_ratio = 16384
)

struct App {
	vweb.Context
}

[get; "/"]
fn (mut app App) index() vweb.Result {
	return $vweb.html()
}

fn run_in_sandbox(code string) string {
	iso_res := os.execute("isolate --init")
	defer { 
		os.execute("isolate --cleanup") 
	}
	box_path := os.join_path(iso_res.output.trim_suffix("\n"), "box")
	os.write_file(os.join_path(box_path, "code.v"), code) or {
		return "Failed to write code to sandbox."
	}
	run_res := os.execute("isolate --dir=$vexeroot --env=HOME=/box --processes=3 --mem=100000 --wall-time=5 --quota=${1048576 / block_size},${1048576 / inode_ratio} --run $vexeroot/v run code.v")
	println(run_res.output.trim_right("\n"))
	return run_res.output.trim_right("\n")
}

[post; "/run"]
fn (mut app App) run() vweb.Result {
	code := app.form["code"] or {
		return app.text("No code was provided.")
	}

	res := run_in_sandbox(code)
	return app.text(res)
}

fn (mut app App) init_once() {
	os.execute("isolate --cleanup")
	app.handle_static("static", true)
}

fn main() {
	mut app := &App{}
	app.init_once()
	vweb.run(app, port)
}
