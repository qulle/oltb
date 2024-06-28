 const simulateKeyPress = function(element, key) {
    const event = new KeyboardEvent('keyup', {
        key: key,
        code: key,
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true
    });

    element.dispatchEvent(event);
}

export { simulateKeyPress };