import vweb
import os

const (
	port        = 5555
	vexeroot    = @VEXEROOT
	block_size  = 4096
	inode_ratio = 16384
)

struct App {
	vweb.Context
}

['/'; get]
fn (mut app App) index() vweb.Result {
	return $vweb.html()
}

fn init_sandbox() (string, int) {
	for {
		for box_id in 0 .. 1000 {
			iso_res := os.execute('isolate --box-id=$box_id --init')
			if iso_res.exit_code == 0 {
				box_path := os.join_path(iso_res.output.trim_suffix('\n'), 'box')
				return box_path, box_id
			}
		}
	}

	return '', -1
}

fn prettify(output string) string {
	mut pretty := output

	if pretty.len > 10000 {
		pretty = pretty[..9997] + '...'
	}

	nlines := pretty.count('\n')
	if nlines > 100 {
		pretty = pretty.split_into_lines()[..100].join_lines() + '\n...and ${nlines - 100} more'
	}

	return pretty
}

fn run_in_sandbox(code string) string {
	box_path, box_id := init_sandbox()
	defer {
		os.execute('isolate --box-id=$box_id --cleanup')
	}
	os.write_file(os.join_path(box_path, 'code.v'), code) or {
		return 'Failed to write code to sandbox.'
	}
	build_res := os.execute('isolate --box-id=$box_id --dir=$vexeroot --env=HOME=/box --processes=3 --mem=60000 --wall-time=2 --quota=${1048576 / block_size},${1048576 / inode_ratio} --run $vexeroot/v code.v')
	if build_res.exit_code != 0 {
		return prettify(build_res.output.trim_right('\n'))
	}
	run_res := os.execute('isolate --box-id=$box_id --dir=$vexeroot --env=HOME=/box --processes=1 --mem=20000 --wall-time=2 --quota=${10240 / block_size},${10240 / inode_ratio} --run code')
	return prettify(run_res.output.trim_right('\n'))
}

['/run'; post]
fn (mut app App) run() vweb.Result {
	code := app.form['code'] or { return app.text('No code was provided.') }
	res := run_in_sandbox(code)
	return app.text(res)
}

fn (mut app App) init_once() {
	os.execute('isolate --cleanup')
	app.handle_static('static', true)
}

fn main() {
	mut app := &App{}
	app.init_once()
	vweb.run(app, port)
}
