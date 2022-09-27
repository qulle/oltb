const FOCUSABLE_ELEMENTS = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const trapFocusKeyListener = function(event) {
    // Component = the modal, alert, confirm etc.
    const component = this;

    const firstFocusableElement = component.querySelectorAll(FOCUSABLE_ELEMENTS)[0];
    const focusableContent = component.querySelectorAll(FOCUSABLE_ELEMENTS);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    const isTabPressed = event.key.toLowerCase() === 'tab';

    if(!isTabPressed) {
        return;
    }

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