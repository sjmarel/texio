class View
{
    constructor(document)
    {
        const app = document.getElementById('app');
        const editor = document.createElement('div');
        editor.id = 'editor';
        editor.contentEditable = 'true';
        app.appendChild(editor);
    }

    compile()
    {
        const nodes = editor.childNodes;
        const pars = model.paragraphs;

        const nodeIndex = model.range.start.node;
        const nodeOffset = model.range.start.offset;

        // first cycle: populate the nodes with model data
        pars.forEach( (par, index) => {
            if (nodes[index])
            {
                if (nodes[index].textContent != par.content)
                {
                    nodes[index].textContent = par.content 
                }
            }
            else
            {
                let newNode = document.createElement('div')
                newNode.className = 'par';
                newNode.textContent = par.content;
                newNode.dataset.index = index;

                editor.appendChild(newNode);
            }
        });

        // second cycle: remove nodes not in pars
        for (let i = nodes.length-1; i >= 0; i--)
        {
            if (i > pars.length-1)
            {
                editor.removeChild(nodes[i])
            }
        }

        // third cycle: apply focus and position caret
        this.setCaretPosition(nodeIndex, nodeOffset);
        nodes.forEach( (node, index) => {
            node.dataset.focus = (index == nodeIndex) ? 'true' : 'false';
        });
    }

    setCaretPosition(nodeIndex, nodeOffset)
    {
        const range = document.createRange();
        const sel = window.getSelection(); 
        
        range.setStart(editor.childNodes[nodeIndex].childNodes[0] || editor.childNodes[nodeIndex], nodeOffset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}