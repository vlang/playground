import {SharedCodeRunConfiguration} from "../Repositories";

type RunCodeResponse = {
    output: string
    error: string
}

type RetrieveCgenCodeResponse = {
    cgenCode: string
    exitCode: number
    buildOutput: string
    error: string
}

type FormatCodeResponse = {
    output: string
    error: string
}

export type ShareCodeResponse = {
    hash: string
    error: string
}

type CreateBugResponse = {
    link: string
    error: string
}

type VersionResponse = {
    version: string
    error: string
}

export class RunnableCodeSnippet {
    constructor(
        public code: string,
        public buildArguments: string[],
        public runArguments: string[],
        public runConfiguration: SharedCodeRunConfiguration,
    ) {
    }

    public toFormData(): FormData {
        const data = new FormData()
        data.append("code", this.code)
        data.append("build-arguments", this.buildArguments.join(" "))
        data.append("run-arguments", this.runArguments.join(" "))
        data.append("run-configuration", this.runConfiguration.toString())
        return data
    }
}

/**
 * CodeRunner describes how to run, format, and share code.
 */
export class CodeRunner {
    public static runCode(snippet: RunnableCodeSnippet): Promise<RunCodeResponse> {
        return fetch("/run", {
            method: "post",
            body: snippet.toFormData(),
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error(CodeRunner.buildErrorMessage("run", resp))
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => data as RunCodeResponse)
    }

    public static runTest(snippet: RunnableCodeSnippet): Promise<RunCodeResponse> {
        return fetch("/run_test", {
            method: "post",
            body: snippet.toFormData(),
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error(CodeRunner.buildErrorMessage("test", resp))
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => data as RunCodeResponse)
    }

    public static retrieveCgenCode(snippet: RunnableCodeSnippet): Promise<RetrieveCgenCodeResponse> {
        return fetch("/cgen", {
            method: "post",
            body: snippet.toFormData(),
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error(CodeRunner.buildErrorMessage("cgen", resp))
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => data as RetrieveCgenCodeResponse)
    }

    public static formatCode(snippet: RunnableCodeSnippet): Promise<FormatCodeResponse> {
        return fetch("/format", {
            method: "post",
            body: snippet.toFormData(),
        })
            .then(resp => resp.json())
            .then(data => data as FormatCodeResponse)
    }

    public static shareCode(snippet: RunnableCodeSnippet): Promise<ShareCodeResponse> {
        return fetch("/share", {
            method: "post",
            body: snippet.toFormData(),
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error(CodeRunner.buildErrorMessage("share", resp))
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => data as ShareCodeResponse)
    }

    public static createBugUrl(snippet: RunnableCodeSnippet): Promise<CreateBugResponse> {
        return fetch("/create_bug_url", {
            method: "post",
            body: snippet.toFormData(),
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error(CodeRunner.buildErrorMessage("create_bug_url", resp))
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => data as CreateBugResponse)
    }

    public static getVlangVersion(): Promise<VersionResponse> {
        return fetch("/version", {
            method: "post",
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error(CodeRunner.buildErrorMessage("version", resp))
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => data as VersionResponse)
    }

    private static buildErrorMessage(kind: string, response: Response): string {
        const base = `Failed to invoke \`/${kind}\` endpoint`
        const responseStatus = response.status.toString() + " " + response.statusText
        return `${base}: ${responseStatus}`
    }
}
