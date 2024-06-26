module runners

import os
import isolate
import models
import logger
import srackham.pcre2

pub struct RunResult {
pub:
	output       string
	build_output string
}

// run runs the code in sandbox.
pub fn run(snippet models.CodeStorage) !RunResult {
	return run_in_sandbox(snippet, false)
}

// test runs the code as tests in sandbox.
pub fn test(snippet models.CodeStorage) !RunResult {
	return run_in_sandbox(snippet, true)
}

// get_output run the code in sandbox and returns the output.
pub fn get_output(snippet models.CodeStorage) !string {
	box_path, box_id := isolate.init_sandbox()
	defer {
		isolate.cleanup_sandbox(box_id)
	}

	file := 'code.v'
	os.write_file(os.join_path(box_path, file), snippet.code) or {
		return error('Failed to write code to sandbox.')
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
		${@VEXEROOT}/v -cflags -DGC_MARKERS=1 -no-parallel -no-retry-compilation -g ${prepare_user_arguments(snippet.build_arguments)} ${file} 
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
		./code ${prepare_user_arguments(snippet.run_arguments)}
	')

	is_reached_resource_limit := run_res.exit_code == 1
		&& run_res.output.contains('Resource temporarily unavailable')
	is_out_of_memory := run_res.exit_code == 1
		&& run_res.output.contains('GC Warning: Out of Memory!')

	if is_reached_resource_limit || is_out_of_memory {
		return error('The program reached the resource limit assigned to it.')
	}

	mut run_res_result := run_res.output.trim_right('\n')
	$if !local ? {
		// isolate output message like "OK (0.033 sec real, 0.219 sec wall)"
		// so we need to remove it
		run_res_result = run_res_result.all_before_last('\n') + '\n'
	}

	return run_res_result
}

// run_in_sandbox is common function for running tests and code in sandbox.
fn run_in_sandbox(snippet models.CodeStorage, as_test bool) !RunResult {
	box_path, box_id := isolate.init_sandbox()
	defer {
		isolate.cleanup_sandbox(box_id)
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
			${@VEXEROOT}/v -cflags -DGC_MARKERS=1 -no-parallel -no-retry-compilation -g ${prepare_user_arguments(snippet.build_arguments)} test ${file}
		')
		run_output := run_res.output.trim_right('\n')

		logger.log(snippet.code, run_output) or { eprintln('[WARNING] Failed to log code.') }

		return RunResult{
			output: prettify(run_output)
			build_output: ''
		}
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
		${@VEXEROOT}/v -cflags -DGC_MARKERS=1 -no-parallel -no-retry-compilation -g ${prepare_user_arguments(snippet.build_arguments)} ${file}
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
		./code ${prepare_user_arguments(snippet.run_arguments)}
	')

	is_reached_resource_limit := run_res.exit_code == 1
		&& run_res.output.contains('Resource temporarily unavailable')
	is_out_of_memory := run_res.exit_code == 1
		&& run_res.output.contains('GC Warning: Out of Memory!')

	if is_reached_resource_limit || is_out_of_memory {
		return error('The program reached the resource limit assigned to it.')
	}

	mut run_res_result := run_res.output.trim_right('\n')
	mut run_res_result_lines := run_res_result.split_into_lines()

	// isolate output message like "OK (0.033 sec real, 0.219 sec wall)"
	// we want to remove it
	if run_res_result_lines.last().starts_with('OK (') {
		run_res_result_lines = unsafe { run_res_result_lines#[..-1] }
		run_res_result = run_res_result_lines.join('\n')
	}

	return RunResult{
		output: prettify(run_res_result)
		build_output: prettify(build_output)
	}
}

const regex_arguments_validator = pcre2.compile('[^\\w\\d\\-=]') or { panic(err) }

fn prepare_user_arguments(args string) string {
	return runners.regex_arguments_validator.replace_all(args, ' ')
}
