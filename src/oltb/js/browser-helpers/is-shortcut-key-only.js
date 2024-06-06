import { KeyboardKeys } from '../browser-constants/keyboard-keys';

const isShortcutKeyOnly = function(event, key) {
    return (
        window.document.activeElement.nodeName !== 'TEXTAREA' && 
        window.document.activeElement.nodeName !== 'INPUT' &&
        !event.ctrlKey && 
        !event.shiftKey && 
        !event.altKey && 
        !event.metaKey && 
        event.key.toUpperCase() !== KeyboardKeys.valueOperatingSystem &&
        event.key.toUpperCase() === key
    );
}

export { isShortcutKeyOnly };