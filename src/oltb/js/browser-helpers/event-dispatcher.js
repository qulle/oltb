const eventDispatcher = function(
    elements, 
    type, 
    allowBubble = false, 
    isCancelable = true
) {
    const event = new Event(type, {
        bubbles: allowBubble,
        cancelable: isCancelable,
        composed: false
    });

    elements.forEach((element) => {
        element.dispatchEvent(event);
    });
}

export { eventDispatcher };