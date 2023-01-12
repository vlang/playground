/**
 * QueryParams is responsible for parsing query params from URL
 * and updating the URL when the params change.
 *
 * @example
 * const queryParams = new QueryParams(window.location.search);
 * queryParams.updateURLParameter('theme', 'dark')
 * // The URL will be updated to: http://localhost:8080/?theme=dark
 */
export class QueryParams {
    public readonly params: URLSearchParams

    /**
     * @param path - The path to parse (usually `window.location.search`).
     */
    constructor(path: string) {
        this.params = new URLSearchParams(path)
    }

    /**
     * Update the URL with the new param.
     * @param param The param to update.
     * @param value The new value of the param.
     */
    public updateURLParameter(param: string, value: string | null) {
        const url = QueryParams.updateURLParameter(window.location.href, param, value)
        window.history.replaceState({}, "", url)
    }

    public getURLParameter(param: string): string | null {
        return this.params.get(param)
    }

    private static updateURLParameter(url: string, param: string, value: string | null) {
        const parsedUrl = new URL(url)

        if (value) {
            parsedUrl.searchParams.set(param, value)
        } else {
            parsedUrl.searchParams.delete(param)
        }

        return parsedUrl.toString()
    }
}
