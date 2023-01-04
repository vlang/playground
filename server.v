module main

import vweb
import os
import time
import json
import sqlite
import crypto.md5

const (
	port                          = 5555
	vexeroot                      = @VEXEROOT
	// non-standard block size, different for different filesystems
	block_size                    = 4096
	fs_usage_max_size_in_bytes    = 10 * 1024 * 1024
	// from isolate docs: please note that this currently works only on the ext family of filesystems (other filesystems use other interfaces for setting quotas)
	block_max_count               = u32(fs_usage_max_size_in_bytes / block_size)
	inode_max_count               = 50
	max_run_processes_and_threads = 10
	max_run_memory_in_kb          = 50_000
	run_time_in_seconds           = 2
)

[table: 'code_storage']
struct CodeStorage {
	id   int    [primary; sql: serial]
	code string [nonull]
	hash string [nonull]
}

struct App {
	vweb.Context
mut:
	db sqlite.DB
}

['/'; get]
fn (mut app App) index() vweb.Result {
	file := os.read_file('www/index.html') or { panic(err) }
	return app.html(file)
}

['/p/:hash'; get]
fn (mut app App) shared_code(hash string) vweb.Result {
	if hash == '' {
		return app.index()
	}
	return app.redirect('/?query=${hash}')
}

fn isolate_cmd(cmd string) os.Result {
	$if debug {
		eprintln('> cmd: ${cmd}')
	}
	return os.execute(cmd)
}

fn try_init_sandbox() (string, int) {
	for {
		for box_id in 0 .. 1000 {
			// TODO: implement --cg when isolate releases v2 support
			// remove --quota if isolate throws `Cannot identify filesystem which contains /var/local/lib/isolate/0`
			iso_res := isolate_cmd('isolate --box-id=${box_id} --quota=${block_max_count},${inode_max_count} --init')
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
	log_dir := 'logs/${now.year}-${now.month:02d}'
	os.mkdir_all(log_dir)!
	log_file := '${log_dir}/${ddhhmmss(now)}'
	log_content := '${code}\n\n\n${build_res}'
	os.write_file(log_file, log_content)!
}

fn run_in_sandbox(code string) string {
	box_path, box_id := try_init_sandbox()
	defer {
		isolate_cmd('isolate --box-id=${box_id} --cleanup')
	}
	os.write_file(os.join_path(box_path, 'code.v'), code) or {
		return 'Failed to write code to sandbox.'
	}
	build_res := isolate_cmd('isolate --box-id=${box_id} --dir=${vexeroot} --env=HOME=/box --processes=${max_run_processes_and_threads} --mem=${max_run_memory_in_kb} --wall-time=${run_time_in_seconds} --run -- ${vexeroot}/v -cflags -DGC_MARKERS=1 -no-parallel -no-retry-compilation -g code.v')
	build_output := build_res.output.trim_right('\n')
	log_code(code, build_output) or { eprintln('[WARNING] Failed to log code.') }
	if build_res.exit_code != 0 {
		return prettify(build_output)
	}
	run_res := isolate_cmd('isolate --box-id=${box_id} --dir=${vexeroot} --env=HOME=/box --processes=${max_run_processes_and_threads} --mem=${max_run_memory_in_kb} --time=${run_time_in_seconds} --wall-time=${run_time_in_seconds} --run -- code')
	return prettify(run_res.output.trim_right('\n'))
}

['/run'; post]
fn (mut app App) run() vweb.Result {
	code := app.form['code'] or { return app.text('No code was provided.') }
	res := run_in_sandbox(code)
	return app.text(res)
}

['/share'; post]
fn (mut app App) share() vweb.Result {
	code := app.form['code'] or { return app.text('No code was provided.') }
	// using 10 chars is enough for now
	hash := md5.hexhash(code)[0..10]
	app.add_new_code(code, hash)
	return app.text(hash)
}

['/query'; post]
fn (mut app App) get_by_hash() vweb.Result {
	hash := app.form['hash'] or { return app.text('No hash was provided.') }
	code := app.get_saved_code(hash) or { return app.text('Not found.') }
	return app.text(code)
}

fn (mut app App) add_new_code(code string, hash string) {
	new_code := CodeStorage{
		code: code
		hash: hash
	}

	sql app.db {
		insert new_code into CodeStorage
	}
}

fn (mut app App) get_saved_code(hash string) ?string {
	found := sql app.db {
		select from CodeStorage where hash == hash
	}

	if found.len == 0 {
		return none
	}

	return found.last().code
}

fn vfmt_code(code string) (string, bool) {
	box_path, box_id := try_init_sandbox()
	defer {
		isolate_cmd('isolate --box-id=${box_id} --cleanup')
	}
	os.write_file(os.join_path(box_path, 'code.v'), code) or {
		return 'Failed to write code to sandbox.', false
	}
	vfmt_res := isolate_cmd('isolate --box-id=${box_id} --dir=${vexeroot} --env=HOME=/box --processes=3 --mem=100000 --wall-time=2 --run -- ${vexeroot}/v fmt code.v')
	mut vfmt_output := vfmt_res.output.trim_right('\n')
	if vfmt_res.exit_code != 0 {
		return prettify(vfmt_output), false
	} else {
		return vfmt_output.all_before_last('\n'), true
	}
}

struct FormatResp {
	output string
	ok     bool
}

['/format'; post]
fn (mut app App) format() vweb.Result {
	code := app.form['code'] or {
		resp := FormatResp{
			output: 'No code was provided.'
			ok: false
		}
		return app.json(json.encode(resp))
	}
	res, ok := vfmt_code(code)
	resp := FormatResp{
		output: res
		ok: ok
	}

	return app.json(json.encode(resp))
}

fn (mut app App) init_once() {
	db := sqlite.connect('code_storage.db') or { panic(err) }
	sql db {
		create table CodeStorage
	}
	app.db = db
	isolate_cmd('isolate --cleanup')
	app.handle_static('./www', true)
	app.serve_static('./www/js', 'www/js/')
}

// V can't compile fmt first time in isolate because
// > `folder `/opt/vlang/cmd/tools` is not writable` when `v fmt`
fn precompile_vfmt() {
	result := os.execute('${vexeroot}/v fmt')

	if result.exit_code != 0 {
		panic(result.output)
	}
}

fn main() {
	precompile_vfmt()

	mut app := &App{}
	app.init_once()
	vweb.run(app, port)
}
