import { DOM } from '../../helpers/browser/dom-factory';
import { Events } from '../../helpers/constants/events';
import { LogManager } from '../log-manager/log-manager';
import { StateManager } from '../state-manager/state-manager';
import { ConfigManager } from '../config-manager/config-manager';
import { LocalStorageKeys } from '../../helpers/constants/local-storage-keys';
import { BaseManager } from '../base-manager';

const FILENAME = 'ElementManager.js';
const CLASS_TOOLBOX_CONTAINER = 'oltb-toolbox-container';

/**
 * About:
 * ElementManager
 * 
 * Description:
 * Manages the global UI references to the Map-, Toast-, Toolbar- and Toolbox elements.
 */
class ElementManager extends BaseManager {
    static #uiRefMapElement;
    static #uiRefToastElement;
    static #uiRefToolbarElement;
    static #uiRefToolboxElement;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#uiRefMapElement = this.#createMapElement();
        this.#uiRefToastElement = this.#createToastElement();
        this.#uiRefToolbarElement = this.#createToolbarElement();
        this.#uiRefToolboxElement = this.#createToolboxElement();

        window.addEventListener(Events.browser.resize, this.#onCollisionDetection.bind(this));
        window.addEventListener(Events.custom.ready, this.#onCollisionDetection.bind(this));
        window.addEventListener(Events.custom.toolbarDirectionChange, this.#onCollisionDetection.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.#onWindowBrowserStateCleared.bind(this));

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    static #createMapElement() {
        return window.document.getElementById(ConfigManager.getConfig().openLayers.id);
    }

    static #createToastElement() {
        const element = DOM.createElement({
            element: 'div', 
            class: 'oltb-toast-container',
            attributes: {
                'data-html2canvas-ignore': 'true'
            }
        });
        
        DOM.appendChildren(this.#uiRefMapElement, [
            element
        ]);

        return element;
    }

    static #createToolbarElement() {
        const config = ConfigManager.getConfig();
        const element = window.document.getElementById(config.toolbar.id);
        element.setAttribute('data-html2canvas-ignore', 'true');
        element.addEventListener(Events.browser.wheel, this.#onMouseWheel.bind(element));

        const themeKey = LocalStorageKeys.themeTool;
        const directionKey = LocalStorageKeys.directionTool;

        // Check if the user has chosen dark theme
        const isDarkTheme = (StateManager.getStateObject(themeKey).theme === 'dark');
        if(isDarkTheme) {
            element.classList.add('dark');
        }

        // Check if the user has chosen light theme 
        const isLightTheme = (StateManager.getStateObject(themeKey).theme === 'light');
        if(isLightTheme) {
            element.classList.remove('dark');
        }

        // Check if the user has chosen horizontal layout 
        const isHorizontal = (StateManager.getStateObject(directionKey).direction === 'row');
        if(isHorizontal) {
            element.classList.add('row');
        }

        // Check if the user has chosen vertical layout 
        const isVertical = (StateManager.getStateObject(directionKey).direction === 'col');
        if(isVertical) {
            element.classList.remove('row');
        }

        // Add dark class to body, this will control the color for the entire project
        if(element.classList.contains('dark')) {
            window.document.body.classList.add(config.className.dark);
        }

        // For consistency also add the row class to the body
        if(element.classList.contains('row')) {
            window.document.body.classList.add(config.className.row);
        }

        return element;
    }

    static #createToolboxElement() {
        const element = DOM.createElement({
            element: 'div', 
            class: CLASS_TOOLBOX_CONTAINER,
            attributes: {
                'data-html2canvas-ignore': 'true'
            }
        });
        
        DOM.appendChildren(this.#uiRefMapElement, [
            element
        ]);

        return element;
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    static #onWindowBrowserStateCleared(event) {
        if(window.innerWidth <= ConfigManager.getConfig().deviceWidth.sm) {
            this.#uiRefToolboxElement.classList.add(`${CLASS_TOOLBOX_CONTAINER}--collision`);
        }else {
            this.#uiRefToolboxElement.classList.remove(`${CLASS_TOOLBOX_CONTAINER}--collision`);
        }
    }

    static #onMouseWheel(event) {
        if(!event.ctrlKey) {
            const zeroAxis = 0;
            const distance = ConfigManager.getConfig().scroll.distance;
            this.scrollLeft += event.deltaY > zeroAxis ? distance : -distance;
        }
    }

    static #onCollisionDetection(event) {
        const collisionLimit = 0;
        const windowWidth = window.innerWidth;
        const toolbarWidth = this.#uiRefToolbarElement.offsetWidth;
        const toolboxWidth = this.#uiRefToolboxElement.offsetWidth;
        const rem = ConfigManager.getConfig().browser.rem;
        
        if(windowWidth - ((3.5 * rem) + toolbarWidth + toolboxWidth) <= collisionLimit) {
            this.#uiRefToolboxElement.classList.add(`${CLASS_TOOLBOX_CONTAINER}--collision`);
        }else {
            this.#uiRefToolboxElement.classList.remove(`${CLASS_TOOLBOX_CONTAINER}--collision`);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static getMapElement() {
        return this.#uiRefMapElement;
    }

    static getToastElement() {
        return this.#uiRefToastElement;
    }

    static getToolbarElement() {
        return this.#uiRefToolbarElement;
    }

    static getToolboxElement() {
        return this.#uiRefToolboxElement;
    }
}

export { ElementManager };