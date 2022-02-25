class DOM {
    static createElement(options) {
        const element = document.createElement(options.element);
        
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