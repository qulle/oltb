import { DOM } from "../../helpers/browser/DOM";
import { Config } from "../Config";
import { Events } from '../../helpers/constants/Events';
import { Overlay } from 'ol';
import { unByKey } from 'ol/Observable';
import { LogManager } from "./LogManager";

const FILENAME = 'managers/TooltipManager.js';

class TooltipManager {
    static #map;
    static #tooltipOverlay;
    static #tooltips = {}

    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');

        const tooltipElement = DOM.createElement({
            element: 'div',
            class: 'oltb-overlay-tooltip'
        });

        this.#tooltipOverlay = new Overlay({
            stopEvent: false,
            element: tooltipElement,
            positioning: 'bottom-center',
            offset: [
                Config.overlayOffset.horizontal,
                Config.overlayOffset.vertical
            ]
        });
    }

    static setMap(map) {
        this.#map = map;
    }

    static isEmpty() {
        return Object.keys(this.#tooltips).length === 0;
    }

    static push(key) {
        const tooltipItemElement = DOM.createElement({
            element: 'span',
            class: 'oltb-overlay-tooltip__item'
        });

        if(this.isEmpty()) {
            this.#map.addOverlay(this.#tooltipOverlay);
            this.onPointerMoveListener = this.#map.on(Events.openLayers.pointerMove, this.onPointerMove.bind(this));
        }

        this.#tooltips[key] = tooltipItemElement;
        this.#tooltipOverlay.getElement().prepend(tooltipItemElement);

        return tooltipItemElement;
    }

    static pop(key) {
        const tooltipItemElement = this.#tooltips[key];

        delete this.#tooltips[key];
        this.#tooltipOverlay.getElement().removeChild(tooltipItemElement);

        if(this.isEmpty()) {
            unByKey(this.onPointerMoveListener);
            this.#map.removeOverlay(this.#tooltipOverlay);
            this.#tooltipOverlay.setPosition(null);
        }

        return tooltipItemElement;
    }

    static onPointerMove(event) {
        this.#tooltipOverlay.setPosition(event.coordinate);
    }
}

export { TooltipManager };