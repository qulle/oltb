import 'tippy.js/dist/tippy.css';
import tippy from 'tippy.js';
import { CONFIG } from '../Config';
import { EVENTS } from '../../helpers/constants/Events';
import { LogManager } from './LogManager';
import { isHorizontal } from '../../helpers/IsRowDirection';
import { ElementManager } from './ElementManager';
import { ColorPickerManager } from './ColorPickerManager';
import { createSingleton, delegate } from 'tippy.js';

const FILENAME = 'managers/TippyManager.js';

class TippyManager {
    static #toolButtonTippy;
    static #mapTippy;
    static #colorTippy;

    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initializing started');
        
        this.#toolButtonTippy = this.#createToolButtonTippy();
        this.#mapTippy = this.#createMapTippy();
        this.#colorTippy = this.#createColorTippy();

        window.addEventListener(EVENTS.Custom.ToolbarDirectionChange, this.#onPlacementChange.bind(this));
        window.addEventListener(EVENTS.Browser.Resize, this.#onPlacementChange.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.#onDOMContentLoaded.bind(this));
    }

    static setMap(map) { }

    static #onPlacementChange(event) {
        this.#toolButtonTippy.setProps({
            placement: (
                window.innerWidth <= CONFIG.DeviceWidth.SM || isHorizontal()
            ) ? 'bottom' : 'right'
        });
    }
    
    static #onDOMContentLoaded(event) {
        this.#toolButtonTippy.setInstances(tippy('.oltb-tool-button'));
        this.#onPlacementChange(event);
    }

    static #createToolButtonTippy() {
        const mapElement = ElementManager.getMapElement();

        return createSingleton([], {
            placement: 'right',
            appendTo: mapElement,
            offset: [0, 12],
            theme: 'oltb',
            touch: false
        });
    }

    static #createMapTippy() {
        const mapElement = ElementManager.getMapElement();

        return delegate(mapElement, {
            content(reference) {
                const title = reference.getAttribute('title');
                reference.removeAttribute('title');
                return title;
            },
            target: '.oltb-tippy',
            placement: 'top',
            appendTo: mapElement,
            theme: 'oltb oltb-themed',
            delay: [600, 100],
            touch: false
        });
    }

    static #createColorTippy() {
        const mapElement = ElementManager.getMapElement();

        return delegate(mapElement, {
            target: '.oltb-color-tippy',
            placement: 'left',
            offset: [0, 25],
            trigger: 'click',
            appendTo: mapElement,
            theme: 'oltb oltb-inverted-themed',
            interactive: true,
            allowHTML: true,
            onShow(instance) {
                ColorPickerManager.onColorPickerTooltipShow(instance);
            },
            onHide(instance) {
                ColorPickerManager.getColorPicker().off(EVENTS.Browser.Change);
            },
            onHidden(instance) {
                instance.setContent(null);
            }
        });
    }

    static getToolButtonTippy() {
        return this.#toolButtonTippy;
    }

    static getMapTippy() {
        return this.#mapTippy;
    }

    static getColorTippy() {
        return this.#colorTippy;
    }
}

export { TippyManager };