class Terminal {
    private readonly element: HTMLElement
    private onClose: () => void = null
    private onWrite: (text: string) => void = null

    constructor(element: HTMLElement) {
        this.element = element
        this.attachResizeHandler(element)
    }

    public registerCloseHandler(handler: () => void) {
        this.onClose = handler
    }

    public registerWriteHandler(handler: (text: string) => void) {
        this.onWrite = handler
    }

    public write(text: string) {
        this.getTerminalOutputElement().innerHTML += text + "\n"

        if (this.onWrite !== null) {
            this.onWrite(text)
        }
    }

    public clear() {
        this.getTerminalOutputElement().innerHTML = ""
    }

    public mount() {
        const closeButton = this.element.querySelector(".js-terminal__close-buttom") as HTMLElement
        if (closeButton === null || closeButton === undefined || this.onClose === null) {
            return
        }

        closeButton.addEventListener("click", this.onClose)
    }

    private getTerminalOutputElement(): HTMLElement {
        return this.element.querySelector(".js-terminal__output") as HTMLElement
    }

    private attachResizeHandler(element: HTMLElement) {
        const header = element.querySelector('.header');
        if (!header) return;

        let mouseDown = false;
        header.addEventListener('mousedown', () => {
            mouseDown = true;
            document.body.classList.add('dragging');
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!mouseDown) return;
            element.style.height = `${document.body.clientHeight - e.clientY + header.clientHeight / 2}px`;
        });
        
        document.addEventListener('mouseup', () => {
            mouseDown = false;
            document.body.classList.remove('dragging');
        });
    }
}
