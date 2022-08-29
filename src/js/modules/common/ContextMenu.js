import Control from "ol/control/Control";
import Config from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import { trapFocusKeyListener } from '../helpers/TrapFocus';
import { transform } from 'ol/proj';
import { mapElement } from "../core/ElementReferences";

const menuItems = new Map();
const instances = new Map();
let menuId = 0;

class ContextMenu extends Control {
    constructor(options = {}) {
        super({
            element: DOM.createElement({element: 'ul'})
        });
        
        this.options = options;
        this.items = menuItems.get(options.name);
        this.id = menuId++;
        this.target = null;

        this.create();
        instances.set(name, this);
    }

    create() {
        // Create root <ul>
        this.menu = this.element;
        this.menu.className = 'oltb-context-menu';
        this.menu.setAttribute('data-contextmenu', this.id);
        this.menu.setAttribute('tabindex', '-1');
        this.menu.addEventListener('keydown', trapFocusKeyListener);

        // Create <li>'s for each menu item
        this.items.forEach((item, index) => {
            this.addMenuItem(item, index);
        });

        // Add root element, the contextmenu, to the map
        mapElement.appendChild(this.menu);
    }

    addMenuItem(item, index) {
        const li = DOM.createElement({
            element: 'li'
        });

        if(!('name' in item)) {
            li.className = 'oltb-context-menu__divider';
        }else {
            li.className = 'oltb-context-menu__item';
            li.textContent = item.name;
            li.setAttribute('data-contextmenuitem', index);
            li.setAttribute('tabindex', 0);
            li.addEventListener('click', this.click.bind(this, li));
            li.addEventListener('keyup', (event) => {
                if(event.key === 'Enter') {
                    this.click(li);
                }
            });

            const icon = DOM.createElement({
                element: 'span',
                html: item.icon,
                class: 'oltb-context-menu__icon'
            });
            
            li.insertAdjacentElement('afterbegin', icon);
        }

        this.menu.appendChild(li);
    }

    show(event) {
        this.coordinates = transform(
            this.getMap().getEventCoordinate(event), 
            Config.baseProjection, 
            Config.wgs84Projection
        );
        
        this.menu.style.left = `${event.clientX}px`;
        this.menu.style.top = `${event.clientY}px`;
        this.menu.classList.add('oltb-context-menu--show');
        this.target = event.target;
        this.menu.focus();

        // Disable native context menu
        event.preventDefault();
    }

    hide() {
        this.menu.classList.remove('oltb-context-menu--show');
        this.target = null;
    }

    click(item) {
        const itemId = item.getAttribute('data-contextmenuitem');
        if(this.items[itemId]) {
            // Call item handler with map, the clicked point and target element as parameter
            this.items[itemId].fn(this.getMap(), this.coordinates, this.target);
        }

        this.hide();
    }
}

// Listen for contextmenu event to show menu
document.addEventListener('contextmenu', (event) => {
    instances.forEach((menu) => {
        if(event.target.matches(menu.options.selector)) {
            menu.show(event);
        }
    });
});

// Listen for click event to hide menu
document.addEventListener('click', (event) => {
    instances.forEach((menu) => {
        menu.hide();
    });
});

const addContextMenuItems = function(name, items) {
    items.forEach(item => addContextMenuItem(name, item));
}

const addContextMenuItem = function(name, item) {
    if(!menuItems.has(name)) {
        menuItems.set(name, []);
    }
        
    menuItems.get(name).push(item);

    // Check if context menu is created, if so, add the menu item to the context menu
    if(instances.has(name)) {
        const menu = instances.get(name);
        const index = menuItems.get(name).length - 1;

        menu.addMenuItem(item, index);
    }
}

export { 
    ContextMenu as default, 
    addContextMenuItems, 
    addContextMenuItem 
};