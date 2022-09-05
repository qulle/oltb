import DOM from '../../helpers/Browser/DOM';

const copyToClipboard = function(text) {
    const textarea = DOM.createElement({
        element: 'textarea', 
        value: text,
        style: 'position: absolute; left: -9999px;',
        attributes: {
            readonly: ''
        }
    });

    document.body.appendChild(textarea);
    textarea.select();
    const didCopy = document.execCommand('copy');
    document.body.removeChild(textarea);

    return didCopy;
}

export { copyToClipboard };