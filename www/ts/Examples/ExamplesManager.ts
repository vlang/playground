class ExamplesManager {
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

        const examplesSelectList = this.selectElement.querySelector(".select-box__list")
        const examplesSelectBox = this.selectElement.querySelector(".select-box__current")

        if (examplesSelectList !== null && examplesSelectBox !== null) {
            examples.forEach(function (example: IExample, index: number) {
                examplesSelectList.innerHTML += ExamplesManager.exampleElementListTemplate(example.name, index)
                examplesSelectBox.innerHTML += ExamplesManager.exampleElementTemplate(example.name, index)
            })
        }

        const selectOptions = this.selectElement.querySelectorAll<HTMLElement>(".select-box__option")
        selectOptions.forEach((option: HTMLElement) => {
            option.addEventListener("click", () => {
                const exampleName = option.innerText
                const example = examples.find((example) => {
                    return example.name === exampleName
                })

                if (this.onSelectHandler !== null && example != null) {
                    this.onSelectHandler(example)
                }
            })
        })
    }

    static exampleElementTemplate = function (name: string, index: number) {
        let checked = ""
        if (index === 0) {
            checked = "checked=\"checked\""
        }
        return `
<div class="select-box__value">
    <input class="select-box__input" type="radio" id="__select-id-${index}" value="1" name="Some" ${checked}/>
    <p class="select-box__input-text">${name}</p>
</div>
`
    }

    static exampleElementListTemplate = function (name: string, index: number) {
        return `
<li>
    <label class="select-box__option" for="__select-id-${index}" aria-hidden="true">${name}</label>
</li>
`
    }
}
