module runners

import os
import isolate

pub fn format_code(code string) (string, bool) {
	box_path, box_id := isolate.init_sandbox()
	defer {
		isolate.execute('isolate --box-id=${box_id} --cleanup')
	}

	os.write_file(os.join_path(box_path, 'code.v'), code) or {
		return 'Failed to write code to sandbox.', false
	}

	vfmt_res := isolate.execute('
		isolate
		 --box-id=${box_id}
		 --dir=${@VEXEROOT}
		 --env=HOME=/box
		 --processes=3
		 --mem=100000
		 --wall-time=2
		 --run
		 --
		 ${@VEXEROOT}/v fmt code.v
	')

	mut vfmt_output := $if local ? {
		vfmt_res.output
	} $else {
		vfmt_res.output.trim_right('\n')
	}
	if vfmt_res.exit_code != 0 {
		return prettify(vfmt_output), false
	}

	result := $if local ? {
		vfmt_output
	} $else {
		// isolate output message like "OK (0.033 sec real, 0.219 sec wall)"
		// so we need to remove it
		vfmt_output.all_before_last('\n') + '\n'
	}

	return result, true
}
