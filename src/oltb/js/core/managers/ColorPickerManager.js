import * as AColorPicker from 'a-color-picker';
import { DOM } from "../../helpers/browser/DOM";
import { Config } from '../Config';
import { Events } from '../../helpers/constants/Events';
import { LogManager } from './LogManager';
import { isHorizontal } from '../../helpers/IsRowDirection';
import { eventDispatcher } from '../../helpers/browser/EventDispatcher';

const FILENAME = 'managers/ColorPickerManager.js';

class ColorPickerManager {
    static #colorPickerElement;
    static #colorPicker;

    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
        
        this.#colorPickerElement = this.#createColorPickerElement();
        this.#colorPicker = AColorPicker.createPicker(this.#colorPickerElement);
    }

    static setMap(map) { }

    static #createColorPickerElement() {
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
                'acp-palette': '#FFFFFF|#D7E3FA|#6397C2|#0166A5|#B1CAF6|#5B88D6|#2357B1|#D0CAFF|#9085E4|#493E9C|#FEE6FF|#E8A2EA|#914594|#BCF8FA|#56BABD|#00959A|#CEEEFF|#68B9E5|#0080C5|#BCFAF4|#3CAEA3|#007C70|#FFF1C5|#FBDD83|#FBBD02|#FFDDBC|#FCBE80|#F67D2C|#FDB5B4|#E96B69|#EB4542|#D3D9E6|#959DAD|#3B4352|#000000'
            }
        });
    }

    static #isToPlaceBottom() {
        return window.innerWidth <= Config.deviceWidth.sm || isHorizontal();
    }

    static onColorPickerTooltipShow(instance) {
        instance.setProps({
            placement: this.#isToPlaceBottom() ? 'bottom' : 'left'
        });
    
        const selector = instance.reference.getAttribute('data-oltb-color-target');
        const target = document.querySelector(selector);
    
        instance.setContent(this.#colorPickerElement);
    
        this.#colorPicker.setColor(instance.reference.getAttribute('data-oltb-color'));
        this.#colorPicker.on(Events.browser.change, (picker, color) => {
            // Important to always be HEX with Alpha value
            // Sometimes the two last digits are replaced with fixed alpha value
            color = AColorPicker.parseColor(color, 'hexcss4');
    
            // Update color on the ACP instance
            target.setAttribute('data-oltb-color', color);
            target.firstElementChild.style.backgroundColor = color;
    
            eventDispatcher([instance.reference], Events.custom.colorChange);
        });
    }

    static getColorPicker() {
        return this.#colorPicker;
    }
}

export { ColorPickerManager };