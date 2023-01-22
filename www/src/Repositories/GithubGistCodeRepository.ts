import { CodeRepository } from "./interface";

export class GithubGistCodeRepository implements CodeRepository {
    public static readonly QUERY_PARAM_NAME = "gist"

    constructor(private id: string) {
    }

    saveCode(_: string): void {
    }

    getCode(onReady: (code: string) => void): void {
        fetch("https://api.github.com/gists/" + this.id, {
            method: "get",
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(resp => resp.json())
            .then(data => {
                const files = data.files
                const firstKey = Object.keys(files)[0];
                const file = files[firstKey]
                const url = file.raw_url

                fetch(url, {
                    method: "get",
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                })
                    .then(r => r.text())
                    .then(r => {
                        onReady(r)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
            .catch(err => {
                console.log(err)
            })
    }
}
