module main

import vweb
import os
import db.sqlite
import isolate
import models
import flag

const default_port = 5555

struct Server {
	vweb.Context
pub mut:
	db sqlite.DB
}

// get_request_code retrieves information about the code to run from the request.
// If the code is not provided, an error is returned.
fn (mut app Server) get_request_code() !models.CodeStorage {
	return models.CodeStorage{
		id: 0
		code: app.form['code'] or { return error('No code was provided.') }
		hash: ''
		build_arguments: app.form['build-arguments'] or { '' }
		run_arguments: app.form['run-arguments'] or { '' }
		run_configuration: app.form['run-configuration'] or { '0' }.int()
	}
}

// add_new_code adds a new code snippet to the database.
fn (mut app Server) add_new_code(snippet models.CodeStorage) {
	println('Added new code snippet with hash: ${snippet.hash}, run configuration: ${snippet.run_configuration}')

	count := sql app.db {
		select count from models.CodeStorage where hash == snippet.hash
	} or { 0 }

	if count != 0 {
		println('Code with ${snippet.hash} already added')
		return
	}

	sql app.db {
		insert snippet into models.CodeStorage
	} or { panic(err) }
}

// get_saved_code retrieves a code snippet from the database by its hash.
fn (mut app Server) get_saved_code(hash string) ?models.CodeStorage {
	found := sql app.db {
		select from models.CodeStorage where hash == hash
	} or { panic(err) }

	if found.len == 0 {
		return none
	}

	return found.last()
}

// init_once initializes the server.
fn (mut app Server) init_once() {
	app.db = sqlite.connect('code_storage.db') or { panic(err) }
	sql app.db {
		create table models.CodeStorage
	} or { panic(err) }
	isolate.execute('isolate --cleanup')
	app.handle_static('./www/public', true)
	app.serve_static('/', './www/public/')
}

// precompile_vfmt prepares the vfmt binary in the sandbox.
//
// V can't compile fmt first time in isolate because:
//
// `folder '/opt/vlang/cmd/tools' is not writable`
//
// when run `v fmt`, so we need to run `v fmt` first time outside isolate.
fn precompile_vfmt() {
	result := os.execute('${@VEXEROOT}/v fmt')

	if result.exit_code != 0 {
		panic(result.output)
	}

	$if debug {
		eprintln('v fmt successfully precompiled.')
	}
}

// precompile_vtest prepares the vtest binary in the sandbox.
// See `precompile_vfmt` for more details.
fn precompile_vtest() {
	result := os.execute('${@VEXEROOT}/v test .')

	if result.exit_code != 0 {
		panic(result.output)
	}

	$if debug {
		eprintln('v test successfully precompiled.')
	}
}

fn main() {
	mut fp := flag.new_flag_parser(os.args)
	fp.application('Playground server')
	fp.version('v0.2.0')
	fp.description('A playground server for V language.')
	fp.skip_executable()
	port := fp.int('port', `p`, default_port, 'port to run the server on')

	fp.finalize() or {
		eprintln(err)
		println(fp.usage())
		return
	}

	precompile_vfmt()
	precompile_vtest()

	mut app := &Server{}
	app.init_once()
	vweb.run(app, port)
}
