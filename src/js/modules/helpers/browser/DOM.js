class DOM {
    static createElement(options = {}) {
        const element = document.createElement(options.element);

        // Common attributes
        if(options.id) {
            element.id = options.id;
        }

        if(options.class) {
            element.className = options.class;
        }

        if(options.value) {
            element.value = options.value;
        }

        if(options.text) {
            element.innerText = options.text;
        }
    
        if(options.html) {
            element.innerHTML = options.html;
        }

        if(options.style) {
            element.style = options.style;
        }

        if(options.title) {
            element.title = options.title;
        }

        // Attributes that needs to be set using setAttribute
        for(const attribute in options.attributes) {
            element.setAttribute(attribute, options.attributes[attribute]);
        }
    
        // Attach given listeners and callbacks
        for(const listener in options.listeners) {
            const callbacks = options.listeners[listener];

            // The callback(s) can be given as a single reference or as a array of many 
            if(Array.isArray(callbacks)) {
                callbacks.forEach((callback) => {
                    element.addEventListener(listener, callback);
                });
            }else {
                element.addEventListener(listener, callbacks);
            }
        }

        return element;
    }

    static appendChildren(element, children = []) {
        children.forEach((child) => {
            element.appendChild(child);
        });
    }
}

export default DOM;