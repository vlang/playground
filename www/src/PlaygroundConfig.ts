import { ITheme } from "./themes";

/**
 * TODO: For future customizations.
 */
export interface PlaygroundConfig {
    embed: boolean
    theme: ITheme
    codeHash: string
    code: string
}
