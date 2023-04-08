module runners

import os
import isolate
import models
import logger
import srackham.pcre2

// run runs the code in sandbox.
pub fn run(snippet models.CodeStorage) !string {
	return run_in_sandbox(snippet, false)
}

// run runs the code as tests in sandbox.
pub fn test(snippet models.CodeStorage) !string {
	return run_in_sandbox(snippet, true)
}

// run_in_sandbox is common function for running tests and code in sandbox.
fn run_in_sandbox(snippet models.CodeStorage, as_test bool) !string {
	box_path, box_id := isolate.init_sandbox()
	defer {
		isolate.execute('isolate --box-id=${box_id} --cleanup')
	}

	file := if as_test { 'code_test.v' } else { 'code.v' }

	os.write_file(os.join_path(box_path, file), snippet.code) or {
		return error('Failed to write code to sandbox.')
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
			${prepare_user_arguments(snippet.build_arguments)}
			test ${file}
		')
		run_output := run_res.output.trim_right('\n')

		logger.log(snippet.code, run_output) or { eprintln('[WARNING] Failed to log code.') }

		if run_res.exit_code != 0 {
			return error(prettify(run_output))
		}

		return prettify(run_output)
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
		${prepare_user_arguments(snippet.build_arguments)}
		${file}
	')
	build_output := build_res.output.trim_right('\n')

	logger.log(snippet.code, build_output) or { eprintln('[WARNING] Failed to log code.') }

	if build_res.exit_code != 0 {
		return error(prettify(build_output))
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
		 ${prepare_user_arguments(snippet.run_arguments)}
	')

	is_reached_resource_limit := run_res.exit_code == 1
		&& run_res.output.contains('Resource temporarily unavailable')
	is_out_of_memory := run_res.exit_code == 1
		&& run_res.output.contains('GC Warning: Out of Memory!')

	if is_reached_resource_limit || is_out_of_memory {
		return error('The program reached the resource limit assigned to it.')
	}

	run_res_result := run_res.output.trim_right('\n')

	if build_output.contains('warning:') || build_output.contains('notice:') {
		return '
Build log:
${prettify(build_output)}

Output:
${run_res_result}
		'.trim_indent()
	}

	return prettify(run_res_result)
}

const regex_arguments_validator = pcre2.compile('[^\\w\\d\\-=]') or { panic(err) }

fn prepare_user_arguments(args string) string {
	return regex_arguments_validator.replace_all(args, ' ')
}
