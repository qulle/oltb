import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { transform } from 'ol/proj';
import { trapFocus } from '../helpers/browser/TrapFocus';
import { UrlManager } from '../managers/UrlManager';
import { LogManager } from '../managers/LogManager';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { hasNestedProperty } from '../helpers/browser/HasNestedProperty';

const FILENAME = 'common/ContextMenu.js';
const CLASS_CONTEXT_MENU = 'oltb-context-menu';

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
                class: CLASS_CONTEXT_MENU,
                attributes: {
                    'tabindex': '-1',
                    'data-contextmenu': options.name
                },
                listeners: {
                    'keydown': trapFocus
                }
            })
        });

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.menu = this.element;

        const debugKey = ConfigManager.getConfig().urlParameter.debug;
        ContextMenu.#isDebug = UrlManager.getParameter(debugKey) === 'true';
        ContextMenu.#items.forEach((item) => {
            this.addMenuItem(item);
        });

        const uiRefMapElement = ElementManager.getMapElement();
        DOM.appendChildren(uiRefMapElement, [
            this.menu
        ]);

        uiRefMapElement.addEventListener(Events.browser.contextMenu, this.show.bind(this));
        uiRefMapElement.addEventListener(Events.browser.click, this.hide.bind(this));
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    addMenuItem(item) {
        if(!hasNestedProperty(item, 'name')) {
            const li = DOM.createElement({
                element: 'li',
                class: `${CLASS_CONTEXT_MENU}__divider`
            });

            DOM.appendChildren(this.menu, [
                li
            ]);

            return;
        }

        const li = DOM.createElement({
            element: 'li',
            class: `${CLASS_CONTEXT_MENU}__item`,
            text: item.name,
            attributes: {
                'tabindex': '0'
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
            class: `${CLASS_CONTEXT_MENU}__icon`
        });

        li.prepend(icon);

        DOM.appendChildren(this.menu, [
            li
        ]);
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

        const projection = ConfigManager.getConfig().projection;
        this.coordinates = transform(
            map.getEventCoordinate(event), 
            projection.default, 
            projection.wgs84
        );
        
        this.menu.style.left = `${event.clientX}px`;
        this.menu.style.top = `${event.clientY}px`;
        this.menu.classList.add(`${CLASS_CONTEXT_MENU}--show`);
        this.menu.focus();
    }

    hide() {
        this.menu.classList.remove(`${CLASS_CONTEXT_MENU}--show`);
    }

    click(item) {
        item.fn(this.getMap(), this.coordinates, this.target);
        this.hide();
    }
}

export { ContextMenu }; 