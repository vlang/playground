module runners

import v.util.version
import os

pub fn get_version() string {
	return version.full_v_version(true)
}

pub fn get_doctor_output() !string {
	res := os.execute('v doctor')
	if res.exit_code != 0 {
		return error('v doctor failed, output: ${res.output}')
	}
	return res.output.all_before_last('\n')
}
