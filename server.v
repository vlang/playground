import vweb
import os
import time
import runtime

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

fn isolate_cmd(cmd string) os.Result {
	$if debug {
		eprintln('> cmd: $cmd')
	}
	return os.execute(cmd)
}

fn init_sandbox() (string, int) {
	for {
		for box_id in 0 .. 1000 {
			iso_res := isolate_cmd('isolate --box-id=$box_id --init')
			if iso_res.exit_code == 0 {
				box_path := os.join_path(iso_res.output.trim_string_right('\n'), 'box')
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

fn ddhhmmss(time time.Time) string {
	return '${time.day:02d}-${time.hour:02d}:${time.minute:02d}:${time.second:02d}'
}

fn log_code(code string, build_res string) ! {
	now := time.now()
	log_dir := 'logs/$now.year-${now.month:02d}'
	if !os.exists(log_dir) {
		os.mkdir(log_dir)!
	}
	log_file := '$log_dir/${ddhhmmss(now)}'
	log_content := '$code\n\n\n$build_res'
	os.write_file(log_file, log_content)!
}

fn run_in_sandbox(code string) string {
	box_path, box_id := init_sandbox()
	defer {
		isolate_cmd('isolate --box-id=$box_id --cleanup')
	}
	os.write_file(os.join_path(box_path, 'code.v'), code) or {
		return 'Failed to write code to sandbox.'
	}
	build_res := isolate_cmd('isolate --box-id=$box_id --dir=$vexeroot --env=HOME=/box --processes=3 --mem=100000 --wall-time=2 --quota=${1048576 / block_size},${1048576 / inode_ratio} --run -- $vexeroot/v -no-parallel code.v')
	build_output := build_res.output.trim_right('\n')
	log_code(code, build_output) or { eprintln('[WARNING] Failed to log code.') }
	if build_res.exit_code != 0 {
		return prettify(build_output)
	}
	cpus := runtime.nr_cpus()
	run_res := isolate_cmd('isolate --box-id=$box_id --dir=$vexeroot --env=HOME=/box --processes=$cpus --mem=30000 --wall-time=2 --quota=${10240 / block_size},${10240 / inode_ratio} --run -- code')
	return prettify(run_res.output.trim_right('\n'))
}

['/run'; post]
fn (mut app App) run() vweb.Result {
	code := app.form['code'] or { return app.text('No code was provided.') }
	res := run_in_sandbox(code)
	return app.text(res)
}

fn vfmt_code(code string) (string, bool) {
	box_path, box_id := init_sandbox()
	defer {
		isolate_cmd('isolate --box-id=$box_id --cleanup')
	}
	os.write_file(os.join_path(box_path, 'code.v'), code) or {
		return 'Failed to write code to sandbox.', false
	}
	vfmt_res := isolate_cmd('isolate --box-id=$box_id --dir=$vexeroot --env=HOME=/box --processes=3 --mem=100000 --wall-time=2 --quota=${1048576 / block_size},${1048576 / inode_ratio} --run -- $vexeroot/v fmt code.v')
	mut vfmt_output := vfmt_res.output.trim_right('\n')
	if vfmt_res.exit_code != 0 {
		return prettify(vfmt_output), false
	} else {
		return vfmt_output.all_before_last('\n'), true
	}
}

['/format'; post]
fn (mut app App) format() vweb.Result {
	code := app.form['code'] or {
		return app.json({
			'output': 'No code was provided.'
			'ok':     'false'
		})
	}
	res, ok := vfmt_code(code)
	return app.json({
		'output': res
		'ok':     ok.str()
	})
}

fn (mut app App) init_once() {
	isolate_cmd('isolate --cleanup')
	app.handle_static('static', true)
	app.serve_static('/static/js/codejar.js', 'static/js/codejar.js')
}

fn main() {
	mut app := &App{}
	app.init_once()
	vweb.run(app, port)
}
