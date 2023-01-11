function fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement("textarea")
    textArea.value = text

    // Avoid scrolling to bottom
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
        // noinspection JSDeprecatedSymbols
        const successful = document.execCommand("copy")
        const msg = successful ? "successful" : "unsuccessful"
        console.log("Fallback: Copying text command was " + msg)
    } catch (err) {
        console.log("Fallback: Oops, unable to copy", err)
    }

    document.body.removeChild(textArea)
}

function copyTextToClipboard(text: string, onCopy: () => void): void {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text)
        return
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log("Async: Copying to clipboard was successful!")
        onCopy()
    }, function (err) {
        fallbackCopyTextToClipboard(text)
        console.log("Async: Could not copy text: ", err, "fallback to old method")
    })
}
