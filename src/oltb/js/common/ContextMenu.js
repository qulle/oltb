import { DOM } from '../helpers/browser/DOM';
import { KEYS } from '../helpers/constants/Keys';
import { CONFIG } from '../core/Config';
import { EVENTS } from "../helpers/constants/Events";
import { Control } from "ol/control";
import { transform } from 'ol/proj';
import { MAP_ELEMENT } from "../core/elements/index";
import { hasNestedProperty } from "../helpers/browser/HasNestedProperty";
import { trapFocusKeyListener } from '../helpers/browser/TrapFocus';

const DEFAULT_OPTIONS = Object.freeze({});

class ContextMenu extends Control {
    static #items = [];

    static addItem(item) {
        this.#items.push(item);
    }

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

        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.menu = this.element;

        ContextMenu.#items.forEach((item) => {
            this.addMenuItem(item);
        });

        MAP_ELEMENT.appendChild(this.menu);
        MAP_ELEMENT.addEventListener(EVENTS.Browser.ContextMenu, this.show.bind(this));
        MAP_ELEMENT.addEventListener(EVENTS.Browser.Click, this.hide.bind(this));
    }

    addMenuItem(item) {
        if(!hasNestedProperty(item, 'name')) {
            const li = DOM.createElement({
                element: 'li',
                class: 'oltb-context-menu__divider'
            });

            this.menu.appendChild(li);
        }else {
            const li = DOM.createElement({
                element: 'li',
                class: 'oltb-context-menu__item',
                text: item.name,
                attributes: {
                    tabindex: '0'
                },
                listeners: {
                    'click': this.click.bind(this, item),
                    'keyup': (event) => {
                        const key = event.key.toLowerCase();

                        if(key === KEYS.Enter) {
                            this.click(event);
                        }else if(key === KEYS.Escape) {
                            this.hide();
                        }
                    }
                }
            });
            
            li.prepend(DOM.createElement({
                element: 'span',
                html: item.icon,
                class: 'oltb-context-menu__icon'
            }));

            this.menu.appendChild(li);
        }
    }

    show(event) {
        this.coordinates = transform(
            this.getMap().getEventCoordinate(event), 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        );
        
        this.menu.style.left = `${event.clientX}px`;
        this.menu.style.top = `${event.clientY}px`;
        this.menu.classList.add('oltb-context-menu--show');
        this.menu.focus();

        // Disable native context menu
        event.preventDefault();
    }

    hide() {
        this.menu.classList.remove('oltb-context-menu--show');
    }

    click(item) {
        item.fn(this.getMap(), this.coordinates, this.target);
        this.hide();
    }
}

export { ContextMenu }; 