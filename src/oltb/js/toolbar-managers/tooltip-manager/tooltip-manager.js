import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { Overlay } from 'ol';
import { unByKey } from 'ol/Observable';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { ConfigManager } from '../config-manager/config-manager';

const FILENAME = 'tooltip-manager.js';
const CLASS__OVERLAY_TOOLTIP = 'oltb-overlay-tooltip';

/**
 * About:
 * TooltipManager
 * 
 * Description:
 * Manages and the creation of Tooltips that follows the mouse. 
 * Examples are coordinates tooltip, measurements etc.
 */
class TooltipManager extends BaseManager {
    static #map;
    static #tooltipOverlay;
    static #onPointerMoveListener;
    static #onMoveEndListerner;
    static #tooltips = {}

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#tooltipOverlay = this.#createTooltipOverlay();

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) {
        this.#map = map;
    }

    static getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    static #createTooltipOverlay() {
        const overlayOffset = ConfigManager.getConfig().overlayOffset;
        const tooltipElement = DOM.createElement({
            element: 'div',
            class: CLASS__OVERLAY_TOOLTIP
        });

        return new Overlay({
            stopEvent: false,
            element: tooltipElement,
            positioning: 'bottom-center',
            offset: [
                overlayOffset.horizontal,
                overlayOffset.vertical
            ]
        });
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    static #onPointerMove(event) {
        this.#tooltipOverlay.setPosition(event.coordinate);
    }

    static #onMoveEnd(event) {
        // TODO:
        // AsIs: Tooltip is still at old location until the mouse is moved
        // ToBe: Calculate the new position of the overlay based on how far the map moved
        this.#tooltipOverlay.setPosition(event.coordinate);
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static getTooltips() {
        return this.#tooltips;
    }

    static getSize() {
        return Object.keys(this.#tooltips).length;
    }

    static isEmpty() {
        return this.getSize() === 0;
    }

    static getTooltip(key) {
        return this.#tooltips[key];
    }

    static push(key) {
        const tooltipItemElement = DOM.createElement({
            element: 'span',
            class: `${CLASS__OVERLAY_TOOLTIP}__item`
        });

        if(this.isEmpty()) {
            this.#map.addOverlay(this.#tooltipOverlay);
            this.#onPointerMoveListener = this.#map.on(Events.openLayers.pointerMove, this.#onPointerMove.bind(this));
            this.#onMoveEndListerner = this.#map.on(Events.openLayers.moveEnd, this.#onMoveEnd.bind(this));
        }

        this.#tooltips[key] = tooltipItemElement;
        this.#tooltipOverlay.getElement().prepend(tooltipItemElement);

        return tooltipItemElement;
    }

    static pop(key) {
        const tooltipItemElement = this.#tooltips[key];
        this.#tooltipOverlay.getElement().removeChild(tooltipItemElement);
        delete this.#tooltips[key];

        if(this.isEmpty()) {
            unByKey(this.#onPointerMoveListener);
            unByKey(this.#onMoveEndListerner);

            this.#map.removeOverlay(this.#tooltipOverlay);
            this.#tooltipOverlay.setPosition(null);
        }

        return tooltipItemElement;
    }
}

export { TooltipManager };