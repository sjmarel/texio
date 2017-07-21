class Model
{

    constructor()
    {
        this.paragraphs = []
        this.event = null
        this.eventBuffer = []
        this.range = {
            start:
            {
                node: null,
                offset: null
            },
            end:
            {
                node: null,
                offset: null
            }
        }
        this.history =
        {
            buffer: [],
            accumulator: []
        }
        this.clipboardData = null
        this.errorData = null
        this.debugData = null
    }

    initialize()
    {
        model.addParagraph(model.newParagraph())
        model.range.start = model.range.end = {node: 0, offset: 0}
        model.history.buffer.push([model.newParagraph()])
    }

    addParagraph(par, index)
    {
        index ? this.paragraphs.splice(index, 0, par) : this.paragraphs.push(par)
    }

    remParagraph(par)
    {
        this.paragraphs.splice(this.paragraphs.indexOf(par), 1)
    }

    newParagraph(data)
    {
        const par =
        {
            content: data || '',
            level: 0,
            type: 'p',
        }

        return par
    }

    updateHistory()
    {
        if (this.event)
        {
            if (!this.event.ctrlKey && !this.event.shiftKey && !this.event.altKey && !this.event.metaKey)
            {
                if (this.history.buffer.length >= 50)
                {
                    this.history.buffer.shift()
                }

                this.history.buffer.push(JSON.parse(JSON.stringify(this.paragraphs)))
                this.history.accumulator = []
            }
        }
    }

    checkConsistency()
    {
        const emptyRegex = /^\s*$/

        this.paragraphs.forEach( (par, index) => {
            if (false)
            {
                // transforms every tab in one space
                par.content = par.content.replace(/\t/g, ' ')
                // remove leading and trailing spaces
                par.content = par.content.replace(/^\s+|\s+$/g, '')
                // remove space clusters
                par.content = par.content.replace(/\s\s+/g, ' ')
            }

            // check for carriage return '\r', and line feed '\n'
            else if (true)
            {

            }

            // check if node is empty and not the current node
            else if (!emptyRegex.test(par.content) && index != this.range.start.node)
            {

            }
        })
    }
}
