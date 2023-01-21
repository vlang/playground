import { CodeRepository } from "./interface";

export class Base64CodeRepository implements CodeRepository {
    public static readonly QUERY_PARAM_NAME = "base64"

    private readonly decodedCode
    constructor(private text: string) {
        this.decodedCode = atob(text)
    }

    saveCode(_: string): void {
    }

    getCode(onReady: (code: string) => void): void {
        onReady(this.decodedCode)
    }
}
