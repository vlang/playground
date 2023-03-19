module runners

import os
import isolate
import models
import logger

// run runs the code in sandbox.
pub fn run(snippet models.CodeStorage) (string, bool) {
	return run_in_sandbox(snippet, false)
}

// run runs the code as tests in sandbox.
pub fn test(snippet models.CodeStorage) (string, bool) {
	return run_in_sandbox(snippet, true)
}

// run_in_sandbox is common function for running tests and code in sandbox.
fn run_in_sandbox(snippet models.CodeStorage, as_test bool) (string, bool) {
	box_path, box_id := isolate.init_sandbox()
	defer {
		isolate.execute('isolate --box-id=${box_id} --cleanup')
	}

	file := if as_test { 'code_test.v' } else { 'code.v' }

	os.write_file(os.join_path(box_path, file), snippet.code) or {
		return 'Failed to write code to sandbox.', false
	}

	if as_test {
		run_res := isolate.execute('
			isolate
			--box-id=${box_id}
			--dir=${@VEXEROOT}
			--env=HOME=/box
			--processes=${max_run_processes_and_threads}
			--mem=${max_compiler_memory_in_kb}
			--wall-time=${wall_time_in_seconds}
			--run
			--

			${@VEXEROOT}/v -cflags -DGC_MARKERS=1 -no-parallel -no-retry-compilation -g
			${snippet.build_arguments}
			test ${file}
		')
		run_output := run_res.output.trim_right('\n')

		logger.log(snippet.code, run_output) or { eprintln('[WARNING] Failed to log code.') }

		return prettify(run_output), run_res.exit_code == 0
	}

	build_res := isolate.execute('
		isolate
		 --box-id=${box_id}
		 --dir=${@VEXEROOT}
		 --env=HOME=/box
		 --processes=${max_run_processes_and_threads}
		 --mem=${max_compiler_memory_in_kb}
		 --wall-time=${wall_time_in_seconds}
		 --run
		 --

		${@VEXEROOT}/v -cflags -DGC_MARKERS=1 -no-parallel -no-retry-compilation -g
		${snippet.build_arguments}
		${file}
	')
	build_output := build_res.output.trim_right('\n')

	logger.log(snippet.code, build_output) or { eprintln('[WARNING] Failed to log code.') }

	if build_res.exit_code != 0 {
		return prettify(build_output), false
	}

	run_res := isolate.execute('
		isolate
		 --box-id=${box_id}
		 --dir=${@VEXEROOT}
		 --env=HOME=/box
		 --processes=${max_run_processes_and_threads}
		 --mem=${max_run_memory_in_kb}
		 --time=${run_time_in_seconds}
		 --wall-time=${wall_time_in_seconds}
		 --run
		 --
		 ./code
		 ${snippet.run_arguments}
	')

	is_reached_resource_limit := run_res.exit_code == 1
		&& run_res.output.contains('Resource temporarily unavailable')
	is_out_of_memory := run_res.exit_code == 1
		&& run_res.output.contains('GC Warning: Out of Memory!')

	if is_reached_resource_limit || is_out_of_memory {
		return 'The program reached the resource limit assigned to it.', false
	}

	return prettify(run_res.output.trim_right('\n')), true
}
