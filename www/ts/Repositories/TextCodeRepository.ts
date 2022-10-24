class TextCodeRepository implements CodeRepository {
    constructor(private text: string) {
    }

    saveCode(_: string): void {
    }

    getCode(onReady: (string) => void): void {
        onReady(this.text)
    }
}
