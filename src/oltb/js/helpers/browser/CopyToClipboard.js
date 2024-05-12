const copyToClipboard = async function(text = '') {
    const value = text.trim();

    // Note:
    // Navigator clipboard API needs a secure context (https)
    // Fallback to old (deprecated window.document.execCommand) if https is not available
    if(window.navigator.clipboard && window.isSecureContext) {
        await window.navigator.clipboard.writeText(value);
    }else {
        const textArea = window.document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        textArea.style.opacity = '0';
        
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
