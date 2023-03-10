import { DOM } from '../helpers/browser/DOM';
import { KEYS } from '../helpers/constants/Keys';
import { CONFIG } from '../core/Config';
import { EVENTS } from "../helpers/constants/Events";
import { Control } from "ol/control";
import { transform } from 'ol/proj';
import { UrlManager } from '../core/managers/UrlManager';
import { ElementManager } from '../core/managers/ElementManager';
import { hasNestedProperty } from "../helpers/browser/HasNestedProperty";
import { trapFocusKeyListener } from '../helpers/browser/TrapFocus';

const FILENAME = 'common/ContextMenu.js';
const DEFAULT_OPTIONS = Object.freeze({});

class ContextMenu extends Control {
    static #isDebug;
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

        ContextMenu.#isDebug = UrlManager.getParameter('debug') === 'true';
        ContextMenu.#items.forEach((item) => {
            this.addMenuItem(item);
        });

        const mapElement = ElementManager.getMapElement();
        DOM.appendChildren(mapElement, [
            this.menu
        ]);

        mapElement.addEventListener(EVENTS.Browser.ContextMenu, this.show.bind(this));
        mapElement.addEventListener(EVENTS.Browser.Click, this.hide.bind(this));
    }

    addMenuItem(item) {
        if(!hasNestedProperty(item, 'name')) {
            const li = DOM.createElement({
                element: 'li',
                class: 'oltb-context-menu__divider'
            });

            DOM.appendChildren(this.menu, [
                li
            ]);
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
            
            const icon = DOM.createElement({
                element: 'span',
                html: item.icon,
                class: 'oltb-context-menu__icon'
            });

            li.prepend(icon);

            DOM.appendChildren(this.menu, [
                li
            ]);
        }
    }

    show(event) {
        // Disable native context menu
        if(!ContextMenu.#isDebug) {
            event.preventDefault();
        }

        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        this.coordinates = transform(
            map.getEventCoordinate(event), 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        );
        
        this.menu.style.left = `${event.clientX}px`;
        this.menu.style.top = `${event.clientY}px`;
        this.menu.classList.add('oltb-context-menu--show');
        this.menu.focus();
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