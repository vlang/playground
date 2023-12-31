module logger

import time
import os

pub fn log(code string, build_res string) ! {
	now := time.now()
	now_formatted := now.custom_format('MMMM Mo YY N kk:mm:ss A')
	log_dir := 'logs/${now.year}-${now.month:02d}'
	os.mkdir_all(log_dir)!

	log_file := '${log_dir}/${now_formatted}'
	log_content := '${code}\n\n\n${build_res}'
	os.write_file(log_file, log_content)!
}
