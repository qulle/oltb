import { Keys } from '../browser-constants/keys';

const isShortcutKeyOnly = function(event, key) {
    return (
        window.document.activeElement.nodeName !== 'TEXTAREA' && 
        window.document.activeElement.nodeName !== 'INPUT' &&
        !event.ctrlKey && 
        !event.shiftKey && 
        !event.altKey && 
        !event.metaKey && 
        event.key.toUpperCase() !== Keys.valueOperatingSystem &&
        event.key.toUpperCase() === key
    );
}

export { isShortcutKeyOnly };