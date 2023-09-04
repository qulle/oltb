import * as AColorPicker from 'a-color-picker';
import { DOM } from '../helpers/browser/DOM';
import { Events } from '../helpers/constants/Events';
import { LogManager } from './LogManager';
import { isHorizontal } from '../helpers/IsRowDirection';
import { ConfigManager } from './ConfigManager';
import { eventDispatcher } from '../helpers/browser/EventDispatcher';

const FILENAME = 'managers/ColorPickerManager.js';

/**
 * About:
 * ColorPickerManager
 * 
 * Description:
 * Manages and simplifies the usage of the ACP instance (A Color Picker).
 */
class ColorPickerManager {
    static #colorPickerElement;
    static #colorPicker;

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');
        
        this.#colorPickerElement = this.#createColorPickerElement();
        this.#colorPicker = AColorPicker.createPicker(this.#colorPickerElement);

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

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

    static #createColorPickerElement() {
        const palette = ConfigManager.getConfig().aColorPicker.palette.join('|');

        return DOM.createElement({
            element: 'div', 
            id: 'otlb-color-picker',
            class: 'oltb-mt-0313 oltb-mb-0313',
            attributes: {
                'acp-color': '#D7E3FA',
                'acp-show-alpha': 'yes',
                'acp-show-rgb': 'no',
                'acp-show-hsl': 'no',
                'acp-show-hex': 'yes',
                'acp-palette': palette
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Internal
    // -------------------------------------------------------------------

    static #isToPlaceBottom() {
        return window.innerWidth <= ConfigManager.getConfig().deviceWidth.sm || isHorizontal();
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    static getColorPicker() {
        return this.#colorPicker;
    }

    static show(instance) {
        instance.setProps({
            placement: this.#isToPlaceBottom() ? 'bottom' : 'left'
        });
    
        const selector = instance.reference.getAttribute('data-oltb-color-target');
        const uiRefTarget = document.querySelector(selector);
    
        instance.setContent(this.#colorPickerElement);
    
        this.#colorPicker.setColor(instance.reference.getAttribute('data-oltb-color'));
        this.#colorPicker.on(Events.browser.change, (picker, color) => {
            // Note: Important to always be HEX with Alpha value
            // Sometimes the two last digits are replaced with fixed alpha value
            color = AColorPicker.parseColor(color, 'hexcss4');
    
            // Update color on the ACP instance
            uiRefTarget.setAttribute('data-oltb-color', color);
            uiRefTarget.firstElementChild.style.backgroundColor = color;
    
            eventDispatcher([instance.reference], Events.custom.colorChange);
        });
    }
}

export { ColorPickerManager };