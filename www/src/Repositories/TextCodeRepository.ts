import { CodeRepository } from "./interface";

export class TextCodeRepository implements CodeRepository {
    constructor(private text: string) {
    }

    saveCode(_: string): void {
    }

    getCode(onReady: (code: string) => void): void {
        onReady(this.text)
    }
}
