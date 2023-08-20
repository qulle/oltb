import { Config } from '../../core/Config';

class DOM {
    static createElement(options = {}) {
        const element = document.createElement(options.element);

        // Common element attributes
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

        // Custom element prototypes
        for(const proto in options.prototypes) {
            element[proto] = options.prototypes[proto];
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

    static removeElements(elements = []) {
        elements.forEach((element) => {
            this.removeElement(element);
        });
    }

    static removeElement(element) {
        element.remove();
    }

    static clearElements(elements = []) {
        elements.forEach((element) => {
            this.clearElement(element);
        });
    }

    static clearElement(element) {
        element.innerHTML = '';
    }

    static prependChildren(element, children = []) {
        children.forEach((child) => {
            element.prepend(child);
        });
    }

    static appendChildren(element, children = []) {
        children.forEach((child) => {
            element.appendChild(child);
        });
    }

    static runAnimation(element, className) {
        // Trigger re-render of DOM between class toggle
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);

        // Note: Config.animationDuration.fast matches the time given in _animations.scss
        // With the animation-class the html2canvas fails to render the exported PNG correctly
        window.setTimeout(() => {
            element.classList.remove(className);
        }, Config.animationDuration.fast);
    }
}

export { DOM };