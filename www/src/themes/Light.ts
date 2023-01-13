import { ITheme } from "./interface";

export class Light implements ITheme {
    name(): string {
        return "light"
    }
}
