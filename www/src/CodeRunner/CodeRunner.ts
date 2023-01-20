type RunCodeResult = {
    ok: boolean
    output: string
}

type FormatCodeResult = {
    ok: boolean
    output: string
}

export class ShareCodeResult {
    constructor(public hash: string) {
    }
}

/**
 * CodeRunner describes how to run, format and share code.
 */
export class CodeRunner {
    public static runCode(code: string): Promise<RunCodeResult> {
        const data = new FormData()
        data.append("code", code)

        return fetch("/run", {
            method: "post",
            body: data,
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't run code")
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => JSON.parse(data) as RunCodeResult)
    }

    public static runTest(code: string): Promise<RunCodeResult> {
        const data = new FormData()
        data.append("code", code)

        return fetch("/run_test", {
            method: "post",
            body: data,
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't run test")
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => JSON.parse(data) as RunCodeResult)
    }

    public static formatCode(code: string): Promise<FormatCodeResult> {
        const data = new FormData()
        data.append("code", code)

        return fetch("/format", {
            method: "post",
            body: data,
        })
            .then(resp => resp.json())
            .then(data => JSON.parse(data) as FormatCodeResult)
    }

    public static shareCode(code: string): Promise<ShareCodeResult> {
        const data = new FormData()
        data.append("code", code)

        return fetch("/share", {
            method: "post",
            body: data,
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't share code")
                }

                return resp.text()
            })
            .then(hash => new ShareCodeResult(hash))
    }
}
