module runners

// Non-standard block size, different for different filesystems.
const block_size = 4096
const fs_usage_max_size_in_bytes = 3 * 1024 * 1024

// From isolate docs:
//
// Please note that this currently works only on the ext family of filesystems
// (other filesystems use other interfaces for setting quotas).
const block_max_count = u32(fs_usage_max_size_in_bytes / block_size)
const inode_max_count = 50
const max_run_processes_and_threads = 10
const max_compiler_memory_in_kb = 100_000
const max_run_memory_in_kb = 50_000
const run_time_in_seconds = 2

// From isolate docs:
//
// We recommend to use `--time` as the main limit, but set `--wall-time` to a much
// higher value as a precaution against sleeping programs.
const wall_time_in_seconds = 3

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
