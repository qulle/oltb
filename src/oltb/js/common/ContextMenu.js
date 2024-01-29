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
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'common/ContextMenu.js';
const CLASS_CONTEXT_MENU = 'oltb-context-menu';

const DefaultOptions = Object.freeze({
    name: 'MainContextMenu'
});

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
                    'tabindex': '-1'
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

        uiRefMapElement.addEventListener(Events.browser.contextMenu, this.onContextMenu.bind(this));
        uiRefMapElement.addEventListener(Events.browser.click, this.onMapClick.bind(this));
    }

    // -------------------------------------------------------------------
    // # Section: Internal
    // -------------------------------------------------------------------

    #getMenuCoordinatesInBounds(x, y) {
        const rem = 1 * 16;
        const pivotValue = 0;
        
        const mapElement = ElementManager.getMapElement();
        const mapHeight = mapElement.offsetHeight;
        
        const menuElement = this.menu;
        const menuHeight = menuElement.offsetHeight;

        const distanceAvailable = mapHeight - y;
        const distanceOutBounds = menuHeight - distanceAvailable;
        
        const dY = y - distanceOutBounds - rem;
        const isMenuInBounds = distanceOutBounds < pivotValue;

        const menuX = x;
        const menuY = isMenuInBounds ? y : dY;

        LogManager.logDebug(FILENAME, 'getMenuCoordinatesInView', {
            mapHeight: mapHeight,
            menuHeight: menuHeight,
            distanceAvailable: distanceAvailable,
            distanceOutBounds: distanceOutBounds,
            isMenuInBounds: isMenuInBounds,
            originalX: x,
            originalY: y,
            menuX: menuX,
            menuY: menuY,
            dY: dY
        });

        return {
            x: menuX,
            y: menuY
        };
    }

    // -------------------------------------------------------------------
    // # Section: Events
    // -------------------------------------------------------------------

    onContextMenu(event) {
        this.show(event);
    }

    onMapClick(event) {
        this.hide(event);
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    addMenuItem(item) {
        if(!_.has(item, ['i18nKey'])) {
            const li = DOM.createElement({
                element: 'li',
                class: `${CLASS_CONTEXT_MENU}__divider`
            });

            DOM.appendChildren(this.menu, [
                li
            ]);

            return;
        }

        const i18n = TranslationManager.get(item.i18nKey);
        const li = DOM.createElement({
            element: 'li',
            class: `${CLASS_CONTEXT_MENU}__item`,
            attributes: {
                'tabindex': '0'
            },
            listeners: {
                'click': this.click.bind(this, item),
                'keyup': (event) => {
                    const key = event.key;

                    if(key === Keys.valueEnter) {
                        this.click(item);
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

        const text = DOM.createElement({
            element: 'span',
            text: i18n,
            class: `${CLASS_CONTEXT_MENU}__text`,
            attributes: {
                'data-oltb-i18n': item.i18nKey
            },
        });

        DOM.appendChildren(li, [
            icon,
            text
        ]);

        DOM.appendChildren(this.menu, [
            li
        ]);
    }

    show(event) {
        // Note: 
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

        // Note:
        // The class must added first 
        // otherwise the offsetHeight or the getComputedStyle can't be extracted
        this.menu.classList.add(`${CLASS_CONTEXT_MENU}--show`);

        // Note:
        // If the user clicks at a location in the map where the height of the menu
        // will exceed the of the height of the parent (the map) 
        // Calculate the overflow value to move the menu negative dY pixels towards the top
        const menuCoordinates = this.#getMenuCoordinatesInBounds(event.clientX, event.clientY);

        this.menu.style.left = `${menuCoordinates.x}px`;
        this.menu.style.top = `${menuCoordinates.y}px`;
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