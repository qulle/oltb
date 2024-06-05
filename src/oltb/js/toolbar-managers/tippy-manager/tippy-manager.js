import 'tippy.js/dist/tippy.css';
import tippy from 'tippy.js';
import { Events } from '../../browser-constants/events';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { isHorizontal } from '../../ui-helpers/is-row-direction/is-row-direction';
import { ConfigManager } from '../config-manager/config-manager';
import { ElementManager } from '../element-manager/element-manager';
import { ColorPickerManager } from '../color-picker-manager/color-picker-manager';
import { createSingleton, delegate } from 'tippy.js';

const FILENAME = 'tippy-manager.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';

/**
 * About:
 * TippyManager
 * 
 * Description:
 * Manages and simplifies the usage of the Tippy instance.
 */
class TippyManager extends BaseManager {
    static #toolButtonInstances;
    static #toolButtonTippy;
    static #dynamicTippy;
    static #colorTippy;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');
        
        this.#toolButtonInstances = [];
        this.#toolButtonTippy = this.#createToolButtonTippy();
        this.#dynamicTippy = this.#createDynamicTippy();
        this.#colorTippy = this.#createColorTippy();

        window.addEventListener(Events.browser.resize, this.#onPlacementChange.bind(this));
        window.addEventListener(Events.custom.toolbarDirectionChange, this.#onPlacementChange.bind(this));
        window.addEventListener(Events.custom.ready, this.#onOLTBReady.bind(this));
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
    // # Section: Internal
    //--------------------------------------------------------------------
    static #isPlacementBottom() {
        return window.innerWidth <= ConfigManager.getConfig().deviceWidth.sm;
    }

    static #isPlacementForcedBottom() {
        return this.#isPlacementBottom() || isHorizontal();
    }

    static #setToolButtonInstances() {
        // Note: 
        // Used when switching language
        // Destroy each instance so that the new content with correct lang can be added in the new
        this.#toolButtonInstances.forEach((instance) => {
            instance.destroy();
        });

        this.#toolButtonInstances = tippy(`.${CLASS__TOOL_BUTTON}`);
        this.#toolButtonTippy.setInstances(this.#toolButtonInstances);
        this.#onPlacementChange();
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    static #onOLTBReady(event) {
        this.#setToolButtonInstances();
    }

    static #onPlacementChange() {
        this.#toolButtonTippy.setProps({
            placement: this.#isPlacementForcedBottom()
                ? 'bottom' 
                : 'right'
        });
    }

    static #onWindowBrowserStateCleared() {
        this.#toolButtonTippy.setProps({
            placement: this.#isPlacementBottom()
                ? 'bottom' 
                : 'right'
        });
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    static #createToolButtonTippy() {
        const uiRefMapElement = ElementManager.getMapElement();

        return createSingleton([], {
            placement: 'right',
            appendTo: uiRefMapElement,
            offset: [0, 12],
            theme: 'oltb',
            touch: false
        });
    }

    static #createDynamicTippy() {
        const uiRefMapElement = ElementManager.getMapElement();
        const offset = ConfigManager.getConfig().tippy.offset;

        return delegate(uiRefMapElement, {
            target: '.oltb-tippy',
            placement: 'top',
            appendTo: uiRefMapElement,
            theme: 'oltb oltb-themed',
            offset: offset,
            touch: false,
            onShow(instance) {
                const element = instance.reference;
                const title = (
                    element.getAttribute('title') ||
                    element.getAttribute('data-tippy-value') ||
                    ''
                );

                // Store the title to not have multiple tooltips
                element.setAttribute('data-tippy-value', title);
                element.removeAttribute('title');
                
                // Apply title in the custom tooltip
                instance.setContent(title);
            },
            onHidden(instance) {
                const element = instance.reference;
                const title = (
                    element.getAttribute('data-tippy-value') ||
                    element.getAttribute('title') ||
                    ''
                );
                
                // Add back the title as pure title attribute for next time will be displayed
                element.setAttribute('title', title);
                element.removeAttribute('data-tippy-value');

                // Remove title from the custom tooltip
                instance.setContent('');
            }
        });
    }

    static #createColorTippy() {
        const uiRefMapElement = ElementManager.getMapElement();

        return delegate(uiRefMapElement, {
            target: '.oltb-color-tippy',
            placement: 'left',
            offset: [8, 8],
            trigger: 'click',
            appendTo: uiRefMapElement,
            theme: 'oltb oltb-inverted-themed',
            interactive: true,
            allowHTML: true,
            onShow(instance) {
                ColorPickerManager.show(instance);
            },
            onHide(instance) {
                ColorPickerManager.getColorPicker().off(Events.browser.change);
            },
            onHidden(instance) {
                instance.setContent(null);
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static applyLanguage() {
        this.#setToolButtonInstances();
    }

    static getToolButtonTippy() {
        return this.#toolButtonTippy;
    }

    static getDynamicTippy() {
        return this.#dynamicTippy;
    }

    static getColorTippy() {
        return this.#colorTippy;
    }
}

export { TippyManager };