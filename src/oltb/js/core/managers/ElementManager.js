import { DOM } from '../../helpers/browser/DOM';
import { Config } from '../Config';
import { Events } from '../../helpers/constants/Events';
import { LogManager } from './LogManager';
import { StateManager } from './StateManager';
import { LocalStorageKeys } from '../../helpers/constants/LocalStorageKeys';

const FILENAME = 'managers/ElementManager.js';

class ElementManager {
    static #mapElement;
    static #toastElement;
    static #toolbarElement;
    static #toolboxElement;

    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');

        this.#mapElement = this.#createMapElement();
        this.#toastElement = this.#createToastElement();
        this.#toolbarElement = this.#createToolbarElement();
        this.#toolboxElement = this.#createToolboxElement();

        window.addEventListener(Events.browser.resize, this.#collisionDetection.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.#collisionDetection.bind(this));
        window.addEventListener(Events.custom.toolbarDirectionChange, this.#collisionDetection.bind(this));
    }

    static setMap(map) { }

    static #onMouseWheel(event) {
        if(!Boolean(event.ctrlKey)) {
            const distance = Config.scrollDistance;
            this.scrollLeft += event.deltaY > 0 ? distance : -distance;
        }
    }

    static #createMapElement() {
        const element = document.getElementById(Config.openLayers.id);

        return element;
    }

    static #createToastElement() {
        const element = DOM.createElement({
            element: 'div', 
            class: 'oltb-toast-container',
            attributes: {
                'data-html2canvas-ignore': 'true'
            }
        });
        
        DOM.appendChildren(this.#mapElement, [
            element
        ]);

        return element;
    }

    static #createToolbarElement() {
        const element = document.getElementById(Config.toolbar.id);
        element.setAttribute('data-html2canvas-ignore', 'true');
        element.addEventListener(Events.browser.wheel, this.#onMouseWheel.bind(element));

        const themeKey = LocalStorageKeys.themeTool;
        const directionKey = LocalStorageKeys.directionTool;

        // Check if the user has chosen dark theme
        const isDarkTheme = (StateManager.getStateObject(themeKey).theme === 'dark');
        if(Boolean(isDarkTheme)) {
            element.classList.add('dark');
        }

        // Check if the user has chosen light theme 
        const isLightTheme = (StateManager.getStateObject(themeKey).theme === 'light');
        if(Boolean(isLightTheme)) {
            element.classList.remove('dark');
        }

        // Check if the user has chosen horizontal layout 
        const isHorizontal = (StateManager.getStateObject(directionKey).direction === 'row');
        if(Boolean(isHorizontal)) {
            element.classList.add('row');
        }

        // Check if the user has chosen vertical layout 
        const isVertical = (StateManager.getStateObject(directionKey).direction === 'col');
        if(Boolean(isVertical)) {
            element.classList.remove('row');
        }

        // Add dark class to body, this will control the color for the entire project
        if(element.classList.contains('dark')) {
            document.body.classList.add('oltb-dark');
        }

        // For consistency also add the row class to the body
        if(element.classList.contains('row')) {
            document.body.classList.add('oltb-row');
        }

        return element;
    }

    static #createToolboxElement() {
        const element = DOM.createElement({
            element: 'div', 
            class: 'oltb-toolbox-container',
            attributes: {
                'data-html2canvas-ignore': 'true'
            }
        });
        
        DOM.appendChildren(this.#mapElement, [
            element
        ]);

        return element;
    }

    static #collisionDetection(event) {
        const windowWidth = window.innerWidth;
        const toolbarWidth = this.#toolbarElement.offsetWidth;
        const toolboxWidth = this.#toolboxElement.offsetWidth;
        
        if(windowWidth - ((3 * Config.browser.rem) + toolbarWidth + toolboxWidth) <= 0) {
            this.#toolboxElement.classList.add('oltb-toolbox-container--collision');
        }else {
            this.#toolboxElement.classList.remove('oltb-toolbox-container--collision');
        }
    }

    static getMapElement() {
        return this.#mapElement;
    }

    static getToastElement() {
        return this.#toastElement;
    }

    static getToolbarElement() {
        return this.#toolbarElement;
    }

    static getToolboxElement() {
        return this.#toolboxElement;
    }
}

export { ElementManager };