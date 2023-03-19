import {CodeRepository, CodeSnippet} from "./interface";

export class TextCodeRepository implements CodeRepository {
    constructor(private text: string) {
    }

    saveCode(_: string): void {
    }

    getCode(onReady: (snippet: CodeSnippet) => void): void {
        onReady({code: this.text})
    }
}
