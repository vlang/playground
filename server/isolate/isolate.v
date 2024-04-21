module isolate

import os
import log

// execute runs a command in a sandbox inside isolate.
pub fn execute(raw_cmd string) os.Result {
	cmd := raw_cmd
		.trim_indent()
		.replace('\r', '')
		.replace('\n', ' ')

	$if local ? {
		// run all after -- in a command
		two_dash_index := cmd.index('-- ') or { -1 }
		if two_dash_index != -1 {
			local_cmd := cmd[two_dash_index + 3..]
			log.info('> local cmd: ${local_cmd}')
			return os.execute(local_cmd)
		}
	}

	$if debug {
		log.info('> cmd: ${cmd}')
	}

	return os.execute(cmd)
}

// init_sandbox tries to initialize a sandbox and returns its path and box_id.
// When server compiled with `local` flag, it returns `./` as sandbox path and -1 as box_id.
pub fn init_sandbox() (string, int) {
	$if local ? {
		return './', -1
	}
	for box_id in 0 .. 1000 {
		// TODO: implement --cg when isolate releases v2 support
		// remove --quota if isolate throws `Cannot identify filesystem which contains /var/local/lib/isolate/0`
		iso_res := execute('isolate --box-id=${box_id} --init')
		if iso_res.exit_code == 0 {
			box_path := os.join_path(iso_res.output.trim_string_right('\n'), 'box')
			return box_path, box_id
		}
	}
	log.error('> init_sandbox failed to find usable sandbox')
	return '', -1
}
