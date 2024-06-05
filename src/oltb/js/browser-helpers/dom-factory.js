import { ConfigManager } from '../toolbar-managers/config-manager/config-manager';

class DOM {
    static createElement(options = {}) {
        const element = window.document.createElement(options.element);
        const commonAttributes = [
            {id: 'id'},
            {class: 'className'},
            {value: 'value'},
            {text: 'innerText'},
            {html: 'innerHTML'},
            {style: 'style'},
            {title: 'title'},
        ];

        // Note:
        // Common element attributes
        for(const [key, value] of Object.entries(commonAttributes)) {
            if(options[key]) {
                element[value] = options[key];
            }
        }
        
        // Note:
        // Attributes that needs to be set using setAttribute
        for(const attribute in options.attributes) {
            element.setAttribute(attribute, options.attributes[attribute]);
        }

        // Custom element prototypes
        for(const prototype in options.prototypes) {
            element[prototype] = options.prototypes[prototype];
        }
    
        // Attach given listeners and callbacks
        for(const listener in options.listeners) {
            const callbacks = options.listeners[listener];

            // Note:
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

    static clearText(element) {
        element.innerText = '';
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
        if(!element) {
            return;
        }

        // Note:
        // Trigger re-render of DOM between class toggle
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);

        // Note: 
        // Config.animationDuration.fast matches the time given in _animations.scss
        // With the animation-class the html2canvas fails to render the exported PNG correctly
        const duration = ConfigManager.getConfig().animationDuration.fast;
        window.setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
}

export { DOM };