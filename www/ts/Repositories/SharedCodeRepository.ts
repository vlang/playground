/**
 * Shared code repository using the server side SQL storage.
 */
class SharedCodeRepository implements CodeRepository {
    public static readonly QUERY_PARAM_NAME = "query"
    public static readonly CODE_NOT_FOUND = "Not found."

    private readonly hash: string

    constructor(hash: string) {
        this.hash = hash
    }

    saveCode(_: string) {
        // nothing to do
    }

    getCode(onReady: (string) => void) {
        return this.getSharedCode(onReady)
    }

    private getSharedCode(onReady: (string) => void) {
        const data = new FormData()
        data.append("hash", this.hash)

        fetch("/query", {
            method: "post",
            body: data,
        })
            .then(resp => resp.text())
            .then(data => {
                onReady(data)
            })
            .catch(err => {
                console.log(err)
            })
    }
}
