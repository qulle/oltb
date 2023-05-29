const eventDispatcher = function(
    elements, 
    type, 
    bubbles = false, 
    cancelable = true
) {
    const event = new Event(type, {
        bubbles: bubbles,
        cancelable: cancelable,
        composed: false
    });

    elements.forEach((element) => {
        element.dispatchEvent(event);
    });
}

export { eventDispatcher };