import * as AColorPicker from 'a-color-picker';
import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { EventManager } from '../event-manager/event-manager';
import { isHorizontal } from '../../ui-helpers/is-row-direction/is-row-direction';
import { ConfigManager } from '../config-manager/config-manager';

const FILENAME = 'color-picker-manager.js';

/**
 * About:
 * ColorPickerManager
 * 
 * Description:
 * Manages and simplifies the usage of the ACP instance (A Color Picker).
 * 
 * Note:
 * The ACP must be included in the above format or else the Parcel and/or Rollup fails
 */
class ColorPickerManager extends BaseManager {
    static #colorPickerElement;
    static #colorPicker;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    static #createColorPickerElement() {
        const palette = ConfigManager.getConfig().aColorPicker.palette;

        LogManager.logDebug(FILENAME, 'initAsync', {
            count: palette.length,
            palette: palette
        });

        return DOM.createElement({
            element: 'div', 
            id: 'otlb-color-picker',
            class: 'oltb-mt-05 oltb-mb-0313',
            attributes: {
                'acp-color': '#D7E3FA',
                'acp-show-alpha': 'yes',
                'acp-show-rgb': 'no',
                'acp-show-hsl': 'no',
                'acp-show-hex': 'yes',
                'acp-palette': palette.join('|')
            }
        });
    }

    static #createColorPickerWrapper() {
        // Note:
        // [0] -> Gradiant-Adobe-Like-Picker
        // [1] -> Color and Opacity Sliders
        // [2] -> HEX In-/Output
        // [3] -> Color Palette
        const displayClass = 'oltb-d-none';
        const maxIncludedIndex = 2;
        const acpRows = this.#colorPickerElement.querySelectorAll('.a-color-picker-row');

        // Note:
        // The user can opt-out from hiding the full controls using the showPaletteAsDefault parameter
        const showPaletteAsDefault = ConfigManager.getConfig().aColorPicker.showPaletteAsDefault;
        if(showPaletteAsDefault && acpRows.length >= maxIncludedIndex) {
            for(let i = 0; i <= maxIncludedIndex; ++i) {
                acpRows[i].classList.add(displayClass);
            }
        }

        const acpHeader = DOM.createElement({
            element: 'div', 
            class: 'oltb-acp__header',
            listeners: {
                'click': () => {
                    for(let i = 0; i <= maxIncludedIndex; ++i) {
                        acpRows[i].classList.toggle(displayClass);
                    }
                }
            }
        });

        // Note:
        // The Label and Toggle-icon can't be localized due to circular dependencies
        // This is not a critical translation so will use the en-us as the only language
        // src/oltb/js/managers/TranslationManager.js -> 
        // src/oltb/js/managers/TippyManager.js       -> 
        // src/oltb/js/managers/ColorPickerManager.js -> 
        // src/oltb/js/managers/TranslationManager.js
        const acpTitle = DOM.createElement({
            element: 'label', 
            class: 'oltb-acp__title',
            text: 'Color Picker'
        });

        const acpIcon = DOM.createElement({
            element: 'label', 
            class: 'oltb-acp__icon oltb-tippy',
            title: 'Toggle Section'
        });

        DOM.appendChildren(acpHeader, [
            acpTitle,
            acpIcon
        ]);

        const acpWrapper = DOM.createElement({
            element: 'div', 
            class: 'oltb-acp'
        });

        DOM.appendChildren(acpWrapper, [
            acpHeader,
            this.#colorPickerElement
        ]);

        return acpWrapper;
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    static #isToPlaceBottom() {
        return window.innerWidth <= ConfigManager.getConfig().deviceWidth.sm || isHorizontal();
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static getColorPicker() {
        return this.#colorPicker;
    }

    static getColorPickerElement() {
        return this.#colorPickerElement;
    }

    static show(instance) {
        const colorPickerWrapper = this.#createColorPickerWrapper();
        instance.setContent(colorPickerWrapper);
        instance.setProps({
            placement: this.#isToPlaceBottom() ? 'bottom' : 'left',
        });

        // Note:
        // Apply a bit more distinct border in the Tooltip
        // because the colorpicker overlaps other elements
        const popper = instance.popper;
        popper.classList.add('tippy-color-picker');

        // Note:
        // Find all palette-colors and add the tippy-class to improve look and feel
        const paletteColors = this.#colorPickerElement.querySelectorAll('.a-color-picker-palette-color');
        paletteColors.forEach((color) => {
            color.classList.add('oltb-tippy');
        });

        const selector = instance.reference.getAttribute('data-oltb-color-target');
        const uiRefTarget = window.document.querySelector(selector);
    
        this.#colorPicker.setColor(instance.reference.getAttribute('data-oltb-color'));
        this.#colorPicker.on(Events.browser.change, (picker, color) => {
            // Note: 
            // Important to always be HEX with Alpha value
            // Sometimes the two last digits are replaced with fixed alpha value
            color = AColorPicker.parseColor(color, 'hexcss4');
            
            uiRefTarget.setAttribute('data-oltb-color', color);
            uiRefTarget.firstElementChild.style.backgroundColor = color;
    
            EventManager.dispatchEvent([instance.reference], Events.custom.colorChange);
        });

        return colorPickerWrapper;
    }
}

export { ColorPickerManager };