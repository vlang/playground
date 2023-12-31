module models

@[table: 'code_storage']
pub struct CodeStorage {
pub:
	id                int    @[primary; sql: serial]
	code              string
	hash              string
	build_arguments   string @[json: 'buildArguments']   // passed when building binary
	run_arguments     string @[json: 'runArguments']     // passed when run binary
	run_configuration int    @[json: 'runConfiguration']    // how to run code
	additional        string // any future additional data
}
