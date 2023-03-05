import { CONFIG } from "../../core/Config";

const FILENAME = 'browser/DOM.js';

class DOM {
    static createElement(options = {}) {
        const element = document.createElement(options.element);

        // Common attributes
        if(Boolean(options.id)) {
            element.id = options.id;
        }

        if(Boolean(options.class)) {
            element.className = options.class;
        }

        if(Boolean(options.value)) {
            element.value = options.value;
        }

        if(Boolean(options.text)) {
            element.innerText = options.text;
        }
    
        if(Boolean(options.html)) {
            element.innerHTML = options.html;
        }

        if(Boolean(options.style)) {
            element.style = options.style;
        }

        if(Boolean(options.title)) {
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

    static runAnimation(element, className) {
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);

        // CONFIG.AnimationDuration.Fast matches the time given in _animations.scss
        // With the animation-class the html2canvas fails to render the exported PNG correctly
        window.setTimeout(() => {
            element.classList.remove(className);
        }, CONFIG.AnimationDuration.Fast);
    }
}

export { DOM };