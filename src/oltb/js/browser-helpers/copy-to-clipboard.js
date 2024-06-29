import { DOM } from './dom-factory';

const copyToClipboard = async function(text = '') {
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

export { copyToClipboard };
