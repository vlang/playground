import {examples, IExample} from "./examples"

export class ExamplesManager {
    private readonly selectElement: HTMLElement
    private onSelectHandler: ((example: IExample) => void) | null = null

    constructor() {
        this.selectElement = document.querySelector(".js-examples__select") as HTMLElement
    }

    public registerOnSelectHandler(handler: (example: IExample) => void) {
        this.onSelectHandler = handler
    }

    public mount() {
        if (this.selectElement === null || this.selectElement === undefined) {
            return
        }

        const examplesSelectList = this.selectElement.querySelector(".dropdown__list")
        const examplesButton = this.selectElement.querySelector(".dropdown__button")

        if (examplesSelectList !== null && examplesButton !== null) {
            examples.forEach(function (example: IExample, index: number) {
                examplesSelectList.innerHTML += ExamplesManager.exampleElementListTemplate(example.name, index)
            })

            const examplesButtonSpan = examplesButton.querySelector("span")!
            examplesButtonSpan.innerText = examples[0].name
        }

        const dropdownItems = this.selectElement.querySelectorAll<HTMLElement>(".dropdown__list-item")
        dropdownItems.forEach((option: HTMLElement) => {
            option.addEventListener("click", () => {
                const exampleName = option.innerText
                const example = examples.find((example) => {
                    return example.name === exampleName
                })

                if (this.onSelectHandler !== null && example) {
                    this.onSelectHandler(example)
                }
            })
        })

        const dropdownBtn = this.selectElement.querySelector<HTMLElement>(".dropdown__button")!
        const dropdownList = this.selectElement.querySelector<HTMLElement>(".dropdown__list")!
        const dropdownInput = this.selectElement.querySelector<HTMLInputElement>(".dropdown__input_hidden")!

        dropdownBtn.addEventListener("click", function () {
            dropdownList.classList.toggle("dropdown__list_visible")
            this.classList.toggle("dropdown__button_active")
        })

        dropdownItems.forEach(function (option: HTMLElement) {
            option.addEventListener("click", function (e) {
                dropdownItems.forEach(function (el) {
                    el.classList.remove("dropdown__list-item_active")
                })
                const target = e.target as HTMLElement
                target.classList.add("dropdown__list-item_active")

                const dropdownBtnSpan = dropdownBtn.querySelector("span")!
                dropdownBtnSpan.innerText = this.innerText
                dropdownInput.value = this.dataset.value ?? ""
                dropdownList.classList.remove("dropdown__list_visible")
            })
        })

        document.addEventListener("click", function (e) {
            if (e.target !== dropdownBtn && !dropdownBtn.contains(e.target as Node)) {
                dropdownBtn.classList.remove("dropdown__button_active")
                dropdownList.classList.remove("dropdown__list_visible")
            }
        })

        document.addEventListener("keydown", function (e) {
            if (e.key === "Tab" || e.key === "Escape") {
                dropdownBtn.classList.remove("dropdown__button_active")
                dropdownList.classList.remove("dropdown__list_visible")
            }
        })
    }

    static exampleElementListTemplate = function (name: string, index: number) {
        let className = ""
        if (index === 0) {
            className = "dropdown__list-item_active"
        }
        return `
<li class="dropdown__list-item ${className}" data-value="${name}">${name}</li>
`
    }
}
