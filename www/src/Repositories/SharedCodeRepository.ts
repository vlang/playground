import {CodeRepository, CodeSnippet} from "./interface";

export enum SharedCodeRunConfiguration {
    Run,
    Test,
    Cgen,
}

/**
 * {
 *   "snippet": {
 *     "id": 3,
 *     "code": "println(100)",
 *     "hash": "21cf286fdb",
 *     "build_arguments": [],
 *     "run_arguments": [],
 *     "additional": {}
 *   },
 *   "found": false,
 *   "error": ""
 * }
 */
type SharedCodeResponse = {
    snippet: CodeSnippet
    found: boolean
    error: string
}

/**
 * Shared code repository using the server side SQL storage.
 */
export class SharedCodeRepository implements CodeRepository {
    public static readonly QUERY_PARAM_NAME = "query"
    public static readonly CODE_NOT_FOUND = "Not found."

    private readonly hash: string

    constructor(hash: string) {
        this.hash = hash
    }

    saveCode(_: string) {
        // nothing to do
    }

    getCode(onReady: (snippet: CodeSnippet) => void) {
        return this.getSharedCode(onReady)
    }

    private getSharedCode(onReady: (snippet: CodeSnippet) => void) {
        const data = new FormData()
        data.append("hash", this.hash)

        fetch("/query", {
            method: "post",
            body: data,
        })
            .then(resp => resp.json())
            .then(data => data as SharedCodeResponse)
            .then(resp => {
                console.log(resp)
                if (!resp.found) {
                    onReady({code: SharedCodeRepository.CODE_NOT_FOUND})
                    return
                }

                if (resp.error != "") {
                    console.error(resp.error)
                    onReady({code: SharedCodeRepository.CODE_NOT_FOUND})
                    return
                }

                onReady(resp.snippet)
            })
            .catch(err => {
                console.log(err)
            })
    }
}
