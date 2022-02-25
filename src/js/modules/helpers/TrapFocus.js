const FOCUSABLEELEMENTS = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const trapFocusKeyListener = function(event) {
    // Component = the modal, alert, confirm etc.
    const component = this;

    const firstFocusableElement = component.querySelectorAll(FOCUSABLEELEMENTS)[0];
    const focusableContent = component.querySelectorAll(FOCUSABLEELEMENTS);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    const isTabPressed = event.key === 'Tab';

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