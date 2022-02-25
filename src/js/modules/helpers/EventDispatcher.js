const eventDispatcher = function(elements, type, bubbles = false, cancelable = true) {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent(type, bubbles, cancelable);

    elements.forEach((element) => {
        element.dispatchEvent(evt);
    });
}

export { eventDispatcher };