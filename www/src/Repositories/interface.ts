import {SharedCodeRunConfiguration} from "./SharedCodeRepository";

/**
 * CodeRepository describes the interface for all code sources.
 *
 * Describe how to save and load code.
 */
export interface CodeRepository {
    /**
     * Saves the code to the storage.
     * @param code The code to save.
     */
    saveCode(code: string): void

    /**
     * Async gets the code from the storage.
     * @param onReady Callback function that will be called when the code is ready.
     */
    getCode(onReady: (snippet: CodeSnippet) => void): void
}

/**
 * CodeSnippet describes the interface for all code snippets.
 */
export interface CodeSnippet {
    id?: number
    code: string
    hash?: string
    buildArguments?: string
    runArguments?: string
    runConfiguration?: SharedCodeRunConfiguration
    additional?: {}
}
