
const model = new Model()
const view = new View(document)

function main()
{
    app.addEventListener('undo', listenUndo, false)
    app.addEventListener('redo', listenRedo, false)
    app.addEventListener('cut', listenCut, false)
    app.addEventListener('copy', listenCopy, false)
    app.addEventListener('paste', listenPaste, false)
    app.addEventListener('keydown', listenKeydown, false)

    model.initialize()
    
    view.compile()

    window.requestAnimationFrame(loop)
}

function listenUndo(event)
{
    model.eventBuffer.push(event)
}

function listenRedo(event)
{
    model.eventBuffer.push(event)
}

function listenCut(event)
{
    model.eventBuffer.push(event)
}

function listenCopy(event)
{
    model.eventBuffer.push(event)
}

function listenPaste(event)
{
    model.clipboardData = event.clipboardData.getData('text')
    event.stopPropagation()
    event.preventDefault()

    model.eventBuffer.push(event)
}

function listenKeydown(event)
{
    if (event.ctrlKey || event.metaKey || event.altKey)
    {
        switch (event.keyCode)
        {
            // prevent defautl of every combination that is not ctrl || meta || alt + R, X, C, V
            case 67:
            case 82:
            case 86:
            case 88:
                break
            default:
                event.preventDefault();
                break
        }
    }
    
    else
    {
        // prevent default of Backspace, Tab, Enter, Del
        [8, 9, 13, 46].forEach( key => {
            if (event.keyCode === key)
            {
                event.preventDefault()
            }
        })
    }

    model.eventBuffer.push(event)
}

function loop() {
    // handle event by event in order to avoid processing of two event during one tick of requestAnimationFrame
    while (model.eventBuffer.length > 0)
    {
        model.event = model.eventBuffer.shift()
        mapping()
    }

    window.requestAnimationFrame(loop)
}

main();