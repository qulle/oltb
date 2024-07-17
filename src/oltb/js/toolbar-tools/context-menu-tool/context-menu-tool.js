import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { transform } from 'ol/proj';
import { trapFocus } from '../../browser-helpers/trap-focus';
import { UrlManager } from '../../toolbar-managers/url-manager/url-manager';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { KeyboardKeys } from '../../browser-constants/keyboard-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const FILENAME = 'context-menu-tool.js';
const CLASS__CONTEXT_MENU = 'oltb-context-menu';

const DefaultOptions = Object.freeze({
    name: 'MainContextMenu'
});

class ContextMenuTool extends BaseTool {
    static #isDebug = false;
    static #queue = [];
    #items = [];

    static addItem(item) {
        this.#queue.push(item);
    }

    constructor(options = {}) {
        super({
            filename: FILENAME,
            element: DOM.createElement({
                element: 'ul',
                class: CLASS__CONTEXT_MENU,
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
        ContextMenuTool.#isDebug = UrlManager.getParameter(debugKey) === 'true';
        ContextMenuTool.#queue.forEach((item) => {
            this.addMenuItem(item);
        });

        const uiRefMapElement = ElementManager.getMapElement();
        DOM.appendChildren(uiRefMapElement, [
            this.menu
        ]);

        uiRefMapElement.addEventListener(Events.browser.contextMenu, this.#onContextMenu.bind(this));
        uiRefMapElement.addEventListener(Events.browser.click, this.#onMapClick.bind(this));
        uiRefMapElement.addEventListener(Events.browser.keyUp, this.#onMapKeyUp.bind(this));
        this.uiRefMapElement = uiRefMapElement;
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
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

    #isMenuItem(item) {
        return _.has(item, ['i18nKey']);
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onContextMenu(event) {
        this.show(event);
    }

    #onMapClick(event) {
        this.hide(event);
    }

    #onMapKeyUp(event) {
        const key = event.key;

        if(key === KeyboardKeys.valueEscape) {
            this.hide();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    getSize() {
        return this.#items.length || 0;
    }

    addMenuSeparator() {
        const li = DOM.createElement({
            element: 'li',
            class: `${CLASS__CONTEXT_MENU}__divider`
        });

        DOM.appendChildren(this.menu, [
            li
        ]);

        return li;
    }

    addMenuItem(item) {
        if(!this.#isMenuItem(item)) {
            return this.addMenuSeparator();
        }

        this.#items.push(item);

        const i18n = TranslationManager.get(item.i18nKey);
        const li = DOM.createElement({
            element: 'li',
            class: `${CLASS__CONTEXT_MENU}__item`,
            attributes: {
                'tabindex': '0'
            },
            listeners: {
                'click': this.click.bind(this, item),
                'keyup': (event) => {
                    const key = event.key;

                    if(key === KeyboardKeys.valueEnter) {
                        this.click(item);
                    }
                }
            }
        });
            
        const icon = DOM.createElement({
            element: 'span',
            html: item.icon,
            class: `${CLASS__CONTEXT_MENU}__icon`
        });

        const text = DOM.createElement({
            element: 'span',
            text: i18n,
            class: `${CLASS__CONTEXT_MENU}__text`,
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

        return li;
    }

    show(event) {
        // Note: 
        // Disable native context menu
        if(!ContextMenuTool.#isDebug) {
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
        this.menu.classList.add(`${CLASS__CONTEXT_MENU}--show`);

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
        this.menu.classList.remove(`${CLASS__CONTEXT_MENU}--show`);
    }

    click(item) {
        item.fn(this.getMap(), this.coordinates, this.target);
        this.hide();
    }
}

export { ContextMenuTool }; 