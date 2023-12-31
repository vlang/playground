export class TipsManager {
    private static readonly DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY = "no-more-tips"
    private readonly layerElement: HTMLElement

    constructor() {
        this.layerElement = document.querySelector(".js-tips-layer") as HTMLElement
        this.mount()
    }

    private mount() {
        const closeButton = document.querySelector(".js-tips-layer__close") as HTMLElement
        closeButton.addEventListener("click", () => {
            this.hide()
        })

        document.addEventListener("keydown", (event) => {
            if (!this.isShown()) {
                return
            }

            if (event.key === "Escape") {
                this.hide()
            }
        })
    }

    public isShown(): boolean {
        return this.layerElement.classList.contains("open")
    }

    public show() {
        if (window.localStorage.getItem(TipsManager.DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY) === "true") {
            return
        }

        this.layerElement.classList.add("open")

        window.localStorage.setItem(TipsManager.DONT_SHOW_AGAIN_LOCAL_STORAGE_KEY, "true")
    }

    public hide() {
        this.layerElement.classList.remove("open")
    }
}
