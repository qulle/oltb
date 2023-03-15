import { Keys } from "../constants/Keys";

const FILENAME = 'browser/IsShortcutKeyOnly.js';

const isShortcutKeyOnly = function(event, key) {
    return (
        document.activeElement.nodeName !== 'TEXTAREA' && 
        document.activeElement.nodeName !== 'INPUT' &&
        !Boolean(event.ctrlKey) && 
        !Boolean(event.shiftKey) && 
        !Boolean(event.altKey) && 
        !Boolean(event.metaKey) && 
        event.key.toUpperCase() !== Keys.valueOperatingSystem &&
        event.key.toUpperCase() === key
    );
}

export { isShortcutKeyOnly };