import { KEYS } from "../constants/Keys";

const FILENAME = 'browser/TrapFocus.js';
const ELEMENTS = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const trapFocusKeyListener = function(event) {
    const isTabKey = event.key.toLowerCase() === KEYS.Tab;
    if(!Boolean(isTabKey)) {
        return;
    }
    
    const firstElement = this.querySelectorAll(ELEMENTS)[0];
    const content = this.querySelectorAll(ELEMENTS);
    const lastElement = content[content.length - 1];

    if(Boolean(event.shiftKey)) {
        if(document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
        }
    }else {
        if(document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
        }
    }
}

export { trapFocusKeyListener };