const isShortcutKeyOnly = function(event, key) {
    return (
        document.activeElement.nodeName !== 'TEXTAREA' && 
        document.activeElement.nodeName !== 'INPUT' &&
        !event.ctrlKey && 
        !event.shiftKey && 
        !event.altKey && 
        !event.metaKey && 
        event.key.toLocaleUpperCase() === key
    );
}

export { isShortcutKeyOnly };