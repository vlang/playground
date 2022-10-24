/**
 * QueryParams is responsible for parsing query params from URL
 * and updating the URL when the params change.
 *
 * @example
 * const queryParams = new QueryParams(window.location.search);
 * queryParams.updateURLParameter('theme', 'dark')
 * // The URL will be updated to: http://localhost:8080/?theme=dark
 */
class QueryParams {
    public readonly params: URLSearchParams

    /**
     * @param path - The path to parse (usually `window.location.search`).
     */
    constructor(path: string) {
        this.params = new Proxy(new URLSearchParams(path), {
            get: (searchParams, prop) => searchParams.get(prop.toString()),
        })
    }

    /**
     * Update the URL with the new param.
     * @param param The param to update.
     * @param value The new value of the param.
     */
    public updateURLParameter(param: string, value: string) {
        const url = QueryParams.updateURLParameter(window.location.href, param, value)
        window.history.replaceState({}, "", url)
    }

    private static updateURLParameter(url: string, param: string, value: string) {
        let newAdditionalURL = ""
        let tempArray = url.split("?")
        const baseURL = tempArray[0]
        const additionalURL = tempArray[1]
        let temp = ""
        if (additionalURL) {
            tempArray = additionalURL.split("&")
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].split("=")[0] !== param) {
                    newAdditionalURL += temp + tempArray[i]
                    temp = "&"
                }
            }
        }

        const rows_txt = temp + "" + param + "=" + value
        return baseURL + "?" + newAdditionalURL + rows_txt
    }
}
