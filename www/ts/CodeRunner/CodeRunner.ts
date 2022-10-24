class RunCodeResult {
    constructor(public output: string) {
    }
}

class FormatCodeResult {
    public ok: boolean
    public output: string
}

class ShareCodeResult {
    constructor(public hash: string) {
    }
}

/**
 * CodeRunner describes how to run, format and share code.
 */
class CodeRunner {
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

                return resp.text()
            })
            .then(output => new RunCodeResult(output))
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
