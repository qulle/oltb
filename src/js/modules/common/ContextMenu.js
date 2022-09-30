import Control from "ol/control/Control";
import CONFIG from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import { trapFocusKeyListener } from '../helpers/TrapFocus';
import { transform } from 'ol/proj';
import { MAP_ELEMENT } from "../core/ElementReferences";
import { hasNestedProperty } from "../helpers/HasNestedProperty";
import { EVENTS } from "../helpers/constants/Events";

const DEFAULT_OPTIONS = {};

const MENU_ITEMS = new Map();
const MENU_INSTANCES = new Map();

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
        this.MENU_ITEMS = MENU_ITEMS.get(this.options.name);
        this.target = null;

        this.create();
        MENU_INSTANCES.set(this.options.name, this);
    }

    create() {
        // Create <li>'s for each menu item
        this.MENU_ITEMS.forEach((item, index) => {
            this.addMenuItem(item, index);
        });

        // Add root element, the contextmenu, to the map
        MAP_ELEMENT.appendChild(this.menu);
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
            CONFIG.projection, 
            CONFIG.wgs84Projection
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
        const contextItem = this.MENU_ITEMS[id];
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

MAP_ELEMENT.addEventListener(EVENTS.Browser.ContextMenu, (event) => {
    MENU_INSTANCES.forEach((menu) => {
        if(event.target.matches(menu.options.selector)) {
            menu.show(event);
        }
    });
});

MAP_ELEMENT.addEventListener(EVENTS.Browser.Click, (event) => {
    MENU_INSTANCES.forEach((menu) => {
        menu.hide();
    });
});

const addContextMENU_ITEMS = function(name, items) {
    items.forEach((item) => {
        addContextMenuItem(name, item);
    });
}

const addContextMenuItem = function(name, item) {
    if(!MENU_ITEMS.has(name)) {
        MENU_ITEMS.set(name, []);
    }
        
    MENU_ITEMS.get(name).push(item);

    // Check if context menu is created, if so, add the menu item to the context menu
    if(MENU_INSTANCES.has(name)) {
        const menu = MENU_INSTANCES.get(name);
        const index = MENU_ITEMS.get(name).length - 1;

        menu.addMenuItem(item, index);
    }
}

export { 
    ContextMenu as default, 
    addContextMENU_ITEMS, 
    addContextMenuItem 
};