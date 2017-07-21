function mapping()
{
    const sel = window.getSelection()
    const range = model.range = getRange(sel)

    switch(model.event.type)
    {
        case 'undo':
            undoMapping(range)
            break

        case 'redo':
            redoMapping(range)
            break

        case 'copy':
        case 'cut':
            break

        case 'paste':
            outerMapping(range)
            model.updateHistory()
            break

        case 'keydown':
            innerMapping(range)
            model.updateHistory()
            break
    }

    logger(sel, range)
}

function innerMapping(range)
{
    const pars = model.paragraphs
    const nodes = editor.childNodes

    const event = model.event

    let toCompile = false

    try
    {
        // each key has to:
        // 1. modify the model
        // 2. update the range
        // 3. determine if to be compiled
        
        // manage CTRL commands
        if (event.ctrlKey)
        {
            // SHIFT + CTRL + Z
            if (event.shiftKey && event.keyCode === 90)
            {
                e = new Event('redo')
                app.dispatchEvent(e)

                toCompile = true
            }

            // CTRL + Z
            else if (!event.shiftKey && event.keyCode === 90)
            {
                e = new Event('undo')
                app.dispatchEvent(e)

                toCompile = true
            }

            // CTRL + A
            else if (!event.shiftKey && event.keyCode === 65)
            {
                model.debugData = 'CTRL + A IMPLEMENTATION NEEDED!!!'
            }
        }

        // manage format keys: ENTER, BACKSPACE, TAB, DEL
        else
        {
            // BACKSPACE
            if (event.keyCode === 8)
            {
                range.isCollapsed && setRange(range.start, range.end, -1)
                // model.debugData = model.paragraphs[range.start.node].content.slice(range.start.offset, range.end.offset)
                collapseRange(range.start, range.end)

                range.end = range.start

                toCompile = true
            }

            // DELETE
            else if (event.keyCode === 46)
            {
                range.isCollapsed && setRange(range.start, range.end, 1)
                collapseRange(range.start, range.end)

                range.end = range.start

                toCompile = true
            }

            // ENTER
            else if (event.keyCode === 13)
            {
                collapseRange(range.start, range.end)
                insertCarriageReturn(range.start)

                range.start.node += 1
                range.start.offset = 0
                range.end = range.start

                toCompile = true
            }

            // TAB
            else if (event.keyCode === 9)
            {
                model.debugData = 'TAB IMPLEMENTATION NEEDED!!!'
            }

            // ANY OTHER KEY
            else
            {
                pars[range.start.node].content = nodes[range.start.node].textContent
            }
        }

        model.range = range

        if (toCompile)
        {
            model.checkConsistency()
            view.compile()
        }
    }

    catch(err)
    {
        model.errorData = {event: event, range: range, error: err}
    }
}

function outerMapping(range)
{
    const pars = model.paragraphs
    const nodes = editor.childNodes

    const event = model.event

    const data = model.clipboardData.split('\n')

    try
    {
        insertData(range.start, range.end, data)
        
        model.range = range

        model.checkConsistency()
        view.compile()
    }

    catch(err)
    {
        model.errorData = {event: event, range: range, error: err}
    }
}

function undoMapping(range)
{
    try
    {
        if (model.history.buffer.length >= 1)
        {
            model.history.accumulator.push(model.history.buffer.pop())
        }
        model.paragraphs = JSON.parse(JSON.stringify(model.history.buffer[model.history.buffer.length-1]))
    }

    catch(err)
    {
        model.errorData = {event: event, range: range, error: err}
    }
}

function redoMapping(range)
{
    try
    {
        if (model.history.accumulator.length >= 1)
        {
            model.history.buffer.push(model.history.accumulator.pop())
        }
        model.paragraphs = JSON.parse(JSON.stringify(model.history.accumulator[model.history.accumulator.length-1]))
    }

    catch(err)
    {
        model.errorData = {event: event, range: range, error: err}
    }
}

function getRange(sel)
{
    const anchorNode = parseInt(sel.anchorNode.parentNode.dataset.index || sel.anchorNode.dataset.index || 0)
    const anchorOffset = parseInt(sel.anchorOffset || 0)

    const focusNode = parseInt(sel.focusNode.parentNode.dataset.index || sel.focusNode.dataset.index || 0)
    const focusOffset = parseInt(sel.focusOffset || 0)

    let start = {
        node: anchorNode,
        offset: anchorOffset,
    }
    let end = {
        node: focusNode,
        offset: focusOffset,
    }

    if (anchorNode > focusNode || anchorOffset > focusOffset)
    {
        [start, end] = [end, start]
    }

    const isCollapsed = (anchorNode === focusNode && anchorOffset === focusOffset) ? true : false;

    const range = {start, end, isCollapsed}

    return range
}

function setRange(start, end, offset)
{
    const pars = model.paragraphs

    if (offset < 0)
    {
        if (!(start.node === 0 && start.offset === 0))
        {
            if (start.offset === 0)
            {
                start.node -= 1
                start.offset = pars[start.node].content.length
            }
            else
            {
                start.offset -= 1
            }
        }
    }
    else if (offset > 0)
    {
        if (!(end.node === pars.length-1 && end.offset === pars[pars.length-1].content.length))
        {
            if (end.offset === pars[end.node].content.length)
            {
                end.node += 1
                end.offset = 0
            }
            else
            {
                end.offset += 1
            }
        }
    }
}

function collapseRange(start, end)
{
    const pars = model.paragraphs

    const startContent = pars[start.node].content.slice(0, start.offset)
    const endContent = pars[end.node].content.slice(end.offset, pars[end.node].content.length)

    pars[start.node].content = startContent + endContent

    const prevPars = pars.splice(0, start.node+1)
    const restPars = pars.splice(end.node+1, pars.length)

    model.paragraphs = prevPars.concat(restPars)
}

function insertCarriageReturn(start)
{
    const pars = model.paragraphs
    const str = pars[start.node].content

    pars[start.node].content = str.slice(0, start.offset)
    model.addParagraph(model.newParagraph(), start.node+1)
    pars[start.node+1].content = str.slice(start.offset, str.length) + pars[start.node+1].content
}

function insertData(start, end, data)
{
    const pars = model.paragraphs

    collapseRange(start, end)

    const node = start.node
    const offset = start.offset
    
    const str = model.paragraphs[node].content

    const prevStr = str.slice(0, offset)
    const postStr = str.slice(offset, str.length)

    const newPars = data.map( entry => {
        return model.newParagraph(entry)
    })

    newPars[0].content = prevStr + newPars[0].content
    newPars[newPars.length-1].content = newPars[newPars.length-1].content + postStr
    model.paragraphs.splice(node, 1, ...newPars)

    start.node += data.length-1
    start.offset = newPars[0].content.length
}

function logger(sel, range)
{
    console.clear()
    console.log('anchorPoint:',
        sel.anchorNode.parentNode.dataset.index ||
        sel.anchorNode.dataset.index, sel.anchorOffset,
        'focusPoint:',
        sel.focusNode.parentNode.dataset.index ||
        sel.focusNode.dataset.index, sel.focusOffset)
    console.log('startRange:',
        range.start.node, range.start.offset,
        'endRange:',
        range.end.node, range.end.offset)
    console.log('bufferLength:', model.history.buffer.length,
        'accumulatorLength:', model.history.accumulator.length)
    model.paragraphs.forEach( (par, index) => {
        console.log(par.type, index, par.level, par.content)
    })
    console.log('event:', model.event)
    model.errorData ? console.log('error:', model.errorData.error.stack) : console.log('no errors')
    console.log('debug:', model.debugData)
}