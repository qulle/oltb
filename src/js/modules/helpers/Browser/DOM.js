class DOM {
    static createElement(options = {}) {
        const element = document.createElement(options.element);

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

        // Apply second level attribute properties
        for(const attribute in options.attributes) {
            element.setAttribute(attribute, options.attributes[attribute]);
        }
    
        return element;
    }

    static appendChildren(element, children = []) {
        children.forEach(child => {
            element.appendChild(child);
        });
    }
}

export default DOM;