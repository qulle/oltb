 const simulateKeyPress = function(type, element, key) {
    const event = new KeyboardEvent(type, {
        key: key,
        code: key,
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true
    });

    element.dispatchEvent(event);
}

export { simulateKeyPress };