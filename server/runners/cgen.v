module runners

import os
import logger
import isolate
import models

pub fn retrieve_cgen_code(snippet models.CodeStorage) !string {
	box_path, box_id := isolate.init_sandbox()
	defer {
		isolate.execute('isolate --box-id=${box_id} --cleanup')
	}

	os.write_file(os.join_path(box_path, 'code.v'), snippet.code) or {
		return error('Failed to write code to sandbox.')
	}

	build_res := isolate.execute('
		 ${@VEXEROOT}/v -showcc -keepc -cflags -DGC_MARKERS=1 -no-parallel -no-retry-compilation -skip-unused -g
		 ${prepare_user_arguments(snippet.build_arguments)}
		 ${box_path}/code.v
	')
	build_output := build_res.output.trim_right('\n')

	logger.log(snippet.code, build_output) or { eprintln('[WARNING] Failed to log code.') }

	if build_res.exit_code != 0 {
		return error(prettify(build_output))
	}

	path_to_cgen := $if macos { '/tmp/v_501/code.tmp.c' } $else { '/tmp/v_0/code.tmp.c' }
	cgen_file := os.read_file(path_to_cgen) or { return error('Failed to read generated C code.') }

	return cgen_file
}
