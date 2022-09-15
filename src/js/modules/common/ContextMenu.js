import Control from "ol/control/Control";
import Config from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import { trapFocusKeyListener } from '../helpers/TrapFocus';
import { transform } from 'ol/proj';
import { mapElement } from "../core/ElementReferences";
import { hasNestedProperty } from "../helpers/HasNestedProperty";

const DEFAULT_OPTIONS = {};

const menuItems = new Map();
const menuInstances = new Map();

class ContextMenu extends Control {
    constructor(options = {}) {
        super({
            element: DOM.createElement({
                element: 'ul',
                class: 'oltb-context-menu',
                attributes: {
                    tabindex: '-1',
                    'data-contextmenu': options.name
                },
                listeners: {
                    'keydown': trapFocusKeyListener
                }
            })
        });
        
        this.menu = this.element;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.menuItems = menuItems.get(options.name);
        this.target = null;

        this.create();
        menuInstances.set(options.name, this);
    }

    create() {
        // Create <li>'s for each menu item
        this.menuItems.forEach((item, index) => {
            this.addMenuItem(item, index);
        });

        // Add root element, the contextmenu, to the map
        mapElement.appendChild(this.menu);
    }

    addMenuItem(item, index) {
        if(!hasNestedProperty(item, 'name')) {
            const li = DOM.createElement({
                element: 'li',
                class: 'oltb-context-menu__divider'
            });

            this.menu.appendChild(li);
        }else {
            const li = DOM.createElement({
                element: 'li',
                text: item.name,
                class: 'oltb-context-menu__item',
                attributes: {
                    tabindex: '0',
                    'data-contextmenuitem': index
                },
                listeners: {
                    'click': this.click.bind(this),
                    'keyup': (event) => {
                        const key = event.key.toLowerCase();
                        if(key === 'enter') {
                            this.click(event);
                        }else if(key === 'escape') {
                            this.hide();
                        }
                    }
                }
            });

            const icon = DOM.createElement({
                element: 'span',
                html: item.icon,
                class: 'oltb-context-menu__icon'
            });
            
            li.prepend(icon);
            this.menu.appendChild(li);
        }
    }

    show(event) {
        this.coordinates = transform(
            this.getMap().getEventCoordinate(event), 
            Config.projection, 
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

    click(event) {
        const id = event.target.getAttribute('data-contextmenuitem');
        const contextItem = this.menuItems[id];
        if(contextItem) {
            contextItem.fn(
                this.getMap(), 
                this.coordinates, 
                this.target
            );
        }

        this.hide();
    }
}

mapElement.addEventListener('contextmenu', (event) => {
    menuInstances.forEach((menu) => {
        if(event.target.matches(menu.options.selector)) {
            menu.show(event);
        }
    });
});

mapElement.addEventListener('click', (event) => {
    menuInstances.forEach((menu) => {
        menu.hide();
    });
});

const addContextMenuItems = function(name, items) {
    items.forEach((item) => {
        addContextMenuItem(name, item);
    });
}

const addContextMenuItem = function(name, item) {
    if(!menuItems.has(name)) {
        menuItems.set(name, []);
    }
        
    menuItems.get(name).push(item);

    // Check if context menu is created, if so, add the menu item to the context menu
    if(menuInstances.has(name)) {
        const menu = menuInstances.get(name);
        const index = menuItems.get(name).length - 1;

        menu.addMenuItem(item, index);
    }
}

export { 
    ContextMenu as default, 
    addContextMenuItems, 
    addContextMenuItem 
};