const copyToClipboard = async function(text = '') {
    const value = text.trim();

    // Note:
    // Navigator clipboard API needs a secure context (https)
    // Fallback to old (deprecated document.execCommand)
    if(window.navigator.clipboard && window.isSecureContext) {
        await window.navigator.clipboard.writeText(value);
    }else {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        textArea.style.opacity = '0';
        
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        }catch(error) {
            throw error;
        }finally {
            textArea.remove();
        }
    }
}

export { copyToClipboard };
