const simulateMouseClick = function(type, element, options = {}) {
    const defaultOptions = {
        bubbles: true,
        cancelable: true,
        view: window,
        detail: 1,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        buttons: 1,
        relatedTarget: null
    };
    
    const mouseEventOptions = {...defaultOptions, ...options};
    const event = new MouseEvent(type, mouseEventOptions);

    element.dispatchEvent(event);
}

export { simulateMouseClick };