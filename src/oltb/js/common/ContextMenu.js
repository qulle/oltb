import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Config } from '../core/Config';
import { Events } from "../helpers/constants/Events";
import { Control } from "ol/control";
import { transform } from 'ol/proj';
import { trapFocus } from '../helpers/browser/TrapFocus';
import { UrlManager } from '../core/managers/UrlManager';
import { LogManager } from '../core/managers/LogManager';
import { ElementManager } from '../core/managers/ElementManager';
import { hasNestedProperty } from "../helpers/browser/HasNestedProperty";

const FILENAME = 'common/ContextMenu.js';
const CONTEXT_CLASS = 'oltb-context-menu';

const DefaultOptions = Object.freeze({});

class ContextMenu extends Control {
    static #isDebug;
    static #items = [];

    static addItem(item) {
        this.#items.push(item);
    }

    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: DOM.createElement({
                element: 'ul',
                class: CONTEXT_CLASS,
                attributes: {
                    tabindex: '-1',
                    'data-contextmenu': options.name
                },
                listeners: {
                    'keydown': trapFocus
                }
            })
        });

        this.options = { ...DefaultOptions, ...options };
        this.menu = this.element;

        ContextMenu.#isDebug = UrlManager.getParameter(Config.urlParameters.debug) === 'true';
        ContextMenu.#items.forEach((item) => {
            this.addMenuItem(item);
        });

        const mapElement = ElementManager.getMapElement();
        DOM.appendChildren(mapElement, [
            this.menu
        ]);

        mapElement.addEventListener(Events.browser.contextMenu, this.show.bind(this));
        mapElement.addEventListener(Events.browser.click, this.hide.bind(this));
    }

    addMenuItem(item) {
        if(!hasNestedProperty(item, 'name')) {
            const li = DOM.createElement({
                element: 'li',
                class: `${CONTEXT_CLASS}__divider`
            });

            DOM.appendChildren(this.menu, [
                li
            ]);
        }else {
            const li = DOM.createElement({
                element: 'li',
                class: `${CONTEXT_CLASS}__item`,
                text: item.name,
                attributes: {
                    tabindex: '0'
                },
                listeners: {
                    'click': this.click.bind(this, item),
                    'keyup': (event) => {
                        const key = event.key;

                        if(key === Keys.valueEnter) {
                            this.click(event);
                        }else if(key === Keys.valueEscape) {
                            this.hide();
                        }
                    }
                }
            });
            
            const icon = DOM.createElement({
                element: 'span',
                html: item.icon,
                class: `${CONTEXT_CLASS}__icon`
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
        if(!map) {
            return;
        }

        this.coordinates = transform(
            map.getEventCoordinate(event), 
            Config.projection.default, 
            Config.projection.wgs84
        );
        
        this.menu.style.left = `${event.clientX}px`;
        this.menu.style.top = `${event.clientY}px`;
        this.menu.classList.add(`${CONTEXT_CLASS}--show`);
        this.menu.focus();
    }

    hide() {
        this.menu.classList.remove(`${CONTEXT_CLASS}--show`);
    }

    click(item) {
        item.fn(this.getMap(), this.coordinates, this.target);
        this.hide();
    }
}

export { ContextMenu }; 