const FOCUSABLE_ELEMENTS = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const trapFocusKeyListener = function(event) {
    const isTabPressed = event.key.toLowerCase() === 'tab';

    if(!isTabPressed) {
        return;
    }
    
    const firstFocusableElement = this.querySelectorAll(FOCUSABLE_ELEMENTS)[0];
    const focusableContent = this.querySelectorAll(FOCUSABLE_ELEMENTS);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    if(event.shiftKey) {
        if(document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
        }
    }else {
        if(document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            event.preventDefault();
        }
    }
}

export { trapFocusKeyListener };