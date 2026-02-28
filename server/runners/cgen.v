module runners

import os
import logger
import isolate
import models

pub fn retrieve_cgen_code(snippet models.CodeStorage) !(string, int, string) {
	box_path, box_id := isolate.init_sandbox()
	defer {
		isolate.cleanup_sandbox(box_id)
	}

	os.write_file(os.join_path(box_path, 'code.v'), snippet.code) or {
		return error('Failed to write code to sandbox.')
	}

	build_res := isolate.execute('
		isolate
		--box-id=${box_id}
		--dir=${@VEXEROOT}
		--env=HOME=/box
		--env=TMPDIR=/box
		--processes=${max_run_processes_and_threads}
		--mem=${max_compiler_memory_in_kb}
		--wall-time=${wall_time_in_seconds}
		--run
		--
		${@VEXEROOT}/v -showcc -keepc -cflags -DGC_MARKERS=1 -no-parallel -no-retry-compilation -skip-unused -g
		${prepare_user_arguments(snippet.build_arguments)}
		code.v
	')
	build_output := build_res.output.trim_right('\n')

	logger.log(snippet.code, build_output) or { eprintln('[WARNING] Failed to log code.') }

	if build_res.exit_code != 0 {
		// skip handling of errors for now
	}

	// The V compiler writes temp C code relative to TMPDIR (/box inside sandbox = box_path on host).
	cgen_file := os.read_file(os.join_path(box_path, 'code.tmp.c')) or {
		return error('Failed to read generated C code.')
	}

	return cgen_file, build_res.exit_code, build_output
}
