import { DOM } from './dom-factory';

const copyAsync = async function(text = '') {
    const value = text.trim();

    // Note:
    // Navigator clipboard API needs a secure context (https)
    // Fallback to old (deprecated window.document.execCommand) if https is not available
    if(window.navigator.clipboard && window.isSecureContext) {
        await window.navigator.clipboard.writeText(value);
    }else {
        const textArea = DOM.createElement({
            element: 'textarea',
            value: value,
            style: {
                'position': 'absolute',
                'left': '-999999px',
                'opacity': 0
            }
        });

        window.document.body.prepend(textArea);
        textArea.select();

        try {
            window.document.execCommand('copy');
        }finally {
            textArea.remove();
        }
    }
}

// Note:
// Had to wrap the function with an object to be able to run unit tests.
// Mocking or spying on the raw copy-function without an object never worked, not sure why.
const copyToClipboard = {
    copyAsync: copyAsync
};

export { copyToClipboard };
